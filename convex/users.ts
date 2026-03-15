import { mutation, query } from "./_generated/server";
import { v, ConvexError } from "convex/values";

// Fungsi untuk membuat pengguna baru
export const createUser = mutation({
  args: {
    name: v.string(), // Nama lengkap
    email: v.string(), // Email pengguna
    password: v.string(), // Password pengguna
    role: v.union(v.literal("student"), v.literal("librarian")), // Peran pengguna
    student_id: v.optional(v.string()), // NIM (jika mahasiswa)
  },
  handler: async (ctx, args) => {
    // Mengecek apakah email sudah terdaftar
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
    if (existing) {
      throw new ConvexError("User already exists");
    }
    // Menyimpan data pengguna baru ke tabel users
    return await ctx.db.insert("users", {
      ...args,
      created_at: Date.now(),
    });
  },
});

// Fungsi untuk mengambil data pengguna berdasarkan ID
export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Fungsi untuk mencari pengguna berdasarkan alamat email
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

// Fungsi untuk proses autentikasi login pengguna
export const login = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedEmail = args.email.toLowerCase().trim();
    
    // Mencari pengguna berdasarkan email (case-insensitive)
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), normalizedEmail))
      .unique();

    // Jika tidak ketemu dengan filter manual, coba dengan index (untuk backup)
    let finalUser = user;
    if (!finalUser) {
      finalUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .unique();
    }

    // Validasi email dan kecocokan password
    if (!finalUser || finalUser.password !== args.password) {
      throw new ConvexError("Email atau password salah.");
    }

    return finalUser;
  },
});

// Fungsi untuk mengambil semua daftar pengguna yang berperan sebagai mahasiswa
export const getStudents = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "student"))
      .collect();
  },
});

// Fungsi untuk menghapus data pengguna berdasarkan ID
export const deleteUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Fungsi untuk mengubah password pengguna
export const changePassword = mutation({
  args: {
    userId: v.id("users"),
    oldPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("Pengguna tidak ditemukan.");
    }

    // Verifikasi password lama
    if (user.password !== args.oldPassword) {
      throw new ConvexError("Password lama tidak sesuai.");
    }

    // Update ke password baru
    await ctx.db.patch(args.userId, {
      password: args.newPassword,
    });

    // Ambil data user terbaru untuk dikembalikan ke frontend
    const updatedUser = await ctx.db.get(args.userId);
    return updatedUser;
  },
});

// Fungsi untuk memperbarui data pengguna oleh admin
export const updateUser = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    student_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    // Jika email diubah, cek apakah sudah ada yang memakai
    if (updates.email) {
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", updates.email!))
        .unique();
      
      if (existing && existing._id !== id) {
        throw new ConvexError("Email sudah digunakan oleh pengguna lain.");
      }
    }

    await ctx.db.patch(id, updates);
    return { success: true };
  },
});
