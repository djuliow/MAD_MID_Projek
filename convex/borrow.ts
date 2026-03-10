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
    type: v.union(v.literal("in_library"), v.literal("take_home")),
  },
  handler: async (ctx, args) => {
    const copy = await ctx.db.get(args.copyId);
    if (!copy || copy.status !== "available") throw new Error("Copy unavailable");

    const book = await ctx.db.get(copy.id_book);
    if (!book || book.available_copies <= 0) throw new Error("No copies available");

    // 1. Create borrow record
    const borrowId = await ctx.db.insert("borrow", {
      id_user: args.userId,
      id_copy: args.copyId,
      borrow_date: Date.now(),
      due_date: args.dueDate,
      status: "borrowed",
      type: args.type,
    });

    // 2. Update statuses
    await ctx.db.patch(args.copyId, { status: "borrowed" });
    await ctx.db.patch(book._id, { available_copies: book.available_copies - 1 });

    // 3. Reward Points
    const reward = args.type === 'in_library' ? 20 : 5;
    const user = await ctx.db.get(args.userId);
    if (user) {
      await ctx.db.patch(args.userId, {
        library_points: (user.library_points ?? 0) + reward,
      });

      // LOG POINT HISTORY
      await ctx.db.insert("pointLogs", {
        id_user: args.userId,
        activity_type: "borrow",
        description: `Pinjam Buku: ${book.title} (${args.type === 'in_library' ? 'Baca di Perpus' : 'Bawa Pulang'})`,
        points: reward,
        timestamp: Date.now(),
      });
    }

    // 4. Notification
    await ctx.db.insert("notification", {
      id_user: args.userId,
      title: "Pinjam Berhasil!",
      message: `Anda meminjam "${book.title}" (${args.type === 'in_library' ? 'Baca di Perpus' : 'Bawa Pulang'}). Bonus: +${reward} Poin!`,
      send_date: Date.now(),
      status_read: false,
    });

    return borrowId;
  },
});

export const returnBook = mutation({
  args: { borrowId: v.id("borrow") },
  handler: async (ctx, args) => {
    const borrow = await ctx.db.get(args.borrowId);
    if (!borrow || borrow.status === "returned") throw new Error("Invalid record");

    const copy = await ctx.db.get(borrow.id_copy);
    const book = copy ? await ctx.db.get(copy.id_book) : null;
    if (!book) throw new Error("Book not found");

    const now = Date.now();
    const isLate = now > borrow.due_date;

    // 1. Update borrow & copy
    await ctx.db.patch(args.borrowId, { return_date: now, status: "returned", updated_at: now });
    if (copy) await ctx.db.patch(copy._id, { status: "available" });

    // 2. Update book stock
    await ctx.db.patch(book._id, { available_copies: Math.min(book.available_copies + 1, book.total_copies) });

    // 3. Points Logic
    const user = await ctx.db.get(borrow.id_user);
    if (user) {
      let pointsChange = 0;
      let msg = "";
      
      if (!isLate) {
        pointsChange = 5;
        msg = `Tepat waktu memulangkan "${book.title}". Bonus: +5 Poin.`;
      } else {
        if (borrow.type === 'take_home') {
          pointsChange = -25;
          msg = `Terlambat memulangkan "${book.title}" (Bawa Pulang). Penalty: -25 Poin.`;
        } else {
          pointsChange = 0;
          msg = `Terlambat memulangkan "${book.title}" (Baca di Perpus). Tidak ada poin tambahan.`;
        }
      }

      if (pointsChange !== 0) {
        await ctx.db.patch(user._id, {
          library_points: Math.max(0, (user.library_points ?? 0) + pointsChange),
        });

        // LOG POINT HISTORY
        await ctx.db.insert("pointLogs", {
          id_user: user._id,
          activity_type: pointsChange < 0 ? "penalty" : "return",
          description: msg,
          points: pointsChange,
          timestamp: Date.now(),
        });
      }

      await ctx.db.insert("notification", {
        id_user: user._id,
        title: pointsChange < 0 ? "Penalty Poin!" : "Informasi Poin",
        message: msg,
        send_date: Date.now(),
        status_read: false,
      });
    }

    return true;
  },
});
