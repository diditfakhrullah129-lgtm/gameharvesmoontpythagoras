# Menyambungkan Game ke Firebase (papan peringkat bersama)

Game memakai **Firebase Realtime Database** lewat REST. Tidak perlu menginstal apa pun.
Yang Anda butuhkan: akun Google (gratis, paket Spark sudah cukup untuk satu sekolah).

## 1. Buat project
1. Buka https://console.firebase.google.com lalu **Tambahkan project** (Add project).
2. Beri nama, mis. `pythagoras-kelas8`. Google Analytics boleh dimatikan.

## 2. Buat Realtime Database
1. Menu kiri **Build > Realtime Database > Create Database**.
2. Pilih lokasi terdekat (mis. `asia-southeast1` Singapura).
3. Pilih **Start in locked mode** (aturan dipasang di langkah 3).
4. Salin alamat di bagian atas halaman Data, bentuknya
   `https://NAMA-PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app`

## 3. Pasang aturan akses
Tab **Rules**, hapus isinya, tempel seluruh isi file `database.rules.json`, klik **Publish**.
Aturan ini hanya mengizinkan data di `pythagoras/rooms/KODE/players/...`, memeriksa bentuk dan batas nilai
(nama maksimal 40 huruf, skor 0 sampai 100), dan menolak data lain.

## 4. Tempel alamat ke game
Buka `js/firebase-config.js`, isi:
```js
window.PP_FIREBASE = {
  databaseURL: 'https://NAMA-PROJECT-default-rtdb.asia-southeast1.firebasedatabase.app',
  root: 'pythagoras'
};
```

## 5. Pasang game di internet
Siswa harus membuka game lewat alamat web, bukan file di komputer. Pilihan gratis:
- **Firebase Hosting** (satu project yang sama): `npm i -g firebase-tools`, `firebase login`, `firebase init hosting`
  (folder publik = folder game), lalu `firebase deploy`.
- Netlify Drop (https://app.netlify.com/drop): seret folder `game/`.
- GitHub Pages.

## 6. Dipakai di kelas
1. Guru membuka game, menu **Profil**, mengisi nama, lalu menekan **Buat kode** (mis. `KQ7M42`) dan **Simpan Profil**.
2. Guru membagikan kode itu, atau tautan `https://ALAMAT-GAME/?room=KQ7M42` (tombol **Salin** di Papan Peringkat).
3. Siswa mengisi nama dan kode ruangan di Profil. Skor terkirim otomatis setiap kuis selesai.
4. Papan Peringkat (tombol **Peringkat** di Menu Utama atau setelah kuis) memperbarui diri tiap 6 detik.

Urutan peringkat: nilai kuis tertinggi, lalu nilai akhir, lalu siapa yang lebih dulu.
Tiap kelas memakai kode berbeda supaya papannya terpisah.

## Melihat atau menghapus data
Console Firebase > Realtime Database > Data > `pythagoras/rooms/KODE`. Hapus satu ruangan dengan menghapus simpulnya.

## Batasan yang perlu diketahui
- Tanpa login, siapa pun yang tahu kode ruangan dapat membaca papannya, dan pemain yang menguasai alat pengembang browser
  dapat menulis skor palsu atas namanya sendiri. Cukup untuk kelas. Untuk ujian bernilai tinggi, tambahkan
  Firebase Authentication (anonim) lalu ubah aturan memakai `auth.uid`.
- Kode ruangan dibuat acak 6 karakter supaya sulit ditebak. Jangan memakai kode yang mudah seperti `KELAS8`.
- Paket gratis Spark: 1 GB data dan 10 GB unduhan per bulan, jauh di atas kebutuhan satu sekolah.
