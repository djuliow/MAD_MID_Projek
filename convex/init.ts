// File ini berisi fungsi-fungsi backend untuk inisialisasi dan perbaikan data awal.
// Digunakan untuk membuat akun admin pertama kali dan memperbaiki salinan buku yang hilang.

import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Membuat akun admin (pustakawan) secara otomatis jika belum ada di database
export const seedAdmin = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "admin@kampus.ac.id"))
      .unique();

    if (existing) return "Admin already exists";

    await ctx.db.insert("users", {
      name: "Administrator Perpus",
      email: "admin@unklab.ac.id",
      password: "admin123", // Password awal untuk login admin
      role: "librarian",
      created_at: Date.now(),
    });

    return "Admin created successfully! Email: admin@kampus.ac.id, Pass: admin123";
  },
});

// Menambahkan salinan buku (bookCopies) secara otomatis jika data salinan tidak sesuai dengan total_copies pada data buku
export const fixMissingCopies = mutation({
  handler: async (ctx) => {
    const allBooks = await ctx.db.query("books").collect();
    let createdTotal = 0;

    for (const book of allBooks) {
      const copies = await ctx.db
        .query("bookCopies")
        .withIndex("by_book", (q) => q.eq("id_book", book._id))
        .collect();

      const missingCount = book.total_copies - copies.length;

      if (missingCount > 0) {
        for (let i = 1; i <= missingCount; i++) {
          await ctx.db.insert("bookCopies", {
            id_book: book._id,
            copy_code: `${book.isbn}-FIX-${copies.length + i}`,
            status: "available",
          });
          createdTotal++;
        }
      }
    }

    return `Repair complete! Created ${createdTotal} missing book copies.`;
  },
});
