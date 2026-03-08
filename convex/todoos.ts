import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
// mau buat table wajib panggil definetable
export default defineSchema({
    todoos: defineTable({
        text: v.string(), //field text dengan tipe data string, panggil v.string() untuk mendefinisikan tipe data string
        isCompleted: v.boolean(), //field isCompleted dengan tipe data boolean, 

    })
})