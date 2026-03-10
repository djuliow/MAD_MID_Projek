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
    total_copies: v.number(),
  },
  handler: async (ctx, args) => {
    const bookId = await ctx.db.insert("books", {
      ...args,
      available_copies: args.total_copies,
      created_at: Date.now(),
    });

    // Create copies automatically
    for (let i = 1; i <= args.total_copies; i++) {
      await ctx.db.insert("bookCopies", {
        id_book: bookId,
        copy_code: `${args.isbn}-${i}`,
        status: "available",
      });
    }

    return bookId;
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
