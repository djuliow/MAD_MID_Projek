/**
 * Attendance and Point History Module
 * Last Updated: 2026-03-11
 */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Mendapatkan format tanggal YYYY-MM-DD sesuai zona waktu WITA (Asia/Makassar)
 */
function getTodayDate() {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Makassar',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };
  const formatter = new Intl.DateTimeFormat('en-CA', options);
  return formatter.format(new Date());
}

// --- ADMIN FUNCTIONS ---

export const createDailyCode = mutation({
  args: {
    code: v.string(),
    points: v.number(),
  },
  handler: async (ctx, args) => {
    const today = getTodayDate();
    const cleanCode = args.code.trim().toUpperCase();
    
    const existing = await ctx.db
      .query("dailyCodes")
      .withIndex("by_date", (q) => q.eq("date", today))
      .unique();
    
    if (existing) {
      throw new Error("Kode untuk hari ini sudah dibuat.");
    }

    return await ctx.db.insert("dailyCodes", {
      code: cleanCode,
      date: today,
      points_value: args.points,
    });
  },
});

export const getDailyCode = query({
  handler: async (ctx) => {
    const today = getTodayDate();
    return await ctx.db
      .query("dailyCodes")
      .withIndex("by_date", (q) => q.eq("date", today))
      .unique();
  },
});

// --- STUDENT FUNCTIONS ---

export const submitDailyCode = mutation({
  args: {
    userId: v.id("users"),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    const today = getTodayDate();
    const inputCode = args.code.trim().toUpperCase();

    const dailyCode = await ctx.db
      .query("dailyCodes")
      .withIndex("by_date", (q) => q.eq("date", today))
      .unique();

    if (!dailyCode || dailyCode.code !== inputCode) {
      throw new Error("Kode tidak valid.");
    }

    const alreadyAttended = await ctx.db
      .query("attendance")
      .withIndex("by_user_date", (q) => q.eq("id_user", args.userId).eq("date", today))
      .unique();

    if (alreadyAttended) {
      throw new Error("Anda sudah absen hari ini.");
    }

    // 1. Catat Kehadiran
    await ctx.db.insert("attendance", {
      id_user: args.userId,
      date: today,
      points_earned: dailyCode.points_value,
    });

    // 2. Update Poin User
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(args.userId, {
      library_points: (user.library_points ?? 0) + dailyCode.points_value,
    });

    // 3. Catat ke Point History (LOGS)
    await ctx.db.insert("pointLogs", {
      id_user: args.userId,
      activity_type: "attendance",
      description: "Absensi Harian Perpustakaan",
      points: dailyCode.points_value,
      timestamp: Date.now(),
    });

    return { success: true, points: dailyCode.points_value };
  },
});

export const redeemPoints = mutation({
  args: {
    userId: v.id("users"),
    amountToRedeem: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const currentPoints = user.library_points ?? 0;
    if (currentPoints < args.amountToRedeem) throw new Error("Poin tidak cukup.");

    await ctx.db.patch(args.userId, {
      library_points: currentPoints - args.amountToRedeem,
    });

    // Catat ke Point History (LOGS)
    await ctx.db.insert("pointLogs", {
      id_user: args.userId,
      activity_type: "redeem",
      description: `Penukaran ${args.amountToRedeem} Poin Perpus`,
      points: -args.amountToRedeem,
      timestamp: Date.now(),
    });

    return { success: true };
  },
});

export const getUserPointHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("pointLogs")
      .withIndex("by_user", (q) => q.eq("id_user", args.userId))
      .order("desc")
      .collect();
  },
});

export const getAttendanceHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("attendance")
      .withIndex("by_user_date", (q) => q.eq("id_user", args.userId))
      .order("desc")
      .collect();
  },
});

export const getAllAttendance = query({
  handler: async (ctx) => {
    const today = getTodayDate();
    const logs = await ctx.db
      .query("attendance")
      .withIndex("by_user_date")
      .filter((q) => q.eq(q.field("date"), today))
      .order("desc")
      .collect();
    
    return await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.id_user);
        return {
          ...log,
          userName: user?.name || "Unknown",
          studentId: user?.student_id || "N/A",
        };
      })
    );
  },
});

export const getAttendanceByRange = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, args) => {
    const logs = await ctx.db
      .query("attendance")
      .filter((q) => 
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    const results = await Promise.all(
      logs.map(async (log) => {
        const user = await ctx.db.get(log.id_user);
        return {
          ...log,
          userName: user?.name || "Unknown",
          studentId: user?.student_id || "N/A",
        };
      })
    );

    return results.sort((a, b) => b.date.localeCompare(a.date));
  },
});
