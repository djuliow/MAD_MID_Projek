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
    // Mencari pengguna berdasarkan email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    // Validasi email dan kecocokan password
    if (!user || user.password !== args.password) {
      throw new ConvexError("Email atau password salah.");
    }

    return user;
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
