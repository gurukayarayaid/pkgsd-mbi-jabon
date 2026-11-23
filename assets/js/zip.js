/* =========================================================
   Pembuat berkas ZIP sederhana (metode "store", tanpa kompresi).
   Dipakai halaman Unduh Berkas untuk membungkus banyak berkas
   langsung di peramban, tanpa pustaka eksternal.
   ========================================================= */
(function () {
  'use strict';

  var table = null;

  function crcTable() {
    if (table) return table;
    table = new Uint32Array(256);
    for (var n = 0; n < 256; n++) {
      var c = n;
      for (var k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      table[n] = c >>> 0;
    }
    return table;
  }

  function crcUpdate(bytes, crc) {
    var t = crcTable();
    for (var i = 0; i < bytes.length; i++) crc = (crc >>> 8) ^ t[(crc ^ bytes[i]) & 0xff];
    return crc >>> 0;
  }

  function utf8(text) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text);
    var s = unescape(encodeURIComponent(String(text)));
    var out = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
    return out;
  }

  function zipName(path) {
    return String(path || 'berkas').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\.\./g, '_') || 'berkas';
  }

  function dosStamp(date) {
    var d = date || new Date();
    var year = Math.max(1980, d.getFullYear());
    return {
      time: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
      date: ((year - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()
    };
  }

  function localHeader(name, size, crc, stamp) {
    var buf = new Uint8Array(30 + name.length);
    var v = new DataView(buf.buffer);
    v.setUint32(0, 0x04034b50, true);
    v.setUint16(4, 20, true);          // versi yang dibutuhkan
    v.setUint16(6, 0x0800, true);      // nama berkas UTF-8
    v.setUint16(8, 0, true);           // metode: store
    v.setUint16(10, stamp.time, true);
    v.setUint16(12, stamp.date, true);
    v.setUint32(14, crc, true);
    v.setUint32(18, size, true);
    v.setUint32(22, size, true);
    v.setUint16(26, name.length, true);
    v.setUint16(28, 0, true);
    buf.set(name, 30);
    return buf;
  }

  function centralHeader(name, size, crc, offset, stamp) {
    var buf = new Uint8Array(46 + name.length);
    var v = new DataView(buf.buffer);
    v.setUint32(0, 0x02014b50, true);
    v.setUint16(4, 20, true);          // versi pembuat
    v.setUint16(6, 20, true);          // versi yang dibutuhkan
    v.setUint16(8, 0x0800, true);
    v.setUint16(10, 0, true);
    v.setUint16(12, stamp.time, true);
    v.setUint16(14, stamp.date, true);
    v.setUint32(16, crc, true);
    v.setUint32(20, size, true);
    v.setUint32(24, size, true);
    v.setUint16(28, name.length, true);
    v.setUint16(30, 0, true);          // extra
    v.setUint16(32, 0, true);          // komentar
    v.setUint16(34, 0, true);          // nomor disk
    v.setUint16(36, 0, true);          // atribut internal
    v.setUint32(38, 0, true);          // atribut eksternal
    v.setUint32(42, offset, true);
    buf.set(name, 46);
    return buf;
  }

  function endRecord(count, cdSize, cdOffset) {
    var buf = new Uint8Array(22);
    var v = new DataView(buf.buffer);
    v.setUint32(0, 0x06054b50, true);
    v.setUint16(4, 0, true);
    v.setUint16(6, 0, true);
    v.setUint16(8, count, true);
    v.setUint16(10, count, true);
    v.setUint32(12, cdSize, true);
    v.setUint32(16, cdOffset, true);
    v.setUint16(20, 0, true);
    return buf;
  }

  function lengthOf(parts) {
    var n = 0;
    for (var i = 0; i < parts.length; i++) n += parts[i].length;
    return n;
  }

  /* entries: [{ path: 'nama/di/dalam.zip', url: 'url/berkas' }] */
  function createZip(entries, onProgress) {
    var list = (entries || []).filter(function (e) { return e && e.url; });
    var total = list.reduce(function (n, e) { return n + (Number(e.size) || 0); }, 0);
    var loaded = 0;
    var parts = [];
    var central = [];
    var offset = 0;
    var stamp = dosStamp(new Date());

    function report(index, entry, done) {
      if (typeof onProgress === 'function') {
        onProgress({ loaded: loaded, total: total, index: index + 1, count: list.length, name: entry.name || entry.path, done: done });
      }
    }

    function readStream(res, entry, index) {
      function finish(chunks, crc, size) {
        return { chunks: chunks, crc: (crc ^ 0xffffffff) >>> 0, size: size };
      }
      if (!res.body || typeof res.body.getReader !== 'function') {
        return res.arrayBuffer().then(function (buf) {
          var chunk = new Uint8Array(buf);
          var crc = crcUpdate(chunk, 0xffffffff);
          loaded += chunk.length;
          report(index, entry, false);
          return finish([chunk], crc, chunk.length);
        });
      }
      var reader = res.body.getReader();
      var chunks = [];
      var crc = 0xffffffff;
      var size = 0;
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) return finish(chunks, crc, size);
          var chunk = r.value;
          chunks.push(chunk);
          crc = crcUpdate(chunk, crc);
          size += chunk.length;
          loaded += chunk.length;
          report(index, entry, false);
          return pump();
        });
      }
      return pump();
    }

    var chain = Promise.resolve();
    list.forEach(function (entry, index) {
      chain = chain.then(function () {
        return fetch(entry.url, { cache: 'force-cache' }).then(function (res) {
          if (!res.ok) throw new Error('Gagal mengunduh: ' + (entry.name || entry.path) + ' (HTTP ' + res.status + ')');
          return readStream(res, entry, index);
        }).then(function (data) {
          var name = utf8(zipName(entry.path));
          var head = localHeader(name, data.size, data.crc, stamp);
          var start = offset;
          parts.push(head);
          offset += head.length;
          for (var i = 0; i < data.chunks.length; i++) {
            parts.push(data.chunks[i]);
            offset += data.chunks[i].length;
          }
          central.push(centralHeader(name, data.size, data.crc, start, stamp));
          report(index, entry, true);
        });
      });
    });

    return chain.then(function () {
      var cdSize = lengthOf(central);
      var cdOffset = offset;
      for (var i = 0; i < central.length; i++) parts.push(central[i]);
      parts.push(endRecord(list.length, cdSize, cdOffset));
      return new Blob(parts, { type: 'application/zip' });
    });
  }

  function saveBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || 'unduhan.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }

  window.MBJZip = { createZip: createZip, saveBlob: saveBlob };
})();
