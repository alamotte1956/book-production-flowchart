import { index, integer, jsonb, pgEnum, pgTable, text, timestamp, varchar, bigint, serial } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const stepStatusEnum = pgEnum("step_status", ["pending", "complete", "skipped"]);
export const jobStatusEnum = pgEnum("job_status", ["queued", "processing", "complete", "error"]);
export const errorTypeEnum = pgEnum("error_type", ["format_unsupported", "parse_empty", "pipeline_error", "unknown"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
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
