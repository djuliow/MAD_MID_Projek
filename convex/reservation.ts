import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

export const getAllReservations = query({
  handler: async (ctx) => {
    const reservations = await ctx.db
      .query("bookReservation")
      .order("desc")
      .collect();

    return await Promise.all(
      reservations.map(async (res) => {
        const book = await ctx.db.get(res.id_book);
        const user = await ctx.db.get(res.id_user);
        return {
          ...res,
          book,
          user,
        };
      })
    );
  },
});

export const reserveBook = mutation({
  args: {
    userId: v.id("users"),
    bookId: v.id("books"),
    pickupDeadline: v.number(),
    type: v.union(v.literal("in_library"), v.literal("take_home")),
  },
  handler: async (ctx, args) => {
    // Basic check: is the book already reserved by this user?
    const existing = await ctx.db
      .query("bookReservation")
      .withIndex("by_user", (q) => q.eq("id_user", args.userId))
      .filter((q) =>
        q.and(q.eq(q.field("id_book"), args.bookId), q.eq(q.field("status"), "active"))
      )
      .unique();

    if (existing) {
      throw new Error("You already have an active reservation for this book");
    }

    return await ctx.db.insert("bookReservation", {
      id_user: args.userId,
      id_book: args.bookId,
      reservation_date: Date.now(),
      pickup_deadline: args.pickupDeadline,
      status: "active",
      type: args.type,
    });
  },
});

export const updateReservationStatus = mutation({
  args: {
    reservationId: v.id("bookReservation"),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("expired")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.reservationId, { status: args.status });
    return true;
  },
});

export const confirmPickup = mutation({
  args: {
    reservationId: v.id("bookReservation"),
  },
  handler: async (ctx, args) => {
    const res = await ctx.db.get(args.reservationId);
    if (!res || res.status !== "active") throw new Error("Invalid reservation");

    // 1. Find an available copy of this book
    const copy = await ctx.db
      .query("bookCopies")
      .withIndex("by_book", (q) => q.eq("id_book", res.id_book))
      .filter((q) => q.eq(q.field("status"), "available"))
      .first();

    if (!copy) throw new Error("No available copies found to fulfill this reservation.");

    const book = await ctx.db.get(res.id_book);
    if (!book) throw new Error("Book data not found");

    // 2. Mark reservation as completed
    await ctx.db.patch(args.reservationId, { status: "completed" });

    // 3. Create active borrow record
    // Default 7 days for take home, 4 hours for in-library
    const loanDuration = res.type === "take_home" 
      ? 7 * 24 * 60 * 60 * 1000 
      : 4 * 60 * 60 * 1000;

    await ctx.db.insert("borrow", {
      id_user: res.id_user,
      id_copy: copy._id,
      borrow_date: Date.now(),
      due_date: Date.now() + loanDuration,
      status: "borrowed",
    });

    // 4. Update physical copy status to borrowed
    await ctx.db.patch(copy._id, { status: "borrowed" });

    // 5. Decrease available copies in main book record
    await ctx.db.patch(book._id, {
      available_copies: book.available_copies - 1,
    });

    // 6. Send notification to student
    const durationText = res.type === "take_home" ? "7 days" : "today (in-library)";
    await ctx.db.insert("notification", {
      id_user: res.id_user,
      title: "Loan Started!",
      message: `You have picked up "${book.title}". Please return it ${durationText}.`,
      send_date: Date.now(),
      status_read: false,
    });

    return true;
  },
});
