# Penjelasan Kode Proyek

Dokumen ini menjelaskan fungsi setiap file kode utama pada proyek `mid_project` dalam bahasa Indonesia.

## 1. Gambaran Umum

Proyek ini adalah aplikasi mobile perpustakaan kampus berbasis:

- `Expo` dan `React Native` untuk frontend mobile.
- `expo-router` untuk routing berbasis folder.
- `Convex` untuk backend, database, query, dan mutation.
- `TypeScript` untuk type safety.

Secara konsep, aplikasi dibagi menjadi 2 peran:

- `student`: mahasiswa yang mencari buku, reservasi buku, melihat pinjaman, booking ruang belajar, dan mengumpulkan poin.
- `librarian`: admin/pustakawan yang mengelola buku, mahasiswa, reservasi, peminjaman, absensi, dan monitoring ruang.

## 2. File Konfigurasi Root

### `package.json`

File ini mendefinisikan metadata proyek, dependency, dan script yang dipakai.

- `main: "expo-router/entry"` berarti entry aplikasi memakai Expo Router.
- `scripts`:
  - `start`: menjalankan Expo.
  - `android`, `ios`, `web`: menjalankan app di target masing-masing.
  - `lint`: menjalankan ESLint.
- `dependencies` berisi library utama seperti `expo`, `react-native`, `expo-router`, `convex`, dan library UI.

### `package-lock.json`

File lock dari npm. Fungsinya mengunci versi dependency agar hasil instalasi konsisten. File ini bukan tempat logika aplikasi.

### `app.json`

Konfigurasi aplikasi Expo.

- Menentukan nama app, icon, splash screen, dan behavior Android/iOS/web.
- `plugins` memuat `expo-router` dan `expo-splash-screen`.
- `experiments.typedRoutes` mengaktifkan typed routes untuk Expo Router.
- `reactCompiler` diaktifkan.

### `tsconfig.json`

Konfigurasi TypeScript untuk frontend.

- Extend dari `expo/tsconfig.base`.
- `strict: true` mengaktifkan pengecekan tipe yang ketat.
- Alias path `@/*` mengarah ke root proyek.

### `eslint.config.js`

Konfigurasi linting proyek.

- Menggunakan `eslint-config-expo`.
- Folder `dist/*` diabaikan dari linting.

### `expo-env.d.ts`

File typing bawaan Expo untuk environment. Tidak berisi logika bisnis.

### `README.md`

Masih README bawaan Expo. Belum menggambarkan proyek perpustakaan ini.

### `GEMINI.md`

Ini bukan file runtime aplikasi. Isinya prompt atau spesifikasi pekerjaan backend Convex: skema tabel, fitur, dan daftar function yang harus dibuat.

### `.env.local`

Dipakai untuk environment variable lokal, terutama `EXPO_PUBLIC_CONVEX_URL`. File ini penting untuk koneksi frontend ke deployment Convex, tapi tidak perlu didokumentasikan isi rahasianya.

## 3. Struktur Routing Aplikasi

### `app/_layout.tsx`

Root layout aplikasi.

- Membuat client `ConvexReactClient` dari `EXPO_PUBLIC_CONVEX_URL`.
- Membungkus aplikasi dengan:
  - `ConvexProvider`
  - `UserProvider`
  - `ThemeProvider`
- Mendefinisikan stack route utama:
  - `index`
  - `login`
  - `tabs`
  - `book-detail/[id]`

Peran file ini: menyatukan backend, user session, tema, dan navigasi global.

### `app/index.tsx`

Halaman splash screen.

- Menampilkan logo dan nama aplikasi `LibroManage`.
- Setelah 2 detik, user diarahkan ke `/login`.

Fungsi file ini lebih ke pengalaman awal aplikasi, bukan autentikasi.

### `app/login.tsx`

Halaman login.

- User memasukkan `email`, `password`, dan memilih role.
- Query login dijalankan ke `api.users.login`.
- Jika berhasil:
  - data user disimpan ke `UserContext`
  - role disimpan ke context
  - user diarahkan ke `/tabs`

Catatan:

- Validasi role dilakukan di frontend dengan membandingkan role pilihan dengan role dari database.
- Password masih dicek plaintext dari backend.

### `app/tabs/_layout.tsx`

Layout tab utama.

- Mendefinisikan 5 tab:
  - `index`
  - `search`
  - `borrowed`
  - `rooms`
  - `profile`
- Judul tab berubah berdasarkan role.
- Icon tab menggunakan `Ionicons` dan animasi `react-native-reanimated`.

File ini adalah router utama setelah login.

### `app/tabs/index.tsx`

Router tab Home.

- Jika role `librarian`, render `AdminDashboard`.
- Jika role `student`, render `StudentHome`.

### `app/tabs/search.tsx`

Router tab Search/Assets.

- `librarian` melihat `AdminBookManagement`.
- `student` melihat `StudentSearch`.

### `app/tabs/borrowed.tsx`

Router tab Loans/My Books.

- `librarian` melihat `AdminBorrowManagement`.
- `student` melihat `StudentBorrowed`.

### `app/tabs/rooms.tsx`

Router tab Reservations/Rooms.

- `librarian` melihat `AdminRoomManagement`.
- `student` melihat `StudentRoomBooking`.

### `app/tabs/profile.tsx`

Router tab Profile/Admin.

- `librarian` melihat `AdminProfile`.
- `student` melihat `StudentProfile`.

### `app/book-detail/[id].tsx`

Halaman detail buku.

- Mengambil `id` dari route.
- Menjalankan query `api.books.getBookById`.
- Menampilkan detail buku, status, kategori, deskripsi, dan pilihan tipe reservasi:
  - `take_home`
  - `in_library`
- Tombol `Reserve Book` memanggil `api.reservation.reserveBook`.

Catatan:

- Status buku bisa `Available`, `Borrowed`, atau `Coming Soon`.
- Tombol favorit di UI sudah ada, tetapi di file ini belum terhubung ke mutation favorit.

## 4. Hooks dan Context

### `hooks/useUser.tsx`

Context untuk user login.

- Menyimpan:
  - `user`
  - `role`
  - `userName`
- Menyediakan `setUser` dan `setRole`.

Fungsi utama file ini adalah session state di sisi frontend. Session belum persisten ke storage.

### `hooks/useTheme.tsx`

Context tema aplikasi.

- Mendefinisikan skema warna `lightColors` dan `darkColors`.
- Menyimpan preferensi dark mode ke `AsyncStorage`.
- Menyediakan:
  - `isDarkMode`
  - `toggleDarkMode`
  - `colors`

Semua komponen UI mengambil warna dari hook ini agar konsisten.

## 5. Komponen Umum

### `components/BookCard.tsx`

Komponen kartu buku reusable.

- Bisa tampil vertikal atau horizontal.
- Menampilkan cover, judul, author, status, dan tombol favorit.
- Saat diklik, user diarahkan ke halaman detail buku.
- Menggunakan:
  - `api.favorites.isFavorite`
  - `api.favorites.toggleFavorite`

Komponen ini dipakai di beberapa halaman mahasiswa.

## 6. Komponen Mahasiswa

### `components/student/StudentHome.tsx`

Dashboard utama mahasiswa.

- Mengambil semua buku dengan `api.books.getBooks`.
- Mengambil buku terbaru dengan `api.books.getLatestBooks`.
- Mengambil data user terbaru dengan `api.users.getUserById`.
- Menampilkan:
  - sapaan user
  - total poin
  - kolom pencarian
  - komponen absensi harian
  - daftar buku rekomendasi
  - daftar buku baru

### `components/student/StudentSearch.tsx`

Halaman pencarian buku.

- Query semua buku.
- Melakukan filter berdasarkan judul, author, atau kategori.
- Menampilkan hasil dengan `BookCard` horizontal.

### `components/student/StudentBorrowed.tsx`

Halaman daftar buku yang sedang dipinjam mahasiswa.

- Mengambil data dari `api.borrow.getBorrowedBooksByUser`.
- Memfilter hanya pinjaman aktif dengan status `borrowed`.
- Menampilkan status keterlambatan:
  - overdue
  - due soon
  - normal

### `components/student/StudentBorrowHistory.tsx`

Modal/halaman riwayat pinjam mahasiswa.

- Mengambil data dari `api.borrow.getBorrowHistory`.
- Menampilkan buku yang sudah dikembalikan beserta tanggal pinjam dan tanggal kembali.

### `components/student/StudentFavorites.tsx`

Halaman buku favorit.

- Mengambil daftar buku favorit user dari `api.favorites.getFavoritesByUser`.
- Menampilkan hasil memakai `BookCard`.

### `components/student/StudentPointHistory.tsx`

Riwayat perubahan poin mahasiswa.

- Mengambil data dari `api.attendance.getUserPointHistory`.
- Menampilkan deskripsi aktivitas, tanggal, dan perubahan poin.
- Jenis aktivitas misalnya:
  - attendance
  - borrow
  - penalty
  - return
  - redeem

### `components/student/StudentProfile.tsx`

Halaman profil mahasiswa.

- Menampilkan nama, email, role, dan avatar berbasis inisial.
- Menyediakan akses ke:
  - `Point History`
  - `Borrow History`
  - `Favorite Books`
  - `Dark Mode`
  - `Logout`
- Ketiga fitur riwayat/favorit dibuka dalam `Modal`.

### `components/student/StudentAttendanceCheckIn.tsx`

Komponen absensi harian mahasiswa.

- Mengecek apakah user sudah absen hari ini.
- Jika belum, user bisa memasukkan kode harian.
- Mutation `api.attendance.submitDailyCode` digunakan untuk verifikasi dan pemberian poin.

Catatan:

- File ini memakai pendekatan manual untuk menghitung tanggal WITA.
- Styling masih hardcoded dan belum memakai `useTheme`.

### `components/student/StudentRoomBooking.tsx`

Halaman booking ruang belajar.

- Mengambil daftar ruangan dengan `api.rooms.getRooms`.
- Mengambil semua booking dengan `api.rooms.getAllBookings`.
- Menampilkan status ruangan real-time: `Available` atau `Occupied`.
- User bisa memilih jam mulai dan jam selesai lalu submit booking melalui `api.rooms.bookRoom`.
- Ada sub-komponen `OccupiedSlots` untuk menampilkan jadwal terisi hari ini.

## 7. Komponen Admin

### `components/admin/AdminDashboard.tsx`

Dashboard utama pustakawan.

- Mengambil statistik dari `api.admin.getStats`.
- Mengambil aktivitas terbaru dari `api.admin.getRecentActivities`.
- Menampilkan:
  - statistik buku
  - pembuatan kode absensi
  - visitor log
  - monitoring ruang
  - recent activity

### `components/admin/AdminBookManagement.tsx`

Halaman pengelolaan buku dan ruang.

- Memiliki dua mode:
  - `books`
  - `rooms`
- Query:
  - `api.books.getBooks`
  - `api.rooms.getRooms`
- Mutation:
  - `api.books.addBook`
  - `api.books.updateBook`
  - `api.rooms.addRoom`
  - `api.rooms.updateRoom`

Fitur penting:

- tambah/edit buku
- tambah/edit ruang
- dukungan status `coming soon`
- otomatis menyesuaikan form berdasarkan mode

### `components/admin/AdminBorrowManagement.tsx`

Halaman manajemen pinjaman.

- Mengambil pinjaman aktif dari `api.borrow.getAllBorrows`.
- Pustakawan bisa:
  - mencari pinjaman
  - mengonfirmasi pengembalian
  - membuat pinjaman baru secara manual

Untuk membuat pinjaman baru:

- pilih mahasiswa
- pilih buku
- pilih copy fisik tertentu
- pilih tipe pinjaman
- tentukan durasi jika `take_home`

### `components/admin/AdminRoomManagement.tsx`

Halaman manajemen reservasi.

- Memiliki dua tab:
  - reservasi buku
  - reservasi ruang
- Query:
  - `api.rooms.getAllBookings`
  - `api.reservation.getAllReservations`
- Mutation:
  - `api.rooms.updateBookingStatus`
  - `api.reservation.updateReservationStatus`
  - `api.reservation.confirmPickup`

Fungsinya:

- menyelesaikan atau membatalkan booking ruang
- menandai reservasi buku sebagai `expired`
- mengonfirmasi buku sudah diambil sehingga berubah menjadi pinjaman aktif

### `components/admin/AdminProfile.tsx`

Profil pustakawan.

- Menampilkan nama, email, dan role admin.
- Menyediakan:
  - dark mode
  - logout
  - akses ke `AdminUserManagement`

### `components/admin/AdminAttendanceCode.tsx`

Komponen pembuatan kode absensi harian.

- Mengambil kode hari ini via `api.attendance.getDailyCode`.
- Jika belum ada, admin bisa membuat kode baru lewat `api.attendance.createDailyCode`.
- Jika sudah ada, UI dikunci untuk mencegah pembuatan ulang pada hari yang sama.

### `components/admin/AdminActivityHistory.tsx`

Halaman log aktivitas perpustakaan.

- Mengambil seluruh aktivitas dari `api.admin.getAllActivities`.
- Menampilkan icon berbeda untuk:
  - Borrowed
  - Returned
  - Reserved
  - Room Booked
  - Room Finished
  - Room Cancelled

### `components/admin/AdminRoomLiveStatus.tsx`

Komponen monitoring ruang belajar secara live.

- Mengambil semua booking dari `api.rooms.getAllBookings`.
- Memisahkan:
  - room yang sedang dipakai sekarang
  - room yang akan dipakai hari ini
- Admin dapat menandai booking live sebagai `completed`.

### `components/admin/AdminVisitorLogs.tsx`

Komponen ringkasan pengunjung hari ini.

- Mengambil absensi hari ini dari `api.attendance.getAllAttendance`.
- Menampilkan maksimal 10 log terbaru.
- Ada tombol untuk membuka laporan detail di `AdminVisitorReports`.

### `components/admin/AdminVisitorReports.tsx`

Laporan pengunjung berdasarkan rentang tanggal.

- Default tanggal awal dan akhir adalah hari ini di zona WITA.
- Query ke `api.attendance.getAttendanceByRange`.
- Menampilkan total pengunjung dan detail tiap user.

### `components/admin/AdminUserManagement.tsx`

Halaman pengelolaan mahasiswa.

- Query semua mahasiswa dengan `api.users.getStudents`.
- Mutation:
  - `api.users.createUser`
  - `api.users.deleteUser`

Fitur:

- cari mahasiswa
- tambah mahasiswa baru
- hapus mahasiswa

## 8. Backend Convex

### `convex/schema.ts`

Skema database utama.

Table yang didefinisikan:

- `users`
- `books`
- `bookCopies`
- `borrow`
- `bookReservation`
- `rooms`
- `roomBooking`
- `notification`
- `dailyCodes`
- `attendance`
- `pointLogs`
- `favorites`

File ini menentukan bentuk data dan index yang dipakai query.

### `convex/users.ts`

Logic user dan autentikasi sederhana.

Function utama:

- `createUser`: membuat user baru dan mengecek email duplikat.
- `getUserById`: mengambil user berdasarkan id.
- `getUserByEmail`: mencari user berdasarkan email.
- `login`: mencocokkan email dan password.
- `getStudents`: mengambil semua user dengan role student.
- `deleteUser`: menghapus user.

### `convex/books.ts`

Logic data buku.

Function utama:

- `getBooks`
- `getLatestBooks`
- `getBookById`
- `addBook`
- `updateBook`
- `getBookCopies`
- `getAvailableCopies`

Catatan penting:

- `addBook` otomatis membuat record `bookCopies` sesuai jumlah stok.
- `updateBook` punya logika khusus untuk perubahan dari `coming soon` ke tersedia.

### `convex/borrow.ts`

Logic peminjaman dan pengembalian.

Query:

- `getBorrowedBooksByUser`
- `getAllBorrows`
- `getBorrowHistory`

Mutation:

- `borrowBook`
- `returnBook`

Saat `borrowBook`:

- membuat record pinjam
- update status copy menjadi `borrowed`
- kurangi `available_copies`
- tambah poin user
- simpan point log
- buat notifikasi

Saat `returnBook`:

- update status peminjaman ke `returned`
- ubah status copy jadi `available`
- kembalikan stok buku
- hitung bonus atau penalti poin
- simpan log poin
- buat notifikasi

### `convex/reservation.ts`

Logic reservasi buku.

Query:

- `getUserReservations`
- `getAllReservations`

Mutation:

- `reserveBook`
- `updateReservationStatus`
- `confirmPickup`

`confirmPickup` adalah fungsi penting karena:

- mengubah reservasi menjadi selesai
- memilih copy buku yang tersedia
- membuat record pinjaman baru
- mengurangi stok
- memberi poin
- membuat notifikasi

### `convex/rooms.ts`

Logic ruang belajar.

Query:

- `getRooms`
- `getActiveBookingsToday`
- `getRoomById`
- `getRoomBookings`
- `getAllBookings`

Mutation:

- `addRoom`
- `updateRoom`
- `bookRoom`
- `updateBookingStatus`
- `deleteRoom`

Bagian terpenting ada di `bookRoom`, yaitu pengecekan konflik jadwal sebelum booking dibuat.

### `convex/attendance.ts`

Logic absensi dan poin.

Function utama:

- `createDailyCode`
- `getDailyCode`
- `submitDailyCode`
- `redeemPoints`
- `getUserPointHistory`
- `getAttendanceHistory`
- `getAllAttendance`
- `getAttendanceByRange`

File ini juga mendefinisikan `getTodayDate()` agar semua absensi mengikuti zona waktu `Asia/Makassar`.

### `convex/admin.ts`

Logic khusus dashboard admin.

Function utama:

- `getStats`: statistik buku, stok, pinjaman, reservasi.
- `getRecentActivities`: aktivitas terbaru.
- `getAllActivities`: log aktivitas lebih lengkap.
- `syncLegacyPoints`: sinkronisasi poin lama ke `pointLogs`.

### `convex/favorites.ts`

Logic buku favorit.

- `toggleFavorite`
- `isFavorite`
- `getFavoritesByUser`

File ini menghubungkan user dengan buku favorit melalui tabel `favorites`.

### `convex/notifications.ts`

Logic notifikasi.

- `getUserNotifications`
- `createNotification`
- `markAsRead`

Walau notifikasi disimpan oleh backend, di frontend saat ini belum terlihat ada layar khusus notifikasi.

### `convex/init.ts`

Utility untuk seeding dan perbaikan data.

- `seedAdmin`: membuat akun admin default.
- `fixMissingCopies`: memperbaiki data copy buku jika jumlah copy fisik kurang dari stok buku.

Catatan:

- Ada inkonsistensi email pada `seedAdmin`: pengecekan memakai `admin@kampus.ac.id`, sedangkan insert memakai `admin@unklab.ac.id`.

### `convex/README.md`

README bawaan Convex. Tidak spesifik ke proyek ini.

### `convex/tsconfig.json`

Konfigurasi TypeScript khusus untuk function Convex. `exclude` mengabaikan folder `_generated`.

## 9. File Generated Convex

Folder `convex/_generated` berisi file yang dibuat otomatis oleh Convex:

- `api.ts`
- `api.js`
- `server.d.ts`
- `server.js`
- `dataModel.d.ts`

Fungsi file-file ini:

- menyediakan typing API
- membantu import `api.*`
- memberi type untuk document dan function server

File generated tidak sebaiknya diedit manual.

## 10. Folder Assets

Folder `assets/images` berisi icon, splash, favicon, dan gambar React bawaan template. Ini bukan file kode, tetapi dipakai oleh konfigurasi Expo dan tampilan splash/icon.

## 11. Alur Data Utama Aplikasi

### Login

1. User login dari `app/login.tsx`.
2. Frontend memanggil `api.users.login`.
3. Data user disimpan di `useUser`.
4. Tab ditentukan berdasarkan role.

### Reservasi Buku

1. User membuka detail buku di `app/book-detail/[id].tsx`.
2. User memilih tipe baca.
3. Frontend memanggil `api.reservation.reserveBook`.
4. Admin melihat reservasi di `AdminRoomManagement`.
5. Admin menekan `Picked Up`.
6. Backend `confirmPickup` membuat pinjaman aktif.

### Peminjaman Langsung

1. Admin membuka `AdminBorrowManagement`.
2. Admin memilih mahasiswa, buku, dan copy fisik.
3. Backend `borrowBook` membuat peminjaman.
4. Poin dan notifikasi otomatis dibuat.

### Pengembalian

1. Admin menekan `Confirm Return`.
2. Backend `returnBook` mengubah status peminjaman.
3. Copy buku kembali available.
4. Poin bonus atau penalti dihitung.

### Absensi Harian

1. Admin membuat kode di `AdminAttendanceCode`.
2. Mahasiswa memasukkan kode di `StudentAttendanceCheckIn`.
3. Backend validasi kode, simpan attendance, tambah poin, dan simpan point log.

### Booking Ruang

1. Mahasiswa booking dari `StudentRoomBooking`.
2. Data masuk ke `roomBooking`.
3. Admin memonitor dari `AdminRoomLiveStatus` atau `AdminRoomManagement`.
4. Booking bisa diselesaikan atau dibatalkan.

## 12. Catatan Teknis Penting

- Autentikasi masih sederhana dan belum aman untuk produksi karena password disimpan plaintext.
- Session user belum disimpan ke storage, jadi kemungkinan hilang saat app direload.
- Sebagian komponen sudah memakai `useTheme`, tetapi ada beberapa yang masih hardcoded warnanya.
- README proyek belum diperbarui.
- Ada beberapa teks UI yang masih campuran Inggris dan Indonesia.

## 13. Ringkasan Singkat per Area

- `app/`: routing dan halaman utama.
- `hooks/`: state global untuk user dan tema.
- `components/student/`: seluruh layar fitur mahasiswa.
- `components/admin/`: seluruh layar fitur pustakawan.
- `convex/`: backend, schema, query, mutation, dan utility.
- `convex/_generated/`: file otomatis dari Convex.

