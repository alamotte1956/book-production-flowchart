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
  updateProjectDeadline, updateProjectGenre, updateProjectBibleSpecs,
  createProductionJob, getProductionJobsByProject, getProductionJobById, updateProductionJob,
} from "./db";
import { parseManuscript } from "./manuscriptParser";
import { produceBook } from "./typesettingPipeline";
import { TYPESETTING_STYLES, TRIM_SIZES, getTrimSize, getTypesettingStyle } from "./typesettingStyles";
import { storagePut } from "./storage";
import { generateIdml } from "./idmlGenerator";

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
        bibleEditionType: z.string().max(64).optional(),
        bibleTranslation: z.string().max(32).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
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

  autoProduce: router({
    // Generate a one-page styled HTML preview for a given style + trim size
    preview: publicProcedure
      .input(z.object({
        styleId: z.string(),
        trimSizeId: z.string(),
      }))
      .query(({ input }) => {
        const trim = getTrimSize(input.trimSizeId);
        const style = getTypesettingStyle(input.styleId);

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
  <link href="${style.googleFontsUrl}" rel="stylesheet">
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
      }))
      .mutation(async ({ ctx, input }) => {
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

            await updateProductionJob(job.id, { wordCount: parsed.wordCount });

            // Step 2: Run the full AI typesetting pipeline (chapter detection + PDF + EPUB + IDML)
            const { pdfBuffer, epubBuffer, chapterCount, wordCount, parsedBook, trimSize: prodTrimSize, style: prodStyle } = await produceBook(
              parsed.text,
              {
                trimSizeId: input.trimSizeId,
                styleId: input.styleId,
                title: project.title,
                author: project.author ?? "Unknown Author",
              }
            );

            await updateProductionJob(job.id, {
              wordCount,
              chapterCount,
            });

            const updates: Record<string, unknown> = { status: "complete" };

            // Upload PDF if requested
            if (outputFormat === "both" || outputFormat === "pdf") {
              const pdfKey = `output/${input.projectId}/${job.id}-interior.pdf`;
              const { url: pdfUrl } = await storagePut(pdfKey, pdfBuffer, "application/pdf");
              updates.pdfUrl = pdfUrl;
              updates.pdfKey = pdfKey;
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
            });
            const idmlKey = `output/${input.projectId}/${job.id}-layout.idml`;
            const { url: idmlUrl } = await storagePut(idmlKey, idmlBuffer, "application/vnd.adobe.indesign-idml-package");
            updates.idmlUrl = idmlUrl;
            updates.idmlKey = idmlKey;

            await updateProductionJob(job.id, updates);
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[AutoProduce] Job ${job.id} failed:`, msg);
            await updateProductionJob(job.id, {
              status: "error",
              errorMessage: msg,
            });
          }
        })();

        return { jobId: job.id, status: "queued" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
