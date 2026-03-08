import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import {
  InsertUser, users,
  projects, InsertProject, Project,
  stepStatuses, InsertStepStatus, StepStatus,
  uploadedFiles, InsertUploadedFile, UploadedFile,
  phaseDueDates, InsertPhaseDueDate, PhaseDueDate,
  productionJobs, InsertProductionJob, ProductionJob,
  contactSubmissions, InsertContactSubmission, ContactSubmission,
  wizardSessions, InsertWizardSession, WizardSession,
} from "../drizzle/schema";


let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Project helpers ────────────────────────────────────────────

export async function createProject(data: Omit<InsertProject, "id" | "createdAt" | "updatedAt">): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [project] = await db.insert(projects).values(data).returning();
  return project;
}

export async function getProjectsByUser(userId: number): Promise<Project[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(projects).where(eq(projects.userId, userId));
}

export async function getProjectById(projectId: number): Promise<Project | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return project;
}

export async function deleteProject(projectId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(uploadedFiles).where(eq(uploadedFiles.projectId, projectId));
  await db.delete(stepStatuses).where(eq(stepStatuses.projectId, projectId));
  await db.delete(projects).where(eq(projects.id, projectId));
}

// ─── Step status helpers ────────────────────────────────────────

export async function getStepStatusesByProject(projectId: number): Promise<StepStatus[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(stepStatuses).where(eq(stepStatuses.projectId, projectId));
}

export async function upsertStepStatus(
  projectId: number,
  stepId: string,
  status: "pending" | "complete" | "skipped",
  notes?: string
): Promise<StepStatus> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(stepStatuses)
    .where(and(eq(stepStatuses.projectId, projectId), eq(stepStatuses.stepId, stepId)))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db.update(stepStatuses)
      .set({
        status,
        notes: notes ?? existing[0].notes,
        completedAt: status === "complete" ? new Date() : null,
      })
      .where(eq(stepStatuses.id, existing[0].id))
      .returning();
    return updated;
  } else {
    const [created] = await db.insert(stepStatuses).values({
      projectId,
      stepId,
      status,
      notes,
      completedAt: status === "complete" ? new Date() : null,
    }).returning();
    return created;
  }
}

// ─── File upload helpers ────────────────────────────────────────

export async function getFilesByProject(projectId: number): Promise<UploadedFile[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(uploadedFiles).where(eq(uploadedFiles.projectId, projectId));
}

export async function getFilesByStepInput(
  projectId: number,
  stepId: string,
  inputName: string
): Promise<UploadedFile[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(uploadedFiles)
    .where(and(
      eq(uploadedFiles.projectId, projectId),
      eq(uploadedFiles.stepId, stepId),
      eq(uploadedFiles.inputName, inputName),
    ));
}

export async function createUploadedFile(data: Omit<InsertUploadedFile, "id" | "uploadedAt">): Promise<UploadedFile> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [file] = await db.insert(uploadedFiles).values(data).returning();
  return file;
}

export async function deleteUploadedFile(fileId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(uploadedFiles).where(eq(uploadedFiles.id, fileId));
}

// ─── Step date helpers ────────────────────────────────────────

export async function upsertStepDates(
  projectId: number,
  stepId: string,
  startDate?: number | null,
  targetDate?: number | null
): Promise<StepStatus> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(stepStatuses)
    .where(and(eq(stepStatuses.projectId, projectId), eq(stepStatuses.stepId, stepId)))
    .limit(1);

  if (existing.length > 0) {
    const updateSet: Record<string, unknown> = {};
    if (startDate !== undefined) updateSet.startDate = startDate;
    if (targetDate !== undefined) updateSet.targetDate = targetDate;
    const [updated] = await db.update(stepStatuses).set(updateSet).where(eq(stepStatuses.id, existing[0].id)).returning();
    return updated;
  } else {
    const [created] = await db.insert(stepStatuses).values({
      projectId,
      stepId,
      status: "pending",
      startDate: startDate ?? null,
      targetDate: targetDate ?? null,
    }).returning();
    return created;
  }
}

export async function updateProjectDeadline(
  projectId: number,
  productionDeadline: number | null
): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [updated] = await db.update(projects).set({ productionDeadline }).where(eq(projects.id, projectId)).returning();
  return updated;
}

export async function updateProjectGenre(
  projectId: number,
  genre: string | null
): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [updated] = await db.update(projects).set({ genre }).where(eq(projects.id, projectId)).returning();
  return updated;
}

export async function updateProjectMeta(
  projectId: number,
  fields: { title?: string; author?: string | null }
): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const set: Partial<{ title: string; author: string | null }> = {};
  if (fields.title !== undefined) set.title = fields.title;
  if (fields.author !== undefined) set.author = fields.author;
  const [updated] = await db.update(projects).set(set).where(eq(projects.id, projectId)).returning();
  return updated;
}

export async function updateProjectBibleSpecs(
  projectId: number,
  fields: { bibleEditionType?: string | null; bibleTranslation?: string | null }
): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const set: Partial<{ bibleEditionType: string | null; bibleTranslation: string | null }> = {};
  if (fields.bibleEditionType !== undefined) set.bibleEditionType = fields.bibleEditionType;
  if (fields.bibleTranslation !== undefined) set.bibleTranslation = fields.bibleTranslation;
  const [updated] = await db.update(projects).set(set).where(eq(projects.id, projectId)).returning();
  return updated;
}

// ─── Phase due date helpers ────────────────────────────────────

export async function getDueDatesByProject(projectId: number): Promise<PhaseDueDate[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(phaseDueDates).where(eq(phaseDueDates.projectId, projectId));
}

export async function upsertPhaseDueDate(
  projectId: number,
  phaseId: string,
  dueDate: number
): Promise<PhaseDueDate> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(phaseDueDates)
    .where(and(eq(phaseDueDates.projectId, projectId), eq(phaseDueDates.phaseId, phaseId)))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db.update(phaseDueDates)
      .set({ dueDate })
      .where(eq(phaseDueDates.id, existing[0].id))
      .returning();
    return updated;
  } else {
    const [created] = await db.insert(phaseDueDates).values({ projectId, phaseId, dueDate }).returning();
    return created;
  }
}

export async function deletePhaseDueDate(projectId: number, phaseId: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(phaseDueDates).where(
    and(eq(phaseDueDates.projectId, projectId), eq(phaseDueDates.phaseId, phaseId))
  );
}

// ─── Production Job helpers ────────────────────────────────────

export async function createProductionJob(
  data: Omit<InsertProductionJob, "id" | "createdAt" | "updatedAt">
): Promise<ProductionJob> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [job] = await db.insert(productionJobs).values(data).returning();
  return job;
}

export async function getProductionJobsByProject(projectId: number): Promise<ProductionJob[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.select().from(productionJobs).where(eq(productionJobs.projectId, projectId));
}

export async function getProductionJobById(jobId: number): Promise<ProductionJob | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [job] = await db.select().from(productionJobs).where(eq(productionJobs.id, jobId)).limit(1);
  return job;
}

export async function updateProductionJob(
  jobId: number,
  data: Partial<Omit<InsertProductionJob, "id" | "createdAt" | "projectId">>
): Promise<ProductionJob> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [updated] = await db.update(productionJobs).set(data).where(eq(productionJobs.id, jobId)).returning();
  return updated;
}

// ─── Contact Submissions ──────────────────────────────────────────────────────

export async function createContactSubmission(
  data: Omit<InsertContactSubmission, "id" | "createdAt">
): Promise<ContactSubmission> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [submission] = await db.insert(contactSubmissions).values(data).returning();
  return submission;
}

// ─── Wizard Session helpers ────────────────────────────────────

export async function saveWizardAnswers(
  userId: number,
  answers: Record<string, unknown>
): Promise<WizardSession> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(wizardSessions)
    .where(eq(wizardSessions.userId, userId))
    .limit(1);

  if (existing.length > 0) {
    const [updated] = await db.update(wizardSessions)
      .set({ answers, completedAt: new Date() })
      .where(eq(wizardSessions.id, existing[0].id))
      .returning();
    return updated;
  } else {
    const [created] = await db.insert(wizardSessions).values({
      userId,
      answers,
      completedAt: new Date(),
    }).returning();
    return created;
  }
}

export async function getWizardAnswers(userId: number): Promise<WizardSession | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [session] = await db.select().from(wizardSessions)
    .where(eq(wizardSessions.userId, userId))
    .limit(1);
  return session;
}
