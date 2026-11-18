/* =========================================================
   Data bawaan situs — dapat diubah lewat panel admin.
   ========================================================= */
window.DEFAULT_DATA = {
  program: {
    title: 'Pengembangan Kompetensi Guru Sekolah Dasar',
    subtitle: 'Mengajar Bahasa Inggris',
    kicker: 'Program Pengembangan Kompetensi · 10 Pertemuan',
    facilitator: 'Diah Cahyani',
    venue: 'SMP Negeri 1 Jabon',
    startDate: '2026-11-17',
    endDate: '2026-11-27',
    hours: '07.30 – 15.00 WIB',
    organizer: 'Program Pengembangan Kompetensi Guru Sekolah Dasar',
    description:
      'Ruang belajar bersama bagi guru sekolah dasar untuk merancang, mempraktikkan, dan merefleksikan pembelajaran Bahasa Inggris yang bermakna, menyenangkan, dan sesuai dengan dunia anak. Seluruh materi, rekaman, dan lembar kerja pada program ini dihimpun di situs ini agar mudah dibuka kembali kapan saja.',
    contactEmail: 'guru@sekolah.id',
    contactPhone: ''
  },
  ui: {
    siteName: 'MBJ · Mengajar Bahasa Inggris',
    tagline: 'Ruang materi Program Pengembangan Kompetensi Guru SD',
    announcement: 'Selamat! Situs ini memuat seluruh materi 10 pertemuan, 17–27 November 2026. Materi dapat dibagikan ke WhatsApp, email, Facebook, dan Instagram.',
    footerNote: 'Situs materi program — dikelola oleh peserta dan fasilitator.'
  },
  account: {
    userId: 'admin',
    passwordHash: ''
  },
  files: [
    {
      id: 'berkas-lk-1-docx',
      name: 'Lembar Kerja Pertemuan 1 (DOCX)',
      url: 'assets/unggahan/lembar-kerja-pertemuan-1.docx',
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 200971,
      note: 'Lembar kerja peserta — Pertemuan 1'
    },
    {
      id: 'berkas-lk-1-pdf',
      name: 'Lembar Kerja Pertemuan 1 — Kunci Jawaban (PDF)',
      url: 'assets/unggahan/lembar-kerja-pertemuan-1-kunci-jawaban.pdf',
      type: 'application/pdf',
      size: 192879,
      note: 'Contoh pengisian / kunci jawaban'
    },
    {
      id: 'berkas-bg-panduan',
      name: 'Buku Guru — Panduan Umum',
      url: 'BG/BG%20Panduan%20Umum_BIng%20(watermark).pdf',
      type: 'application/pdf',
      size: 2679983,
      note: 'Panduan umum pembelajaran Bahasa Inggris'
    },
    {
      id: 'berkas-bg-kover',
      name: 'Buku Guru — Kover Kelas 3',
      url: 'BG/Kover%20BG%20B.Inggris%20kls%203%20(watermark).pdf',
      type: 'application/pdf',
      size: 2665506,
      note: 'Sampul Buku Guru Bahasa Inggris Kelas 3'
    },
    {
      id: 'berkas-bg-1',
      name: 'Buku Guru — Bab 1',
      url: 'BG/BG%20Bab%201_BIng%20(watermark).pdf',
      type: 'application/pdf',
      size: 3386758,
      note: 'Bahan rujukan pertemuan awal'
    },
    {
      id: 'berkas-bg-2',
      name: 'Buku Guru — Bab 2',
      url: 'BG/BG%20Bab%202_BIng%20(watermark).pdf',
      type: 'application/pdf',
      size: 2819463,
      note: 'Bahan rujukan'
    },
    {
      id: 'berkas-bg-3',
      name: 'Buku Guru — Bab 3',
      url: 'BG/BG%20Bab%203_BIng%20(watermark).pdf',
      type: 'application/pdf',
      size: 5057992,
      note: 'Bahan rujukan'
    },
    {
      id: 'berkas-bg-4',
      name: 'Buku Guru — Bab 4',
      url: 'BG/BG%20Bab%204_BIng%20(watermark).pdf',
      type: 'application/pdf',
      size: 3821498,
      note: 'Bahan rujukan'
    },
    {
      id: 'berkas-bg-5',
      name: 'Buku Guru — Bab 5',
      url: 'BG/BG%20Bab%205_BIng%20(watermark).pdf',
      type: 'application/pdf',
      size: 3729562,
      note: 'Bahan rujukan'
    },
    {
      id: 'berkas-bg-6',
      name: 'Buku Guru — Bab 6',
      url: 'BG/BG%20Bab%206_BIng%20(watermark).pdf',
      type: 'application/pdf',
      size: 6343097,
      note: 'Bahan rujukan'
    }
  ],
  meetings: [
    {
      id: 'hari-1',
      day: 1,
      date: '2026-11-17',
      title: 'Fondasi: Mengajar Bahasa Inggris di Sekolah Dasar',
      topic: 'Orientasi program, karakteristik anak sebagai pembelajar bahasa, dan target pribadi peserta.',
      objectives: [
        'Memahami tujuan, alur, dan aturan main program 10 pertemuan.',
        'Mengenali karakteristik anak usia SD sebagai pembelajar bahasa asing.',
        'Menyusun target pribadi belajar selama program.'
      ],
      note: '',
      materials: [
        {
          id: 'm1-a',
          type: 'text',
          title: 'Sambutan dan Kerangka Program',
          body: 'Selamat datang di Program Pengembangan Kompetensi Guru Sekolah Dasar — Mengajar Bahasa Inggris. Program berlangsung 10 pertemuan, 17 sampai 27 November 2026, bertempat di SMP Negeri 1 Jabon, dengan fasilitator Diah Cahyani.\n\nSetiap pertemuan berdurasi satu hari penuh dan dirancang dengan pola 30–40–30: sepertiga waktu untuk penguatan konsep, sepertiga untuk latihan terbimbing, dan sepertiga untuk praktik mandiri serta refleksi.\n\nTiga kesepakatan yang kita pegang bersama: hadir utuh dan tepat waktu, berani mencoba walau pengucapan belum sempurna, dan saling memberi umpan balik yang membangun. Kesalahan berbahasa adalah bagian dari proses belajar, bukan hal yang perlu disembunyikan.',
          url: '',
          caption: 'Kerangka program 10 pertemuan'
        },
        {
          id: 'm1-b',
          type: 'text',
          title: 'Empat Prinsip Mengajar Bahasa Inggris untuk Anak',
          body: 'Pertama, makna lebih dulu daripada bentuk. Anak perlu memahami situasi dan tujuan komunikasi sebelum mempelajari pola kalimat.\n\nKedua, pengulangan yang bervariasi. Kosakata baru perlu muncul berkali-kali dalam konteks berbeda — lagu, permainan, cerita, dan rutinitas kelas — agar melekat tanpa terasa membosankan.\n\nKetiga, gerak dan indra. Anak usia SD belajar melalui tubuh: menunjuk, menempel, menyusun, bergerak. Total Physical Response memanfaatkan hal ini.\n\nKeempat, pujian yang spesifik. Daripada sekadar "good", gunakan "I like how you said the word clearly" atau "Your picture matches the sentence" agar anak tahu apa yang sudah benar.',
          url: '',
          caption: 'Ringkasan prinsip pembelajaran'
        },
        {
          id: 'm1-c',
          type: 'image',
          title: 'Peta Alur 10 Pertemuan',
          body: 'Alur program dari fondasi menuju praktik mengajar mandiri. Gambar peta alur dapat diunggah melalui panel admin.',
          url: '',
          caption: 'Peta alur program'
        },
        {
          id: 'm1-d',
          type: 'pdf',
          title: 'Lembar Kerja Pertemuan 1',
          body: 'Lembar kerja peserta Pertemuan 1 beserta contoh pengisiannya. Unduh berkas di bawah, atau ambil versi DOCX di Pusat Berkas bila ingin menyunting.',
          url: 'assets/unggahan/lembar-kerja-pertemuan-1-kunci-jawaban.pdf',
          caption: 'Lembar Kerja Pertemuan 1 dan kunci jawaban (PDF)'
        }
      ]
    },
    {
      id: 'hari-2',
      day: 2,
      date: '2026-11-18',
      title: 'Classroom Language: Kelas yang Berbahasa Inggris',
      topic: 'Bahasa instruksi kelas, rutinitas pembuka, dan membangun kebiasaan berbahasa Inggris sehari-hari.',
      objectives: [
        'Menguasai 60 ungkapan kelas (classroom language) yang paling sering dipakai.',
        'Menyusun rutinitas pembuka dan penutup pelajaran berbahasa Inggris.',
        'Membiasakan instruksi sederhana tanpa terjemahan.'
      ],
      note: '',
      materials: [
        {
          id: 'm2-a',
          type: 'text',
          title: 'Bank Ungkapan Kelas',
          body: 'Membuka pelajaran: "Good morning, everyone." "How are you today?" "Let us start our lesson." "Please sit down and get ready."\n\nMengatur aktivitas: "Listen carefully." "Look at the picture." "Work in pairs." "Stand up, please." "Make a circle." "Show me your book."\n\nMemberi apresiasi: "Well done!" "That is a great try." "Almost there, let us try again." "Give your friend a clap."\n\nMenutup pelajaran: "Let us review what we learned today." "Time is up. See you next week." "Please tidy up your desk."\n\nKuncinya bukan menghafal semuanya, melainkan memilih 10 ungkapan per minggu dan memakainya konsisten sampai otomatis.',
          url: '',
          caption: 'Daftar ungkapan siap pakai'
        },
        {
          id: 'm2-b',
          type: 'text',
          title: 'Rutinitas 5 Menit Pembuka',
          body: 'Menit 1: sapaan dan pertanyaan keadaan, dijawab dengan gerakan tangan (thumbs up, so-so, sleepy).\n\nMenit 2: kalender kelas — "What day is it today?" "How is the weather?"\n\nMenit 3: hitung bersama 1–20 sambil bertepuk, dinaikkan perlahan setiap minggu.\n\nMenit 4: satu pertanyaan pembuka yang sama setiap hari, misalnya "What did you eat for breakfast?" agar anak punya waktu menyiapkan jawaban.\n\nMenit 5: nyanyikan satu lagu kelas sebagai penanda "sekarang kita berbahasa Inggris".',
          url: '',
          caption: 'Rutinitas pembuka'
        },
        {
          id: 'm2-c',
          type: 'pdf',
          title: 'Kartu Ungkapan Kelas (PDF)',
          body: 'Kartu siap cetak berisi 24 ungkapan kelas beserta gambar pendukung. Unggah berkas PDF melalui panel admin atau Pusat Berkas.',
          url: '',
          caption: 'Media cetak pendukung'
        }
      ]
    },
    {
      id: 'hari-3',
      day: 3,
      date: '2026-11-19',
      title: 'Phonics dan Pengucapan: Membaca Awal Bahasa Inggris',
      topic: 'Bunyi huruf, blending, dan strategi memperbaiki pengucapan tanpa membuat anak takut.',
      objectives: [
        'Membedakan nama huruf dan bunyi huruf (letter name vs letter sound).',
        'Mempraktikkan blending sederhana CVC (cat, dog, sun).',
        'Memilih lagu phonics yang sesuai kelas rendah.'
      ],
      note: '',
      materials: [
        {
          id: 'm3-a',
          type: 'text',
          title: 'Nama Huruf dan Bunyi Huruf',
          body: 'Banyak anak hafal "a-b-c-d" tetapi belum bisa membaca "cat". Penyebabnya, mereka mengenal nama huruf, bukan bunyinya. Huruf B bernama "bi", tetapi bunyinya /b/.\n\nLatihan dimulai dari bunyi: guru menampilkan gambar bola, mengucapkan /b/ /b/ /b/ sambil menirukan gerakan memantulkan bola, lalu anak menirukan.\n\nUrutan yang lazim dipakai adalah s, a, t, p, i, n sehingga anak cepat dapat membentuk kata: sat, pin, tan, tap. Setelah itu tambahkan m, d, g, o, c, k.',
          url: '',
          caption: 'Prinsip phonics'
        },
        {
          id: 'm3-b',
          type: 'text',
          title: 'Langkah Blending di Kelas',
          body: '1. Tampilkan dua bunyi: /c/ dan /a/.\n2. Ucapkan terpisah lalu gabungkan sambil tangan "menyapu": c-a → ca.\n3. Tambahkan bunyi akhir: c-a-t → cat.\n4. Tunjukkan gambar kucing dan ucapkan kalimat pendek: "This is a cat."\n5. Ulangi dengan kata lain yang pola bunyinya sama: bat, hat, mat.\n\nGunakan papan tulis kecil atau kartu huruf agar anak bisa memindahkan huruf secara fisik. Batasi 5–7 kata per sesi; lebih baik sedikit dan tuntas.',
          url: '',
          caption: 'Panduan blending'
        },
        {
          id: 'm3-c',
          type: 'video',
          title: 'Contoh Pembelajaran Phonics',
          body: 'Video model pembelajaran phonics di kelas rendah. Tautan YouTube atau Google Drive dapat ditambahkan melalui panel admin.',
          url: '',
          caption: 'Video model'
        }
      ]
    },
    {
      id: 'hari-4',
      day: 4,
      date: '2026-11-20',
      title: 'Kosakata Bermakna: Teknik Presentation–Practice–Production',
      topic: 'Memperkenalkan kosakata baru dengan gambar, permainan, dan penggunaan nyata.',
      objectives: [
        'Merancang tahap presentation, practice, dan production untuk satu topik kosakata.',
        'Menggunakan teknik eliciting dan konsep checking (CCQ).',
        'Menyusun permainan kosakata yang tetap terkendali.'
      ],
      note: '',
      materials: [
        {
          id: 'm4-a',
          type: 'text',
          title: 'Alur PPP dalam 60 Menit',
          body: 'Presentation (15 menit): tampilkan 8–10 kata baru dengan flashcard atau benda nyata. Ucapkan, minta anak menirukan, lalu cek pemahaman dengan pertanyaan "Is this a pencil or a pen?".\n\nPractice (25 menit): kegiatan terkontrol — matching card, "point and say", atau mengisi kalimat rumpang bersama. Guru masih memandu dan mengoreksi.\n\nProduction (20 menit): anak memakai kata dalam tugas bermakna, misalnya "show and tell" benda di tas, atau membuat mini poster "My School Things" lalu mempresentasikannya dalam satu kalimat.\n\nJangan melewati tahap practice; di situlah rasa percaya diri terbentuk sebelum anak diminta berbicara bebas.',
          url: '',
          caption: 'Rancangan sesi PPP'
        },
        {
          id: 'm4-b',
          type: 'text',
          title: 'Tiga Permainan Kosakata Tanpa Alat',
          body: 'Simon Says — melatih pemahaman instruksi dan kosakata gerak. "Simon says, touch your nose."\n\nSlap the Board — tempel gambar di papan, dua anak berlomba menyentuh gambar yang disebut. Cocok untuk kelas besar dengan pembagian kelompok.\n\nWord Hunt — sembunyikan kartu kata di sekitar kelas, anak mencari dan menempelkan pada gambar pasangannya. Melatih membaca sekaligus bergerak.',
          url: '',
          caption: 'Kumpulan permainan'
        },
        {
          id: 'm4-c',
          type: 'image',
          title: 'Contoh Flashcard Kelas',
          body: 'Contoh tata letak flashcard yang bisa dicetak A5 dan dilaminasi.',
          url: '',
          caption: 'Contoh flashcard'
        }
      ]
    },
    {
      id: 'hari-5',
      day: 5,
      date: '2026-11-21',
      title: 'Menyimak dan Berbicara: TPR, Lagu, dan Chant',
      topic: 'Aktivitas lisan yang membuat seluruh kelas aktif dan berani berbicara.',
      objectives: [
        'Menerapkan Total Physical Response pada instruksi kelas.',
        'Memilih lagu dan chant yang relevan dengan tema kosakata.',
        'Mengelola kelas besar saat aktivitas bergerak.'
      ],
      note: '',
      materials: [
        {
          id: 'm5-a',
          type: 'text',
          title: 'Total Physical Response (TPR)',
          body: 'TPR adalah mengajar bahasa melalui perintah dan gerakan. Guru memberi instruksi, anak melakukan tanpa harus berbicara lebih dulu. Contoh: "Stand up. Touch the door. Open your book. Jump three times."\n\nMulai dari 3 perintah, lalu gabungkan menjadi rangkaian. Setelah anak lancar, minta satu anak menjadi pemberi perintah — di titik ini anak sudah berbicara dengan percaya diri.\n\nTPR sangat efektif untuk kelas awal karena menurunkan kecemasan: anak tidak dituntut mengucapkan apa pun di depan kelas sebelum siap.',
          url: '',
          caption: 'Panduan TPR'
        },
        {
          id: 'm5-b',
          type: 'text',
          title: 'Lagu dan Chant: Memilih yang Tepat',
          body: 'Kriteria lagu: melodi sederhana, kosakata sesuai tema, bisa disertai gerakan, dan tidak terlalu cepat.\n\nContoh yang sering dipakai: "Head, Shoulders, Knees and Toes" (anggota tubuh), "Old MacDonald" (hewan dan suara), "The Wheels on the Bus" (gerak dan rutinitas), serta chant hitung berirama untuk angka.\n\nCara memakai: dengarkan sekali, tirukan per baris, ulangi dengan gerakan, lalu bagi kelas menjadi dua kelompok yang saling menyahut. Tutup dengan menghilangkan kata terakhir setiap pengulangan agar anak mengingat tanpa teks.',
          url: '',
          caption: 'Panduan lagu dan chant'
        },
        {
          id: 'm5-c',
          type: 'video',
          title: 'Rekaman Praktik TPR',
          body: 'Video praktik TPR bersama siswa. Tautan dapat ditambahkan melalui panel admin.',
          url: '',
          caption: 'Video praktik'
        }
      ]
    },
    {
      id: 'hari-6',
      day: 6,
      date: '2026-11-23',
      title: 'Membaca dan Menulis Sederhana',
      topic: 'Dari kata ke kalimat: kegiatan membaca terbimbing dan menulis terkontrol.',
      objectives: [
        'Merancang kegiatan membaca berpasangan dengan teks pendek.',
        'Membimbing anak menulis kalimat sederhana berpola.',
        'Menilai tulisan anak secara ramah tanpa mematahkan semangat.'
      ],
      note: 'Catatan jadwal: 22 November 2026 (Minggu) libur, kegiatan dilanjutkan Senin 23 November 2026.',
      materials: [
        {
          id: 'm6-a',
          type: 'text',
          title: 'Membaca Berpasangan (Paired Reading)',
          body: 'Pilih teks 4–6 baris dengan pola berulang, misalnya: "I have a red ball. I have a blue bag. I have a yellow book."\n\nLangkah: guru membaca sekali dengan ekspresif, anak menunjuk kata yang didengar; lalu anak membaca berpasangan, satu membaca satu menyimak, kemudian bertukar peran; terakhir dua pasangan membaca di depan kelas.\n\nTeks berpola membuat anak berhasil membaca lebih cepat, dan keberhasilan itu penting untuk menjaga minat.',
          url: '',
          caption: 'Panduan membaca berpasangan'
        },
        {
          id: 'm6-b',
          type: 'text',
          title: 'Menulis dengan Kerangka Kalimat',
          body: 'Beri kerangka: "I like ______." "My favourite colour is ______." "There are ______ books on the table."\n\nAnak mengisi rumpang, lalu menyalin ke buku dengan rapi. Untuk kelas tinggi, tambahkan satu kalimat bebas: "Because ______."\n\nKoreksi: pilih maksimal dua hal untuk diperbaiki setiap tulisan — misalnya huruf besar di awal kalimat dan tanda titik. Jangan mencoret semua kesalahan; tuliskan satu pujian dan satu saran.',
          url: '',
          caption: 'Panduan menulis terbimbing'
        },
        {
          id: 'm6-c',
          type: 'pdf',
          title: 'Lembar Kerja Membaca dan Menulis',
          body: 'Lembar kerja siap cetak untuk kelas rendah dan kelas tinggi.',
          url: '',
          caption: 'Lembar kerja'
        }
      ]
    },
    {
      id: 'hari-7',
      day: 7,
      date: '2026-11-24',
      title: 'Asesmen Ramah Anak dan Umpan Balik',
      topic: 'Menilai kemajuan berbahasa tanpa membuat anak merasa diuji.',
      objectives: [
        'Membedakan asesmen formatif dan sumatif dalam konteks SD.',
        'Menyusun rubrik sederhana untuk berbicara dan menulis.',
        'Memberi umpan balik yang spesifik dan dapat ditindaklanjuti.'
      ],
      note: '',
      materials: [
        {
          id: 'm7-a',
          type: 'text',
          title: 'Asesmen yang Tidak Terasa Seperti Ujian',
          body: 'Untuk anak SD, bukti belajar paling jujur muncul saat mereka bermain dan bercerita. Gunakan observasi terstruktur: catat 5 anak per hari dengan daftar centang sederhana (mengenali kosakata, merespons instruksi, mencoba berbicara).\n\nAlat bantu lain: portofolio hasil karya (gambar berlabel, lembar kerja, rekaman suara singkat), "show and tell" mingguan, dan permainan yang hasilnya bisa dicatat, misalnya menyebutkan lima benda di dalam tas dalam 30 detik.\n\nHindari tes tertulis panjang untuk kelas rendah. Yang dibutuhkan adalah bukti bahwa anak mau dan mampu mencoba.',
          url: '',
          caption: 'Prinsip asesmen'
        },
        {
          id: 'm7-b',
          type: 'text',
          title: 'Rubrik Sederhana Berbicara',
          body: 'Tiga aspek dengan skala 1–3:\n\nKejelasan — 1: sulit dipahami, 2: cukup jelas dengan bantuan, 3: jelas dan mandiri.\n\nKosakata — 1: satu kata, 2: frasa pendek, 3: kalimat utuh sederhana.\n\nKeberanian — 1: belum mau mencoba, 2: mau setelah diminta, 3: berinisiatif berbicara.\n\nRubrik ini dipakai untuk mengamati, bukan mengurutkan peringkat anak. Fokusnya adalah catatan kemajuan tiap anak dari minggu ke minggu.',
          url: '',
          caption: 'Rubrik penilaian'
        },
        {
          id: 'm7-c',
          type: 'text',
          title: 'Kalimat Umpan Balik yang Menguatkan',
          body: 'Ganti "salah" dengan "almost, try again like this".\n\nSebutkan yang benar lebih dulu: "You remembered the word elephant. Now let us practice the ending sound."\n\nTunjukkan contoh, bukan hanya penilaian: "Listen: I have two cats. Now you say it."\n\nAkhiri dengan satu langkah kecil: "Tomorrow, try to say one full sentence about your family."',
          url: '',
          caption: 'Panduan umpan balik'
        }
      ]
    },
    {
      id: 'hari-8',
      day: 8,
      date: '2026-11-25',
      title: 'Merancang Modul Ajar Bahasa Inggris SD',
      topic: 'Menyusun modul ajar satu pertemuan yang lengkap dan realistis.',
      objectives: [
        'Menyusun modul ajar dengan tujuan, langkah, media, dan asesmen.',
        'Menyelaraskan kegiatan dengan alokasi waktu nyata di kelas.',
        'Mereviu modul ajar rekan sejawat.'
      ],
      note: '',
      materials: [
        {
          id: 'm8-a',
          type: 'text',
          title: 'Anatomi Modul Ajar Satu Pertemuan',
          body: 'Identitas: kelas, tema, alokasi waktu, dan jumlah siswa.\n\nTujuan pembelajaran: satu sampai dua tujuan yang dapat diamati, misalnya "siswa dapat menyebutkan lima nama hewan dan merespons instruksi sederhana".\n\nLangkah pembelajaran: pembuka 10 menit, inti 45 menit, penutup 10 menit. Tuliskan kegiatan guru dan kegiatan siswa secara terpisah agar jelas.\n\nMedia dan sumber: flashcard, lagu, lembar kerja, benda nyata di sekitar kelas.\n\nAsesmen: satu teknik formatif yang dipakai hari itu, beserta catatan siapa yang perlu pendampingan.',
          url: '',
          caption: 'Kerangka modul ajar'
        },
        {
          id: 'm8-b',
          type: 'text',
          title: 'Kesalahan Umum dalam Modul Ajar',
          body: 'Tujuan terlalu banyak. Dua tujuan yang tuntas lebih baik daripada enam tujuan yang setengah jalan.\n\nKegiatan menumpuk di menit terakhir. Hitung ulang waktu nyata, termasuk waktu mengatur kelas.\n\nMedia tidak tersedia. Tulis rencana cadangan tanpa listrik atau tanpa proyektor.\n\nAsesmen tidak sesuai kegiatan. Jika hari itu hanya berbicara, jangan menilai tulisan.',
          url: '',
          caption: 'Daftar periksa'
        },
        {
          id: 'm8-c',
          type: 'pdf',
          title: 'Format Modul Ajar (PDF/DOCX)',
          body: 'Format kosong siap diisi. Unggah berkas melalui Pusat Berkas agar dapat diunduh peserta lain.',
          url: '',
          caption: 'Format kosong'
        }
      ]
    },
    {
      id: 'hari-9',
      day: 9,
      date: '2026-11-26',
      title: 'Media dan Teknologi Sederhana di Kelas',
      topic: 'Memanfaatkan gambar, video pendek, dan permainan digital dengan sumber daya terbatas.',
      objectives: [
        'Memilih media yang benar-benar menambah pemahaman, bukan hanya hiburan.',
        'Membuat media cetak sederhana dari bahan yang tersedia.',
        'Menyiapkan pembelajaran dengan proyektor terbatas atau tanpa listrik.'
      ],
      note: '',
      materials: [
        {
          id: 'm9-a',
          type: 'text',
          title: 'Memilih Media: Tiga Pertanyaan',
          body: 'Apakah media ini membantu anak memahami makna yang sulit dijelaskan kata-kata?\n\nApakah anak akan berbicara atau melakukan sesuatu setelah melihatnya, bukan hanya menonton?\n\nApakah saya bisa menyiapkannya dalam waktu kurang dari 20 menit?\n\nJika satu jawaban tidak, pilih opsi yang lebih sederhana. Flashcard buatan tangan sering lebih efektif daripada video panjang, karena anak bisa menyentuh dan mengurutkannya.',
          url: '',
          caption: 'Panduan memilih media'
        },
        {
          id: 'm9-b',
          type: 'text',
          title: 'Media Cetak dari Bahan Sekitar',
          body: 'Kartu gambar dari kardus bekas dengan gambar tempel atau sketsa spidol.\n\nPapan flanel sederhana: kain flanel ditempel di kardus, gambar diberi perekat di belakang.\n\nKartu kata berpasangan untuk permainan matching, dibuat dua set agar bisa dipakai kelompok besar.\n\nKotak cerita: kotak sepatu berisi benda kecil yang mewakili tokoh cerita, dipakai untuk bercerita berbahasa Inggris sederhana.',
          url: '',
          caption: 'Ide media murah'
        },
        {
          id: 'm9-c',
          type: 'video',
          title: 'Contoh Pemanfaatan Video Pendek',
          body: 'Video pendek 60–90 detik yang diputar dua kali: sekali untuk memahami, sekali untuk menirukan. Tautan dapat ditambahkan lewat panel admin.',
          url: '',
          caption: 'Contoh pemanfaatan video'
        }
      ]
    },
    {
      id: 'hari-10',
      day: 10,
      date: '2026-11-27',
      title: 'Praktik Mengajar, Refleksi, dan Rencana Tindak Lanjut',
      topic: 'Micro-teaching, umpan balik fasilitator, refleksi, dan komitmen pasca program.',
      objectives: [
        'Mempraktikkan satu segmen pembelajaran secara utuh di depan kelompok.',
        'Menerima dan memberi umpan balik berdasarkan rubrik bersama.',
        'Menyusun rencana tindak lanjut 30 hari setelah program.'
      ],
      note: '',
      materials: [
        {
          id: 'm10-a',
          type: 'text',
          title: 'Panduan Micro-teaching 12 Menit',
          body: 'Menit 1–2: pembuka dan penyampaian tujuan dalam bahasa Inggris sederhana.\n\nMenit 3–8: kegiatan inti dengan satu media dan satu aktivitas lisan.\n\nMenit 9–10: pengecekan pemahaman, misalnya meminta dua anak merespons instruksi.\n\nMenit 11–12: penutup dan pujian spesifik.\n\nPengamat mengisi rubrik empat aspek: kejelasan instruksi, keterlibatan siswa, penggunaan bahasa Inggris, dan pengelolaan waktu.',
          url: '',
          caption: 'Panduan praktik'
        },
        {
          id: 'm10-b',
          type: 'text',
          title: 'Refleksi Akhir: Empat Pertanyaan',
          body: 'Apa satu hal yang sekarang saya yakini tentang mengajar bahasa Inggris pada anak SD?\n\nKebiasaan kelas apa yang akan saya mulai minggu depan?\n\nApa yang masih membuat saya ragu, dan siapa yang bisa membantu?\n\nBagaimana saya mengetahui kemajuan anak tanpa tes panjang?',
          url: '',
          caption: 'Lembar refleksi'
        },
        {
          id: 'm10-c',
          type: 'text',
          title: 'Rencana Tindak Lanjut 30 Hari',
          body: 'Minggu 1: menerapkan rutinitas pembuka berbahasa Inggris 5 menit setiap hari.\n\nMinggu 2: mencoba satu permainan kosakata baru dan mencatat respons anak.\n\nMinggu 3: meminta satu rekan mengamati satu sesi, lalu berdiskusi 10 menit.\n\nMinggu 4: mengumpulkan lima hasil karya anak sebagai portofolio dan menuliskan catatan kemajuan.\n\nKomitmen dituliskan, ditempel di meja guru, dan dibagikan ke kelompok WhatsApp peserta agar saling mengingatkan.',
          url: '',
          caption: 'Rencana 30 hari'
        },
        {
          id: 'm10-d',
          type: 'pdf',
          title: 'Sertifikat dan Dokumentasi Program',
          body: 'Dokumentasi penutupan serta daftar hadir 10 pertemuan dapat diunggah di sini.',
          url: '',
          caption: 'Dokumentasi'
        }
      ]
    }
  ]
};
