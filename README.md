# Petualangan Pythagoras — Paket Lengkap

Game edukasi Teorema Pythagoras (pixel art 8-bit). HTML + CSS + JavaScript murni,
tanpa framework dan tanpa proses build. Buka `game/index.html` (atau jalankan server
statis, mis. `python3 -m http.server` di folder `game/`).

## Isi paket
- `game/` — seluruh proyek siap pakai
  - `index.html` — kerangka halaman (HUD, kontainer #app, dock navigasi, panel audio)
  - `css/style.css` — seluruh gaya; tata letak satu layar (100dvh), tanpa scroll halaman
  - `js/data.js` — konten: tujuan, pos, soal, kuis, lencana
  - `js/store.js` — penyimpanan localStorage, XP, level, bintang, misi, lencana
  - `js/audio-config.js` — **daftar semua audio** + pemetaan event -> suara + musik per halaman
  - `js/audio.js` — mesin audio (musik loop, efek tanpa saling menimpa, volume & ON/OFF terpisah, buka kunci autoplay)
  - `js/viz.js` — gambar SVG segitiga, persegi, adegan
  - `js/app.js` — router, HUD, dock, menu 3x3, peta, pos, finish, profil, panel suara
  - `js/materi.js` — materi (dibagi slide lewat `PP.book`), eksplorasi interaktif
  - `js/explore.js` — **mode Jelajah Dunia** (dunia terbuka 2D, joystick, warga bertanya dari PP.QUIZ, koin, lemari, 3 dunia & portal)
  - `js/firebase-config.js`, `js/online.js`, `js/papan.js` — **mode online**: ruangan, kirim skor, papan peringkat (Firebase REST)
  - `database.rules.json`, `PETUNJUK_FIREBASE.md` — aturan database dan panduan penyambungan
  - `js/games.js` — Game A–D; `js/quiz.js` — kuis; `js/report.js` — video, refleksi, penilaian
  - `assets/img/` — sprite karakter, bangunan, logo (lama); `assets/img/new/` — ikon & dekorasi dari paket baru; `bg_village.svg`, `cloud.svg`
  - `assets/audio/sfx/` 01–08 `.wav`; `assets/audio/bgm/` 09 `.wav` + 5 musik latar `.mp3`
- `sumber_asli/ikon_animasi_asli/` — sprite sheet & GIF asli dari paket ikon
- `sumber_asli/paket_sound_asli/` — 9 WAV asli + petunjuk
- `alat/potong_sprite.py` — skrip Python (PIL, scipy) yang memotong sprite sheet menjadi `assets/img/new/*`
- `PETUNJUK_AUDIO.txt` — ringkasan struktur audio

## Peta audio (event -> file)
| Event | File |
|---|---|
| click / tick / quizSelect | 01_klik_tombol.wav |
| page / start / end / selectPos | 02_perpindahan_menu.wav |
| correct | 03_jawaban_benar.wav |
| wrong | 04_jawaban_salah.wav |
| mission | 05_misi_selesai.wav |
| star / point | 06_bintang_hadiah.wav |
| unlock | 07_lokasi_baru_terbuka.wav |
| victory | 08_kemenangan_akhir.wav |
| musik halaman Eksplorasi | 09_musik_latar_eksplorasi_loop.wav |
Memutar suara dari kode: `PPAudio.sfx('correct')`. Musik halaman diatur di `sceneMusic`.

## Catatan pengembangan ke platform lain
- Logika game ada di `js/*.js` dan memakai objek global `PP`, `PPStore`, `PPAudio`, `PPViz`.
- Progres tersimpan di localStorage kunci `pp_save_v1`; pengaturan suara di `pp_audio_v1`.
- Rute memakai hash (`#menu`, `#peta`, `#pos-1`, `#materi-3`, `#game-A`, `#kuis`, ...).
- Untuk Capacitor/Cordova/WebView: cukup bungkus folder `game/`. Untuk Unity/Godot/Flutter,
  pakai folder `assets/` dan `js/data.js` sebagai sumber konten.
- Font Pixelify Sans & Nunito dimuat dari Google Fonts (ada font cadangan bila offline).

## Mode Jelajah Dunia (baru)
- Rute `#jelajah`. Berjalan dengan joystick (komputer: panah/WASD, Shift lari, E/Spasi bicara).
- 15 warga bertanda "!" mengajukan soal dari `PP.QUIZ` (Mudah -> Desa, Sedang -> Hutan, Sulit -> Kota).
- Dunia, posisi warga, bangunan, portal: konstanta `WORLDS` di atas `js/explore.js`. Tambah dunia = tambah satu objek di array itu.
- Progres di `PPStore.data.explore` (koin, soal terjawab, dunia selesai, aksesori). Lencana baru: `jelajah`.

## Mode online (baru)
- Isi `js/firebase-config.js` (alamat Realtime Database). Panduan lengkap: `game/PETUNJUK_FIREBASE.md`; aturan: `game/database.rules.json`.
- Profil menerima **kode ruangan**; skor kuis dikirim otomatis; rute `#papan` menampilkan peringkat bersama (auto-refresh 6 dtk).
- Tanpa konfigurasi, game berjalan seperti biasa (fitur online nonaktif).
