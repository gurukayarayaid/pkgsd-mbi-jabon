/* =========================================================
   MBJ · Inti aplikasi
   Penyimpanan konten, kerangka halaman, berbagi, berkas lokal
   ========================================================= */
(function () {
  'use strict';

  var DEFAULTS = window.DEFAULT_DATA || { program: {}, ui: {}, meetings: [], files: [] };
  var KEY_DRAFT = 'mbj.draft.v1';
  var KEY_SESSION = 'mbj.session.v1';
  var MBJ = {};

  /* ---------------- utilitas ---------------- */
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function uid(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
  }
  function hashPassword(pw) {
    var s = 'mbj|' + String(pw) + '|mengajar-bahasa-inggris-2026';
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return 'h' + h.toString(16);
  }
  function parseDate(d) {
    if (!d) return null;
    var parts = String(d).split('-').map(Number);
    if (parts.length < 3 || !parts[0]) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  function fmtDate(d, opts) {
    var dt = parseDate(d);
    if (!dt) return '';
    try {
      return dt.toLocaleDateString('id-ID', opts || { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) { return d; }
  }
  function shortDate(d) { return fmtDate(d, { day: 'numeric', month: 'short' }); }
  function bytes(n) {
    if (!n && n !== 0) return '';
    var u = ['B', 'KB', 'MB', 'GB'];
    var i = 0, v = Number(n);
    while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
    return (i === 0 ? v : v.toFixed(1)) + ' ' + u[i];
  }
  function readJSON(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
  }
  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }
  function sentences(text, max) {
    var t = String(text || '').replace(/\s+/g, ' ').trim();
    if (!t) return '';
    if (t.length <= max) return t;
    return t.slice(0, max).replace(/\s+\S*$/, '') + '…';
  }
  function paragraphs(text) {
    return String(text || '')
      .split(/\n{2,}/)
      .map(function (p) { return p.trim(); })
      .filter(Boolean)
      .map(function (p) { return '<p>' + esc(p).replace(/\n/g, '<br>') + '</p>'; })
      .join('');
  }

  /* ---------------- normalisasi konten ---------------- */
  function normalize(raw) {
    var out = clone(DEFAULTS);
    if (!raw || typeof raw !== 'object') return out;
    out.program = Object.assign({}, out.program, raw.program || {});
    out.ui = Object.assign({}, out.ui, raw.ui || {});
    out.account = Object.assign({ userId: 'admin', passwordHash: '' }, out.account || {}, raw.account || {});
    out.files = Array.isArray(raw.files) ? raw.files : out.files || [];
    out.meetings = Array.isArray(raw.meetings) && raw.meetings.length ? raw.meetings : out.meetings;
    return out;
  }

  /* ---------------- muat konten ---------------- */
  function loadContent() {
    var published = null;
    return fetch('content.json?t=' + Date.now(), { cache: 'no-store' })
      .then(function (res) { return res.ok ? res.json() : null; })
      .catch(function () { return null; })
      .then(function (json) {
        published = json ? normalize(json) : null;
        MBJ.published = published;
        var draft = readJSON(KEY_DRAFT);
        MBJ.isDraft = !!draft;
        MBJ.state = draft ? normalize(draft) : (published || normalize(null));
        if (!MBJ.state.account.passwordHash || MBJ.state.account.passwordHash === hashPassword('admin123')) {
          MBJ.state.account.passwordHash = hashPassword('alal1010');
        }
      });
  }

  MBJ.saveDraft = function () {
    try {
      localStorage.setItem(KEY_DRAFT, JSON.stringify(MBJ.state));
      MBJ.isDraft = true;
      return true;
    } catch (e) {
      MBJ.toast('Penyimpanan browser penuh. Hapus draf atau berkas lokal.');
      return false;
    }
  };
  MBJ.discardDraft = function () {
    localStorage.removeItem(KEY_DRAFT);
    MBJ.isDraft = false;
    MBJ.state = MBJ.published ? clone(MBJ.published) : normalize(null);
  };

  /* ---------------- autentikasi ringan ---------------- */
  MBJ.isAdmin = function () {
    try { return sessionStorage.getItem(KEY_SESSION) === 'ok'; } catch (e) { return false; }
  };
  MBJ.login = function (pw) {
    var acc = MBJ.state.account || {};
    if (hashPassword(pw) === acc.passwordHash) {
      try { sessionStorage.setItem(KEY_SESSION, 'ok'); } catch (e) {}
      return true;
    }
    return false;
  };
  MBJ.logout = function () {
    try { sessionStorage.removeItem(KEY_SESSION); } catch (e) {}
  };
  MBJ.hashPassword = hashPassword;

  /* ---------------- data bantu ---------------- */
  MBJ.meetingUrl = function (meeting) {
    return 'pertemuan.html?id=' + encodeURIComponent(meeting.id);
  };
  MBJ.materialUrl = function (meeting, material) {
    return MBJ.meetingUrl(meeting) + '#m-' + encodeURIComponent(material.id);
  };
  MBJ.absoluteUrl = function (href) {
    try { return new URL(href, location.href).href; } catch (e) { return location.href; }
  };
  MBJ.programStatus = function () {
    var s = MBJ.state;
    var start = parseDate(s.program.startDate);
    var end = parseDate(s.program.endDate);
    var now = new Date();
    now.setHours(0, 0, 0, 0);
    var meetings = s.meetings || [];
    var total = meetings.length || 10;
    var done = meetings.filter(function (m) {
      var d = parseDate(m.date);
      return d && d <= now;
    }).length;
    var key = 'soon', label = 'Belum dimulai';
    if (start && now >= start && (!end || now <= end)) { key = 'live'; label = 'Sedang berlangsung'; }
    if (end && now > end) { key = 'done'; label = 'Sudah selesai'; }
    var pct = Math.round((done / total) * 100);
    return { key: key, label: label, done: done, total: total, percent: pct };
  };

  /* ---------------- toast ---------------- */
  MBJ.toast = function (msg, ms) {
    var root = document.getElementById('toast-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'toast-root';
      root.className = 'toast-root';
      document.body.appendChild(root);
    }
    var el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(function () { el.classList.add('is-out'); }, ms || 2600);
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, (ms || 2600) + 400);
  };

  /* ---------------- berbagi ---------------- */
  MBJ.shareTargets = function (payload) {
    var title = payload.title || document.title;
    var text = payload.text || '';
    var url = MBJ.absoluteUrl(payload.url || location.href);
    var message = (title ? title + '\n' : '') + (text ? text + '\n' : '') + url;
    return {
      whatsapp: 'https://wa.me/?text=' + encodeURIComponent(message),
      email: 'mailto:?subject=' + encodeURIComponent(title) + '&body=' + encodeURIComponent(message),
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) +
        (title ? '&quote=' + encodeURIComponent(title) : ''),
      instagram: 'https://www.instagram.com/'
    };
  };

  MBJ.shareBar = function (payload, opts) {
    opts = opts || {};
    var title = payload.title || '';
    var text = payload.text || '';
    var url = MBJ.absoluteUrl(payload.url || location.href);
    var caption = (title ? title + '\n' : '') + (text ? text + '\n' : '') + url;
    var data = ' data-title="' + esc(title) + '" data-text="' + esc(text) + '" data-url="' + esc(url) + '"';
    var ig = ' data-caption="' + esc(caption) + '"';
    return '' +
      '<div class="share ' + (opts.compact ? 'share--compact' : '') + '">' +
        (opts.label === false ? '' : '<span class="share__label">Bagikan</span>') +
        '<a class="share__btn share__btn--wa" target="_blank" rel="noopener" data-share="whatsapp"' + data + ' href="#">WhatsApp</a>' +
        '<a class="share__btn share__btn--mail" data-share="email"' + data + ' href="#">Email</a>' +
        '<a class="share__btn share__btn--fb" target="_blank" rel="noopener" data-share="facebook"' + data + ' href="#">Facebook</a>' +
        '<a class="share__btn share__btn--ig" data-share="instagram"' + data + ig + ' href="#">Instagram</a>' +
        '<button type="button" class="share__btn share__btn--copy" data-share="copy"' + data + '>Salin tautan</button>' +
      '</div>';
  };

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }
  MBJ.copy = copyText;

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-share]');
    if (!el) return;
    e.preventDefault();
    var kind = el.dataset.share;
    var title = el.dataset.title || document.title;
    var text = el.dataset.text || '';
    var url = el.dataset.url || location.href;
    var caption = el.dataset.caption || (title + '\n' + url);

    if (kind === 'copy') {
      copyText(url).then(function (ok) {
        MBJ.toast(ok ? 'Tautan disalin ke papan klip.' : 'Gagal menyalin. Salin manual dari bilah alamat.');
      });
      return;
    }
    if (kind === 'instagram') {
      copyText(caption).then(function (ok) {
        window.open('https://www.instagram.com/', '_blank', 'noopener');
        MBJ.toast(ok ? 'Teks materi disalin. Tempel di caption Instagram.' : 'Instagram dibuka. Salin teks materi secara manual.');
      });
      return;
    }
    var links = MBJ.shareTargets({ title: title, text: text, url: url });
    var target = links[kind];
    if (!target) return;
    if (kind === 'email') {
      location.href = target;
      return;
    }
    window.open(target, '_blank', 'noopener');
  });

  /* ---------------- berkas lokal (IndexedDB) ---------------- */
  var DB_NAME = 'mbj-files';
  var STORE = 'files';
  var dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!('indexedDB' in window)) { reject(new Error('IndexedDB tidak tersedia')); return; }
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
    return dbPromise;
  }

  MBJ.files = {
    all: function () {
      return openDB().then(function (db) {
        return new Promise(function (resolve, reject) {
          var tx = db.transaction(STORE, 'readonly');
          var req = tx.objectStore(STORE).getAll();
          req.onsuccess = function () {
            var rows = (req.result || []).sort(function (a, b) { return (b.created || 0) - (a.created || 0); });
            resolve(rows);
          };
          req.onerror = function () { reject(req.error); };
        });
      }).catch(function () { return []; });
    },
    put: function (record) {
      return openDB().then(function (db) {
        return new Promise(function (resolve, reject) {
          var tx = db.transaction(STORE, 'readwrite');
          tx.objectStore(STORE).put(record);
          tx.oncomplete = function () { resolve(record); };
          tx.onerror = function () { reject(tx.error); };
        });
      });
    },
    remove: function (id) {
      return openDB().then(function (db) {
        return new Promise(function (resolve, reject) {
          var tx = db.transaction(STORE, 'readwrite');
          tx.objectStore(STORE).delete(id);
          tx.oncomplete = function () { resolve(true); };
          tx.onerror = function () { reject(tx.error); };
        });
      });
    }
  };

  MBJ.saveFiles = function (fileList, note) {
    var list = Array.prototype.slice.call(fileList || []);
    var chain = Promise.resolve();
    list.forEach(function (file) {
      chain = chain.then(function () {
        return MBJ.files.put({
          id: uid('file'),
          name: file.name,
          type: file.type || guessType(file.name),
          size: file.size || 0,
          created: Date.now(),
          note: note || '',
          blob: file
        });
      });
    });
    return chain.then(function () { return list.length; });
  };

  function guessType(name) {
    var ext = String(name || '').split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].indexOf(ext) >= 0) return 'image/' + (ext === 'jpg' ? 'jpeg' : ext);
    if (['mp4', 'webm', 'ogg', 'mov'].indexOf(ext) >= 0) return 'video/' + ext;
    if (['mp3', 'wav', 'm4a'].indexOf(ext) >= 0) return 'audio/' + ext;
    if (ext === 'pdf') return 'application/pdf';
    if (['doc', 'docx'].indexOf(ext) >= 0) return 'application/msword';
    if (['xls', 'xlsx'].indexOf(ext) >= 0) return 'application/vnd.ms-excel';
    if (['ppt', 'pptx'].indexOf(ext) >= 0) return 'application/vnd.ms-powerpoint';
    if (['zip', 'rar', '7z'].indexOf(ext) >= 0) return 'application/zip';
    return 'application/octet-stream';
  }
  MBJ.guessType = guessType;

  MBJ.fileKind = function (type, name) {
    var t = String(type || '') + ' ' + String(name || '');
    if (/image|\.(png|jpe?g|gif|webp|svg|bmp)/i.test(t)) return 'image';
    if (/video|\.(mp4|webm|ogg|mov)/i.test(t)) return 'video';
    if (/audio|\.(mp3|wav|m4a)/i.test(t)) return 'audio';
    if (/pdf|\.pdf/i.test(t)) return 'pdf';
    if (/word|excel|powerpoint|spreadsheet|presentation|\.(docx?|xlsx?|pptx?)/i.test(t)) return 'doc';
    return 'file';
  };
  MBJ.bytes = bytes;
  MBJ.esc = esc;
  MBJ.uid = uid;
  MBJ.paragraphs = paragraphs;
  MBJ.sentences = sentences;
  MBJ.fmtDate = fmtDate;
  MBJ.shortDate = shortDate;
  MBJ.parseDate = parseDate;
  MBJ.todayISO = todayISO;
  MBJ.guessType = guessType;

  MBJ.downloadLocal = function (rec) {
    var url = URL.createObjectURL(rec.blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = rec.name || 'berkas';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
  };
  MBJ.openLocal = function (rec) {
    var url = URL.createObjectURL(rec.blob);
    window.open(url, '_blank', 'noopener');
    setTimeout(function () { URL.revokeObjectURL(url); }, 20000);
  };

  /* ---------------- unduh/impor ---------------- */
  MBJ.download = function (filename, text, mime) {
    var blob = new Blob([text], { type: mime || 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 5000);
  };

  MBJ.exportContent = function () {
    MBJ.download('content.json', JSON.stringify(MBJ.state, null, 2), 'application/json;charset=utf-8');
  };

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result).split(',')[1] || ''); };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsDataURL(blob);
    });
  }
  function base64ToBlob(b64, type) {
    var bin = atob(b64 || '');
    var arr = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: type || 'application/octet-stream' });
  }

  MBJ.exportBackup = function (includeFiles) {
    var payload = { app: 'mbj-situs-materi', version: 1, exportedAt: new Date().toISOString(), content: MBJ.state, files: [] };
    var chain = Promise.resolve();
    if (includeFiles) {
      chain = MBJ.files.all().then(function (rows) {
        return rows.reduce(function (p, rec) {
          return p.then(function () {
            return blobToBase64(rec.blob).then(function (b64) {
              payload.files.push({ id: rec.id, name: rec.name, type: rec.type, size: rec.size, created: rec.created, note: rec.note, data: b64 });
            });
          });
        }, Promise.resolve());
      });
    }
    return chain.then(function () {
      var stamp = new Date().toISOString().slice(0, 10);
      MBJ.download('mbj-backup-' + stamp + '.json', JSON.stringify(payload));
      return payload;
    });
  };

  MBJ.importBackup = function (json) {
    if (!json || !json.content) return Promise.reject(new Error('Berkas tidak dikenali.'));
    MBJ.state = normalize(json.content);
    MBJ.saveDraft();
    var files = Array.isArray(json.files) ? json.files : [];
    var chain = Promise.resolve();
    files.forEach(function (f) {
      if (!f || !f.data) return;
      chain = chain.then(function () {
        return MBJ.files.put({
          id: f.id || uid('file'),
          name: f.name || 'berkas',
          type: f.type || 'application/octet-stream',
          size: f.size || 0,
          created: f.created || Date.now(),
          note: f.note || '',
          blob: base64ToBlob(f.data, f.type)
        });
      });
    });
    return chain.then(function () { return files.length; });
  };

  /* ---------------- kerangka halaman ---------------- */
  function mountChrome(active) {
    var s = MBJ.state;
    var ui = s.ui || {};
    var p = s.program || {};
    var nav = [
      { href: 'index.html', label: 'Beranda', key: 'home' },
      { href: 'index.html#pertemuan', label: '10 Pertemuan', key: 'meetings' },
      { href: 'media.html', label: 'Pusat Berkas', key: 'media' },
      { href: 'downloads.html', label: 'Unduh Berkas', key: 'downloads' },
      { href: 'admin.html', label: 'Admin', key: 'admin' }
    ];
    var header = document.getElementById('site-header');
    if (header) {
      header.innerHTML = '' +
        (ui.announcement ? '<div class="topbar"><div class="wrap">' + esc(ui.announcement) + '</div></div>' : '') +
        '<div class="site-header">' +
          '<div class="wrap header-inner">' +
            '<a class="brand" href="index.html">' +
              '<span class="brand__mark">' + esc((p.subtitle || 'MBJ').slice(0, 1)) + '</span>' +
              '<span class="brand__text"><strong>' + esc(ui.siteName || 'MBJ') + '</strong>' +
              '<small>' + esc(ui.tagline || '') + '</small></span>' +
            '</a>' +
            '<button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button>' +
            '<nav class="site-nav" id="site-nav">' +
              nav.map(function (n) {
                return '<a href="' + n.href + '"' + (n.key === active ? ' class="is-active" aria-current="page"' : '') + '>' + esc(n.label) + '</a>';
              }).join('') +
            '</nav>' +
          '</div>' +
        '</div>';
      var toggle = header.querySelector('.nav-toggle');
      if (toggle) {
        toggle.addEventListener('click', function () {
          var open = header.classList.toggle('nav-open');
          toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
      }
    }

    var footer = document.getElementById('site-footer');
    if (footer) {
      footer.innerHTML = '' +
        '<footer class="site-footer">' +
          '<div class="wrap footer-inner">' +
            '<div class="footer-col">' +
              '<div class="footer-title">' + esc(p.subtitle || 'Mengajar Bahasa Inggris') + '</div>' +
              '<p>' + esc(p.title || '') + '</p>' +
              '<p class="muted">' + esc(ui.footerNote || '') + '</p>' +
            '</div>' +
            '<div class="footer-col">' +
              '<div class="footer-title">Program</div>' +
              '<p>' + esc(p.startDate ? fmtDate(p.startDate, { day: 'numeric', month: 'long', year: 'numeric' }) : '') +
                (p.endDate ? ' – ' + esc(fmtDate(p.endDate, { day: 'numeric', month: 'long', year: 'numeric' })) : '') + '</p>' +
              '<p class="muted">Fasilitator: ' + esc(p.facilitator || '-') + '</p>' +
              '<p class="muted">' + esc(p.venue || '') + '</p>' +
            '</div>' +
            '<div class="footer-col">' +
              '<div class="footer-title">Tautan</div>' +
              '<p><a href="index.html#pertemuan">Daftar pertemuan</a></p>' +
              '<p><a href="media.html">Pusat berkas</a></p>' +
              '<p><a href="downloads.html">Unduh berkas per folder</a></p>' +
              '<p><a href="admin.html">Panel admin</a></p>' +
              (p.contactEmail ? '<p><a href="mailto:' + esc(p.contactEmail) + '">' + esc(p.contactEmail) + '</a></p>' : '') +
            '</div>' +
          '</div>' +
          '<div class="wrap footer-bottom"><span>© ' + new Date().getFullYear() + ' ' + esc(p.organizer || ui.siteName || '') + '</span>' +
          '<span class="muted">Situs statis — siap dipasang di GitHub Pages</span></div>' +
        '</footer>';
    }
  }

  /* ---------------- boot ---------------- */
  function boot() {
    loadContent().then(function () {
      var page = document.body.dataset.page || 'home';
      mountChrome(page);
      if (typeof window.renderPage === 'function') {
        try { window.renderPage(); } catch (e) { console.error(e); }
      }
      document.documentElement.classList.add('is-ready');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  MBJ.page = document.body ? (document.body.dataset.page || 'home') : 'home';
  window.MBJ = MBJ;
})();
