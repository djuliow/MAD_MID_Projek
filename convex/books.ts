import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBooks = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.category) {
      const category = args.category;
      return await ctx.db
        .query("books")
        .withIndex("by_category", (q) => q.eq("category", category))
        .collect();
    }
    return await ctx.db.query("books").order("desc").collect();
  },
});

export const getLatestBooks = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("books")
      .withIndex("by_creation")
      .order("desc")
      .take(args.limit);
  },
});

export const getBookById = query({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const addBook = mutation({
  args: {
    title: v.string(),
    author: v.string(),
    publisher: v.string(),
    year: v.number(),
    category: v.string(),
    isbn: v.string(),
    description: v.string(),
    shelf_location: v.string(),
    cover_image: v.string(),
    total_copies: v.optional(v.number()), // Buat jadi opsional
    is_coming_soon: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { is_coming_soon, total_copies, ...bookData } = args;
    const finalTotalCopies = total_copies ?? 0;
    
    const bookId = await ctx.db.insert("books", {
      ...bookData,
      total_copies: finalTotalCopies,
      is_coming_soon: is_coming_soon ?? false,
      available_copies: is_coming_soon ? 0 : finalTotalCopies,
      created_at: Date.now(),
    });

    // Create copies automatically only if NOT coming soon and stock > 0
    if (!is_coming_soon && finalTotalCopies > 0) {
      for (let i = 1; i <= finalTotalCopies; i++) {
        await ctx.db.insert("bookCopies", {
          id_book: bookId,
          copy_code: `${args.isbn}-${i}`,
          status: "available",
        });
      }
    }

    return bookId;
  },
});

export const updateBook = mutation({
  args: {
    id: v.id("books"),
    title: v.string(),
    author: v.string(),
    publisher: v.string(),
    year: v.number(),
    category: v.string(),
    isbn: v.string(),
    description: v.string(),
    shelf_location: v.string(),
    cover_image: v.string(),
    total_copies: v.number(),
    is_coming_soon: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, is_coming_soon, ...bookData } = args;
    const oldBook = await ctx.db.get(id);
    if (!oldBook) throw new Error("Buku tidak ditemukan");

    const comingSoonChanged = oldBook.is_coming_soon !== is_coming_soon;
    
    // Update data dasar buku
    await ctx.db.patch(id, {
      ...bookData,
      is_coming_soon: is_coming_soon ?? false,
      // Jika berubah dari coming soon ke tersedia, atur available_copies
      available_copies: (comingSoonChanged && !is_coming_soon) ? args.total_copies : oldBook.available_copies,
    });

    // Logika Otomatis: Jika berubah dari Coming Soon ke Tersedia
    if (comingSoonChanged && !is_coming_soon) {
      // Hapus salinan lama jika ada (antisipasi)
      const existingCopies = await ctx.db
        .query("bookCopies")
        .withIndex("by_book", (q) => q.eq("id_book", id))
        .collect();
      
      for (const copy of existingCopies) {
        await ctx.db.delete(copy._id);
      }

      // Buat salinan baru sesuai stok
      for (let i = 1; i <= args.total_copies; i++) {
        await ctx.db.insert("bookCopies", {
          id_book: id,
          copy_code: `${args.isbn}-${i}`,
          status: "available",
        });
      }
    }

    return true;
  },
});

export const getBookCopies = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookCopies")
      .withIndex("by_book", (q) => q.eq("id_book", args.bookId))
      .collect();
  },
});

export const getAvailableCopies = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookCopies")
      .withIndex("by_book", (q) => q.eq("id_book", args.bookId))
      .filter((q) => q.eq(q.field("status"), "available"))
      .collect();
  },
});
