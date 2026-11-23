/* =========================================================
   Beranda
   ========================================================= */
(function () {
  'use strict';

  function meetingCard(m, idx) {
    var count = (m.materials || []).length;
    return '' +
      '<a class="meeting-card" href="' + MBJ.meetingUrl({ id: m.id }) + '">' +
        '<div class="meeting-card__top">' +
          '<span class="meeting-card__day">Pertemuan ' + MBJ.esc(m.day || idx + 1) + '</span>' +
          '<span class="meeting-card__date">' + MBJ.esc(MBJ.shortDate(m.date)) + '</span>' +
        '</div>' +
        '<h3>' + MBJ.esc(m.title) + '</h3>' +
        '<p>' + MBJ.esc(MBJ.sentences(m.topic, 118)) + '</p>' +
        '<div class="meeting-card__foot">' +
          '<span>' + count + ' materi</span>' +
          '<span class="meeting-card__more">Buka materi →</span>' +
        '</div>' +
      '</a>';
  }

  window.renderPage = function () {
    var s = MBJ.state;
    var p = s.program || {};
    var ui = s.ui || {};
    var meetings = (s.meetings || []).slice().sort(function (a, b) {
      return (a.day || 0) - (b.day || 0) || String(a.date).localeCompare(String(b.date));
    });
    var st = MBJ.programStatus();
    var materialCount = meetings.reduce(function (n, m) { return n + (m.materials || []).length; }, 0);
    var app = document.getElementById('app');

    var facts = [
      ['Fasilitator', p.facilitator || '-'],
      ['Lokasi', p.venue || '-'],
      ['Waktu', p.hours || '-'],
      ['Pertemuan', meetings.length + ' pertemuan · ' + materialCount + ' materi']
    ];

    app.innerHTML = '' +
      '<section class="hero">' +
        '<div class="wrap hero-grid">' +
          '<div>' +
            '<span class="kicker">' + MBJ.esc(p.kicker || 'Program Pengembangan Kompetensi') + '</span>' +
            '<h1>' + MBJ.esc(p.title || '') + ' <em>' + MBJ.esc(p.subtitle || '') + '</em></h1>' +
            '<p class="hero__desc">' + MBJ.esc(p.description || '') + '</p>' +
            '<div class="hero__actions">' +
              '<a class="btn" href="#pertemuan">Lihat 10 pertemuan</a>' +
              '<a class="btn btn--ghost" href="downloads.html">Unduh berkas</a>' +
            '</div>' +
          '</div>' +
          '<aside class="hero-card">' +
            '<div class="hero-card__head">' +
              '<h2 class="hero-card__title">Informasi program</h2>' +
              '<span class="badge badge--' + (st.key === 'live' ? 'live' : st.key === 'done' ? 'done' : 'accent') + '">' + MBJ.esc(st.label) + '</span>' +
            '</div>' +
            '<dl class="fact-list">' +
              facts.map(function (f) {
                return '<div class="fact"><dt>' + MBJ.esc(f[0]) + '</dt><dd>' + MBJ.esc(f[1]) + '</dd></div>';
              }).join('') +
            '</dl>' +
            '<div class="progress">' +
              '<div class="progress__meta"><span>Progres pertemuan</span><span>' + st.done + ' / ' + st.total + '</span></div>' +
              '<div class="progress__track"><div class="progress__bar" style="width:' + st.percent + '%"></div></div>' +
            '</div>' +
            '<p class="small muted" style="margin-top:.9rem">' +
              MBJ.esc(MBJ.fmtDate(p.startDate, { day: 'numeric', month: 'long', year: 'numeric' })) + ' – ' +
              MBJ.esc(MBJ.fmtDate(p.endDate, { day: 'numeric', month: 'long', year: 'numeric' })) +
            '</p>' +
          '</aside>' +
        '</div>' +
      '</section>' +

      '<section class="section" id="pertemuan">' +
        '<div class="wrap">' +
          '<div class="section-head">' +
            '<div>' +
              '<h2>Sepuluh pertemuan, satu alur belajar</h2>' +
              '<p>Setiap pertemuan memuat tujuan pembelajaran, materi bacaan, media pendukung, dan tombol berbagi agar mudah dikirim ke rekan guru.</p>' +
            '</div>' +
            '<a class="section-link" href="downloads.html">Semua berkas →</a>' +
          '</div>' +
          '<div class="meeting-grid">' + meetings.map(meetingCard).join('') + '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section section--soft">' +
        '<div class="wrap">' +
          '<div class="section-head">' +
            '<div>' +
              '<h2>Unduh berkas program</h2>' +
              '<p>Seluruh PDF, dokumen, gambar, audio, dan video pendukung dikelompokkan per folder. Unduh satu berkas atau seluruh isi folder sekaligus.</p>' +
            '</div>' +
            '<a class="btn btn--ghost" href="downloads.html">Buka unduh berkas</a>' +
          '</div>' +
          '<div class="meeting-grid">' +
            '<div class="meeting-card" style="cursor:default">' +
              '<span class="meeting-card__day">Unduh per folder</span>' +
              '<h3>Ambil berkas materi sekaligus</h3>' +
              '<p>Pilih folder materi, lalu unduh semua berkasnya dalam satu ZIP tanpa perlu mengunduh satu per satu.</p>' +
            '</div>' +
            '<div class="meeting-card" style="cursor:default">' +
              '<span class="meeting-card__day">Berbagi</span>' +
              '<h3>Kirim materi lewat WhatsApp, email, Facebook, Instagram</h3>' +
              '<p>Setiap materi memiliki tombol berbagi sendiri, lengkap dengan tautan langsung menuju bagian materi tersebut.</p>' +
            '</div>' +
            '<div class="meeting-card" style="cursor:default">' +
              '<span class="meeting-card__day">Panel admin</span>' +
              '<h3>Kelola seluruh isi situs</h3>' +
              '<p>Tambah pertemuan, sunting teks, ganti gambar atau video, unggah PDF, dan terbitkan perubahan lewat panel admin.</p>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section section--tight">' +
        '<div class="wrap">' +
          '<div class="panel">' +
            '<div class="panel__head">' +
              '<div>' +
                '<h2>Bagikan situs ini</h2>' +
                '<p class="panel__hint" style="margin:0">Kirimkan kepada rekan guru yang membutuhkan materi program.</p>' +
              '</div>' +
            '</div>' +
            MBJ.shareBar({ title: (p.title || '') + ' — ' + (p.subtitle || ''), text: MBJ.sentences(p.description, 140), url: 'index.html' }) +
          '</div>' +
        '</div>' +
      '</section>';
  };
})();
