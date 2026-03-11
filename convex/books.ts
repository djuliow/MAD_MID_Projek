import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Fungsi untuk mengambil daftar buku, dapat difilter berdasarkan kategori
export const getBooks = query({
  args: { category: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // Jika kategori diberikan, ambil buku sesuai kategori tersebut
    if (args.category) {
      const category = args.category;
      return await ctx.db
        .query("books")
        .withIndex("by_category", (q) => q.eq("category", category))
        .collect();
    }
    // Jika tidak, ambil semua buku diurutkan dari yang terbaru ditambahkan
    return await ctx.db.query("books").order("desc").collect();
  },
});

// Fungsi untuk mengambil sejumlah buku terbaru yang ditambahkan
export const getLatestBooks = query({
  args: { limit: v.number() }, // Jumlah maksimal buku yang diambil
  handler: async (ctx, args) => {
    return await ctx.db
      .query("books")
      .withIndex("by_creation")
      .order("desc")
      .take(args.limit);
  },
});

// Fungsi untuk mendapatkan detail satu buku berdasarkan ID
export const getBookById = query({
  args: { id: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Fungsi untuk menambahkan buku baru ke dalam koleksi perpustakaan
export const addBook = mutation({
  args: {
    title: v.string(), // Judul buku
    author: v.string(), // Nama penulis
    publisher: v.string(), // Nama penerbit
    year: v.number(), // Tahun terbit
    category: v.string(), // Kategori buku
    isbn: v.string(), // Nomor ISBN
    description: v.string(), // Deskripsi/sinopsis buku
    shelf_location: v.string(), // Lokasi penyimpanan buku
    cover_image: v.string(), // URL sampul buku
    total_copies: v.optional(v.number()), // Total jumlah eksemplar
    is_coming_soon: v.optional(v.boolean()), // Penanda buku akan segera tersedia
  },
  handler: async (ctx, args) => {
    const { is_coming_soon, total_copies, ...bookData } = args;
    const finalTotalCopies = total_copies ?? 0;
    
    // Memasukkan data buku ke tabel books
    const bookId = await ctx.db.insert("books", {
      ...bookData,
      total_copies: finalTotalCopies,
      is_coming_soon: is_coming_soon ?? false,
      available_copies: is_coming_soon ? 0 : finalTotalCopies, // Jika coming soon, stok belum tersedia
      created_at: Date.now(),
    });

    // Membuat salinan (copies) buku secara otomatis jika bukan coming soon dan ada stok
    if (!is_coming_soon && finalTotalCopies > 0) {
      for (let i = 1; i <= finalTotalCopies; i++) {
        await ctx.db.insert("bookCopies", {
          id_book: bookId,
          copy_code: `${args.isbn}-${i}`,
          status: "available",
        });
      }
    }

    return bookId;
  },
});

// Fungsi untuk memperbarui informasi buku yang sudah ada
export const updateBook = mutation({
  args: {
    id: v.id("books"),
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
    is_coming_soon: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, is_coming_soon, ...bookData } = args;
    const oldBook = await ctx.db.get(id);
    if (!oldBook) throw new Error("Buku tidak ditemukan");

    // Mengecek apakah status 'coming soon' berubah
    const comingSoonChanged = oldBook.is_coming_soon !== is_coming_soon;
    
    // Melakukan update pada data buku
    await ctx.db.patch(id, {
      ...bookData,
      is_coming_soon: is_coming_soon ?? false,
      // Update jumlah tersedia jika status coming soon dilepas
      available_copies: (comingSoonChanged && !is_coming_soon) ? args.total_copies : oldBook.available_copies,
    });

    // Jika buku berubah dari 'Coming Soon' menjadi 'Tersedia', buat salinan fisiknya
    if (comingSoonChanged && !is_coming_soon) {
      // Hapus salinan lama jika sebelumnya sudah ada
      const existingCopies = await ctx.db
        .query("bookCopies")
        .withIndex("by_book", (q) => q.eq("id_book", id))
        .collect();
      
      for (const copy of existingCopies) {
        await ctx.db.delete(copy._id);
      }

      // Buat salinan fisik baru sesuai dengan jumlah total_copies
      for (let i = 1; i <= args.total_copies; i++) {
        await ctx.db.insert("bookCopies", {
          id_book: id,
          copy_code: `${args.isbn}-${i}`,
          status: "available",
        });
      }
    }

    return true;
  },
});

// Fungsi untuk mengambil semua salinan/eksemplar dari sebuah buku tertentu
export const getBookCopies = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookCopies")
      .withIndex("by_book", (q) => q.eq("id_book", args.bookId))
      .collect();
  },
});

// Fungsi untuk mengambil daftar salinan buku yang sedang tersedia untuk dipinjam
export const getAvailableCopies = query({
  args: { bookId: v.id("books") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bookCopies")
      .withIndex("by_book", (q) => q.eq("id_book", args.bookId))
      .filter((q) => q.eq(q.field("status"), "available"))
      .collect();
  },
});
