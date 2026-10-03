// src/data/quiz.ts

export interface QuizQuestion {
  id?: number | string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'Siapa yang memimpin Perang Jawa (1825-1830) melawan Kolonial Belanda?',
    options: ['Sultan Agung', 'Pangeran Diponegoro', 'Tuanku Imam Bonjol', 'Sultan Hasanuddin'],
    correctIndex: 1,
    explanation: 'Pangeran Diponegoro memimpin Perang Jawa dan ditangkap di Magelang pada 1830.',
  },
  {
    id: 2,
    question: 'Tokoh yang dijuluki "Bapak Pendidikan Nasional" Indonesia adalah?',
    options: ['R.A. Kartini', 'Dewi Sartika', 'Ki Hajar Dewantara', 'Dr. Cipto Mangunkusumo'],
    correctIndex: 2,
    explanation: 'Ki Hajar Dewantara mendirikan Taman Siswa dan tanggal lahirnya menjadi Hari Pendidikan Nasional.',
  },
  {
    id: 3,
    question: 'Buku karya R.A. Kartini yang terkenal yang berisi surat-suratnya berjudul?',
    options: ['Habis Gelap Terbitlah Terang', 'Bumi Manusia', 'Tetralogi Buru', 'Sang Pencerah'],
    correctIndex: 0,
    explanation: '"Habis Gelap Terbitlah Terang" (Door Duisternis tot Licht) adalah kumpulan surat R.A. Kartini.',
  },
  {
    id: 4,
    question: 'Panglima Besar TNI yang memimpin perang gerilya melawan Belanda dalam keadaan sakit adalah?',
    options: ['Bung Tomo', 'Jenderal Soedirman', 'Jenderal Soeharto', 'Letjen Urip Sumohardjo'],
    correctIndex: 1,
    explanation: 'Jenderal Soedirman memimpin perang gerilya selama 7 bulan walau menderita sakit paru-paru.',
  },
  {
    id: 5,
    question: 'Siapa yang dijuluki "Ayam Jantan dari Timur"?',
    options: ['Pattimura', 'Frans Kaisiepo', 'Sultan Hasanuddin', 'Sisingamangaraja XII'],
    correctIndex: 2,
    explanation: 'Sultan Hasanuddin dari Gowa dijuluki "De Haantjes van Het Oosten" oleh Belanda.',
  },
  {
    id: 6,
    question: 'Tanggal berapa Indonesia memproklamasikan kemerdekaan?',
    options: ['17 Agustus 1945', '20 Mei 1908', '28 Oktober 1928', '1 Juni 1945'],
    correctIndex: 0,
    explanation: 'Soekarno-Hatta memproklamasikan kemerdekaan Indonesia pada 17 Agustus 1945.',
  },
  {
    id: 7,
    question: 'Pencipta lagu kebangsaan "Indonesia Raya" adalah?',
    options: ['Ismail Marzuki', 'W.R. Supratman', 'Kusbini', 'Cornel Simanjuntak'],
    correctIndex: 1,
    explanation: 'W.R. Supratman menciptakan Indonesia Raya yang pertama kali diperdengarkan di Kongres Pemuda II 1928.',
  },
  {
    id: 8,
    question: 'Pendiri organisasi Muhammadiyah adalah?',
    options: ["KH Hasyim Asy'ari", 'KH Ahmad Dahlan', 'KH Wahid Hasyim', 'Buya Hamka'],
    correctIndex: 1,
    explanation: 'KH Ahmad Dahlan mendirikan Muhammadiyah pada 18 November 1912 di Yogyakarta.',
  },
  {
    id: 9,
    question: 'Pahlawan wanita asal Aceh yang dijuluki "Singa Betina dari Aceh" adalah?',
    options: ['Cut Meutia', 'Cut Nyak Dien', 'Martha Christina Tiahahu', 'Dewi Sartika'],
    correctIndex: 1,
    explanation: 'Cut Nyak Dien memimpin perjuangan rakyat Aceh setelah suaminya, Teuku Umar, gugur.',
  },
  {
    id: 10,
    question: 'Pangeran Diponegoro ditangkap oleh Belanda di kota mana setelah perundingan damai yang berkhianat?',
    options: ['Yogyakarta', 'Semarang', 'Magelang', 'Surakarta'],
    correctIndex: 2,
    explanation: 'Diponegoro ditangkap di Magelang oleh Jenderal De Kock pada 28 Maret 1830.',
  },
  {
    id: 11,
    question: 'Siapa tokoh yang memimpin perlawanan rakyat Maluku melawan VOC dengan kapiten Pattimura?',
    options: ['Martha Christina Tiahahu', 'Sultan Baabullah', 'Thomas Matulessy', 'Ahmad Boejang'],
    correctIndex: 2,
    explanation: 'Thomas Matulessy atau yang dikenal sebagai Kapiten Pattimura memimpin perlawanan di Saparua, Maluku.',
  },
  {
    id: 12,
    question: 'Organisasi pergerakan nasional pertama di Indonesia yang berdiri pada 20 Mei 1908 adalah?',
    options: ['Budi Utomo', 'Sarekat Islam', 'Indische Partij', 'PNI'],
    correctIndex: 0,
    explanation: 'Budi Utomo didirikan oleh dr. Soetomo dan para mahasiswa STOVIA, yang kini diperingati sebagai Hari Kebangkitan Nasional.',
  },
  {
    id: 13,
    question: 'Tokoh pemuda yang membacakan naskah Proklamasi Kemerdekaan Indonesia mendampingi Ir. Soekarno adalah?',
    options: ['Mohammad Hatta', 'Ahmad Soebardjo', 'Sutan Sjahrir', 'Chaerul Saleh'],
    correctIndex: 0,
    explanation: 'Bung Hatta mendampingi Ir. Soekarno dan ikut menandatangani naskah Proklamasi atas nama bangsa Indonesia.',
  },
  {
    id: 14,
    question: 'Siapakah pahlawan nasional wanita dari Sunda yang mendirikan Sekolah Kautamaan Istri?',
    options: ['R.A. Kartini', 'Dewi Sartika', 'Cut Nyak Meutia', 'Nyi Ageng Serang'],
    correctIndex: 1,
    explanation: 'Dewi Sartika adalah pelopor pendidikan bagi kaum perempuan dengan mendirikan Sekolah Istri di Bandung.',
  },
  {
    id: 15,
    question: 'Pertempuran 10 November 1945 di kota mana yang kemudian diperingati sebagai Hari Pahlawan?',
    options: ['Semarang', 'Bandung', 'Surabaya', 'Medan'],
    correctIndex: 2,
    explanation: 'Pertempuran Surabaya pada 10 November 1945 adalah pertempuran besar antara tentara Indonesia dan pasukan Sekutu/Inggris.',
  },
  {
    id: 16,
    question: 'Siapa tokoh yang menjahit Bendera Pusaka Sang Saka Merah Putih?',
    options: ['Fatmawati', 'SK Trimurti', 'Ny. Ageng Serang', 'Rasuna Said'],
    correctIndex: 0,
    explanation: 'Ibu Fatmawati Soekarno menjahit Bendera Pusaka Sang Saka Merah Putih yang dikibarkan saat proklamasi.',
  },
  {
    id: 17,
    question: 'Pendiri Nahdlatul Ulama (NU) pada tahun 1926 adalah?',
    options: ['KH Ahmad Dahlan', "KH Hasyim Asy'ari", 'KH Hasyim Muzadi', 'KH Wahab Hasbullah'],
    correctIndex: 1,
    explanation: "KH Hasyim Asy'ari bersama para ulama lain mendirikan Nahdlatul Ulama di Surabaya untuk membela paham Ahlussunnah wal Jamaah.",
  },
  {
    id: 18,
    question: 'Pahlawan nasional yang memimpin perlawanan Perang Banjar di Kalimantan Selatan adalah?',
    options: ['Pangeran Antasari', 'Sultan Adam', 'Untung Surapati', 'Pangeran Diponegoro'],
    correctIndex: 0,
    explanation: 'Pangeran Antasari memimpin Perang Banjar dengan semboyan "Lamun tarung tak kuasalah bahampangan, basampit ke batur".',
  },
  {
    id: 19,
    question: 'Siapakah tokoh yang dikenal sebagai pencetus dasar negara Pancasila pada sidang BPUPKI tanggal 1 Juni 1945?',
    options: ['Mohammad Yamin', 'Soepomo', 'Ir. Soekarno', 'Ki Bagoes Hadikoesoemo'],
    correctIndex: 2,
    explanation: 'Ir. Soekarno menyampaikan pidato gagasan mengenai lima sila yang dinamakan Pancasila pada 1 Juni 1945.',
  },
  {
    id: 20,
    question: 'Tokoh emansipasi wanita asal Sumatra Barat yang aktif dalam pergerakan nasional dan pers adalah?',
    options: ['Cut Nyak Dien', 'H.R. Rasuna Said', 'Rohana Kudus', 'Maria Walanda Maramis'],
    correctIndex: 1,
    explanation: 'H.R. Rasuna Said adalah tokoh pejuang wanita dan wartawan yang gigih menentang penjajahan Belanda.',
  },
];
