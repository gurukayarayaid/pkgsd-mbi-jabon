/* =========================================================
   Pusat berkas: unggah, unduh, pratinjau
   ========================================================= */
(function () {
  'use strict';

  var local = [];
  var state = { q: '', kind: 'all' };
  var urls = [];

  function releaseUrls() {
    urls.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (e) {} });
    urls = [];
  }
  function makeUrl(blob) {
    var u = URL.createObjectURL(blob);
    urls.push(u);
    return u;
  }

  function kindLabel(k) {
    return { image: 'Gambar', video: 'Video', audio: 'Audio', pdf: 'PDF', doc: 'Dokumen', file: 'Berkas' }[k] || 'Berkas';
  }

  function matches(name, kind, note) {
    var q = state.q.trim().toLowerCase();
    if (state.kind !== 'all' && kind !== state.kind) return false;
    if (!q) return true;
    return (String(name) + ' ' + String(note || '')).toLowerCase().indexOf(q) >= 0;
  }

  function thumbFor(kind, name, src) {
    if (kind === 'image' && src) {
      return '<div class="file-card__thumb"><img src="' + MBJ.esc(src) + '" alt="' + MBJ.esc(name) + '" loading="lazy"></div>';
    }
    return '<div class="file-card__thumb">' + MBJ.esc(kindLabel(kind)) + '</div>';
  }

  function localCard(rec) {
    var kind = MBJ.fileKind(rec.type, rec.name);
    var src = kind === 'image' ? makeUrl(rec.blob) : '';
    return '' +
      '<article class="file-card">' +
        thumbFor(kind, rec.name, src) +
        '<div class="file-card__body">' +
          '<div class="file-card__name">' + MBJ.esc(rec.name) + '</div>' +
          '<div class="file-card__meta">' + MBJ.esc(kindLabel(kind)) + ' · ' + MBJ.bytes(rec.size) + ' · ' +
            MBJ.esc(new Date(rec.created || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })) + '</div>' +
          (rec.note ? '<div class="file-card__meta">' + MBJ.esc(rec.note) + '</div>' : '') +
          '<div class="file-card__actions">' +
            '<button type="button" class="btn btn--sm btn--ghost" data-local-open="' + MBJ.esc(rec.id) + '">Buka</button>' +
            '<button type="button" class="btn btn--sm" data-local-download="' + MBJ.esc(rec.id) + '">Unduh</button>' +
            (MBJ.isAdmin() ? '<button type="button" class="btn btn--sm btn--danger" data-local-delete="' + MBJ.esc(rec.id) + '">Hapus</button>' : '') +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function publishedCard(f) {
    var kind = MBJ.fileKind(f.type, f.name || f.url);
    return '' +
      '<article class="file-card">' +
        thumbFor(kind, f.name, kind === 'image' ? f.url : '') +
        '<div class="file-card__body">' +
          '<div class="file-card__name">' + MBJ.esc(f.name || 'Berkas') + '</div>' +
          '<div class="file-card__meta">' + MBJ.esc(kindLabel(kind)) + (f.size ? ' · ' + MBJ.bytes(f.size) : '') + '</div>' +
          (f.note ? '<div class="file-card__meta">' + MBJ.esc(f.note) + '</div>' : '') +
          '<div class="file-card__actions">' +
            '<a class="btn btn--sm btn--ghost" href="' + MBJ.esc(f.url) + '" target="_blank" rel="noopener">Buka</a>' +
            '<a class="btn btn--sm" href="' + MBJ.esc(f.url) + '" download>Unduh</a>' +
            '<button type="button" class="btn btn--sm btn--ghost" data-copy="' + MBJ.esc(MBJ.absoluteUrl(f.url)) + '">Salin tautan</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function filteredLocal() {
    return local.filter(function (r) { return matches(r.name, MBJ.fileKind(r.type, r.name), r.note); });
  }
  function filteredPublished() {
    return (MBJ.state.files || []).filter(function (f) { return matches(f.name, MBJ.fileKind(f.type, f.url), f.note); });
  }

  function renderLists() {
    var localEl = document.getElementById('local-files');
    var pubEl = document.getElementById('published-files');
    if (!localEl || !pubEl) return;
    releaseUrls();

    var lf = filteredLocal();
    localEl.innerHTML = lf.length ? '<div class="file-grid">' + lf.map(localCard).join('') + '</div>' :
      '<div class="empty">Belum ada berkas di perangkat ini. Unggah berkas di atas.</div>';

    var pf = filteredPublished();
    pubEl.innerHTML = pf.length ? '<div class="file-grid">' + pf.map(publishedCard).join('') + '</div>' :
      '<div class="empty">Belum ada berkas terbit. Admin dapat menambahkannya di panel admin.</div>';
  }

  function loadLocal() {
    return MBJ.files.all().then(function (rows) {
      local = rows;
      renderLists();
    });
  }

  function handleFiles(files) {
    if (!files || !files.length) return;
    var names = [];
    MBJ.saveFiles(files).then(function (n) {
      names = Array.prototype.map.call(files, function (f) { return f.name; });
      MBJ.toast(n + ' berkas disimpan di perangkat ini.');
      return loadLocal();
    }).catch(function (err) {
      console.error(err);
      MBJ.toast('Gagal menyimpan berkas: ' + (err && err.message ? err.message : 'penyimpanan penuh'));
    });
  }

  window.renderPage = function () {
    var app = document.getElementById('app');
    var p = MBJ.state.program || {};

    app.innerHTML = '' +
      '<section class="page-head">' +
        '<div class="wrap">' +
          '<div class="crumbs"><a href="index.html">Beranda</a> · Pusat berkas</div>' +
          '<h1>Unggah dan unduh berkas program</h1>' +
          '<p class="page-head__lead">Simpan gambar, video, audio, PDF, dan dokumen pendukung di satu tempat. Setiap berkas dapat dibuka atau diunduh kembali kapan saja.</p>' +
        '</div>' +
      '</section>' +

      '<section class="section section--tight">' +
        '<div class="wrap">' +
          '<div class="dropzone" id="dropzone">' +
            '<div class="dropzone__title">Tarik berkas ke sini</div>' +
            '<p>atau pilih berkas dari perangkat Anda. Semua jenis berkas didukung.</p>' +
            '<div class="dropzone__actions">' +
              '<button type="button" class="btn" id="pick-files">Pilih berkas</button>' +
              '<a class="btn btn--ghost" href="index.html#pertemuan">Kembali ke materi</a>' +
            '</div>' +
            '<input type="file" id="file-input" multiple>' +
          '</div>' +
          '<div class="note-box" style="margin-top:1rem">' +
            'Berkas yang Anda unggah di sini tersimpan di perangkat dan peramban ini, sehingga dapat langsung dibuka dan diunduh kembali. ' +
            'Untuk membagikan berkas kepada semua pengunjung, unggah melalui <a href="admin.html">panel admin</a> lalu terbitkan ke repositori GitHub.' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section section--tight" style="padding-top:0">' +
        '<div class="wrap">' +
          '<div class="toolbar">' +
            '<input type="search" id="file-search" placeholder="Cari nama berkas atau keterangan…" aria-label="Cari berkas">' +
            '<select id="file-kind" aria-label="Saring jenis berkas">' +
              '<option value="all">Semua jenis</option>' +
              '<option value="image">Gambar</option>' +
              '<option value="video">Video</option>' +
              '<option value="audio">Audio</option>' +
              '<option value="pdf">PDF</option>' +
              '<option value="doc">Dokumen kantor</option>' +
              '<option value="file">Lainnya</option>' +
            '</select>' +
            '<span class="small muted" id="file-count"></span>' +
          '</div>' +

          '<div class="section-head" style="margin-bottom:1rem">' +
            '<div><h2 style="font-size:1.25rem">Berkas terbit</h2>' +
            '<p class="small">Berkas yang ditautkan pada situs ini dan dapat diunduh semua pengunjung.</p></div>' +
            '<a class="section-link" href="admin.html">Kelola di admin →</a>' +
          '</div>' +
          '<div id="published-files"><div class="empty">Memuat…</div></div>' +

          '<div class="section-head" style="margin:2.2rem 0 1rem">' +
            '<div><h2 style="font-size:1.25rem">Berkas di perangkat ini</h2>' +
            '<p class="small">Hasil unggahan pada peramban ini — hanya tersedia di perangkat Anda.</p></div>' +
            '<span class="badge badge--soft" id="local-badge">0 berkas</span>' +
          '</div>' +
          '<div id="local-files"><div class="empty">Memuat…</div></div>' +
        '</div>' +
      '</section>';

    // interaksi unggah
    var dz = document.getElementById('dropzone');
    var input = document.getElementById('file-input');
    var pick = document.getElementById('pick-files');

    pick.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function () {
      handleFiles(input.files);
      input.value = '';
    });
    ['dragenter', 'dragover'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.add('is-over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      dz.addEventListener(ev, function (e) { e.preventDefault(); dz.classList.remove('is-over'); });
    });
    dz.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    });
    dz.addEventListener('click', function (e) {
      if (e.target.closest('a') || e.target.closest('button')) return;
      input.click();
    });

    var search = document.getElementById('file-search');
    var kindSelect = document.getElementById('file-kind');
    search.addEventListener('input', function () { state.q = search.value; renderLists(); });
    kindSelect.addEventListener('change', function () { state.kind = kindSelect.value; renderLists(); });

    document.getElementById('app').addEventListener('click', function (e) {
      var open = e.target.closest('[data-local-open]');
      var down = e.target.closest('[data-local-download]');
      var del = e.target.closest('[data-local-delete]');
      var cp = e.target.closest('[data-copy]');
      if (open) {
        var rec = findLocal(open.dataset.localOpen);
        if (rec) MBJ.openLocal(rec);
      }
      if (down) {
        var rec2 = findLocal(down.dataset.localDownload);
        if (rec2) MBJ.downloadLocal(rec2);
      }
      if (del) {
        if (!MBJ.isAdmin()) { MBJ.toast('Hanya admin yang dapat menghapus berkas.'); return; }
        if (!confirm('Hapus berkas ini dari perangkat?')) return;
        MBJ.files.remove(del.dataset.localDelete).then(loadLocal);
      }
      if (cp) {
        MBJ.copy(cp.dataset.copy).then(function (ok) {
          MBJ.toast(ok ? 'Tautan berkas disalin.' : 'Gagal menyalin tautan.');
        });
      }
    });

    function findLocal(id) {
      return local.filter(function (r) { return r.id === id; })[0];
    }

    // jumlah berkas
    var badge = document.getElementById('local-badge');
    var counter = document.getElementById('file-count');
    MBJ.files.all().then(function (rows) {
      local = rows;
      renderLists();
      if (badge) badge.textContent = rows.length + ' berkas';
      if (counter) {
        counter.textContent = (MBJ.state.files || []).length + ' berkas terbit';
      }
    });

    document.title = 'Pusat Berkas · ' + (p.subtitle || 'MBJ');
  };
})();
