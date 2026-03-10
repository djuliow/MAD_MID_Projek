import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getBorrowedBooksByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const borrows = await ctx.db
      .query("borrow")
      .withIndex("by_user", (q) => q.eq("id_user", args.userId))
      .collect();

    return await Promise.all(
      borrows.map(async (borrow) => {
        const copy = await ctx.db.get(borrow.id_copy);
        const book = copy ? await ctx.db.get(copy.id_book) : null;
        return {
          ...borrow,
          copy,
          book,
        };
      })
    );
  },
});

export const getAllBorrows = query({
  handler: async (ctx) => {
    const borrows = await ctx.db.query("borrow").order("desc").collect();

    const results = await Promise.all(
      borrows.map(async (borrow) => {
        const user = await ctx.db.get(borrow.id_user);
        const copy = await ctx.db.get(borrow.id_copy);
        const book = copy ? await ctx.db.get(copy.id_book) : null;
        
        return {
          ...borrow,
          user,
          copy,
          book,
        };
      })
    );

    // Filter hanya yang belum dikembalikan untuk tampilan 'Loans'
    return results.filter(r => r.status === 'borrowed' || r.status === 'late');
  },
});

export const getBorrowHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const history = await ctx.db
      .query("borrow")
      .withIndex("by_user", (q) => q.eq("id_user", args.userId))
      .filter((q) => q.eq(q.field("status"), "returned"))
      .order("desc")
      .collect();

    return await Promise.all(
      history.map(async (item) => {
        const copy = await ctx.db.get(item.id_copy);
        const book = copy ? await ctx.db.get(copy.id_book) : null;
        return {
          ...item,
          book,
        };
      })
    );
  },
});

export const borrowBook = mutation({
  args: {
    userId: v.id("users"),
    copyId: v.id("bookCopies"),
    dueDate: v.number(),
  },
  handler: async (ctx, args) => {
    const copy = await ctx.db.get(args.copyId);
    if (!copy || copy.status !== "available") {
      throw new Error("Book copy is not available");
    }

    const book = await ctx.db.get(copy.id_book);
    if (!book || book.available_copies <= 0) {
      throw new Error("No available copies for this book");
    }

    // 1. create borrow record
    const borrowId = await ctx.db.insert("borrow", {
      id_user: args.userId,
      id_copy: args.copyId,
      borrow_date: Date.now(),
      due_date: args.dueDate,
      status: "borrowed",
    });

    // 2. update book copy status to borrowed
    await ctx.db.patch(args.copyId, { status: "borrowed" });

    // 3. decrease available_copies
    await ctx.db.patch(book._id, {
      available_copies: book.available_copies - 1,
    });

    return borrowId;
  },
});

export const returnBook = mutation({
  args: {
    borrowId: v.id("borrow"),
  },
  handler: async (ctx, args) => {
    const borrow = await ctx.db.get(args.borrowId);
    if (!borrow || borrow.status === "returned") {
      throw new Error("Invalid borrow record or already returned");
    }

    const copy = await ctx.db.get(borrow.id_copy);
    if (!copy) throw new Error("Copy not found");

    const book = await ctx.db.get(copy.id_book);
    if (!book) throw new Error("Book not found");

    // 1. update borrow record status
    await ctx.db.patch(args.borrowId, {
      return_date: Date.now(),
      status: "returned",
    });

    // 2. update physical copy status back to available
    await ctx.db.patch(copy._id, { status: "available" });

    // 3. increase available_copies, but don't exceed total_copies
    const newAvailableCount = Math.min(book.available_copies + 1, book.total_copies);
    await ctx.db.patch(book._id, {
      available_copies: newAvailableCount,
    });

    return true;
  },
});
