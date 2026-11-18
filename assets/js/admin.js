/* =========================================================
   Panel admin: program, pertemuan, materi, berkas, publikasi
   ========================================================= */
(function () {
  'use strict';

  var app = document.getElementById('app');
  var edit = { meetingId: null, materialId: null, adding: false };
  var TABS = [
    ['dasbor', 'Dasbor'],
    ['program', 'Program'],
    ['pertemuan', 'Pertemuan & Materi'],
    ['berkas', 'Berkas'],
    ['publikasi', 'Publikasi'],
    ['akun', 'Akun']
  ];

  function esc(v) { return MBJ.esc(v); }
  function sortMeetings() {
    return (MBJ.state.meetings || []).slice().sort(function (a, b) {
      return (a.day || 0) - (b.day || 0) || String(a.date).localeCompare(String(b.date));
    });
  }
  function currentMeeting() {
    return (MBJ.state.meetings || []).filter(function (m) { return m.id === edit.meetingId; })[0] || null;
  }
  function save(msg) {
    if (MBJ.saveDraft()) MBJ.toast(msg || 'Perubahan disimpan sebagai draf.');
    render();
  }
  function linesToList(v) {
    return String(v || '').split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function typeOptions(sel) {
    return ['text', 'image', 'video', 'pdf'].map(function (t) {
      var label = { text: 'Teks', image: 'Gambar', video: 'Video', pdf: 'PDF' }[t];
      return '<option value="' + t + '"' + (t === sel ? ' selected' : '') + '>' + label + '</option>';
    }).join('');
  }

  /* ---------------- login ---------------- */
  function renderLogin() {
    app.innerHTML = '' +
      '<section class="login-shell"><div class="wrap"><div class="login-card">' +
        '<span class="kicker">Panel admin</span>' +
        '<h1>Masuk untuk mengelola situs</h1>' +
        '<p class="muted small">Kelola program, 10 pertemuan, materi, dan berkas. Kata sandi bawaan <strong>alal1010</strong> — segera ubah di tab Akun setelah masuk.</p>' +
        '<form data-form="login" style="margin-top:1.2rem">' +
          '<div class="field"><label for="login-pass">Kata sandi</label>' +
            '<input id="login-pass" type="password" name="pass" autocomplete="current-password" required></div>' +
          '<button class="btn btn--block" type="submit">Masuk</button>' +
        '</form>' +
        '<p class="small muted" style="margin-top:1rem">Situs ini statis (GitHub Pages). Gerbang masuk berfungsi mencegah akses biasa, bukan pengamanan sisi server. Jangan menyimpan data sensitif di sini.</p>' +
        '<p class="small"><a href="index.html">← Kembali ke beranda</a></p>' +
      '</div></div></section>';
    document.title = 'Masuk · Panel Admin';
  }

  /* ---------------- kerangka ---------------- */
  function statusLine() {
    var s = MBJ.state;
    if (MBJ.isDraft) {
      return '<div class="status-line"><span class="dot dot--live"></span><span><strong>Draf lokal aktif.</strong> Perubahan belum terbit. Unduh <code>content.json</code> di tab Publikasi lalu unggah ke repositori agar tampil untuk semua pengunjung.</span></div>';
    }
    return '<div class="status-line"><span class="dot dot--ok"></span><span><strong>Tampil versi terbit.</strong> Belum ada draf lokal yang menunggu diterbitkan.</span></div>';
  }

  function render() {
    if (!MBJ.isAdmin()) { renderLogin(); return; }
    var tab = (location.hash || '#dasbor').slice(1);
    if (!TABS.some(function (t) { return t[0] === tab; })) tab = 'dasbor';
    if (tab === 'pertemuan') ensureSelection();

    var body = '';
    if (tab === 'dasbor') body = tabDasbor();
    else if (tab === 'program') body = tabProgram();
    else if (tab === 'pertemuan') body = tabPertemuan();
    else if (tab === 'berkas') body = tabBerkas();
    else if (tab === 'publikasi') body = tabPublikasi();
    else body = tabAkun();

    app.innerHTML = '' +
      '<section class="section section--tight" style="padding-bottom:2.5rem">' +
        '<div class="wrap">' +
          '<div class="admin-head">' +
            '<div><h1>Panel admin</h1><p>' + esc(MBJ.state.ui.siteName || '') + ' · ' + esc(MBJ.state.program.title || '') + '</p></div>' +
            '<div class="admin-head__actions">' +
              '<a class="btn btn--ghost btn--sm" href="index.html">Lihat situs</a>' +
              '<a class="btn btn--ghost btn--sm" href="media.html">Pusat berkas</a>' +
              '<button type="button" class="btn btn--sm" data-act="logout">Keluar</button>' +
            '</div>' +
          '</div>' +
          '<div class="tabs">' + TABS.map(function (t) {
            return '<a class="tab' + (t[0] === tab ? ' is-active' : '') + '" href="#' + t[0] + '">' + t[1] + '</a>';
          }).join('') + '</div>' +
          statusLine() +
          body +
        '</div>' +
      '</section>';

    document.title = 'Admin · ' + (MBJ.state.ui.siteName || 'MBJ');

    if (tab === 'dasbor') fillStats();
    if (tab === 'berkas') { wireBerkasUpload(); fillBerkas(); }
  }

  function ensureSelection() {
    var list = sortMeetings();
    var found = list.filter(function (m) { return m.id === edit.meetingId; })[0];
    if (!found && edit.meetingId !== 'new') edit.meetingId = list.length ? list[0].id : 'new';
  }

  /* ---------------- dasbor ---------------- */
  function tabDasbor() {
    var s = MBJ.state;
    var materials = 0;
    (s.meetings || []).forEach(function (m) { materials += (m.materials || []).length; });
    return '' +
      '<div class="stat-grid">' +
        '<div class="stat"><div class="stat__value">' + (s.meetings || []).length + '</div><div class="stat__label">Pertemuan</div></div>' +
        '<div class="stat"><div class="stat__value">' + materials + '</div><div class="stat__label">Materi</div></div>' +
        '<div class="stat"><div class="stat__value">' + (s.files || []).length + '</div><div class="stat__label">Berkas terbit</div></div>' +
        '<div class="stat"><div class="stat__value" id="stat-local">—</div><div class="stat__label">Berkas lokal</div></div>' +
      '</div>' +

      '<div class="panel">' +
        '<div class="panel__head"><div><h2>Langkah cepat</h2><p class="panel__hint" style="margin:.3rem 0 0">Alur kerja yang disarankan setelah mengubah isi situs.</p></div></div>' +
        '<div class="panel__actions">' +
          '<a class="btn btn--sm" href="#pertemuan">Tambah atau sunting materi</a>' +
          '<a class="btn btn--sm btn--ghost" href="#berkas">Unggah berkas</a>' +
          '<a class="btn btn--sm btn--ghost" href="#publikasi">Terbitkan perubahan</a>' +
          '<a class="btn btn--sm btn--ghost" href="#program">Ubah informasi program</a>' +
        '</div>' +
      '</div>' +

      '<div class="panel">' +
        '<h2>Ringkasan pertemuan</h2>' +
        '<p class="panel__hint">Klik untuk langsung menyunting.</p>' +
        sortMeetings().map(function (m) {
          return '<div class="list-row">' +
            '<div class="list-row__main"><div class="list-row__title">Pertemuan ' + esc(m.day) + ' · ' + esc(m.title) + '</div>' +
            '<div class="list-row__sub">' + esc(MBJ.fmtDate(m.date, { day: 'numeric', month: 'long', year: 'numeric' })) + ' · ' +
              (m.materials || []).length + ' materi</div></div>' +
            '<div class="list-row__actions"><button class="btn btn--sm btn--ghost" data-act="goto-meeting" data-id="' + esc(m.id) + '">Sunting</button></div>' +
          '</div>';
        }).join('') +
      '</div>' +

      '<div class="panel">' +
        '<h2>Panduan singkat</h2>' +
        '<div class="note-box" style="margin-top:.7rem">' +
          '<p><strong>1. Sunting.</strong> Semua perubahan disimpan sebagai draf di peramban ini, sehingga situs belum berubah bagi pengunjung lain.</p>' +
          '<p><strong>2. Terbitkan.</strong> Buka tab Publikasi, unduh <code>content.json</code>, lalu unggah ke repositori GitHub (menggantikan berkas lama).</p>' +
          '<p><strong>3. Berkas media.</strong> Untuk gambar, video, atau PDF yang ingin diunduh semua orang, letakkan berkas di folder <code>assets/unggahan/</code> pada repositori, lalu tambahkan tautannya di tab Berkas.</p>' +
          '<p><strong>4. Cadangan.</strong> Unduh cadangan berkala agar isi situs tidak hilang saat cache peramban dibersihkan.</p>' +
        '</div>' +
      '</div>';
  }

  function fillStats() {
    MBJ.files.all().then(function (rows) {
      var el = document.getElementById('stat-local');
      if (el) el.textContent = rows.length;
    });
  }

  /* ---------------- program ---------------- */
  function tabProgram() {
    var p = MBJ.state.program || {};
    var ui = MBJ.state.ui || {};
    return '' +
      '<form class="panel" data-form="program">' +
        '<div class="panel__head"><div><h2>Informasi program</h2><p class="panel__hint" style="margin:.3rem 0 0">Tampil di beranda, header, dan footer.</p></div></div>' +
        '<div class="field"><label>Nama program</label><input name="title" value="' + esc(p.title) + '" required></div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Subjudul</label><input name="subtitle" value="' + esc(p.subtitle) + '"></div>' +
          '<div class="field"><label>Label kecil di atas judul</label><input name="kicker" value="' + esc(p.kicker) + '"></div>' +
        '</div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Fasilitator</label><input name="facilitator" value="' + esc(p.facilitator) + '"></div>' +
          '<div class="field"><label>Lokasi</label><input name="venue" value="' + esc(p.venue) + '"></div>' +
        '</div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Tanggal mulai</label><input type="date" name="startDate" value="' + esc(p.startDate) + '"></div>' +
          '<div class="field"><label>Tanggal selesai</label><input type="date" name="endDate" value="' + esc(p.endDate) + '"></div>' +
          '<div class="field"><label>Jam kegiatan</label><input name="hours" value="' + esc(p.hours) + '" placeholder="13.00 – 16.00 WIB"></div>' +
        '</div>' +
        '<div class="field"><label>Penyelenggara</label><input name="organizer" value="' + esc(p.organizer) + '"></div>' +
        '<div class="field"><label>Deskripsi program</label><textarea name="description" rows="4">' + esc(p.description) + '</textarea></div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Email kontak</label><input type="email" name="contactEmail" value="' + esc(p.contactEmail) + '"></div>' +
          '<div class="field"><label>Telepon/WhatsApp kontak</label><input name="contactPhone" value="' + esc(p.contactPhone) + '"></div>' +
        '</div>' +
        '<h3 style="margin-top:1.4rem">Tampilan situs</h3>' +
        '<div class="field-row">' +
          '<div class="field"><label>Nama situs (header)</label><input name="siteName" value="' + esc(ui.siteName) + '"></div>' +
          '<div class="field"><label>Slogan</label><input name="tagline" value="' + esc(ui.tagline) + '"></div>' +
        '</div>' +
        '<div class="field"><label>Pengumuman bilah atas</label><textarea name="announcement" rows="2">' + esc(ui.announcement) + '</textarea>' +
          '<small>Kosongkan untuk menyembunyikan bilah pengumuman.</small></div>' +
        '<div class="field"><label>Catatan footer</label><input name="footerNote" value="' + esc(ui.footerNote) + '"></div>' +
        '<button class="btn" type="submit">Simpan perubahan</button>' +
      '</form>';
  }

  /* ---------------- pertemuan & materi ---------------- */
  function tabPertemuan() {
    var list = sortMeetings();
    var m = currentMeeting();
    var listHtml = list.map(function (x) {
      return '<div class="list-row' + (m && x.id === m.id ? ' is-active' : '') + '">' +
        '<div class="list-row__main">' +
          '<div class="list-row__title">' + esc(x.day) + '. ' + esc(x.title) + '</div>' +
          '<div class="list-row__sub">' + esc(MBJ.shortDate(x.date)) + ' · ' + (x.materials || []).length + ' materi</div>' +
        '</div>' +
        '<div class="list-row__actions">' +
          '<button class="btn btn--sm btn--ghost" data-act="select-meeting" data-id="' + esc(x.id) + '">Buka</button>' +
          '<button class="btn btn--sm btn--danger" data-act="delete-meeting" data-id="' + esc(x.id) + '">Hapus</button>' +
        '</div>' +
      '</div>';
    }).join('');

    return '' +
      '<div class="panel">' +
        '<div class="panel__head"><div><h2>Daftar pertemuan</h2><p class="panel__hint" style="margin:.3rem 0 0">Urutan tampil mengikuti nomor hari dan tanggal.</p></div>' +
          '<button class="btn btn--sm" data-act="new-meeting">+ Pertemuan baru</button></div>' +
        (listHtml || '<div class="empty">Belum ada pertemuan.</div>') +
      '</div>' +
      (edit.meetingId === 'new' ? meetingForm(null) : (m ? meetingForm(m) : '<div class="empty">Pilih pertemuan untuk disunting.</div>'));
  }

  function meetingForm(m) {
    var isNew = !m;
    var d = m || { day: (MBJ.state.meetings || []).length + 1, date: MBJ.state.program.endDate || MBJ.todayISO(), title: '', topic: '', objectives: [], note: '', materials: [] };
    return '' +
      '<form class="panel" data-form="meeting" data-id="' + (isNew ? 'new' : esc(m.id)) + '">' +
        '<div class="panel__head">' +
          '<div><h2>' + (isNew ? 'Pertemuan baru' : 'Sunting pertemuan') + '</h2>' +
          '<p class="panel__hint" style="margin:.3rem 0 0">Isi judul, tanggal, dan tujuan. Materi ditambahkan di bawah.</p></div>' +
          (isNew ? '<button type="button" class="btn btn--sm btn--ghost" data-act="cancel-new">Batal</button>' : '') +
        '</div>' +
        '<div class="field-row">' +
          '<div class="field"><label>Nomor hari</label><input type="number" min="1" max="99" name="day" value="' + esc(d.day) + '" required></div>' +
          '<div class="field"><label>Tanggal</label><input type="date" name="date" value="' + esc(d.date) + '"></div>' +
        '</div>' +
        '<div class="field"><label>Judul pertemuan</label><input name="title" value="' + esc(d.title) + '" required></div>' +
        '<div class="field"><label>Topik / ringkasan</label><textarea name="topic" rows="3">' + esc(d.topic) + '</textarea></div>' +
        '<div class="field"><label>Tujuan pembelajaran</label><textarea name="objectives" rows="4" placeholder="Satu tujuan per baris">' + esc((d.objectives || []).join('\n')) + '</textarea>' +
          '<small>Satu tujuan per baris.</small></div>' +
        '<div class="field"><label>Catatan khusus</label><input name="note" value="' + esc(d.note) + '" placeholder="Misalnya: libur, ruang pindah, atau tugas mandiri"></div>' +
        '<button class="btn" type="submit">Simpan pertemuan</button>' +
      '</form>' +
      (isNew ? '' : materialsPanel(m));
  }

  function materialsPanel(m) {
    var mats = m.materials || [];
    var rows = mats.map(function (mm, i) {
      var isEditing = edit.materialId === mm.id;
      return '<div class="mat-editor">' +
        '<div class="mat-editor__head">' +
          '<div><strong>' + esc(mm.title || '(tanpa judul)') + '</strong>' +
          '<div class="small muted">' + esc({ text: 'Teks', image: 'Gambar', video: 'Video', pdf: 'PDF' }[mm.type] || 'Teks') +
            (mm.url ? ' · ada tautan/media' : '') + '</div></div>' +
          '<div class="list-row__actions">' +
            '<button type="button" class="btn btn--sm btn--ghost" data-act="material-edit" data-id="' + esc(mm.id) + '">' + (isEditing ? 'Tutup' : 'Sunting') + '</button>' +
            '<button type="button" class="btn btn--sm btn--ghost" data-act="material-up" data-id="' + esc(mm.id) + '"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
            '<button type="button" class="btn btn--sm btn--ghost" data-act="material-down" data-id="' + esc(mm.id) + '"' + (i === mats.length - 1 ? ' disabled' : '') + '>↓</button>' +
            '<button type="button" class="btn btn--sm btn--danger" data-act="material-delete" data-id="' + esc(mm.id) + '">Hapus</button>' +
          '</div>' +
        '</div>' +
        (isEditing ? materialForm(m, mm) : '') +
      '</div>';
    }).join('');

    return '' +
      '<div class="panel">' +
        '<div class="panel__head"><div><h2>Materi pertemuan ' + esc(m.day) + '</h2>' +
        '<p class="panel__hint" style="margin:.3rem 0 0">Teks, gambar, video (YouTube/Drive), dan PDF. Setiap materi otomatis memiliki tombol berbagi.</p></div>' +
        '<button type="button" class="btn btn--sm" data-act="material-new">+ Materi baru</button></div>' +
        (rows || '<div class="empty">Belum ada materi. Tambahkan materi pertama.</div>') +
        (edit.adding ? '<div class="mat-editor" style="background:#fff"><div class="mat-editor__head"><strong>Materi baru</strong>' +
          '<button type="button" class="btn btn--sm btn--ghost" data-act="material-cancel">Batal</button></div>' +
          materialForm(m, null) + '</div>' : '') +
      '</div>';
  }

  function materialForm(m, mat) {
    var isNew = !mat;
    var d = mat || { type: 'text', title: '', body: '', url: '', caption: '' };
    return '' +
      '<form data-form="material" data-meeting="' + esc(m.id) + '" data-id="' + (isNew ? '' : esc(mat.id)) + '" style="margin-top:.6rem">' +
        '<div class="field-row">' +
          '<div class="field"><label>Jenis materi</label><select name="type">' + typeOptions(d.type) + '</select></div>' +
          '<div class="field"><label>Judul materi</label><input name="title" value="' + esc(d.title) + '" required></div>' +
        '</div>' +
        '<div class="field"><label>Isi teks</label><textarea name="body" rows="6" placeholder="Pisahkan paragraf dengan satu baris kosong.">' + esc(d.body) + '</textarea></div>' +
        '<div class="field"><label>Tautan media (gambar/video/PDF)</label>' +
          '<input name="url" value="' + esc(d.url) + '" placeholder="https://… atau assets/unggahan/nama-berkas.jpg"></div>' +
        '<div class="field"><label>Keterangan / caption</label><input name="caption" value="' + esc(d.caption) + '"></div>' +
        '<button class="btn btn--sm" type="submit">Simpan materi</button>' +
      '</form>';
  }

  /* ---------------- berkas ---------------- */
  function tabBerkas() {
    return '' +
      '<div class="panel">' +
        '<h2>Unggah berkas</h2>' +
        '<p class="panel__hint">Berkas tersimpan di peramban ini. Untuk dipublikasikan, letakkan berkas di folder <code>assets/unggahan/</code> pada repositori lalu tambahkan tautannya di bagian bawah.</p>' +
        '<div class="dropzone" id="admin-drop">' +
          '<div class="dropzone__title">Tarik berkas atau pilih dari perangkat</div>' +
          '<p>Gambar, video, audio, PDF, dokumen kantor, arsip.</p>' +
          '<div class="dropzone__actions"><button type="button" class="btn" id="admin-pick">Pilih berkas</button></div>' +
          '<input type="file" id="admin-file" multiple data-upload>' +
        '</div>' +
      '</div>' +

      '<div class="panel">' +
        '<div class="panel__head"><div><h2>Berkas di perangkat ini</h2>' +
          '<p class="panel__hint" style="margin:.3rem 0 0">Dapat dibuka dan diunduh pada peramban ini, serta ikut tersimpan dalam cadangan.</p></div>' +
          '<span class="badge badge--soft" id="admin-local-count">—</span></div>' +
        '<div id="admin-local-list"><div class="empty">Memuat…</div></div>' +
      '</div>' +

      '<div class="panel">' +
        '<h2>Berkas terbit (tautan)</h2>' +
        '<p class="panel__hint">Tautan yang muncul di Pusat Berkas dan dapat diunduh siapa pun. Gunakan berkas dalam repositori atau tautan Google Drive.</p>' +
        '<form data-form="pubfile" class="field-row" style="align-items:end">' +
          '<div class="field" style="grid-column:1/-1"><label>Nama berkas</label><input name="name" placeholder="Lembar Kerja Pertemuan 3" required></div>' +
          '<div class="field" style="grid-column:1/-1"><label>Tautan</label><input name="url" placeholder="assets/unggahan/lembar-kerja-3.pdf atau https://…" required></div>' +
          '<div class="field"><label>Keterangan</label><input name="note" placeholder="Opsional"></div>' +
          '<div class="field"><label>&nbsp;</label><button class="btn btn--block" type="submit">Tambahkan</button></div>' +
        '</form>' +
        '<div style="margin-top:1.2rem">' + pubFileRows() + '</div>' +
      '</div>';
  }

  function pubFileRows() {
    var files = MBJ.state.files || [];
    if (!files.length) return '<div class="empty">Belum ada berkas terbit.</div>';
    return files.map(function (f) {
      return '<div class="list-row">' +
        '<div class="list-row__main"><div class="list-row__title">' + esc(f.name) + '</div>' +
        '<div class="list-row__sub">' + esc(f.url) + (f.note ? ' · ' + esc(f.note) : '') + '</div></div>' +
        '<div class="list-row__actions">' +
          '<a class="btn btn--sm btn--ghost" href="' + esc(f.url) + '" target="_blank" rel="noopener">Buka</a>' +
          '<button class="btn btn--sm btn--ghost" data-act="copy-link" data-url="' + esc(MBJ.absoluteUrl(f.url)) + '">Salin</button>' +
          '<button class="btn btn--sm btn--danger" data-act="pubfile-delete" data-id="' + esc(f.id) + '">Hapus</button>' +
        '</div>' +
      '</div>';
    }).join('');
  }

  function fillBerkas() {
    MBJ.files.all().then(function (rows) {
      var box = document.getElementById('admin-local-list');
      var count = document.getElementById('admin-local-count');
      if (count) count.textContent = rows.length + ' berkas';
      if (!box) return;
      box.innerHTML = rows.length ? rows.map(function (r) {
        var kind = MBJ.fileKind(r.type, r.name);
        return '<div class="list-row">' +
          '<div class="list-row__main"><div class="list-row__title">' + esc(r.name) + '</div>' +
          '<div class="list-row__sub">' + esc(kind) + ' · ' + MBJ.bytes(r.size) + ' · ' +
            esc(new Date(r.created || Date.now()).toLocaleDateString('id-ID')) + '</div></div>' +
          '<div class="list-row__actions">' +
            '<button class="btn btn--sm btn--ghost" data-act="local-open" data-id="' + esc(r.id) + '">Buka</button>' +
            '<button class="btn btn--sm btn--ghost" data-act="local-download" data-id="' + esc(r.id) + '">Unduh</button>' +
            '<button class="btn btn--sm btn--danger" data-act="local-delete" data-id="' + esc(r.id) + '">Hapus</button>' +
          '</div>' +
        '</div>';
      }).join('') : '<div class="empty">Belum ada berkas di perangkat ini.</div>';
    });
  }

  function wireBerkasUpload() {
    var dz = document.getElementById('admin-drop');
    var input = document.getElementById('admin-file');
    var pick = document.getElementById('admin-pick');
    if (!dz || !input) return;

    if (pick) pick.addEventListener('click', function () { input.click(); });
    dz.addEventListener('click', function (e) {
      if (e.target.closest('button')) return;
      input.click();
    });
    input.addEventListener('change', function () {
      var files = input.files;
      if (!files || !files.length) return;
      MBJ.saveFiles(files).then(function (n) {
        MBJ.toast(n + ' berkas disimpan.');
        fillBerkas();
      }).catch(function () { MBJ.toast('Gagal menyimpan berkas.'); });
      input.value = '';
    });
    ['dragenter', 'dragover'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('is-over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('is-over'); });
    });
    dz.addEventListener('drop', function (e) {
      e.preventDefault();
      dz.classList.remove('is-over');
      if (e.dataTransfer && e.dataTransfer.files.length) {
        MBJ.saveFiles(e.dataTransfer.files).then(function (n) {
          MBJ.toast(n + ' berkas disimpan.');
          fillBerkas();
        }).catch(function () { MBJ.toast('Gagal menyimpan berkas.'); });
      }
    });
  }

  /* ---------------- publikasi ---------------- */
  function tabPublikasi() {
    return '' +
      '<div class="panel">' +
        '<h2>Terbitkan ke GitHub Pages</h2>' +
        '<p class="panel__hint">Situs ini statis: perubahan diterbitkan dengan mengganti berkas <code>content.json</code> di repositori.</p>' +
        '<ol class="small" style="line-height:1.9;padding-left:1.2rem;margin:0 0 1rem">' +
          '<li>Klik <strong>Unduh content.json</strong> di bawah.</li>' +
          '<li>Buka repositori GitHub situs ini, lalu unggah berkas tersebut ke folder utama (ganti berkas lama).</li>' +
          '<li>Tunggu 1–2 menit sampai GitHub Pages memperbarui situs.</li>' +
          '<li>Buka situs dalam mode penyamaran untuk memastikan draf lokal tidak menutupi versi terbit.</li>' +
        '</ol>' +
        '<div class="panel__actions">' +
          '<button class="btn" data-act="export-content">Unduh content.json</button>' +
          '<button class="btn btn--ghost" data-act="discard-draft">Gunakan versi terbit (hapus draf)</button>' +
        '</div>' +
      '</div>' +

      '<div class="panel">' +
        '<h2>Cadangan dan pemulihan</h2>' +
        '<p class="panel__hint">Cadangan berisi seluruh isi situs beserta berkas lokal (opsional). Simpan berkas cadangan di tempat aman.</p>' +
        '<div class="panel__actions" style="margin-bottom:1.2rem">' +
          '<button class="btn btn--ghost btn--sm" data-act="backup">Unduh cadangan (isi situs)</button>' +
          '<button class="btn btn--ghost btn--sm" data-act="backup-files">Unduh cadangan + berkas lokal</button>' +
        '</div>' +
        '<div class="field"><label for="import-file">Pulihkan dari cadangan</label>' +
          '<input type="file" id="import-file" accept="application/json,.json" data-import></div>' +
        '<p class="small muted">Pemulihan akan menimpa draf saat ini. Buat cadangan terlebih dahulu bila ragu.</p>' +
      '</div>' +

      '<div class="panel">' +
        '<h2>Berkas statis situs</h2>' +
        '<div class="note-box">' +
          '<p>Letakkan gambar, video, atau PDF di folder <code>assets/unggahan/</code> pada repositori, lalu tautkan dengan alamat relatif, misalnya <code>assets/unggahan/foto-kegiatan.jpg</code>.</p>' +
          '<p>Berkas besar (di atas 25 MB) sebaiknya disimpan di Google Drive dan ditautkan, karena GitHub membatasi ukuran berkas.</p>' +
        '</div>' +
      '</div>';
  }

  /* ---------------- akun ---------------- */
  function tabAkun() {
    return '' +
      '<form class="panel" data-form="account">' +
        '<h2>Akun admin</h2>' +
        '<p class="panel__hint">Ganti kata sandi untuk mencegah orang lain mengubah isi situs dari peramban ini.</p>' +
        '<div class="field-row">' +
          '<div class="field"><label>Kata sandi baru</label><input type="password" name="pass1" minlength="6" placeholder="Minimal 6 karakter"></div>' +
          '<div class="field"><label>Ulangi kata sandi baru</label><input type="password" name="pass2" minlength="6" placeholder="Ulangi kata sandi"></div>' +
        '</div>' +
        '<p class="small muted">Kosongkan bila tidak ingin mengganti kata sandi.</p>' +
        '<button class="btn" type="submit">Simpan akun</button>' +
      '</form>' +

      '<div class="panel">' +
        '<h2>Catatan keamanan</h2>' +
        '<div class="note-box">' +
          '<p>Situs ini berjalan sepenuhnya di peramban (GitHub Pages). Kata sandi disimpan sebagai sidik jari sederhana, bukan pengamanan tingkat server.</p>' +
          '<p>Gunakan panel admin di perangkat pribadi, dan unduh cadangan setelah selesai mengelola isi.</p>' +
        '</div>' +
      '</div>';
  }

  /* ---------------- interaksi ---------------- */
  app.addEventListener('submit', function (e) {
    var form = e.target;
    var kind = form.dataset.form;
    if (!kind) return;
    e.preventDefault();
    var fd = new FormData(form);
    var s = MBJ.state;

    if (kind === 'login') {
      if (MBJ.login(fd.get('pass'))) {
        MBJ.toast('Selamat datang kembali.');
        render();
      } else {
        MBJ.toast('Kata sandi salah.');
      }
      return;
    }

    if (kind === 'program') {
      s.program.title = fd.get('title');
      s.program.subtitle = fd.get('subtitle');
      s.program.kicker = fd.get('kicker');
      s.program.facilitator = fd.get('facilitator');
      s.program.venue = fd.get('venue');
      s.program.startDate = fd.get('startDate');
      s.program.endDate = fd.get('endDate');
      s.program.hours = fd.get('hours');
      s.program.organizer = fd.get('organizer');
      s.program.description = fd.get('description');
      s.program.contactEmail = fd.get('contactEmail');
      s.program.contactPhone = fd.get('contactPhone');
      s.ui.siteName = fd.get('siteName');
      s.ui.tagline = fd.get('tagline');
      s.ui.announcement = fd.get('announcement');
      s.ui.footerNote = fd.get('footerNote');
      save('Informasi program disimpan.');
      return;
    }

    if (kind === 'meeting') {
      var id = form.dataset.id;
      var payload = {
        day: Number(fd.get('day')) || 1,
        date: fd.get('date') || '',
        title: String(fd.get('title') || '').trim(),
        topic: String(fd.get('topic') || '').trim(),
        objectives: linesToList(fd.get('objectives')),
        note: String(fd.get('note') || '').trim()
      };
      if (!payload.title) { MBJ.toast('Judul pertemuan wajib diisi.'); return; }
      if (id === 'new') {
        var fresh = Object.assign({ id: MBJ.uid('hari'), materials: [] }, payload);
        s.meetings.push(fresh);
        edit.meetingId = fresh.id;
      } else {
        var target = s.meetings.filter(function (m) { return m.id === id; })[0];
        if (target) Object.assign(target, payload);
      }
      edit.materialId = null;
      edit.adding = false;
      save('Pertemuan disimpan.');
      return;
    }

    if (kind === 'material') {
      var mid = form.dataset.meeting;
      var matId = form.dataset.id;
      var meeting = s.meetings.filter(function (m) { return m.id === mid; })[0];
      if (!meeting) return;
      var mat = {
        type: fd.get('type') || 'text',
        title: String(fd.get('title') || '').trim(),
        body: String(fd.get('body') || ''),
        url: String(fd.get('url') || '').trim(),
        caption: String(fd.get('caption') || '').trim()
      };
      if (!mat.title) { MBJ.toast('Judul materi wajib diisi.'); return; }
      meeting.materials = meeting.materials || [];
      if (matId) {
        var found = meeting.materials.filter(function (x) { return x.id === matId; })[0];
        if (found) Object.assign(found, mat);
      } else {
        meeting.materials.push(Object.assign({ id: MBJ.uid('materi') }, mat));
      }
      edit.materialId = null;
      edit.adding = false;
      save('Materi disimpan.');
      return;
    }

    if (kind === 'pubfile') {
      var name = String(fd.get('name') || '').trim();
      var url = String(fd.get('url') || '').trim();
      if (!name || !url) { MBJ.toast('Nama dan tautan wajib diisi.'); return; }
      s.files = s.files || [];
      s.files.push({ id: MBJ.uid('file'), name: name, url: url, note: String(fd.get('note') || '').trim(), type: MBJ.guessType(url), size: 0 });
      save('Berkas terbit ditambahkan.');
      return;
    }

    if (kind === 'account') {
      var p1 = String(fd.get('pass1') || '');
      var p2 = String(fd.get('pass2') || '');
      if (p1 || p2) {
        if (p1.length < 6) { MBJ.toast('Kata sandi minimal 6 karakter.'); return; }
        if (p1 !== p2) { MBJ.toast('Kata sandi tidak sama.'); return; }
        s.account.passwordHash = MBJ.hashPassword(p1);
      }
      save('Akun diperbarui.');
      return;
    }
  });

  app.addEventListener('change', function (e) {
    var input = e.target;
    if (input.matches('[data-import]')) {
      var file = input.files && input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var json = JSON.parse(String(reader.result));
          MBJ.importBackup(json).then(function (n) {
            MBJ.toast('Cadangan dipulihkan' + (n ? ' (' + n + ' berkas)' : '') + '.');
            edit.meetingId = null;
            render();
          }).catch(function (err) {
            MBJ.toast('Gagal memulihkan: ' + err.message);
          });
        } catch (err) {
          MBJ.toast('Berkas cadangan bukan JSON yang valid.');
        }
      };
      reader.readAsText(file);
    }
  });

  app.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-act]');
    if (!btn) return;
    var act = btn.dataset.act;
    var id = btn.dataset.id;
    var s = MBJ.state;

    if (act === 'logout') {
      MBJ.logout();
      MBJ.toast('Anda telah keluar.');
      render();
      return;
    }
    if (act === 'goto-meeting') {
      edit.meetingId = id;
      edit.materialId = null;
      edit.adding = false;
      location.hash = 'pertemuan';
      if (location.hash === '#pertemuan') render();
      return;
    }
    if (act === 'select-meeting') {
      edit.meetingId = id; edit.materialId = null; edit.adding = false; render(); return;
    }
    if (act === 'new-meeting') { edit.meetingId = 'new'; edit.materialId = null; edit.adding = false; render(); return; }
    if (act === 'cancel-new') { edit.meetingId = null; ensureSelection(); render(); return; }
    if (act === 'delete-meeting') {
      var target = s.meetings.filter(function (m) { return m.id === id; })[0];
      if (!target) return;
      if (!confirm('Hapus pertemuan "' + target.title + '" beserta seluruh materinya?')) return;
      s.meetings = s.meetings.filter(function (m) { return m.id !== id; });
      if (edit.meetingId === id) edit.meetingId = null;
      edit.materialId = null;
      edit.adding = false;
      save('Pertemuan dihapus.');
      return;
    }
    if (act === 'material-new') { edit.adding = true; edit.materialId = null; render(); return; }
    if (act === 'material-cancel') { edit.adding = false; render(); return; }
    if (act === 'material-edit') { edit.materialId = edit.materialId === id ? null : id; edit.adding = false; render(); return; }
    if (act === 'material-delete') {
      var meeting = currentMeeting();
      if (!meeting) return;
      if (!confirm('Hapus materi ini?')) return;
      meeting.materials = (meeting.materials || []).filter(function (m) { return m.id !== id; });
      if (edit.materialId === id) edit.materialId = null;
      save('Materi dihapus.');
      return;
    }
    if (act === 'material-up' || act === 'material-down') {
      var mt = currentMeeting();
      if (!mt) return;
      var arr = mt.materials || [];
      var idx = arr.findIndex(function (m) { return m.id === id; });
      var swap = act === 'material-up' ? idx - 1 : idx + 1;
      if (idx < 0 || swap < 0 || swap >= arr.length) return;
      var tmp = arr[idx]; arr[idx] = arr[swap]; arr[swap] = tmp;
      save('Urutan materi diperbarui.');
      return;
    }
    if (act === 'pubfile-delete') {
      if (!confirm('Hapus tautan berkas ini dari daftar terbit?')) return;
      s.files = (s.files || []).filter(function (f) { return f.id !== id; });
      save('Berkas terbit dihapus.');
      return;
    }
    if (act === 'copy-link') { MBJ.copy(btn.dataset.url).then(function () { MBJ.toast('Tautan disalin.'); }); return; }
    if (act === 'local-open' || act === 'local-download' || act === 'local-delete') {
      MBJ.files.all().then(function (rows) {
        var rec = rows.filter(function (r) { return r.id === id; })[0];
        if (!rec) return;
        if (act === 'local-open') MBJ.openLocal(rec);
        if (act === 'local-download') MBJ.downloadLocal(rec);
        if (act === 'local-delete') {
          if (!confirm('Hapus berkas "' + rec.name + '" dari perangkat?')) return;
          MBJ.files.remove(id).then(function () { MBJ.toast('Berkas dihapus.'); fillBerkas(); });
        }
      });
      return;
    }
    if (act === 'export-content') {
      MBJ.exportContent();
      MBJ.toast('content.json diunduh. Unggah ke repositori GitHub.');
      return;
    }
    if (act === 'discard-draft') {
      if (!confirm('Hapus draf lokal dan kembali ke versi terbit?')) return;
      MBJ.discardDraft();
      MBJ.toast('Draf dihapus. Situs memakai versi terbit.');
      render();
      return;
    }
    if (act === 'backup') {
      MBJ.exportBackup(false).then(function () { MBJ.toast('Cadangan diunduh.'); });
      return;
    }
    if (act === 'backup-files') {
      MBJ.toast('Menyiapkan cadangan lengkap…');
      MBJ.exportBackup(true).then(function () { MBJ.toast('Cadangan lengkap diunduh.'); })
        .catch(function () { MBJ.toast('Gagal membuat cadangan.'); });
      return;
    }
  });

  window.addEventListener('hashchange', function () {
    if (MBJ.isAdmin()) render();
  });

  window.renderPage = render;
})();
