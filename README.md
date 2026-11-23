# MBJ — Materi Pengembangan Kompetensi Guru SD

Situs materi Program Pengembangan Kompetensi Guru Sekolah Dasar — Mengajar Bahasa Inggris,
10 pertemuan 17–27 November 2026, fasilitator Diah Cahyani, SMP Negeri 1 Jabon.

Situs statis (HTML, CSS, JavaScript tanpa build), siap dipasang di GitHub Pages.

## Halaman

| Berkas | Isi |
| --- | --- |
| `index.html` | Beranda: informasi program, progres, 10 kartu pertemuan, tombol berbagi |
| `pertemuan.html?id=hari-1` | Materi satu pertemuan: tujuan, teks, gambar, video, PDF, tombol berbagi per materi |
| `media.html` | Pusat berkas: unggah (tarik & lepas), cari, saring, buka, unduh |
| `downloads.html` | Unduh berkas per folder (BG, BS, Infografik Topik 1, LK, LK-DONE, RPP, RPTM, SPT, STEP JIGSAW), cari berkas, dan **Unduh semua (.zip)** per folder |
| `admin.html` | Panel admin: dasbor, program, pertemuan & materi, berkas, publikasi, akun |

## Mengelola isi

1. Buka `admin.html`, masuk dengan sandi `alal1010`.
2. Sunting program, pertemuan, atau materi. Perubahan tersimpan sebagai **draf lokal** di peramban.
3. Buka tab **Publikasi** → **Unduh content.json**.
4. Unggah `content.json` ke folder utama repositori (menggantikan berkas lama), lalu tunggu GitHub Pages memperbarui.
5. Segera ganti kata sandi di tab **Akun** setelah penggunaan pertama.

Berkas gambar/video/PDF untuk semua pengunjung: letakkan di `assets/unggahan/`, lalu tautkan
(misalnya `assets/unggahan/lembar-kerja-3.pdf`) dari tab **Berkas** atau dari materi.

Berkas yang sudah tersedia di folder proyek ini:

- `assets/unggahan/` — Lembar Kerja Pertemuan 1 (DOCX) dan kunci jawaban (PDF)
- `BG/` — Buku Guru Bahasa Inggris (Panduan Umum, Kover, Bab 1–6), sudah tertaut di Pusat Berkas
- `LK/` dan `LK-DONE/` — berkas sumber lembar kerja

### Memperbarui halaman Unduh Berkas

Daftar berkas pada `downloads.html` berasal dari `assets/js/downloads-data.js` yang dibuat
dari isi folder materi (folder sementara `.DS_Store` dan `~$…` diabaikan). Setiap kali
menambah, mengganti, atau menghapus berkas di folder tersebut, jalankan:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build-downloads.ps1
```

Lalu unggah `assets/js/downloads-data.js` yang baru ke repositori. Tombol **Unduh semua (.zip)**
mengambil berkas dari folder asli dan merakit ZIP langsung di peramban pengunjung; tidak ada
berkas ZIP besar yang perlu disimpan di repositori.

## Berbagi

Setiap materi memiliki tombol WhatsApp, Email, Facebook, Instagram, dan Salin tautan.
Facebook & WhatsApp memakai tautan resmi sharer; Instagram membuka Instagram dan menyalin
teks materi ke papan klip (Instagram tidak menyediakan tautan berbagi langsung).

## Pasang di GitHub Pages

1. Buat repositori baru di GitHub, unggah seluruh isi folder ini.
2. Buka **Settings → Pages**.
3. Pada *Source*, pilih **Deploy from a branch**, branch `main`, folder `/ (root)`, lalu **Save**.
4. Situs tersedia di `https://NAMA-AKUN.github.io/NAMA-REPO/` setelah 1–2 menit.

Semua tautan bersifat relatif sehingga tetap bekerja di subfolder repositori.
Berkas `.nojekyll` mencegah pemrosesan Jekyll.

## Catatan

- Situs ini murni statis: unggahan dari Pusat Berkas dan draf admin tersimpan di peramban pengguna
  (IndexedDB / localStorage), bukan di server.
- Kata sandi admin adalah gerbang sederhana, bukan pengamanan sisi server. Jangan simpan data sensitif.
- Cadangan: tab **Publikasi** → Unduh cadangan (opsional beserta berkas lokal) untuk memindahkan isi situs.
