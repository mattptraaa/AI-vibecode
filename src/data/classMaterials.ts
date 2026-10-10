export interface QuizQuestion {
  nomor: number;
  pertanyaan: string;
  pilihan: { opsi: string; teks: string }[];
}

export interface QuizAnswer {
  nomor: number;
  kunci: string;
  pembahasan: string;
}

export interface MeetingPreview {
  id: string;
  classId: string;
  meetingNumber: number;
  title: string;
  isLocked: boolean;
  notice: string;
  tujuan: {
    tujuanPembelajaran: string[];
    rundownWebinar: { menit: string; kegiatan: string }[];
  };
}

export interface MeetingContent {
  referensi: {
    rujukanPertemuan: string;
    lisensiKelas: string;
    daftarPustakaKelas: string[];
  };
  materi: {
    subbab: string;
    konten: string[];
  }[];
  kuis: {
    instruksi: string;
    soal: QuizQuestion[];
  };
}

export interface MeetingAnswers {
  answers: QuizAnswer[];
}

export interface ClassDefinition {
  id: string;
  title: string;
  description: string;
  license: string;
  meetings: {
    preview: MeetingPreview;
    content: MeetingContent;
    answers: MeetingAnswers;
  }[];
}

export const CLASS_MATERIALS: Record<string, ClassDefinition> = {
  desain: {
    id: 'desain',
    title: 'Desain Grafis',
    description: 'Belajar dasar desain grafis lewat 3 pertemuan webinar.',
    license: 'Diadaptasi dari Graphic Design and Print Production Fundamentals oleh Graphic Communications Open Textbook Collective (BCcampus, 2015), lisensi CC BY 4.0. Perubahan: terjemahan ke bahasa Indonesia, peringkasan, penambahan contoh, rundown, dan latihan.',
    meetings: [
      {
        preview: {
          id: 'pertemuan-1',
          classId: 'desain',
          meetingNumber: 1,
          title: 'Elemen visual dan warna',
          isLocked: true,
          notice: 'Kelas belum dimulai. Materi akan dibuka oleh PJ kelas.',
          tujuan: {
            tujuanPembelajaran: [
              'menyebut dan menjelaskan elemen visual dasar: titik, garis, bidang, warna, ruang negatif, tekstur, dan tipografi',
              'membedakan sistem warna RGB dan CMYK serta memahami dampaknya pada media layar dan cetak',
              'memilih huruf sesuai fungsinya sebagai judul atau teks',
              'menerapkan elemen tersebut pada satu poster event sederhana'
            ],
            rundownWebinar: [
              { menit: '0-10', kegiatan: 'Pembukaan, tujuan, polling singkat, review tugas sebelumnya' },
              { menit: '10-40', kegiatan: 'Penyampaian materi inti' },
              { menit: '40-65', kegiatan: 'Praktik poster event di Canva' },
              { menit: '65-80', kegiatan: 'Berbagi hasil dan umpan balik' },
              { menit: '80-90', kegiatan: 'Rekap dan pengumuman tugas' }
            ]
          }
        },
        content: {
          referensi: {
            rujukanPertemuan: 'Graphic Communications Open Textbook Collective. (2015). Graphic design and print production fundamentals. BCcampus. https://opentextbc.ca/graphicdesign/ (bagian 3.2, Visual elements).',
            lisensiKelas: 'Diadaptasi dari Graphic Design and Print Production Fundamentals oleh Graphic Communications Open Textbook Collective (BCcampus, 2015), lisensi CC BY 4.0. Perubahan: terjemahan ke bahasa Indonesia, peringkasan, penambahan contoh, rundown, dan latihan.',
            daftarPustakaKelas: [
              'Graphic Communications Open Textbook Collective. (2015). Graphic design and print production fundamentals. BCcampus. https://opentextbc.ca/graphicdesign/',
              'Ambrose, G., & Harris, P. (2010). Design thinking. AVA Publishing.',
              'Landa, R. (2014). Graphic design solutions (5th ed.). Cengage Learning.',
              'Lupton, E., & Phillips, J. C. (2015). Graphic design: The new basics (2nd ed.). Princeton Architectural Press.',
              'Wagemans, J., Elder, J. H., Kubovy, M., Palmer, S. E., Peterson, M. A., Singh, M., & von der Heydt, R. (2012). A century of Gestalt psychology in visual perception: I. Perceptual grouping and figure-ground organization. Psychological Bulletin, 138(6), 1172-1217. https://doi.org/10.1037/a0029333',
              'Bleicher, S. (2012). Contemporary color: Theory and use (2nd ed.). Cengage Learning. (Buku, bukan jurnal. Periksa edisi.)'
            ]
          },
          materi: [
            {
              subbab: 'Materi 1.1: Desain sebagai komunikasi; titik, garis, dan bidang',
              konten: [
                'Desain sebagai komunikasi\nDesain grafis pada dasarnya adalah cara menyampaikan pesan dan gambar kepada audiens tertentu. Karena itu setiap keputusan visual, mulai dari warna sampai jenis huruf, perlu punya alasan komunikasi, bukan sekadar terlihat bagus. Pertanyaan yang selalu dibawa selama kelas adalah: apa pesannya, siapa yang membaca, dan elemen apa yang membantu pesan itu sampai.\nUntuk membahasnya, bab 3 buku sumber membedakan elemen visual (bahan dasar yang bisa dilihat) dari prinsip komposisi (cara menata bahan itu). Pertemuan ini membahas elemen, sedangkan prinsip komposisi dibahas pada pertemuan 2.',
                'Titik, garis, dan bidang\nTitik adalah posisi pada sebuah bidang dan menjadi unsur dasar dari garis, tekstur, dan bidang. Dalam sebuah desain, titik fokus adalah tempat yang pertama kali dilihat mata, dan biasanya sebaiknya memuat pesan terpenting. Jika tidak ada titik fokus yang jelas, mata pembaca berkeliling tanpa arah.\nGaris menghubungkan dua titik atau menjejak sebuah gerakan. Garis bisa nyata, bisa juga tersirat, misalnya deretan ikon atau foto yang sejajar sehingga mata membaca sebuah garis imajiner. Garis lurus yang panjang cenderung mendominasi tampilan, dan garis yang ditebalkan lama-lama berubah menjadi bidang.\nBidang (bentuk) adalah permukaan datar yang berbatas. Bidang bisa organik atau geometris. Dalam praktik, bidang berguna untuk mengelompokkan elemen dan memisahkan informasi yang tidak berhubungan, misalnya kotak warna di belakang informasi pendaftaran supaya terpisah dari deskripsi acara.'
              ]
            },
            {
              subbab: 'Materi 1.2: Warna dan ruang negatif',
              konten: [
                'Warna: RGB, CMYK, dan palet\nMedia digital menggunakan sistem warna aditif RGB (merah, hijau, biru). Pada sistem ini, tidak adanya warna menghasilkan hitam, dan gabungan semua warna menghasilkan putih. Media cetak menggunakan sistem subtraktif CMYK (cyan, magenta, yellow, dan black), yang bekerja sebaliknya: tanpa tinta menghasilkan warna kertas yang putih, dan gabungan semua tinta mendekati hitam.\nDua sistem ini tidak identik. Warna yang sangat cerah di layar bisa terlihat lebih kusam saat dicetak, sehingga desainer perlu memikirkan sejak awal apakah karyanya akan dilihat di layar atau dicetak. Warna juga dipengaruhi hal-hal lain: cahaya di sekitarnya, warna yang bersebelahan, tekstur permukaan, bahkan perbedaan layar tiap perangkat. Karena itu, sebuah palet sebaiknya dirancang untuk membangun suasana tertentu tanpa bergantung pada satu warna yang sangat spesifik.\nDalam latihan kelas, palet disederhanakan menjadi satu warna utama, satu warna pendukung, dan satu warna aksen. Pola pembagian 60-30-10 untuk proporsinya adalah saran penyusun (tambahan penyusun), bukan bagian dari buku sumber.',
                'Ruang negatif dan hubungan figure/ground\nRuang negatif, atau white space, adalah area tenang di sekitar elemen aktif. Tanpa ruang negatif, elemen utama kehilangan kekuatan karena tidak ada tempat bagi mata untuk beristirahat. Ruang negatif bukan area yang terbuang, tetapi bagian aktif dari komposisi.\nHubungan antara figure (objek) dan ground (latar) dapat dibagi tiga: stabil, bisa dibalik, dan ambigu. Pada hubungan stabil, objek jelas terpisah dari latarnya, seperti blok teks pada halaman. Pada hubungan yang bisa dibalik, dua sisi sama-sama aktif sehingga mata berpindah-pindah di antara keduanya. Pada hubungan ambigu, mata sulit menemukan titik mulai sehingga menimbulkan energi tetapi juga bisa membingungkan. Contoh terkenal pemakaian ruang negatif adalah logo FedEx, yang membentuk panah dari ruang di antara huruf.'
              ]
            },
            {
              subbab: 'Materi 1.3: Tekstur, pola, dan tipografi',
              konten: [
                'Tekstur dan pola\nTekstur adalah kualitas permukaan yang bisa dilihat maupun diraba. Pola dibangun dari titik dan garis yang diatur dalam sebuah grid, dan dapat dibuat dari elemen logo untuk memperkuat identitas. Bahan cetak ikut menentukan kesan: kertas doff umumnya terasa hangat, sedangkan kertas glossy terasa canggih dan tegas. Untuk karya digital, tekstur dipakai dengan hati-hati supaya tidak mengganggu keterbacaan teks.',
                'Tipografi\nTipografi punya dua fungsi utama. Huruf display dipakai untuk menarik perhatian, misalnya pada judul, dan boleh memiliki karakter kuat. Huruf teks dipakai untuk isi, sehingga harus tenang dan nyaman dibaca. Buku sumber mengelompokkan huruf menjadi tujuh kategori historis: blackletter, humanist, old style, transitional, modern, egyptian (slab serif), dan sans serif. Sans serif pada awalnya hanya dipakai untuk judul, tetapi kini umum dipakai juga untuk teks.\nAturan praktis kelas: gunakan paling banyak dua jenis huruf dalam satu desain, dan bangun tiga tingkat teks yaitu judul, subjudul, dan isi. Batas dua jenis huruf ini adalah kesepakatan kelas (tambahan penyusun).'
              ]
            },
            {
              subbab: 'Implementasi',
              konten: [
                'Peserta membuat satu poster event kampus berukuran 1080 x 1350 piksel di Canva dengan langkah berikut.\n1 Buat desain baru berukuran 1080 x 1350 piksel.\n2 Pilih satu warna utama, satu pendukung, dan satu aksen.\n3 Tulis judul kegiatan sebagai titik fokus, dengan ukuran paling besar.\n4 Tambahkan subjudul berisi tanggal, waktu, dan tempat.\n5 Beri ruang kosong yang cukup di sekeliling judul.\n6 Ekspor sebagai PNG, lalu cek tampilannya di layar ponsel.\n7 Bedah desainmu: apakah ada satu titik fokus, teks terbaca jelas, ada ruang kosong, hanya dua jenis huruf, dan palet aman di layar maupun cetak.'
              ]
            },
            {
              subbab: 'Rangkuman',
              konten: [
                '• Titik, garis, dan bidang adalah dasar dari semua komposisi, dan titik fokus harus jelas.\n• RGB untuk layar, CMYK untuk cetak, dan keduanya tidak selalu tampil sama.\n• Ruang negatif memberi kekuatan pada elemen utama.\n• Huruf display untuk judul, huruf teks untuk isi, dan batasi jumlah jenis huruf.'
              ]
            },
            {
              subbab: 'Quest dan tugas',
              konten: [
                '• Quest 1 (20 XP): bedah satu poster pilihanmu, tandai titik fokus, garis, bidang, dan ruang negatif.\n• Quest 2 (20 XP): racik palet 3 warna dan 2 font untuk organisasi imajiner dan jelaskan alasannya.\n• Boss quest (60 XP): poster event kampus 1080 x 1350 piksel dengan satu titik fokus dan ruang negatif yang cukup.'
              ]
            }
          ],
          kuis: {
            instruksi: 'Pilih satu jawaban yang paling tepat.',
            soal: [
              {
                nomor: 1,
                pertanyaan: 'Menurut buku sumber, apa yang dimaksud titik fokus dalam sebuah desain?',
                pilihan: [
                  { opsi: 'a', teks: 'Bagian desain dengan warna paling gelap' },
                  { opsi: 'b', teks: 'Tempat yang pertama kali dilihat mata dan sebaiknya memuat pesan terpenting' },
                  { opsi: 'c', teks: 'Garis terpanjang pada komposisi' },
                  { opsi: 'd', teks: 'Area kosong di sekitar judul' }
                ]
              },
              {
                nomor: 2,
                pertanyaan: 'Sistem warna manakah yang dipakai media digital dan menghasilkan putih bila semua warna digabung?',
                pilihan: [
                  { opsi: 'a', teks: 'CMYK (subtraktif)' },
                  { opsi: 'b', teks: 'Hanya skala abu-abu' },
                  { opsi: 'c', teks: 'Hanya warna primer cat' },
                  { opsi: 'd', teks: 'RGB (aditif)' }
                ]
              },
              {
                nomor: 3,
                pertanyaan: 'Pada hubungan figure/ground yang bisa dibalik, apa yang terjadi?',
                pilihan: [
                  { opsi: 'a', teks: 'Dua sisi sama-sama aktif sehingga mata berpindah di antaranya' },
                  { opsi: 'b', teks: 'Objek selalu jelas terpisah dari latarnya' },
                  { opsi: 'c', teks: 'Mata tidak pernah melihat latarnya' },
                  { opsi: 'd', teks: 'Latar selalu berwarna putih' }
                ]
              },
              {
                nomor: 4,
                pertanyaan: 'Aturan praktis kelas tentang jumlah jenis huruf dalam satu desain adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Minimal lima jenis agar menarik' },
                  { opsi: 'b', teks: 'Satu jenis huruf berbeda untuk tiap paragraf' },
                  { opsi: 'c', teks: 'Paling banyak dua jenis huruf' },
                  { opsi: 'd', teks: 'Tidak ada batas sama sekali' }
                ]
              },
              {
                nomor: 5,
                pertanyaan: 'Mengapa poster yang cerah di layar bisa tampak lebih kusam saat dicetak?',
                pilihan: [
                  { opsi: 'a', teks: 'Kertas selalu mengubah ukuran huruf' },
                  { opsi: 'b', teks: 'Ruang negatif terlalu banyak' },
                  { opsi: 'c', teks: 'Layar memakai RGB dan cetak memakai CMYK yang tidak identik' },
                  { opsi: 'd', teks: 'Logo harus berwarna hitam' }
                ]
              }
            ]
          }
        },
        answers: {
          answers: [
            { nomor: 1, kunci: 'b', pembahasan: 'Tempat yang pertama kali dilihat mata dan sebaiknya memuat pesan terpenting. Titik fokus adalah tempat pertama yang dilihat mata, sehingga paling tepat dipakai untuk pesan terpenting.' },
            { nomor: 2, kunci: 'd', pembahasan: 'RGB (aditif). RGB adalah sistem aditif untuk layar: tanpa warna menghasilkan hitam dan semua warna menghasilkan putih.' },
            { nomor: 3, kunci: 'a', pembahasan: 'Dua sisi sama-sama aktif sehingga mata berpindah di antaranya. Pada hubungan stabil objek jelas terpisah, sedangkan pada yang bisa dibalik kedua sisi sama aktif.' },
            { nomor: 4, kunci: 'c', pembahasan: 'Paling banyak dua jenis huruf. Batas dua jenis huruf adalah kesepakatan kelas (tambahan penyusun), bukan aturan dari buku sumber.' },
            { nomor: 5, kunci: 'c', pembahasan: 'Layar memakai RGB dan cetak memakai CMYK yang tidak identik. Dua sistem warna ini tidak identik, sehingga warna perlu dipikirkan sejak awal sesuai medianya.' }
          ]
        }
      },
      {
        preview: {
          id: 'pertemuan-2',
          classId: 'desain',
          meetingNumber: 2,
          title: 'Prinsip komposisi dan hierarki',
          isLocked: true,
          notice: 'Kelas belum dimulai. Materi akan dibuka oleh PJ kelas.',
          tujuan: {
            tujuanPembelajaran: [
              'menata elemen dengan perataan, kontras, skala, dan keseimbangan yang tepat',
              'membangun hierarki visual dan hierarki tipografi tiga tingkat',
              'menjelaskan prinsip Gestalt dan menerapkan prinsip kedekatan',
              'memilih sistem grid atau sistem organisasi yang sesuai kebutuhan'
            ],
            rundownWebinar: [
              { menit: '0-10', kegiatan: 'Pembukaan, tujuan, polling singkat, review tugas sebelumnya' },
              { menit: '10-40', kegiatan: 'Penyampaian materi inti' },
              { menit: '40-65', kegiatan: 'Redesain poster berantakan dan praktik grid' },
              { menit: '65-80', kegiatan: 'Berbagi hasil dan umpan balik' },
              { menit: '80-90', kegiatan: 'Rekap dan pengumuman tugas' }
            ]
          }
        },
        content: {
          referensi: {
            rujukanPertemuan: 'Graphic Communications Open Textbook Collective. (2015). Graphic design and print production fundamentals. BCcampus. https://opentextbc.ca/graphicdesign/ (bagian 3.3 Compositional principles dan 3.4 Organizational principles).',
            lisensiKelas: 'Diadaptasi dari Graphic Design and Print Production Fundamentals oleh Graphic Communications Open Textbook Collective (BCcampus, 2015), lisensi CC BY 4.0. Perubahan: terjemahan ke bahasa Indonesia, peringkasan, penambahan contoh, rundown, dan latihan.',
            daftarPustakaKelas: [
              'Graphic Communications Open Textbook Collective. (2015). Graphic design and print production fundamentals. BCcampus. https://opentextbc.ca/graphicdesign/',
              'Ambrose, G., & Harris, P. (2010). Design thinking. AVA Publishing.',
              'Landa, R. (2014). Graphic design solutions (5th ed.). Cengage Learning.',
              'Lupton, E., & Phillips, J. C. (2015). Graphic design: The new basics (2nd ed.). Princeton Architectural Press.',
              'Wagemans, J., Elder, J. H., Kubovy, M., Palmer, S. E., Peterson, M. A., Singh, M., & von der Heydt, R. (2012). A century of Gestalt psychology in visual perception: I. Perceptual grouping and figure-ground organization. Psychological Bulletin, 138(6), 1172-1217. https://doi.org/10.1037/a0029333',
              'Bleicher, S. (2012). Contemporary color: Theory and use (2nd ed.). Cengage Learning. (Buku, bukan jurnal. Periksa edisi.)'
            ]
          },
          materi: [
            {
              subbab: 'Materi 2.1: Komposisi, perataan, dan kontras',
              konten: [
                'Mengapa komposisi penting\nKomposisi yang baik menciptakan keteraturan dan mencegah kekacauan visual. Bila semua elemen terlihat sama penting, tidak ada yang menonjol dan pembaca tidak tahu harus mulai dari mana. Buku sumber menegaskan bahwa prinsip komposisi adalah kerangka kerja dan strategi untuk menata elemen lebih baik, bukan penentu hasil akhir: desainer tetap perlu bereksperimen dan menilai hasilnya.',
                'Perataan (alignment)\nPerataan berarti menyejajarkan sisi atas, bawah, samping, atau tengah beberapa elemen. Untuk teks dikenal rata kiri, rata kanan, rata tengah, dan rata kiri-kanan (justify). Grid membantu menentukan kolom dan posisi, sedangkan baseline grid menjaga garis dasar huruf tetap sejajar antarkolom. Di Canva, fitur penggaris dan garis panduan membantu menyejajarkan elemen. Rata kiri umumnya paling aman untuk paragraf karena mata selalu mulai dari titik yang sama (tambahan penyusun).',
                'Kontras\nKontras memperkuat karakter dua elemen yang dipasangkan dan menciptakan titik fokus. Kontras dapat dibuat lewat warna, ukuran, bentuk, atau tekstur. Johannes Itten, seperti dibahas dalam buku sumber, menyebut tujuh jenis kontras warna, antara lain terang-gelap, hangat-dingin, dan komplementer. Sebaliknya, ketika perbedaan antarelemen mengecil, elemen-elelemen itu terasa mirip dan minat visual menurun. Praktik penting: pastikan teks cukup kontras terhadap latarnya agar terbaca, termasuk di layar ponsel.'
              ]
            },
            {
              subbab: 'Materi 2.2: Hierarki, skala, dan Gestalt',
              konten: [
                'Penekanan dan hierarki\nPenekanan menarik mata ke satu titik fokus terlebih dahulu. Hierarki mengatur urutan perhatian: apa yang dilihat pertama, kedua, dan ketiga. Sebuah elemen dapat diberi penekanan lewat ukuran, intensitas warna, kompleksitas, keunikan, dan posisinya. Uji sederhana yang bisa dipakai: pandang desain selama beberapa detik, lalu tanyakan apa yang pertama terlihat. Jika jawabannya bukan pesan terpenting, hierarkinya perlu diperbaiki.',
                'Skala\nVariasi ukuran membuat komposisi dinamis. Jika semua elemen berukuran sama, komposisi terasa datar. Perbedaan skala yang besar cocok untuk konten dramatis dan energik, sedangkan perbedaan yang kecil lebih cocok untuk konten yang profesional atau institusional. Bandingkan poster seminar resmi dengan poster konser untuk melihat perbedaan permainan skalanya.',
                'Prinsip Gestalt\nGestalt berarti keseluruhan yang utuh: pikiran manusia cenderung mengatur informasi visual menjadi kelompok yang bermakna. Buku sumber menyebut enam prinsip: kemiripan, kelanjutan, closure (otak melengkapi bentuk yang tidak utuh), kedekatan, figure/ground, serta simetri dan keteraturan. Penerapan paling praktis adalah kedekatan: elemen yang berdekatan dianggap berhubungan. Karena itu, rapatkan judul dengan subjudulnya dan jauhkan dari blok informasi lain.\nUntuk pembaca yang ingin pembahasan ilmiah tentang pengelompokan persepsi dan figure/ground, Wagemans dkk. (2012) membahasnya di Psychological Bulletin. Artikel itu masuk daftar bacaan lanjutan dan belum dibaca penyusun.'
              ]
            },
            {
              subbab: 'Materi 2.3: Ritme, keseimbangan, grid, dan hierarki tipografi',
              konten: [
                'Ritme, pengulangan, dan keseimbangan\nRitme mengatur tempo visual, terutama pada karya multihalaman atau multislide. Pengulangan menciptakan konsistensi identitas, tetapi pengulangan berlebihan membuat monoton, sehingga perlu jeda dan ruang putih. Pada carousel Instagram misalnya, slide pertama dibuat berbeda untuk menarik perhatian, sementara slide isi memakai warna dan huruf yang sama.\nKeseimbangan dapat dicapai secara simetris atau asimetris. Komposisi simetris terasa stabil dan menenangkan. Komposisi asimetris lebih dinamis: elemen besar dapat diseimbangkan oleh beberapa elemen kecil, dan warna yang intens oleh warna netral. Asimetri tidak memiliki aturan baku, sehingga perlu dicoba dan dinilai.',
                'Grid dan sistem organisasi\nGrid adalah jaringan garis yang mengatur penempatan elemen dan hubungan antarelemen. Grid membagi ruang desain secara vertikal dan horizontal dan menciptakan konsistensi, terutama pada buku dan web, sekaligus mempercepat proses tata letak. Jenis grid yang dibahas buku sumber adalah golden section (rasio 1 : 1,618), single-column, multi-column, hang lines, modular, dan baseline grid. Sebagai contoh, buku puisi memerlukan ruang kosong yang lega, sedangkan koran harus memperlihatkan dengan jelas berita mana yang paling penting.\nSelain grid, ada sistem organisasi lain: axial (elemen tersusun di sisi sumbu, simetris atau digeser), bilateral (simetri cermin yang klasik tetapi mudah membosankan), radial (elemen memancar dari satu titik, teks sulit dibaca sehingga perlu diuji), dilatational (lingkaran yang meluas dari pusat), random atau spontan, dan transitional (lapisan teks membentuk bidang tonal, sering di desain Post Modern ketika suasana lebih penting daripada keterbacaan).',
                'Hierarki tipografi tiga tingkat\nTipografi memiliki dua lapisan informasi, yaitu tampilan (display) dan isi teks, dan keduanya harus diatur agar dibaca berurutan, dengan penekanan yang tepat, mudah dibaca, dan cukup kontras terhadap latar. Strategi yang efektif adalah tiga tingkat: judul untuk menarik pembaca, subjudul untuk membedakan jenis informasi (termasuk keterangan), dan teks isi yang mudah dicerna. Perbedaan antartingkat harus jelas, dan terlalu banyak tingkat justru mengaburkan urutan.'
              ]
            },
            {
              subbab: 'Implementasi',
              konten: [
                'Peserta memperbaiki satu poster yang berantakan dengan langkah berikut.\n1 Ambil satu poster yang menurutmu berantakan (boleh buatanmu sendiri).\n2 Tulis tiga masalah komposisinya, misalnya tidak ada titik fokus, perataan acak, atau kontras teks rendah.\n3 Tetapkan hierarki tiga tingkat: ukuran judul, subjudul, dan teks.\n4 Rapikan perataan memakai penggaris dan garis panduan.\n5 Rapatkan elemen yang berhubungan dan beri jarak pada blok yang berbeda.\n6 Bandingkan versi sebelum dan sesudah, lalu bagikan satu temuan di chat.'
              ]
            },
            {
              subbab: 'Rangkuman',
              konten: [
                '• Perataan, kontras, skala, dan keseimbangan adalah alat untuk membangun hierarki.\n• Hierarki menentukan urutan pandang pembaca.\n• Prinsip kedekatan dari Gestalt: yang berdekatan terbaca berhubungan.\n• Grid membuat tata letak konsisten dan efisien.'
              ]
            },
            {
              subbab: 'Quest dan tugas',
              konten: [
                '• Quest 1 (20 XP): ambil satu poster berantakan, tulis 3 masalah komposisinya beserta solusi.\n• Quest 2 (30 XP): rancang hierarki tiga tingkat untuk poster kegiatan organisasi.\n• Boss quest (50 XP): redesain poster itu dan tampilkan versi sebelum dan sesudahnya.'
              ]
            }
          ],
          kuis: {
            instruksi: 'Pilih satu jawaban yang paling tepat.',
            soal: [
              {
                nomor: 1,
                pertanyaan: 'Menurut buku sumber, apa fungsi prinsip komposisi?',
                pilihan: [
                  { opsi: 'a', teks: 'Kerangka dan strategi menata elemen lebih baik, bukan penentu hasil akhir' },
                  { opsi: 'b', teks: 'Aturan mutlak yang menjamin desain pasti bagus' },
                  { opsi: 'c', teks: 'Pengganti riset tentang audiens' },
                  { opsi: 'd', teks: 'Daftar font yang boleh dipakai' }
                ]
              },
              {
                nomor: 2,
                pertanyaan: 'Prinsip Gestalt manakah yang mendasari saran merapatkan judul dengan subjudulnya?',
                pilihan: [
                  { opsi: 'a', teks: 'Closure: otak melengkapi bentuk tak utuh' },
                  { opsi: 'b', teks: 'Simetri semata' },
                  { opsi: 'c', teks: 'Kemiripan warna semata' },
                  { opsi: 'd', teks: 'Kedekatan: elemen yang berdekatan dianggap berhubungan' }
                ]
              },
              {
                nomor: 3,
                pertanyaan: 'Strategi hierarki tipografi tiga tingkat terdiri dari...',
                pilihan: [
                  { opsi: 'a', teks: 'Judul, logo, dan footer' },
                  { opsi: 'b', teks: 'Judul, subjudul, dan teks isi' },
                  { opsi: 'c', teks: 'Huruf besar, huruf kecil, dan angka' },
                  { opsi: 'd', teks: 'Display, script, dan dekoratif' }
                ]
              },
              {
                nomor: 4,
                pertanyaan: 'Perbedaan skala yang besar paling cocok untuk konten yang...',
                pilihan: [
                  { opsi: 'a', teks: 'Institusional dan sangat formal' },
                  { opsi: 'b', teks: 'Dramatis dan energik' },
                  { opsi: 'c', teks: 'Tidak memiliki titik fokus' },
                  { opsi: 'd', teks: 'Hanya berisi teks panjang' }
                ]
              },
              {
                nomor: 5,
                pertanyaan: 'Grid yang dikaitkan dengan garis dasar huruf agar baris teks sejajar disebut...',
                pilihan: [
                  { opsi: 'a', teks: 'Golden section' },
                  { opsi: 'b', teks: 'Radial' },
                  { opsi: 'c', teks: 'Hang lines' },
                  { opsi: 'd', teks: 'Baseline grid' }
                ]
              }
            ]
          }
        },
        answers: {
          answers: [
            { nomor: 1, kunci: 'a', pembahasan: 'Kerangka dan strategi menata elemen lebih baik, bukan penentu hasil akhir. Buku sumber menekankan bahwa prinsip komposisi adalah kerangka kerja; desainer tetap perlu bereksperimen.' },
            { nomor: 2, kunci: 'd', pembahasan: 'Kedekatan: elemen yang berdekatan dianggap berhubungan. Elemen yang berdekatan terbaca sebagai satu kelompok, jadi judul dan subjudul didekatkan.' },
            { nomor: 3, kunci: 'b', pembahasan: 'Judul, subjudul, dan teks isi. Judul menarik pembaca, subjudul membedakan jenis informasi, dan teks isi mudah dicerna.' },
            { nomor: 4, kunci: 'b', pembahasan: 'Dramatis dan energik. Perbedaan skala besar cocok untuk konten dramatis, sedangkan perbedaan kecil untuk konten profesional atau institusional.' },
            { nomor: 5, kunci: 'd', pembahasan: 'Baseline grid. Baseline grid adalah garis horizontal tempat huruf duduk, biasanya mengikuti leading teks.' }
          ]
        }
      },
      {
        preview: {
          id: 'pertemuan-3',
          classId: 'desain',
          meetingNumber: 3,
          title: 'Proses desain dan proyek akhir',
          isLocked: true,
          notice: 'Kelas belum dimulai. Materi akan dibuka oleh PJ kelas.',
          tujuan: {
            tujuanPembelajaran: [
              'menjelaskan empat tahap proses desain: define, research, develop concepts, dan implement solutions',
              'menyusun brief desain dan melakukan riset sederhana',
              'mengembangkan ide lewat thumbnail, rough, dan comp',
              'mengevaluasi hasil desain terhadap tujuan, dan memahami etika penggunaan aset'
            ],
            rundownWebinar: [
              { menit: '0-10', kegiatan: 'Pembukaan, tujuan, polling singkat, review tugas sebelumnya' },
              { menit: '10-40', kegiatan: 'Penyampaian materi inti' },
              { menit: '40-65', kegiatan: 'Garap paket desain dan konsultasi' },
              { menit: '65-80', kegiatan: 'Berbagi hasil dan umpan balik' },
              { menit: '80-90', kegiatan: 'Rekap dan pengumuman tugas' }
            ]
          }
        },
        content: {
          referensi: {
            rujukanPertemuan: 'Graphic Communications Open Textbook Collective. (2015). Graphic design and print production fundamentals. BCcampus. https://opentextbc.ca/graphicdesign/ (Bab 2, Design process: bagian 2.2 sampai 2.6).',
            lisensiKelas: 'Diadaptasi dari Graphic Design and Print Production Fundamentals oleh Graphic Communications Open Textbook Collective (BCcampus, 2015), lisensi CC BY 4.0. Perubahan: terjemahan ke bahasa Indonesia, peringkasan, penambahan contoh, rundown, dan latihan.',
            daftarPustakaKelas: [
              'Graphic Communications Open Textbook Collective. (2015). Graphic design and print production fundamentals. BCcampus. https://opentextbc.ca/graphicdesign/',
              'Ambrose, G., & Harris, P. (2010). Design thinking. AVA Publishing.',
              'Landa, R. (2014). Graphic design solutions (5th ed.). Cengage Learning.',
              'Lupton, E., & Phillips, J. C. (2015). Graphic design: The new basics (2nd ed.). Princeton Architectural Press.',
              'Wagemans, J., Elder, J. H., Kubovy, M., Palmer, S. E., Peterson, M. A., Singh, M., & von der Heydt, R. (2012). A century of Gestalt psychology in visual perception: I. Perceptual grouping and figure-ground organization. Psychological Bulletin, 138(6), 1172-1217. https://doi.org/10.1037/a0029333',
              'Bleicher, S. (2012). Contemporary color: Theory and use (2nd ed.). Cengage Learning. (Buku, bukan jurnal. Periksa edisi.)'
            ]
          },
          materi: [
            {
              subbab: 'Materi 3.1: Desain sebagai pemecahan masalah dan tahap define',
              konten: [
                'Desain sebagai pemecahan masalah\nBuku sumber memandang desain komunikasi sebagai proses pemecahan masalah: bagaimana menyampaikan informasi secara efektif kepada audiens yang dituju. Prosesnya dapat dijelaskan dengan banyak model, dan buku ini memakai model empat langkah: Define (merumuskan masalah atau peluang), Research (mengumpulkan informasi untuk mendukung keputusan), Develop Concepts (menyusun gagasan dan pendekatan), dan Implement Solutions (mewujudkan konsep menjadi solusi nyata).',
                'Define: merumuskan masalah\nLangkah pertama adalah merumuskan masalah komunikasi dengan tepat. Buku sumber mengutip Charles Kettering bahwa masalah yang dirumuskan dengan baik sudah setengah terpecahkan. Dalam proyek dengan klien, desainer bertemu klien untuk menggali tujuan dan sasaran awal.\nInformasi yang perlu dikumpulkan pada tahap ini pada dasarnya sama dengan isi sebuah brief: bisnis klien dan produk atau layanannya, tujuan jangka panjang, tujuan proyek yang lebih sempit tetapi selaras dengan tujuan bisnis, kriteria kinerja untuk menilai keberhasilan, target audiens dan pesan untuk mereka, konteks (materi korporat yang ada, kebutuhan beberapa format, pedoman identitas), kebutuhan layanan khusus seperti foto dan ilustrasi, aspek cetak seperti jumlah dan distribusi, anggaran, dan pihak yang menyetujui.\nPrinsip kerjanya: jangan berasumsi, banyak bertanya, dokumentasikan diskusi, dan konfirmasi keputusan secara tertulis. Perencanaan di awal membuat proyek berjalan lancar dan minim kejutan. Untuk proyek organisasi mahasiswa, brief lima baris (tujuan, audiens, pesan, ukuran dan tempat pemakaian, tenggat) adalah penyederhanaan dari penyusun (tambahan penyusun).'
              ]
            },
            {
              subbab: 'Materi 3.2: Research dan develop concepts',
              konten: [
                'Research: riset\nInformasi awal dari klien hanyalah titik mulai, sehingga desainer perlu memeriksa asumsi, mengajukan pertanyaan lanjutan, dan memperjelas tujuan. Jenis riset yang dibahas: analisis kompetitor (apa yang dilakukan pesaing beserta kelebihan dan kelemahannya), etnografi (mengamati perilaku dan budaya pengguna), site research (untuk proyek di ruang fisik), riset pasar (perilaku konsumen dan profil demografis), user testing, dan co-creation (pengguna ikut menyumbang ide sebelum konsep).\nRiset minimum yang disarankan: tinjauan literatur, data bisnis klien, informasi audiens (apa yang mereka inginkan, butuhkan, dan harapkan), analisis kompetitor, serta estimasi dan saran teknis dari pihak produksi seperti percetakan. Beberapa alat yang disebut: design audit (analisis visual pesaing yang cara kerjanya mirip SWOT), problem statement, dan concept mapping, yaitu brainstorming non-linear yang menghubungkan ide dalam bentuk peta dengan pertanyaan dasar seperti apa, mengapa, kepada siapa, di mana, kapan, dan bagaimana.\nTeknik merumuskan masalah dari Mark Levy dalam buku ini: nyatakan masalah dalam satu kalimat, ubah menjadi pertanyaan, lalu ulangi pertanyaan dari berbagai sudut dan uji asumsinya sampai terpilih satu pertanyaan akhir sebagai dasar brainstorming. Seluruh riset sebaiknya didokumentasikan dan sumber mentahnya disimpan.',
                'Develop Concepts: mengembangkan konsep\nPada tahap ini ide yang masih kabur dikembangkan menjadi pesan yang jelas yang didukung visual dan konten. Konsep yang baik menyelesaikan masalah desain, mudah diingat, unik, dan membedakan klien dari pesaingnya. Buku sumber menekankan bahwa konsep bukanlah pesan: konsep adalah gagasan yang membingkai pesan agar menarik dan berkesan. Contoh yang disebut adalah slogan Nike yang tetap konsisten meski visualnya berubah.\nTeknik ideasi: concept tree (masalah di tengah, ide turunan dikembangkan berjenjang, semua ide diterima dulu tanpa penilaian), perangkat retorika seperti analogi, metafora, alusi, dan personifikasi, serta model AIDA, yaitu desain harus menarik perhatian, menahan minat, menumbuhkan keinginan, lalu mendorong tindakan.\nTiga bentuk visualisasi: thumbnail (sketsa kecil, minim detail, dibuat banyak untuk eksplorasi dan untuk kepentingan desainer sendiri), rough (sketsa lebih terarah, biasanya tiga sampai lima per konsep, untuk menguji komposisi), dan comp (presentasi mendekati hasil akhir, biasanya digital, untuk persetujuan klien). Buku menyarankan thumbnail digambar tangan karena cepat, menghindari keputusan dini soal huruf dan warna, dan tidak terlihat terlalu jadi sehingga ide dinilai lebih objektif.'
              ]
            },
            {
              subbab: 'Materi 3.3: Implement solutions dan etika aset',
              konten: [
                'Implement Solutions: mewujudkan solusi\nKonsep terpilih dikerjakan sampai menjadi desain final. Pekerjaannya meliputi menata teks dan layout dari naskah yang sudah disetujui, menyelesaikan foto, ilustrasi, dan ikon, menyiapkan file sesuai kebutuhan cetak atau web, serta mengarsipkan seluruh file digital proyek. Pada proyek besar, desainer juga berkoordinasi dengan fotografer, ilustrator, programmer, dan percetakan, membandingkan penawaran, memeriksa proof, dan mengawasi kualitas produksi.\nEvaluasi dilakukan pada setiap tahap berdasarkan tujuan yang sudah ditetapkan. Dua pertanyaan dasarnya: apa yang dicapai oleh suatu keputusan desain, dan seberapa besar kontribusinya terhadap tujuan proyek. Desain yang bagus tetap tidak berguna bila gagal menyampaikan pesan kepada audiens yang tepat. Aspek yang dinilai mencakup komunikasi (pesan utama tersampaikan, teks dan gambar menyatu, sesuai audiens), efisiensi ekonomi (sesuai anggaran), serta kecocokan desain dengan teknologi dan material produksi.',
                'Etika aset dan atribusi\nBagian ini adalah tambahan penyusun, bukan dari Bab 2 buku sumber. Gunakan gambar, ikon, dan font yang lisensinya jelas, dan catat sumbernya. Untuk karya berlisensi CC BY, cantumkan judul karya, pembuat, lisensi, dan perubahan yang kamu buat. Gambar di buku sumber memiliki keterangan lisensi masing-masing, sehingga jangan menyalinnya tanpa membaca keterangannya. Pada layanan seperti Canva atau Unsplash, baca ketentuan lisensi masing-masing sebelum dipakai untuk kepentingan organisasi.'
              ]
            },
            {
              subbab: 'Implementasi',
              konten: [
                'Peserta menyelesaikan satu paket desain (poster, postingan feed, dan cover) dengan alur empat tahap berikut.\n1 Define: isi brief lima baris (tujuan, audiens, pesan utama, tempat pemakaian dan ukuran, tenggat).\n2 Research: kumpulkan enam referensi gambar sebagai moodboard dan catat apa yang ingin ditiru prinsipnya, bukan karyanya.\n3 Develop Concepts: sketsa tiga thumbnail dalam lima menit, lalu pilih satu berdasarkan tujuan dan audiens.\n4 Implement Solutions: buat desain digital, cek hierarki dan kontras, minta umpan balik, lalu revisi.\n5 Cek aset: tulis daftar gambar, ikon, dan font beserta sumber dan lisensinya.\n6 Presentasikan dalam 1 menit dengan format Tujuan - Audiens - Keputusan - Perbaikan.'
              ]
            },
            {
              subbab: 'Rangkuman',
              konten: [
                '• Desain adalah pemecahan masalah dengan empat tahap: define, research, develop concepts, implement solutions.\n• Brief dan riset yang baik membuat keputusan visual punya alasan.\n• Thumbnail, rough, dan comp membantu menguji ide sebelum dikerjakan penuh.\n• Evaluasi selalu dikembalikan pada tujuan proyek, dan aset harus dipakai sesuai lisensinya.'
              ]
            },
            {
              subbab: 'Quest dan tugas',
              konten: [
                '• Quest 1 (30 XP): isi brief lima baris dan buat moodboard untuk proyekmu.\n• Quest 2 (30 XP): tulis daftar aset yang dipakai beserta sumber dan lisensinya.\n• Boss quest (90 XP): kumpulkan paket final (poster, feed, cover) dan presentasikan selama 1 menit.'
              ]
            }
          ],
          kuis: {
            instruksi: 'Pilih satu jawaban yang paling tepat.',
            soal: [
              {
                nomor: 1,
                pertanyaan: 'Empat tahap proses desain dalam buku sumber adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Define, Research, Develop Concepts, Implement Solutions' },
                  { opsi: 'b', teks: 'Sketch, Print, Publish, Archive' },
                  { opsi: 'c', teks: 'Brief, Sign, Pay, Deliver' },
                  { opsi: 'd', teks: 'Plan, Do, Check, Act' }
                ]
              },
              {
                nomor: 2,
                pertanyaan: 'Kutipan Kettering dalam buku sumber menyatakan bahwa masalah yang dirumuskan dengan baik...',
                pilihan: [
                  { opsi: 'a', teks: 'Tidak memerlukan riset' },
                  { opsi: 'b', teks: 'Pasti selesai tepat waktu' },
                  { opsi: 'c', teks: 'Sudah setengah terpecahkan' },
                  { opsi: 'd', teks: 'Hanya cocok untuk proyek cetak' }
                ]
              },
              {
                nomor: 3,
                pertanyaan: 'Thumbnail, rough, dan comp berbeda dalam hal...',
                pilihan: [
                  { opsi: 'a', teks: 'Ukuran kertas saja' },
                  { opsi: 'b', teks: 'Jenis percetakan' },
                  { opsi: 'c', teks: 'Tingkat kematangan visualisasi, dari sketsa kecil untuk eksplorasi sampai presentasi mendekati final' },
                  { opsi: 'd', teks: 'Jumlah warna tinta' }
                ]
              },
              {
                nomor: 4,
                pertanyaan: 'Model AIDA menyatakan desain harus...',
                pilihan: [
                  { opsi: 'a', teks: 'Menarik perhatian, menahan minat, menumbuhkan keinginan, lalu mendorong tindakan' },
                  { opsi: 'b', teks: 'Aman, Indah, Diterima, Aktual' },
                  { opsi: 'c', teks: 'Hanya menarik perhatian' },
                  { opsi: 'd', teks: 'Menjelaskan semua detail produk lebih dahulu' }
                ]
              },
              {
                nomor: 5,
                pertanyaan: 'Pada tahap implement solutions, evaluasi dilakukan dengan...',
                pilihan: [
                  { opsi: 'a', teks: 'Menanyakan selera pribadi desainer saja' },
                  { opsi: 'b', teks: 'Membandingkan jumlah elemen' },
                  { opsi: 'c', teks: 'Memilih warna favorit klien' },
                  { opsi: 'd', teks: 'Menilai keputusan desain terhadap tujuan yang sudah ditetapkan' }
                ]
              }
            ]
          }
        },
        answers: {
          answers: [
            { nomor: 1, kunci: 'a', pembahasan: 'Define, Research, Develop Concepts, Implement Solutions. Keempatnya dibahas pada bagian 2.2 sampai 2.6 buku sumber.' },
            { nomor: 2, kunci: 'c', pembahasan: 'Sudah setengah terpecahkan. Karena itu tahap define sangat penting.' },
            { nomor: 3, kunci: 'c', pembahasan: 'Tingkat kematangan visualisasi, dari sketsa kecil untuk eksplorasi sampai presentasi mendekati final. Thumbnail untuk eksplorasi, rough menguji komposisi, dan comp untuk persetujuan klien.' },
            { nomor: 4, kunci: 'a', pembahasan: 'Menarik perhatian, menahan minat, menumbuhkan keinginan, lalu mendorong tindakan. AIDA adalah singkatan dari attention, interest, desire, action.' },
            { nomor: 5, kunci: 'd', pembahasan: 'Menilai keputusan desain terhadap tujuan yang sudah ditetapkan. Dua pertanyaan dasarnya: apa yang dicapai keputusan desain dan seberapa besar kontribusinya terhadap tujuan proyek.' }
          ]
        }
      }
    ]
  },
  speaking: {
    id: 'speaking',
    title: 'Public Speaking',
    description: 'Latihan public speaking lewat 3 pertemuan webinar.',
    license: 'Diadaptasi dari Principles of Public Speaking oleh Katie G. Gruber (2022), lisensi CC BY-NC-SA 4.0. Perubahan: terjemahan, peringkasan, penambahan contoh, rundown, dan latihan. Karena lisensi NC-SA, bahan ini hanya untuk penggunaan non-komersial dan harus dibagikan dengan lisensi yang sama.',
    meetings: [
      {
        preview: {
          id: 'pertemuan-1',
          classId: 'speaking',
          meetingNumber: 1,
          title: 'Audiens dan persiapan',
          isLocked: true,
          notice: 'Kelas belum dimulai. Materi akan dibuka oleh PJ kelas.',
          tujuan: {
            tujuanPembelajaran: [
              'menjelaskan mengapa berbicara di depan umum berpusat pada audiens',
              'menganalisis audiens dari lima sudut: situasional, demografis, psikologis, multikultural, serta minat dan pengetahuan awal',
              'merumuskan tujuan khusus dan kalimat tesis pidato',
              'menerapkan cara dasar mengelola rasa gugup dengan napas dan pemanasan suara'
            ],
            rundownWebinar: [
              { menit: '0-10', kegiatan: 'Pembukaan, tujuan, polling singkat, review tugas sebelumnya' },
              { menit: '10-40', kegiatan: 'Penyampaian materi inti' },
              { menit: '40-65', kegiatan: 'Analisis audiens dan perkenalan 1 menit' },
              { menit: '65-80', kegiatan: 'Berbagi hasil dan umpan balik' },
              { menit: '80-90', kegiatan: 'Rekap dan pengumuman tugas' }
            ]
          }
        },
        content: {
          referensi: {
            rujukanPertemuan: 'Gruber, K. G. (2022). Principles of public speaking. Pressbooks. https://mtsu.pressbooks.pub/principlesofpublicspeaking/ (bab analisis audiens dan bab penyampaian pidato).',
            lisensiKelas: 'Diadaptasi dari Principles of Public Speaking oleh Katie G. Gruber (2022), lisensi CC BY-NC-SA 4.0. Perubahan: terjemahan, peringkasan, penambahan contoh, rundown, dan latihan. Karena lisensi NC-SA, bahan ini hanya untuk penggunaan non-komersial dan harus dibagikan dengan lisensi yang sama.',
            daftarPustakaKelas: [
              'Gruber, K. G. (2022). Principles of public speaking. Pressbooks. https://mtsu.pressbooks.pub/principlesofpublicspeaking/',
              'Bodie, G. D. (2010). A racing heart, rattling knees, and ruminative thoughts: Defining, explaining, and treating public speaking anxiety. Communication Education, 59(1), 70-105. https://doi.org/10.1080/03634520903443849',
              'Lucas, S. E. (2020). The art of public speaking (13th ed.). McGraw-Hill Education.',
              "O'Hair, D., Rubenstein, H., & Stewart, R. (2018). A pocket guide to public speaking (6th ed.). Bedford/St. Martin's.",
              'Burgoon, J. K., Guerrero, L. K., & Floyd, K. (2016). Nonverbal communication. Routledge. https://doi.org/10.4324/9781315663425'
            ]
          },
          materi: [
            {
              subbab: 'Materi 1.1: Audiens dan lima sudut analisis',
              konten: [
                'Audiens adalah alasan pidato\nDalam pandangan buku sumber, audiens adalah alasan seseorang berpidato, sehingga audiens menjadi komponen terpenting dari seluruh proses. Pendekatannya disebut berpusat pada audiens: persiapan dimulai dari pertanyaan siapa yang akan mendengar, bukan dari apa yang ingin dikatakan pembicara. Pembicara yang baik menyesuaikan topik, contoh, bahasa, dan kedalaman penjelasan dengan kebutuhan pendengarnya.',
                'Lima sudut analisis audiens\nBab tentang analisis audiens membagi analisis menjadi lima sudut. Pertama, situasional: acara apa yang sedang berlangsung, berapa orang yang hadir, kapan dan di mana, serta berapa lama waktu berbicara. Sebuah webinar kampus di malam hari berbeda dengan rapat organisasi siang hari, dan perbedaan itu memengaruhi gaya berbicara.\nKedua, demografis: karakteristik seperti usia, pendidikan, dan latar belakang. Ketiga, psikologis: sikap, keyakinan, dan nilai yang dimiliki audiens terhadap topik, apakah mendukung, ragu, atau menolak. Keempat, multikultural: jangan berasumsi bahwa audiens memiliki keyakinan dan kebiasaan yang sama denganmu. Kelima, minat dan pengetahuan awal: seberapa tertarik dan seberapa paham mereka, sehingga istilah teknis dijelaskan seperlunya, terutama bila audiens berasal dari jurusan berbeda.'
              ]
            },
            {
              subbab: 'Materi 1.2: Metode analisis, tujuan khusus, dan tesis',
              konten: [
                'Tiga cara menganalisis audiens\nBuku sumber menyebut tiga metode: observasi langsung (memperhatikan audiens), inferensi (menyimpulkan dari informasi yang sudah ada), dan pengumpulan data lewat survei audiens sebelum pidato. Untuk kelas mahasiswa, survei singkat tiga pertanyaan lewat formulir daring dapat dibuat dalam beberapa menit (contoh penerapan dari penyusun, tambahan penyusun).',
                'Tujuan khusus dan kalimat tesis\nTujuan khusus merumuskan apa yang audiens akan ketahui atau lakukan setelah pidato selesai. Kalimat tesis merangkum pesan utama dalam satu kalimat. Contoh: untuk menginformasikan audiens tentang tiga cara mengatur jadwal belajar di UT. Bagian tujuan khusus dan tesis ini adalah penyajian penyusun yang mengacu pada praktik umum penyusunan pidato (tambahan penyusun).'
              ]
            },
            {
              subbab: 'Materi 1.3: Mengelola rasa gugup',
              konten: [
                'Mengelola rasa gugup\nRasa gugup adalah pengalaman yang umum. Bab penyampaian dalam buku sumber menyarankan langkah dasar: sadari napas sebelum berbicara dan lakukan pemanasan suara bila memungkinkan. Pemanasan yang disebut antara lain bersenandung, menguap lebar, dan melatih tangga nada sambil bernapas dalam. Selain itu, berlatih bicara spontan setiap hari, misalnya dalam percakapan santai, melatih kefasihan dan membantu mengenali kata pengisi yang berlebihan.\nPenelitian tentang kecemasan berbicara di depan umum (public speaking anxiety) dibahas oleh Bodie (2010) di jurnal Communication Education. Artikel itu masuk bacaan lanjutan dan isinya belum dibaca penyusun, jadi ringkasannya tidak dimuat di sini.'
              ]
            },
            {
              subbab: 'Implementasi',
              konten: [
                'Peserta menyelesaikan dua kegiatan berikut.\n1 Isi tabel analisis audiens untuk satu situasi bicara: situasional, demografis, psikologis, multikultural, serta minat dan pengetahuan.\n2 Tulis tujuan khusus dan kalimat tesis untuk topik pilihanmu.\n3 Lakukan tiga tarikan napas dalam dan bersenandung selama 30 detik sebagai pemanasan.\n4 Perkenalan 1 menit: sebut nama dan asal kota, satu topik yang kamu kuasai, satu alasan audiens perlu mendengarnya, lalu terima kasih dan berhenti.\n5 Beri masukan kepada satu teman: satu hal yang sudah bagus dan satu saran, singkat dan spesifik.'
              ]
            },
            {
              subbab: 'Rangkuman',
              konten: [
                '• Mulai dari audiens, bukan dari dirimu.\n• Analisis audiens memiliki lima sudut dan tiga metode.\n• Tulis tujuan khusus dan kalimat tesis sebelum menyusun isi.\n• Napas dan pemanasan suara membantu mengelola gugup.'
              ]
            },
            {
              subbab: 'Quest dan tugas',
              konten: [
                '• Quest 1 (20 XP): tulis profil audiens untuk satu situasi bicara memakai lima sudut analisis.\n• Quest 2 (30 XP): rumuskan tujuan khusus dan kalimat tesis untuk topik pilihanmu.\n• Boss quest (50 XP): tampil 1 menit memperkenalkan diri dan topikmu, mulai dengan satu napas dalam.'
              ]
            }
          ],
          kuis: {
            instruksi: 'Pilih satu jawaban yang paling tepat.',
            soal: [
              {
                nomor: 1,
                pertanyaan: 'Menurut buku sumber, siapa komponen terpenting dalam public speaking masa kini?',
                pilihan: [
                  { opsi: 'a', teks: 'Pembicara' },
                  { opsi: 'b', teks: 'Audiens' },
                  { opsi: 'c', teks: 'Moderator' },
                  { opsi: 'd', teks: 'Slide presentasi' }
                ]
              },
              {
                nomor: 2,
                pertanyaan: 'Manakah yang bukan termasuk lima sudut analisis audiens?',
                pilihan: [
                  { opsi: 'a', teks: 'Situasional' },
                  { opsi: 'b', teks: 'Kecepatan internet audiens' },
                  { opsi: 'c', teks: 'Demografis' },
                  { opsi: 'd', teks: 'Psikologis' }
                ]
              },
              {
                nomor: 3,
                pertanyaan: 'Tiga metode menganalisis audiens menurut buku sumber adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Hafalan, naskah, dan impromptu' },
                  { opsi: 'b', teks: 'Pembuka, isi, dan penutup' },
                  { opsi: 'c', teks: 'Artikulasi, intonasi, dan tempo' },
                  { opsi: 'd', teks: 'Observasi, inferensi, dan survei' }
                ]
              },
              {
                nomor: 4,
                pertanyaan: 'Tujuan khusus pidato merumuskan...',
                pilihan: [
                  { opsi: 'a', teks: 'Apa yang audiens akan ketahui atau lakukan setelah pidato' },
                  { opsi: 'b', teks: 'Jumlah slide yang dipakai' },
                  { opsi: 'c', teks: 'Pakaian yang dikenakan' },
                  { opsi: 'd', teks: 'Daftar pustaka pidato' }
                ]
              },
              {
                nomor: 5,
                pertanyaan: 'Langkah dasar mengelola gugup dari bab penyampaian adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Menghindari latihan' },
                  { opsi: 'b', teks: 'Berbicara secepat mungkin' },
                  { opsi: 'c', teks: 'Menyadari napas dan melakukan pemanasan suara' },
                  { opsi: 'd', teks: 'Menghafal semua kata' }
                ]
              }
            ]
          }
        },
        answers: {
          answers: [
            { nomor: 1, kunci: 'b', pembahasan: 'Audiens. Audiens adalah alasan seseorang berpidato, sehingga pendekatannya berpusat pada audiens.' },
            { nomor: 2, kunci: 'b', pembahasan: 'Kecepatan internet audiens. Lima sudutnya: situasional, demografis, psikologis, multikultural, serta minat dan pengetahuan awal.' },
            { nomor: 3, kunci: 'd', pembahasan: 'Observasi, inferensi, dan survei. Ketiganya dipakai untuk memahami audiens sebelum pidato.' },
            { nomor: 4, kunci: 'a', pembahasan: 'Apa yang audiens akan ketahui atau lakukan setelah pidato. Rumusan tujuan khusus ini adalah penyajian penyusun (tambahan penyusun).' },
            { nomor: 5, kunci: 'c', pembahasan: 'Menyadari napas dan melakukan pemanasan suara. Pemanasan yang disebut antara lain bersenandung, menguap lebar, dan melatih tangga nada.' }
          ]
        }
      },
      {
        preview: {
          id: 'pertemuan-2',
          classId: 'speaking',
          meetingNumber: 2,
          title: 'Struktur dan outline',
          isLocked: true,
          notice: 'Kelas belum dimulai. Materi akan dibuka oleh PJ kelas.',
          tujuan: {
            tujuanPembelajaran: [
              'menyusun pidato dalam tiga bagian: pengantar, isi, dan penutup',
              'membuat outline lengkap dengan poin utama dan pendukung',
              'menulis pengantar yang memuat empat fungsi dan penutup yang rapi',
              'mengubah bahasa tulis menjadi bahasa lisan yang lebih sederhana'
            ],
            rundownWebinar: [
              { menit: '0-10', kegiatan: 'Pembukaan, tujuan, polling singkat, review tugas sebelumnya' },
              { menit: '10-40', kegiatan: 'Penyampaian materi inti' },
              { menit: '40-65', kegiatan: 'Menyusun outline dan pitching 2 menit' },
              { menit: '65-80', kegiatan: 'Berbagi hasil dan umpan balik' },
              { menit: '80-90', kegiatan: 'Rekap dan pengumuman tugas' }
            ]
          }
        },
        content: {
          referensi: {
            rujukanPertemuan: 'Gruber, K. G. (2022). Principles of public speaking. Pressbooks. https://mtsu.pressbooks.pub/principlesofpublicspeaking/ (bab menyusun dan membuat outline pidato).',
            lisensiKelas: 'Diadaptasi dari Principles of Public Speaking oleh Katie G. Gruber (2022), lisensi CC BY-NC-SA 4.0. Perubahan: terjemahan, peringkasan, penambahan contoh, rundown, dan latihan. Karena lisensi NC-SA, bahan ini hanya untuk penggunaan non-komersial dan harus dibagikan dengan lisensi yang sama.',
            daftarPustakaKelas: [
              'Gruber, K. G. (2022). Principles of public speaking. Pressbooks. https://mtsu.pressbooks.pub/principlesofpublicspeaking/',
              'Bodie, G. D. (2010). A racing heart, rattling knees, and ruminative thoughts: Defining, explaining, and treating public speaking anxiety. Communication Education, 59(1), 70-105. https://doi.org/10.1080/03634520903443849',
              'Lucas, S. E. (2020). The art of public speaking (13th ed.). McGraw-Hill Education.',
              "O'Hair, D., Rubenstein, H., & Stewart, R. (2018). A pocket guide to public speaking (6th ed.). Bedford/St. Martin's.",
              'Burgoon, J. K., Guerrero, L. K., & Floyd, K. (2016). Nonverbal communication. Routledge. https://doi.org/10.4324/9781315663425'
            ]
          },
          materi: [
            {
              subbab: 'Materi 2.1: Tiga bagian pidato dan pengantar',
              konten: [
                'Tiga bagian pidato\nPidato terdiri dari tiga bagian: pengantar, isi, dan penutup, dan outline yang baik memuat ketiganya. Perbedaan penting antara tulisan dan pidato: pembaca dapat membuka sumber dan membaca ulang, sedangkan pendengar tidak bisa. Karena itu outline membantu pembicara mengatur urutan, memastikan alur mudah diikuti, dan menyertakan sumber otoritatif langsung di dalam materi.',
                'Pengantar\nPengantar memiliki empat fungsi: menarik perhatian audiens, membangun niat baik, menyatakan tujuan, dan memberi pratinjau isi beserta strukturnya. Untuk menarik perhatian dapat dipakai pertanyaan, cerita singkat, atau fakta yang menarik (contoh dari penyusun, tambahan penyusun). Pratinjau membantu pendengar tahu ke mana pidato akan bergerak.'
              ]
            },
            {
              subbab: 'Materi 2.2: Isi dan penutup',
              konten: [
                'Isi pidato\nSebagian besar waktu dipakai untuk isi. Isi dipecah menjadi beberapa poin utama, masing-masing didukung contoh, data, atau cerita. Untuk pidato singkat, dua sampai tiga poin utama sudah cukup (tambahan penyusun). Pola penyusunan yang umum dipakai adalah urutan waktu, topik, sebab-akibat, atau masalah dan solusi, dan pilihannya disesuaikan dengan tujuan dan audiens (tambahan penyusun).',
                'Penutup\nPenutup memberi tanda kepada audiens bahwa pidato akan berakhir, memberi ajakan atau pesan akhir, meringkas isi, lalu menutup dengan rapi. Contoh sederhana: ringkas tiga poin utama, lalu berikan satu ajakan bertindak.'
              ]
            },
            {
              subbab: 'Materi 2.3: Format outline dan bahasa lisan',
              konten: [
                'Format outline\nBuku sumber memberi contoh format: pengantar dan penutup dapat ditulis sebagai paragraf, sedangkan bagian isi sebagai poin dengan simbol dan indentasi yang konsisten, diikuti daftar referensi. Konsistensi simbol dan indentasi membuat hierarki antara poin utama dan pendukung terlihat sekilas.',
                'Bahasa lisan\nKalimat lisan sebaiknya lebih sederhana dan lebih pendek daripada kalimat tulis, karena pendengar harus memahami pada kali pertama mendengar. Cara mengujinya adalah membaca tulisanmu dengan suara keras, lalu memecah kalimat yang membuatmu kehabisan napas atau sulit diikuti.'
              ]
            },
            {
              subbab: 'Implementasi',
              konten: [
                'Peserta menyusun outline dan mempraktikkannya.\n1 Pilih topik dan tulis kalimat tesis satu kalimat.\n2 Tulis pengantar tiga kalimat yang memuat empat fungsi: perhatian, niat baik, tujuan, dan pratinjau.\n3 Susun tiga poin utama beserta satu pendukung untuk tiap poin.\n4 Tulis penutup: ringkasan tiga poin dan satu ajakan bertindak.\n5 Baca outline dengan suara keras dan sederhanakan tiga kalimat yang terlalu panjang.\n6 Pitching 2 menit tentang ide kegiatan kampus memakai outline tersebut.'
              ]
            },
            {
              subbab: 'Rangkuman',
              konten: [
                '• Outline wajib memuat pengantar, isi, dan penutup.\n• Pengantar punya empat fungsi.\n• Bahasa lisan lebih sederhana dan pendek daripada bahasa tulis.\n• Uji outline dengan membacanya keras-keras.'
              ]
            },
            {
              subbab: 'Quest dan tugas',
              konten: [
                '• Quest 1 (30 XP): susun outline lengkap (pengantar, 3 poin isi, penutup) untuk pidato 2 menit.\n• Quest 2 (20 XP): baca outlinemu dengan suara keras dan sederhanakan 3 kalimat yang terlalu panjang.\n• Boss quest (50 XP): pitching 2 menit tentang ide kegiatan kampus memakai outlinemu.'
              ]
            }
          ],
          kuis: {
            instruksi: 'Pilih satu jawaban yang paling tepat.',
            soal: [
              {
                nomor: 1,
                pertanyaan: 'Mengapa outline penting untuk pidato menurut buku sumber?',
                pilihan: [
                  { opsi: 'a', teks: 'Karena pidato harus dibaca kata demi kata' },
                  { opsi: 'b', teks: 'Karena audiens menilai kerapian tulisan' },
                  { opsi: 'c', teks: 'Pendengar tidak bisa membaca ulang, jadi alur harus tertata dan mudah diikuti' },
                  { opsi: 'd', teks: 'Karena outline menggantikan latihan' }
                ]
              },
              {
                nomor: 2,
                pertanyaan: 'Empat fungsi pengantar adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Menarik perhatian, membangun niat baik, menyatakan tujuan, memberi pratinjau' },
                  { opsi: 'b', teks: 'Meringkas, mengajak bertindak, menutup, berterima kasih' },
                  { opsi: 'c', teks: 'Memperkenalkan sponsor, jadwal, tempat, dan biaya' },
                  { opsi: 'd', teks: 'Meminta maaf, bercanda, membaca naskah, menutup' }
                ]
              },
              {
                nomor: 3,
                pertanyaan: 'Penutup berfungsi untuk...',
                pilihan: [
                  { opsi: 'a', teks: 'Memperkenalkan poin baru yang paling penting' },
                  { opsi: 'b', teks: 'Langsung ke tanya jawab tanpa ringkasan' },
                  { opsi: 'c', teks: 'Mengulang pengantar kata demi kata' },
                  { opsi: 'd', teks: 'Menandai pidato akan berakhir, memberi pesan atau ajakan, meringkas, lalu menutup rapi' }
                ]
              },
              {
                nomor: 4,
                pertanyaan: 'Cara menguji bahasa lisan dari naskah tulis adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Menambah istilah teknis' },
                  { opsi: 'b', teks: 'Membacanya dengan suara keras lalu memecah kalimat yang terlalu panjang' },
                  { opsi: 'c', teks: 'Memperpanjang kalimat' },
                  { opsi: 'd', teks: 'Menghafal tanpa membaca' }
                ]
              },
              {
                nomor: 5,
                pertanyaan: 'Format outline dalam buku sumber menyarankan...',
                pilihan: [
                  { opsi: 'a', teks: 'Semua bagian sebagai satu paragraf' },
                  { opsi: 'b', teks: 'Pengantar dan penutup sebagai paragraf, isi sebagai poin dengan simbol dan indentasi konsisten' },
                  { opsi: 'c', teks: 'Hanya judul poin tanpa isi' },
                  { opsi: 'd', teks: 'Poin tanpa urutan dan tanpa referensi' }
                ]
              }
            ]
          }
        },
        answers: {
          answers: [
            { nomor: 1, kunci: 'c', pembahasan: 'Pendengar tidak bisa membaca ulang, jadi alur harus tertata dan mudah diikuti. Pembaca dapat membuka sumber dan membaca ulang, pendengar tidak.' },
            { nomor: 2, kunci: 'a', pembahasan: 'Menarik perhatian, membangun niat baik, menyatakan tujuan, memberi pratinjau. Pratinjau membantu pendengar tahu arah pidato.' },
            { nomor: 3, kunci: 'd', pembahasan: 'Menandai pidato akan berakhir, memberi pesan atau ajakan, meringkas, lalu menutup rapi. Contoh sederhana: ringkas tiga poin lalu satu ajakan bertindak.' },
            { nomor: 4, kunci: 'b', pembahasan: 'Membacanya dengan suara keras lalu memecah kalimat yang terlalu panjang. Kalimat lisan sebaiknya lebih sederhana dan pendek daripada kalimat tulis.' },
            { nomor: 5, kunci: 'b', pembahasan: 'Pengantar dan penutup sebagai paragraf, isi sebagai poin dengan simbol dan indentasi konsisten. Konsistensi simbol dan indentasi membuat hierarki poin terlihat sekilas.' }
          ]
        }
      },
      {
        preview: {
          id: 'pertemuan-3',
          classId: 'speaking',
          meetingNumber: 3,
          title: 'Penyampaian: suara dan tubuh',
          isLocked: true,
          notice: 'Kelas belum dimulai. Materi akan dibuka oleh PJ kelas.',
          tujuan: {
            tujuanPembelajaran: [
              'memilih metode penyampaian yang tepat: impromptu, ekstemporan, naskah, atau hafalan',
              'melatih aspek vokal: artikulasi, intonasi, tempo, jeda, dan proyeksi',
              'mengendalikan aspek nonverbal: penampilan, gerak, ekspresi, dan kontak mata',
              'memberi dan menerima umpan balik yang spesifik'
            ],
            rundownWebinar: [
              { menit: '0-10', kegiatan: 'Pembukaan, tujuan, polling singkat, review tugas sebelumnya' },
              { menit: '10-40', kegiatan: 'Penyampaian materi inti' },
              { menit: '40-65', kegiatan: 'Latihan suara, gestur, dan simulasi 3 menit' },
              { menit: '65-80', kegiatan: 'Berbagi hasil dan umpan balik' },
              { menit: '80-90', kegiatan: 'Rekap dan pengumuman tugas' }
            ]
          }
        },
        content: {
          referensi: {
            rujukanPertemuan: 'Gruber, K. G. (2022). Principles of public speaking. Pressbooks. https://mtsu.pressbooks.pub/principlesofpublicspeaking/ (Bab 13, Speech delivery).',
            lisensiKelas: 'Diadaptasi dari Principles of Public Speaking oleh Katie G. Gruber (2022), lisensi CC BY-NC-SA 4.0. Perubahan: terjemahan, peringkasan, penambahan contoh, rundown, dan latihan. Karena lisensi NC-SA, bahan ini hanya untuk penggunaan non-komersial dan harus dibagikan dengan lisensi yang sama.',
            daftarPustakaKelas: [
              'Gruber, K. G. (2022). Principles of public speaking. Pressbooks. https://mtsu.pressbooks.pub/principlesofpublicspeaking/',
              'Bodie, G. D. (2010). A racing heart, rattling knees, and ruminative thoughts: Defining, explaining, and treating public speaking anxiety. Communication Education, 59(1), 70-105. https://doi.org/10.1080/03634520903443849',
              'Lucas, S. E. (2020). The art of public speaking (13th ed.). McGraw-Hill Education.',
              "O'Hair, D., Rubenstein, H., & Stewart, R. (2018). A pocket guide to public speaking (6th ed.). Bedford/St. Martin's.",
              'Burgoon, J. K., Guerrero, L. K., & Floyd, K. (2016). Nonverbal communication. Routledge. https://doi.org/10.4324/9781315663425'
            ]
          },
          materi: [
            {
              subbab: 'Materi 3.1: Gaya penyampaian dan empat metode',
              konten: [
                'Bukan membaca, bukan mengobrol\nBerpidato lebih formal daripada mengobrol, tetapi tidak sekaku membaca naskah. Ciri penyampaian yang baik adalah jeda yang bermakna, kontak mata, perubahan kecil pada kata sesuai situasi, dan penekanan suara. Pembicara tampil rapi dan siap, dengan bahasa yang tepat untuk audiensnya.',
                'Empat metode penyampaian\nImpromptu adalah berbicara singkat tanpa persiapan: susun satu poin utama dengan cepat, sampaikan seringkas mungkin, lalu berhenti. Ekstemporan adalah pidato yang sudah disiapkan dan dilatih, disampaikan secara percakapan dengan catatan singkat. Ini metode yang paling umum dan memungkinkan kontak mata. Naskah dibaca kata demi kata, cocok bila rumusan harus persis, tetapi cenderung kaku dan membatasi kontak mata. Hafalan diucapkan dari ingatan, memberi kebebasan bergerak, tetapi berisiko bila lupa dan sulit dikuasai untuk pidato yang panjang.\nUntuk impromptu, urutan praktisnya: kumpulkan pikiran dan tentukan satu poin utama, sampaikan terima kasih tanpa merendahkan diri, jelaskan poin dengan ringkas (misalnya dengan struktur dua alasan), lalu tutup dan berhenti bicara (penyederhanaan penyusun, tambahan penyusun).'
              ]
            },
            {
              subbab: 'Materi 3.2: Aspek vokal',
              konten: [
                'Aspek vokal\nArtikulasi adalah kejelasan membentuk bunyi vokal dan konsonan, dan ucapan yang jelas memengaruhi kesan kecerdasan pembicara. Pengucapan berkaitan dengan lafal kata yang benar, karena kesalahan melafalkan dapat merusak kredibilitas. Kamus daring dengan fitur audio membantu memastikan lafal. Aksen, dialek, dan regionalisme perlu disadari karena audiens dapat menilainya berbeda, dan bila sulit dipahami, latih bersama pendengar yang objektif.\nIntonasi, atau variasi nada, membuat pidato menarik dan berfungsi sebagai tanda baca lisan. Nada yang datar (monoton) membosankan, sedangkan nada yang berlebihan terdengar dibuat-buat. Tempo harus seimbang: terlalu cepat menyulitkan pemahaman, terlalu lambat membuat audiens kehilangan minat. Jeda yang tepat membantu audiens mencerna pesan, sedangkan pengisi seperti uh atau um sebaiknya dikurangi. Terakhir, proyeksi: suara harus terdengar sampai baris terjauh tanpa terkesan berteriak, termasuk bila memakai mikrofon (tambahan penyusun untuk bagian mikrofon).'
              ]
            },
            {
              subbab: 'Materi 3.3: Aspek nonverbal dan tips latihan',
              konten: [
                'Aspek nonverbal\nPenampilan sebaiknya rapi dan sedikit lebih formal daripada biasanya, tanpa elemen yang mengganggu seperti kaus bergambar, topi, atau perhiasan yang berisik. Gerak dan gestur harus santai dan alami. Hindari gelisah, seperti memainkan rambut atau mencengkeram podium, dan gestur sebaiknya spontan, bukan dibuat-buat. Ekspresi wajah mendukung isi pesan dan menunjukkan kesungguhan.\nKontak mata idealnya 80 sampai 90 persen waktu bicara. Tiga kebiasaan buruk yang disebut: head bobber (mengangguk bergantian ke catatan dan audiens), balcony gazer (menatap jauh di atas kepala audiens), dan obsessor (hanya menatap satu atau dua orang). Di webinar, melihat ke kamera, bukan ke layar, adalah padanan kontak mata (tambahan penyusun).',
                'Tips latihan\nSadari napas sebelum berbicara dan lakukan pemanasan vokal. Latih pidato dengan banyak kontak mata dan buat catatan yang mudah dibaca sekilas. Latihan di ruangan tempat pidato akan disampaikan, sambil membayangkan pendengar terjauh. Minta pendengar yang objektif atau rekam dirimu sendiri untuk menilai suara, gerak, dan kontak mata. Latih impromptu setiap hari, misalnya dengan memperhatikan kata pengisi saat berbicara santai.\nUntuk buku yang secara khusus membahas komunikasi nonverbal, Burgoon, Guerrero, dan Floyd (2016) masuk dalam bacaan lanjutan. Buku itu belum dibaca penyusun, jadi isinya tidak dikutip di sini.'
              ]
            },
            {
              subbab: 'Implementasi',
              konten: [
                'Peserta berlatih dan melakukan simulasi dengan langkah berikut.\n1 Rekam 1 menit bicara tentang topik pilihanmu.\n2 Tonton ulang dan hitung jumlah kata pengisi, nilai tempo, dan kontak mata (lihat ke kamera).\n3 Latihan jeda: baca satu paragraf dua kali, tanpa jeda lalu dengan jeda di akhir tiap kalimat, dan bandingkan.\n4 Latihan gestur: sampaikan satu pesan hanya dengan tangan dan wajah, minta teman menebak.\n5 Simulasi 3 menit sebagai MC atau presentasi singkat memakai metode ekstemporan.\n6 Terima masukan dari dua teman dengan format satu hal bagus dan satu saran.'
              ]
            },
            {
              subbab: 'Rangkuman',
              konten: [
                '• Pilih metode penyampaian sesuai situasi, dengan ekstemporan sebagai yang paling umum.\n• Vokal: artikulasi, intonasi, tempo, jeda, dan proyeksi.\n• Nonverbal: penampilan, gerak, ekspresi, dan kontak mata 80 sampai 90 persen.\n• Latih dengan rekaman dan umpan balik yang spesifik.'
              ]
            },
            {
              subbab: 'Quest dan tugas',
              konten: [
                '• Quest 1 (30 XP): rekam 1 menit bicara, nilai filler, tempo, dan kontak matamu sendiri.\n• Quest 2 (20 XP): latihan jeda dan gestur, minta satu teman menebak pesanmu.\n• Boss quest (90 XP): simulasi MC atau presentasi 3 menit dan terima masukan spesifik.'
              ]
            }
          ],
          kuis: {
            instruksi: 'Pilih satu jawaban yang paling tepat.',
            soal: [
              {
                nomor: 1,
                pertanyaan: 'Metode penyampaian yang paling umum, memakai catatan singkat dan memungkinkan kontak mata, adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Naskah' },
                  { opsi: 'b', teks: 'Hafalan' },
                  { opsi: 'c', teks: 'Impromptu' },
                  { opsi: 'd', teks: 'Ekstemporan' }
                ]
              },
              {
                nomor: 2,
                pertanyaan: 'Berapa persen waktu bicara idealnya dipakai untuk kontak mata?',
                pilihan: [
                  { opsi: 'a', teks: '80 sampai 90 persen' },
                  { opsi: 'b', teks: '10 sampai 20 persen' },
                  { opsi: 'c', teks: '30 sampai 40 persen' },
                  { opsi: 'd', teks: '100 persen tanpa berkedip' }
                ]
              },
              {
                nomor: 3,
                pertanyaan: 'Kebiasaan balcony gazer adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Hanya menatap satu atau dua orang' },
                  { opsi: 'b', teks: 'Mengangguk bergantian ke catatan dan audiens' },
                  { opsi: 'c', teks: 'Menatap jauh di atas kepala audiens' },
                  { opsi: 'd', teks: 'Menutup mata saat berbicara' }
                ]
              },
              {
                nomor: 4,
                pertanyaan: 'Fungsi intonasi dalam pidato adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Kejelasan membentuk bunyi konsonan' },
                  { opsi: 'b', teks: 'Volume yang terdengar sampai baris terjauh' },
                  { opsi: 'c', teks: 'Variasi nada yang berfungsi seperti tanda baca lisan' },
                  { opsi: 'd', teks: 'Kecepatan bicara' }
                ]
              },
              {
                nomor: 5,
                pertanyaan: 'Untuk webinar, padanan kontak mata adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Melihat ke kamera, bukan ke layar' },
                  { opsi: 'b', teks: 'Melihat ke jendela chat terus-menerus' },
                  { opsi: 'c', teks: 'Menutup kamera' },
                  { opsi: 'd', teks: 'Menatap catatan' }
                ]
              }
            ]
          }
        },
        answers: {
          answers: [
            { nomor: 1, kunci: 'd', pembahasan: 'Ekstemporan. Ekstemporan: disiapkan, dilatih, dan disampaikan secara percakapan.' },
            { nomor: 2, kunci: 'a', pembahasan: '80 sampai 90 persen. Kontak mata menumbuhkan hubungan dengan audiens.' },
            { nomor: 3, kunci: 'c', pembahasan: 'Menatap jauh di atas kepala audiens. Dua lainnya adalah head bobber dan obsessor.' },
            { nomor: 4, kunci: 'c', pembahasan: 'Variasi nada yang berfungsi seperti tanda baca lisan. Nada datar membosankan, nada berlebihan terdengar dibuat-buat.' },
            { nomor: 5, kunci: 'a', pembahasan: 'Melihat ke kamera, bukan ke layar. Ini saran penyusun (tambahan penyusun), bukan dari buku sumber.' }
          ]
        }
      }
    ]
  },
  ai: {
    id: 'ai',
    title: 'AI Skill',
    description: 'Kenalan dan latihan AI skill lewat 3 pertemuan webinar.',
    license: 'Diadaptasi dari Prompt Engineering Guide oleh Elvis Saravia (DAIR.AI), lisensi MIT. Perubahan: terjemahan, peringkasan, penambahan contoh, rundown, dan latihan. Jika bahan ini dibagikan ulang, sertakan pemberitahuan hak cipta dan lisensi MIT dari sumber.',
    meetings: [
      {
        preview: {
          id: 'pertemuan-1',
          classId: 'ai',
          meetingNumber: 1,
          title: 'Dasar AI dan prompting',
          isLocked: true,
          notice: 'Kelas belum dimulai. Materi akan dibuka oleh PJ kelas.',
          tujuan: {
            tujuanPembelajaran: [
              'menjelaskan apa itu prompt dan prompt engineering',
              'mengenali empat unsur prompt: instruksi, konteks, data masukan, dan indikator keluaran',
              'menulis prompt yang jelas dan memperbaikinya secara bertahap',
              'mengenali batasan model bahasa: bisa keliru, bias, dan isu privasi'
            ],
            rundownWebinar: [
              { menit: '0-10', kegiatan: 'Pembukaan, tujuan, polling singkat, review tugas sebelumnya' },
              { menit: '10-40', kegiatan: 'Penyampaian materi inti' },
              { menit: '40-65', kegiatan: 'Perbaiki prompt tiga kali dan templat prompt kuliah' },
              { menit: '65-80', kegiatan: 'Berbagi hasil dan umpan balik' },
              { menit: '80-90', kegiatan: 'Rekap dan pengumuman tugas' }
            ]
          }
        },
        content: {
          referensi: {
            rujukanPertemuan: 'Saravia, E. (2022). Prompt engineering guide. DAIR.AI. https://www.promptingguide.ai/ (bagian Introduction: elements of a prompt dan tips).\nWhite, J., Fu, Q., Hays, S., Sandborn, M., Olea, C., Gilbert, H., Elnashar, A., Spencer-Smith, J., & Schmidt, D. C. (2023). A prompt pattern catalog to enhance prompt engineering with ChatGPT. arXiv. https://arxiv.org/abs/2302.11382 (abstrak dibaca).',
            lisensiKelas: 'Diadaptasi dari Prompt Engineering Guide oleh Elvis Saravia (DAIR.AI), lisensi MIT. Perubahan: terjemahan, peringkasan, penambahan contoh, rundown, dan latihan. Jika bahan ini dibagikan ulang, sertakan pemberitahuan hak cipta dan lisensi MIT dari sumber.',
            daftarPustakaKelas: [
              'Saravia, E. (2022). Prompt engineering guide. DAIR.AI. https://www.promptingguide.ai/',
              'White, J., Fu, Q., Hays, S., Sandborn, M., Olea, C., Gilbert, H., Elnashar, A., Spencer-Smith, J., & Schmidt, D. C. (2023). A prompt pattern catalog to enhance prompt engineering with ChatGPT. arXiv. https://arxiv.org/abs/2302.11382',
              'Baidoo-Anu, D., & Owusu Ansah, L. (2023). Education in the era of generative artificial intelligence (AI): Understanding the potential benefits of ChatGPT in promoting teaching and learning. Journal of AI, 7(1), 52-62. https://ssrn.com/abstract=4337484',
              'Epstein, Z., Hertzmann, A., & the Investigators of Human Creativity. (2023). Art and the science of generative AI. Science, 380(6650), 1110-1111. https://doi.org/10.1126/science.adh4451'
            ]
          },
          materi: [
            {
              subbab: 'Materi 1.1: Apa itu prompt dan empat unsurnya',
              konten: [
                'Apa itu prompt\nPrompt adalah input atau pertanyaan yang diberikan kepada model bahasa untuk menghasilkan jawaban. Prompt engineering adalah praktik merancang dan mengoptimalkan prompt agar model bahasa dipakai secara efisien, sekaligus memahami kemampuan dan batasannya. Makalah White dkk. (2023) memandang prompt juga sebagai bentuk pemrograman untuk mengatur keluaran dan interaksi dengan model bahasa besar, dan mengusulkan katalog pola prompt: solusi yang dapat dipakai ulang untuk masalah yang sering muncul, mirip pola dalam rekayasa perangkat lunak.',
                'Empat unsur prompt\nPanduan sumber menyebut empat unsur. Instruksi (instruction) adalah tugas yang diminta. Konteks (context) adalah informasi tambahan yang mengarahkan jawaban. Data masukan (input data) adalah teks atau pertanyaan yang diolah. Indikator keluaran (output indicator) adalah jenis atau format hasil yang diharapkan. Tidak semua unsur harus ada, tergantung tugasnya.\nContoh buruk: Jelaskan akuntansi. Contoh lebih baik: Jelaskan persamaan akuntansi kepada mahasiswa semester 1 dalam 5 poin dan sertakan satu contoh warung makan. Pada versi kedua terlihat instruksi (jelaskan), konteks (mahasiswa semester 1), data masukan (persamaan akuntansi), dan indikator keluaran (5 poin dan satu contoh). Contoh ini adalah ilustrasi penyusun (tambahan penyusun).'
              ]
            },
            {
              subbab: 'Materi 1.2: Lima tips merancang prompt',
              konten: [
                'Lima tips merancang prompt\nPertama, mulai dari yang sederhana. Perancangan prompt adalah proses iteratif yang memerlukan banyak percobaan, jadi mulai dengan prompt sederhana lalu tambahkan elemen dan konteks bertahap. Tugas besar dipecah menjadi subtugas.\nKedua, gunakan instruksi yang jelas dengan kata kerja perintah seperti tulis, klasifikasikan, ringkas, atau terjemahkan, letakkan instruksi di awal, dan gunakan pemisah seperti ### untuk membedakan instruksi dari konteks. Ketiga, bersikap spesifik: semakin deskriptif dan relevan prompt, semakin baik hasilnya, dan contoh sangat efektif untuk mengatur format, tetapi hindari detail yang tidak perlu karena panjang prompt terbatas.\nKeempat, hindari ketidakjelasan: jangan terlalu pintar dalam merumuskan, tulislah langsung dan tepat. Misalnya tulis Jelaskan konsep ini dalam 2 sampai 3 kalimat untuk siswa SMA.\nKelima, sebutkan apa yang harus dilakukan, bukan apa yang tidak boleh. Instruksi negatif sering membingungkan model, jadi ubah menjadi tindakan yang diinginkan.'
              ]
            },
            {
              subbab: 'Materi 1.3: Batasan model bahasa',
              konten: [
                'Batasan model bahasa\nModel bahasa sering menghasilkan jawaban yang terdengar meyakinkan dan koheren padahal isinya dikarang. Gejala ini disebut masalah faktualitas atau halusinasi. Karena itu hasil penting selalu dicek ke sumber asli. Model juga dapat mencerminkan bias dari data latih, dan sebagian bias bisa dikurangi lewat strategi prompting, tetapi kadang perlu solusi lanjutan seperti penyaringan. Selain itu, jangan memasukkan data pribadi atau sensitif ke alat AI, terlepas dari seberapa praktis (tambahan penyusun untuk bagian privasi).'
              ]
            },
            {
              subbab: 'Implementasi',
              konten: [
                'Peserta memperbaiki prompt secara bertahap dan menyusun templat prompt kuliah.\n1 Tulis prompt awal yang singkat, misalnya Jelaskan akuntansi, lalu catat hasilnya.\n2 Tambahkan konteks: audiens dan tujuan, lalu catat perubahannya.\n3 Tambahkan format keluaran: jumlah poin dan gaya bahasa.\n4 Tambahkan satu contoh singkat bila perlu.\n5 Bandingkan ketiga hasil dan tulis perbedaannya. Ubah satu hal saja pada tiap iterasi agar tahu perubahan mana yang paling berpengaruh.\n6 Isi templat: Instruksi (ringkas materi menjadi 5 poin), Konteks (### materi: tempel teks modul ###), Data masukan (bab dan topik), Indikator keluaran (5 poin, bahasa sederhana, satu contoh).'
              ]
            },
            {
              subbab: 'Rangkuman',
              konten: [
                '• Prompt yang jelas memuat instruksi, konteks, data masukan, dan format keluaran.\n• Perbaiki prompt sedikit demi sedikit.\n• Tulis apa yang diinginkan, bukan daftar larangan.\n• Selalu cek hasil AI ke sumber asli.'
              ]
            },
            {
              subbab: 'Quest dan tugas',
              konten: [
                '• Quest 1 (20 XP): tulis ulang satu prompt buruk menjadi prompt dengan keempat unsur.\n• Quest 2 (30 XP): bandingkan hasil prompt singkat dan prompt berpemisah ### dengan contoh, catat bedanya.\n• Boss quest (50 XP): buat 3 prompt untuk kebutuhan kuliahmu dan jelaskan unsur tiap prompt.'
              ]
            }
          ],
          kuis: {
            instruksi: 'Pilih satu jawaban yang paling tepat.',
            soal: [
              {
                nomor: 1,
                pertanyaan: 'Empat unsur prompt menurut panduan sumber adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Judul, isi, penutup, dan referensi' },
                  { opsi: 'b', teks: 'Pertanyaan, jawaban, skor, dan hadiah' },
                  { opsi: 'c', teks: 'Peran, tempat, waktu, dan harga' },
                  { opsi: 'd', teks: 'Instruksi, konteks, data masukan, dan indikator keluaran' }
                ]
              },
              {
                nomor: 2,
                pertanyaan: 'Pemisah yang disarankan untuk membedakan instruksi dari konteks adalah...',
                pilihan: [
                  { opsi: 'a', teks: '@@@ di akhir saja' },
                  { opsi: 'b', teks: '###' },
                  { opsi: 'c', teks: 'Tidak perlu pemisah' },
                  { opsi: 'd', teks: 'Emoji' }
                ]
              },
              {
                nomor: 3,
                pertanyaan: 'Tips panduan tentang instruksi yang tepat adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Tulis daftar larangan sebanyak mungkin' },
                  { opsi: 'b', teks: 'Sebutkan apa yang harus dilakukan, bukan hanya apa yang tidak boleh' },
                  { opsi: 'c', teks: 'Buat instruksi sekabur mungkin' },
                  { opsi: 'd', teks: 'Hindari kata kerja perintah' }
                ]
              },
              {
                nomor: 4,
                pertanyaan: 'Mengapa hasil AI penting dicek ke sumber asli?',
                pilihan: [
                  { opsi: 'a', teks: 'Model tidak pernah salah' },
                  { opsi: 'b', teks: 'Sumber asli selalu lebih singkat' },
                  { opsi: 'c', teks: 'AI hanya menjawab dalam bahasa Inggris' },
                  { opsi: 'd', teks: 'Model bisa menghasilkan jawaban yang terdengar meyakinkan padahal dikarang' }
                ]
              },
              {
                nomor: 5,
                pertanyaan: 'Perancangan prompt disebut proses iteratif karena...',
                pilihan: [
                  { opsi: 'a', teks: 'Dimulai sederhana lalu diperbaiki bertahap sambil melihat hasil' },
                  { opsi: 'b', teks: 'Hanya dilakukan sekali' },
                  { opsi: 'c', teks: 'Harus langsung panjang' },
                  { opsi: 'd', teks: 'Tidak butuh percobaan' }
                ]
              }
            ]
          }
        },
        answers: {
          answers: [
            { nomor: 1, kunci: 'd', pembahasan: 'Instruksi, konteks, data masukan, dan indikator keluaran. Tidak semua unsur harus ada, tergantung tugasnya.' },
            { nomor: 2, kunci: 'b', pembahasan: '###. Letakkan instruksi di awal dan pisahkan dengan ###.' },
            { nomor: 3, kunci: 'b', pembahasan: 'Sebutkan apa yang harus dilakukan, bukan hanya apa yang tidak boleh. Instruksi negatif sering membingungkan model.' },
            { nomor: 4, kunci: 'd', pembahasan: 'Model bisa menghasilkan jawaban yang terdengar meyakinkan padahal dikarang. Masalah ini disebut faktualitas atau halusinasi.' },
            { nomor: 5, kunci: 'a', pembahasan: 'Dimulai sederhana lalu diperbaiki bertahap sambil melihat hasil. Tambahkan elemen dan konteks secara bertahap.' }
          ]
        }
      },
      {
        preview: {
          id: 'pertemuan-2',
          classId: 'ai',
          meetingNumber: 2,
          title: 'AI untuk belajar dan produktivitas',
          isLocked: true,
          notice: 'Kelas belum dimulai. Materi akan dibuka oleh PJ kelas.',
          tujuan: {
            tujuanPembelajaran: [
              'memakai AI sebagai teman belajar secara jujur dan sesuai aturan akademik',
              'membuat prompt untuk meringkas materi dan membuat soal latihan',
              'memakai teknik few-shot dan chain-of-thought untuk hasil yang lebih baik',
              'memeriksa hasil AI dengan membandingkannya ke sumber asli'
            ],
            rundownWebinar: [
              { menit: '0-10', kegiatan: 'Pembukaan, tujuan, polling singkat, review tugas sebelumnya' },
              { menit: '10-40', kegiatan: 'Penyampaian materi inti' },
              { menit: '40-65', kegiatan: 'Ringkas modul, buat soal latihan, dan cek fakta' },
              { menit: '65-80', kegiatan: 'Berbagi hasil dan umpan balik' },
              { menit: '80-90', kegiatan: 'Rekap dan pengumuman tugas' }
            ]
          }
        },
        content: {
          referensi: {
            rujukanPertemuan: 'Saravia, E. (2022). Prompt engineering guide. DAIR.AI. https://www.promptingguide.ai/ (bagian Techniques: few-shot dan chain-of-thought; bagian Risks: factuality).',
            lisensiKelas: 'Diadaptasi dari Prompt Engineering Guide oleh Elvis Saravia (DAIR.AI), lisensi MIT. Perubahan: terjemahan, peringkasan, penambahan contoh, rundown, dan latihan. Jika bahan ini dibagikan ulang, sertakan pemberitahuan hak cipta dan lisensi MIT dari sumber.',
            daftarPustakaKelas: [
              'Saravia, E. (2022). Prompt engineering guide. DAIR.AI. https://www.promptingguide.ai/',
              'White, J., Fu, Q., Hays, S., Sandborn, M., Olea, C., Gilbert, H., Elnashar, A., Spencer-Smith, J., & Schmidt, D. C. (2023). A prompt pattern catalog to enhance prompt engineering with ChatGPT. arXiv. https://arxiv.org/abs/2302.11382',
              'Baidoo-Anu, D., & Owusu Ansah, L. (2023). Education in the era of generative artificial intelligence (AI): Understanding the potential benefits of ChatGPT in promoting teaching and learning. Journal of AI, 7(1), 52-62. https://ssrn.com/abstract=4337484',
              'Epstein, Z., Hertzmann, A., & the Investigators of Human Creativity. (2023). Art and the science of generative AI. Science, 380(6650), 1110-1111. https://doi.org/10.1126/science.adh4451'
            ]
          },
          materi: [
            {
              subbab: 'Materi 2.1: Teman belajar dan few-shot',
              konten: [
                'Teman belajar, bukan pengganti\nBagian ini adalah pandangan penyusun (tambahan penyusun). AI membantu memahami materi, bukan mengerjakan tugas menggantikanmu. Ikuti aturan akademik kampus tentang penggunaan AI dan jujur mengenai bantuan yang dipakai. Pertanyaan pegangan: apakah setelah memakai AI, aku bisa menjelaskan materinya dengan kata-kataku sendiri?',
                'Few-shot: memberi contoh dalam prompt\nFew-shot prompting adalah teknik memberi beberapa contoh di dalam prompt agar model memahami pola tugas, sehingga disebut in-context learning. Dalam panduan sumber, satu contoh kalimat untuk kata baru sudah cukup bagi model untuk membuat kalimat serupa untuk kata lain (1-shot). Untuk tugas yang lebih sulit, jumlah contoh bisa ditambah. Format contoh yang konsisten membantu, meski model yang lebih baru tampak lebih tahan terhadap format yang tidak rapi.\nKeterbatasannya: few-shot kurang andal untuk tugas penalaran yang kompleks. Untuk kasus seperti itu, panduan menyarankan chain-of-thought. Pemakaian untuk belajar: tempel dua contoh soal beserta penyelesaiannya dari modul, lalu minta soal baru dengan gaya yang sama (penerapan penyusun, tambahan penyusun).'
              ]
            },
            {
              subbab: 'Materi 2.2: Chain-of-thought dan meringkas materi',
              konten: [
                'Chain-of-thought dan zero-shot CoT\nChain-of-thought meminta model menguraikan langkah penalarannya sebelum memberi jawaban akhir. Teknik ini biasanya digabung dengan few-shot, yaitu contoh soal lengkap dengan langkah penyelesaiannya, dan hasilnya lebih baik untuk tugas penalaran. Panduan juga menyebut kemampuan ini muncul pada model yang cukup besar.\nZero-shot CoT tidak memerlukan contoh: cukup menambahkan frasa agar model berpikir langkah demi langkah di akhir prompt. Dalam contoh panduan, soal apel (10 apel, diberikan 4, dibeli 5 lagi, dimakan 1) dijawab salah tanpa frasa itu, tetapi dijawab benar dengan uraian langkah ketika frasa ditambahkan. Pelajaran praktisnya: untuk soal hitungan atau penalaran, minta model menuliskan langkahnya, lalu periksa langkah itu sendiri.',
                'Meringkas, menjelaskan, dan membuat soal latihan\nBagian ini adalah penerapan penyusun atas unsur prompt (tambahan penyusun). Untuk meringkas, susun prompt dengan instruksi (ringkas), konteks (tempel teks modul di antara pemisah ###), dan indikator keluaran (misalnya 5 poin). Untuk memahami konsep sulit, minta analogi sehari-hari, lalu minta versi yang lebih sederhana, kemudian ceritakan ulang dengan kata-katamu sendiri untuk menguji pemahaman.\nUntuk soal latihan, tentukan jumlah soal, bentuk (pilihan ganda atau esai), dan tingkat kesulitan, lalu jawab sendiri dulu sebelum melihat kunci. Contoh prompt: Buat 5 soal pilihan ganda tentang materi berikut beserta kunci di akhir, diikuti teks materi di antara pemisah.'
              ]
            },
            {
              subbab: 'Materi 2.3: Cek fakta, kejujuran, dan iterasi',
              konten: [
                'Cek fakta dan referensi\nPanduan sumber menjelaskan bahwa model bahasa dapat memberi jawaban yang terdengar meyakinkan padahal dikarang. Cara mengurangi yang disarankan: berikan sumber acuan di dalam konteks prompt (misalnya paragraf dari modul) agar model menjawab berdasarkan teks itu, instruksikan model mengaku tidak tahu bila informasinya tidak tersedia, dan sertakan contoh pertanyaan yang bisa dijawab maupun yang tidak bisa dijawab. Kebiasaan yang disarankan penyusun: bandingkan jawaban dengan modul atau jurnal, dan periksa manual setiap referensi yang disebut AI karena bisa saja tidak ada (tambahan penyusun).\nUntuk pembahasan manfaat AI generatif dalam pendidikan, Baidoo-Anu dan Owusu Ansah (2023) masuk bacaan lanjutan. Artikel itu belum dibaca penyusun, jadi isinya tidak dikutip di sini.',
                'Menulis dengan jujur dan iterasi\nBoleh memakai AI untuk brainstorming ide dan kerangka, tetapi tulis ulang dengan bahasamu sendiri, cantumkan sumber, dan ikuti ketentuan pengungkapan penggunaan AI jika diwajibkan (tambahan penyusun). Bila hasil kurang tepat, perbaiki prompt dengan konteks lebih jelas atau contoh, sesuai prinsip iteratif dari panduan, jangan langsung menyerah. Terakhir, minta AI menyusun rencana belajar mingguan berdasarkan mata kuliah, tenggat, dan jam kosongmu, lalu nilai sendiri kelayakannya.'
              ]
            },
            {
              subbab: 'Implementasi',
              konten: [
                'Peserta mempraktikkan alur belajar bersama AI dengan langkah berikut.\n1 Tempel satu paragraf modul dan minta ringkasan 5 poin memakai pemisah ###.\n2 Pilih tiga klaim dari ringkasan dan cek ke modul asli.\n3 Minta analogi untuk satu konsep sulit, lalu ceritakan ulang tanpa melihat jawaban.\n4 Minta 5 soal latihan, jawab sendiri, lalu cocokkan dengan kunci.\n5 Coba zero-shot CoT pada satu soal hitungan: tambahkan permintaan menuliskan langkahnya dan periksa langkahnya.\n6 Minta rencana belajar satu minggu, sesuaikan, dan evaluasi hasilnya di akhir minggu.'
              ]
            },
            {
              subbab: 'Rangkuman',
              konten: [
                '• AI adalah teman belajar, bukan pengganti usahamu.\n• Few-shot dan chain-of-thought membantu hasil yang lebih baik, terutama untuk penalaran.\n• Berikan sumber acuan dan cek fakta karena model bisa mengarang.\n• Tulis ulang dengan bahasamu dan jujur soal bantuan AI.'
              ]
            },
            {
              subbab: 'Quest dan tugas',
              konten: [
                '• Quest 1 (30 XP): ringkas satu bab modul dengan AI, lalu cek 3 klaimnya ke sumber asli.\n• Quest 2 (20 XP): minta 5 soal latihan, jawab sendiri, lalu cocokkan dengan kunci.\n• Boss quest (50 XP): buat rencana belajar satu minggu bersama AI dan evaluasi hasilnya di akhir minggu.'
              ]
            }
          ],
          kuis: {
            instruksi: 'Pilih satu jawaban yang paling tepat.',
            soal: [
              {
                nomor: 1,
                pertanyaan: 'Few-shot prompting adalah teknik...',
                pilihan: [
                  { opsi: 'a', teks: 'Meminta model menjawab tanpa konteks' },
                  { opsi: 'b', teks: 'Memendekkan prompt menjadi satu kata' },
                  { opsi: 'c', teks: 'Memberi beberapa contoh di dalam prompt agar model memahami pola tugas' },
                  { opsi: 'd', teks: 'Mematikan kemampuan model menalar' }
                ]
              },
              {
                nomor: 2,
                pertanyaan: 'Teknik yang meminta model menguraikan langkah penalaran sebelum jawaban akhir disebut...',
                pilihan: [
                  { opsi: 'a', teks: 'Fine-tuning' },
                  { opsi: 'b', teks: 'Prompt negatif' },
                  { opsi: 'c', teks: 'Chain-of-thought' },
                  { opsi: 'd', teks: 'Zero-shot tanpa langkah' }
                ]
              },
              {
                nomor: 3,
                pertanyaan: 'Cara mengurangi halusinasi yang disarankan panduan adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Memberikan sumber acuan di dalam prompt dan mengizinkan model mengaku tidak tahu' },
                  { opsi: 'b', teks: 'Meminta model menjawab seyakin mungkin' },
                  { opsi: 'c', teks: 'Menghapus semua konteks' },
                  { opsi: 'd', teks: 'Memakai bahasa yang sangat rumit' }
                ]
              },
              {
                nomor: 4,
                pertanyaan: 'Sikap tepat dalam memakai AI untuk belajar menurut penyusun adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Menyalin jawaban tanpa membaca' },
                  { opsi: 'b', teks: 'Menyembunyikan penggunaan AI dalam semua kasus' },
                  { opsi: 'c', teks: 'Mengganti seluruh kegiatan membaca modul' },
                  { opsi: 'd', teks: 'Teman belajar, bukan pengganti usahamu, dan jujur soal bantuan yang dipakai' }
                ]
              },
              {
                nomor: 5,
                pertanyaan: 'Apa yang sebaiknya dilakukan terhadap referensi yang disebut AI?',
                pilihan: [
                  { opsi: 'a', teks: 'Langsung mengutipnya' },
                  { opsi: 'b', teks: 'Memeriksanya manual karena bisa saja tidak ada' },
                  { opsi: 'c', teks: 'Menganggapnya benar karena berformat APA' },
                  { opsi: 'd', teks: 'Menghapus semuanya tanpa dicek' }
                ]
              }
            ]
          }
        },
        answers: {
          answers: [
            { nomor: 1, kunci: 'c', pembahasan: 'Memberi beberapa contoh di dalam prompt agar model memahami pola tugas. Proses ini juga disebut in-context learning.' },
            { nomor: 2, kunci: 'c', pembahasan: 'Chain-of-thought. Zero-shot CoT cukup menambahkan permintaan berpikir langkah demi langkah.' },
            { nomor: 3, kunci: 'a', pembahasan: 'Memberikan sumber acuan di dalam prompt dan mengizinkan model mengaku tidak tahu. Sertakan juga contoh pertanyaan yang bisa dan tidak bisa dijawab.' },
            { nomor: 4, kunci: 'd', pembahasan: 'Teman belajar, bukan pengganti usahamu, dan jujur soal bantuan yang dipakai. Ini pandangan penyusun (tambahan penyusun).' },
            { nomor: 5, kunci: 'b', pembahasan: 'Memeriksanya manual karena bisa saja tidak ada. Referensi yang terlihat meyakinkan tetap bisa dikarang.' }
          ]
        }
      },
      {
        preview: {
          id: 'pertemuan-3',
          classId: 'ai',
          meetingNumber: 3,
          title: 'AI untuk kreasi dan proyek mini',
          isLocked: true,
          notice: 'Kelas belum dimulai. Materi akan dibuka oleh PJ kelas.',
          tujuan: {
            tujuanPembelajaran: [
              'menjalankan alur kerja kreasi: ide, draft AI, suntingan manusia, cek fakta, publikasi',
              'menyusun templat prompt yang dapat dipakai ulang',
              'mengevaluasi hasil AI dengan rubrik sederhana',
              'menjaga privasi, hak cipta, dan atribusi dalam kreasi berbantuan AI'
            ],
            rundownWebinar: [
              { menit: '0-10', kegiatan: 'Pembukaan, tujuan, polling singkat, review tugas sebelumnya' },
              { menit: '10-40', kegiatan: 'Penyampaian materi inti' },
              { menit: '40-65', kegiatan: 'Garap proyek mini dan persiapan showcase' },
              { menit: '65-80', kegiatan: 'Berbagi hasil dan umpan balik' },
              { menit: '80-90', kegiatan: 'Rekap dan pengumuman tugas' }
            ]
          }
        },
        content: {
          referensi: {
            rujukanPertemuan: 'Saravia, E. (2022). Prompt engineering guide. DAIR.AI. https://www.promptingguide.ai/ (bagian Techniques: few-shot; bagian Risks: biases).\nWhite, J., Fu, Q., Hays, S., Sandborn, M., Olea, C., Gilbert, H., Elnashar, A., Spencer-Smith, J., & Schmidt, D. C. (2023). A prompt pattern catalog to enhance prompt engineering with ChatGPT. arXiv. https://arxiv.org/abs/2302.11382 (abstrak dibaca).',
            lisensiKelas: 'Diadaptasi dari Prompt Engineering Guide oleh Elvis Saravia (DAIR.AI), lisensi MIT. Perubahan: terjemahan, peringkasan, penambahan contoh, rundown, dan latihan. Jika bahan ini dibagikan ulang, sertakan pemberitahuan hak cipta dan lisensi MIT dari sumber.',
            daftarPustakaKelas: [
              'Saravia, E. (2022). Prompt engineering guide. DAIR.AI. https://www.promptingguide.ai/',
              'White, J., Fu, Q., Hays, S., Sandborn, M., Olea, C., Gilbert, H., Elnashar, A., Spencer-Smith, J., & Schmidt, D. C. (2023). A prompt pattern catalog to enhance prompt engineering with ChatGPT. arXiv. https://arxiv.org/abs/2302.11382',
              'Baidoo-Anu, D., & Owusu Ansah, L. (2023). Education in the era of generative artificial intelligence (AI): Understanding the potential benefits of ChatGPT in promoting teaching and learning. Journal of AI, 7(1), 52-62. https://ssrn.com/abstract=4337484',
              'Epstein, Z., Hertzmann, A., & the Investigators of Human Creativity. (2023). Art and the science of generative AI. Science, 380(6650), 1110-1111. https://doi.org/10.1126/science.adh4451'
            ]
          },
          materi: [
            {
              subbab: 'Materi 3.1: Alur kerja dan brainstorming',
              konten: [
                'Alur kerja kreasi\nBagian ini adalah rancangan penyusun (tambahan penyusun). Alurnya lima langkah: ide, draft dengan AI, suntingan manusia, cek fakta, lalu publikasi. AI membantu membuat draft, sementara kamu yang memberi arah dan mengambil keputusan akhir.',
                'Brainstorming dan naskah dengan contoh\nUntuk brainstorming ide konten, beri konteks yang jelas: siapa audiens, platform, dan tujuan. Minta beberapa opsi lalu pilih satu. Contoh prompt: Berikan 10 ide konten Instagram untuk audiens mahasiswa baru dengan tujuan mengenalkan layanan perpustakaan UT (contoh penyusun).\nUntuk gaya bahasa, manfaatkan prinsip few-shot dari panduan sumber: contoh dalam prompt efektif untuk mendapat format dan gaya tertentu. Tempelkan satu atau dua caption khas organisasimu sebagai contoh, lalu minta caption baru dengan gaya yang sama.'
              ]
            },
            {
              subbab: 'Materi 3.2: Templat prompt dan evaluasi hasil',
              konten: [
                'Templat prompt yang dapat dipakai ulang\nSimpan prompt andalanmu dalam bentuk templat dengan pemisah ### dan bagian yang dapat diganti, misalnya peran, tugas, konteks, dan format. Ini sejalan dengan gagasan pola prompt dari White dkk. (2023): solusi yang dapat dipakai ulang untuk masalah yang berulang. Templat membuat hasil lebih konsisten dan menghemat waktu.',
                'Mengevaluasi hasil dan mengurangi bias\nNilai hasil dengan rubrik sederhana: akurat, relevan dengan audiens, gaya sesuai, dan orisinal, masing-masing skala 1 sampai 5 (rubrik dari penyusun, tambahan penyusun). Revisi bagian yang kurang dan jangan menerima hasil mentah-mentah.\nPanduan sumber memberi saran mengurangi bias pada few-shot: jaga keseimbangan jumlah contoh untuk tiap label, acak urutan contoh agar tidak mengelompok, waspadai tugas yang sulit karena pengaruh distribusi dan urutan contoh lebih terasa, dan uji prompt berulang dengan variasi distribusi dan urutan.'
              ]
            },
            {
              subbab: 'Materi 3.3: Privasi, hak cipta, dan showcase',
              konten: [
                'Privasi, keamanan, dan hak cipta\nJangan memasukkan data pribadi atau sensitif ke alat AI, misalnya nomor induk, nomor telepon, atau data orang lain tanpa izin (tambahan penyusun). Baca ketentuan alat AI mengenai penggunaan hasil, dan tandai bagian yang dibantu AI bila diperlukan. Hindari meminta AI meniru karya atau karakter berhak cipta. Aturan hukum tentang hak cipta karya AI berbeda antarnegara dan terus berubah, sehingga penyusun tidak menyajikan kesimpulan hukum di sini. Untuk pembahasan ilmiah, Epstein dkk. (2023) di jurnal Science masuk bacaan lanjutan dan belum dibaca penyusun.',
                'Showcase proyek\nPresentasikan proyek mini selama 2 menit dengan format: masalah yang ingin dipecahkan, prompt yang dipakai, hasil, bagian yang kamu sunting, dan pelajaran yang didapat (format dari penyusun, tambahan penyusun).'
              ]
            },
            {
              subbab: 'Implementasi',
              konten: [
                'Peserta menggarap satu proyek mini yang memakai AI secara bertanggung jawab.\n1 Tentukan satu konten kecil, misalnya caption dan naskah singkat untuk kegiatan organisasi.\n2 Susun templat prompt dengan pemisah ### dan satu atau dua contoh gaya.\n3 Hasilkan draft, lalu sunting dengan gayamu sendiri dan cek faktanya.\n4 Nilai hasil dengan rubrik akurat, relevan, gaya sesuai, dan orisinal.\n5 Coret data sensitif dari contoh prompt yang akan dibagikan.\n6 Tulis catatan: bagian mana buatan AI dan bagian mana buatanmu.'
              ]
            },
            {
              subbab: 'Rangkuman',
              konten: [
                '• Alur: ide, draft AI, suntingan manusia, cek fakta, publikasi.\n• Contoh dalam prompt membantu gaya dan format yang konsisten.\n• Templat prompt menghemat waktu dan menjaga konsistensi.\n• Jaga privasi, ikuti ketentuan alat, dan beri atribusi bila perlu.'
              ]
            },
            {
              subbab: 'Quest dan tugas',
              konten: [
                '• Quest 1 (30 XP): buat satu konten dengan draft AI, lalu sunting dengan gayamu sendiri.\n• Quest 2 (20 XP): tulis catatan bagian mana buatan AI dan bagian mana buatanmu.\n• Boss quest (70 XP): showcase proyek mini selama 2 menit.'
              ]
            }
          ],
          kuis: {
            instruksi: 'Pilih satu jawaban yang paling tepat.',
            soal: [
              {
                nomor: 1,
                pertanyaan: 'Alur kerja kreasi berbantuan AI pada bahan ajar adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Publikasi, draft, ide, hapus, cek' },
                  { opsi: 'b', teks: 'Ide, draft AI, suntingan manusia, cek fakta, publikasi' },
                  { opsi: 'c', teks: 'Draft AI langsung dipublikasikan' },
                  { opsi: 'd', teks: 'Cek fakta, lalu ide, lalu draft' }
                ]
              },
              {
                nomor: 2,
                pertanyaan: 'Cara agar caption AI meniru gaya organisasi adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Meminta AI menebak gaya tanpa contoh' },
                  { opsi: 'b', teks: 'Menyalin caption organisasi lain' },
                  { opsi: 'c', teks: 'Memakai prompt sependek mungkin' },
                  { opsi: 'd', teks: 'Menempelkan satu atau dua caption contoh dalam prompt' }
                ]
              },
              {
                nomor: 3,
                pertanyaan: 'Saran panduan mengurangi bias pada few-shot adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Menjaga keseimbangan contoh tiap label dan mengacak urutan contoh' },
                  { opsi: 'b', teks: 'Memberi contoh hanya satu label' },
                  { opsi: 'c', teks: 'Mengelompokkan label sama di awal' },
                  { opsi: 'd', teks: 'Tidak menguji variasi' }
                ]
              },
              {
                nomor: 4,
                pertanyaan: 'Data yang sebaiknya tidak dimasukkan ke alat AI adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Pertanyaan umum tentang materi' },
                  { opsi: 'b', teks: 'Teks yang sudah publik' },
                  { opsi: 'c', teks: 'Data pribadi atau sensitif tanpa izin' },
                  { opsi: 'd', teks: 'Soal latihan tanpa nama' }
                ]
              },
              {
                nomor: 5,
                pertanyaan: 'Isi showcase proyek mini menurut format kelas adalah...',
                pilihan: [
                  { opsi: 'a', teks: 'Hanya hasil akhir' },
                  { opsi: 'b', teks: 'Hanya daftar alat AI' },
                  { opsi: 'c', teks: 'Masalah, prompt, hasil, bagian yang disunting, dan pelajaran' },
                  { opsi: 'd', teks: 'Harga langganan alat' }
                ]
              }
            ]
          }
        },
        answers: {
          answers: [
            { nomor: 1, kunci: 'b', pembahasan: 'Ide, draft AI, suntingan manusia, cek fakta, publikasi. Alur ini rancangan penyusun (tambahan penyusun).' },
            { nomor: 2, kunci: 'd', pembahasan: 'Menempelkan satu atau dua caption contoh dalam prompt. Contoh dalam prompt efektif untuk mengatur format dan gaya.' },
            { nomor: 3, kunci: 'a', pembahasan: 'Menjaga keseimbangan contoh tiap label dan mengacak urutan contoh. Uji prompt berulang dengan variasi distribusi dan urutan contoh.' },
            { nomor: 4, kunci: 'c', pembahasan: 'Data pribadi atau sensitif tanpa izin. Ini saran penyusun (tambahan penyusun).' },
            { nomor: 5, kunci: 'c', pembahasan: 'Masalah, prompt, hasil, bagian yang disunting, dan pelajaran. Format ini dari penyusun (tambahan penyusun).' }
          ]
        }
      }
    ]
  }
};
