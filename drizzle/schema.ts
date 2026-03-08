import { boolean, index, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, varchar, bigint, serial } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const stepStatusEnum = pgEnum("step_status", ["pending", "complete", "skipped"]);
export const jobStatusEnum = pgEnum("job_status", ["queued", "processing", "complete", "error"]);
export const errorTypeEnum = pgEnum("error_type", ["format_unsupported", "parse_empty", "pipeline_error", "unknown"]);

/**
 * Core user table backing auth flow.
 */
export const planEnum = pgEnum("plan", ["starter", "author_pro", "publisher"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  plan: planEnum("plan").default("starter").notNull(),
  isAdmin: boolean("isAdmin").default(false).notNull(),
  emailConfirmed: boolean("emailConfirmed").default(false).notNull(),
  emailConfirmToken: varchar("emailConfirmToken", { length: 128 }),
  emailConfirmTokenExpiresAt: timestamp("emailConfirmTokenExpiresAt"),
  termsAcceptedAt: timestamp("termsAcceptedAt"),
  checkoutToken: varchar("checkoutToken", { length: 128 }),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }).unique(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

/**
 * A book project — each user can have multiple book projects.
 * productionDeadline is stored as a bigint (Unix timestamp ms) for timezone-safe handling.
 */
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }),
  genre: varchar("genre", { length: 128 }),
  bibleEditionType: varchar("bibleEditionType", { length: 64 }),
  bibleTranslation: varchar("bibleTranslation", { length: 32 }),
  notes: text("notes"),
  productionDeadline: bigint("productionDeadline", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Tracks the status of each step within a project.
 * startDate and targetDate are stored as bigint (Unix timestamp ms).
 */
export const stepStatuses = pgTable("step_statuses", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  stepId: varchar("stepId", { length: 64 }).notNull(),
  status: stepStatusEnum("status").default("pending").notNull(),
  notes: text("notes"),
  startDate: bigint("startDate", { mode: "number" }),
  targetDate: bigint("targetDate", { mode: "number" }),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type StepStatus = typeof stepStatuses.$inferSelect;
export type InsertStepStatus = typeof stepStatuses.$inferInsert;

/**
 * Files uploaded to a specific input slot within a step.
 */
export const uploadedFiles = pgTable("uploaded_files", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  stepId: varchar("stepId", { length: 64 }).notNull(),
  inputName: varchar("inputName", { length: 255 }).notNull(),
  fileName: varchar("fileName", { length: 512 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  mimeType: varchar("mimeType", { length: 128 }),
  fileSize: bigint("fileSize", { mode: "number" }),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type UploadedFile = typeof uploadedFiles.$inferSelect;
export type InsertUploadedFile = typeof uploadedFiles.$inferInsert;

/**
 * Due dates per phase within a project.
 */
export const phaseDueDates = pgTable("phase_due_dates", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  phaseId: varchar("phaseId", { length: 64 }).notNull(),
  dueDate: bigint("dueDate", { mode: "number" }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PhaseDueDate = typeof phaseDueDates.$inferSelect;
export type InsertPhaseDueDate = typeof phaseDueDates.$inferInsert;

/**
 * Auto-Produce jobs — tracks each AI typesetting run for a project.
 */
export const productionJobs = pgTable("production_jobs", {
  id: serial("id").primaryKey(),
  projectId: integer("projectId").notNull(),
  status: jobStatusEnum("status").default("queued").notNull(),
  trimSizeId: varchar("trimSizeId", { length: 32 }).notNull(),
  styleId: varchar("styleId", { length: 64 }).notNull(),
  manuscriptFileName: varchar("manuscriptFileName", { length: 512 }),
  manuscriptFileKey: varchar("manuscriptFileKey", { length: 512 }),
  wordCount: integer("wordCount"),
  chapterCount: integer("chapterCount"),
  pdfUrl: text("pdfUrl"),
  epubUrl: text("epubUrl"),
  pdfKey: varchar("pdfKey", { length: 512 }),
  epubKey: varchar("epubKey", { length: 512 }),
  kdpPdfUrl: text("kdpPdfUrl"),
  kdpPdfKey: varchar("kdpPdfKey", { length: 512 }),
  idmlUrl: text("idmlUrl"),
  idmlKey: varchar("idmlKey", { length: 512 }),
  errorMessage: text("errorMessage"),
  errorType: errorTypeEnum("errorType").default("unknown"),
  failedStage: varchar("failedStage", { length: 64 }),
  retryCount: integer("retryCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProductionJob = typeof productionJobs.$inferSelect;
export type InsertProductionJob = typeof productionJobs.$inferInsert;

/**
 * Contact form submissions sent from the public footer form.
 */
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  notified: integer("notified").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = typeof contactSubmissions.$inferInsert;

export const wizardSessions = pgTable("wizard_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  answers: jsonb("answers").notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WizardSession = typeof wizardSessions.$inferSelect;
export type InsertWizardSession = typeof wizardSessions.$inferInsert;

export const affiliateStatusEnum = pgEnum("affiliate_status", ["pending", "approved", "suspended"]);
export const conversionStatusEnum = pgEnum("conversion_status", ["pending", "approved", "paid"]);
export const payoutStatusEnum = pgEnum("payout_status", ["pending", "processing", "completed", "failed"]);

export const affiliates = pgTable("affiliates", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  affiliateCode: varchar("affiliateCode", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  website: varchar("website", { length: 500 }),
  paypalEmail: varchar("paypalEmail", { length: 320 }),
  promotionMethod: text("promotionMethod"),
  commissionRate: integer("commissionRate").default(20).notNull(),
  status: affiliateStatusEnum("status").default("pending").notNull(),
  totalClicks: integer("totalClicks").default(0).notNull(),
  totalConversions: integer("totalConversions").default(0).notNull(),
  totalEarnings: numeric("totalEarnings", { precision: 10, scale: 2 }).default("0.00").notNull(),
  pendingEarnings: numeric("pendingEarnings", { precision: 10, scale: 2 }).default("0.00").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

export const affiliateClicks = pgTable("affiliate_clicks", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  ipHash: varchar("ipHash", { length: 64 }),
  userAgent: varchar("userAgent", { length: 500 }),
  referrerUrl: varchar("referrerUrl", { length: 1000 }),
  landingPage: varchar("landingPage", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AffiliateClick = typeof affiliateClicks.$inferSelect;
export type InsertAffiliateClick = typeof affiliateClicks.$inferInsert;

export const affiliateConversions = pgTable("affiliate_conversions", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  customerEmail: varchar("customerEmail", { length: 320 }),
  planName: varchar("planName", { length: 64 }).notNull(),
  billingCycle: varchar("billingCycle", { length: 32 }),
  saleAmount: numeric("saleAmount", { precision: 10, scale: 2 }).notNull(),
  commissionAmount: numeric("commissionAmount", { precision: 10, scale: 2 }).notNull(),
  commissionRate: integer("commissionRate").notNull(),
  status: conversionStatusEnum("status").default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AffiliateConversion = typeof affiliateConversions.$inferSelect;
export type InsertAffiliateConversion = typeof affiliateConversions.$inferInsert;

export const affiliatePayouts = pgTable("affiliate_payouts", {
  id: serial("id").primaryKey(),
  affiliateId: integer("affiliateId").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paypalEmail: varchar("paypalEmail", { length: 320 }).notNull(),
  conversionIds: jsonb("conversionIds"),
  status: payoutStatusEnum("status").default("pending").notNull(),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AffiliatePayout = typeof affiliatePayouts.$inferSelect;
export type InsertAffiliatePayout = typeof affiliatePayouts.$inferInsert;
