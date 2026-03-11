# Penjelasan Detail Per File

Dokumen ini menjelaskan isi setiap file kode utama secara lebih dalam. Fokusnya bukan hanya "file ini untuk apa", tetapi juga "bagian di dalam file ini melakukan apa".

## 1. Frontend Root dan Routing

### `app/_layout.tsx`

#### Fungsi file

File ini adalah pembungkus utama seluruh aplikasi. Semua halaman akan berada di bawah provider yang didefinisikan di sini.

#### Penjelasan isi kode

- `import { ThemeProvider } ...`
  - Mengambil provider tema agar seluruh aplikasi bisa memakai warna light/dark mode.
- `import { UserProvider } ...`
  - Mengambil provider user agar data user login bisa diakses di semua halaman.
- `import { Stack } from "expo-router"`
  - Dipakai untuk mendefinisikan navigasi stack.
- `import { ConvexProvider, ConvexReactClient } from "convex/react"`
  - Dipakai agar komponen React bisa memanggil query dan mutation Convex.

- `const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL || ""`
  - Mengambil URL deployment Convex dari environment variable.
- `const convex = new ConvexReactClient(convexUrl)`
  - Membuat client backend yang akan dipakai aplikasi.

- `RootLayout()`
  - Fungsi komponen utama.
  - Di dalam `return`, ada urutan provider:
    1. `ConvexProvider`
    2. `UserProvider`
    3. `ThemeProvider`
  - Lalu di dalamnya ada `Stack` untuk route:
    - `index`
    - `login`
    - `tabs`
    - `book-detail/[id]`

Artinya:

- semua screen bisa akses backend Convex
- semua screen bisa akses user context
- semua screen bisa akses theme context

### `app/index.tsx`

#### Fungsi file

File ini adalah splash screen manual.

#### Penjelasan isi kode

- `useEffect(() => { ... }, [])`
  - Saat komponen pertama kali muncul, dibuat timer 2 detik.
  - Setelah 2 detik, `router.replace('/login')` dijalankan.
  - `replace` dipakai agar splash tidak tertinggal di history.

- `const { colors } = useTheme()`
  - Mengambil warna aktif dari theme context.

- Bagian JSX:
  - `View` utama sebagai container fullscreen.
  - `StatusBar` untuk warna bar.
  - `Image` menampilkan icon aplikasi.
  - `Text` menampilkan nama aplikasi dan tagline.

Jadi, file ini hanya berfungsi sebagai tampilan awal sebelum masuk ke halaman login.

### `app/login.tsx`

#### Fungsi file

Halaman login user student atau librarian.

#### Penjelasan isi kode per bagian

- `const { colors } = useTheme();`
  - Mengambil warna tema. Di file ini, sebagian warna masih hardcoded.

- `const { setRole, setUser } = useUser();`
  - Mengambil setter dari user context untuk menyimpan hasil login.

- `const router = useRouter();`
  - Untuk pindah halaman setelah login berhasil.

- `const convex = useConvex();`
  - Untuk menjalankan query langsung ke Convex tanpa hook `useQuery`.

#### State yang dipakai

- `email`
  - Menyimpan input email user.
- `password`
  - Menyimpan input password user.
- `selectedRole`
  - Menyimpan pilihan role dari segmented control.
- `showPassword`
  - Menentukan apakah password ditampilkan atau disembunyikan.
- `loading`
  - Menentukan apakah tombol login sedang memproses.

#### Fungsi `handleLogin`

Fungsi ini adalah inti login.

Urutannya:

1. Mengecek apakah email dan password kosong.
2. Jika kosong, tampilkan `Alert`.
3. Jika terisi, set `loading = true`.
4. Jalankan query:
   - `convex.query(api.users.login, { email, password })`
5. Jika backend mengembalikan user:
   - cek apakah `userData.role` sama dengan `selectedRole`
   - jika tidak sama, tampilkan error role mismatch
6. Jika role sesuai:
   - `setUser(userData)`
   - `setRole(userData.role)`
   - `router.replace('/tabs')`
7. Jika error:
   - tampilkan alert login gagal
8. Akhiri dengan `setLoading(false)`

#### Bagian UI

- Logo section:
  - Menampilkan ikon buku sebagai identitas library.
- Header text:
  - Menampilkan judul dan subtitle dinamis sesuai role.
- Role selector:
  - Dua tombol `Student` dan `Librarian`.
  - Saat dipilih, `selectedRole` berubah.
- Input email dan password:
  - Email memakai keyboard `email-address`.
  - Password bisa toggle show/hide.
- Tombol login:
  - Menjalankan `handleLogin`.
  - Saat `loading`, menampilkan `ActivityIndicator`.

Kesimpulan file ini:

- bertanggung jawab menerima input login
- memvalidasi input sederhana
- memanggil backend login
- menyimpan session user ke context

### `app/tabs/_layout.tsx`

#### Fungsi file

Mengatur tampilan bottom tabs dan mengubah label berdasarkan role.

#### Penjelasan isi kode

- `TabIcon`
  - Komponen kecil untuk icon tab.
  - Memakai `useSharedValue`, `withSpring`, dan `useAnimatedStyle`.
  - Saat tab aktif:
    - icon naik sedikit
    - ukuran icon membesar

- `const { role } = useUser();`
  - Menentukan apakah user adalah admin atau student.

- `const isAdmin = role === 'librarian';`
  - Flag sederhana untuk mengganti nama tab.

- `Tabs screenOptions={...}`
  - Mengatur style tab secara global.

- Setiap `Tabs.Screen`
  - Nama route tetap sama.
  - `title` berubah tergantung role.
  - `tabBarIcon` juga bisa berubah, misalnya:
    - student: `search`
    - admin: `library`

Kesimpulan:

- file ini tidak memutuskan halaman mana yang muncul
- file ini hanya mengatur shell navigasi tab

### `app/tabs/index.tsx`, `search.tsx`, `borrowed.tsx`, `rooms.tsx`, `profile.tsx`

#### Fungsi file

Kelima file ini adalah router sederhana berbasis role.

#### Pola isi kode

Semua file memiliki pola sama:

- ambil `role` dari `useUser()`
- lakukan ternary
  - kalau `librarian`, render komponen admin
  - kalau bukan, render komponen student

Contoh:

- `index.tsx`
  - admin: `AdminDashboard`
  - student: `StudentHome`

Jadi file-file ini tidak punya logic bisnis, hanya logic pemilihan tampilan.

### `app/book-detail/[id].tsx`

#### Fungsi file

Menampilkan detail buku dan menyediakan aksi reservasi.

#### Penjelasan isi kode

- `const { id } = useLocalSearchParams();`
  - Mengambil parameter `id` dari URL route.

- `const book = useQuery(api.books.getBookById, { id: ... })`
  - Mengambil detail buku dari database.

- `const reserveBook = useMutation(api.reservation.reserveBook);`
  - Menyediakan function untuk melakukan reservasi.

#### State

- `isReserving`
  - Menandakan proses reservasi sedang berjalan.
- `reservationType`
  - Menyimpan pilihan tipe reservasi:
    - `take_home`
    - `in_library`

#### Fungsi `handleReserve`

Urutannya:

1. Pastikan user login.
2. Set `isReserving = true`.
3. Membuat `pickupDeadline` 48 jam dari sekarang.
4. Memanggil mutation `reserveBook`.
5. Jika sukses:
   - tampilkan alert sukses
   - kembali ke halaman sebelumnya
6. Jika gagal:
   - ambil pesan error dari Convex
   - tampilkan alert error
7. Akhiri dengan mematikan loading.

#### Status buku

Kode ini menghitung status tampilan:

- kalau `available_copies > 0`, status `Available`
- kalau tidak, status `Borrowed`
- kalau `is_coming_soon`, override jadi `Coming Soon`

#### Bagian UI

- header atas dengan tombol kembali dan share
- cover buku
- judul, author, badge status
- pilihan tipe membaca
- statistik kecil: tahun, rak, kategori
- deskripsi
- footer bawah:
  - tombol favorit
  - tombol reserve

Catatan:

- tombol favorit di file ini belum punya handler backend
- penjelasan lebih baik jika nanti ditambahkan integrasi ke `favorites.ts`

## 2. Hooks dan Context

### `hooks/useUser.tsx`

#### Fungsi file

Menyimpan data user aktif di memori aplikasi.

#### Penjelasan isi kode

- `type UserRole = 'student' | 'librarian'`
  - Mendefinisikan role yang valid.

- `interface User`
  - Bentuk object user yang dipakai frontend.

- `interface UserContextType`
  - Menentukan data dan function apa yang tersedia di context.

- `const UserContext = createContext...`
  - Membuat context kosong.

- `UserProvider`
  - Menyimpan state:
    - `user`
    - `role`
  - Menghitung `userName`
    - jika ada user, pakai `user.name`
    - jika belum ada, pakai default berdasarkan role

- `useUser()`
  - Custom hook untuk mengambil isi context.
  - Jika dipakai di luar provider, akan melempar error.

Kesimpulan:

- file ini adalah pusat session frontend
- tidak berbicara ke database langsung

### `hooks/useTheme.tsx`

#### Fungsi file

Mengelola warna tema dan dark mode.

#### Penjelasan isi kode

- `ColorScheme`
  - Interface besar yang mendefinisikan semua warna dan gradient.

- `lightColors` dan `darkColors`
  - Objek warna untuk dua mode tema.

- `ThemeProvider`
  - Menyimpan `isDarkMode`.
  - Saat mount:
    - membaca nilai `darkMode` dari `AsyncStorage`
  - `toggleDarkMode`
    - membalik nilai mode
    - menyimpan hasil ke `AsyncStorage`
  - memilih `colors` berdasarkan mode aktif

- `useTheme()`
  - Hook untuk mengakses `isDarkMode`, `toggleDarkMode`, dan `colors`.

Kesimpulan:

- file ini membuat UI bisa konsisten di semua screen
- komponen tinggal memakai `colors.*`

## 3. Komponen Umum

### `components/BookCard.tsx`

#### Fungsi file

Komponen reusable untuk menampilkan buku.

#### Penjelasan isi kode

- Props:
  - `book`
  - `horizontal`

- `const isFav = useQuery(api.favorites.isFavorite, ...)`
  - Mengecek apakah buku ini favorit untuk user aktif.

- `const toggleFav = useMutation(api.favorites.toggleFavorite)`
  - Mutation untuk tambah/hapus favorit.

#### Fungsi penting

- `handleToggleFavorite`
  - Menghentikan event klik agar tidak ikut membuka detail buku.
  - Jika user ada, jalankan mutation favorit.

- `handlePress`
  - Membuka halaman detail buku dengan `router.push`.

#### Perhitungan status

- `isAvailable`
- `isComingSoon`
- `statusLabel`

Nilai ini dipakai untuk badge status di kartu.

#### Variasi tampilan

- `if (horizontal)`
  - render layout memanjang ke samping
- `else`
  - render layout vertikal

Jadi satu komponen dipakai ulang untuk dua konteks UI yang berbeda.

## 4. Komponen Mahasiswa

### `components/student/StudentHome.tsx`

#### Fungsi file

Dashboard utama mahasiswa.

#### Penjelasan isi kode

- Query yang dipakai:
  - `api.books.getBooks`
  - `api.books.getLatestBooks`
  - `api.users.getUserById`

- Jika salah satu query masih `undefined`
  - tampilkan loading screen.

- `recommendedBooks = books.slice(0, 5)`
  - Mengambil 5 buku awal sebagai rekomendasi.
- `newBooks = books.slice(5, 10)`
  - Variabel ini dibuat tetapi tidak dipakai di JSX.

#### Bagian UI

- header:
  - nama user
  - jumlah poin
- search section:
  - kolom pencarian
  - saat ini belum terhubung ke filter nyata
- `StudentAttendanceCheckIn`
  - menyisipkan fitur absensi langsung di home
- section buku:
  - `Recommended Books`
  - `New Books`

Kesimpulan:

- file ini adalah dashboard agregasi
- beberapa data masih bersifat tampilan, bukan benar-benar personalized

### `components/student/StudentSearch.tsx`

#### Fungsi file

Pencarian buku untuk mahasiswa.

#### Penjelasan isi kode

- `searchQuery`
  - state string untuk isi pencarian.

- `filteredBooks = books.filter(...)`
  - filter dilakukan di frontend.
  - kriteria:
    - title
    - author
    - category

- `FlatList`
  - menampilkan hasil pencarian.
  - item dirender dengan `BookCard horizontal`.

Tombol filter di kanan atas saat ini hanya UI, belum ada logic filter lanjutan.

### `components/student/StudentBorrowed.tsx`

#### Fungsi file

Menampilkan buku yang masih dipinjam user.

#### Penjelasan isi kode

- `borrowedData = useQuery(api.borrow.getBorrowedBooksByUser, ...)`
  - Mengambil semua peminjaman user.

- `activeBorrows = borrowedData?.filter(...)`
  - Menyisakan yang status `borrowed`.

- `isDueSoon()`
  - Menghitung apakah due date kurang dari atau sama dengan 3 hari lagi.

- `formatDate()`
  - Mengubah timestamp ke format tanggal yang mudah dibaca.

#### Di dalam render item

- jika `item.book` atau `item.copy` kosong:
  - return `null`
- hitung:
  - `dueSoon`
  - `isOverdue`
- tampilkan banner warna berbeda sesuai kondisi:
  - merah: overdue
  - kuning: due soon
  - hijau: aman

### `components/student/StudentBorrowHistory.tsx`

#### Fungsi file

Menampilkan buku yang sudah dikembalikan.

#### Penjelasan isi kode

- `history = useQuery(api.borrow.getBorrowHistory, ...)`
  - Backend sudah memfilter status `returned`.

- `formatDate()`
  - Helper untuk menampilkan tanggal pinjam dan kembali.

- `onClose`
  - Diterima dari parent modal agar halaman bisa ditutup.

File ini sederhana: query data, lalu render daftar histori.

### `components/student/StudentFavorites.tsx`

#### Fungsi file

Menampilkan semua buku favorit mahasiswa.

#### Penjelasan isi kode

- `favorites = useQuery(api.favorites.getFavoritesByUser, ...)`
  - Mengambil semua buku yang ada di relasi favorit user.

- Jika `favorites === undefined`
  - tampilkan loading.
- Jika panjang data > 0
  - tampilkan `FlatList`.
- Jika kosong
  - tampilkan empty state.

### `components/student/StudentPointHistory.tsx`

#### Fungsi file

Menampilkan detail perubahan poin user.

#### Penjelasan isi kode

- `history = useQuery(api.attendance.getUserPointHistory, ...)`
  - Mengambil semua `pointLogs` milik user.

- `renderItem`
  - Menentukan:
    - apakah poin positif atau negatif
    - icon yang sesuai
    - warna teks dan box

Logika icon:

- `attendance` => kalender
- `penalty` => warning
- selain itu => book

Jadi fungsi `renderItem` bertugas menerjemahkan data backend menjadi tampilan visual yang mudah dipahami.

### `components/student/StudentProfile.tsx`

#### Fungsi file

Halaman profil mahasiswa dan pusat akses fitur sekunder.

#### Penjelasan isi kode

- State modal:
  - `isHistoryVisible`
  - `isPointsVisible`
  - `isFavVisible`

- `handleLogout`
  - hanya melakukan `router.replace('/login')`
  - belum menghapus `user` dari context

- `initial`
  - mengambil huruf pertama nama user untuk avatar.

#### Menu yang tersedia

- Point History
  - membuka modal `StudentPointHistory`
- Borrow History
  - membuka modal `StudentBorrowHistory`
- Favorite Books
  - membuka modal `StudentFavorites`
- Dark Mode
  - toggle langsung ke `toggleDarkMode`
- Logout

Catatan penting:

- logout di sini hanya pindah route, belum melakukan clear state user secara eksplisit

### `components/student/StudentAttendanceCheckIn.tsx`

#### Fungsi file

Input kode absensi harian mahasiswa.

#### Penjelasan isi kode

- State:
  - `code`
  - `modalVisible`

- `submitCode = useMutation(api.attendance.submitDailyCode)`
  - Mutation utama untuk kirim kode.

- `history = useQuery(api.attendance.getAttendanceHistory, ...)`
  - Dipakai untuk mengecek apakah user sudah absen hari ini.

- `getTodayWITA()`
  - Menghitung tanggal hari ini versi WITA.

- `alreadyCheckedIn`
  - bernilai true jika ada data attendance dengan tanggal hari ini.

#### Fungsi `handleSubmit`

Langkahnya:

1. pastikan `user._id` ada
2. pastikan `code` tidak kosong
3. kirim mutation `submitCode`
4. jika `result.success`
   - tampilkan alert sukses
   - reset input
   - tutup modal
5. jika `success: false`
   - tampilkan alert gagal
6. jika exception
   - tampilkan error tak terduga

#### UI

- jika sudah absen:
  - tampilkan kotak sukses
- jika belum:
  - tampilkan tombol buka modal

### `components/student/StudentRoomBooking.tsx`

#### Fungsi file

Booking ruang belajar oleh mahasiswa.

#### Penjelasan isi kode

- State utama:
  - `selectedRoom`
  - `isModalVisible`
  - `startTime`
  - `endTime`
  - `loading`
  - `now`

- `useEffect` dengan `setInterval`
  - memperbarui `now` setiap menit
  - tujuannya agar status ruang real-time.

- Query:
  - `api.rooms.getRooms`
  - `api.rooms.getAllBookings`

- Mutation:
  - `api.rooms.bookRoom`

#### Fungsi `handleOpenBooking`

- menyimpan ruangan yang dipilih
- membuka modal booking

#### Fungsi `handleConfirmBooking`

Langkah:

1. validasi user dan ruangan
2. ubah input `HH:mm` menjadi timestamp
3. cek bahwa end time > start time
4. jalankan mutation `bookRoom`
5. jika sukses, tampilkan alert dan tutup modal
6. jika gagal, tampilkan pesan conflict booking

#### Logika status ruangan

Di dalam `renderItem`:

- `isCurrentlyOccupied` dihitung dari semua booking aktif
- ruangan dianggap occupied jika:
  - booking status active
  - `now` berada di antara `start_time` dan `end_time`

## 5. Komponen Admin

### `components/admin/AdminDashboard.tsx`

#### Fungsi file

Dashboard pustakawan.

#### Penjelasan isi kode

- Query:
  - `api.admin.getStats`
  - `api.admin.getRecentActivities`

- State:
  - `isHistoryVisible`

- Jika data belum siap
  - tampilkan loading screen.

#### Isi tampilan

- header staff portal
- 4 kartu statistik
- `AdminAttendanceCode`
- `AdminVisitorLogs`
- `AdminRoomLiveStatus`
- daftar recent activity

#### `StatCard`

Komponen helper di file yang sama.

- menerima `title`, `value`, `icon`, `color`
- dipakai untuk meringkas statistik dashboard

### `components/admin/AdminBookManagement.tsx`

#### Fungsi file

Mengelola buku dan ruang dalam satu halaman.

#### Penjelasan isi kode

- `mode`
  - menentukan apakah tampilan sedang fokus ke `books` atau `rooms`

- `searchQuery`
  - dipakai untuk filter data list

- `isModalVisible`
  - mengontrol form tambah/edit

- `editingId`
  - kalau ada nilainya, berarti mode edit
  - kalau `null`, berarti mode tambah baru

#### State form buku

- `title`
- `author`
- `publisher`
- `year`
- `category`
- `isbn`
- `shelf`
- `description`
- `coverImage`
- `totalCopies`
- `isComingSoon`

#### State form ruang

- `roomName`
- `capacity`
- `facilities`
- `location`

#### Query dan mutation

- books dan rooms diambil secara paralel
- mutation dibedakan:
  - buku: add/update book
  - room: add/update room

#### Fungsi `handleOpenEditBook`

- mengisi semua state form dengan data buku yang dipilih
- mengatur `editingId`
- membuka modal

#### Fungsi `handleOpenEditRoom`

- sama seperti edit buku, tapi untuk room

#### Fungsi `handleSave`

Bagian inti file ini.

Jika `mode === 'books'`:

1. validasi field wajib
2. bentuk object `bookData`
3. kalau `editingId` ada, panggil `updateBook`
4. kalau tidak, panggil `addBook`

Jika `mode === 'rooms'`:

1. validasi field wajib room
2. bentuk `roomData`
3. pilih add atau update

Lalu:

- tampilkan alert sukses
- tutup modal
- reset form

#### Fungsi `resetForm`

- membersihkan seluruh state form buku dan room

### `components/admin/AdminBorrowManagement.tsx`

#### Fungsi file

Kelola pinjam, return, dan input pinjam manual.

#### Penjelasan isi kode

- State pencarian dan modal:
  - `searchQuery`
  - `isModalVisible`

- State form pinjam manual:
  - `selectedStudent`
  - `selectedBook`
  - `selectedCopyId`
  - `loanType`
  - `daysToBorrow`
  - `formSearchStudent`
  - `formSearchBook`

- Query:
  - semua pinjaman aktif
  - semua student
  - semua buku
  - available copies untuk buku terpilih

#### Fungsi `handleReturn`

- menampilkan konfirmasi alert
- jika disetujui, menjalankan `returnBook`

#### Fungsi `handleCreateBorrow`

1. validasi student dan copy terpilih
2. hitung durasi berdasarkan `loanType`
3. hitung `dueDate`
4. panggil mutation `borrowBook`
5. jika sukses, tutup modal dan reset form

#### Fungsi `resetForm`

- mereset semua state form pinjam baru

#### Bagian modal input pinjam

Ada langkah-langkah yang jelas:

1. pilih student
2. pilih buku
3. pilih copy fisik
4. pilih tipe pinjaman
5. pilih durasi jika bawa pulang

Jadi file ini berfungsi seperti wizard sederhana.

### `components/admin/AdminRoomManagement.tsx`

#### Fungsi file

Kelola reservasi buku dan reservasi ruangan.

#### Penjelasan isi kode

- `activeTab`
  - menentukan apakah halaman menampilkan data `books` atau `rooms`

- Query:
  - `roomBookings`
  - `bookReservations`

- Mutation:
  - `updateRoomStatus`
  - `updateBookStatus`
  - `confirmPickup`

#### Fungsi `handleRoomStatusUpdate`

- menampilkan konfirmasi
- jika setuju, update status room booking ke:
  - `completed`
  - `cancelled`

#### Fungsi `handleBookStatusUpdate`

- jika status `completed`
  - jalankan `confirmPickup`
  - artinya buku diambil dan pinjaman aktif dibuat
- jika status `expired`
  - jalankan `updateBookStatus`

Jadi fungsi ini membedakan dua skenario reservasi buku.

### `components/admin/AdminProfile.tsx`

#### Fungsi file

Profil admin.

#### Penjelasan isi kode

- State:
  - `isManageUsersVisible`

- `handleLogout`
  - pindah ke login screen

- tombol `Manage Students`
  - membuka modal `AdminUserManagement`

- toggle dark mode
  - langsung memakai `toggleDarkMode`

### `components/admin/AdminAttendanceCode.tsx`

#### Fungsi file

Membuat kode absensi harian.

#### Penjelasan isi kode

- State:
  - `isExpanded`
  - `code`
  - `points`

- Query:
  - `currentCode = useQuery(api.attendance.getDailyCode)`

- Mutation:
  - `createCode = useMutation(api.attendance.createDailyCode)`

#### Fungsi `toggleExpand`

- mengubah tampilan dropdown terbuka/tertutup
- memakai `LayoutAnimation` agar transisinya halus

#### Fungsi `handleCreateCode`

1. validasi code tidak kosong
2. validasi points angka valid
3. panggil mutation `createCode`
4. jika sukses:
   - tampilkan alert
   - reset state
   - tutup expand
5. jika gagal:
   - tampilkan error

#### UI bersyarat

- jika `currentCode` ada:
  - tampilkan mode terkunci
- jika tidak ada:
  - tampilkan form pembuatan kode

### `components/admin/AdminActivityHistory.tsx`

#### Fungsi file

Menampilkan seluruh aktivitas perpustakaan.

#### Penjelasan isi kode

- `activities = useQuery(api.admin.getAllActivities)`
  - mengambil data gabungan dari backend

- `renderItem`
  - mengubah `action` menjadi icon dan warna yang cocok

Jadi file ini tidak menghitung activity sendiri; semua data sudah dipersiapkan backend.

### `components/admin/AdminRoomLiveStatus.tsx`

#### Fungsi file

Monitoring status ruang saat ini.

#### Penjelasan isi kode

- `now = Date.now()`
  - dipakai untuk membandingkan status booking.

- `activeNow`
  - booking aktif yang sedang berjalan saat ini.

- `upcomingToday`
  - booking aktif yang waktunya masih di depan dalam 24 jam ke depan.

- `handleFinish`
  - konfirmasi sebelum update status booking ke `completed`

- `renderBooking`
  - helper untuk merender kartu booking
  - jika `isLive`, tampilkan badge LIVE dan tombol finish
  - jika tidak, tampilkan label upcoming

### `components/admin/AdminVisitorLogs.tsx`

#### Fungsi file

Ringkasan pengunjung hari ini.

#### Penjelasan isi kode

- `visitorLogs = useQuery(api.attendance.getAllAttendance)`
  - backend sudah memfilter absensi hari ini.

- `renderItem`
  - menampilkan nama, ID, tanggal, dan poin.

- `isReportVisible`
  - menentukan apakah laporan detail dibuka.

File ini sebenarnya adalah panel ringkas, bukan halaman penuh.

### `components/admin/AdminVisitorReports.tsx`

#### Fungsi file

Laporan absensi berdasarkan rentang tanggal.

#### Penjelasan isi kode

- `today`
  - dihitung dengan `Intl.DateTimeFormat` dan timezone `Asia/Makassar`

- state:
  - `startDate`
  - `endDate`

- `logs = useQuery(api.attendance.getAttendanceByRange, { startDate, endDate })`
  - query akan otomatis ulang setiap tanggal berubah.

Jadi file ini adalah report sederhana berbasis input tanggal manual.

### `components/admin/AdminUserManagement.tsx`

#### Fungsi file

Kelola akun mahasiswa.

#### Penjelasan isi kode

- State:
  - `searchQuery`
  - `isModalVisible`
  - `name`
  - `email`
  - `studentId`
  - `password`

- Query:
  - `students`

- Mutation:
  - `createUser`
  - `deleteUser`

#### Fungsi `handleAddStudent`

1. validasi field wajib
2. panggil `createUser` dengan role `student`
3. jika sukses:
   - tampilkan alert
   - reset form
   - tutup modal

#### Fungsi `handleDelete`

- tampilkan alert konfirmasi
- jika setuju, jalankan `deleteUser`

## 6. Backend Convex

### `convex/schema.ts`

#### Fungsi file

Menentukan struktur seluruh database.

#### Penjelasan isi kode

- `defineSchema({...})`
  - berisi seluruh table.

Setiap `defineTable({...})`:

- menentukan field dan tipe data
- menentukan index untuk query yang efisien

Contoh penting:

- `users`
  - punya index `by_email`
- `books`
  - punya index kategori dan waktu pembuatan
- `favorites`
  - punya index kombinasi `by_user_book`
  - ini penting untuk cek favorit dengan cepat

### `convex/users.ts`

#### Fungsi file

Mengelola data user dan login.

#### Penjelasan isi kode

##### `createUser`

- menerima data user baru
- mengecek email dengan index `by_email`
- jika sudah ada, lempar `ConvexError`
- jika belum, insert ke table `users`

##### `getUserById`

- mengambil satu user berdasarkan `id`

##### `getUserByEmail`

- mengambil satu user berdasarkan email

##### `login`

- query user berdasarkan email
- membandingkan password
- jika tidak cocok, lempar error
- jika cocok, kembalikan object user

##### `getStudents`

- query semua user
- filter role `student`

##### `deleteUser`

- menghapus user berdasarkan id

### `convex/books.ts`

#### Fungsi file

Mengelola data buku dan copy fisik.

#### Penjelasan isi kode

##### `getBooks`

- jika `category` dikirim:
  - query dengan index `by_category`
- jika tidak:
  - ambil semua buku urutan desc

##### `getLatestBooks`

- query buku berdasarkan index `by_creation`
- ambil sejumlah `limit`

##### `getBookById`

- ambil satu buku dari id

##### `addBook`

Langkah:

1. ambil `is_coming_soon` dan `total_copies`
2. tentukan nilai default
3. insert buku baru
4. jika bukan coming soon dan stok > 0:
   - loop membuat record `bookCopies`

Jadi fungsi ini bukan hanya simpan buku, tapi juga membentuk inventaris copy fisik.

##### `updateBook`

Langkah:

1. ambil data buku lama
2. cek apakah status coming soon berubah
3. patch data dasar buku
4. jika berubah dari coming soon ke available:
   - hapus copy lama jika ada
   - buat ulang copy baru

##### `getBookCopies`

- mengambil semua copy untuk satu buku

##### `getAvailableCopies`

- mengambil hanya copy dengan status `available`

### `convex/borrow.ts`

#### Fungsi file

Mengelola pinjam dan kembali.

#### Penjelasan isi kode

##### `getBorrowedBooksByUser`

- ambil semua borrow berdasarkan user
- untuk setiap borrow:
  - ambil copy
  - ambil book dari copy
- hasil akhirnya adalah borrow + data copy + data book

##### `getAllBorrows`

- ambil semua borrow
- gabungkan dengan data user, copy, dan book
- filter hanya status `borrowed` atau `late`

##### `getBorrowHistory`

- ambil borrow milik user
- filter status `returned`
- gabungkan dengan data book

##### `borrowBook`

Urutan logic:

1. cek copy valid dan available
2. cek book valid dan stok masih ada
3. insert record borrow
4. ubah status copy menjadi borrowed
5. kurangi available_copies buku
6. hitung reward poin berdasarkan type
7. update poin user
8. simpan `pointLogs`
9. buat `notification`

##### `returnBook`

Urutan logic:

1. ambil data borrow
2. validasi belum returned
3. ambil copy dan book
4. cek apakah terlambat
5. patch borrow jadi returned
6. patch copy jadi available
7. kembalikan stok buku
8. hitung bonus atau penalty poin
9. update poin user jika perlu
10. simpan point log
11. buat notifikasi

### `convex/reservation.ts`

#### Fungsi file

Mengelola reservasi buku.

#### Penjelasan isi kode

##### `getUserReservations`

- ambil semua reservasi user
- gabungkan dengan data book

##### `getAllReservations`

- ambil semua reservasi
- gabungkan dengan data user dan book

##### `reserveBook`

Urutan:

1. pastikan buku ada dan stok > 0
2. cek apakah user sudah punya reservasi aktif
3. tentukan deadline pickup
4. insert reservasi baru

##### `updateReservationStatus`

- patch status reservasi
- catat `updated_at`

##### `confirmPickup`

Ini logic paling kompleks.

Urutannya:

1. validasi reservasi masih active
2. validasi stok buku masih ada
3. cari copy available
4. ubah reservasi ke completed
5. ubah copy ke borrowed
6. kurangi stok buku
7. buat record borrow baru
8. hitung reward poin
9. update poin user
10. simpan point log
11. buat notification

### `convex/rooms.ts`

#### Fungsi file

Mengelola ruangan dan booking.

#### Penjelasan isi kode

##### Query sederhana

- `getRooms`
- `getRoomById`

##### `getActiveBookingsToday`

- menghitung awal dan akhir hari
- filter booking aktif untuk room tertentu di hari yang sama

##### `getRoomBookings`

- jika ada `userId`
  - ambil booking milik user itu
- jika tidak
  - ambil semua booking
- setiap booking digabungkan dengan data room dan user

##### `getAllBookings`

- versi semua data booking + relasi room dan user

##### `addRoom`

- insert room baru

##### `updateRoom`

- patch room berdasarkan `roomId`

##### `bookRoom`

Logic utama:

1. cek apakah ada booking aktif di room yang sama
2. cek overlap waktu
3. jika ada bentrok, lempar error
4. jika aman, insert booking dengan status `active`

##### `updateBookingStatus`

- patch status booking
- simpan `updated_at`

##### `deleteRoom`

- hapus room

### `convex/attendance.ts`

#### Fungsi file

Mengelola absensi dan point logs.

#### Penjelasan isi kode

##### `getTodayDate()`

- helper internal
- menghasilkan format `YYYY-MM-DD` dengan timezone `Asia/Makassar`

##### `createDailyCode`

1. ambil tanggal hari ini
2. bersihkan input code
3. cek apakah kode hari ini sudah ada
4. jika belum, insert ke `dailyCodes`

##### `getDailyCode`

- ambil kode absensi untuk hari ini

##### `submitDailyCode`

Urutannya:

1. ambil tanggal hari ini
2. normalisasi kode input
3. ambil kode harian dari DB
4. cek apakah cocok
5. cek apakah user sudah absen hari ini
6. insert attendance
7. ambil user
8. update library_points
9. simpan `pointLogs`
10. kembalikan result object sukses

##### `redeemPoints`

- cek user
- cek poin cukup
- kurangi poin
- simpan point log negatif

##### `getUserPointHistory`

- ambil semua point log milik user

##### `getAttendanceHistory`

- ambil semua attendance milik user

##### `getAllAttendance`

- ambil attendance hari ini
- gabungkan dengan nama user dan student id

##### `getAttendanceByRange`

- filter attendance berdasarkan startDate dan endDate
- gabungkan dengan info user
- urutkan hasil berdasarkan tanggal terbaru

### `convex/admin.ts`

#### Fungsi file

Memberikan data agregasi untuk dashboard admin.

#### Penjelasan isi kode

##### `getStats`

- ambil semua buku
- hitung:
  - total judul buku
  - total copy
  - total copy tersedia
  - total pinjaman aktif
  - total reservasi aktif

##### `formatActivities`

Ini helper internal yang cukup penting.

Tugasnya:

- mengubah data borrow menjadi activity log
- mengubah data reservation menjadi activity log
- mengubah data room booking menjadi activity log
- menyatukan semuanya
- mengurutkan berdasarkan timestamp terbaru

##### `getRecentActivities`

- ambil sebagian data terbaru
- kirim 15 aktivitas terakhir

##### `getAllActivities`

- ambil data lebih banyak
- pakai helper yang sama

##### `syncLegacyPoints`

- mengecek saldo poin user saat ini
- memastikan belum pernah sinkronisasi
- menyimpan saldo awal ke `pointLogs`

### `convex/favorites.ts`

#### Fungsi file

Kelola relasi favorit.

#### Penjelasan isi kode

##### `toggleFavorite`

- cari apakah relasi favorit user-book sudah ada
- jika ada:
  - hapus
  - return `false`
- jika belum:
  - insert
  - return `true`

##### `isFavorite`

- mengembalikan boolean apakah buku termasuk favorit

##### `getFavoritesByUser`

- ambil semua relasi favorit milik user
- untuk setiap relasi, ambil data buku
- filter hasil null

### `convex/notifications.ts`

#### Fungsi file

Kelola notifikasi user.

#### Penjelasan isi kode

##### `getUserNotifications`

- ambil notifikasi user berdasarkan index `by_user`

##### `createNotification`

- insert notifikasi baru dengan:
  - `send_date`
  - `status_read: false`

##### `markAsRead`

- patch notifikasi jadi sudah dibaca

### `convex/init.ts`

#### Fungsi file

Utility maintenance.

#### Penjelasan isi kode

##### `seedAdmin`

- cek apakah admin dengan email tertentu sudah ada
- jika belum, insert admin default

##### `fixMissingCopies`

Urutannya:

1. ambil semua buku
2. untuk tiap buku, ambil semua copy yang ada
3. hitung selisih antara `total_copies` dan jumlah record copy
4. jika kurang:
   - buat copy baru sampai jumlahnya sesuai

## 7. File Generated dan File Pendukung

### `convex/_generated/*`

File generated Convex.

- jangan diedit manual
- dipakai untuk typing dan helper API

### `convex/README.md`

README bawaan Convex, tidak memengaruhi runtime aplikasi.

### `convex/tsconfig.json`

Konfigurasi typecheck untuk backend Convex.

## 8. Catatan Penting dari Pembacaan Kode

- `login.tsx` menyimpan user ke context, tetapi logout belum benar-benar membersihkan state user.
- `StudentHome.tsx` punya variabel `newBooks` yang tidak dipakai.
- `StudentAttendanceCheckIn.tsx` dan beberapa admin component masih memakai warna hardcoded.
- `seedAdmin` di `convex/init.ts` punya inkonsistensi email check dan email insert.
- auth masih plaintext dan belum cocok untuk production.
