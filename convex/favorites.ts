import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const toggleFavorite = mutation({
  args: { userId: v.id("users"), bookId: v.id("books") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_book", (q) =>
        q.eq("id_user", args.userId).eq("id_book", args.bookId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false; // Berarti dihapus
    } else {
      await ctx.db.insert("favorites", {
        id_user: args.userId,
        id_book: args.bookId,
      });
      return true; // Berarti ditambahkan
    }
  },
});

export const isFavorite = query({
  args: { userId: v.id("users"), bookId: v.id("books") },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query("favorites")
      .withIndex("by_user_book", (q) =>
        q.eq("id_user", args.userId).eq("id_book", args.bookId)
      )
      .unique();
    return !!favorite;
  },
});

export const getFavoritesByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("id_user", args.userId))
      .collect();

    const results = await Promise.all(
      favorites.map(async (fav) => {
        return await ctx.db.get(fav.id_book);
      })
    );

    return results.filter((book) => book !== null);
  },
});
