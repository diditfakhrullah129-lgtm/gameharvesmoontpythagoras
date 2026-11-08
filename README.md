# Petualangan Pythagoras
*Jelajahi Misi, Temukan Rumus, Taklukkan Tantangan!*

Game multimedia pembelajaran Teorema Pythagoras untuk SMP/MTs (HTML5 + CSS3 + JavaScript murni, tanpa framework, tanpa API berbayar).

## Cara menjalankan
1. Ekstrak ZIP, lalu buka `index.html` di Chrome/Edge/Firefox (cukup klik dua kali).
2. Untuk dipakai di kelas: unggah seluruh folder ke hosting statis (Google Sites tidak cukup; gunakan GitHub Pages, Netlify, atau server sekolah) atau jalankan `python3 -m http.server` di folder ini.
3. Progres tersimpan di LocalStorage browser. Satu perangkat/browser = satu profil (hapus lewat Profil > Hapus Semua Progres).

Font Pixelify Sans dan Nunito dimuat dari Google Fonts bila ada internet. Tanpa internet game tetap berjalan dengan font cadangan sistem.

## Isi aplikasi
Halaman pembuka, Menu Utama (9 kartu), Tujuan Pembelajaran, Peta Petualangan 6 pos (terkunci bertahap, bintang, FINISH), Materi (7 halaman: 1, 2, 3, pembuktian, 4, 5, 6), Video Animasi (tempat video untuk guru), Eksplorasi Pythagoras (slider a dan b), Game A-D, Kuis 15 soal (timer dapat diatur, pembahasan), Refleksi, Program Penilaian (cetak dan CSV), XP, level, bintang, 13 lencana.

| Pos | Lokasi | Cara menyelesaikan |
|---|---|---|
| 1 | Gerbang Geometri | 3 soal cepat (min. 2 benar) |
| 2 | Hutan Sisi Segitiga | Game A Susun Segitiga (skor >= 50) |
| 3 | Kerajaan Persegi | 3 soal cepat (min. 2 benar) |
| 4 | Lembah Pythagoras | Game B Temukan Panjang Sisi |
| 5 | Jembatan Tantangan | Game C Misi Jembatan |
| 6 | Istana Matematika | Game D Tantangan Akhir |

Bintang: skor >= 90 = 3, >= 70 = 2, >= 50 = 1. Nilai akhir = 40% kuis + 40% rata-rata skor game + 20% progres misi.

## Struktur folder
```
index.html
css/style.css
js/  data.js (materi, soal) · audio-config.js · audio.js · store.js (XP, progres)
     viz.js (gambar SVG) · app.js (router, menu, peta, pos) · materi.js · games.js · quiz.js · report.js
assets/img/    sprite hasil potong dari Asset Pack + latar dunia dan panel perkamen
assets/audio/  bgm/ character/ narration/ sfx/ quiz/ mission/ victory/
assets/video/  tempat video MP4 guru
test/verify-data.js   pemeriksa kunci jawaban: node test/verify-data.js
```

## Audio
Lima musik latar yang diunggah dipasang per halaman dengan crossfade (tidak pernah bertumpuk):

| Halaman | Berkas | Sumber |
|---|---|---|
| Pembuka, Petunjuk, Profil, FINISH | `bgm/bgm_main_theme.mp3` | 01_Title |
| Peta dan Pos | `bgm/bgm_adventure.mp3` | 02_Spring |
| Menu, Tujuan, Materi, Video, Eksplorasi, Refleksi, Penilaian | `bgm/bgm_learning.mp3` | 19_Town |
| Game A, B dan Kuis (volume 60%) | `bgm/bgm_game.mp3` | 12_Minigame_1 |
| Game C dan D | `bgm/bgm_race.mp3` | 13_Minigame_2_Race |

Berkas asli tidak diubah (hanya diganti nama). Pemetaan ada di `js/audio-config.js` (`sceneMusic`).

**Belum diunggah:** suara karakter, narasi materi, dan file efek suara. Efek suara sementara memakai nada sintetis Web Audio bawaan browser (ditandai `synth`, status "sintetis" di panel suara). Suara karakter dan narasi tidak dibuat palsu: tombol narasi nonaktif sampai file ada.

**Menambah audio:** salin file ke `assets/audio/<kategori>/`, buka `js/audio-config.js`, isi `file` dan ubah `available: false` menjadi `true`. Selesai, tanpa membangun ulang. Contoh: `sfx_correct_answer` (kategori quiz), `narration_materi_3`.

## Video
Halaman Video Animasi menampilkan placeholder. Guru dapat (a) memilih file MP4 (hanya sesi itu), (b) menempel tautan MP4/YouTube (tersimpan di perangkat), atau (c) menaruh file di `assets/video/` dan mengisi `src` pada `PP.VIDEOS` di `js/data.js`.

## Aset visual
Sprite (karakter, Pak Guru, burung hantu, bangunan, ikon, bintang, peti, FINISH) dipotong dari `atlas_02_ui_tiles_world.png` dan latarnya dibersihkan dengan skrip. Atlas tidak berisi animasi frame-per-frame, jadi gerak berjalan memakai urutan pose yang tersedia, ditambah animasi CSS (bob, sway, awan, kilau, konfeti). Panel perkamen memakai `parchment_panel_16x9.png`, peta memakai `world_map_background_16x9.png`.

## Materi dan soal
Materi mengacu pada Global Matematika SMP Kelas VIII Bab 2 (kegiatan 3-4-5 dan 5-12-13, dua pembuktian, tabel sisi, kebalikan teorema, triple Pythagoras). Catatan penyusun: dua butir pada PDF tidak dipakai karena data gambarnya tidak konsisten (Contoh 2 jajargenjang dengan AB = 5 dan CD = 9, serta kunci Latihan 1 no. 7b). Semua kunci jawaban diperiksa dengan `node test/verify-data.js`.

---
## Pembaruan 2 — Efek suara, menu baru, tampilan satu halaman

### Struktur audio
```
assets/audio/
├── bgm/        bgm_main_theme.mp3 · bgm_adventure.mp3 · bgm_learning.mp3 · bgm_game.mp3 · bgm_race.mp3   (musik latar lama, tidak diubah)
│               09_musik_latar_eksplorasi_loop.wav   (loop eksplorasi tambahan, belum dipasang — lihat sceneMusic di js/audio-config.js)
├── sfx/        01_klik_tombol.wav · 02_perpindahan_menu.wav
├── quiz/       03_jawaban_benar.wav · 04_jawaban_salah.wav
├── mission/    05_misi_selesai.wav · 06_bintang_hadiah.wav · 07_lokasi_baru_terbuka.wav
└── victory/    08_kemenangan_akhir.wav
```
### Peristiwa → suara (js/audio-config.js → `events`)
| Peristiwa | File |
|---|---|
| tombol ditekan (`click`, `tick`, `quizSelect`) | 01_klik_tombol |
| pindah halaman/menu (`page`, `start`, `end`, `selectPos`, `quizFinish`) | 02_perpindahan_menu |
| jawaban benar / salah | 03 / 04 |
| misi selesai (`mission`) | 05_misi_selesai |
| bintang / hadiah / naik level (`star`) | 06_bintang_hadiah |
| pos baru terbuka (`unlock`) | 07_lokasi_baru_terbuka |
| semua misi selesai, layar FINISH (`victory`) | 08_kemenangan_akhir |

Aturan di `js/audio.js` (`A.sfx`): satu klik = satu suara (debounce 90 ms); klik tidak menimpa suara yang lebih penting; benar & salah tidak pernah bunyi bersamaan; musik diturunkan sebentar saat misi/kemenangan; suara aktif lintas halaman; volume & ON/OFF musik dan efek terpisah (tombol speaker kanan atas); audio mulai setelah sentuhan pertama.

### Tampilan satu halaman (tanpa scroll)
- `css/layout.css` — kerangka 100dvh, HUD ramping, menu & pembuka baru, peta muat satu layar.
- `js/fit.js` — isi layar yang panjang otomatis dipecah menjadi halaman kecil dengan tombol ◀ ▶ / titik halaman / geser jari. Tambahkan kelas `nosplit` pada blok yang tidak boleh dipecah, `nofit` pada layar yang mengatur diri sendiri.
- Aset baru: `assets/img2/` (pohon, rumah, masjid, semak, ikon, sparkle) dari Menu Asset Pack, diskalakan halus.

---
## Pembaruan 3 — Jelajah Dunia 3D (seperti game dunia terbuka)
- Menu → tombol hijau **Jelajah Dunia 3D** → **Peta Dunia** (kartu 6 dunia: Gerbang Geometri … Istana Matematika) → **Masuk**.
- Dunia 3D blok digambar mesin WebGL sendiri (`js/world3d.js`, tanpa pustaka luar, tetap jalan offline). Logika permainan di `js/jelajah.js`, tampilan di `css/jelajah.css`.
- Kontrol: joystick layar (HP) atau WASD/panah, LOMPAT / Spasi, geser layar untuk memutar kamera, tombol **Bicara dengan …** (atau E/Enter) di dekat NPC.
- Tiap dunia: 3 warga bertanda ❗ memberi soal Pythagoras (dialog kuis, boleh mengulang sampai benar), 1 pemandu memberi tips & pintu ke dunia berikutnya, 8 mutiara 💎 (+5 koin), panel misi aktif, koin 🪙, XP/level.
- Misi selesai jika 3 warga terbantu → bintang (sesuai jawaban benar percobaan pertama), membuka dunia berikutnya, efek suara misi/bintang/lokasi baru.
- **Lemari Gaya** 👕: atasan, bawahan, rambut (termasuk kerudung), warna rambut, topi (peci), warna kulit; sebagian gratis, sebagian dibeli dengan koin atau dibuka oleh level.
- Fitur lama (peta 2D, materi, game A–D, kuis, refleksi, penilaian) tetap ada.


## Pembaruan 4 — Main Bersama (online)
- Menu → **🏆 Papan Skor**: pemain mengisi nama dan kode ruangan; nilai kuis terbaik, pos selesai, dan XP dikirim otomatis (juga saat kuis selesai) dan tampil di papan peringkat bersama yang menyegarkan diri.
- Berkas: `js/online.js` (mesin), `js/firebase-config.js` (isi alamat database), `css/online.css`, `firebase-rules.json`, `PANDUAN_FIREBASE.md`.
- Tiga backend otomatis: database bersama halaman artifact Claude, Firebase (REST), dan mode lokal (cadangan satu perangkat bila `databaseURL` kosong).
