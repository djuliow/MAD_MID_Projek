import { query } from "./_generated/server";

export const getStats = query({
  handler: async (ctx) => {
    const allBooks = await ctx.db.query("books").collect();
    const borrowedBooks = await ctx.db
      .query("borrow")
      .filter((q) => q.eq(q.field("status"), "borrowed"))
      .collect();
    const reservations = await ctx.db
      .query("bookReservation")
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect();

    let totalCopies = 0;
    let availableCopies = 0;
    allBooks.forEach((book) => {
      totalCopies += book.total_copies;
      availableCopies += book.available_copies;
    });

    return {
      totalBooks: allBooks.length,
      totalCopies,
      borrowedBooks: borrowedBooks.length,
      availableBooks: availableCopies,
      activeReservations: reservations.length,
    };
  },
});

export const getRecentActivities = query({
  handler: async (ctx) => {
    const recentBorrows = await ctx.db
      .query("borrow")
      .order("desc")
      .take(10);

    return await Promise.all(
      recentBorrows.map(async (borrow) => {
        const user = await ctx.db.get(borrow.id_user);
        const copy = await ctx.db.get(borrow.id_copy);
        const book = copy ? await ctx.db.get(copy.id_book) : null;
        
        return {
          id: borrow._id,
          studentName: user?.name || "Unknown",
          action: borrow.status === "returned" ? "Returned" : "Borrowed",
          bookTitle: book?.title || "Unknown Book",
          time: new Date(borrow.borrow_date).toLocaleString(),
        };
      })
    );
  },
});
