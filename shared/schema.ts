import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const translationRequests = pgTable("translation_requests", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  fileFormat: text("file_format").notNull(),
  fileSize: integer("file_size").notNull(),
  wordCount: integer("word_count").notNull(),
  charCount: integer("char_count").notNull(),
  imagesWithText: integer("images_with_text").notNull(),
  subjectMatter: text("subject_matter").notNull(),
  sourceLanguage: text("source_language").notNull(),
  targetLanguages: text("target_languages").array().notNull(),
  creditsRequired: integer("credits_required").notNull(),
  totalCost: text("total_cost").notNull(),
  status: text("status").notNull().default("pending"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTranslationRequestSchema = createInsertSchema(translationRequests).omit({
  id: true,
  status: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTranslationRequest = z.infer<typeof insertTranslationRequestSchema>;
export type TranslationRequest = typeof translationRequests.$inferSelect;

export const fileAnalysisSchema = z.object({
  fileName: z.string(),
  fileFormat: z.string(),
  fileSize: z.number(),
  wordCount: z.number(),
  charCount: z.number(),
  imagesWithText: z.number(),
  subjectMatter: z.string(),
  sourceLanguage: z.string(),
});

export type FileAnalysis = z.infer<typeof fileAnalysisSchema>;
