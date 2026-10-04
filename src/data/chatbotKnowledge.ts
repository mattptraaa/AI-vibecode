export interface ChatbotEntry {
  id: string;
  gen?: number;
  kw: string[];
  a: string | ((context: { user: string; role: string; roleLabel: string; pjClass?: string }) => string);
}

export const NB_TEXT = 'Info ini dari ringkasan katalog UT. Untuk angka terbaru dan rinciannya, cek Portal Link UT (menu Katalog Mahasiswa).';

export const CHATBOT_KB: ChatbotEntry[] = [
  /* ===== KATALOG UT ===== */
  {
    id: 'katalog',
    gen: 1,
    kw: ['katalog', 'info ut', 'informasi ut', 'tentang ut', 'universitas terbuka', 'layanan ut', 'apa saja layanan'],
    a: 'Ringkasan katalog UT yang aku pahami:\n1. Admisi\n2. Rekognisi Pembelajaran Lampau (RPL)\n3. Registrasi mata kuliah\n4. Biaya SIPAS\n5. Biaya Non-SIPAS\n6. Modus pembelajaran\n7. Praktik dan praktikum\n8. Asesmen hasil belajar (UAS dan TAPS)\n\nTanya salah satunya, misalnya "biaya admisi" atau "syarat RPL".'
  },
  {
    id: 'biaya',
    gen: 1,
    kw: ['biaya', 'bayar', 'tarif', 'harga', 'berapa', 'uang kuliah', 'ukt', 'mahal'],
    a: 'Ringkasan biaya dari katalog:\n- Pendaftaran mahasiswa baru: Rp100.000\n- Pengusulan RPL: Rp300.000\n- SIPAS: Rp1.150.000 sampai Rp3.400.000 per semester (tergantung prodi dan paket)\n- Non-SIPAS: Rp35.000 sampai Rp120.000 per sks, belum termasuk bahan ajar cetak\n- TTM Atpem: Rp150.000 per mata kuliah (minimal 20 mahasiswa)\n- Registrasi ulang TAPS: Rp400.000 sampai Rp750.000\n- Pindah modus/jadwal UO: Rp150.000\n- Registrasi mata kuliah: bayar LIP-R sesuai skema layanan\n\nTanya lebih spesifik, misalnya "biaya SIPAS" atau "biaya TAPS".'
  },
  {
    id: 'admisi',
    kw: ['admisi', 'mahasiswa baru', 'maba', 'pendaftaran mahasiswa', 'daftar kuliah', 'daftar ut', 'pendaftaran', 'syarat masuk', 'ijazah', 'paket c', 'biaya pendaftaran'],
    a: 'ADMISI\nAdmisi adalah proses pencatatan data pribadi calon mahasiswa baru, bisa online atau offline.\n\nSyarat: berijazah SMA/SMK/MA/MAK/Paket C atau sederajat, dan mengunggah atau melengkapi dokumen persyaratan secara digital.\nBiaya pendaftaran mahasiswa baru: Rp100.000.'
  },
  {
    id: 'rpl',
    kw: ['rpl', 'rekognisi', 'pembelajaran lampau', 'pengakuan sks', 'alih kredit', 'pengalaman kerja', 'f02', 'f03', 'f07', 'transfer sks'],
    a: 'REKOGNISI PEMBELAJARAN LAMPAU (RPL)\nRPL adalah pengakuan atas capaian belajar dari pendidikan formal, nonformal, informal, atau pengalaman kerja.\n\nKetentuan:\n- Berasal dari program studi terakreditasi\n- Melengkapi formulir RPL (F02, F03, F07), transkrip, dan bukti pendukung\n- Pengakuan maksimal 70% sks\n\nBiaya pengusulan RPL: Rp300.000.'
  },
  {
    id: 'registrasi',
    kw: ['registrasi mata kuliah', 'registrasi', 'regis', 'lip-r', 'lip r', 'lip', 'ambil mata kuliah', 'maksimal sks', 'beban sks', 'batas sks', 'sks per semester', 'ambil sks'],
    a: 'REGISTRASI MATA KULIAH\nPencatatan mata kuliah yang akan kamu tempuh pada suatu semester.\n\nBeban maksimal:\n- 20 sks per semester (Non-SIPAS semester 1-2)\n- hingga 24 sks (semester 3 ke atas atau SIPAS)\n\nSyarat tambahan: bayar LIP Registrasi (LIP-R) sesuai skema layanan sebelum batas waktu pembayaran.'
  },
  {
    id: 'bedasipas',
    kw: ['beda sipas', 'perbedaan sipas', 'sipas dan non sipas', 'sipas vs non sipas', 'sipas atau non sipas', 'bedanya sipas', 'beda non sipas'],
    a: 'BEDA SIPAS DAN NON-SIPAS\n- SIPAS: paket per semester, mencakup biaya kuliah, bahan ajar, dan layanan akademik tertentu. Varian Non TTM, Semi, Penuh, Plus. Rp1.150.000 sampai Rp3.400.000 per semester.\n- Non-SIPAS: bayar per sks dan kamu memilih sendiri mata kuliahnya. Rp35.000 sampai Rp120.000 per sks, belum termasuk bahan ajar cetak.\n\nBeban sks: Non-SIPAS semester 1-2 maksimal 20 sks; semester 3 ke atas atau SIPAS hingga 24 sks.'
  },
  {
    id: 'nonsipas',
    kw: ['non sipas', 'nonsipas', 'bayar per sks', 'tarif per sks', 'per sks', 'mandiri'],
    a: 'SKEMA BIAYA NON-SIPAS\nLayanan akademik berdasarkan jumlah sks yang kamu ambil sendiri. Kamu memilih mata kuliah per semester.\n\nTarif: Rp35.000 sampai Rp120.000 per sks, belum termasuk biaya bahan ajar cetak.'
  },
  {
    id: 'sipas',
    kw: ['sipas', 'paket semester', 'sistem paket', 'sipas semi', 'sipas penuh', 'sipas plus', 'non ttm', 'paket'],
    a: 'SKEMA BIAYA SIPAS (Sistem Paket Semester)\nMencakup biaya kuliah, bahan ajar, dan layanan akademik tertentu.\n\nVarian: SIPAS Non TTM, Semi, Penuh, dan Plus.\nTarif: Rp1.150.000 sampai Rp3.400.000 per semester, tergantung program studi dan paket.\n\nBedanya dengan Non-SIPAS: SIPAS berupa paket per semester, Non-SIPAS dihitung per sks.'
  },
  {
    id: 'modus',
    kw: ['modus', 'metode belajar', 'cara belajar', 'sistem belajar', 'jarak jauh', 'ttm', 'tatap muka', 'tuton', 'tutorial online', 'tuweb', 'praton', 'bimon', 'blended', 'luring', 'daring', 'atpem', 'tutorial'],
    a: 'MODUS PEMBELAJARAN\nSistem belajar jarak jauh yang fleksibel lewat berbagai media. Pilihannya:\n- Luring: TTM (Tutorial Tatap Muka)\n- Daring: Tuton, Tuweb, Praton, Bimon\n- Blended learning (gabungan)\n\nBiaya tambahan: TTM Atpem Rp150.000 per mata kuliah, dengan syarat minimal 20 mahasiswa.'
  },
  {
    id: 'praktik',
    kw: ['praktik', 'praktikum', 'praktek', 'laboratorium', 'lab', 'silayar', 'laporan praktikum', 'ulang praktikum'],
    a: 'PRAKTIK DAN PRAKTIKUM\nKegiatan menerapkan konsep, pengamatan, atau percobaan laboratorium untuk mata kuliah tertentu.\n\nKetentuan:\n- Wajib diikuti untuk mata kuliah praktik/praktikum (atau berpraktik/berpraktikum)\n- Laporan diunggah ke LMS (silayar atau elearning)\n\nBiaya: sudah termasuk uang kuliah (dalam negeri). Ada tarif registrasi ulang praktik/praktikum kalau kamu mengulang.'
  },
  {
    id: 'uas',
    kw: ['uas', 'ujian', 'utm', 'uo', 'ujian online', 'the', 'taps', 'tugas akhir', 'skripsi', 'proyek', 'artikel ilmiah', 'ukt', 'nilai tutorial', 'skor uas', 'pindah jadwal', 'pindah modus', 'asesmen'],
    a: 'ASESMEN HASIL BELAJAR (UAS dan TAPS)\nEvaluasi hasil belajar lewat UAS (UTM, UO, THE) dan Tugas Akhir Program Sarjana (TAPS).\n\nKetentuan:\n- Skor UAS minimal 30% agar nilai tutorial/praktik diperhitungkan\n- TAPS punya 4 skema: Skripsi, Proyek, Artikel Ilmiah, atau UKT\n\nBiaya:\n- Registrasi ulang TAPS: Rp400.000 sampai Rp750.000\n- Pindah modus/jadwal UO: Rp150.000'
  },

  /* ===== WEB UT FAMILY ===== */
  {
    id: 'tentang',
    kw: ['tentang ut family', 'apa itu ut family', 'siapa ut family', 'komunitas', 'tentang web', 'web ini', 'website ini', 'about', 'tujuan'],
    a: 'UT FAMILY adalah komunitas mahasiswa independen yang membantu mahasiswa UT di mana pun berada. Tujuannya meningkatkan skill dan keterampilan, serta membangun kekeluargaan antar mahasiswa. Jargonnya: No one, we are family.\n\nIkuti kami di Instagram, WhatsApp Channel, Link WA Grup, dan TikTok (menu About).'
  },
  {
    id: 'fitur',
    gen: 1,
    kw: ['fitur', 'menu', 'bisa apa', 'fungsi', 'isi web', 'panduan', 'cara pakai', 'cara menggunakan', 'tutorial web', 'bantuan', 'help'],
    a: 'Fitur UT FAMILY:\n- Home: Feed (posting dan diskusi) dan tab Pengumuman\n- Info Update UT: pengumuman dan kabar terbaru\n- Tools Mahasiswa: Tools Nugas, Cek Sitasi dan Perkiraan Skor AI, Kalkulator Perkiraan Nilai UAS\n- Kegiatan Mahasiswa: kelas webinar (Desain grafis, Public speaking, AI skill)\n- Portal Link UT: link resmi kampus\n- About: info komunitas dan media sosial\n- Profil, notifikasi, cari pengguna, mode gelap, dan chatbot ini'
  },
  {
    id: 'kelas',
    kw: ['kelas', 'kegiatan mahasiswa', 'webinar', 'desain grafis', 'public speaking', 'ai skill', 'pertemuan'],
    a: 'KELAS DI UT FAMILY\nDi menu Kegiatan Mahasiswa ada 3 kelas webinar, masing-masing 3 pertemuan:\n1. Desain grafis\n2. Public speaking\n3. AI skill\n\nIsi tiap kelas (setelah kamu diterima):\n- Postingan kelas: ruang diskusi sesama peserta\n- Forum tanya jawab\n- Materi: berisi pertemuan 1 sampai 3 dan tautan materi\n- Kelola: khusus PJ kelas dan admin'
  },
  {
    id: 'daftarkelas',
    kw: ['daftar kelas', 'pendaftaran kelas', 'ikut kelas', 'gabung kelas', 'masuk kelas', 'keluar kelas', 'batalkan', 'menunggu persetujuan', 'ditolak', 'ajukan lagi', 'daftar webinar'],
    a: 'CARA DAFTAR KELAS\n1. Buka Kegiatan Mahasiswa, lalu klik Daftar di kelas pilihanmu\n2. Statusnya jadi Menunggu persetujuan (bisa dibatalkan)\n3. Penanggung jawab (PJ) kelas atau admin menerima atau menolak\n4. Kalau diterima, kamu bisa membuka kelas\n5. Kalau ditolak, kamu bisa Ajukan lagi'
  },
  {
    id: 'pj',
    kw: ['pj', 'penanggung jawab', 'pj kelas', 'jadi pj', 'kelola kelas', 'terima peserta', 'keluarkan peserta'],
    a: 'PJ KELAS (Penanggung Jawab)\nPJ dipilih admin untuk satu kelas dan hanya berkuasa di kelasnya. Hak PJ:\n- Terima atau tolak permintaan masuk\n- Keluarkan peserta\n- Hapus postingan, komentar, dan pertanyaan kelas\n- Sematkan postingan kelas\n- Tambah dan hapus materi\n- Tangani laporan kelas'
  },
  {
    id: 'peran',
    kw: ['peran', 'role', 'admin', 'moderator', 'member', 'hak', 'wewenang', 'kelola peran', 'moderasi', 'laporan'],
    a: 'PERAN DI UT FAMILY\n- Member: posting, komentar, follow, daftar kelas\n- PJ kelas: mengelola satu kelas (lihat "PJ kelas")\n- Moderator: tulis dan hapus pengumuman, tangani laporan di halaman Moderasi, hapus postingan dan komentar siapa pun, sematkan postingan\n- Admin: semua hak, plus mengatur peran lewat Moderasi > Kelola peran'
  },
  {
    id: 'saya',
    kw: ['peran saya', 'hak saya', 'status saya', 'saya siapa', 'akun saya', 'role saya', 'saya login sebagai'],
    a: (ctx) => {
      if (!ctx.user) return 'Kamu belum masuk (login). Silakan masuk ke akunmu untuk melihat peranmu.';
      const clsName = ctx.pjClass === 'desain' ? 'Desain Grafis' : ctx.pjClass === 'speaking' ? 'Public Speaking' : ctx.pjClass === 'ai' ? 'AI Skill' : '';
      return (
        `Kamu masuk sebagai ${ctx.user} dengan peran ${ctx.roleLabel}${clsName ? ' (Kelas ' + clsName + ')' : ''}.\n` +
        (ctx.role === 'admin'
          ? 'Kamu punya semua hak, termasuk mengatur peran anggota lain di halaman Moderasi.'
          : ctx.role === 'moderator'
          ? 'Kamu bisa mengelola pengumuman, laporan, hapus konten, dan sematkan postingan.'
          : ctx.pjClass
          ? `Kamu mengelola kelas ${clsName}: terima peserta, kelola materi, dan pantau forum.`
          : 'Kamu bisa posting, komentar, follow teman, dan mendaftar kelas di Kegiatan Mahasiswa.')
      );
    }
  },
  {
    id: 'posting',
    kw: ['posting', 'postingan', 'feed', 'topik', 'tuton', 'tips tugas', 'mention', 'tag', 'foto', 'tautan', 'link postingan', 'filter', 'sematkan', 'pin', 'suka', 'like', 'bagikan'],
    a: 'FEED DAN POSTINGAN\n- Tulis di kotak Home, pilih topik: Umum, Tuton, atau Tips tugas\n- Tambah foto (otomatis dikompres aman di browser < 150 KB) atau tautan\n- Ketik @ untuk mention teman di postingan dan komentar\n- Suka, komentar, balas komentar, dan bagikan link postingan\n- Filter topik lewat ikon menu di atas feed\n- Segarkan postingan lewat tombol segarkan atau tarik ke bawah di HP'
  },
  {
    id: 'refresh',
    kw: ['refresh', 'segarkan', 'muat ulang', 'perbarui postingan', 'update postingan', 'postingan baru', 'tarik layar', 'tarik ke bawah'],
    a: 'SEGARKAN POSTINGAN\n- Di Home: klik tombol panah melingkar di kanan atas feed\n- Di kelas: klik tombol Segarkan di tab Postingan kelas\n- Di HP: tarik layar ke bawah saat berada di posisi paling atas'
  },
  {
    id: 'sosial',
    kw: ['follow', 'ikuti', 'pengikut', 'blokir', 'cek akun', 'cari pengguna', 'cari teman', 'notifikasi', 'lonceng', 'bell'],
    a: 'SOSIAL DAN NOTIFIKASI\n- Klik nama pengguna untuk Cek akun atau Blokir akun\n- Ikon kaca pembesar di header untuk mencari teman mahasiswa\n- Ikon lonceng menampilkan notifikasi real-time untuk mention, balasan, dan komentar baru'
  },
  {
    id: 'tools',
    kw: ['tools', 'tools nugas', 'cek sitasi', 'skor ai', 'kalkulator', 'nilai uas', 'perkiraan nilai', 'nugas'],
    a: 'TOOLS MAHASISWA:\n- Tools Nugas: asisten parafrase & perapian ide tugas\n- Cek Sitasi dan Perkiraan Skor AI: uji sitasi APA/Harvard & deteksi redaksi\n- Kalkulator Nilai UAS: hitung simulasi nilai akhir tuton & syarat 30% UAS'
  },
  {
    id: 'portal',
    kw: ['portal', 'myut', 'elearning', 'e-learning', 'kalender akademik', 'ruang baca', 'modul', 'surat keaktifan', 'kelulusan', 'hallo ut', 'link resmi'],
    a: 'PORTAL LINK UT berisi tautan resmi:\n- MyUT (myut.ut.ac.id)\n- Tuton (elearning.ut.ac.id)\n- Kalender Akademik\n- Katalog Mahasiswa\n- Ruang Baca Modul (RBV)\n- Praktikum/Tuweb/TTM (silayar.ut.ac.id)\n- Informasi Kelulusan & Surat Keaktifan\n- Laporan Mahasiswa (hallo-ut.ut.ac.id)'
  }
];

export const SUGGESTED_QUESTIONS = [
  'Biaya kuliah',
  'Syarat admisi',
  'Beda SIPAS dan Non-SIPAS',
  'Cara daftar kelas',
  'Peran saya'
];

function norm(s: string): string {
  return ' ' + String(s).toLowerCase().replace(/[^a-z0-9@ ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
}

function hit(q: string, kw: string): boolean {
  const k = norm(kw).trim();
  return k.length <= 3 ? q.indexOf(' ' + k + ' ') >= 0 : q.indexOf(k) >= 0;
}

export function pickAnswer(
  text: string,
  context: { user: string; role: string; roleLabel: string; pjClass?: string }
): { text: string; chips?: boolean } {
  const q = norm(text);

  if (/^ (halo|hai|hi|hey|assalamualaikum|pagi|siang|sore|malam)( |$)/.test(q)) {
    return {
      text: 'Halo! Aku chatbot asisten UT Family. Aku bisa bantu info katalog UT dan cara pakai web ini. Mau tanya apa?',
      chips: true
    };
  }

  if (/ (terima kasih|makasih|thanks|thx) /.test(q)) {
    return {
      text: 'Sama-sama! Semoga sukses dan semangat kuliahnya kak!'
    };
  }

  let best: ChatbotEntry | null = null;
  let maxScore = 0;
  let genericBest: ChatbotEntry | null = null;
  let genericScore = 0;

  for (const entry of CHATBOT_KB) {
    let score = 0;
    for (const k of entry.kw) {
      if (hit(q, k)) {
        score += norm(k).trim().length;
      }
    }

    if (entry.gen) {
      if (score > genericScore) {
        genericScore = score;
        genericBest = entry;
      }
    } else if (score > maxScore) {
      maxScore = score;
      best = entry;
    }
  }

  const matched = (maxScore > 0 && best) ? best : (genericScore > 0 && genericBest) ? genericBest : null;

  if (!matched) {
    return {
      text: 'Maaf, aku belum punya jawaban untuk pertanyaan itu. Aku memahami ringkasan katalog UT (admisi, RPL, registrasi, biaya, modus belajar, praktikum, UAS dan TAPS) serta fitur web UT Family. Coba pilih saran di bawah:',
      chips: true
    };
  }

  const answerVal = matched.a;
  const rawAnswer = typeof answerVal === 'function' ? answerVal(context) : answerVal;
  const isKatalogTopic = /^(biaya|admisi|rpl|registrasi|bedasipas|nonsipas|sipas|modus|praktik|uas|katalog)$/.test(matched.id);

  return {
    text: isKatalogTopic ? rawAnswer + '\n\n' + NB_TEXT : rawAnswer
  };
}
