import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

// Fungsi untuk mendapatkan daftar reservasi (pesanan) buku oleh pengguna tertentu
export const getUserReservations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const reservations = await ctx.db
      .query("bookReservation")
      .withIndex("by_user", (q) => q.eq("id_user", args.userId))
      .collect();

    return await Promise.all(
      reservations.map(async (res) => {
        const book = await ctx.db.get(res.id_book);
        return {
          ...res,
          book,
        };
      })
    );
  },
});

// Fungsi untuk mendapatkan semua reservasi buku yang ada (untuk admin)
export const getAllReservations = query({
  handler: async (ctx) => {
    const reservations = await ctx.db.query("bookReservation").order("desc").collect();

    return await Promise.all(
      reservations.map(async (res) => {
        const user = await ctx.db.get(res.id_user);
        const book = await ctx.db.get(res.id_book);
        return {
          ...res,
          user,
          book,
        };
      })
    );
  },
});

// Fungsi untuk melakukan reservasi/pemesanan buku sebelum diambil langsung
export const reserveBook = mutation({
  args: {
    userId: v.id("users"), // ID pengguna yang memesan
    bookId: v.id("books"), // ID buku yang dipesan
    type: v.union(v.literal("in_library"), v.literal("take_home")), // Rencana peminjaman
    pickupDeadline: v.optional(v.number()), // Batas waktu pengambilan
  },
  handler: async (ctx, args) => {
    // Validasi apakah stok buku masih tersedia
    const book = await ctx.db.get(args.bookId);
    if (!book || book.available_copies <= 0) {
      throw new ConvexError("Stok buku habis atau tidak tersedia.");
    }

    // Memastikan pengguna tidak memiliki reservasi lain yang masih aktif
    const existing = await ctx.db
      .query("bookReservation")
      .withIndex("by_user", (q) => q.eq("id_user", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .unique();

    if (existing) {
      throw new ConvexError("Anda sudah memiliki reservasi aktif.");
    }

    // Secara default, batas waktu pengambilan adalah 2 jam dari sekarang
    const deadline = args.pickupDeadline || (Date.now() + (2 * 60 * 60 * 1000));

    // Memasukkan data reservasi ke tabel bookReservation
    return await ctx.db.insert("bookReservation", {
      id_user: args.userId,
      id_book: args.bookId,
      reservation_date: Date.now(),
      pickup_deadline: deadline,
      status: "active",
      type: args.type,
    });
  },
});

// Fungsi untuk memperbarui status reservasi (misal: membatalkan atau menyatakan kadaluarsa)
export const updateReservationStatus = mutation({
  args: {
    reservationId: v.id("bookReservation"),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("expired")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reservationId, { 
      status: args.status,
      updated_at: Date.now()
    });
    return true;
  },
});

// Fungsi untuk mengonfirmasi pengambilan buku dari reservasi yang aktif
export const confirmPickup = mutation({
  args: {
    reservationId: v.id("bookReservation"), // ID reservasi yang akan diproses
  },
  handler: async (ctx, args) => {
    // Validasi data reservasi
    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation || reservation.status !== "active") {
      throw new ConvexError("Reservasi tidak valid atau sudah diproses.");
    }

    // Validasi ketersediaan stok buku saat pengambilan
    const book = await ctx.db.get(reservation.id_book);
    if (!book || book.available_copies <= 0) {
      throw new ConvexError("Buku sudah tidak tersedia lagi.");
    }

    // 1. Mencari eksemplar fisik buku yang berstatus 'available'
    const copy = await ctx.db
      .query("bookCopies")
      .withIndex("by_book", (q) => q.eq("id_book", reservation.id_book))
      .filter((q) => q.eq(q.field("status"), "available"))
      .first();

    if (!copy) throw new ConvexError("Tidak ada fisik buku yang tersedia.");

    // 2. Memperbarui status reservasi menjadi selesai dan status buku menjadi dipinjam
    await ctx.db.patch(reservation._id, { status: "completed", updated_at: Date.now() });
    await ctx.db.patch(copy._id, { status: "borrowed" });
    await ctx.db.patch(book._id, {
      available_copies: book.available_copies - 1,
    });

    // 3. Membuat catatan peminjaman baru secara otomatis
    const durationDays = reservation.type === 'take_home' ? 7 : 1; 
    const dueDate = Date.now() + (durationDays * 24 * 60 * 60 * 1000);

    await ctx.db.insert("borrow", {
      id_user: reservation.id_user,
      id_copy: copy._id,
      borrow_date: Date.now(),
      due_date: dueDate,
      status: "borrowed",
      type: reservation.type, 
    });

    // 4. Memberikan hadiah poin berdasarkan tipe peminjaman
    let reward = reservation.type === 'in_library' ? 20 : 5;

    const user = await ctx.db.get(reservation.id_user);
    if (user && reward > 0) {
      await ctx.db.patch(reservation.id_user, {
        library_points: (user.library_points ?? 0) + reward,
      });

      // Mencatat riwayat perolehan poin
      await ctx.db.insert("pointLogs", {
        id_user: reservation.id_user,
        activity_type: "borrow",
        description: `Ambil Buku: ${book.title} (${reservation.type === 'in_library' ? 'Baca di Perpus' : 'Bawa Pulang'})`,
        points: reward,
        timestamp: Date.now(),
      });
    }

    // 5. Membuat notifikasi untuk pengguna
    const durationText = reservation.type === 'take_home' ? "dalam 7 hari" : "sebelum perpustakaan tutup hari ini";
    await ctx.db.insert("notification", {
      id_user: reservation.id_user,
      title: "Peminjaman Dimulai!",
      message: `Anda telah mengambil buku \"${book.title}\". Reward: +${reward} Poin. Silakan kembalikan ${durationText}.`,
      send_date: Date.now(),
      status_read: false,
    });

    return true;
  },
});
