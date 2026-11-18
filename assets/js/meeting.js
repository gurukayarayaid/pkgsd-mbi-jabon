/* =========================================================
   Halaman materi per pertemuan
   ========================================================= */
(function () {
  'use strict';

  function sortedMeetings() {
    return (MBJ.state.meetings || []).slice().sort(function (a, b) {
      return (a.day || 0) - (b.day || 0) || String(a.date).localeCompare(String(b.date));
    });
  }

  function findMeeting(id) {
    var list = sortedMeetings();
    var found = list.filter(function (m) { return m.id === id; })[0];
    if (found) return found;
    var num = parseInt(String(id || ''), 10);
    if (!isNaN(num)) return list[num - 1] || null;
    return null;
  }

  function embedSource(url) {
    if (!url) return null;
    var yt = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
    if (yt) return { kind: 'iframe', src: 'https://www.youtube.com/embed/' + yt[1] };
    var drive = String(url).match(/drive\.google\.com\/file\/d\/([\w-]+)/);
    if (drive) return { kind: 'iframe', src: 'https://drive.google.com/file/d/' + drive[1] + '/preview' };
    if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return { kind: 'video', src: url };
    return { kind: 'iframe', src: url };
  }

  function placeholder(title, hint) {
    return '<div class="placeholder"><strong>' + MBJ.esc(title) + '</strong><span>' + MBJ.esc(hint) + '</span></div>';
  }

  function typeLabel(type) {
    return { text: 'Teks', image: 'Gambar', video: 'Video', pdf: 'PDF' }[type] || 'Materi';
  }

  function mediaBlock(m) {
    var type = m.type || 'text';
    if (type === 'image') {
      if (!m.url) return placeholder('Gambar belum ditambahkan', 'Unggah gambar melalui panel admin atau Pusat Berkas.');
      return '<figure class="figure"><img src="' + MBJ.esc(m.url) + '" alt="' + MBJ.esc(m.title || '') + '" loading="lazy">' +
        (m.caption ? '<figcaption>' + MBJ.esc(m.caption) + '</figcaption>' : '') + '</figure>';
    }
    if (type === 'video') {
      if (!m.url) return placeholder('Video belum ditautkan', 'Tambahkan tautan YouTube atau Google Drive melalui panel admin.');
      var src = embedSource(m.url);
      if (!src) return placeholder('Tautan video tidak dikenali', 'Periksa tautan pada panel admin.');
      if (src.kind === 'video') {
        return '<div class="embed"><video controls preload="metadata" src="' + MBJ.esc(src.src) + '"></video></div>';
      }
      return '<div class="embed"><iframe src="' + MBJ.esc(src.src) + '" title="' + MBJ.esc(m.title || 'Video materi') + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe></div>';
    }
    if (type === 'pdf') {
      if (!m.url) return placeholder('Berkas PDF belum diunggah', 'Unggah PDF melalui panel admin, lalu tautkan pada materi ini.');
      return '<div class="download-card">' +
        '<span class="download-card__icon">PDF</span>' +
        '<div class="download-card__meta"><strong>' + MBJ.esc(m.caption || m.title || 'Dokumen PDF') + '</strong><small>Buka di tab baru atau unduh berkas</small></div>' +
        '<a class="btn btn--sm" href="' + MBJ.esc(m.url) + '" target="_blank" rel="noopener">Buka</a>' +
        '<a class="btn btn--sm btn--ghost" href="' + MBJ.esc(m.url) + '" download>Unduh</a>' +
      '</div>';
    }
    return '';
  }

  function materialBlock(m, meeting) {
    var url = MBJ.materialUrl(meeting, m);
    return '' +
      '<article class="material" id="m-' + MBJ.esc(m.id) + '">' +
        '<div class="material__head">' +
          '<span class="type-chip type-chip--' + MBJ.esc(m.type || 'text') + '">' + typeLabel(m.type) + '</span>' +
          '<span class="small muted">' + MBJ.esc(MBJ.shortDate(meeting.date)) + '</span>' +
        '</div>' +
        '<h2>' + MBJ.esc(m.title) + '</h2>' +
        (m.body ? '<div class="material__body">' + MBJ.paragraphs(m.body) + '</div>' : '') +
        mediaBlock(m) +
        (m.caption && m.type !== 'image' ? '<p class="material__caption">' + MBJ.esc(m.caption) + '</p>' : '') +
        MBJ.shareBar({
          title: (m.title || 'Materi') + ' · Pertemuan ' + (meeting.day || '') + ' — ' + (MBJ.state.program.subtitle || ''),
          text: MBJ.sentences(m.body, 150),
          url: url
        }) +
      '</article>';
  }

  window.renderPage = function () {
    var params = new URLSearchParams(location.search);
    var meeting = findMeeting(params.get('id'));
    var app = document.getElementById('app');
    var meetings = sortedMeetings();

    if (!meeting) {
      app.innerHTML = '<section class="section"><div class="wrap"><div class="empty">' +
        '<p><strong>Pertemuan tidak ditemukan.</strong></p>' +
        '<p><a class="btn" href="index.html#pertemuan">Kembali ke daftar pertemuan</a></p>' +
        '</div></div></section>';
      return;
    }

    var idx = meetings.indexOf(meeting);
    var prev = meetings[idx - 1];
    var next = meetings[idx + 1];
    var p = MBJ.state.program || {};
    var materials = meeting.materials || [];

    app.innerHTML = '' +
      '<section class="page-head">' +
        '<div class="wrap">' +
          '<div class="crumbs"><a href="index.html">Beranda</a> · <a href="index.html#pertemuan">10 Pertemuan</a> · Pertemuan ' + MBJ.esc(meeting.day) + '</div>' +
          '<h1>' + MBJ.esc(meeting.title) + '</h1>' +
          '<p class="page-head__lead">' + MBJ.esc(meeting.topic || '') + '</p>' +
          '<div class="page-head__meta">' +
            '<span class="badge">Pertemuan ' + MBJ.esc(meeting.day) + ' dari ' + meetings.length + '</span>' +
            '<span class="badge badge--soft">' + MBJ.esc(MBJ.fmtDate(meeting.date)) + '</span>' +
            '<span class="badge badge--soft">' + materials.length + ' materi</span>' +
            '<span class="badge badge--soft">Fasilitator: ' + MBJ.esc(p.facilitator || '-') + '</span>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<div class="wrap detail-layout">' +
        '<aside class="side">' +
          '<div class="side__title">Daftar pertemuan</div>' +
          '<div class="side__list">' +
            meetings.map(function (m) {
              return '<a class="side__item' + (m.id === meeting.id ? ' is-active' : '') + '" href="' + MBJ.meetingUrl({ id: m.id }) + '">' +
                (m.day || '') + '. ' + MBJ.esc(MBJ.sentences(m.title, 46)) + '</a>';
            }).join('') +
          '</div>' +
          '<div style="margin-top:1.2rem"><a class="btn btn--ghost btn--block btn--sm" href="media.html">Pusat berkas</a></div>' +
        '</aside>' +

        '<div>' +
          (meeting.note ? '<div class="notice">' + MBJ.esc(meeting.note) + '</div>' : '') +
          (meeting.objectives && meeting.objectives.length ?
            '<div class="objective-box"><h2>Tujuan pertemuan</h2><ul>' +
              meeting.objectives.map(function (o) { return '<li>' + MBJ.esc(o) + '</li>'; }).join('') +
            '</ul></div>' : '') +

          (materials.length ? materials.map(function (m) { return materialBlock(m, meeting); }).join('') :
            '<div class="empty">Belum ada materi pada pertemuan ini. Tambahkan melalui panel admin.</div>') +

          '<div class="pager">' +
            (prev ? '<a href="' + MBJ.meetingUrl({ id: prev.id }) + '"><small>← Sebelumnya</small><strong>Pertemuan ' + MBJ.esc(prev.day) + ' · ' + MBJ.esc(MBJ.sentences(prev.title, 40)) + '</strong></a>' : '') +
            (next ? '<a class="is-next" href="' + MBJ.meetingUrl({ id: next.id }) + '"><small>Berikutnya →</small><strong>Pertemuan ' + MBJ.esc(next.day) + ' · ' + MBJ.esc(MBJ.sentences(next.title, 40)) + '</strong></a>' : '') +
          '</div>' +
        '</div>' +
      '</div>';

    if (location.hash && /^#m-/.test(location.hash)) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView({ block: 'start' });
    }

    var title = 'Pertemuan ' + meeting.day + ': ' + meeting.title + ' · ' + (p.subtitle || 'MBJ');
    document.title = title;
  };
})();
