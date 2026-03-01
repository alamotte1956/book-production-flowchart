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
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }),
  genre: varchar("genre", { length: 128 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Tracks the status of each step within a project.
 * stepId matches the step.id from the flowchart data (e.g., "idea", "writing", "self-edit").
 * status: pending (not started), complete (done), skipped (user chose to skip).
 */
export const stepStatuses = mysqlTable("step_statuses", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  stepId: varchar("stepId", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["pending", "complete", "skipped"]).default("pending").notNull(),
  notes: text("notes"),
  completedAt: timestamp("completedAt"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StepStatus = typeof stepStatuses.$inferSelect;
export type InsertStepStatus = typeof stepStatuses.$inferInsert;

/**
 * Files uploaded to a specific input slot within a step.
 * inputName identifies which input within the step (e.g., "Market Research", "Query Letter").
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
