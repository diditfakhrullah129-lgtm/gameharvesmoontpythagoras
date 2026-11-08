/* =========================================================
   PETUALANGAN PYTHAGORAS — KONFIGURASI AUDIO TERPUSAT
   ---------------------------------------------------------
   Cara menambah audio baru:
   1. Letakkan file di folder assets/audio/<kategori>/ (mp3/wav/ogg/m4a).
   2. Pada daftar `tracks` di bawah, isi `file` dengan nama file Anda
      lalu ubah `available: false` menjadi `available: true`.
   3. Selesai. Tidak perlu membangun ulang game.

   Status:
   - available: true  -> file ada dan akan dimuat. Jika ternyata gagal
                         dimuat, aplikasi otomatis menonaktifkannya.
   - available: false -> file belum diunggah. Tidak ada permintaan jaringan.
                         Efek suara memakai `synth` (nada sintetis bawaan
                         Web Audio) bila ada; musik/suara/narasi dilewati.
   ========================================================= */
window.PP_AUDIO_CONFIG = {
  basePath: 'assets/audio/',

  // Pengali volume per kategori (dikalikan dengan slider pengguna)
  categories: {
    bgm:       { channel: 'music',     gain: 1.0 },
    character: { channel: 'narration', gain: 1.0 },
    narration: { channel: 'narration', gain: 1.0 },
    sfx:       { channel: 'sfx',       gain: 1.0 },
    quiz:      { channel: 'sfx',       gain: 1.0 },
    mission:   { channel: 'sfx',       gain: 1.0 },
    victory:   { channel: 'sfx',       gain: 1.0 }
  },

  tracks: {
    /* ---------- MUSIK LATAR (file asli dari guru) ---------- */
    bgm_main_theme: { file: 'bgm/bgm_main_theme.mp3', category: 'bgm', loop: true, volume: 0.70, available: true,
                      source: '01_Title.mp3', use: 'Halaman pembuka, profil, petunjuk, dan FINISH' },
    bgm_adventure:  { file: 'bgm/bgm_adventure.mp3',  category: 'bgm', loop: true, volume: 0.70, available: true,
                      source: '02_Spring.mp3', use: 'Peta petualangan dan kartu pos' },
    bgm_learning:   { file: 'bgm/bgm_learning.mp3',   category: 'bgm', loop: true, volume: 0.55, available: true,
                      source: '19_Town.mp3', use: 'Menu utama, tujuan, materi, video, eksplorasi, refleksi, penilaian' },
    bgm_game:       { file: 'bgm/bgm_game.mp3',       category: 'bgm', loop: true, volume: 0.55, available: true,
                      source: '12_Minigame_1.mp3', use: 'Game A, Game B, dan kuis (volume lebih rendah)' },
    bgm_race:       { file: 'bgm/bgm_race.mp3',       category: 'bgm', loop: true, volume: 0.55, available: true,
                      source: '13_Minigame_2_Race.mp3', use: 'Game C (Misi Jembatan) dan Game D (Tantangan Akhir)' },

    /* ---------- SUARA KARAKTER (belum diunggah) ---------- */
    character_greeting: { file: 'character/character_greeting.mp3', category: 'character', volume: 1, available: false, use: 'Sapaan karakter di halaman pembuka' },
    character_mission:  { file: 'character/character_mission.mp3',  category: 'character', volume: 1, available: false, use: 'Petunjuk saat memasuki misi' },
    character_praise:   { file: 'character/character_praise.mp3',   category: 'character', volume: 1, available: false, use: 'Pujian saat misi selesai' },
    character_retry:    { file: 'character/character_retry.mp3',    category: 'character', volume: 1, available: false, use: 'Semangat saat jawaban salah' },

    /* ---------- NARASI MATERI (belum diunggah) ---------- */
    narration_materi_1: { file: 'narration/narration_materi_1.mp3', category: 'narration', volume: 1, available: false, use: 'Narasi Materi 1: Segitiga siku-siku' },
    narration_materi_2: { file: 'narration/narration_materi_2.mp3', category: 'narration', volume: 1, available: false, use: 'Narasi Materi 2: Sisi-sisi segitiga' },
    narration_materi_3: { file: 'narration/narration_materi_3.mp3', category: 'narration', volume: 1, available: false, use: 'Narasi Materi 3: Konsep Teorema Pythagoras' },
    narration_materi_3b:{ file: 'narration/narration_materi_3b.mp3',category: 'narration', volume: 1, available: false, use: 'Narasi Pembuktian Teorema Pythagoras' },
    narration_materi_4: { file: 'narration/narration_materi_4.mp3', category: 'narration', volume: 1, available: false, use: 'Narasi Materi 4: Contoh perhitungan' },
    narration_materi_5: { file: 'narration/narration_materi_5.mp3', category: 'narration', volume: 1, available: false, use: 'Narasi Materi 5: Penerapan sehari-hari' },
    narration_materi_6: { file: 'narration/narration_materi_6.mp3', category: 'narration', volume: 1, available: false, use: 'Narasi Materi 6: Kebalikan teorema & triple' },

    /* ---------- EFEK SUARA (9 file WAV dari guru) ---------- */
    sfx_klik:       { file: 'sfx/01_klik_tombol.wav',          category: 'sfx',     volume: 0.8, available: true, synth: 'click',   use: 'Setiap tombol ditekan' },
    sfx_menu:       { file: 'sfx/02_perpindahan_menu.wav',     category: 'sfx',     volume: 0.8, available: true, synth: 'page',    use: 'Berpindah halaman / menu' },
    sfx_benar:      { file: 'quiz/03_jawaban_benar.wav',       category: 'quiz',    volume: 0.9, available: true, synth: 'correct', use: 'Jawaban benar' },
    sfx_salah:      { file: 'quiz/04_jawaban_salah.wav',       category: 'quiz',    volume: 0.9, available: true, synth: 'wrong',   use: 'Jawaban salah' },
    sfx_misi:       { file: 'mission/05_misi_selesai.wav',     category: 'mission', volume: 1.0, available: true, synth: 'mission', use: 'Misi selesai' },
    sfx_bintang:    { file: 'mission/06_bintang_hadiah.wav',   category: 'mission', volume: 0.9, available: true, synth: 'star',    use: 'Bintang / hadiah' },
    sfx_lokasi:     { file: 'mission/07_lokasi_baru_terbuka.wav', category: 'mission', volume: 0.9, available: true, synth: 'select', use: 'Lokasi baru terbuka' },
    sfx_kemenangan: { file: 'victory/08_kemenangan_akhir.wav', category: 'victory', volume: 1.0, available: true, synth: 'victory', use: 'Seluruh permainan selesai' },
    /* Musik eksplorasi tambahan (belum dipasang di halaman mana pun agar BGM lama tetap dipakai).
       Untuk memakainya, ganti nilai di sceneMusic, mis. peta: 'bgm_explore'. */
    bgm_explore:    { file: 'bgm/09_musik_latar_eksplorasi_loop.wav', category: 'bgm', loop: true, volume: 0.5, available: true, use: 'Musik eksplorasi (opsional)' }
  },

  /* Musik latar per halaman. Perpindahan antar-halaman memakai crossfade
     dan hanya satu musik yang dimainkan pada satu waktu. */
  sceneMusic: {
    splash: 'bgm_main_theme', petunjuk: 'bgm_main_theme', profil: 'bgm_main_theme', finish: 'bgm_main_theme',
    menu: 'bgm_learning', tujuan: 'bgm_learning', materi: 'bgm_learning', video: 'bgm_learning',
    eksplorasi: 'bgm_learning', refleksi: 'bgm_learning', nilai: 'bgm_learning',
    peta: 'bgm_adventure', pos: 'bgm_adventure', dunia: 'bgm_adventure', jelajah: 'bgm_race',
    games: 'bgm_game', 'game-A': 'bgm_game', 'game-B': 'bgm_game',
    'game-C': 'bgm_race', 'game-D': 'bgm_race',
    kuis: 'bgm_game'
  },
  // Pengali volume musik pada halaman tertentu (kuis dibuat lebih pelan)
  sceneGain: { kuis: 0.6, jelajah: 0.8 },

  /* Peristiwa -> trek efek suara. null = tanpa suara file.
     Satu klik tidak pernah memicu dua suara: lihat aturan di audio.js */
  events: {
    click: 'sfx_klik', tick: 'sfx_klik', quizSelect: 'sfx_klik',
    page: 'sfx_menu', start: 'sfx_menu', end: 'sfx_menu', selectPos: 'sfx_menu', quizFinish: 'sfx_menu',
    correct: 'sfx_benar', wrong: 'sfx_salah',
    mission: 'sfx_misi', star: 'sfx_bintang', unlock: 'sfx_lokasi', victory: 'sfx_kemenangan',
    point: null
  },
  quiet: { tick: 0.6, quizSelect: 0.8 }   // pengali volume per peristiwa
};
