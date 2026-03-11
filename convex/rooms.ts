import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// --- QUERIES ---

// Fungsi untuk mengambil semua daftar ruangan yang tersedia di perpustakaan
export const getRooms = query({
  handler: async (ctx) => {
    return await ctx.db.query("rooms").collect();
  },
});

// Fungsi untuk mendapatkan daftar pemesanan ruangan yang aktif pada hari ini
export const getActiveBookingsToday = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfDay = today.getTime();
    const endOfDay = startOfDay + (24 * 60 * 60 * 1000);

    return await ctx.db
      .query("roomBooking")
      .withIndex("by_user")
      .filter((q) => 
        q.and(
          q.eq(q.field("id_room"), args.roomId),
          q.eq(q.field("status"), "active"),
          q.gte(q.field("booking_date"), startOfDay),
          q.lt(q.field("booking_date"), endOfDay)
        )
      )
      .collect();
  },
});

// Fungsi untuk mendapatkan detail informasi satu ruangan berdasarkan ID
export const getRoomById = query({
  args: { id: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Fungsi untuk mengambil daftar pemesanan ruangan, bisa difilter berdasarkan pengguna atau ruangan
export const getRoomBookings = query({
  args: { userId: v.optional(v.id("users")), roomId: v.optional(v.id("rooms")) },
  handler: async (ctx, args) => {
    let bookings;
    if (args.userId) {
      // Mengambil pemesanan milik pengguna tertentu
      bookings = await ctx.db
        .query("roomBooking")
        .withIndex("by_user", (q) => q.eq("id_user", args.userId!))
        .collect();
    } else {
      // Mengambil semua pemesanan
      bookings = await ctx.db.query("roomBooking").collect();
    }

    // Menggabungkan data pemesanan dengan detail ruangan dan pengguna
    return await Promise.all(
      bookings.map(async (booking) => {
        const room = await ctx.db.get(booking.id_room);
        const user = await ctx.db.get(booking.id_user);
        return {
          ...booking,
          room,
          user,
        };
      })
    );
  },
});

// Fungsi untuk mengambil semua riwayat pemesanan ruangan untuk admin
export const getAllBookings = query({
  handler: async (ctx) => {
    const bookings = await ctx.db.query("roomBooking").order("desc").collect();
    return await Promise.all(
      bookings.map(async (booking) => {
        const room = await ctx.db.get(booking.id_room);
        const user = await ctx.db.get(booking.id_user);
        return {
          ...booking,
          room,
          user,
        };
      })
    );
  },
});

// --- MUTATIONS ---

// Fungsi untuk menambahkan ruangan baru ke sistem
export const addRoom = mutation({
  args: {
    room_name: v.string(), // Nama ruangan
    capacity: v.number(), // Kapasitas
    facilities: v.string(), // Fasilitas
    location: v.string(), // Lokasi
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rooms", args);
  },
});

// Fungsi untuk memperbarui informasi detail ruangan
export const updateRoom = mutation({
  args: {
    roomId: v.id("rooms"),
    room_name: v.string(),
    capacity: v.number(),
    facilities: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const { roomId, ...data } = args;
    await ctx.db.patch(roomId, data);
    return true;
  },
});

// Fungsi untuk melakukan pemesanan (booking) ruangan
export const bookRoom = mutation({
  args: {
    id_room: v.id("rooms"), // ID Ruangan
    id_user: v.id("users"), // ID Pemesan
    booking_date: v.number(), // Tanggal booking
    start_time: v.number(), // Jam mulai
    end_time: v.number(), // Jam selesai
  },
  handler: async (ctx, args) => {
    // Mengecek apakah ada jadwal yang bentrok di waktu yang sama pada ruangan tersebut
    const existingBookings = await ctx.db
      .query("roomBooking")
      .filter((q) =>
        q.and(
          q.eq(q.field("id_room"), args.id_room),
          q.eq(q.field("status"), "active"),
          q.or(
            q.and(
              q.lte(q.field("start_time"), args.start_time),
              q.gt(q.field("end_time"), args.start_time)
            ),
            q.and(
              q.lt(q.field("start_time"), args.end_time),
              q.gte(q.field("end_time"), args.end_time)
            )
          )
        )
      )
      .collect();

    if (existingBookings.length > 0) {
      throw new Error("Room is already booked during this time");
    }

    // Memasukkan data booking baru
    return await ctx.db.insert("roomBooking", {
      ...args,
      status: "active",
    });
  },
});

// Fungsi untuk mengubah status pemesanan (misal: membatalkan atau menyelesaikan)
export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("roomBooking"),
    status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, { 
      status: args.status,
      updated_at: Date.now() // Mencatat waktu perubahan status
    });
    return true;
  },
});

// Fungsi untuk menghapus data ruangan dari sistem
export const deleteRoom = mutation({
  args: { id: v.id("rooms") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
