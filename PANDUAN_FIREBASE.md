# Panduan Menyambungkan Firebase (±10 menit)

Game ini memakai **Firebase Realtime Database** lewat REST, jadi tidak perlu memasang pustaka apa pun.
Yang perlu kamu lakukan hanya membuat proyek, menyalin satu alamat, dan menempelkan aturan akses.

## 1. Buat proyek Firebase
1. Buka https://console.firebase.google.com lalu masuk dengan akun Google.
2. **Add project** → beri nama (mis. `pythagoras-kelas`) → boleh matikan Google Analytics → **Create project**.

## 2. Buat Realtime Database
1. Menu kiri **Build → Realtime Database → Create Database**.
2. Pilih lokasi **Singapore (asia-southeast1)** (paling dekat dengan Indonesia).
3. Pilih **Start in locked mode** → **Enable**.
4. Di bagian atas tab **Data** ada alamat seperti
   `https://pythagoras-kelas-default-rtdb.asia-southeast1.firebasedatabase.app` → **salin**.

## 3. Izinkan akses (Rules)
1. Tab **Rules** → hapus isi lama → tempel seluruh isi file `firebase-rules.json` → **Publish**.
2. Aturan ini mengizinkan siswa menulis skor sendiri dan membaca papan ruangannya, memeriksa bentuk data
   (nama maks. 20 huruf, nilai 0–100) dan **tidak** membolehkan orang membaca daftar semua ruangan.

## 4. Tempel alamat di game
Buka `js/firebase-config.js`, isi:

```js
window.PP_FIREBASE = {
  databaseURL: 'https://pythagoras-kelas-default-rtdb.asia-southeast1.firebasedatabase.app'
};
```

## 5. Taruh game di internet (agar semua siswa bisa buka)
Firebase hanya menyimpan data, game-nya tetap perlu "rumah" di internet. Pilih salah satu (semua gratis):
- **Firebase Hosting**: `npm i -g firebase-tools` → `firebase login` → `firebase init hosting` (folder publik = folder game) → `firebase deploy`.
- **Netlify Drop**: buka https://app.netlify.com/drop lalu seret folder game.
- **GitHub Pages**: unggah folder ke repository → Settings → Pages.

## Cara memakai di kelas
1. Guru menentukan **kode ruangan**, mis. `8A2026` (4–8 huruf/angka), dan menuliskannya di papan.
2. Siswa membuka link game → **Menu → 🏆 Papan Skor** → isi nama dan kode → **Masuk Ruangan**.
3. Setelah kuis selesai, nilai terbaik, jumlah pos, dan XP otomatis dikirim; papan peringkat menyegarkan diri tiap ±4 detik.
4. Beda kelas = beda kode, papan skornya terpisah.

## Catatan keamanan dan etika
- Papan skor ini **tidak memakai login**, cocok untuk kelas. Siswa bisa mengetik nama bebas, jadi ingatkan memakai nama sendiri.
- Jangan simpan data pribadi sensitif; game hanya menyimpan nama panggilan, nilai, XP, dan jumlah pos.
- Menghapus data: Firebase console → Realtime Database → Data → pilih `rooms/KODE` → ikon hapus.
- Paket gratis (Spark) cukup untuk beberapa kelas bermain bersamaan.
