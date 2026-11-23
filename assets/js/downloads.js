/* =========================================================
   Halaman Unduh Berkas: daftar berkas per folder + unduh semua
   ========================================================= */
(function () {
  'use strict';

  var META = {
    'BG': { label: 'Buku Guru', desc: 'Panduan umum, kover, dan Bab 1–6 Buku Guru Bahasa Inggris kelas 3.' },
    'BS': { label: 'Buku Siswa', desc: 'Prelim, kover, dan Bab 1–6 Buku Siswa Bahasa Inggris kelas 3.' },
    'INFOGRAFIK-TOPIK-1': { label: 'Infografik Topik 1', desc: 'Poster, panduan teknik, dan materi infografik Topik 1.' },
    'LK': { label: 'Lembar Kerja', desc: 'Lembar kerja peserta untuk 10 pertemuan beserta templat pendukung.' },
    'LK-DONE': { label: 'Lembar Kerja Terisi', desc: 'Contoh lembar kerja yang telah diisi dan direvisi.' },
    'RPP': { label: 'Rencana Pelaksanaan Pembelajaran', desc: 'RPP, bahan tayang, audio, video, dan media pendukung setiap pertemuan.' },
    'RPTM': { label: 'Rencana Pelaksanaan Tatap Muka', desc: 'RPTM dan silabus pembelajaran pertemuan tatap muka.' },
    'SPT': { label: 'Surat Tugas Peserta', desc: 'Surat tugas peserta KKGSD MBI UMSIDA.' },
    'STEP JIGSAW': { label: 'Langkah-Langkah Jigsaw', desc: 'Diagram alur dan langkah penerapan teknik Jigsaw.' }
  };

  var collator = typeof Intl !== 'undefined' && Intl.Collator
    ? new Intl.Collator('id', { numeric: true, sensitivity: 'base' })
    : { compare: function (a, b) { return String(a).localeCompare(String(b)); } };

  var groups = [];
  var refs = {};
  var busy = {};

  function esc(v) { return MBJ.esc(v); }
  function keyOf(name) { return String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function fileUrl(file) {
    return String(file.path).split('/').map(function (part) { return encodeURIComponent(part); }).join('/');
  }
  function extOf(name) {
    var parts = String(name || '').split('.');
    return parts.length > 1 ? parts.pop().toUpperCase().slice(0, 5) : 'FILE';
  }
  function kindOf(file) { return MBJ.fileKind(file.type, file.name || file.path); }
  function folderSize(group) { return group.files.reduce(function (n, f) { return n + (Number(f.size) || 0); }, 0); }

  function normalize(raw) {
    var name = String((raw && raw.name) || '').trim();
    var meta = META[name] || {};
    var files = ((raw && raw.files) || []).map(function (f) {
      return {
        path: String(f.path || ''),
        rel: String(f.rel || f.path || '').replace(/^.*?\//, ''),
        name: String(f.name || f.path || '').split('/').pop(),
        size: Number(f.size) || 0
      };
    }).filter(function (f) { return !!f.path; });
    files.sort(function (a, b) { return collator.compare(a.rel, b.rel); });
    return {
      name: name,
      key: keyOf(name),
      label: meta.label || name,
      desc: meta.desc || '',
      files: files
    };
  }

  function fileRow(file) {
    var kind = kindOf(file);
    var folder = file.rel.indexOf('/') >= 0 ? file.rel.replace(/\/[^/]*$/, '') : '';
    return '' +
      '<div class="dl-file" data-file-row data-hay="' + esc((file.name + ' ' + file.rel).toLowerCase()) + '">' +
        '<span class="dl-file__ext dl-file__ext--' + kind + '">' + esc(extOf(file.name)) + '</span>' +
        '<span class="dl-file__info">' +
          '<span class="dl-file__name">' + esc(file.name) + '</span>' +
          (folder ? '<span class="dl-file__path">' + esc(folder) + '/</span>' : '') +
        '</span>' +
        '<span class="dl-file__size">' + esc(MBJ.bytes(file.size)) + '</span>' +
        '<a class="btn btn--sm btn--ghost" href="' + esc(fileUrl(file)) + '" download="' + esc(file.name) + '">Unduh</a>' +
      '</div>';
  }

  function groupCard(group) {
    var size = folderSize(group);
    var expanded = group.files.length <= 20;
    return '' +
      '<section class="dl-group" data-group="' + esc(group.name) + '" data-key="' + esc(group.key) + '">' +
        '<div class="dl-group__head">' +
          '<div class="dl-group__icon" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>' +
          '</div>' +
          '<div class="dl-group__info">' +
            '<h2>' + esc(group.label) + ' <span class="dl-group__code">' + esc(group.name) + '</span></h2>' +
            (group.desc ? '<p>' + esc(group.desc) + '</p>' : '') +
            '<div class="dl-group__meta"><span>' + group.files.length + ' berkas</span><span>' + esc(MBJ.bytes(size)) + '</span>' +
              (group.files.some(function (f) { return f.rel.indexOf('/') >= 0; }) ? '<span>termasuk subfolder</span>' : '') + '</div>' +
          '</div>' +
          '<div class="dl-group__actions">' +
            '<button type="button" class="btn btn--sm" data-dl-all="' + esc(group.name) + '">Unduh semua (.zip)</button>' +
            '<button type="button" class="btn btn--sm btn--ghost" data-toggle="' + esc(group.key) + '" aria-expanded="' + (expanded ? 'true' : 'false') + '">' +
              (expanded ? 'Sembunyikan daftar' : 'Lihat daftar berkas') + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="dl-progress" data-progress="' + esc(group.key) + '" hidden>' +
          '<div class="dl-progress__text" data-progress-text="' + esc(group.key) + '">Menyiapkan berkas…</div>' +
          '<div class="dl-progress__track"><span data-progress-bar="' + esc(group.key) + '"></span></div>' +
        '</div>' +
        '<div class="dl-files" data-list="' + esc(group.key) + '"' + (expanded ? '' : ' hidden') + '>' +
          group.files.map(fileRow).join('') +
        '</div>' +
      '</section>';
  }

  function setProgress(group, fraction, text) {
    var ref = refs[group.name];
    if (!ref) return;
    var pct = Math.max(0, Math.min(100, Math.round(fraction * 100)));
    ref.bar.style.width = pct + '%';
    ref.text.textContent = text + ' · ' + pct + '%';
  }

  function downloadAll(group) {
    if (busy[group.name]) return;
    if (!window.MBJZip) { MBJ.toast('Pembuat ZIP tidak tersedia.'); return; }
    var ref = refs[group.name];
    busy[group.name] = true;
    ref.button.disabled = true;
    ref.button.textContent = 'Menyiapkan…';
    ref.progress.hidden = false;
    setProgress(group, 0, 'Menyiapkan ' + group.name);

    var last = 0;
    var entries = group.files.map(function (f) { return { path: f.rel, url: fileUrl(f), name: f.name, size: f.size }; });

    MBJZip.createZip(entries, function (p) {
      var now = Date.now();
      if (now - last < 120 && !p.done) return;
      last = now;
      setProgress(group, p.total ? p.loaded / p.total : 0,
        'Mengunduh ' + p.index + '/' + p.count + ' ' + (p.name || ''));
    }).then(function (blob) {
      MBJZip.saveBlob(blob, group.name + '.zip');
      setProgress(group, 1, 'Selesai · ' + MBJ.bytes(blob.size));
      MBJ.toast('Berkas ' + group.name + ' siap diunduh.');
    }).catch(function (err) {
      console.error(err);
      ref.text.textContent = 'Gagal: ' + (err && err.message ? err.message : 'tidak diketahui');
      MBJ.toast('Gagal menyiapkan ZIP. Periksa koneksi lalu coba lagi.');
    }).then(function () {
      busy[group.name] = false;
      ref.button.disabled = false;
      ref.button.textContent = 'Unduh semua (.zip)';
    });
  }

  window.renderPage = function () {
    var app = document.getElementById('app');
    var manifest = window.DOWNLOAD_MANIFEST || {};
    groups = ((manifest.groups || []).map(normalize)).filter(function (g) { return g.files.length; });
    groups.sort(function (a, b) { return collator.compare(a.name, b.name); });

    var totalFiles = groups.reduce(function (n, g) { return n + g.files.length; }, 0);
    var totalSize = groups.reduce(function (n, g) { return n + folderSize(g); }, 0);

    app.innerHTML = '' +
      '<section class="page-head">' +
        '<div class="wrap">' +
          '<div class="crumbs"><a href="index.html">Beranda</a> · Unduh berkas</div>' +
          '<h1>Unduh berkas materi program</h1>' +
          '<p class="page-head__lead">Semua berkas dikumpulkan per folder. Unduh satu berkas melalui tombol <strong>Unduh</strong>, atau gunakan <strong>Unduh semua (.zip)</strong> untuk mendapatkan seluruh isi folder sekaligus.</p>' +
          '<div class="page-head__meta">' +
            '<span class="badge badge--soft">' + groups.length + ' folder</span>' +
            '<span class="badge badge--soft">' + totalFiles + ' berkas</span>' +
            '<span class="badge badge--accent">' + esc(MBJ.bytes(totalSize)) + '</span>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section section--tight">' +
        '<div class="wrap">' +
          '<div class="toolbar">' +
            '<input type="search" id="dl-search" placeholder="Cari nama berkas…" aria-label="Cari berkas materi">' +
            '<span class="small muted" id="dl-count"></span>' +
          '</div>' +
          '<div class="note-box">' +
            'Berkas ZIP dibuat langsung di peramban Anda dari folder asli di situs ini, jadi tidak perlu menunggu unggahan ZIP dari server. ' +
            'Untuk folder besar seperti RPP, biarkan tab tetap terbuka hingga proses unduh selesai.' +
          '</div>' +
          '<div class="dl-groups" id="dl-groups">' +
            (groups.length ? groups.map(groupCard).join('') : '<div class="empty">Daftar berkas belum tersedia. Jalankan <code>scripts/build-downloads.ps1</code> lalu unggah <code>assets/js/downloads-data.js</code>.</div>') +
          '</div>' +
        '</div>' +
      '</section>';

    groups.forEach(function (group) {
      var key = group.key;
      refs[group.name] = {
        key: key,
        section: app.querySelector('[data-group="' + group.name + '"]'),
        button: app.querySelector('[data-dl-all="' + group.name + '"]'),
        toggle: app.querySelector('[data-toggle="' + key + '"]'),
        list: app.querySelector('[data-list="' + key + '"]'),
        progress: app.querySelector('[data-progress="' + key + '"]'),
        text: app.querySelector('[data-progress-text="' + key + '"]'),
        bar: app.querySelector('[data-progress-bar="' + key + '"]')
      };
    });

    var search = document.getElementById('dl-search');
    var counter = document.getElementById('dl-count');
    function applyFilter() {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      groups.forEach(function (group) {
        var visible = 0;
        var ref = refs[group.name];
        Array.prototype.forEach.call(ref.list.querySelectorAll('[data-file-row]'), function (row) {
          var hit = !q || row.dataset.hay.indexOf(q) >= 0;
          row.hidden = !hit;
          if (hit) visible++;
        });
        ref.section.hidden = q && !visible;
        if (q && visible) {
          ref.list.hidden = false;
          ref.toggle.textContent = 'Sembunyikan daftar';
          ref.toggle.setAttribute('aria-expanded', 'true');
        }
        shown += visible;
      });
      counter.textContent = q ? shown + ' berkas cocok' : totalFiles + ' berkas';
    }
    search.addEventListener('input', applyFilter);
    applyFilter();

    app.addEventListener('click', function (e) {
      var all = e.target.closest('[data-dl-all]');
      var toggle = e.target.closest('[data-toggle]');
      if (all) {
        var group = groups.filter(function (g) { return g.name === all.dataset.dlAll; })[0];
        if (group) downloadAll(group);
      }
      if (toggle) {
        var ref = groups.filter(function (g) { return g.key === toggle.dataset.toggle; })[0];
        if (!ref) return;
        var r = refs[ref.name];
        r.list.hidden = !r.list.hidden;
        toggle.setAttribute('aria-expanded', r.list.hidden ? 'false' : 'true');
        toggle.textContent = r.list.hidden ? 'Lihat daftar berkas' : 'Sembunyikan daftar';
      }
    });

    document.title = 'Unduh Berkas · ' + ((MBJ.state.program || {}).subtitle || 'MBJ');
  };
})();
