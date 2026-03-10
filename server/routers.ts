import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { nanoid } from "nanoid";
import {
  createProject, getProjectsByUser, getProjectById, deleteProject,
  getStepStatusesByProject, upsertStepStatus, upsertStepDates,
  getFilesByProject, createUploadedFile, deleteUploadedFile,
  getDueDatesByProject, upsertPhaseDueDate, deletePhaseDueDate,
  updateProjectDeadline, updateProjectGenre, updateProjectBibleSpecs, updateProjectMeta,
  createProductionJob, getProductionJobsByProject, getProductionJobById, updateProductionJob,
  createReviewComment, getReviewCommentsByJob, countApprovedJobsByProject,
} from "./db";
import { parseManuscript } from "./manuscriptParser";
import { produceBook } from "./typesettingPipeline";
import { TYPESETTING_STYLES, TRIM_SIZES, FONT_FAMILIES, getTrimSize, getTypesettingStyle } from "./typesettingStyles";
import { storagePut } from "./storage";
import { generateIdml } from "./idmlGenerator";
import { invokeLLM } from "./_core/llm";
import { lookupByIsbn } from "./isbnLookup";
import { notifyOwner } from "./_core/notification";
import { sendConfirmationEmail, sendLoginEmail, sendPasswordResetEmail, sendAffiliateWelcomeEmail, sendAffiliateNotificationToOwner, sendReviewReadyEmail } from "./resendClient";
import { createContactSubmission, saveWizardAnswers, getWizardAnswers, getRecentActivity, getDashboardStats, getUserById, updateUserStripeInfo, getUserByEmail, createEmailUser, confirmUserEmail, getUserByConfirmToken, getUserByCheckoutToken, setLoginToken, getUserByLoginToken, setPasswordResetToken, getUserByPasswordResetToken, clearPasswordResetToken, clearSession, createSession, setUserPassword, getOrdersByUser } from "./db";
import { TRPCError } from "@trpc/server";
import { getUncachableStripeClient, getStripePublishableKey } from "./stripeClient";
import { sql } from "drizzle-orm";

// ─── Error classification helper (module scope so it's shared by start + retry) ──
const classifyError = (err: unknown, fileName: string, wordCount?: number | null): "format_unsupported" | "parse_empty" | "pipeline_error" | "unknown" => {
  const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
  const ext = (fileName ?? "").split(".").pop()?.toLowerCase() ?? "";
  const unsupportedExts = ["pages", "odt", "wps", "wpd", "numbers", "key", "pub", "indd", "qxp", "xps", "psd", "ai"];
  if (unsupportedExts.includes(ext)) return "format_unsupported";
  if (msg.includes("unsupported") || msg.includes("cannot parse") || msg.includes("invalid file") || msg.includes("unrecognized")) return "format_unsupported";
  if (wordCount === 0 || msg.includes("no text") || msg.includes("empty") || msg.includes("no content")) return "parse_empty";
  if (msg.includes("pipeline") || msg.includes("typeset") || msg.includes("pdf") || msg.includes("epub") || msg.includes("chromium") || msg.includes("browser")) return "pipeline_error";
  return "unknown";
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
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
        bibleEditionType: z.string().max(64).optional(),
        bibleTranslation: z.string().max(32).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await getUserById(ctx.user.id);
        const plan = user?.plan ?? "starter";
        if ((plan === "starter" || plan === "kdp_ready") && !user?.isAdmin) {
          const existing = await getProjectsByUser(ctx.user.id);
          if (existing.length >= 1) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: `Your ${plan === "kdp_ready" ? "KDP Ready" : "Starter"} plan is limited to 1 book project. Upgrade to Author Pro for unlimited projects.`,
            });
          }
        }
        return createProject({
          userId: ctx.user.id,
          title: input.title,
          author: input.author ?? null,
          genre: input.genre ?? null,
          bibleEditionType: input.bibleEditionType ?? null,
          bibleTranslation: input.bibleTranslation ?? null,
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
        const user = await getUserById(ctx.user.id);
        const plan = user?.plan ?? "starter";
        if ((plan === "starter" || plan === "kdp_ready") && !user?.isAdmin) {
          const existing = await getProjectsByUser(ctx.user.id);
          if (existing.length >= 1) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: `Your ${plan === "kdp_ready" ? "KDP Ready" : "Starter"} plan is limited to 1 book project. Upgrade to Author Pro for unlimited projects.`,
            });
          }
        }
        return createProject({
          userId: ctx.user.id,
          title: `${source.title} (Copy)`,
          author: source.author,
          genre: source.genre,
          notes: source.notes,
        });
      }),

    updateGenre: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        genre: z.string().max(128).nullable(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return updateProjectGenre(input.projectId, input.genre);
      }),

    updateBibleSpecs: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        bibleEditionType: z.string().max(64).nullable().optional(),
        bibleTranslation: z.string().max(32).nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return updateProjectBibleSpecs(input.projectId, {
          bibleEditionType: input.bibleEditionType,
          bibleTranslation: input.bibleTranslation,
        });
      }),

    updateMeta: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        title: z.string().min(1).max(255).optional(),
        author: z.string().max(255).nullable().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return updateProjectMeta(input.projectId, {
          title: input.title,
          author: input.author,
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
        await deleteUploadedFile(input.fileId, input.projectId);
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

  autoProduce: router({
    // Generate a one-page styled HTML preview for a given style + trim size
    preview: publicProcedure
      .input(z.object({
        styleId: z.string(),
        trimSizeId: z.string(),
        fontOverrideBody: z.string().optional(),
        fontOverrideHeading: z.string().optional(),
      }))
      .query(({ input }) => {
        const trim = getTrimSize(input.trimSizeId);
        let style = getTypesettingStyle(input.styleId);

        if (input.fontOverrideBody || input.fontOverrideHeading) {
          style = { ...style };
          const googleUrls: string[] = [style.googleFontsUrl];
          if (input.fontOverrideBody) {
            const bodyFont = FONT_FAMILIES.find(f => f.id === input.fontOverrideBody);
            if (bodyFont) {
              style.fontFamily = bodyFont.cssStack;
              googleUrls.push(bodyFont.googleFontsUrl);
            }
          }
          if (input.fontOverrideHeading) {
            const headingFont = FONT_FAMILIES.find(f => f.id === input.fontOverrideHeading);
            if (headingFont) {
              style.chapterHeadingFont = headingFont.cssStack;
              googleUrls.push(headingFont.googleFontsUrl);
            }
          }
          style.googleFontsUrl = [...new Set(googleUrls)].join("|||");
        }

        // Sample content for the preview page
        // All scripture-* styles use Genesis sample content
        const isScripture = (style.doubleColumn && style.verseNumbers)
          || style.id.startsWith("scripture");

        const sampleTitle = isScripture ? "Genesis" : "Chapter One";
        const sampleSubtitle = isScripture ? "Chapter 1" : "The Beginning";

        // Scripture sample: Genesis 1:1-8 with verse numbers
        const scriptureParagraph1 = `<p class="body-text"><sup class="vn">1</sup> In the beginning God created the heavens and the earth. <sup class="vn">2</sup> Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters. <sup class="vn">3</sup> And God said, "Let there be light," and there was light. <sup class="vn">4</sup> God saw that the light was good, and he separated the light from the darkness.</p>`;
        const scriptureParagraph2 = `<p class="body-text"><sup class="vn">5</sup> God called the light "day," and the darkness he called "night." And there was evening, and there was morning — the first day. <sup class="vn">6</sup> And God said, "Let there be a vault between the waters to separate water from water." <sup class="vn">7</sup> So God made the vault and separated the water under the vault from the water above it. And it was so. <sup class="vn">8</sup> God called the vault "sky." And there was evening, and there was morning — the second day.</p>`;
        const scriptureParagraph3 = `<p class="body-text"><sup class="vn">9</sup> And God said, "Let the water under the sky be gathered to one place, and let dry ground appear." And it was so. <sup class="vn">10</sup> God called the dry ground "land," and the gathered waters he called "seas." And God saw that it was good. <sup class="vn">11</sup> Then God said, "Let the land produce vegetation: seed-bearing plants and trees on the land that bear fruit with seed in it, according to their various kinds." And it was so.</p>`;

        const sampleParagraph1 = isScripture ? scriptureParagraph1 : (style.dropCap
          ? `<p class="body-text drop-cap">It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.</p>`
          : `<p class="body-text">It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.</p>`);
        const sampleParagraph2 = isScripture ? scriptureParagraph2 : `<p class="body-text">We had everything before us, we had nothing before us, we were all going direct to Heaven, we were all going direct the other way. In short, the period was so far like the present period, that some of its noisiest authorities insisted on its being received, for good or for evil, in the superlative degree of comparison only.</p>`;
        const sampleParagraph3 = isScripture ? scriptureParagraph3 : `<p class="body-text">There were a king with a large jaw and a queen with a plain face, on the throne of England; there were a king with a large jaw and a queen with a fair face, on the throne of France. In both countries it was clearer than crystal to the lords of the State preserves of loaves and fishes, that things in general were settled for ever.</p>`;

        const pageWidthPx = Math.round(trim.widthIn * 96);
        const pageHeightPx = Math.round(trim.heightIn * 96);
        const marginTopPx = Math.round(trim.marginTopIn * 96);
        const marginBottomPx = Math.round(trim.marginBottomIn * 96);
        const marginInsidePx = Math.round(trim.marginInsideIn * 96);
        const marginOutsidePx = Math.round(trim.marginOutsideIn * 96);
        const headerFooterPx = Math.round(trim.headerFooterIn * 96);

        const dropCapCss = style.dropCap ? `
          .drop-cap::first-letter {
            font-size: ${style.fontSize * 3.5}pt;
            font-family: ${style.chapterHeadingFont};
            font-weight: 600;
            float: left;
            line-height: 0.8;
            margin-right: 4px;
            margin-top: 4px;
            color: ${style.headingColor};
          }
        ` : '';

        const scriptureCss = isScripture ? `
          .content {
            display: block;
          }
          .scripture-heading {
            text-align: center;
            border-bottom: 1pt solid ${style.headingColor};
            padding-bottom: 8px;
            margin-bottom: 14px;
            margin-top: 16px;
          }
          .scripture-book {
            font-family: ${style.chapterHeadingFont};
            font-size: ${style.chapterHeadingSize}pt;
            font-weight: 700;
            color: ${style.headingColor};
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }
          .scripture-chapter {
            font-family: ${style.chapterHeadingFont};
            font-size: ${style.fontSize * 1.1}pt;
            color: ${style.headingColor};
            opacity: 0.75;
            margin-top: 4px;
          }
          .columns {
            column-count: 2;
            column-gap: 18px;
            column-rule: 0.5pt solid #c8b89a;
          }
          .body-text {
            text-indent: 0;
            margin-bottom: 6px;
            font-size: ${style.fontSize}pt;
            line-height: ${style.lineHeight};
          }
          sup.vn {
            font-size: 0.6em;
            font-weight: 700;
            color: ${style.headingColor};
            vertical-align: super;
            line-height: 0;
            margin-right: 2px;
            font-style: normal;
          }
        ` : '';

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Style Preview — ${style.label}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ${style.googleFontsUrl.split("|||").map(u => `<link href="${u}" rel="stylesheet">`).join("\n  ")}
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { background: #e8e0d8; display: flex; justify-content: center; align-items: flex-start; padding: 24px; min-height: 100vh; }
    .page {
      width: ${pageWidthPx}px;
      height: ${pageHeightPx}px;
      background: #ffffff;
      box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      position: relative;
      overflow: hidden;
      padding: ${marginTopPx}px ${marginOutsidePx}px ${marginBottomPx}px ${marginInsidePx}px;
    }
    .running-header {
      position: absolute;
      top: ${headerFooterPx}px;
      left: ${marginInsidePx}px;
      right: ${marginOutsidePx}px;
      font-family: ${style.fontFamily};
      font-size: ${style.fontSize * 0.72}pt;
      color: #888;
      display: flex;
      justify-content: space-between;
      border-bottom: 0.5px solid #ccc;
      padding-bottom: 4px;
      letter-spacing: 0.04em;
    }
    .running-footer {
      position: absolute;
      bottom: ${headerFooterPx}px;
      left: ${marginInsidePx}px;
      right: ${marginOutsidePx}px;
      font-family: ${style.fontFamily};
      font-size: ${style.fontSize * 0.72}pt;
      color: #888;
      text-align: center;
      border-top: 0.5px solid #ccc;
      padding-top: 4px;
    }
    .content {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }
    .chapter-number {
      font-family: ${style.chapterHeadingFont};
      font-size: ${style.fontSize * 0.85}pt;
      color: ${style.headingColor};
      letter-spacing: 0.15em;
      text-transform: uppercase;
      margin-bottom: 12px;
      margin-top: 24px;
      opacity: 0.7;
    }
    .chapter-title {
      font-family: ${style.chapterHeadingFont};
      font-size: ${style.chapterHeadingSize}pt;
      font-weight: 600;
      color: ${style.headingColor};
      margin-bottom: 8px;
      line-height: 1.2;
    }
    .chapter-subtitle {
      font-family: ${style.chapterHeadingFont};
      font-size: ${style.fontSize * 1.1}pt;
      color: ${style.headingColor};
      font-style: italic;
      margin-bottom: 28px;
      opacity: 0.75;
    }
    .chapter-rule {
      width: 48px;
      height: 1px;
      background: ${style.headingColor};
      margin: 0 auto 28px auto;
      opacity: 0.3;
    }
    .body-text {
      font-family: ${style.fontFamily};
      font-size: ${style.fontSize}pt;
      line-height: ${style.lineHeight};
      color: ${style.bodyColor};
      text-align: justify;
      text-indent: 1.5em;
      margin-bottom: 0;
      hyphens: auto;
    }
    .body-text:first-of-type { text-indent: 0; }
    ${dropCapCss}
    ${scriptureCss}
    .preview-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(0,0,0,0.06);
      color: #999;
      font-size: 8px;
      font-family: sans-serif;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="preview-badge">Sample Preview</div>
    <div class="running-header">
      <span>${isScripture ? 'Holy Bible' : 'A Tale of Two Cities'}</span>
      <span>${style.label}</span>
    </div>
    <div class="content">
      ${isScripture ? `
        <div class="scripture-heading">
          <div class="scripture-book">${sampleTitle}</div>
          <div class="scripture-chapter">${sampleSubtitle}</div>
        </div>
        <div class="columns">
          ${sampleParagraph1}
          ${sampleParagraph2}
          ${sampleParagraph3}
        </div>
      ` : `
        <div class="chapter-number">Chapter One</div>
        <div class="chapter-title">${sampleTitle}</div>
        <div class="chapter-subtitle">${sampleSubtitle}</div>
        <div class="chapter-rule"></div>
        ${sampleParagraph1}
        ${sampleParagraph2}
        ${sampleParagraph3}
      `}
    </div>
    <div class="running-footer">1</div>
  </div>
</body>
</html>`;

        return {
          html,
          styleLabel: style.label,
          trimLabel: trim.label,
          pageWidthPx,
          pageHeightPx,
        };
      }),

    // Return available trim sizes and styles for the UI dropdowns
    options: publicProcedure.query(() => ({
      trimSizes: TRIM_SIZES,
      styles: TYPESETTING_STYLES,
      fonts: FONT_FAMILIES,
    })),

    // List all production jobs for a project
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return getProductionJobsByProject(input.projectId);
      }),

    // Get a single job's status
    status: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ ctx, input }) => {
        const job = await getProductionJobById(input.jobId);
        if (!job) throw new Error("Job not found");
        // Verify ownership via project
        const project = await getProjectById(job.projectId);
        if (!project || project.userId !== ctx.user.id) throw new Error("Not authorized");
        return job;
      }),

    // Upload manuscript and start the AI production pipeline
    start: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        trimSizeId: z.string(),
        styleId: z.string(),
        outputFormat: z.enum(["both", "pdf", "epub"]).default("both"),
        fileName: z.string(),
        mimeType: z.string(),
        fileBase64: z.string(),
        fontOverrideBody: z.string().optional(),
        fontOverrideHeading: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const user = await getUserById(ctx.user.id);
        if ((user?.plan ?? "starter") === "starter") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "AI Typesetting requires Author Pro or Publisher plan. Upgrade to access this feature.",
          });
        }
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        // Upload the manuscript to S3
        const buffer = Buffer.from(input.fileBase64, "base64");
        const suffix = nanoid(8);
        const manuscriptKey = `manuscripts/${input.projectId}/${suffix}-${input.fileName}`;
        await storagePut(manuscriptKey, buffer, input.mimeType);

        // Create the job record
        const job = await createProductionJob({
          projectId: input.projectId,
          status: "queued",
          trimSizeId: input.trimSizeId,
          styleId: input.styleId,
          manuscriptFileName: input.fileName,
          manuscriptFileKey: manuscriptKey,
        });
        const outputFormat = input.outputFormat ?? "both";

        // Run the pipeline asynchronously (fire and forget with error capture)
        (async () => {
          try {
            await updateProductionJob(job.id, { status: "processing" });

            // Step 1: Extract raw text from the manuscript file
            const parsed = await parseManuscript(buffer, input.mimeType, input.fileName);

            // Classify empty-parse early so the error type is set even if pipeline continues
            if (parsed.wordCount === 0) {
              await updateProductionJob(job.id, { wordCount: 0, status: "error", errorMessage: "No readable text was extracted from the manuscript. The file may be empty, image-only, or in an unsupported format.", errorType: "parse_empty" });
              return;
            }

            await updateProductionJob(job.id, { wordCount: parsed.wordCount });

            // Step 2: Run the full AI typesetting pipeline (chapter detection + PDF + EPUB + IDML)
            const { pdfBuffer, epubBuffer, printReadyPdfBuffer, chapterCount, wordCount, parsedBook, trimSize: prodTrimSize, style: prodStyle } = await produceBook(
              parsed.text,
              {
                trimSizeId: input.trimSizeId,
                styleId: input.styleId,
                title: project.title,
                author: project.author ?? "Unknown Author",
                includeBleed: true,
                fontOverrideBody: input.fontOverrideBody,
                fontOverrideHeading: input.fontOverrideHeading,
              }
            );

            await updateProductionJob(job.id, {
              wordCount,
              chapterCount,
            });

            const updates: Record<string, unknown> = { status: "pending_review" };

            // Upload PDF if requested
            if (outputFormat === "both" || outputFormat === "pdf") {
              const pdfKey = `output/${input.projectId}/${job.id}-interior.pdf`;
              const { url: pdfUrl } = await storagePut(pdfKey, pdfBuffer, "application/pdf");
              updates.pdfUrl = pdfUrl;
              updates.pdfKey = pdfKey;

              if (printReadyPdfBuffer) {
                const kdpPdfKey = `output/${input.projectId}/${job.id}-interior-kdp.pdf`;
                const { url: kdpPdfUrl } = await storagePut(kdpPdfKey, printReadyPdfBuffer, "application/pdf");
                updates.kdpPdfUrl = kdpPdfUrl;
                updates.kdpPdfKey = kdpPdfKey;
              }
            }

            // Upload EPUB if requested
            if (outputFormat === "both" || outputFormat === "epub") {
              const epubKey = `output/${input.projectId}/${job.id}-ebook.epub`;
              const { url: epubUrl } = await storagePut(epubKey, epubBuffer, "application/epub+zip");
              updates.epubUrl = epubUrl;
              updates.epubKey = epubKey;
            }

            // Always generate IDML (InDesign) package
            const idmlChapters = parsedBook.chapters.map(ch => ({
              title: ch.title,
              paragraphs: ch.body.split(/\n{2,}/).filter(p => p.trim().length > 0),
            }));
            const idmlBuffer = await generateIdml({
              title: project.title,
              author: project.author ?? "Unknown Author",
              trimSize: prodTrimSize,
              style: prodStyle,
              chapters: idmlChapters,
              frontmatter: parsedBook.frontmatter,
              backmatter: parsedBook.backmatter,
            });
            const idmlKey = `output/${input.projectId}/${job.id}-layout.idml`;
            const { url: idmlUrl } = await storagePut(idmlKey, idmlBuffer, "application/vnd.adobe.indesign-idml-package");
            updates.idmlUrl = idmlUrl;
            updates.idmlKey = idmlKey;

            await updateProductionJob(job.id, updates);

            try {
              const jobUser = await getUserById(ctx.user.id);
              if (jobUser?.email) {
                await sendReviewReadyEmail(jobUser.email, jobUser.name || "Author", project.title, job.id);
              }
            } catch (emailErr) {
              console.error(`[AutoProduce] Failed to send review-ready email for job ${job.id}:`, emailErr);
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            const stack = err instanceof Error ? (err.stack ?? msg) : msg;
            // Extract stage name from "[Stage: X] ..." prefix if present
            const stageMatch = msg.match(/^\[Stage:\s*([^\]]+)\]/);
            const failedStage = stageMatch ? stageMatch[1].trim() : undefined;
            console.error(
              `[AutoProduce] Job ${job.id} FAILED`,
              `\n  File: ${input.fileName}`,
              `\n  Trim: ${input.trimSizeId}`,
              `\n  Style: ${input.styleId}`,
              failedStage ? `\n  Stage: ${failedStage}` : "",
              `\n  Error: ${msg}`,
              `\n  Stack:\n${stack}`
            );
            const currentJob = await getProductionJobById(job.id);
            const errorType = classifyError(err, input.fileName, currentJob?.wordCount);
            await updateProductionJob(job.id, {
              status: "error",
              errorMessage: msg,
              errorType,
              ...(failedStage ? { failedStage } : {}),
            });
          }
        })();

        return { jobId: job.id, status: "queued" };
      }),

    // Retry a failed job using the same manuscript already in S3
    retry: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const originalJob = await getProductionJobById(input.jobId);
        if (!originalJob) throw new Error("Job not found");
        const project = await getProjectById(originalJob.projectId);
        if (!project || project.userId !== ctx.user.id) throw new Error("Not authorized");
        if (originalJob.status !== "error") throw new Error("Only failed jobs can be retried");
        if (!originalJob.manuscriptFileKey) throw new Error("Original manuscript file not found in storage");

        const MAX_RETRIES = 3;
        if (originalJob.retryCount >= MAX_RETRIES) {
          throw new Error(`Maximum retry limit reached (${MAX_RETRIES} attempts). Please upload a new manuscript file to start a fresh job.`);
        }

        // Create a new job re-using the same S3 manuscript key, carrying the incremented retry count
        const newJob = await createProductionJob({
          projectId: originalJob.projectId,
          status: "queued",
          trimSizeId: originalJob.trimSizeId,
          styleId: originalJob.styleId,
          manuscriptFileName: originalJob.manuscriptFileName,
          manuscriptFileKey: originalJob.manuscriptFileKey,
          retryCount: originalJob.retryCount + 1,
        });

        // Fire-and-forget pipeline
        (async () => {
          try {
            await updateProductionJob(newJob.id, { status: "processing" });
            const { storageGet, getLocalStorageDir } = await import("./storage");
            const { url: manuscriptUrl } = await storageGet(originalJob.manuscriptFileKey!);
            let buffer: Buffer;
            if (manuscriptUrl.startsWith("/")) {
              const fs = await import("fs");
              const path = await import("path");
              const localPath = path.join(getLocalStorageDir(), originalJob.manuscriptFileKey!);
              buffer = fs.readFileSync(localPath);
            } else {
              const fetchRes = await fetch(manuscriptUrl);
              if (!fetchRes.ok) throw new Error(`Storage fetch failed: ${fetchRes.status}`);
              buffer = Buffer.from(await fetchRes.arrayBuffer());
            }
            const ext = (originalJob.manuscriptFileName ?? "").split(".").pop()?.toLowerCase() ?? "";
            const mimeMap: Record<string, string> = {
              pdf: "application/pdf",
              docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              doc: "application/msword",
              txt: "text/plain",
              md: "text/markdown",
              html: "text/html",
              rtf: "text/rtf",
              epub: "application/epub+zip",
            };
            const mimeType = mimeMap[ext] ?? "application/octet-stream";
            const parsed = await parseManuscript(buffer, mimeType, originalJob.manuscriptFileName ?? "manuscript");
            await updateProductionJob(newJob.id, { wordCount: parsed.wordCount });
            const { pdfBuffer, epubBuffer, printReadyPdfBuffer: prPdf, chapterCount, wordCount, parsedBook, trimSize: prodTrimSize, style: prodStyle } = await produceBook(
              parsed.text,
              { trimSizeId: originalJob.trimSizeId, styleId: originalJob.styleId, title: project.title, author: project.author ?? "Unknown Author", includeBleed: true }
            );
            await updateProductionJob(newJob.id, { wordCount, chapterCount });
            const updates: Record<string, unknown> = { status: "pending_review" };
            const pdfKey = `output/${originalJob.projectId}/${newJob.id}-interior.pdf`;
            const { url: pdfUrl } = await storagePut(pdfKey, pdfBuffer, "application/pdf");
            updates.pdfUrl = pdfUrl; updates.pdfKey = pdfKey;
            if (prPdf) {
              const kdpKey = `output/${originalJob.projectId}/${newJob.id}-interior-kdp.pdf`;
              const { url: kdpUrl } = await storagePut(kdpKey, prPdf, "application/pdf");
              updates.kdpPdfUrl = kdpUrl; updates.kdpPdfKey = kdpKey;
            }
            const epubKey = `output/${originalJob.projectId}/${newJob.id}-ebook.epub`;
            const { url: epubUrl } = await storagePut(epubKey, epubBuffer, "application/epub+zip");
            updates.epubUrl = epubUrl; updates.epubKey = epubKey;
            const idmlChapters = parsedBook.chapters.map(ch => ({ title: ch.title, paragraphs: ch.body.split(/\n{2,}/).filter(p => p.trim().length > 0) }));
            const idmlBuffer = await generateIdml({ title: project.title, author: project.author ?? "Unknown Author", trimSize: prodTrimSize, style: prodStyle, chapters: idmlChapters, frontmatter: parsedBook.frontmatter, backmatter: parsedBook.backmatter });
            const idmlKey = `output/${originalJob.projectId}/${newJob.id}-layout.idml`;
            const { url: idmlUrl } = await storagePut(idmlKey, idmlBuffer, "application/vnd.adobe.indesign-idml-package");
            updates.idmlUrl = idmlUrl; updates.idmlKey = idmlKey;
            await updateProductionJob(newJob.id, updates);

            try {
              const retryUser = await getUserById(ctx.user.id);
              if (retryUser?.email) {
                await sendReviewReadyEmail(retryUser.email, retryUser.name || "Author", project.title, newJob.id);
              }
            } catch (emailErr) {
              console.error(`[AutoProduce] Failed to send review-ready email for retry job ${newJob.id}:`, emailErr);
            }
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            const stack = err instanceof Error ? (err.stack ?? msg) : msg;
            const stageMatch = msg.match(/^\[Stage:\s*([^\]]+)\]/);
            const failedStage = stageMatch ? stageMatch[1].trim() : undefined;
            console.error(
              `[AutoProduce] Retry job ${newJob.id} FAILED (original: ${originalJob.id})`,
              `\n  File: ${originalJob.manuscriptFileName ?? "unknown"}`,
              `\n  Trim: ${originalJob.trimSizeId}`,
              `\n  Style: ${originalJob.styleId}`,
              `\n  Retry #: ${originalJob.retryCount + 1}`,
              failedStage ? `\n  Stage: ${failedStage}` : "",
              `\n  Error: ${msg}`,
              `\n  Stack:\n${stack}`
            );
            const currentRetryJob = await getProductionJobById(newJob.id);
            const retryErrorType = classifyError(err, originalJob.manuscriptFileName ?? "", currentRetryJob?.wordCount);
            await updateProductionJob(newJob.id, {
              status: "error",
              errorMessage: msg,
              errorType: retryErrorType,
              ...(failedStage ? { failedStage } : {}),
            });
          }
        })();

        return { jobId: newJob.id, status: "queued" };
      }),

    approve: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const job = await getProductionJobById(input.jobId);
        if (!job) throw new Error("Job not found");
        const project = await getProjectById(job.projectId);
        if (!project || project.userId !== ctx.user.id) throw new Error("Not authorized");
        if (job.status !== "pending_review") throw new Error("Only jobs in review can be approved");
        await updateProductionJob(input.jobId, { status: "approved", approvedAt: new Date() } as any);
        return { success: true };
      }),

    requestRevision: protectedProcedure
      .input(z.object({ jobId: z.number(), message: z.string().min(1).max(5000) }))
      .mutation(async ({ ctx, input }) => {
        const job = await getProductionJobById(input.jobId);
        if (!job) throw new Error("Job not found");
        const project = await getProjectById(job.projectId);
        if (!project || project.userId !== ctx.user.id) throw new Error("Not authorized");
        if (job.status !== "pending_review") throw new Error("Only jobs in review can have revisions requested");
        await createReviewComment({ jobId: input.jobId, userId: ctx.user.id, role: "author", message: input.message });
        await updateProductionJob(input.jobId, { reviewNotes: input.message } as any);
        return { success: true };
      }),

    addComment: protectedProcedure
      .input(z.object({ jobId: z.number(), message: z.string().min(1).max(5000) }))
      .mutation(async ({ ctx, input }) => {
        const job = await getProductionJobById(input.jobId);
        if (!job) throw new Error("Job not found");
        const project = await getProjectById(job.projectId);
        if (!project || project.userId !== ctx.user.id) throw new Error("Not authorized");
        const comment = await createReviewComment({ jobId: input.jobId, userId: ctx.user.id, role: "author", message: input.message });
        return comment;
      }),

    getComments: protectedProcedure
      .input(z.object({ jobId: z.number() }))
      .query(async ({ ctx, input }) => {
        const job = await getProductionJobById(input.jobId);
        if (!job) throw new Error("Job not found");
        const project = await getProjectById(job.projectId);
        if (!project || project.userId !== ctx.user.id) throw new Error("Not authorized");
        return getReviewCommentsByJob(input.jobId);
      }),
  }),

  // ─── AI Writing Assistant ─────────────────────────────────────────────────
  ai: router({
    generateCopy: protectedProcedure
      .input(z.object({
        type: z.enum(["back-cover-blurb", "author-bio", "catalog-description", "press-release", "marketing-email", "bisac-description", "toc-description", "study-note-summary", "devotional-intro", "foreword", "introduction", "copyright-page", "glossary"]),
        bookTitle: z.string().min(1).max(255),
        author: z.string().max(255).optional(),
        genre: z.string().max(128).optional(),
        synopsis: z.string().max(2000).optional(),
        tone: z.enum(["literary", "commercial", "academic", "inspirational", "devotional"]).optional(),
        wordCount: z.number().min(50).max(1500).optional(),
      }))
      .mutation(async ({ input }) => {
        const typeLabels: Record<string, string> = {
          "back-cover-blurb": "back-cover blurb",
          "author-bio": "author biography",
          "catalog-description": "library/bookstore catalog description",
          "press-release": "press release",
          "marketing-email": "marketing email",
          "bisac-description": "BISAC subject description",
          "toc-description": "table of contents description",
          "study-note-summary": "study note summary",
          "devotional-intro": "devotional introduction",
          "foreword": "foreword",
          "introduction": "introduction",
          "copyright-page": "copyright page",
          "glossary": "glossary of key terms",
        };
        const defaultWordCounts: Record<string, number> = {
          "back-cover-blurb": 150,
          "author-bio": 100,
          "bisac-description": 100,
          "study-note-summary": 200,
          "devotional-intro": 250,
          "foreword": 500,
          "introduction": 600,
          "copyright-page": 150,
          "glossary": 400,
        };
        const targetWords = input.wordCount ?? (defaultWordCounts[input.type] || 200);
        const toneGuide = input.tone ? `Tone: ${input.tone}.` : "";
        const synopsisLine = input.synopsis ? `\nSynopsis / Key details: ${input.synopsis}` : "";

        const typeSpecificInstructions: Record<string, string> = {
          "foreword": "Write a foreword as if written by a respected colleague, mentor, or industry figure endorsing the book. Include a personal anecdote about how you know the author or their work, why this book matters, and what the reader will gain. Use first person. End with the endorser's perspective on why the reader should continue. Do NOT include a signature line or name — just the body text.",
          "introduction": "Write a book introduction from the author's perspective. Cover the motivation for writing the book, what the reader will learn or experience, how the book is organized, and who the intended audience is. Make it personal and engaging — this is the author speaking directly to the reader before the main content begins.",
          "copyright-page": `Write a professional copyright page for a published book. Include: copyright notice (© ${new Date().getFullYear()} [Author]), all-rights-reserved statement, a disclaimer if appropriate for the genre, publisher line (Easy Book Publishers), country of publication (United States), and a note about reproduction restrictions. Format each element on its own line. Do NOT invent an ISBN — leave a placeholder line reading "ISBN: [To be assigned]".`,
          "glossary": "Write a glossary of key terms relevant to this book's subject matter. Include 15–25 terms that a reader would encounter in the text. Format each entry as: the term in bold followed by a clear, concise definition (1–2 sentences). Arrange terms alphabetically. Choose terms that genuinely help the reader understand the book's content.",
        };

        const systemPrompt = `You are a professional publishing copywriter specializing in book marketing and editorial copy. Write compelling, polished text for publishers and authors. Output only the requested copy — no preamble, no labels, no meta-commentary.`;

        const extraInstruction = typeSpecificInstructions[input.type] ? `\n\nSpecific instructions: ${typeSpecificInstructions[input.type]}` : "";
        const userPrompt = `Write a ${typeLabels[input.type]} for the following book:\n\nTitle: ${input.bookTitle}\nAuthor: ${input.author ?? "(not specified)"}\nGenre: ${input.genre ?? "(not specified)"}${synopsisLine}\n\n${toneGuide}\nTarget length: approximately ${targetWords} words.${extraInstruction}`;

        let response;
        try {
          response = await invokeLLM({
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
          });
        } catch (llmErr: unknown) {
          const msg = llmErr instanceof Error ? llmErr.message : String(llmErr);
          console.error(`[AI generateCopy] LLM error for type="${input.type}", title="${input.bookTitle}": ${msg}`);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "The AI service is temporarily unavailable. Please try again in a moment.",
          });
        }

        const rawContent = response.choices?.[0]?.message?.content;
        const content = typeof rawContent === "string"
          ? rawContent
          : Array.isArray(rawContent)
            ? rawContent.filter((p: any) => p.type === "text").map((p: any) => p.text).join("\n")
            : "";

        if (!content.trim()) {
          console.warn(`[AI generateCopy] Empty response for type="${input.type}", title="${input.bookTitle}"`);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "The AI returned an empty response. Please try again.",
          });
        }

        return { content, type: input.type };
      }),
  }),

  // ─── Book / ISBN Lookup ─────────────────────────────────────────────────────
  book: router({
    /**
     * Looks up a book by ISBN using Open Library and Google Books APIs.
     * Returns title, author, publisher, page count, dimensions, cover image,
     * and the best-matching EBP production template.
     */
    lookupByIsbn: publicProcedure
      .input(z.object({
        isbn: z.string().min(10).max(17),
      }))
      .query(async ({ input }) => {
        try {
          return await lookupByIsbn(input.isbn);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          const isNotFound = message.toLowerCase().includes("no book found") || message.toLowerCase().includes("not found");
          const isInvalidIsbn = message.toLowerCase().includes("invalid isbn");
          throw new TRPCError({
            code: isInvalidIsbn ? "BAD_REQUEST" : isNotFound ? "NOT_FOUND" : "INTERNAL_SERVER_ERROR",
            message,
            cause: err instanceof Error ? err : new Error(message),
          });
        }
      }),
  }),

  // ─── Contact Form ─────────────────────────────────────────────────────────
  contact: router({
    /**
     * Public procedure — anyone can submit the contact form.
     * Saves the submission to the DB (for audit) and fires an owner notification.
     * Returns { success: true } on success; throws TRPCError on validation failure.
     */
    send: publicProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required").max(255),
        email: z.string().email("Please enter a valid email address").max(320),
        subject: z.string().min(1, "Subject is required").max(255),
        message: z.string().min(10, "Message must be at least 10 characters").max(5000),
      }))
      .mutation(async ({ input }) => {
        // 1. Persist to DB so no submission is ever lost
        let submission;
        try {
          submission = await createContactSubmission({
            name: input.name,
            email: input.email,
            subject: input.subject,
            message: input.message,
            notified: 0,
          });
        } catch (dbErr) {
          const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
          console.error("[Contact] Failed to save submission to DB:", msg);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unable to save your message. Please try again.",
          });
        }

        // 2. Notify the project owner via the Manus notification service
        const notificationContent = [
          `From: ${input.name} <${input.email}>`,
          `Subject: ${input.subject}`,
          ``,
          input.message,
          ``,
          `---`,
          `Submitted at: ${new Date().toISOString()}`,
          `Submission ID: #${submission.id}`,
          `Reply to: ${input.email}`,
        ].join("\n");

        let notified = false;
        try {
          notified = await notifyOwner({
            title: `Contact Form: ${input.subject}`,
            content: notificationContent,
          });
        } catch (notifyErr) {
          // Non-fatal: submission is already saved to DB
          console.warn("[Contact] Owner notification failed (submission saved):", notifyErr);
        }

        // 3. Update the notified flag if delivery succeeded
        if (notified) {
          try {
            const { getDb } = await import("./db");
            const db = await getDb();
            if (db) {
              const { eq } = await import("drizzle-orm");
              const { contactSubmissions } = await import("../drizzle/schema");
              await db.update(contactSubmissions)
                .set({ notified: 1 })
                .where(eq(contactSubmissions.id, submission.id));
            }
          } catch {
            // Non-fatal
          }
        }

        console.log(
          `[Contact] Submission #${submission.id} from ${input.email} → info@easybookpublishers.com — notified: ${notified}`
        );

        return { success: true, submissionId: submission.id };
      }),
  }),

  // ─── Guided Prompts ───────────────────────────────────────────────────────
  prompts: router({
    /**
     * Returns the ProjectPromptContext for a given project so the client
     * can compute next-step suggestions using the shared prompt engine.
     */
    getContext: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) throw new Error("Not found");

        const steps = await getStepStatusesByProject(input.projectId);
        const jobs = await getProductionJobsByProject(input.projectId);
        const dueDates = await getDueDatesByProject(input.projectId);

        const completedStepCount = steps.filter(s => s.status === "complete").length;
        const totalStepCount = steps.length;
        const hasCompletedJob = jobs.some(j => j.status === "complete" || j.status === "pending_review" || j.status === "approved");
        const failedJob = jobs.find(j => j.status === "error");
        const hasManuscript = jobs.length > 0;

        return {
          hasProjects: true,
          projectId: input.projectId,
          projectTitle: project.title,
          hasBibleSpecs: !!(project.bibleEditionType || project.bibleTranslation),
          hasSpineCalc: false, // Spine calc is client-side only; default false
          hasCoverSpec: false, // Cover spec is client-side only; default false
          hasIsbn: false,      // ISBN is client-side only; default false
          hasManuscript,
          hasCompletedJob,
          hasFailedJob: !!failedJob,
          failedJobId: failedJob?.id,
          completedStepCount,
          totalStepCount,
          hasTimeline: dueDates.length > 0,
          overallPhase: hasCompletedJob ? "distribution" : hasManuscript ? "production" : project.bibleEditionType ? "design" : "setup",
        };
      }),
  }),

  activity: router({
    recent: protectedProcedure.query(async ({ ctx }) => {
      return getRecentActivity(ctx.user.id);
    }),
  }),

  wizard: router({
    saveAnswers: protectedProcedure
      .input(z.object({
        answers: z.record(z.string(), z.unknown()),
      }))
      .mutation(async ({ ctx, input }) => {
        return saveWizardAnswers(ctx.user.id, input.answers);
      }),

    getAnswers: protectedProcedure
      .query(async ({ ctx }) => {
        return getWizardAnswers(ctx.user.id) ?? null;
      }),
  }),

  dashboard: router({
    stats: protectedProcedure.query(async ({ ctx }) => {
      return getDashboardStats(ctx.user.id);
    }),
  }),

  account: (() => {
    const emailCooldowns = new Map<string, number>();
    const EMAIL_COOLDOWN_MS = 120_000;
    const pollingNonces = new Map<string, { email: string; expiresAt: number }>();
    const loginAttempts = new Map<string, { count: number; blockedUntil: number }>();
    const MAX_LOGIN_ATTEMPTS = 5;
    const LOGIN_BLOCK_MS = 300_000;

    function checkLoginThrottle(email: string) {
      const key = email.toLowerCase();
      const attempt = loginAttempts.get(key);
      if (attempt && Date.now() < attempt.blockedUntil) {
        const waitMins = Math.ceil((attempt.blockedUntil - Date.now()) / 60000);
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Too many login attempts. Please try again in ${waitMins} minute${waitMins > 1 ? 's' : ''}.` });
      }
    }

    function recordLoginFailure(email: string) {
      const key = email.toLowerCase();
      const attempt = loginAttempts.get(key) ?? { count: 0, blockedUntil: 0 };
      attempt.count += 1;
      if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
        attempt.blockedUntil = Date.now() + LOGIN_BLOCK_MS;
        attempt.count = 0;
      }
      loginAttempts.set(key, attempt);
    }

    function clearLoginFailures(email: string) {
      loginAttempts.delete(email.toLowerCase());
    }

    function checkEmailCooldown(email: string) {
      const lastSent = emailCooldowns.get(email.toLowerCase());
      if (lastSent && Date.now() - lastSent < EMAIL_COOLDOWN_MS) {
        const waitSecs = Math.ceil((EMAIL_COOLDOWN_MS - (Date.now() - lastSent)) / 1000);
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Please wait ${waitSecs} seconds before requesting another email.` });
      }
    }
    function markEmailSent(email: string) {
      emailCooldowns.set(email.toLowerCase(), Date.now());
    }

    return router({
    register: publicProcedure
      .input(z.object({
        name: z.string().min(1).max(200),
        email: z.string().email().max(320),
        agreedToTerms: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        if (!input.agreedToTerms) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "You must agree to the Privacy Policy & Terms of Service" });
        }

        const existing = await getUserByEmail(input.email);
        if (existing?.emailConfirmed) {
          const pollNonce = nanoid(32);
          pollingNonces.set(pollNonce, { email: input.email.toLowerCase(), expiresAt: Date.now() + 30 * 60 * 1000 });
          return { status: "already_confirmed" as const, pollNonce };
        }

        checkEmailCooldown(input.email);

        const token = nanoid(48);
        const user = await createEmailUser({
          name: input.name,
          email: input.email,
          confirmToken: token,
          termsAcceptedAt: new Date(),
        });

        const isDev = process.env.NODE_ENV === "development";
        if (isDev) {
          console.log(`[Email Confirmation][DEV] User ${input.email} → /confirm-email?token=${token}`);
        }

        try {
          await sendConfirmationEmail(input.email, token, input.name);
          markEmailSent(input.email);
        } catch (emailErr) {
          console.error("[Email] Failed to send confirmation:", emailErr);
          if (!isDev) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send confirmation email. Please try again." });
          }
        }

        const pollNonce = nanoid(32);
        pollingNonces.set(pollNonce, { email: input.email.toLowerCase(), expiresAt: Date.now() + 30 * 60 * 1000 });
        return { status: "confirmation_needed" as const, userId: user.id, pollNonce, ...(isDev ? { confirmUrl: `/confirm-email?token=${token}` } : {}) };
      }),

    confirmEmail: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const checkoutToken = nanoid(64);
        const user = await confirmUserEmail(input.token, checkoutToken);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or expired confirmation token" });
        }
        return { success: true, checkoutToken, email: user.email };
      }),

    resendConfirmation: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const existing = await getUserByEmail(input.email);
        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "No account found with that email" });
        }
        if (existing.emailConfirmed) {
          const pollNonce = nanoid(32);
          pollingNonces.set(pollNonce, { email: input.email.toLowerCase(), expiresAt: Date.now() + 30 * 60 * 1000 });
          return { status: "already_confirmed" as const, pollNonce };
        }

        checkEmailCooldown(input.email);

        const token = nanoid(48);
        await createEmailUser({
          name: existing.name ?? "",
          email: input.email,
          confirmToken: token,
        });

        const isDev = process.env.NODE_ENV === "development";
        if (isDev) {
          console.log(`[Email Confirmation][DEV][RESEND] User ${input.email} → /confirm-email?token=${token}`);
        }

        try {
          await sendConfirmationEmail(input.email, token, existing.name ?? "");
          markEmailSent(input.email);
        } catch (emailErr) {
          console.error("[Email] Failed to resend confirmation:", emailErr);
          if (!isDev) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send confirmation email. Please try again." });
          }
        }

        const pollNonce = nanoid(32);
        pollingNonces.set(pollNonce, { email: input.email.toLowerCase(), expiresAt: Date.now() + 30 * 60 * 1000 });
        return { status: "resent" as const, pollNonce, ...(isDev ? { confirmUrl: `/confirm-email?token=${token}` } : {}) };
      }),

    checkEmailStatus: publicProcedure
      .input(z.object({ pollNonce: z.string() }))
      .mutation(async ({ input }) => {
        const nonceData = pollingNonces.get(input.pollNonce);
        if (!nonceData || Date.now() > nonceData.expiresAt) {
          return { confirmed: false, checkoutToken: null };
        }
        const user = await getUserByEmail(nonceData.email);
        if (!user) {
          return { confirmed: false, checkoutToken: null };
        }
        if (user.emailConfirmed && user.checkoutToken) {
          pollingNonces.delete(input.pollNonce);
          return { confirmed: true, checkoutToken: user.checkoutToken };
        }
        return { confirmed: false, checkoutToken: null };
      }),

    sendLoginLink: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const user = await getUserByEmail(input.email);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "No account found with that email. Please sign up first." });
        }

        checkEmailCooldown(input.email);

        const token = nanoid(48);
        await setLoginToken(user.id, token);

        const isDev = process.env.NODE_ENV === "development";
        if (isDev) {
          console.log(`[Login Link][DEV] User ${input.email} → /api/auth/magic-login?token=${token}`);
        }

        try {
          await sendLoginEmail(input.email, token, user.name ?? "");
          markEmailSent(input.email);
        } catch (emailErr) {
          console.error("[Email] Failed to send login link:", emailErr);
          if (!isDev) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send login email. Please try again." });
          }
        }

        return { sent: true };
      }),

    loginWithPassword: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        checkLoginThrottle(input.email);
        const bcrypt = await import("bcryptjs");
        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          recordLoginFailure(input.email);
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
        }
        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) {
          recordLoginFailure(input.email);
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password." });
        }
        clearLoginFailures(input.email);
        const sessionToken = nanoid(64);
        await createSession(user.id, sessionToken);
        ctx.res.cookie("ebp_session", sessionToken, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
        });
        return { success: true };
      }),

    setPassword: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8).max(128),
        checkoutToken: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const user = await getUserByCheckoutToken(input.checkoutToken);
        if (!user || user.email?.toLowerCase() !== input.email.toLowerCase()) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Invalid credentials. Cannot set password." });
        }
        if (!user.emailConfirmed) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Please confirm your email before setting a password." });
        }
        const bcrypt = await import("bcryptjs");
        const hash = await bcrypt.hash(input.password, 12);
        await setUserPassword(user.id, hash);
        return { success: true };
      }),

    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        checkEmailCooldown(input.email);
        markEmailSent(input.email);

        const user = await getUserByEmail(input.email);
        if (!user) {
          return { sent: true };
        }

        const token = nanoid(48);
        await setPasswordResetToken(user.id, token);

        const isDev = process.env.NODE_ENV === "development";
        if (isDev) {
          console.log(`[Password Reset][DEV] User ${input.email} → /reset-password?token=${token}`);
        }

        try {
          await sendPasswordResetEmail(input.email, token, user.name ?? "");
        } catch (emailErr) {
          console.error("[Email] Failed to send password reset:", emailErr);
          if (!isDev) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to send password reset email. Please try again." });
          }
        }

        return { sent: true };
      }),

    resetPassword: publicProcedure
      .input(z.object({
        token: z.string().min(1),
        password: z.string().min(8).max(128),
      }))
      .mutation(async ({ input }) => {
        const user = await getUserByPasswordResetToken(input.token);
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Invalid or expired reset link. Please request a new one." });
        }
        if (user.passwordResetTokenExpiresAt && new Date(user.passwordResetTokenExpiresAt) < new Date()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "This reset link has expired. Please request a new one." });
        }

        const bcrypt = await import("bcryptjs");
        const hash = await bcrypt.hash(input.password, 12);
        await setUserPassword(user.id, hash);
        await clearPasswordResetToken(user.id);

        return { success: true };
      }),

    logout: publicProcedure
      .mutation(async ({ ctx }) => {
        if (ctx.user && ctx.user.openId !== "guest-default-user") {
          await clearSession(ctx.user.id);
        }
        return { success: true };
      }),

    checkEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const user = await getUserByEmail(input.email);
        if (!user) return { exists: false, confirmed: false };
        return { exists: true, confirmed: user.emailConfirmed };
      }),
  });
  })(),

  stripe: router({
    getPublishableKey: publicProcedure.query(async () => {
      try {
        return { key: await getStripePublishableKey() };
      } catch {
        return { key: null };
      }
    }),

    getPriceIds: publicProcedure.query(async () => {
      const stripe = await getUncachableStripeClient();
      const prices = await stripe.prices.list({ limit: 50, active: true, expand: ['data.product'] });
      const result: Record<string, Record<string, string>> = {};
      for (const p of prices.data) {
        const product = typeof p.product === 'string' ? null : p.product;
        if (!product || !product.active) continue;
        if (product.metadata?.app !== 'easy-book-publishers') continue;
        const planName = product.metadata?.planName;
        const billingCycle = p.metadata?.billingCycle;
        if (!planName || !billingCycle) continue;
        if (!result[planName]) result[planName] = {};
        result[planName][billingCycle] = p.id;
      }
      return result;
    }),

    getSubscription: protectedProcedure.query(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      return {
        plan: user.plan ?? "starter",
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
      };
    }),

    getOrders: protectedProcedure.query(async ({ ctx }) => {
      return getOrdersByUser(ctx.user.id);
    }),

    createCheckoutSession: publicProcedure
      .input(z.object({
        priceId: z.string(),
        billingCycle: z.enum(["monthly", "annual", "lifetime"]),
        planName: z.enum(["kdp_ready", "author_pro", "publisher"]),
        checkoutToken: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const stripe = await getUncachableStripeClient();

        const user = await getUserByCheckoutToken(input.checkoutToken);
        if (!user) throw new TRPCError({ code: "FORBIDDEN", message: "Invalid checkout token. Please verify your email first." });
        if (!user.emailConfirmed) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Email must be confirmed before checkout" });
        }
        if (!user.termsAcceptedAt) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You must accept the Terms of Service before checkout" });
        }

        const price = await stripe.prices.retrieve(input.priceId, { expand: ['product'] });
        if (!price.active) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Price is not active" });
        }

        const product = price.product as import('stripe').Stripe.Product;
        if (!product || typeof product === 'string' || !product.active) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid product" });
        }

        if (product.metadata?.app !== 'easy-book-publishers') {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid product for this application" });
        }

        if (product.metadata?.planName !== input.planName) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Price does not match requested plan" });
        }

        const priceBillingCycle = price.metadata?.billingCycle;
        if (priceBillingCycle && priceBillingCycle !== input.billingCycle) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Price does not match requested billing cycle" });
        }

        let customerId = user.stripeCustomerId;
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email ?? undefined,
            name: user.name ?? undefined,
            metadata: { userId: String(user.id), openId: user.openId },
          });
          customerId = customer.id;
          await updateUserStripeInfo(user.id, { stripeCustomerId: customerId });
        }

        const isLifetime = input.billingCycle === "lifetime";
        const host = ctx.req.get("host") || "localhost:5000";
        const protocol = ctx.req.protocol || "https";
        const baseUrl = `${protocol}://${host}`;

        const validatedPlanName = product.metadata.planName as "kdp_ready" | "author_pro" | "publisher";

        let validatedAffiliateCode: string | null = null;
        const rawRef = (ctx.req as any).cookies?.ebp_ref;
        if (rawRef && typeof rawRef === "string" && /^[a-z0-9-]{3,64}$/i.test(rawRef)) {
          const { getAffiliateByCode } = await import("./affiliateDb");
          const aff = await getAffiliateByCode(rawRef);
          if (aff && aff.status === "approved") {
            validatedAffiliateCode = rawRef;
          }
        }

        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ["card"],
          line_items: [{ price: input.priceId, quantity: 1 }],
          mode: isLifetime ? "payment" : "subscription",
          success_url: `${baseUrl}/dashboard?checkout=success&plan=${validatedPlanName}`,
          cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
          metadata: {
            userId: String(user.id),
            planName: validatedPlanName,
            billingCycle: input.billingCycle,
            ...(validatedAffiliateCode ? { affiliateCode: validatedAffiliateCode } : {}),
          },
          ...(isLifetime ? {} : {
            subscription_data: {
              metadata: {
                userId: String(user.id),
                planName: validatedPlanName,
              },
            },
          }),
        });

        if (!session.url) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create checkout session" });
        }

        return { url: session.url };
      }),

    createBillingPortal: protectedProcedure
      .mutation(async ({ ctx }) => {
        const stripe = await getUncachableStripeClient();
        const user = await getUserById(ctx.user.id);
        if (!user?.stripeCustomerId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "No billing account found" });
        }

        const host = ctx.req.get("host") || "localhost:5000";
        const protocol = ctx.req.protocol || "https";
        const baseUrl = `${protocol}://${host}`;

        const session = await stripe.billingPortal.sessions.create({
          customer: user.stripeCustomerId,
          return_url: `${baseUrl}/`,
        });

        return { url: session.url };
      }),

    getProducts: publicProcedure.query(async () => {
      try {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) return { products: [] };

        const result = await db.execute(sql`
          SELECT 
            p.id as product_id,
            p.name as product_name,
            p.description as product_description,
            p.metadata as product_metadata,
            pr.id as price_id,
            pr.unit_amount,
            pr.currency,
            pr.recurring,
            pr.metadata as price_metadata
          FROM stripe.products p
          LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
          WHERE p.active = true
          ORDER BY p.name, pr.unit_amount
        `);

        const productsMap = new Map<string, any>();
        for (const row of result.rows) {
          const r = row as any;
          if (!productsMap.has(r.product_id)) {
            productsMap.set(r.product_id, {
              id: r.product_id,
              name: r.product_name,
              description: r.product_description,
              metadata: r.product_metadata,
              prices: [],
            });
          }
          if (r.price_id) {
            productsMap.get(r.product_id).prices.push({
              id: r.price_id,
              unitAmount: r.unit_amount,
              currency: r.currency,
              recurring: r.recurring,
              metadata: r.price_metadata,
            });
          }
        }

        return { products: Array.from(productsMap.values()) };
      } catch {
        return { products: [] };
      }
    }),
  }),

  admin: (() => {
    const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
      if (!ctx.user?.isAdmin) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      return next();
    });

    return router({
      getAffiliatePayouts: adminProcedure.query(async () => {
        const { getAllAffiliates, getConversionsByAffiliate, getPayoutsByAffiliate } = await import("./affiliateDb");
        const allAffiliates = await getAllAffiliates();
        const results = await Promise.all(allAffiliates.map(async (aff) => {
          const conversions = await getConversionsByAffiliate(aff.id, 1000);
          const payouts = await getPayoutsByAffiliate(aff.id);
          const pendingConversions = conversions.filter(c => c.status === "pending" || c.status === "approved");
          return {
            id: aff.id,
            name: aff.name,
            email: aff.email,
            affiliateCode: aff.affiliateCode,
            paypalEmail: aff.paypalEmail,
            status: aff.status,
            totalClicks: aff.totalClicks,
            totalConversions: aff.totalConversions,
            totalEarnings: aff.totalEarnings,
            pendingEarnings: aff.pendingEarnings,
            createdAt: aff.createdAt,
            pendingConversions: pendingConversions.map(c => ({
              id: c.id,
              planName: c.planName,
              saleAmount: c.saleAmount,
              commissionAmount: c.commissionAmount,
              createdAt: c.createdAt,
            })),
            recentPayouts: payouts.slice(0, 10).map(p => ({
              id: p.id,
              amount: p.amount,
              status: p.status,
              processedAt: p.processedAt,
              createdAt: p.createdAt,
            })),
          };
        }));
        return results;
      }),

      recordPayout: adminProcedure
        .input(z.object({
          affiliateId: z.number(),
        }))
        .mutation(async ({ input }) => {
          const { markPayoutCompleted } = await import("./affiliateDb");
          const payout = await markPayoutCompleted(input.affiliateId);
          return { success: true, payoutId: payout?.id, amount: payout?.amount };
        }),
    });
  })(),

  affiliate: router({
    getMyAffiliate: protectedProcedure
      .query(async ({ ctx }) => {
        const { getAffiliateByUserId } = await import("./affiliateDb");
        const affiliate = await getAffiliateByUserId(ctx.user.id);
        if (!affiliate) return null;
        return { affiliateCode: affiliate.affiliateCode, name: affiliate.name, status: affiliate.status };
      }),

    submitApplication: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255),
        email: z.string().email().max(320),
        website: z.string().max(500).optional(),
        paypalEmail: z.string().email().max(320).optional(),
        promotionMethod: z.string().max(2000).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createAffiliate, getAffiliateByEmail } = await import("./affiliateDb");
        const existing = await getAffiliateByEmail(input.email);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "An affiliate application with this email already exists" });
        }

        const code = input.name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) + "-" + nanoid(8);
        const affiliate = await createAffiliate({
          userId: ctx.user.id,
          affiliateCode: code,
          name: input.name,
          email: input.email,
          website: input.website ?? null,
          paypalEmail: input.paypalEmail ?? null,
          promotionMethod: input.promotionMethod ?? null,
          status: "approved",
        });

        try {
          await sendAffiliateWelcomeEmail(input.email, input.name, affiliate.affiliateCode);
        } catch (emailErr) {
          console.error("[Affiliate] Failed to send welcome email:", emailErr);
        }

        try {
          await sendAffiliateNotificationToOwner(input.name, input.email, affiliate.affiliateCode);
        } catch (emailErr) {
          console.error("[Affiliate] Failed to send owner notification:", emailErr);
        }

        return { success: true, affiliateCode: affiliate.affiliateCode, affiliateId: affiliate.id };
      }),

    getDashboard: protectedProcedure
      .input(z.object({ affiliateCode: z.string() }))
      .query(async ({ ctx, input }) => {
        const { getAffiliateByCode, getAffiliateStats, getConversionsByAffiliate, getPayoutsByAffiliate, getDailyEarnings } = await import("./affiliateDb");
        const affiliate = await getAffiliateByCode(input.affiliateCode);
        if (!affiliate) throw new TRPCError({ code: "NOT_FOUND", message: "Affiliate not found" });

        if (affiliate.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this affiliate dashboard" });
        }

        const stats = await getAffiliateStats(affiliate.id);
        const conversions = await getConversionsByAffiliate(affiliate.id, 20);
        const payouts = await getPayoutsByAffiliate(affiliate.id);
        const dailyEarnings = await getDailyEarnings(affiliate.id, 30);

        return { affiliate, stats, conversions, payouts, dailyEarnings };
      }),

    trackClick: publicProcedure
      .input(z.object({
        code: z.string(),
        landingPage: z.string().optional(),
        referrer: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { getAffiliateByCode, recordClick } = await import("./affiliateDb");
        const affiliate = await getAffiliateByCode(input.code);
        if (!affiliate || affiliate.status !== "approved") return { success: false };

        const crypto = await import("crypto");
        const ip = ctx.req.ip || ctx.req.headers["x-forwarded-for"] || "unknown";
        const ipHash = crypto.createHash("sha256").update(String(ip)).digest("hex").slice(0, 16);

        await recordClick({
          affiliateId: affiliate.id,
          ipHash,
          userAgent: (ctx.req.headers["user-agent"] || "").slice(0, 500),
          referrerUrl: (input.referrer || "").slice(0, 1000) || null,
          landingPage: (input.landingPage || "").slice(0, 500) || null,
        });

        return { success: true };
      }),

    getMarketingAssets: protectedProcedure
      .input(z.object({ affiliateCode: z.string() }))
      .query(async ({ ctx, input }) => {
        const { getAffiliateByCode } = await import("./affiliateDb");
        const affiliate = await getAffiliateByCode(input.affiliateCode);
        if (!affiliate) throw new TRPCError({ code: "NOT_FOUND", message: "Affiliate not found" });
        if (affiliate.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to these marketing assets" });
        }

        const baseUrl = "https://easybookpublishers.replit.app";
        const refLink = `${baseUrl}/?ref=${input.affiliateCode}`;

        return {
          referralLink: refLink,
          textLinks: [
            { label: "Homepage", url: refLink },
            { label: "Pricing Page", url: `${baseUrl}/pricing?ref=${input.affiliateCode}` },
            { label: "Templates", url: `${baseUrl}/templates?ref=${input.affiliateCode}` },
            { label: "Auto-Produce", url: `${baseUrl}/auto-produce/0?ref=${input.affiliateCode}` },
          ],
          socialCopy: [
            `I've been using Easy Book Publishers for my self-publishing workflow and it's incredible. Professional typesetting, PDF/EPUB/IDML export, all in one place. Check it out: ${refLink}`,
            `Stop paying for Atticus + Vellum + IngramSpark separately. Easy Book Publishers does it all for less. ${refLink}`,
            `If you're self-publishing a book, you need to try Easy Book Publishers. Real print-ready output, 40+ templates, AI typesetting. ${refLink}`,
            `Just discovered Easy Book Publishers — it's like having a professional book designer on demand. Free to start: ${refLink}`,
          ],
          emailTemplate: `Subject: A better way to self-publish your book\n\nHi [Name],\n\nI wanted to share a tool I've been using for book production — Easy Book Publishers.\n\nIt handles everything from manuscript upload to print-ready PDF, EPUB, and InDesign IDML export. The AI typesetting is surprisingly good, and it's significantly cheaper than Atticus or Vellum.\n\nYou can start for free and upgrade when you're ready:\n${refLink}\n\nBest,\n[Your Name]`,
          bannerSizes: [
            { size: "728x90", label: "Leaderboard" },
            { size: "300x250", label: "Medium Rectangle" },
            { size: "160x600", label: "Wide Skyscraper" },
            { size: "320x50", label: "Mobile Banner" },
          ],
        };
      }),

    lookupByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        const { getAffiliateByCode } = await import("./affiliateDb");
        const affiliate = await getAffiliateByCode(input.code);
        if (!affiliate) return null;
        return { id: affiliate.id, name: affiliate.name, status: affiliate.status };
      }),
  }),
});

export type AppRouter = typeof appRouter;
