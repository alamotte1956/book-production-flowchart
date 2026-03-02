import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * A book project — each user can have multiple book projects.
 * productionDeadline is stored as a bigint (Unix timestamp ms) for timezone-safe handling.
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }),
  genre: varchar("genre", { length: 128 }),
  notes: text("notes"),
  productionDeadline: bigint("productionDeadline", { mode: "number" }), // Unix timestamp ms
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Tracks the status of each step within a project.
 * startDate and targetDate are stored as bigint (Unix timestamp ms).
 */
export const stepStatuses = mysqlTable("step_statuses", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  stepId: varchar("stepId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["pending", "complete", "skipped"]).default("pending").notNull(),
  notes: text("notes"),
  startDate: bigint("startDate", { mode: "number" }),    // Unix timestamp ms
  targetDate: bigint("targetDate", { mode: "number" }),  // Unix timestamp ms
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StepStatus = typeof stepStatuses.$inferSelect;
export type InsertStepStatus = typeof stepStatuses.$inferInsert;

/**
 * Files uploaded to a specific input slot within a step.
 */
export const uploadedFiles = mysqlTable("uploaded_files", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
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
 * phaseId matches the phase.id from the flowchart data (e.g., "concept", "acquisitions").
 * dueDate is stored as a bigint (Unix timestamp ms) for timezone-safe handling.
 */
export const phaseDueDates = mysqlTable("phase_due_dates", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  phaseId: varchar("phaseId", { length: 64 }).notNull(),
  dueDate: bigint("dueDate", { mode: "number" }).notNull(), // Unix timestamp ms
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PhaseDueDate = typeof phaseDueDates.$inferSelect;
export type InsertPhaseDueDate = typeof phaseDueDates.$inferInsert;

/**
 * Auto-Produce jobs — tracks each AI typesetting run for a project.
 * Stores the output PDF and EPUB S3 URLs once complete.
 */
export const productionJobs = mysqlTable("production_jobs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  status: mysqlEnum("status", ["queued", "processing", "complete", "error"]).default("queued").notNull(),
  trimSizeId: varchar("trimSizeId", { length: 32 }).notNull(),
  styleId: varchar("styleId", { length: 64 }).notNull(),
  manuscriptFileName: varchar("manuscriptFileName", { length: 512 }),
  manuscriptFileKey: varchar("manuscriptFileKey", { length: 512 }),
  wordCount: int("wordCount"),
  chapterCount: int("chapterCount"),
  pdfUrl: text("pdfUrl"),
  epubUrl: text("epubUrl"),
  pdfKey: varchar("pdfKey", { length: 512 }),
  epubKey: varchar("epubKey", { length: 512 }),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProductionJob = typeof productionJobs.$inferSelect;
export type InsertProductionJob = typeof productionJobs.$inferInsert;
