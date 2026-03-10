import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserNotifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notification")
      .withIndex("by_user", (q) => q.eq("id_user", args.userId))
      .order("desc")
      .collect();
  },
});

export const createNotification = mutation({
  args: {
    id_user: v.id("users"),
    title: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notification", {
      ...args,
      send_date: Date.now(),
      status_read: false,
    });
  },
});

export const markAsRead = mutation({
  args: { notificationId: v.id("notification") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.notificationId, { status_read: true });
    return true;
  },
});
