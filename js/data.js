/* =========================================================
   DATA KONTEN — Petualangan Pythagoras
   Materi mengacu pada: Global Matematika SMP Kelas VIII (Bab 2: Teorema Pythagoras)
   Setiap soal numerik memiliki `chk` (ekspresi JS) yang diperiksa oleh test/verify-data.js
   ========================================================= */
window.PP = window.PP || {};

PP.TUJUAN = [
  { t: 'Mengenali Segitiga Siku-Siku', d: 'Mengidentifikasi sisi-sisi segitiga siku-siku: alas, tegak, dan sisi miring (hipotenusa).', icon: 'ic_pin' },
  { t: 'Memahami Hubungan Sisi', d: 'Menjelaskan hubungan panjang sisi-sisi segitiga siku-siku.', icon: 'ic_book' },
  { t: 'Menemukan Teorema Pythagoras', d: 'Menemukan konsep c² = a² + b² dari luas persegi pada ketiga sisi.', icon: 'ic_star' },
  { t: 'Menghitung Panjang Sisi', d: 'Menghitung panjang sisi segitiga siku-siku jika dua sisi lainnya diketahui.', icon: 'ic_game' },
  { t: 'Memecahkan Masalah Nyata', d: 'Menyelesaikan permasalahan kontekstual dengan Teorema Pythagoras.', icon: 'ic_trophy' }
];

/* ---------------- POS PETUALANGAN ---------------- */
PP.POS = [
  { id: 1, name: 'Gerbang Geometri', mission: 'Mengenal segitiga siku-siku.', sprite: 'portal', materi: ['1'], kind: 'quick', pts: 'quick1',
    intro: 'Selamat datang di Gerbang Geometri! Gerbang ini hanya terbuka bagi yang mengenal segitiga siku-siku.' },
  { id: 2, name: 'Hutan Sisi Segitiga', mission: 'Mengenal sisi alas, sisi tegak, dan sisi miring (hipotenusa).', sprite: 'pine_a', materi: ['2'], kind: 'game', game: 'A',
    intro: 'Di hutan ini setiap sisi segitiga punya nama. Susun nama-namanya dengan benar!' },
  { id: 3, name: 'Kerajaan Persegi', mission: 'Memahami hubungan luas persegi pada setiap sisi segitiga siku-siku.', sprite: 'school', materi: ['3'], kind: 'quick', pts: 'quick3',
    intro: 'Kerajaan Persegi menyimpan rahasia luas. Bandingkan luas persegi pada tiap sisi!' },
  { id: 4, name: 'Lembah Pythagoras', mission: 'Memahami dan menemukan rumus Teorema Pythagoras.', sprite: 'windmill', materi: ['3b', '4'], kind: 'game', game: 'B',
    intro: 'Inilah Lembah Pythagoras. Temukan panjang sisi yang hilang dengan rumus a² + b² = c².' },
  { id: 5, name: 'Jembatan Tantangan', mission: 'Menyelesaikan perhitungan dan soal cerita.', sprite: 'bridge', materi: ['5'], kind: 'game', game: 'C',
    intro: 'Bantu penjelajah menyeberang! Hitung panjang tangga, tali, dan jembatan dengan tepat.' },
  { id: 6, name: 'Istana Matematika', mission: 'Menyelesaikan tantangan akhir.', sprite: 'castle', materi: ['6'], kind: 'game', game: 'D',
    intro: 'Ini tantangan terakhir di Istana Matematika. Kamu punya tiga nyawa. Semangat!' }
];

/* ---------------- KUIS MISI CEPAT (Pos 1 & 3) ---------------- */
PP.QUICK = {
  quick1: [
    { q: 'Segitiga siku-siku memiliki satu sudut sebesar…', o: ['45°', '60°', '90°', '180°'], a: 2, e: 'Segitiga siku-siku memiliki tepat satu sudut siku-siku, yaitu 90°.' },
    { q: 'Tanda kotak kecil pada sudut sebuah segitiga menunjukkan…', o: ['Sudut siku-siku (90°)', 'Sudut lancip', 'Sisi miring', 'Sisi terpendek'], a: 0, e: 'Kotak kecil adalah penanda sudut siku-siku (90°).' },
    { q: 'Segitiga yang sudut-sudutnya 30°, 60°, dan 90° termasuk segitiga…', o: ['Sama sisi', 'Siku-siku', 'Tumpul', 'Sembarang yang tidak punya nama'], a: 1, e: 'Salah satu sudutnya 90°, jadi segitiga tersebut siku-siku. Jumlah sudutnya 30° + 60° + 90° = 180°.' }
  ],
  quick3: [
    { q: 'Luas persegi dengan panjang sisi 3 cm adalah…', o: ['6 cm²', '9 cm²', '12 cm²', '3 cm²'], a: 1, e: 'Luas persegi = sisi × sisi = 3 × 3 = 9 cm².', chk: '3*3', ans: '9' },
    { q: 'Persegi pada sisi 3, 4, dan 5 memiliki luas 9, 16, dan 25. Hubungan luasnya adalah…', o: ['9 + 16 = 25', '9 × 16 = 25', '25 − 16 = 8', '9 + 25 = 16'], a: 0, e: 'Luas persegi terbesar (25) sama dengan jumlah dua luas persegi lainnya: 9 + 16 = 25.' },
    { q: 'Luas persegi pada dua sisi siku-siku adalah 36 dan 64. Luas persegi pada sisi miring adalah…', o: ['28', '100', '10', '2.304'], a: 1, e: 'Luas persegi sisi miring = 36 + 64 = 100.', chk: '36+64', ans: '100' }
  ]
};

/* ---------------- GAME B: TEMUKAN PANJANG SISI ---------------- */
// unk: sisi yang dicari ('a' = sisi tegak, 'b' = sisi alas, 'c' = sisi miring). Nilai a, b, c sudah lengkap untuk verifikasi.
PP.POOL_B = {
  easy: [
    { a: 3, b: 4, c: 5, unk: 'c' }, { a: 6, b: 8, c: 10, unk: 'c' }, { a: 5, b: 12, c: 13, unk: 'c' },
    { a: 9, b: 12, c: 15, unk: 'c' }, { a: 8, b: 15, c: 17, unk: 'c' }, { a: 12, b: 16, c: 20, unk: 'c' }
  ],
  medium: [
    { a: 6, b: 8, c: 10, unk: 'a' }, { a: 5, b: 12, c: 13, unk: 'b' }, { a: 8, b: 15, c: 17, unk: 'a' },
    { a: 9, b: 12, c: 15, unk: 'a' }, { a: 7, b: 24, c: 25, unk: 'b' }, { a: 10, b: 24, c: 26, unk: 'a' }
  ],
  hard: [
    { a: 12, b: 3.5, c: 12.5, unk: 'b' }, { a: 24, b: 32, c: 40, unk: 'c' }, { a: 10, b: 10.5, c: 14.5, unk: 'a' },
    { a: 6, b: 2.5, c: 6.5, unk: 'a' }, { a: 35, b: 12, c: 37, unk: 'a' }, { a: 30, b: 40, c: 50, unk: 'c' }
  ]
};

/* ---------------- GAME C: MISI JEMBATAN ---------------- */
// kind menentukan gambar. nums: ukuran sesuai gambar. ask: yang ditanyakan. Jawaban dihitung dari rumus.
PP.SCENES_C = [
  { kind: 'ladder', title: 'Tangga ke Jendela', story: 'Penjelajah harus naik ke jendela menara setinggi 12 m. Kaki tangga diletakkan 5 m dari dinding.',
    q: 'Berapa panjang tangga yang dibutuhkan?', legs: [12, 5], ask: 'hyp', ans: 13, o: ['11 m', '13 m', '15 m', '17 m'], unit: 'm' },
  { kind: 'bridge', title: 'Jurang Sungai', story: 'Tebing kiri 6 m lebih tinggi daripada tebing kanan. Lebar jurang 8 m. Sebuah papan miring dipasang dari tepi tebing kiri ke tepi tebing kanan.',
    q: 'Berapa panjang papan yang dibutuhkan?', legs: [6, 8], ask: 'hyp', ans: 10, o: ['8 m', '10 m', '12 m', '14 m'], unit: 'm' },
  { kind: 'pole', title: 'Tali Tiang Bendera', story: 'Seutas tali 25 m diikat dari puncak tiang ke sebuah patok di tanah. Patok berjarak 7 m dari kaki tiang.',
    q: 'Berapa tinggi tiang bendera?', legs: [0, 7], hypLen: 25, ask: 'leg', ans: 24, o: ['18 m', '24 m', '26 m', '32 m'], unit: 'm' },
  { kind: 'field', title: 'Lapangan Latihan', story: 'Penjelajah berlari menyilang dari satu sudut ke sudut seberang pada lapangan berukuran 40 m × 30 m.',
    q: 'Berapa jarak lintasan diagonal tersebut?', legs: [30, 40], ask: 'hyp', ans: 50, o: ['45 m', '50 m', '55 m', '70 m'], unit: 'm' },
  { kind: 'pole', skin: 'tower', title: 'Kabel Jembatan', story: 'Seperti Jembatan Teluk Hangzhou, kabel pancang dibentang dari puncak tiang setinggi 24 m ke jalan, 7 m dari kaki tiang.',
    q: 'Berapa panjang kabel pancang tersebut?', legs: [24, 7], ask: 'hyp', ans: 25, o: ['17 m', '25 m', '28 m', '31 m'], unit: 'm' },
  { kind: 'pole', skin: 'tower', title: 'Menara Istana', story: 'Kabel bantu dipasang dari puncak menara setinggi 21 m ke titik di tanah sejauh 20 m dari kaki menara.',
    q: 'Berapa panjang kabel bantu tersebut?', legs: [21, 20], ask: 'hyp', ans: 29, o: ['29 m', '31 m', '41 m', '27 m'], unit: 'm' }
];

/* ---------------- GAME D: TANTANGAN AKHIR (bank soal campuran) ---------------- */
PP.POOL_D = [
  { q: 'Sisi miring (hipotenusa) segitiga siku-siku selalu terletak di hadapan…', o: ['Sudut lancip terkecil', 'Sudut siku-siku', 'Sisi alas', 'Sisi tegak'], a: 1, e: 'Hipotenusa berada di hadapan sudut siku-siku dan merupakan sisi terpanjang.' },
  { q: 'Sisi siku-siku sebuah segitiga adalah 9 cm dan 40 cm. Panjang sisi miringnya…', o: ['31 cm', '41 cm', '49 cm', '43 cm'], a: 1, e: 'c² = 9² + 40² = 81 + 1.600 = 1.681, jadi c = 41 cm.', chk: 'Math.hypot(9,40)', ans: '41' },
  { q: 'Sisi miring 29 cm dan salah satu sisi siku-sikunya 21 cm. Sisi siku-siku yang lain…', o: ['8 cm', '20 cm', '25 cm', '50 cm'], a: 1, e: 'b² = 29² − 21² = 841 − 441 = 400, jadi b = 20 cm.', chk: 'Math.sqrt(29*29-21*21)', ans: '20' },
  { q: 'Segitiga dengan sisi 8 cm, 15 cm, dan 17 cm adalah…', o: ['Siku-siku, karena 8² + 15² = 17²', 'Bukan siku-siku, karena 8 + 15 ≠ 17', 'Bukan siku-siku, karena 8² + 15² ≠ 17²', 'Siku-siku, karena 8 + 15 > 17'], a: 0, e: '8² + 15² = 64 + 225 = 289 = 17². Kebalikan Teorema Pythagoras terpenuhi.', chk: '8*8+15*15-17*17', ans: '0' },
  { q: 'Segitiga dengan sisi 6 cm, 7 cm, dan 9 cm…', o: ['Siku-siku', 'Bukan siku-siku, karena 6² + 7² = 85 ≠ 9² = 81', 'Siku-siku, karena 6 + 7 > 9', 'Siku-siku, karena 9 sisi terpanjang'], a: 1, e: '6² + 7² = 36 + 49 = 85, sedangkan 9² = 81. Tidak sama, jadi bukan segitiga siku-siku.', chk: '6*6+7*7', ans: '85' },
  { q: 'Jarak antara titik (−2, 1) dan (4, 9) pada bidang koordinat adalah…', o: ['8 satuan', '14 satuan', '10 satuan', '12 satuan'], a: 2, e: 'Selisih x = 6 dan selisih y = 8. Jarak = √(6² + 8²) = √100 = 10.', chk: 'Math.hypot(4-(-2),9-1)', ans: '10' },
  { q: 'Persegi panjang berukuran 12 cm × 5 cm. Panjang diagonalnya adalah…', o: ['17 cm', '7 cm', '13 cm', '60 cm'], a: 2, e: 'd² = 12² + 5² = 144 + 25 = 169, jadi d = 13 cm.', chk: 'Math.hypot(12,5)', ans: '13' },
  { q: 'Segitiga sama kaki memiliki sisi sama panjang 13 cm dan alas 10 cm. Tinggi segitiga adalah…', o: ['8 cm', '12 cm', '15 cm', '23 cm'], a: 1, e: 'Garis tinggi membagi alas menjadi 5 cm. t² = 13² − 5² = 169 − 25 = 144, jadi t = 12 cm.', chk: 'Math.sqrt(13*13-5*5)', ans: '12' },
  { q: 'Dengan rumus triple Pythagoras (m² − n², 2mn, m² + n²) untuk m = 3 dan n = 2, ketiga sisinya adalah…', o: ['(3, 4, 5)', '(5, 12, 13)', '(8, 15, 17)', '(6, 8, 10)'], a: 1, e: 'm² − n² = 9 − 4 = 5, 2mn = 12, m² + n² = 13. Jadi (5, 12, 13).', chk: '3*3+2*2', ans: '13' },
  { q: 'Luas persegi pada dua sisi siku-siku segitiga adalah 36 cm² dan 64 cm². Panjang sisi miringnya…', o: ['10 cm', '14 cm', '100 cm', '28 cm'], a: 0, e: 'Luas persegi sisi miring = 36 + 64 = 100 cm², jadi sisi miring = √100 = 10 cm.', chk: 'Math.sqrt(36+64)', ans: '10' },
  { q: 'Rina berjalan 6 km ke timur, lalu 8 km ke utara. Jarak terdekat Rina dari titik awal adalah…', o: ['14 km', '2 km', '10 km', '48 km'], a: 2, e: 'Lintasan membentuk segitiga siku-siku. Jarak = √(6² + 8²) = √100 = 10 km.', chk: 'Math.hypot(6,8)', ans: '10' },
  { q: 'Sebuah kapal berlayar 15 km ke barat, lalu 20 km ke selatan. Jarak kapal dari pelabuhan sekarang…', o: ['35 km', '25 km', '5 km', '30 km'], a: 1, e: 'Jarak = √(15² + 20²) = √(225 + 400) = √625 = 25 km.', chk: 'Math.hypot(15,20)', ans: '25' },
  { q: 'Tangga 2,5 m bersandar pada dinding. Kaki tangga berjarak 1,5 m dari dinding. Tinggi ujung tangga dari lantai…', o: ['1 m', '2 m', '3 m', '4 m'], a: 1, e: 't² = 2,5² − 1,5² = 6,25 − 2,25 = 4, jadi t = 2 m.', chk: 'Math.sqrt(2.5*2.5-1.5*1.5)', ans: '2' },
  { q: 'Diagonal sebuah persegi adalah 10√2 cm. Panjang sisi persegi tersebut…', o: ['5 cm', '10 cm', '20 cm', '10√2 cm'], a: 1, e: 's² + s² = (10√2)² = 200, jadi 2s² = 200, s² = 100, s = 10 cm.', chk: 'Math.sqrt(200/2)', ans: '10' }
];

/* ---------------- KUIS INTERAKTIF (15 soal) ---------------- */
PP.QUIZ = [
  { lv: 'Mudah', q: 'Segitiga siku-siku adalah segitiga yang salah satu sudutnya berukuran…', o: ['45°', '60°', '90°', '180°'], a: 2, e: 'Segitiga siku-siku memiliki satu sudut siku-siku, yaitu 90°.' },
  { lv: 'Mudah', q: 'Sisi terpanjang pada segitiga siku-siku disebut…', o: ['Sisi alas', 'Sisi miring (hipotenusa)', 'Sisi tegak', 'Sisi sejajar'], a: 1, e: 'Sisi di hadapan sudut siku-siku disebut sisi miring atau hipotenusa. Sisi ini selalu yang terpanjang.' },
  { lv: 'Mudah', q: 'Jika sisi miring dinamai c dan dua sisi lainnya a dan b, rumus Teorema Pythagoras adalah…', o: ['c = a + b', 'c² = a + b', 'c² = a² − b²', 'c² = a² + b²'], a: 3, e: 'Kuadrat sisi miring sama dengan jumlah kuadrat kedua sisi siku-siku: c² = a² + b².' },
  { lv: 'Mudah', q: 'Dua sisi siku-siku sebuah segitiga adalah 3 cm dan 4 cm. Panjang sisi miringnya…', o: ['5 cm', '6 cm', '7 cm', '25 cm'], a: 0, e: 'c² = 3² + 4² = 9 + 16 = 25, jadi c = 5 cm.', chk: 'Math.hypot(3,4)', ans: '5' },
  { lv: 'Mudah', q: 'Pada segitiga siku-siku, luas persegi pada sisi miring sama dengan…', o: ['Selisih luas persegi pada kedua sisi siku-siku', 'Jumlah luas persegi pada kedua sisi siku-siku', 'Dua kali luas persegi pada sisi alas', 'Hasil kali luas persegi pada kedua sisi siku-siku'], a: 1, e: 'Inilah makna geometris Teorema Pythagoras: luas persegi pada sisi miring = jumlah luas persegi pada kedua sisi lainnya.' },
  { lv: 'Sedang', q: 'Segitiga siku-siku memiliki sisi miring 13 cm dan satu sisi siku-siku 5 cm. Sisi siku-siku yang lain adalah…', o: ['8 cm', '10 cm', '12 cm', '18 cm'], a: 2, e: 'b² = 13² − 5² = 169 − 25 = 144, jadi b = 12 cm.', chk: 'Math.sqrt(13*13-5*5)', ans: '12' },
  { lv: 'Sedang', q: 'Seutas tali 17 m dihubungkan dari ujung atas tiang ke patok di tanah yang berjarak 8 m dari kaki tiang. Tinggi tiang adalah…', o: ['15 m', '9 m', '12 m', '25 m'], a: 0, e: 't² = 17² − 8² = 289 − 64 = 225, jadi t = 15 m.', chk: 'Math.sqrt(17*17-8*8)', ans: '15' },
  { lv: 'Sedang', q: 'Sebuah persegi panjang memiliki panjang diagonal 14,5 cm dan panjang 10,5 cm. Lebar persegi panjang tersebut…', o: ['8 cm', '9 cm', '12 cm', '10 cm'], a: 3, e: 'l² = 14,5² − 10,5² = 210,25 − 110,25 = 100, jadi l = 10 cm.', chk: 'Math.sqrt(14.5*14.5-10.5*10.5)', ans: '10' },
  { lv: 'Sedang', q: 'Manakah yang merupakan triple Pythagoras?', o: ['4, 5, 6', '6, 8, 10', '5, 6, 7', '7, 8, 9'], a: 1, e: '6² + 8² = 36 + 64 = 100 = 10². Tiga bilangan lainnya tidak memenuhi c² = a² + b².', chk: '6*6+8*8', ans: '100' },
  { lv: 'Sedang', q: 'Tangga 2,5 m bersandar pada dinding. Jarak kaki tangga ke dinding 1,5 m. Tinggi dinding yang dicapai ujung tangga adalah…', o: ['1 m', '3 m', '2 m', '4 m'], a: 2, e: 't² = 2,5² − 1,5² = 6,25 − 2,25 = 4, jadi t = 2 m.', chk: 'Math.sqrt(2.5*2.5-1.5*1.5)', ans: '2' },
  { lv: 'Sedang', q: 'Lapangan berbentuk persegi panjang berukuran 24 m × 7 m. Panjang diagonal lapangan adalah…', o: ['25 m', '31 m', '26 m', '30 m'], a: 0, e: 'd² = 24² + 7² = 576 + 49 = 625, jadi d = 25 m.', chk: 'Math.hypot(24,7)', ans: '25' },
  { lv: 'Sulit', q: 'Sebuah segitiga memiliki sisi 12 cm, 16 cm, dan 20 cm. Pernyataan yang benar adalah…', o: ['Bukan siku-siku, karena 12 + 16 ≠ 20', 'Siku-siku, karena 12 + 16 > 20', 'Bukan siku-siku, karena 12² + 16² ≠ 20²', 'Siku-siku, karena 12² + 16² = 20²'], a: 3, e: '12² + 16² = 144 + 256 = 400 = 20². Berdasarkan kebalikan Teorema Pythagoras, segitiga tersebut siku-siku.', chk: '12*12+16*16-20*20', ans: '0' },
  { lv: 'Sulit', q: 'Trapesium siku-siku ABCD dengan AB sejajar CD dan AD tegak lurus AB. Diketahui AB = 34 cm, CD = 27 cm, dan AD = 24 cm. Keliling trapesium adalah…', o: ['100 cm', '110 cm', '120 cm', '85 cm'], a: 1, e: 'Tarik garis tinggi dari C ke AB, sisa alas = 34 − 27 = 7 cm. BC = √(24² + 7²) = 25 cm. Keliling = 34 + 25 + 27 + 24 = 110 cm.', chk: '34+27+24+Math.hypot(24,7)', ans: '110' },
  { lv: 'Sulit', q: 'Pada bidang koordinat, jarak titik P(1, 2) ke titik Q(7, 10) adalah…', o: ['8 satuan', '12 satuan', '10 satuan', '14 satuan'], a: 2, e: 'Selisih x = 6 dan selisih y = 8. PQ = √(6² + 8²) = √100 = 10 satuan.', chk: 'Math.hypot(7-1,10-2)', ans: '10' },
  { lv: 'Sulit', q: 'Dengan rumus triple Pythagoras (m² − n², 2mn, m² + n²), untuk m = 5 dan n = 2, panjang sisi miringnya adalah…', o: ['29', '21', '20', '35'], a: 0, e: 'Sisi miring = m² + n² = 25 + 4 = 29. (Sisi lainnya 21 dan 20, dan 21² + 20² = 441 + 400 = 841 = 29².)', chk: '5*5+2*2', ans: '29' }
];

/* ---------------- LENCANA ---------------- */
PP.BADGES = [
  { id: 'm1', name: 'Pembuka Gerbang', desc: 'Selesaikan Pos 1', icon: 'star_bronze' },
  { id: 'm2', name: 'Penjelajah Hutan', desc: 'Selesaikan Pos 2', icon: 'star_bronze' },
  { id: 'm3', name: 'Raja Persegi', desc: 'Selesaikan Pos 3', icon: 'star_silver' },
  { id: 'm4', name: 'Penemu Rumus', desc: 'Selesaikan Pos 4', icon: 'star_silver' },
  { id: 'm5', name: 'Penyeberang Jembatan', desc: 'Selesaikan Pos 5', icon: 'star_gold' },
  { id: 'm6', name: 'Penakluk Istana', desc: 'Selesaikan Pos 6', icon: 'star_gold' },
  { id: 'finish', name: 'Pythagoras Sejati', desc: 'Capai FINISH', icon: 'crown' },
  { id: 'reader', name: 'Pembaca Setia', desc: 'Buka semua halaman materi', icon: 'ic_book' },
  { id: 'explorer', name: 'Ilmuwan Cilik', desc: 'Coba eksplorasi interaktif', icon: 'ic_gear' },
  { id: 'quiz80', name: 'Kuis Master', desc: 'Nilai kuis 80 atau lebih', icon: 'ribbon' },
  { id: 'perfect', name: 'Sempurna!', desc: 'Skor 100 pada kuis atau game', icon: 'ic_trophy' },
  { id: 'reflect', name: 'Pemikir Bijak', desc: 'Simpan refleksi', icon: 'ic_medal' },
  { id: 'lv5', name: 'Level 5', desc: 'Capai level 5', icon: 'chest_small' }
];

/* ---------------- PESAN MOTIVASI ---------------- */
PP.MSG = {
  right: ['Hebat! Jawabanmu benar!', 'Tepat sekali, petualang!', 'Keren! Kamu makin jago!', 'Luar biasa! Lanjutkan!', 'Mantap! Rumusnya kamu kuasai!'],
  wrong: ['Jangan menyerah, coba sekali lagi!', 'Hampir benar! Periksa lagi langkahmu.', 'Tidak apa-apa, salah itu bagian dari belajar.', 'Ayo semangat, kamu pasti bisa!'],
  done: ['Hebat! Kamu berhasil menyelesaikan misi!', 'Misi selesai! Petualanganmu makin seru!']
};
PP.pick = a => a[Math.floor(Math.random() * a.length)];

/* ---------------- VIDEO (guru dapat mengisi `src`) ----------------
   Letakkan file MP4 di assets/video/ lalu isi src, contoh: 'assets/video/segitiga-siku-siku.mp4'
   Atau isi tautan video MP4/YouTube pada halaman Video Animasi (tersimpan di perangkat). */
PP.VIDEOS = [
  { id: 'v1', title: 'Mengenal Segitiga Siku-Siku', desc: 'Pengantar sudut 90°, sisi alas, sisi tegak, dan sisi miring.', src: '' },
  { id: 'v2', title: 'Menemukan Teorema Pythagoras', desc: 'Animasi persegi pada ketiga sisi dan pembuktian c² = a² + b².', src: '' },
  { id: 'v3', title: 'Pythagoras dalam Kehidupan', desc: 'Tangga, diagonal lapangan, dan jarak terpendek dua titik.', src: '' }
];
