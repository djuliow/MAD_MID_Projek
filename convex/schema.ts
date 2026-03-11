import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Tabel users menyimpan data pengguna (mahasiswa dan pustakawan)
  users: defineTable({
    name: v.string(), // Nama lengkap pengguna
    email: v.string(), // Alamat email unik pengguna
    password: v.string(), // Kata sandi untuk login
    role: v.union(v.literal("student"), v.literal("librarian")), // Peran pengguna: mahasiswa atau pustakawan
    student_id: v.optional(v.string()), // Nomor Induk Mahasiswa (opsional)
    library_points: v.optional(v.number()), // Total poin yang dikumpulkan dari aktivitas perpustakaan
    created_at: v.number(), // Waktu pembuatan akun (timestamp)
  }).index("by_email", ["email"]),

  // Tabel books menyimpan informasi buku yang tersedia di perpustakaan
  books: defineTable({
    title: v.string(), // Judul buku
    author: v.string(), // Nama penulis buku
    publisher: v.string(), // Nama penerbit
    year: v.number(), // Tahun terbit buku
    category: v.string(), // Kategori atau genre buku
    isbn: v.string(), // Nomor ISBN unik buku
    description: v.string(), // Sinopsis atau deskripsi buku
    shelf_location: v.string(), // Lokasi fisik buku di rak perpustakaan
    cover_image: v.string(), // URL atau path gambar sampul buku
    total_copies: v.number(), // Jumlah total fisik buku yang dimiliki
    available_copies: v.number(), // Jumlah fisik buku yang saat ini tersedia untuk dipinjam
    is_coming_soon: v.optional(v.boolean()), // Penanda jika buku baru akan segera hadir
    created_at: v.number(), // Waktu penambahan data buku ke sistem
  }).index("by_category", ["category"])
    .index("by_creation", ["created_at"]),

  // Tabel bookCopies menyimpan status individual untuk setiap eksemplar buku
  bookCopies: defineTable({
    id_book: v.id("books"), // Referensi ke ID buku di tabel books
    copy_code: v.string(), // Kode unik untuk setiap eksemplar (misal: ISBN-1)
    status: v.union(v.literal("available"), v.literal("borrowed"), v.literal("reserved")), // Status eksemplar
  }).index("by_book", ["id_book"]),

  // Tabel borrow mencatat transaksi peminjaman buku
  borrow: defineTable({
    id_user: v.id("users"), // Referensi ke ID pengguna yang meminjam
    id_copy: v.id("bookCopies"), // Referensi ke eksemplar buku yang dipinjam
    borrow_date: v.number(), // Tanggal mulai meminjam
    due_date: v.number(), // Batas waktu pengembalian
    return_date: v.optional(v.number()), // Tanggal buku dikembalikan
    status: v.union(v.literal("borrowed"), v.literal("returned"), v.literal("late")), // Status peminjaman saat ini
    type: v.optional(v.union(v.literal("in_library"), v.literal("take_home"))), // Tipe peminjaman: di tempat atau bawa pulang
    updated_at: v.optional(v.number()), // Waktu pembaruan status terakhir
  }).index("by_user", ["id_user"]),

  // Tabel bookReservation menyimpan data pemesanan buku sebelum diambil
  bookReservation: defineTable({
    id_user: v.id("users"), // Referensi ke ID pengguna yang memesan
    id_book: v.id("books"), // Referensi ke ID buku yang dipesan
    reservation_date: v.number(), // Waktu melakukan reservasi
    pickup_deadline: v.number(), // Batas waktu pengambilan buku
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("expired")), // Status reservasi
    type: v.union(v.literal("in_library"), v.literal("take_home")), // Rencana tipe peminjaman
    updated_at: v.optional(v.number()), // Waktu pembaruan status terakhir
  }).index("by_user", ["id_user"]),

  // Tabel rooms menyimpan informasi ruangan yang dapat dipesan
  rooms: defineTable({
    room_name: v.string(), // Nama ruangan (misal: Ruang Diskusi 1)
    capacity: v.number(), // Kapasitas maksimal orang
    facilities: v.string(), // Fasilitas yang tersedia (misal: AC, Proyektor)
    location: v.string(), // Lokasi ruangan di perpustakaan
  }),

  // Tabel roomBooking mencatat pemesanan ruangan oleh pengguna
  roomBooking: defineTable({
    id_room: v.id("rooms"), // Referensi ke ID ruangan
    id_user: v.id("users"), // Referensi ke ID pengguna yang memesan
    booking_date: v.number(), // Tanggal pemesanan ruangan
    start_time: v.number(), // Waktu mulai penggunaan
    end_time: v.number(), // Waktu selesai penggunaan
    status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("completed")), // Status pemesanan
    updated_at: v.optional(v.number()), // Waktu pembaruan status terakhir
  }).index("by_user", ["id_user"]),

  // Tabel notification menyimpan pesan pemberitahuan untuk pengguna
  notification: defineTable({
    id_user: v.id("users"), // Referensi ke ID penerima notifikasi
    title: v.string(), // Judul notifikasi
    message: v.string(), // Isi pesan notifikasi
    send_date: v.number(), // Waktu pengiriman notifikasi
    status_read: v.boolean(), // Status apakah notifikasi sudah dibaca
  }).index("by_user", ["id_user"]),

  // Tabel dailyCodes menyimpan kode kehadiran harian untuk mendapatkan poin
  dailyCodes: defineTable({
    code: v.string(), // Kode unik harian (misal: ABC123)
    date: v.string(), // Tanggal berlakunya kode (YYYY-MM-DD)
    points_value: v.number(), // Jumlah poin yang didapat dari kode ini
  }).index("by_date", ["date"]),

  // Tabel attendance mencatat riwayat kehadiran pengguna menggunakan kode harian
  attendance: defineTable({
    id_user: v.id("users"), // Referensi ke ID pengguna yang hadir
    date: v.string(), // Tanggal kehadiran (YYYY-MM-DD)
    points_earned: v.number(), // Poin yang didapatkan dari kehadiran ini
  }).index("by_user_date", ["id_user", "date"]),

  // Tabel pointLogs mencatat setiap perubahan poin pengguna untuk transparansi
  pointLogs: defineTable({
    id_user: v.id("users"), // Referensi ke ID pengguna
    activity_type: v.string(), // Jenis aktivitas: attendance, borrow, return, penalty, redeem
    description: v.string(), // Keterangan detail aktivitas
    points: v.number(), // Jumlah poin yang masuk atau keluar
    timestamp: v.number(), // Waktu terjadinya transaksi poin
  }).index("by_user", ["id_user"]),

  // Tabel favorites menyimpan daftar buku yang disukai oleh pengguna
  favorites: defineTable({
    id_user: v.id("users"), // Referensi ke ID pengguna
    id_book: v.id("books"), // Referensi ke ID buku yang difavoritkan
  }).index("by_user", ["id_user"])
    .index("by_user_book", ["id_user", "id_book"]),
});
