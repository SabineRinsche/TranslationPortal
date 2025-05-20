import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const accounts = pgTable("accounts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  credits: integer("credits").notNull().default(0),
  subscriptionPlan: text("subscription_plan"),
  subscriptionStatus: text("subscription_status"),
  subscriptionRenewal: timestamp("subscription_renewal"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // 'user', 'admin'
  jobTitle: text("job_title"),
  phoneNumber: text("phone_number"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const translationRequests = pgTable("translation_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileFormat: text("file_format").notNull(),
  fileSize: integer("file_size").notNull(),
  wordCount: integer("word_count").notNull(),
  charCount: integer("char_count").notNull(),
  imagesWithText: integer("images_with_text").notNull(),
  subjectMatter: text("subject_matter").notNull(),
  sourceLanguage: text("source_language").notNull(),
  targetLanguages: text("target_languages").array().notNull(),
  workflow: text("workflow"), // Selected workflow type
  creditsRequired: integer("credits_required").notNull(),
  totalCost: text("total_cost").notNull(),
  status: text("status").notNull().default("pending"),
  dueDate: timestamp("due_date"),
  estimatedCompletionDate: timestamp("estimated_completion_date"),
  priority: text("priority").default("medium"),
  projectName: text("project_name"),
  assignedTo: text("assigned_to"),
  completionPercentage: integer("completion_percentage").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Project status updates/notes for tracking progress
export const projectUpdates = pgTable("project_updates", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull().references(() => translationRequests.id),
  userId: integer("user_id").notNull().references(() => users.id),
  updateText: text("update_text").notNull(),
  updateType: text("update_type").default("note"), // Could be 'note', 'status_change', 'milestone'
  newStatus: text("new_status"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subscription plans configuration
export const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 5000,
    features: [
      'Translate up to 5,000 characters per month',
      'Simple file analysis',
      'Email support'
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 19.99,
    credits: 100000,
    features: [
      'Translate up to 100,000 characters per month',
      'Advanced file analysis',
      'Priority email support',
      'API access'
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 49.99,
    credits: 500000,
    features: [
      'Translate up to 500,000 characters per month',
      'Advanced file analysis',
      'Priority phone & email support',
      'Full API access',
      'Team collaboration tools'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199.99,
    credits: 2500000,
    features: [
      'Translate up to 2,500,000 characters per month',
      'Advanced file analysis with AI insights',
      'Dedicated account manager',
      'Full API access with higher rate limits',
      'Team collaboration with admin controls',
      'Custom glossaries and translation memory'
    ]
  }
];

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTranslationRequestSchema = createInsertSchema(translationRequests).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  completionPercentage: true,
}).extend({
  workflow: z.string().nullable().optional(),
  projectName: z.string().optional(),
  dueDate: z.date().optional(),
  estimatedCompletionDate: z.date().optional(),
  priority: z.string().optional(),
  assignedTo: z.string().optional(),
});

export const insertProjectUpdateSchema = createInsertSchema(projectUpdates).omit({
  id: true,
  createdAt: true,
});

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTranslationRequest = z.infer<typeof insertTranslationRequestSchema>;
export type TranslationRequest = typeof translationRequests.$inferSelect;

export type InsertProjectUpdate = z.infer<typeof insertProjectUpdateSchema>;
export type ProjectUpdate = typeof projectUpdates.$inferSelect;

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
