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
  };
});

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
