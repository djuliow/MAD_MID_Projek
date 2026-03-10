import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getRooms = query({
  handler: async (ctx) => {
    return await ctx.db.query("rooms").collect();
  },
});

export const getRoomById = query({
  args: { id: v.id("rooms") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getRoomBookings = query({
  args: { userId: v.optional(v.id("users")), roomId: v.optional(v.id("rooms")) },
  handler: async (ctx, args) => {
    let bookings;
    if (args.userId) {
      bookings = await ctx.db
        .query("roomBooking")
        .withIndex("by_user", (q) => q.eq("id_user", args.userId!))
        .collect();
    } else {
      bookings = await ctx.db.query("roomBooking").collect();
    }

    // Map to include room and user details
    return await Promise.all(
      bookings.map(async (booking) => {
        const room = await ctx.db.get(booking.id_room);
        const user = await ctx.db.get(booking.id_user);
        return {
          ...booking,
          room,
          user,
        };
      })
    );
  },
});

export const getAllBookings = query({
  handler: async (ctx) => {
    const bookings = await ctx.db.query("roomBooking").order("desc").collect();

    return await Promise.all(
      bookings.map(async (booking) => {
        const room = await ctx.db.get(booking.id_room);
        const user = await ctx.db.get(booking.id_user);
        return {
          ...booking,
          room,
          user,
        };
      })
    );
  },
});

export const createRoom = mutation({
  args: {
    room_name: v.string(),
    capacity: v.number(),
    facilities: v.string(),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rooms", { ...args });
  },
});

export const bookRoom = mutation({
  args: {
    id_room: v.id("rooms"),
    id_user: v.id("users"),
    booking_date: v.number(),
    start_time: v.number(),
    end_time: v.number(),
  },
  handler: async (ctx, args) => {
    // Check for availability overlap
    const existingBookings = await ctx.db
      .query("roomBooking")
      .filter((q) =>
        q.and(
          q.eq(q.field("id_room"), args.id_room),
          q.eq(q.field("status"), "active"),
          q.or(
            q.and(
              q.lte(q.field("start_time"), args.start_time),
              q.gt(q.field("end_time"), args.start_time)
            ),
            q.and(
              q.lt(q.field("start_time"), args.end_time),
              q.gte(q.field("end_time"), args.end_time)
            )
          )
        )
      )
      .collect();

    if (existingBookings.length > 0) {
      throw new Error("Room is already booked during this time");
    }

    return await ctx.db.insert("roomBooking", {
      ...args,
      status: "active",
    });
  },
});

export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("roomBooking"),
    status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, { status: args.status });
    return true;
  },
});
