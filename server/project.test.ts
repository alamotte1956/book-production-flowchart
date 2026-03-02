import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Mock the db module
vi.mock("./db", () => {
  let projectIdCounter = 1;
  const projects: any[] = [];
  const stepStatuses: any[] = [];
  const uploadedFiles: any[] = [];
  const dueDates: any[] = [];
  let fileIdCounter = 1;
  let stepStatusIdCounter = 1;
  let dueDateIdCounter = 1;

  return {
    createProject: vi.fn(async (data: any) => {
      const project = {
        id: projectIdCounter++,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      projects.push(project);
      return project;
    }),
    getProjectsByUser: vi.fn(async (userId: number) => {
      return projects.filter((p) => p.userId === userId);
    }),
    getProjectById: vi.fn(async (projectId: number) => {
      return projects.find((p) => p.id === projectId);
    }),
    deleteProject: vi.fn(async (projectId: number) => {
      const idx = projects.findIndex((p) => p.id === projectId);
      if (idx >= 0) projects.splice(idx, 1);
    }),
    getStepStatusesByProject: vi.fn(async (projectId: number) => {
      return stepStatuses.filter((s) => s.projectId === projectId);
    }),
    upsertStepStatus: vi.fn(async (projectId: number, stepId: string, status: string, notes?: string) => {
      const existing = stepStatuses.find((s) => s.projectId === projectId && s.stepId === stepId);
      if (existing) {
        existing.status = status;
        existing.notes = notes ?? existing.notes;
        existing.completedAt = status === "complete" ? new Date() : null;
        return existing;
      }
      const entry = {
        id: stepStatusIdCounter++,
        projectId,
        stepId,
        status,
        notes: notes ?? null,
        completedAt: status === "complete" ? new Date() : null,
        updatedAt: new Date(),
      };
      stepStatuses.push(entry);
      return entry;
    }),
    getFilesByProject: vi.fn(async (projectId: number) => {
      return uploadedFiles.filter((f) => f.projectId === projectId);
    }),
    createUploadedFile: vi.fn(async (data: any) => {
      const file = { id: fileIdCounter++, ...data, uploadedAt: new Date() };
      uploadedFiles.push(file);
      return file;
    }),
    deleteUploadedFile: vi.fn(async (fileId: number) => {
      const idx = uploadedFiles.findIndex((f) => f.id === fileId);
      if (idx >= 0) uploadedFiles.splice(idx, 1);
    }),
    getDueDatesByProject: vi.fn(async (projectId: number) => {
      return dueDates.filter((d) => d.projectId === projectId);
    }),
    upsertPhaseDueDate: vi.fn(async (projectId: number, phaseId: string, dueDate: number) => {
      const existing = dueDates.find((d) => d.projectId === projectId && d.phaseId === phaseId);
      if (existing) {
        existing.dueDate = dueDate;
        return existing;
      }
      const entry = {
        id: dueDateIdCounter++,
        projectId,
        phaseId,
        dueDate,
        updatedAt: new Date(),
      };
      dueDates.push(entry);
      return entry;
    }),
    deletePhaseDueDate: vi.fn(async (projectId: number, phaseId: string) => {
      const idx = dueDates.findIndex((d) => d.projectId === projectId && d.phaseId === phaseId);
      if (idx >= 0) dueDates.splice(idx, 1);
    }),
    upsertStepDates: vi.fn(async (projectId: number, stepId: string, startDate?: number | null, targetDate?: number | null) => {
      const existing = stepStatuses.find((s: any) => s.projectId === projectId && s.stepId === stepId);
      if (existing) {
        if (startDate !== undefined) existing.startDate = startDate;
        if (targetDate !== undefined) existing.targetDate = targetDate;
        return existing;
      }
      const entry = {
        id: stepStatusIdCounter++,
        projectId,
        stepId,
        status: "pending",
        startDate: startDate ?? null,
        targetDate: targetDate ?? null,
        notes: null,
        completedAt: null,
        updatedAt: new Date(),
      };
      stepStatuses.push(entry);
      return entry;
    }),
    updateProjectDeadline: vi.fn(async (projectId: number, productionDeadline: number | null) => {
      const project = projects.find((p: any) => p.id === projectId);
      if (project) project.productionDeadline = productionDeadline;
      return project;
    }),

    // Production job mocks
    createProductionJob: vi.fn(async (data: any) => {
      const job = {
        id: 1,
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return job;
    }),
    getProductionJobsByProject: vi.fn(async (_projectId: number) => []),
    getProductionJobById: vi.fn(async (jobId: number) => ({
      id: jobId,
      projectId: 1,
      status: "queued",
      trimSizeId: "6x9",
      styleId: "literary-fiction",
      manuscriptFileName: "test.txt",
      manuscriptFileKey: "manuscripts/1/test.txt",
      wordCount: null,
      chapterCount: null,
      pdfUrl: null,
      pdfKey: null,
      epubUrl: null,
      epubKey: null,
      errorMessage: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    updateProductionJob: vi.fn(async (_jobId: number, _data: any) => {}),
  };
});

// Mock the manuscript parser
vi.mock("./manuscriptParser", () => ({
  parseManuscript: vi.fn(async () => ({
    text: "Chapter 1\n\nOnce upon a time...",
    wordCount: 5,
    format: "txt",
  })),
}));

// Mock the typesetting pipeline
vi.mock("./typesettingPipeline", () => ({
  produceBook: vi.fn(async () => ({
    pdfBuffer: Buffer.from("fake-pdf"),
    epubBuffer: Buffer.from("fake-epub"),
    chapterCount: 1,
    wordCount: 5,
  })),
}));

// Mock the storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn(async (key: string) => ({
    key,
    url: `https://cdn.example.com/${key}`,
  })),
}));

function createAuthContext(userId = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("project router", () => {
  it("creates a project", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const project = await caller.project.create({
      title: "My First Book",
      author: "Jane Doe",
      genre: "Fiction",
    });

    expect(project).toBeDefined();
    expect(project.title).toBe("My First Book");
    expect(project.author).toBe("Jane Doe");
    expect(project.userId).toBe(1);
  });

  it("lists projects for the authenticated user", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const list = await caller.project.list();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  it("gets a project with statuses, files, and dueDates", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const list = await caller.project.list();
    const projectId = list[0].id;

    const result = await caller.project.get({ projectId });
    expect(result.project).toBeDefined();
    expect(result.project.title).toBe("My First Book");
    expect(Array.isArray(result.statuses)).toBe(true);
    expect(Array.isArray(result.files)).toBe(true);
    expect(Array.isArray(result.dueDates)).toBe(true);
  });

  it("rejects unauthenticated access to project.list", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.project.list()).rejects.toThrow();
  });

  it("rejects access to another user's project", async () => {
    const ctx = createAuthContext(999);
    const caller = appRouter.createCaller(ctx);

    // Project 1 belongs to user 1, not user 999
    await expect(caller.project.get({ projectId: 1 })).rejects.toThrow("Project not found");
  });

  it("duplicates a project with (Copy) suffix", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const list = await caller.project.list();
    const original = list[0];

    const copy = await caller.project.duplicate({ projectId: original.id });
    expect(copy).toBeDefined();
    expect(copy.title).toBe(`${original.title} (Copy)`);
    expect(copy.author).toBe(original.author);
    expect(copy.genre).toBe(original.genre);
    expect(copy.id).not.toBe(original.id);
  });

  it("rejects duplicate of another user's project", async () => {
    const ctx = createAuthContext(999);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.project.duplicate({ projectId: 1 })).rejects.toThrow("Project not found");
  });
});

describe("step router", () => {
  it("marks a step as complete", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const list = await caller.project.list();
    const projectId = list[0].id;

    const result = await caller.step.updateStatus({
      projectId,
      stepId: "idea",
      status: "complete",
      notes: "Done researching",
    });

    expect(result.status).toBe("complete");
    expect(result.notes).toBe("Done researching");
    expect(result.completedAt).toBeDefined();
  });

  it("marks a step as skipped", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const list = await caller.project.list();
    const projectId = list[0].id;

    const result = await caller.step.updateStatus({
      projectId,
      stepId: "proposal",
      status: "skipped",
    });

    expect(result.status).toBe("skipped");
  });

  it("resets a step to pending", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const list = await caller.project.list();
    const projectId = list[0].id;

    const result = await caller.step.updateStatus({
      projectId,
      stepId: "idea",
      status: "pending",
    });

    expect(result.status).toBe("pending");
  });
});

describe("dueDate router", () => {
  it("sets a due date for a phase", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const list = await caller.project.list();
    const projectId = list[0].id;
    const futureDate = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days from now

    const result = await caller.dueDate.set({
      projectId,
      phaseId: "concept",
      dueDate: futureDate,
    });

    expect(result).toBeDefined();
    expect(result.phaseId).toBe("concept");
    expect(result.dueDate).toBe(futureDate);
  });

  it("updates an existing due date", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const list = await caller.project.list();
    const projectId = list[0].id;
    const newDate = Date.now() + 60 * 24 * 60 * 60 * 1000; // 60 days from now

    const result = await caller.dueDate.set({
      projectId,
      phaseId: "concept",
      dueDate: newDate,
    });

    expect(result.dueDate).toBe(newDate);
  });

  it("removes a due date", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const list = await caller.project.list();
    const projectId = list[0].id;

    const result = await caller.dueDate.remove({
      projectId,
      phaseId: "concept",
    });

    expect(result.success).toBe(true);
  });

  it("rejects due date set for another user's project", async () => {
    const ctx = createAuthContext(999);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.dueDate.set({ projectId: 1, phaseId: "concept", dueDate: Date.now() })
    ).rejects.toThrow("Project not found");
  });
});

describe("file router", () => {
  it("uploads a file to a step input", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const list = await caller.project.list();
    const projectId = list[0].id;

    const result = await caller.file.upload({
      projectId,
      stepId: "idea",
      inputName: "Market Research",
      fileName: "research.pdf",
      mimeType: "application/pdf",
      fileSize: 12345,
      fileBase64: Buffer.from("fake pdf content").toString("base64"),
    });

    expect(result).toBeDefined();
    expect(result.fileName).toBe("research.pdf");
    expect(result.fileUrl).toContain("cdn.example.com");
    expect(result.stepId).toBe("idea");
    expect(result.inputName).toBe("Market Research");
  });

  it("deletes an uploaded file", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const list = await caller.project.list();
    const projectId = list[0].id;

    // Upload first
    const uploaded = await caller.file.upload({
      projectId,
      stepId: "writing",
      inputName: "Detailed Outline",
      fileName: "outline.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      fileSize: 5000,
      fileBase64: Buffer.from("fake docx").toString("base64"),
    });

    const result = await caller.file.delete({ fileId: uploaded.id, projectId });
    expect(result.success).toBe(true);
  });
});

describe("step.setDates router", () => {
  it("sets start and target dates for a step", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const list = await caller.project.list();
    const projectId = list[0].id;

    const startDate = Date.now();
    const targetDate = Date.now() + 14 * 24 * 60 * 60 * 1000; // 14 days

    const result = await caller.step.setDates({
      projectId,
      stepId: "idea",
      startDate,
      targetDate,
    });

    expect(result).toBeDefined();
    expect(result.startDate).toBe(startDate);
    expect(result.targetDate).toBe(targetDate);
    expect(result.stepId).toBe("idea");
  });

  it("updates only targetDate when startDate is omitted", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const list = await caller.project.list();
    const projectId = list[0].id;

    const newTarget = Date.now() + 30 * 24 * 60 * 60 * 1000;

    const result = await caller.step.setDates({
      projectId,
      stepId: "idea",
      targetDate: newTarget,
    });

    expect(result.targetDate).toBe(newTarget);
  });

  it("rejects setDates for another user's project", async () => {
    const ctx = createAuthContext(999);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.step.setDates({ projectId: 1, stepId: "idea", targetDate: Date.now() })
    ).rejects.toThrow("Project not found");
  });
});

describe("project_deadline router", () => {
  it("sets a production deadline", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const list = await caller.project.list();
    const projectId = list[0].id;

    const deadline = Date.now() + 180 * 24 * 60 * 60 * 1000; // 6 months

    const result = await caller.project_deadline.set({
      projectId,
      productionDeadline: deadline,
    });

    expect(result).toBeDefined();
    expect(result.productionDeadline).toBe(deadline);
  });

  it("clears a production deadline by setting null", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const list = await caller.project.list();
    const projectId = list[0].id;

    const result = await caller.project_deadline.set({
      projectId,
      productionDeadline: null,
    });

    expect(result.productionDeadline).toBeNull();
  });

  it("rejects deadline set for another user's project", async () => {
    const ctx = createAuthContext(999);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.project_deadline.set({ projectId: 1, productionDeadline: Date.now() })
    ).rejects.toThrow("Project not found");
  });
});

// ─── autoProduce Tests ────────────────────────────────────────────────────────

describe("autoProduce.options", () => {
  it("returns available trim sizes and styles", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.autoProduce.options();
    expect(result.trimSizes).toBeDefined();
    expect(result.styles).toBeDefined();
    expect(result.trimSizes.length).toBeGreaterThan(0);
    expect(result.styles.length).toBeGreaterThan(0);
  });
});

describe("autoProduce.list", () => {
  it("returns empty list for a project with no jobs", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);
    const project = await caller.project.create({ title: "Auto Test Book" });
    const jobs = await caller.autoProduce.list({ projectId: project.id });
    expect(Array.isArray(jobs)).toBe(true);
    expect(jobs.length).toBe(0);
  });

  it("throws when project belongs to another user", async () => {
    const ctx1 = createAuthContext(1);
    const ctx2 = createAuthContext(2);
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);
    const project = await caller1.project.create({ title: "Private Book" });
    await expect(caller2.autoProduce.list({ projectId: project.id })).rejects.toThrow("Project not found");
  });
});

describe("autoProduce.start", () => {
  it("queues a production job and returns jobId", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);
    const project = await caller.project.create({ title: "My Novel", author: "Jane Doe" });
    const result = await caller.autoProduce.start({
      projectId: project.id,
      trimSizeId: "6x9",
      styleId: "literary-fiction",
      fileName: "manuscript.txt",
      mimeType: "text/plain",
      fileBase64: Buffer.from("Chapter 1\n\nHello world.").toString("base64"),
    });
    expect(result.jobId).toBeDefined();
    expect(result.status).toBe("queued");
  });

  it("throws when project belongs to another user", async () => {
    const ctx1 = createAuthContext(1);
    const ctx2 = createAuthContext(2);
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);
    const project = await caller1.project.create({ title: "Owned Book" });
    await expect(
      caller2.autoProduce.start({
        projectId: project.id,
        trimSizeId: "6x9",
        styleId: "literary-fiction",
        fileName: "test.txt",
        mimeType: "text/plain",
        fileBase64: Buffer.from("hello").toString("base64"),
      })
    ).rejects.toThrow("Project not found");
  });
});

describe("autoProduce.status", () => {
  it("returns job status by jobId", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);
    const project = await caller.project.create({ title: "Status Test" });
    const { jobId } = await caller.autoProduce.start({
      projectId: project.id,
      trimSizeId: "6x9",
      styleId: "literary-fiction",
      fileName: "test.txt",
      mimeType: "text/plain",
      fileBase64: Buffer.from("hello").toString("base64"),
    });
    const job = await caller.autoProduce.status({ jobId });
    expect(job.id).toBe(jobId);
    expect(job.trimSizeId).toBe("6x9");
  });
});
