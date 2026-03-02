import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  projects, InsertProject, Project,
  stepStatuses, InsertStepStatus, StepStatus,
  uploadedFiles, InsertUploadedFile, UploadedFile,
  phaseDueDates, InsertPhaseDueDate, PhaseDueDate,
  productionJobs, InsertProductionJob, ProductionJob,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
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
  const [result] = await db.insert(projects).values(data).$returningId();
  const [project] = await db.select().from(projects).where(eq(projects.id, result.id));
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
    await db.update(stepStatuses)
      .set({
        status,
        notes: notes ?? existing[0].notes,
        completedAt: status === "complete" ? new Date() : null,
      })
      .where(eq(stepStatuses.id, existing[0].id));
    const [updated] = await db.select().from(stepStatuses).where(eq(stepStatuses.id, existing[0].id));
    return updated;
  } else {
    const [result] = await db.insert(stepStatuses).values({
      projectId,
      stepId,
      status,
      notes,
      completedAt: status === "complete" ? new Date() : null,
    }).$returningId();
    const [created] = await db.select().from(stepStatuses).where(eq(stepStatuses.id, result.id));
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
  const [result] = await db.insert(uploadedFiles).values(data).$returningId();
  const [file] = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, result.id));
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
    await db.update(stepStatuses).set(updateSet).where(eq(stepStatuses.id, existing[0].id));
    const [updated] = await db.select().from(stepStatuses).where(eq(stepStatuses.id, existing[0].id));
    return updated;
  } else {
    const [result] = await db.insert(stepStatuses).values({
      projectId,
      stepId,
      status: "pending",
      startDate: startDate ?? null,
      targetDate: targetDate ?? null,
    }).$returningId();
    const [created] = await db.select().from(stepStatuses).where(eq(stepStatuses.id, result.id));
    return created;
  }
}

export async function updateProjectDeadline(
  projectId: number,
  productionDeadline: number | null
): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set({ productionDeadline }).where(eq(projects.id, projectId));
  const [updated] = await db.select().from(projects).where(eq(projects.id, projectId));
  return updated;
}

export async function updateProjectGenre(
  projectId: number,
  genre: string | null
): Promise<Project> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(projects).set({ genre }).where(eq(projects.id, projectId));
  const [updated] = await db.select().from(projects).where(eq(projects.id, projectId));
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
    await db.update(phaseDueDates)
      .set({ dueDate })
      .where(eq(phaseDueDates.id, existing[0].id));
    const [updated] = await db.select().from(phaseDueDates).where(eq(phaseDueDates.id, existing[0].id));
    return updated;
  } else {
    const [result] = await db.insert(phaseDueDates).values({ projectId, phaseId, dueDate }).$returningId();
    const [created] = await db.select().from(phaseDueDates).where(eq(phaseDueDates.id, result.id));
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
  const [result] = await db.insert(productionJobs).values(data).$returningId();
  const [job] = await db.select().from(productionJobs).where(eq(productionJobs.id, result.id));
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
  await db.update(productionJobs).set(data).where(eq(productionJobs.id, jobId));
  const [updated] = await db.select().from(productionJobs).where(eq(productionJobs.id, jobId));
  return updated;
}
