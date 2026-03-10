import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("student"), v.literal("librarian")),
    student_id: v.optional(v.string()),
    library_points: v.optional(v.number()), // Poin dari kehadiran perpus
    created_at: v.number(), // timestamp
  }).index("by_email", ["email"]),

  books: defineTable({
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
    available_copies: v.number(),
    is_coming_soon: v.optional(v.boolean()), // Penanda buku akan datang
    created_at: v.number(), // timestamp
  }).index("by_category", ["category"])
    .index("by_creation", ["created_at"]),

  bookCopies: defineTable({
    id_book: v.id("books"),
    copy_code: v.string(),
    status: v.union(v.literal("available"), v.literal("borrowed"), v.literal("reserved")),
  }).index("by_book", ["id_book"]),

  borrow: defineTable({
    id_user: v.id("users"),
    id_copy: v.id("bookCopies"),
    borrow_date: v.number(),
    due_date: v.number(),
    return_date: v.optional(v.number()),
    status: v.union(v.literal("borrowed"), v.literal("returned"), v.literal("late")),
    type: v.optional(v.union(v.literal("in_library"), v.literal("take_home"))), // Ubah jadi optional
    updated_at: v.optional(v.number()), // Log update terbaru
  }).index("by_user", ["id_user"]),

  bookReservation: defineTable({
    id_user: v.id("users"),
    id_book: v.id("books"),
    reservation_date: v.number(),
    pickup_deadline: v.number(),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("expired")),
    type: v.union(v.literal("in_library"), v.literal("take_home")),
    updated_at: v.optional(v.number()), // Log update terbaru
  }).index("by_user", ["id_user"]),

  rooms: defineTable({
    room_name: v.string(),
    capacity: v.number(),
    facilities: v.string(),
    location: v.string(),
  }),

  roomBooking: defineTable({
    id_room: v.id("rooms"),
    id_user: v.id("users"),
    booking_date: v.number(),
    start_time: v.number(), // timestamp
    end_time: v.number(), // timestamp
    status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("completed")),
    updated_at: v.optional(v.number()), // Log update terbaru
  }).index("by_user", ["id_user"]),

  notification: defineTable({
    id_user: v.id("users"),
    title: v.string(),
    message: v.string(),
    send_date: v.number(),
    status_read: v.boolean(),
  }).index("by_user", ["id_user"]),

  dailyCodes: defineTable({
    code: v.string(),
    date: v.string(), // Format "YYYY-MM-DD"
    points_value: v.number(),
  }).index("by_date", ["date"]),

  attendance: defineTable({
    id_user: v.id("users"),
    date: v.string(), // Format "YYYY-MM-DD"
    points_earned: v.number(),
  }).index("by_user_date", ["id_user", "date"]),

  pointLogs: defineTable({
    id_user: v.id("users"),
    activity_type: v.string(), // "attendance", "borrow", "return", "penalty", "redeem"
    description: v.string(), // Deskripsi aktivitas (misal: "Absensi Harian", "Pinjam Buku: Harry Potter")
    points: v.number(), // Jumlah poin (bisa positif atau negatif)
    timestamp: v.number(),
  }).index("by_user", ["id_user"]),

  favorites: defineTable({
    id_user: v.id("users"),
    id_book: v.id("books"),
  }).index("by_user", ["id_user"])
    .index("by_user_book", ["id_user", "id_book"]),
});
