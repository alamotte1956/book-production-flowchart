import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  createProject, getProjectsByUser, getProjectById, deleteProject,
  getStepStatusesByProject, upsertStepStatus, upsertStepDates,
  getFilesByProject, createUploadedFile, deleteUploadedFile,
  getDueDatesByProject, upsertPhaseDueDate, deletePhaseDueDate,
  updateProjectDeadline,
} from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  project: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getProjectsByUser(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        const [statuses, files, dueDates] = await Promise.all([
          getStepStatusesByProject(input.projectId),
          getFilesByProject(input.projectId),
          getDueDatesByProject(input.projectId),
        ]);
        return { project, statuses, files, dueDates };
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        author: z.string().max(255).optional(),
        genre: z.string().max(128).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return createProject({
          userId: ctx.user.id,
          title: input.title,
          author: input.author ?? null,
          genre: input.genre ?? null,
          notes: input.notes ?? null,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        await deleteProject(input.projectId);
        return { success: true };
      }),

    duplicate: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const source = await getProjectById(input.projectId);
        if (!source || source.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return createProject({
          userId: ctx.user.id,
          title: `${source.title} (Copy)`,
          author: source.author,
          genre: source.genre,
          notes: source.notes,
        });
      }),
  }),

  step: router({
    setDates: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        stepId: z.string(),
        startDate: z.number().nullable().optional(),
        targetDate: z.number().nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return upsertStepDates(input.projectId, input.stepId, input.startDate, input.targetDate);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        stepId: z.string(),
        status: z.enum(["pending", "complete", "skipped"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return upsertStepStatus(input.projectId, input.stepId, input.status, input.notes);
      }),
  }),

  file: router({
    upload: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        stepId: z.string(),
        inputName: z.string(),
        fileName: z.string(),
        mimeType: z.string().optional(),
        fileSize: z.number().optional(),
        fileBase64: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        const buffer = Buffer.from(input.fileBase64, "base64");
        const suffix = nanoid(8);
        const fileKey = `projects/${input.projectId}/${input.stepId}/${suffix}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType || "application/octet-stream");

        return createUploadedFile({
          projectId: input.projectId,
          stepId: input.stepId,
          inputName: input.inputName,
          fileName: input.fileName,
          fileUrl: url,
          fileKey,
          mimeType: input.mimeType ?? null,
          fileSize: input.fileSize ?? null,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ fileId: z.number(), projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        await deleteUploadedFile(input.fileId);
        return { success: true };
      }),
  }),

  project_deadline: router({
    set: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        productionDeadline: z.number().nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return updateProjectDeadline(input.projectId, input.productionDeadline);
      }),
  }),

  dueDate: router({
    set: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        phaseId: z.string(),
        dueDate: z.number(), // Unix timestamp ms
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return upsertPhaseDueDate(input.projectId, input.phaseId, input.dueDate);
      }),

    remove: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        phaseId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        await deletePhaseDueDate(input.projectId, input.phaseId);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
