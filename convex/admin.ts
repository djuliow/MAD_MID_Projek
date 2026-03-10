import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

async function formatActivities(ctx: any, borrows: any[], bookRes: any[], roomBookings: any[]) {
  const borrowLogs = await Promise.all(
    borrows.map(async (borrow) => {
      const user = await ctx.db.get(borrow.id_user);
      const copy = await ctx.db.get(borrow.id_copy);
      const book = copy ? await ctx.db.get(copy.id_book) : null;
      
      const isReturned = borrow.status === "returned";
      const time = isReturned && borrow.updated_at ? borrow.updated_at : borrow.borrow_date;

      return {
        id: borrow._id + (isReturned ? "_ret" : ""),
        studentName: user?.name || "Unknown",
        action: isReturned ? "Returned" : "Borrowed",
        bookTitle: book?.title || "Unknown Book",
        timestamp: time,
        time: new Date(time).toLocaleString('id-ID', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar'
        }),
      };
    })
  );

  const reservationLogs = await Promise.all(
    bookRes.map(async (res) => {
      const user = await ctx.db.get(res.id_user);
      const book = await ctx.db.get(res.id_book);
      return {
        id: res._id,
        studentName: user?.name || "Unknown",
        action: "Reserved",
        bookTitle: book?.title || "Unknown Book",
        timestamp: res.reservation_date,
        time: new Date(res.reservation_date).toLocaleString('id-ID', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar'
        }),
      };
    })
  );

  const roomLogs: any[] = [];
  for (const rb of roomBookings) {
    const user = await ctx.db.get(rb.id_user);
    const room = await ctx.db.get(rb.id_room);
    const roomName = room?.room_name || "Unknown Room";
    const studentName = user?.name || "Unknown";

    // Log awal booking
    roomLogs.push({
      id: rb._id + "_booked",
      studentName,
      action: "Room Booked",
      bookTitle: roomName,
      timestamp: rb._creationTime,
      time: new Date(rb._creationTime).toLocaleString('id-ID', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar'
      }),
    });

    // Log jika status berubah (Cancelled/Finished)
    if (rb.status !== 'active' && rb.updated_at) {
      roomLogs.push({
        id: rb._id + "_status_" + rb.status,
        studentName,
        action: rb.status === 'completed' ? 'Room Finished' : 'Room Cancelled',
        bookTitle: roomName,
        timestamp: rb.updated_at,
        time: new Date(rb.updated_at).toLocaleString('id-ID', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar'
        }),
      });
    }
  }

  return [...borrowLogs, ...reservationLogs, ...roomLogs].sort((a, b) => b.timestamp - a.timestamp);
}

export const getRecentActivities = query({
  handler: async (ctx) => {
    const borrows = await ctx.db.query("borrow").order("desc").take(10);
    const bookRes = await ctx.db.query("bookReservation").order("desc").take(10);
    const roomBookings = await ctx.db.query("roomBooking").order("desc").take(10);

    const all = await formatActivities(ctx, borrows, bookRes, roomBookings);
    return all.slice(0, 15);
  },
});

export const getAllActivities = query({
  handler: async (ctx) => {
    const borrows = await ctx.db.query("borrow").order("desc").take(50);
    const bookRes = await ctx.db.query("bookReservation").order("desc").take(50);
    const roomBookings = await ctx.db.query("roomBooking").order("desc").take(50);

    return await formatActivities(ctx, borrows, bookRes, roomBookings);
  },
});

export const syncLegacyPoints = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const currentPoints = user.library_points ?? 0;
    if (currentPoints === 0) return true;

    // Cek apakah sudah pernah sinkronisasi agar tidak double
    const existing = await ctx.db
      .query("pointLogs")
      .withIndex("by_user", (q) => q.eq("id_user", args.userId))
      .filter((q) => q.eq(q.field("activity_type"), "initial_sync"))
      .first();

    if (existing) throw new Error("Akun ini sudah pernah disinkronisasi.");

    // Masukkan saldo saat ini ke riwayat sebagai "Saldo Awal"
    await ctx.db.insert("pointLogs", {
      id_user: args.userId,
      activity_type: "initial_sync",
      description: "Saldo Poin Awal (Sinkronisasi)",
      points: currentPoints,
      timestamp: Date.now(),
    });

    return true;
  },
});
