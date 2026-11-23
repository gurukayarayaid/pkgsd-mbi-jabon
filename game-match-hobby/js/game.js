/* ============================================================
   Match My Hobby — logika game (vanilla JS, tanpa build)
   ============================================================ */
(function () {
  'use strict';

  const COLORS = [
    { main: '#1f9d6f', soft: 'rgba(31,157,111,.18)' },
    { main: '#ef7a2e', soft: 'rgba(239,122,46,.18)' },
    { main: '#3f6ff0', soft: 'rgba(63,111,240,.18)' },
    { main: '#a94bd0', soft: 'rgba(169,75,208,.18)' }
  ];
  const DEFAULT_NAMES = ['Pemain 1', 'Pemain 2', 'Pemain 3', 'Pemain 4'];
  const STORAGE_KEY = 'mbj.match-hobby.v1';
  const HOBBIES = Array.isArray(window.HOBBIES) ? window.HOBBIES : [];

  const $ = (id) => document.getElementById(id);
  const els = {
    setup: $('screen-setup'),
    game: $('screen-game'),
    results: $('screen-results'),
    segPlayers: $('seg-players'),
    segPairs: $('seg-pairs'),
    segTimer: $('seg-timer'),
    nameFields: $('name-fields'),
    timerHint: $('timer-hint'),
    ckTouch: $('ck-touch'),
    ckSound: $('ck-sound'),
    btnFullSetup: $('btn-full-setup'),
    btnStart: $('btn-start'),
    scores: $('scores'),
    timerPill: $('timer-pill'),
    timerVal: $('timer-val'),
    timerUnit: $('timer-unit'),
    progressText: $('progress-text'),
    progFill: $('prog-fill'),
    turnbar: $('turnbar'),
    turnDot: $('turn-dot'),
    turnLabel: $('turn-label'),
    pics: $('pics'),
    words: $('words'),
    btnQuit: $('btn-quit'),
    btnSound2: $('btn-sound2'),
    btnFull2: $('btn-full2'),
    flash: $('flash'),
    resEmoji: $('res-emoji'),
    resTitle: $('res-title'),
    resSub: $('res-sub'),
    resTable: $('res-table'),
    resMeta: $('res-meta'),
    btnAgain: $('btn-again'),
    btnSetup: $('btn-setup')
  };

  const state = { game: null };
  let settings = loadSettings();
  let dragState = null;
  let suppressClickUntil = 0;

  /* ---------------------------- sound ---------------------------- */

  const sound = (function () {
    let ctx = null;
    let enabled = true;

    function context() {
      if (!enabled) return null;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      if (!ctx) ctx = new AC();
      if (ctx.state === 'suspended') ctx.resume().catch(() => {});
      return ctx;
    }

    function tone(freq, delay, dur, type, level) {
      const c = context();
      if (!c) return;
      const t0 = c.currentTime + delay;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.linearRampToValueAtTime(level || 0.14, t0 + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.03);
    }

    return {
      good: function () { tone(659, 0, 0.13, 'sine', 0.13); tone(880, 0.085, 0.2, 'sine', 0.12); },
      bad: function () { tone(196, 0, 0.18, 'triangle', 0.1); tone(147, 0.11, 0.22, 'triangle', 0.09); },
      win: function () { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.32, 'sine', 0.12)); },
      tick: function () { tone(880, 0, 0.06, 'sine', 0.05); },
      setEnabled: function (v) { enabled = !!v; if (enabled) context(); },
      isEnabled: function () { return enabled; }
    };
  })();

  /* ---------------------------- helpers ---------------------------- */

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function fmtTime(totalSeconds) {
    const s = Math.max(0, Math.round(totalSeconds));
    const m = Math.floor(s / 60);
    return m + ':' + String(s % 60).padStart(2, '0');
  }

  function loadSettings() {
    const base = {
      players: 1,
      names: DEFAULT_NAMES.slice(),
      pairs: 10,
      timer: 30,
      touch: window.matchMedia ? window.matchMedia('(pointer: coarse)').matches : false,
      sound: true
    };
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return base;
      const s = JSON.parse(raw);
      if ([1, 2, 3, 4].indexOf(s.players) >= 0) base.players = s.players;
      if (Array.isArray(s.names)) {
        base.names = DEFAULT_NAMES.map((d, i) => {
          const v = s.names[i];
          return typeof v === 'string' && v.trim() ? v.slice(0, 16) : d;
        });
      }
      if ([6, 8, 10, 12, 16, 20].indexOf(s.pairs) >= 0) base.pairs = s.pairs;
      if ([0, 15, 20, 30, 45].indexOf(s.timer) >= 0) base.timer = s.timer;
      if (typeof s.touch === 'boolean') base.touch = s.touch;
      if (typeof s.sound === 'boolean') base.sound = s.sound;
    } catch (e) { /* localStorage bisa diblokir */ }
    return base;
  }

  function saveSettings() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); } catch (e) {}
  }

  /* ---------------------------- setup UI ---------------------------- */

  function setSeg(container, value) {
    const v = String(value);
    Array.prototype.forEach.call(container.querySelectorAll('button[data-v]'), (btn) => {
      btn.classList.toggle('on', btn.dataset.v === v);
    });
  }

  function renderNames() {
    els.nameFields.textContent = '';
    for (let i = 0; i < settings.players; i++) {
      const row = document.createElement('label');
      row.className = 'name-row';
      row.style.setProperty('--pc', COLORS[i].main);

      const dot = document.createElement('span');
      dot.className = 'dot';

      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 16;
      input.value = settings.names[i] || DEFAULT_NAMES[i];
      input.setAttribute('aria-label', 'Nama pemain ' + (i + 1));
      input.dataset.index = String(i);

      row.append(dot, input);
      els.nameFields.append(row);
    }
  }

  function renderTimerHint() {
    els.timerHint.textContent = settings.timer
      ? 'Tiap pemain punya ' + settings.timer + ' detik untuk satu pasangan. Waktu habis = giliran berpindah.'
      : 'Tanpa batas waktu. Cocok untuk pengenalan kosakata pertama kali.';
  }

  function syncSoundUI() {
    const on = settings.sound;
    sound.setEnabled(on);
    if (els.ckSound) els.ckSound.checked = on;
    if (els.btnSound2) els.btnSound2.textContent = on ? '🔊 Suara: ON' : '🔇 Suara: OFF';
  }

  function updateFullUI() {
    const full = !!document.fullscreenElement;
    if (els.btnFullSetup) els.btnFullSetup.textContent = full ? '⛶  Keluar layar penuh' : '⛶  Layar penuh';
    if (els.btnFull2) els.btnFull2.textContent = full ? '⛶ Keluar penuh' : '⛶ Layar penuh';
  }

  function renderSetup() {
    setSeg(els.segPlayers, settings.players);
    setSeg(els.segPairs, settings.pairs);
    setSeg(els.segTimer, settings.timer);
    renderNames();
    renderTimerHint();
    syncSoundUI();
    updateFullUI();
    if (els.ckTouch) els.ckTouch.checked = settings.touch;
    document.body.classList.toggle('touch-mode', settings.touch);
  }

  els.segPlayers.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-v]');
    if (!btn) return;
    settings.players = Number(btn.dataset.v);
    saveSettings();
    renderSetup();
  });

  els.segPairs.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-v]');
    if (!btn) return;
    settings.pairs = Number(btn.dataset.v);
    saveSettings();
    renderSetup();
  });

  els.segTimer.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-v]');
    if (!btn) return;
    settings.timer = Number(btn.dataset.v);
    saveSettings();
    renderSetup();
  });

  els.nameFields.addEventListener('input', (e) => {
    const input = e.target.closest('input[data-index]');
    if (!input) return;
    settings.names[Number(input.dataset.index)] = input.value.slice(0, 16);
    saveSettings();
  });

  els.ckTouch.addEventListener('change', () => {
    settings.touch = els.ckTouch.checked;
    document.body.classList.toggle('touch-mode', settings.touch);
    saveSettings();
  });

  els.ckSound.addEventListener('change', () => {
    settings.sound = els.ckSound.checked;
    sound.setEnabled(settings.sound);
    if (settings.sound) sound.tick();
    saveSettings();
    syncSoundUI();
  });

  els.btnSound2.addEventListener('click', () => {
    settings.sound = !settings.sound;
    sound.setEnabled(settings.sound);
    if (settings.sound) sound.tick();
    saveSettings();
    syncSoundUI();
  });

  function toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        const p = document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        if (p && p.catch) p.catch(() => {});
      } else {
        const p = document.exitFullscreen();
        if (p && p.catch) p.catch(() => {});
      }
    } catch (e) {}
  }

  els.btnFullSetup.addEventListener('click', toggleFullscreen);
  els.btnFull2.addEventListener('click', toggleFullscreen);
  document.addEventListener('fullscreenchange', updateFullUI);

  /* ---------------------------- screens ---------------------------- */

  function showScreen(name) {
    const screens = { setup: els.setup, game: els.game, results: els.results };
    Object.keys(screens).forEach((key) => {
      const el = screens[key];
      const on = key === name;
      el.hidden = !on;
      el.classList.toggle('is-active', on);
    });
    window.scrollTo(0, 0);
    if (name === 'game') layoutCols();
  }

  /* ---------------------------- start ---------------------------- */

  function preload(pairs) {
    return Promise.all(pairs.map((p) => new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = p.img;
    })));
  }

  async function startGame() {
    if (!HOBBIES.length) {
      window.alert('Daftar hobi tidak termuat. Pastikan js/data.js ada.');
      return;
    }
    if (els.btnStart.disabled) return;
    els.btnStart.disabled = true;
    const label = els.btnStart.textContent;
    els.btnStart.textContent = 'Menyiapkan gambar…';

    const players = [];
    for (let i = 0; i < settings.players; i++) {
      const raw = (settings.names[i] || '').trim();
      players.push({
        name: (raw || DEFAULT_NAMES[i]).slice(0, 16),
        color: COLORS[i],
        score: 0,
        correct: 0,
        attempts: 0
      });
    }

    const count = Math.min(settings.pairs, HOBBIES.length);
    const pairs = shuffle(HOBBIES).slice(0, count).map((h, i) => ({
      pid: 'h' + i,
      word: h.word,
      img: h.img
    }));

    const game = {
      pairs: pairs,
      byPid: new Map(pairs.map((p) => [p.pid, p])),
      total: pairs.length,
      pics: shuffle(pairs.map((p) => p.pid)),
      words: shuffle(pairs.map((p) => p.pid)),
      matched: 0,
      players: players,
      turn: 0,
      attempts: 0,
      startedAt: Date.now(),
      duration: 0,
      limit: settings.timer,
      timeLeft: settings.timer,
      deadline: 0,
      timerId: null,
      locked: true,
      finished: false,
      selectedWord: null,
      selectedPic: null
    };

    await preload(pairs);
    game.startedAt = Date.now();

    els.btnStart.disabled = false;
    els.btnStart.textContent = label;

    stopTimerLoop();
    state.game = game;
    renderBoard(game);
    showScreen('game');
    updateHud();
    updateTimerUI();
    game.locked = false;
    resetTurnTimer();
    saveSettings();
  }

  els.btnStart.addEventListener('click', startGame);

  /* ---------------------------- board ---------------------------- */

  function renderBoard(game) {
    els.pics.textContent = '';
    els.words.textContent = '';

    const picFrag = document.createDocumentFragment();
    game.pics.forEach((pid) => {
      const pair = game.byPid.get(pid);
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'pic';
      card.dataset.pid = pid;
      card.setAttribute('aria-label', 'Gambar hobi');

      const img = new Image();
      img.src = pair.img;
      img.alt = '';
      img.draggable = false;
      img.decoding = 'async';

      const cap = document.createElement('span');
      cap.className = 'cap';

      const tick = document.createElement('span');
      tick.className = 'tick';
      tick.textContent = '✓';
      tick.setAttribute('aria-hidden', 'true');

      card.append(img, cap, tick);
      picFrag.append(card);
    });

    const wordFrag = document.createDocumentFragment();
    game.words.forEach((pid) => {
      const pair = game.byPid.get(pid);
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'word';
      chip.dataset.pid = pid;
      chip.textContent = pair.word;
      wordFrag.append(chip);
    });

    els.pics.append(picFrag);
    els.words.append(wordFrag);
    layoutCols();
  }

  function layoutCols() {
    const game = state.game;
    if (!game) return;
    const wide = window.innerWidth >= 1080 && window.innerWidth > window.innerHeight;
    const n = game.total;
    let picCols;
    let wordCols;

    if (!wide) {
      picCols = 4;
      wordCols = window.innerWidth < 820 ? 2 : 3;
    } else if (n <= 6) {
      picCols = 3; wordCols = 2;
    } else if (n <= 8) {
      picCols = 4; wordCols = 4;
    } else if (n <= 10) {
      picCols = 5; wordCols = 4;
    } else if (n <= 12) {
      picCols = 4; wordCols = 4;
    } else if (n <= 16) {
      picCols = 4; wordCols = 4;
    } else {
      picCols = 5; wordCols = 4;
    }

    els.pics.style.setProperty('--cols', String(picCols));
    els.words.style.setProperty('--cols', String(wordCols));
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layoutCols, 120);
  });

  /* ---------------------------- hud ---------------------------- */

  function updateHud() {
    const game = state.game;
    if (!game) return;

    els.scores.textContent = '';
    game.players.forEach((p, i) => {
      const chip = document.createElement('div');
      chip.className = 'pscore' + (i === game.turn ? ' active' : '');
      chip.style.setProperty('--pc', p.color.main);
      chip.style.setProperty('--pc-soft', p.color.soft);

      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.setAttribute('aria-hidden', 'true');

      const name = document.createElement('span');
      name.className = 'nm';
      name.textContent = p.name;

      const pts = document.createElement('b');
      pts.className = 'pt';
      pts.textContent = String(p.score);

      chip.append(dot, name, pts);
      els.scores.append(chip);
    });

    const active = game.players[game.turn];
    els.turnbar.style.setProperty('--pc', active.color.main);
    els.turnDot.style.background = active.color.main;
    els.turnLabel.textContent = game.players.length > 1 ? 'Giliran ' : 'Pemain: ';
    const strong = document.createElement('b');
    strong.textContent = active.name;
    els.turnLabel.append(strong);

    els.progressText.textContent = game.matched + ' / ' + game.total + ' pasangan';
    els.progFill.style.width = (game.matched / game.total) * 100 + '%';
  }

  /* ---------------------------- timer ---------------------------- */

  function updateTimerUI() {
    const game = state.game;
    if (!game) return;
    if (!game.limit) {
      els.timerPill.classList.add('off');
      els.timerPill.classList.remove('low');
      els.timerVal.textContent = '∞';
      els.timerUnit.textContent = 'tanpa batas';
      return;
    }
    els.timerPill.classList.remove('off');
    const secs = Math.max(0, Math.ceil(game.timeLeft));
    els.timerVal.textContent = String(secs);
    els.timerUnit.textContent = 'detik';
    const low = secs <= 5;
    els.timerPill.classList.toggle('low', low);
    if (low && secs > 0 && game.lastTickSecond !== secs) {
      game.lastTickSecond = secs;
      sound.tick();
    }
    if (!low) game.lastTickSecond = 0;
  }

  function stopTimerLoop() {
    if (state.game && state.game.timerId) {
      clearInterval(state.game.timerId);
      state.game.timerId = null;
    }
  }

  function resetTurnTimer() {
    const game = state.game;
    if (!game || game.finished) return;
    game.limit = settings.timer;
    game.timeLeft = game.limit;
    game.lastTickSecond = 0;
    game.deadline = game.limit ? performance.now() + game.limit * 1000 : 0;
    stopTimerLoop();
    updateTimerUI();
    if (game.limit) {
      game.timerId = setInterval(() => tickTimer(game), 100);
    }
  }

  function tickTimer(game) {
    if (!game || game.finished || !game.limit) return;
    game.timeLeft = Math.max(0, (game.deadline - performance.now()) / 1000);
    updateTimerUI();
    if (game.timeLeft <= 0) {
      stopTimerLoop();
      handleTimeout(game);
    }
  }

  function handleTimeout(game) {
    if (game.locked || game.finished) return;
    game.locked = true;
    clearSelection();
    flash('Waktu habis!', game.players.length > 1 ? 'Giliran berpindah' : 'Coba lagi lebih cepat', 'bad');
    sound.bad();
    setTimeout(() => {
      if (game.finished || state.game !== game) return;
      if (game.players.length > 1) nextPlayer(game);
      game.locked = false;
      updateHud();
      resetTurnTimer();
    }, 900);
  }

  /* ---------------------------- selection & drag ---------------------------- */

  function clearSelection() {
    const game = state.game;
    if (!game) return;
    game.selectedWord = null;
    game.selectedPic = null;
    updateSelectionUI();
  }

  function updateSelectionUI() {
    const game = state.game;
    if (!game) return;
    Array.prototype.forEach.call(els.words.children, (el) => {
      el.classList.toggle('selected', el.dataset.pid === game.selectedWord);
    });
    Array.prototype.forEach.call(els.pics.children, (el) => {
      el.classList.toggle('selected', el.dataset.pid === game.selectedPic);
    });
  }

  function toggleSelectedWord(pid) {
    const game = state.game;
    if (!game || game.locked || game.finished) return;
    const chip = els.words.querySelector('.word[data-pid="' + pid + '"]');
    if (!chip || chip.classList.contains('matched')) return;
    if (game.selectedWord === pid) {
      game.selectedWord = null;
    } else {
      game.selectedWord = pid;
      game.selectedPic = null;
    }
    updateSelectionUI();
  }

  function onPicTap(pid) {
    const game = state.game;
    if (!game || game.locked || game.finished) return;
    if (game.selectedWord) {
      const wordPid = game.selectedWord;
      clearSelection();
      attempt(wordPid, pid);
      return;
    }
    game.selectedPic = game.selectedPic === pid ? null : pid;
    game.selectedWord = null;
    updateSelectionUI();
  }

  els.pics.addEventListener('click', (e) => {
    if (Date.now() < suppressClickUntil) return;
    const game = state.game;
    if (!game || game.locked || game.finished) return;
    const card = e.target.closest('.pic');
    if (!card || card.classList.contains('matched')) return;
    onPicTap(card.dataset.pid);
  });

  /* keyboard: Enter/Space pada kata (click dengan detail 0) */
  els.words.addEventListener('click', (e) => {
    if (e.detail !== 0) return;
    const chip = e.target.closest('.word');
    if (!chip) return;
    toggleSelectedWord(chip.dataset.pid);
  });

  function picUnder(x, y) {
    const el = document.elementFromPoint(x, y);
    return el ? el.closest('.pic') : null;
  }

  els.words.addEventListener('pointerdown', (e) => {
    if (dragState) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const game = state.game;
    if (!game || game.locked || game.finished) return;
    const chip = e.target.closest('.word');
    if (!chip || chip.classList.contains('matched')) return;
    dragState = {
      el: chip,
      pid: chip.dataset.pid,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      ghost: null,
      target: null
    };
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
  });

  function onPointerMove(e) {
    if (!dragState) return;
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;

    if (!dragState.moved) {
      if (Math.sqrt(dx * dx + dy * dy) < 8) return;
      startGhost(e.clientX, e.clientY);
    }
    if (e.cancelable) e.preventDefault();
    moveGhost(e.clientX, e.clientY);
    highlightUnder(e.clientX, e.clientY);
  }

  function startGhost(x, y) {
    const rect = dragState.el.getBoundingClientRect();
    const ghost = dragState.el.cloneNode(true);
    ghost.classList.remove('selected', 'dragging', 'matched');
    ghost.classList.add('drag-ghost');
    ghost.removeAttribute('data-pid');
    ghost.style.width = Math.min(rect.width, 340) + 'px';
    ghost.setAttribute('aria-hidden', 'true');
    document.body.append(ghost);
    dragState.ghost = ghost;
    dragState.moved = true;
    dragState.el.classList.add('dragging');
    clearSelection();
    moveGhost(x, y);
  }

  function moveGhost(x, y) {
    if (!dragState || !dragState.ghost) return;
    dragState.ghost.style.left = x + 'px';
    dragState.ghost.style.top = y + 'px';
  }

  function highlightUnder(x, y) {
    const card = picUnder(x, y);
    const next = card && !card.classList.contains('matched') ? card : null;
    if (dragState.target === next) return;
    if (dragState.target) dragState.target.classList.remove('drop-target');
    dragState.target = next;
    if (next) next.classList.add('drop-target');
  }

  function cleanupDrag() {
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerCancel);
    if (dragState) {
      if (dragState.target) dragState.target.classList.remove('drop-target');
      if (dragState.ghost) dragState.ghost.remove();
      dragState.el.classList.remove('dragging');
    }
    dragState = null;
  }

  function onPointerUp(e) {
    if (!dragState) return;
    const d = dragState;
    const moved = d.moved;
    let targetPid = null;

    if (moved) {
      const under = picUnder(e.clientX, e.clientY);
      if (under && !under.classList.contains('matched')) targetPid = under.dataset.pid;
      suppressClickUntil = Date.now() + 350;
    } else {
      suppressClickUntil = Date.now() + 80;
    }

    cleanupDrag();

    if (moved) {
      if (targetPid) attempt(d.pid, targetPid);
    } else {
      toggleSelectedWord(d.pid);
    }
  }

  function onPointerCancel() {
    if (!dragState) return;
    const pid = dragState.pid;
    const moved = dragState.moved;
    cleanupDrag();
    if (!moved) toggleSelectedWord(pid);
  }

  /* ---------------------------- matching ---------------------------- */

  function attempt(wordPid, picPid) {
    const game = state.game;
    if (!game || game.locked || game.finished) return;

    const picEl = els.pics.querySelector('.pic[data-pid="' + picPid + '"]');
    const wordEl = els.words.querySelector('.word[data-pid="' + wordPid + '"]');
    if (!picEl || !wordEl) return;
    if (picEl.classList.contains('matched') || wordEl.classList.contains('matched')) return;

    const player = game.players[game.turn];
    game.attempts += 1;
    player.attempts += 1;
    game.locked = true;
    clearSelection();

    if (wordPid === picPid) {
      const pair = game.byPid.get(picPid);
      const secondsLeft = game.limit ? Math.max(0, Math.ceil(game.timeLeft)) : 0;
      const gain = 100 + secondsLeft * 5;

      player.correct += 1;
      player.score += gain;
      game.matched += 1;

      picEl.classList.add('matched');
      picEl.querySelector('.cap').textContent = pair.word;
      picEl.setAttribute('aria-label', 'Cocok: ' + pair.word);
      wordEl.classList.add('matched');
      wordEl.disabled = true;

      flash('Tepat!', '+' + gain + ' poin', 'good');
      sound.good();
      burst(picEl, '+' + gain);
      stopTimerLoop();
      updateHud();

      setTimeout(() => {
        if (state.game !== game) return;
        if (game.matched >= game.total) {
          finishGame(game);
          return;
        }
        game.locked = false;
        resetTurnTimer();
      }, 620);
    } else {
      picEl.classList.add('wrong');
      wordEl.classList.add('wrong');
      flash('Belum tepat', game.players.length > 1 ? 'Giliran berpindah' : 'Coba kata lain', 'bad');
      sound.bad();
      stopTimerLoop();

      setTimeout(() => {
        if (state.game !== game) return;
        picEl.classList.remove('wrong');
        wordEl.classList.remove('wrong');
        if (game.players.length > 1) nextPlayer(game);
        game.locked = false;
        updateHud();
        resetTurnTimer();
      }, 700);
    }
  }

  function nextPlayer(game) {
    game.turn = (game.turn + 1) % game.players.length;
    updateHud();
  }

  let flashTimer = null;
  function flash(main, sub, tone) {
    els.flash.textContent = '';
    els.flash.append(document.createTextNode(main));
    if (sub) {
      const small = document.createElement('small');
      small.textContent = sub;
      els.flash.append(small);
    }
    els.flash.className = 'flash show' + (tone ? ' ' + tone : '');
    clearTimeout(flashTimer);
    flashTimer = setTimeout(() => {
      els.flash.classList.remove('show');
    }, 900);
  }

  function burst(card, text) {
    const el = document.createElement('span');
    el.className = 'burst';
    el.textContent = text;
    const box = card.getBoundingClientRect();
    el.style.left = (box.left + box.width / 2) + 'px';
    el.style.top = (box.top + box.height * 0.38) + 'px';
    document.body.append(el);
    setTimeout(() => el.remove(), 1100);
  }

  /* ---------------------------- finish ---------------------------- */

  function finishGame(game) {
    game.finished = true;
    game.locked = true;
    stopTimerLoop();
    game.duration = Math.round((Date.now() - game.startedAt) / 1000);
    renderResults(game);
    showScreen('results');
    sound.win();
  }

  function renderResults(game) {
    const ranked = game.players
      .map((p, i) => ({ player: p, index: i }))
      .sort((a, b) => b.player.score - a.player.score);
    const topScore = ranked[0].player.score;
    const winners = ranked.filter((r) => r.player.score === topScore);

    if (game.players.length === 1) {
      els.resEmoji.textContent = '🌟';
      els.resTitle.textContent = 'Hebat, ' + game.players[0].name + '!';
    } else if (winners.length > 1) {
      els.resEmoji.textContent = '🤝';
      els.resTitle.textContent = 'Seri!';
    } else {
      els.resEmoji.textContent = '🏆';
      els.resTitle.textContent = winners[0].player.name + ' Menang!';
    }

    const accuracy = game.attempts ? Math.round((game.matched / game.attempts) * 100) : 100;
    els.resSub.textContent = game.matched + ' dari ' + game.total + ' pasangan cocok · ' +
      game.attempts + ' percobaan · akurasi ' + accuracy + '%';

    els.resTable.textContent = '';

    const head = document.createElement('div');
    head.className = 'res-row head';
    ['#', 'Pemain', 'Cocok', 'Akurasi', 'Poin'].forEach((text, i) => {
      const cell = document.createElement('span');
      cell.textContent = text;
      if (i === 2) cell.className = 'num hide-sm';
      if (i === 3) cell.className = 'num hide-sm';
      if (i === 4) cell.className = 'score';
      head.append(cell);
    });
    els.resTable.append(head);

    ranked.forEach((entry, i) => {
      const p = entry.player;
      const row = document.createElement('div');
      row.className = 'res-row' + (game.players.length > 1 && p.score === topScore ? ' win' : '');
      row.style.setProperty('--pc', p.color.main);

      const rank = document.createElement('span');
      rank.className = 'rank';
      rank.textContent = String(i + 1);

      const who = document.createElement('span');
      who.className = 'who';
      const dot = document.createElement('span');
      dot.className = 'dot';
      const name = document.createElement('b');
      name.textContent = p.name;
      who.append(dot, name);

      const pairs = document.createElement('span');
      pairs.className = 'num hide-sm';
      pairs.textContent = p.correct + ' / ' + game.total;

      const acc = document.createElement('span');
      acc.className = 'num hide-sm';
      acc.textContent = p.attempts ? Math.round((p.correct / p.attempts) * 100) + '%' : '—';

      const score = document.createElement('span');
      score.className = 'score';
      score.textContent = String(p.score);

      row.append(rank, who, pairs, acc, score);
      els.resTable.append(row);
    });

    els.resMeta.textContent = 'Waktu bermain ' + fmtTime(game.duration) + ' · ' +
      game.total + ' soal · ' + game.players.length + ' pemain';
  }

  els.btnAgain.addEventListener('click', () => {
    startGame();
  });

  els.btnSetup.addEventListener('click', () => {
    state.game = null;
    stopTimerLoop();
    showScreen('setup');
    renderSetup();
  });

  els.btnQuit.addEventListener('click', () => {
    if (!state.game) return;
    const ok = window.confirm('Keluar ke menu utama? Skor ronde ini akan hilang.');
    if (!ok) return;
    stopTimerLoop();
    state.game = null;
    showScreen('setup');
    renderSetup();
  });

  /* ---------------------------- init ---------------------------- */

  if (document.fullscreenElement === undefined) {
    els.btnFullSetup.hidden = true;
    els.btnFull2.hidden = true;
  }

  renderSetup();
  showScreen('setup');
  sound.setEnabled(settings.sound);
})();
