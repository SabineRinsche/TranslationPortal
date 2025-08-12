import { pgTable, text, serial, integer, boolean, jsonb, timestamp, index } from "drizzle-orm/pg-core";
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
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Session storage table for user sessions
export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Teams table - each team is a separate client organization with its own account
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  // Each team has its own credits and billing
  credits: integer("credits").default(5000).notNull(),
  subscriptionPlan: text("subscription_plan").default("free").notNull(),
  subscriptionStatus: text("subscription_status").default("active").notNull(),
  billingEmail: text("billing_email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User accounts with authentication features
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").notNull().references(() => accounts.id),
  teamId: integer("team_id").references(() => teams.id),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // 'user', 'admin'
  jobTitle: text("job_title"),
  phoneNumber: text("phone_number"),
  preferredLanguages: text("preferred_languages").array().default(['French', 'Italian', 'German', 'Spanish']).notNull(),
  isEmailVerified: boolean("is_email_verified").notNull().default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: timestamp("email_verification_expires"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Credit transaction history for audit trail - now linked to teams
export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  accountId: integer("account_id").references(() => accounts.id), // legacy support, nullable
  teamId: integer("team_id").references(() => teams.id), // new team-based structure
  userId: integer("user_id").references(() => users.id), // null for system transactions
  amount: integer("amount").notNull(), // positive for credits added, negative for credits used
  type: text("type").notNull(), // 'purchase', 'usage', 'refund', 'admin_adjustment'
  description: text("description").notNull(),
  translationRequestId: integer("translation_request_id").references(() => translationRequests.id), // for usage transactions
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const translationRequests = pgTable("translation_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fileName: text("file_name").notNull(),
  fileFormat: text("file_format").notNull(),
  fileSize: integer("file_size").notNull(),
  wordCount: integer("word_count").notNull(),
  characterCount: integer("character_count").notNull(), // Changed from charCount for API consistency
  imagesWithText: integer("images_with_text").notNull(),
  subjectMatter: text("subject_matter").notNull(),
  sourceLanguage: text("source_language").notNull(),
  targetLanguages: text("target_languages").array().notNull(),
  workflow: text("workflow"), // ai-neural, ai-translation-qc, ai-translation-human
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
  updateType: text("update_type").default("note"), // 'note', 'status_change', 'milestone', 'issue'
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

// Schema definitions for form validation
export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isEmailVerified: true,
  emailVerificationToken: true,
  emailVerificationExpires: true,
  passwordResetToken: true,
  passwordResetExpires: true,
  twoFactorSecret: true,
  twoFactorEnabled: true,
  lastLogin: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({
  id: true,
  createdAt: true,
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

// Authentication schemas
export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
  accountName: z.string().min(1, "Account name is required"),
  jobTitle: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  twoFactorCode: z.string().optional(),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
});

export const twoFactorSetupSchema = z.object({
  secret: z.string().min(1, "Secret is required"),
  token: z.string().length(6, "Verification code must be 6 digits"),
});

// Type definitions
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;

export type InsertTranslationRequest = z.infer<typeof insertTranslationRequestSchema>;
export type TranslationRequest = typeof translationRequests.$inferSelect;

export type InsertProjectUpdate = z.infer<typeof insertProjectUpdateSchema>;
export type ProjectUpdate = typeof projectUpdates.$inferSelect;

export type RegisterForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
export type PasswordResetRequestForm = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetForm = z.infer<typeof passwordResetSchema>;
export type TwoFactorSetupForm = z.infer<typeof twoFactorSetupSchema>;

export const fileAnalysisSchema = z.object({
  fileName: z.string(),
  fileFormat: z.string(),
  fileSize: z.number(),
  wordCount: z.number(),
  characterCount: z.number(), // Changed from charCount for API consistency
  imagesWithText: z.number(),
  subjectMatter: z.string(),
  sourceLanguage: z.string(),
});

export type FileAnalysis = z.infer<typeof fileAnalysisSchema>;

// MemoQ officially supported languages list (from https://docs.memoq.com/current/en/Concepts/concepts-supported-languages.html)
export const memoQLanguages = [
  { value: 'Afrikaans', label: 'Afrikaans', code: 'afr' },
  { value: 'Akan', label: 'Akan', code: 'aka' },
  { value: 'Albanian', label: 'Albanian', code: 'alb' },
  { value: 'Albanian (Albania)', label: 'Albanian (Albania)', code: 'alb-AL' },
  { value: 'Albanian (Kosovo)', label: 'Albanian (Kosovo)', code: 'alb-XK' },
  { value: 'Albanian (Macedonia)', label: 'Albanian (Macedonia)', code: 'alb-MK' },
  { value: 'Albanian (Montenegro)', label: 'Albanian (Montenegro)', code: 'alb-ME' },
  { value: 'Amharic', label: 'Amharic', code: 'amh', targetOnly: true },
  { value: 'Apache, Western', label: 'Apache, Western', code: 'apw' },
  { value: 'Arabic', label: 'Arabic', code: 'ara' },
  { value: 'Arabic (Algeria)', label: 'Arabic (Algeria)', code: 'ara-DZ' },
  { value: 'Arabic (Bahrain)', label: 'Arabic (Bahrain)', code: 'ara-BH' },
  { value: 'Arabic (Egypt)', label: 'Arabic (Egypt)', code: 'ara-EG' },
  { value: 'Arabic (Iraq)', label: 'Arabic (Iraq)', code: 'ara-IQ' },
  { value: 'Arabic (Jordan)', label: 'Arabic (Jordan)', code: 'ara-JO' },
  { value: 'Arabic (Kuwait)', label: 'Arabic (Kuwait)', code: 'ara-KW' },
  { value: 'Arabic (Lebanon)', label: 'Arabic (Lebanon)', code: 'ara-LB' },
  { value: 'Arabic (Libya)', label: 'Arabic (Libya)', code: 'ara-LY' },
  { value: 'Arabic (Morocco)', label: 'Arabic (Morocco)', code: 'ara-MA' },
  { value: 'Arabic (Oman)', label: 'Arabic (Oman)', code: 'ara-OM' },
  { value: 'Arabic (Qatar)', label: 'Arabic (Qatar)', code: 'ara-QA' },
  { value: 'Arabic (Saudi Arabia)', label: 'Arabic (Saudi Arabia)', code: 'ara-SA' },
  { value: 'Arabic (Syria)', label: 'Arabic (Syria)', code: 'ara-SY' },
  { value: 'Arabic (Tunisia)', label: 'Arabic (Tunisia)', code: 'ara-TN' },
  { value: 'Arabic (U.A.E.)', label: 'Arabic (U.A.E.)', code: 'ara-AE' },
  { value: 'Arabic (Yemen)', label: 'Arabic (Yemen)', code: 'ara-YE' },
  { value: 'Aragonese', label: 'Aragonese', code: 'arg' },
  { value: 'Aranese', label: 'Aranese', code: 'ocs' },
  { value: 'Armenian', label: 'Armenian', code: 'hye' },
  { value: 'Assamese', label: 'Assamese', code: 'asm' },
  { value: 'Asturian', label: 'Asturian', code: 'ast' },
  { value: 'Atikamekw', label: 'Atikamekw', code: 'atj' },
  { value: 'Azeri (Cyrillic)', label: 'Azeri (Cyrillic)', code: 'azf' },
  { value: 'Azeri (Latin)', label: 'Azeri (Latin)', code: 'aze' },
  { value: 'Babine-Witsuwit\'en', label: 'Babine-Witsuwit\'en', code: 'bcr' },
  { value: 'Bangala', label: 'Bangala', code: 'bxg' },
  { value: 'Basque', label: 'Basque', code: 'baq' },
  { value: 'Belarussian', label: 'Belarussian', code: 'bel' },
  { value: 'Bengali', label: 'Bengali', code: 'ben' },
  { value: 'Bengali (Bangladesh)', label: 'Bengali (Bangladesh)', code: 'ben-BD' },
  { value: 'Bengali (India)', label: 'Bengali (India)', code: 'ben-IN' },
  { value: 'Bislama', label: 'Bislama', code: 'bis' },
  { value: 'Blackfoot', label: 'Blackfoot', code: 'bla' },
  { value: 'Bosnian (Cyrillic)', label: 'Bosnian (Cyrillic)', code: 'boc' },
  { value: 'Bosnian (Latin)', label: 'Bosnian (Latin)', code: 'bos' },
  { value: 'Breton', label: 'Breton', code: 'bre' },
  { value: 'Bulgarian', label: 'Bulgarian', code: 'bul' },
  { value: 'Burmese', label: 'Burmese', code: 'mya', targetOnly: true },
  { value: 'Catalan', label: 'Catalan', code: 'cat' },
  { value: 'Cebuano', label: 'Cebuano', code: 'ceb' },
  { value: 'Cherokee', label: 'Cherokee', code: 'chr' },
  { value: 'Chin', label: 'Chin', code: 'ctd' },
  { value: 'Chinese (Hong Kong S.A.R.)', label: 'Chinese (Hong Kong)', code: 'zho-HK' },
  { value: 'Chinese (Macao S.A.R.)', label: 'Chinese (Macao)', code: 'zho-MO' },
  { value: 'Chinese (PRC)', label: 'Chinese (Simplified)', code: 'zho-CN' },
  { value: 'Chinese (Singapore)', label: 'Chinese (Singapore)', code: 'zho-SG' },
  { value: 'Chinese (Taiwan)', label: 'Chinese (Traditional)', code: 'zho-TW' },
  { value: 'Choctaw', label: 'Choctaw', code: 'cho' },
  { value: 'Chuukese', label: 'Chuukese', code: 'chk' },
  { value: 'Cree (Latin)', label: 'Cree (Latin)', code: 'cre' },
  { value: 'Cree, Eastern (Syllabics)', label: 'Cree, Eastern (Syllabics)', code: 'crk' },
  { value: 'Cree, Western (Syllabics)', label: 'Cree, Western (Syllabics)', code: 'crl' },
  { value: 'Croatian', label: 'Croatian', code: 'hrv' },
  { value: 'Czech', label: 'Czech', code: 'cze' },
  { value: 'Danish', label: 'Danish', code: 'dan' },
  { value: 'Dari', label: 'Dari', code: 'prs' },
  { value: 'Dene', label: 'Dene', code: 'chp' },
  { value: 'Dinka', label: 'Dinka', code: 'din' },
  { value: 'Dogrib', label: 'Dogrib', code: 'dgr' },
  { value: 'Dutch', label: 'Dutch', code: 'dut' },
  { value: 'Dutch (Belgium)', label: 'Dutch (Belgium)', code: 'dut-BE' },
  { value: 'Dutch (Netherlands)', label: 'Dutch (Netherlands)', code: 'dut-NL' },
  { value: 'English', label: 'English', code: 'eng' },
  { value: 'English (Australia)', label: 'English (Australia)', code: 'eng-AU' },
  { value: 'English (Belize)', label: 'English (Belize)', code: 'eng-BZ' },
  { value: 'English (Canada)', label: 'English (Canada)', code: 'eng-CA' },
  { value: 'English (Caribbean)', label: 'English (Caribbean)', code: 'eng-CB' },
  { value: 'English (Ireland)', label: 'English (Ireland)', code: 'eng-IE' },
  { value: 'English (Jamaica)', label: 'English (Jamaica)', code: 'eng-JM' },
  { value: 'English (New Zealand)', label: 'English (New Zealand)', code: 'eng-NZ' },
  { value: 'English (Republic of the Philippines)', label: 'English (Philippines)', code: 'eng-PH' },
  { value: 'English (South Africa)', label: 'English (South Africa)', code: 'eng-ZA' },
  { value: 'English (Trinidad and Tobago)', label: 'English (Trinidad and Tobago)', code: 'eng-TT' },
  { value: 'English (United Kingdom)', label: 'English (UK)', code: 'eng-GB' },
  { value: 'English (United States)', label: 'English (US)', code: 'eng-US' },
  { value: 'English (Zimbabwe)', label: 'English (Zimbabwe)', code: 'eng-ZW' },
  { value: 'Esperanto', label: 'Esperanto', code: 'epo' },
  { value: 'Estonian', label: 'Estonian', code: 'est' },
  { value: 'Fanti', label: 'Fanti', code: 'fat' },
  { value: 'Farsi', label: 'Farsi', code: 'fas' },
  { value: 'Fijian', label: 'Fijian', code: 'fij' },
  { value: 'Filipino', label: 'Filipino', code: 'fil' },
  { value: 'Finnish', label: 'Finnish', code: 'fin' },
  { value: 'Flemish', label: 'Flemish', code: 'vls' },
  { value: 'French', label: 'French', code: 'fre' },
  { value: 'French (Africa)', label: 'French (Africa)', code: 'fre-02' },
  { value: 'French (Belgium)', label: 'French (Belgium)', code: 'fre-BE' },
  { value: 'French (Canada)', label: 'French (Canada)', code: 'fre-CA' },
  { value: 'French (France)', label: 'French (France)', code: 'fre-FR' },
  { value: 'French (Luxembourg)', label: 'French (Luxembourg)', code: 'fre-LU' },
  { value: 'French (Monaco)', label: 'French (Monaco)', code: 'fre-MC' },
  { value: 'French (Morocco)', label: 'French (Morocco)', code: 'fre-MA' },
  { value: 'French (Switzerland)', label: 'French (Switzerland)', code: 'fre-CH' },
  { value: 'Frisian, Western', label: 'Frisian, Western', code: 'fry' },
  { value: 'Fulah', label: 'Fulah', code: 'ful' },
  { value: 'Gaelic (Scotland)', label: 'Gaelic (Scotland)', code: 'gla' },
  { value: 'Galician', label: 'Galician', code: 'glg' },
  { value: 'Georgian', label: 'Georgian', code: 'kat' },
  { value: 'German', label: 'German', code: 'ger' },
  { value: 'German (Austria)', label: 'German (Austria)', code: 'ger-AT' },
  { value: 'German (Germany)', label: 'German (Germany)', code: 'ger-DE' },
  { value: 'German (Liechtenstein)', label: 'German (Liechtenstein)', code: 'ger-LI' },
  { value: 'German (Luxembourg)', label: 'German (Luxembourg)', code: 'ger-LU' },
  { value: 'German (Switzerland)', label: 'German (Switzerland)', code: 'ger-CH' },
  { value: 'Greek', label: 'Greek', code: 'gre' },
  { value: 'Greenlandic', label: 'Greenlandic', code: 'kal' },
  { value: 'Guaraní', label: 'Guaraní', code: 'grn' },
  { value: 'Gujarati', label: 'Gujarati', code: 'guj' },
  { value: 'Haitian Creole', label: 'Haitian Creole', code: 'hat' },
  { value: 'Hausa', label: 'Hausa', code: 'hau' },
  { value: 'Hawaiian', label: 'Hawaiian', code: 'haw' },
  { value: 'Hazaragi', label: 'Hazaragi', code: 'haz' },
  { value: 'Hebrew', label: 'Hebrew', code: 'heb' },
  { value: 'Hiligaynon', label: 'Hiligaynon', code: 'hil' },
  { value: 'Hindi', label: 'Hindi', code: 'hin' },
  { value: 'Hmong', label: 'Hmong', code: 'hmn' },
  { value: 'Hopi', label: 'Hopi', code: 'hop' },
  { value: 'Hungarian', label: 'Hungarian', code: 'hun' },
  { value: 'Icelandic', label: 'Icelandic', code: 'ice' },
  { value: 'Igbo', label: 'Igbo', code: 'ibo' },
  { value: 'Ilocano', label: 'Ilocano', code: 'ilo' },
  { value: 'Indonesian', label: 'Indonesian', code: 'ind' },
  { value: 'Innu', label: 'Innu', code: 'moe' },
  { value: 'Inuktitut, Eastern (Latin)', label: 'Inuktitut, Eastern (Latin)', code: 'ike' },
  { value: 'Inuktitut, Eastern (Syllabics)', label: 'Inuktitut, Eastern (Syllabics)', code: 'ikf' },
  { value: 'Inuktitut, Western (Latin)', label: 'Inuktitut, Western (Latin)', code: 'ikt' },
  { value: 'Inuktitut, Western (Syllabics)', label: 'Inuktitut, Western (Syllabics)', code: 'ikg' },
  { value: 'Irish', label: 'Irish', code: 'gle' },
  { value: 'Italian', label: 'Italian', code: 'ita' },
  { value: 'Italian (Italy)', label: 'Italian (Italy)', code: 'ita-IT' },
  { value: 'Italian (Switzerland)', label: 'Italian (Switzerland)', code: 'ita-CH' },
  { value: 'Japanese', label: 'Japanese', code: 'jpn' },
  { value: 'Javanese', label: 'Javanese', code: 'jav' },
  { value: 'Kabuverdianu', label: 'Kabuverdianu', code: 'kea' },
  { value: 'Kannada', label: 'Kannada', code: 'kan' },
  { value: 'Karen', label: 'Karen', code: 'ksw', targetOnly: true },
  { value: 'Kashmiri', label: 'Kashmiri', code: 'kas' },
  { value: 'Kayah (Latin)', label: 'Kayah (Latin)', code: 'kyu' },
  { value: 'Kayah (Myanmar)', label: 'Kayah (Myanmar)', code: 'eky', targetOnly: true },
  { value: 'Kazakh', label: 'Kazakh', code: 'kaz' },
  { value: 'Khmer', label: 'Khmer', code: 'khm', targetOnly: true },
  { value: 'Kiribati', label: 'Kiribati', code: 'gil' },
  { value: 'Klingon', label: 'Klingon', code: 'qqq' },
  { value: 'Korean', label: 'Korean', code: 'kor' },
  { value: 'Kurdish (Arabic)', label: 'Kurdish (Arabic)', code: 'ckb' },
  { value: 'Kurdish (Cyrillic)', label: 'Kurdish (Cyrillic)', code: 'kmr' },
  { value: 'Kurdish (Latin)', label: 'Kurdish (Latin)', code: 'kur' },
  { value: 'Kyrgyz (Cyrillic)', label: 'Kyrgyz (Cyrillic)', code: 'kir' },
  { value: 'Lakota', label: 'Lakota', code: 'lkt' },
  { value: 'Lao', label: 'Lao', code: 'lao', targetOnly: true },
  { value: 'Latin', label: 'Latin', code: 'lat' },
  { value: 'Latvian', label: 'Latvian', code: 'lav' },
  { value: 'Lingala', label: 'Lingala', code: 'lin' },
  { value: 'Lithuanian', label: 'Lithuanian', code: 'lit' },
  { value: 'Luxembourgish', label: 'Luxembourgish', code: 'ltz' },
  { value: 'Maay', label: 'Maay', code: 'ymm' },
  { value: 'Macedonian', label: 'Macedonian', code: 'mac' },
  { value: 'Malagasy', label: 'Malagasy', code: 'mlg' },
  { value: 'Malay', label: 'Malay', code: 'msa' },
  { value: 'Malayalam', label: 'Malayalam', code: 'mal' },
  { value: 'Maltese', label: 'Maltese', code: 'mlt' },
  { value: 'Mandinka (Arabic)', label: 'Mandinka (Arabic)', code: 'mno' },
  { value: 'Mandinka (Latin)', label: 'Mandinka (Latin)', code: 'mnk' },
  { value: 'Maori', label: 'Maori', code: 'mri' },
  { value: 'Marathi', label: 'Marathi', code: 'mar' },
  { value: 'Marshallese', label: 'Marshallese', code: 'mah' },
  { value: 'Meänkieli', label: 'Meänkieli', code: 'fit' },
  { value: 'Mi\'kmaq', label: 'Mi\'kmaq', code: 'mic' },
  { value: 'Michif', label: 'Michif', code: 'crg' },
  { value: 'Mohawk', label: 'Mohawk', code: 'moh' },
  { value: 'Moldavian', label: 'Moldavian', code: 'mol' },
  { value: 'Mon', label: 'Mon', code: 'mnw', targetOnly: true },
  { value: 'Mongolian (Cyrillic)', label: 'Mongolian (Cyrillic)', code: 'khk' },
  { value: 'Montenegrin (Cyrillic)', label: 'Montenegrin (Cyrillic)', code: 'cgy' },
  { value: 'Montenegrin (Latin)', label: 'Montenegrin (Latin)', code: 'cgl' },
  { value: 'Nauruan', label: 'Nauruan', code: 'nau' },
  { value: 'Navajo', label: 'Navajo', code: 'nav' },
  { value: 'Nepali', label: 'Nepali', code: 'nep' },
  { value: 'Norwegian', label: 'Norwegian', code: 'nor' },
  { value: 'Norwegian (Bokmål)', label: 'Norwegian (Bokmål)', code: 'nnb' },
  { value: 'Norwegian (Nynorsk)', label: 'Norwegian (Nynorsk)', code: 'nno' },
  { value: 'Occitan', label: 'Occitan', code: 'oci' },
  { value: 'Ojibwa (Latin)', label: 'Ojibwa (Latin)', code: 'oji' },
  { value: 'Ojibwa (Syllabics)', label: 'Ojibwa (Syllabics)', code: 'ojg' },
  { value: 'Oriya', label: 'Oriya', code: 'ori' },
  { value: 'Oromo', label: 'Oromo', code: 'orm' },
  { value: 'Pashto', label: 'Pashto', code: 'pbu' },
  { value: 'Pennsylvania German', label: 'Pennsylvania German', code: 'pdc' },
  { value: 'Plautdietsch', label: 'Plautdietsch', code: 'pdt' },
  { value: 'Pijin', label: 'Pijin', code: 'pis' },
  { value: 'Pohnpeian', label: 'Pohnpeian', code: 'pon' },
  { value: 'Polish', label: 'Polish', code: 'pol' },
  { value: 'Portuguese', label: 'Portuguese', code: 'por' },
  { value: 'Portuguese (Brazil)', label: 'Portuguese (Brazil)', code: 'por-BR' },
  { value: 'Portuguese (Portugal)', label: 'Portuguese (Portugal)', code: 'por-PT' },
  { value: 'Punjabi (Gurmukhi)', label: 'Punjabi (Gurmukhi)', code: 'pan' },
  { value: 'Punjabi (Shahmukhi)', label: 'Punjabi (Shahmukhi)', code: 'pnb' },
  { value: 'Quechua', label: 'Quechua', code: 'quz' },
  { value: 'Rakhine', label: 'Rakhine', code: 'rki', targetOnly: true },
  { value: 'Rohingya', label: 'Rohingya', code: 'rhg' },
  { value: 'Romanian', label: 'Romanian', code: 'rum' },
  { value: 'Rundi', label: 'Rundi', code: 'run' },
  { value: 'Russian', label: 'Russian', code: 'rus' },
  { value: 'Rwanda', label: 'Rwanda', code: 'kin' },
  { value: 'Samoan', label: 'Samoan', code: 'smo' },
  { value: 'Sanskrit', label: 'Sanskrit', code: 'san' },
  { value: 'Serbian (Cyrillic)', label: 'Serbian (Cyrillic)', code: 'scc' },
  { value: 'Serbian (Latin)', label: 'Serbian (Latin)', code: 'scr' },
  { value: 'Sesotho', label: 'Sesotho', code: 'sot' },
  { value: 'Shan', label: 'Shan', code: 'shn', targetOnly: true },
  { value: 'Sinhala', label: 'Sinhala', code: 'sin' },
  { value: 'Slovak', label: 'Slovak', code: 'slo' },
  { value: 'Slovenian', label: 'Slovenian', code: 'slv' },
  { value: 'Somali', label: 'Somali', code: 'som' },
  { value: 'Somali (Djibouti)', label: 'Somali (Djibouti)', code: 'som-DJ' },
  { value: 'Somali (Ethiopia)', label: 'Somali (Ethiopia)', code: 'som-ET' },
  { value: 'Somali (Kenya)', label: 'Somali (Kenya)', code: 'som-KE' },
  { value: 'Somali (Somalia)', label: 'Somali (Somalia)', code: 'som-SO' },
  { value: 'Spanish', label: 'Spanish', code: 'spa' },
  { value: 'Spanish (Argentina)', label: 'Spanish (Argentina)', code: 'spa-AR' },
  { value: 'Spanish (Bolivia)', label: 'Spanish (Bolivia)', code: 'spa-BO' },
  { value: 'Spanish (Chile)', label: 'Spanish (Chile)', code: 'spa-CL' },
  { value: 'Spanish (Colombia)', label: 'Spanish (Colombia)', code: 'spa-CO' },
  { value: 'Spanish (Costa Rica)', label: 'Spanish (Costa Rica)', code: 'spa-CR' },
  { value: 'Spanish (Dominican Republic)', label: 'Spanish (Dominican Republic)', code: 'spa-DO' },
  { value: 'Spanish (Ecuador)', label: 'Spanish (Ecuador)', code: 'spa-EC' },
  { value: 'Spanish (El Salvador)', label: 'Spanish (El Salvador)', code: 'spa-SV' },
  { value: 'Spanish (Guatemala)', label: 'Spanish (Guatemala)', code: 'spa-GT' },
  { value: 'Spanish (Honduras)', label: 'Spanish (Honduras)', code: 'spa-HN' },
  { value: 'Spanish (Latin America)', label: 'Spanish (Latin America)', code: 'spa-M9' },
  { value: 'Spanish (Mexico)', label: 'Spanish (Mexico)', code: 'spa-MX' },
  { value: 'Spanish (Nicaragua)', label: 'Spanish (Nicaragua)', code: 'spa-NI' },
  { value: 'Spanish (Panama)', label: 'Spanish (Panama)', code: 'spa-PA' },
  { value: 'Spanish (Paraguay)', label: 'Spanish (Paraguay)', code: 'spa-PY' },
  { value: 'Spanish (Peru)', label: 'Spanish (Peru)', code: 'spa-PE' },
  { value: 'Spanish (Puerto Rico)', label: 'Spanish (Puerto Rico)', code: 'spa-PR' },
  { value: 'Spanish (Spain)', label: 'Spanish (Spain)', code: 'spa-ES' },
  { value: 'Spanish (United States)', label: 'Spanish (United States)', code: 'spa-US' },
  { value: 'Spanish (Uruguay)', label: 'Spanish (Uruguay)', code: 'spa-UY' },
  { value: 'Spanish (Venezuela)', label: 'Spanish (Venezuela)', code: 'spa-VE' },
  { value: 'Stoney', label: 'Stoney', code: 'sto' },
  { value: 'Sudanese Creole Arabic', label: 'Sudanese Creole Arabic', code: 'pga' },
  { value: 'Sundanese', label: 'Sundanese', code: 'sun' },
  { value: 'Swahili', label: 'Swahili', code: 'swa' },
  { value: 'Swedish', label: 'Swedish', code: 'swe' },
  { value: 'Swedish (Finland)', label: 'Swedish (Finland)', code: 'swe-FI' },
  { value: 'Swedish (Sweden)', label: 'Swedish (Sweden)', code: 'swe-SE' },
  { value: 'Tagalog', label: 'Tagalog', code: 'tgl' },
  { value: 'Tajiki (Cyrillic)', label: 'Tajiki (Cyrillic)', code: 'tgk' },
  { value: 'Tamazight', label: 'Tamazight', code: 'tzm' },
  { value: 'Tamil', label: 'Tamil', code: 'tam' },
  { value: 'Tatar', label: 'Tatar', code: 'tat' },
  { value: 'Telugu', label: 'Telugu', code: 'tel' },
  { value: 'Tetun Dili', label: 'Tetun Dili', code: 'tdt' },
  { value: 'Thai', label: 'Thai', code: 'tha' },
  { value: 'Tigrigna', label: 'Tigrigna', code: 'tir', targetOnly: true },
  { value: 'Tok Pisin', label: 'Tok Pisin', code: 'tpi' },
  { value: 'Tongan', label: 'Tongan', code: 'ton' },
  { value: 'Torres Strait Creole', label: 'Torres Strait Creole', code: 'tcs' },
  { value: 'Tswana', label: 'Tswana', code: 'tsn' },
  { value: 'Turkish', label: 'Turkish', code: 'tur' },
  { value: 'Turkmen (Latin)', label: 'Turkmen (Latin)', code: 'tuk' },
  { value: 'Tuvaluan', label: 'Tuvaluan', code: 'tvl' },
  { value: 'Ukrainian', label: 'Ukrainian', code: 'ukr' },
  { value: 'Urdu', label: 'Urdu', code: 'urd' },
  { value: 'Uzbek (Cyrillic)', label: 'Uzbek (Cyrillic)', code: 'uzc' },
  { value: 'Uzbek (Latin)', label: 'Uzbek (Latin)', code: 'uzb' },
  { value: 'Valencian', label: 'Valencian', code: 'val' },
  { value: 'Vietnamese', label: 'Vietnamese', code: 'vie' },
  { value: 'Walloon', label: 'Walloon', code: 'wln' },
  { value: 'Welsh', label: 'Welsh', code: 'wel' },
  { value: 'Wolof', label: 'Wolof', code: 'wol' },
  { value: 'Xhosa', label: 'Xhosa', code: 'xho' },
  { value: 'Yoruba', label: 'Yoruba', code: 'yor' },
  { value: 'Yup\'ik', label: 'Yup\'ik', code: 'esu' },
  { value: 'Zulu', label: 'Zulu', code: 'zul' },
];

export const userLanguagePreferencesSchema = z.object({
  preferredLanguages: z.array(z.string()).default(['French', 'Italian', 'German', 'Spanish']),
});

export type UserLanguagePreferences = z.infer<typeof userLanguagePreferencesSchema>;
