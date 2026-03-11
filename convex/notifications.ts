import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Fungsi untuk mendapatkan semua notifikasi milik pengguna tertentu
export const getUserNotifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Mengambil notifikasi dari tabel 'notification' diurutkan dari yang terbaru
    return await ctx.db
      .query("notification")
      .withIndex("by_user", (q) => q.eq("id_user", args.userId))
      .order("desc")
      .collect();
  },
});

// Fungsi untuk membuat notifikasi baru untuk pengguna
export const createNotification = mutation({
  args: {
    id_user: v.id("users"), // Penerima notifikasi
    title: v.string(), // Judul notifikasi
    message: v.string(), // Isi pesan
  },
  handler: async (ctx, args) => {
    // Memasukkan data notifikasi dengan status belum dibaca
    return await ctx.db.insert("notification", {
      ...args,
      send_date: Date.now(),
      status_read: false,
    });
  },
});

// Fungsi untuk menandai sebuah notifikasi telah dibaca oleh pengguna
export const markAsRead = mutation({
  args: { notificationId: v.id("notification") },
  handler: async (ctx, args) => {
    // Memperbarui status status_read menjadi true
    await ctx.db.patch(args.notificationId, { status_read: true });
    return true;
  },
});
