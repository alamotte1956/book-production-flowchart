/**
 * Guided "What's Next?" Prompt Engine
 *
 * Evaluates the current state of a project and returns a prioritised list
 * of contextual next-step prompts. Each prompt has a title, description,
 * an action route, and an icon key so the UI can render it richly.
 *
 * Rules are evaluated in priority order — the first matching rule wins
 * for the primary prompt, but up to 3 prompts are returned for the panel.
 */

export type PromptIconKey =
  | "new_project"
  | "bible_studio"
  | "spine_calc"
  | "cover_designer"
  | "isbn"
  | "auto_produce"
  | "timeline"
  | "resources"
  | "checklist"
  | "download"
  | "retry"
  | "complete";

export interface NextPrompt {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  actionRoute: string;
  icon: PromptIconKey;
  priority: "high" | "medium" | "low";
}

export interface ProjectPromptContext {
  hasProjects: boolean;
  projectId?: number;
  projectTitle?: string;
  hasBibleSpecs: boolean;
  hasSpineCalc: boolean;
  hasCoverSpec: boolean;
  hasIsbn: boolean;
  hasManuscript: boolean;
  hasCompletedJob: boolean;
  hasFailedJob: boolean;
  failedJobId?: number;
  completedStepCount: number;
  totalStepCount: number;
  hasTimeline: boolean;
  overallPhase: "setup" | "design" | "production" | "distribution" | "complete";
}

/**
 * Returns up to 3 contextual next-step prompts based on the project state.
 * Prompts are ordered by priority (high → medium → low).
 */
export function getNextPrompts(ctx: ProjectPromptContext): NextPrompt[] {
  const prompts: NextPrompt[] = [];

  // ── No projects yet ──────────────────────────────────────────────────────
  if (!ctx.hasProjects) {
    return [
      {
        id: "create_first_project",
        title: "Create Your First Book Project",
        description:
          "Start by creating a project to track every production step from manuscript to shelf. All tools connect to your project.",
        actionLabel: "New Book Project",
        actionRoute: "/projects/new",
        icon: "new_project",
        priority: "high",
      },
    ];
  }

  const base = ctx.projectId ? `/projects/${ctx.projectId}` : "";

  // ── Bible specs not yet configured ───────────────────────────────────────
  if (!ctx.hasBibleSpecs) {
    prompts.push({
      id: "configure_bible_specs",
      title: "Configure Your Bible Edition Specs",
      description:
        "Open the Bible Design Studio to set trim size, typesetting style, paper grade, binding, and typefaces. These specs drive every downstream tool.",
      actionLabel: "Open Bible Studio",
      actionRoute: "/bible-studio",
      icon: "bible_studio",
      priority: "high",
    });
  }

  // ── Spine width not yet calculated ───────────────────────────────────────
  if (ctx.hasBibleSpecs && !ctx.hasSpineCalc) {
    prompts.push({
      id: "calculate_spine",
      title: "Calculate Your Spine Width",
      description:
        "Enter your page count, paper type, and binding method in the Spine Calculator to get the exact spine width needed for your cover file.",
      actionLabel: "Open Spine Calculator",
      actionRoute: "/spine-calculator",
      icon: "spine_calc",
      priority: "high",
    });
  }

  // ── Cover spec not yet generated ─────────────────────────────────────────
  if (ctx.hasSpineCalc && !ctx.hasCoverSpec) {
    prompts.push({
      id: "generate_cover_spec",
      title: "Generate Your Cover Spec Sheet",
      description:
        "Use the Cover Designer to calculate full-wrap dimensions (front + spine + back + bleed) and export a print-ready spec sheet for your cover designer.",
      actionLabel: "Open Cover Designer",
      actionRoute: "/cover-designer",
      icon: "cover_designer",
      priority: "high",
    });
  }

  // ── ISBN not yet assigned ─────────────────────────────────────────────────
  if (!ctx.hasIsbn) {
    prompts.push({
      id: "assign_isbn",
      title: "Assign an ISBN & Metadata",
      description:
        "Add your ISBN-13, LCCN, and BISAC codes in the ISBN Manager. Export ONIX 3.0 XML to submit to Ingram, Baker & Taylor, or your distributor.",
      actionLabel: "Open ISBN Manager",
      actionRoute: "/isbn-manager",
      icon: "isbn",
      priority: ctx.hasBibleSpecs ? "medium" : "low",
    });
  }

  // ── Manuscript uploaded but job failed ───────────────────────────────────
  if (ctx.hasFailedJob && ctx.failedJobId) {
    prompts.push({
      id: "retry_failed_job",
      title: "Retry Your Failed Production Job",
      description:
        "A previous Auto-Produce job failed. Check the error detail panel for the cause, then retry or upload a corrected manuscript file.",
      actionLabel: "View Failed Job",
      actionRoute: `${base}/auto-produce`,
      icon: "retry",
      priority: "high",
    });
  }

  // ── Manuscript not yet uploaded ───────────────────────────────────────────
  if (!ctx.hasManuscript && !ctx.hasFailedJob) {
    prompts.push({
      id: "upload_manuscript",
      title: "Upload Your Manuscript",
      description:
        "Upload your manuscript file (DOCX, TXT, PDF, or EPUB) to Auto-Produce. The AI pipeline will generate a typeset PDF, EPUB, and InDesign IDML package.",
      actionLabel: "Start Auto-Produce",
      actionRoute: `${base}/auto-produce`,
      icon: "auto_produce",
      priority: ctx.hasBibleSpecs ? "high" : "medium",
    });
  }

  // ── Job complete — download outputs ──────────────────────────────────────
  if (ctx.hasCompletedJob) {
    prompts.push({
      id: "download_outputs",
      title: "Download Your Production Files",
      description:
        "Your typeset PDF, EPUB, and InDesign IDML package are ready. Download them from the Auto-Produce page and send to your printer or distributor.",
      actionLabel: "Download Files",
      actionRoute: `${base}/auto-produce`,
      icon: "download",
      priority: "high",
    });
  }

  // ── Timeline not yet set ──────────────────────────────────────────────────
  if (!ctx.hasTimeline && ctx.hasProjects) {
    prompts.push({
      id: "set_timeline",
      title: "Set Your Production Timeline",
      description:
        "Add due dates to each production phase in the Timeline view. Deadlines help you stay on track from manuscript delivery to print date.",
      actionLabel: "Open Timeline",
      actionRoute: `${base}/timeline`,
      icon: "timeline",
      priority: "low",
    });
  }

  // ── Production checklist progress ────────────────────────────────────────
  if (ctx.totalStepCount > 0 && ctx.completedStepCount < ctx.totalStepCount) {
    const remaining = ctx.totalStepCount - ctx.completedStepCount;
    prompts.push({
      id: "advance_checklist",
      title: `Complete Your Production Checklist (${ctx.completedStepCount}/${ctx.totalStepCount} steps done)`,
      description: `You have ${remaining} production step${remaining === 1 ? "" : "s"} remaining. Open your project tracker to mark completed steps and upload required files for each stage.`,
      actionLabel: "Open Project Tracker",
      actionRoute: base || "/",
      icon: "checklist",
      priority: "medium",
    });
  }

  // ── All done ──────────────────────────────────────────────────────────────
  if (
    ctx.hasBibleSpecs &&
    ctx.hasSpineCalc &&
    ctx.hasCoverSpec &&
    ctx.hasIsbn &&
    ctx.hasCompletedJob &&
    ctx.completedStepCount === ctx.totalStepCount &&
    ctx.totalStepCount > 0
  ) {
    prompts.push({
      id: "all_complete",
      title: "Your Book Is Production-Ready!",
      description:
        "All specs are configured, outputs are generated, and your checklist is complete. Your book is ready for the printer and distributor.",
      actionLabel: "View Resources",
      actionRoute: "/resources",
      icon: "complete",
      priority: "high",
    });
  }

  // Sort by priority and return top 3
  const order = { high: 0, medium: 1, low: 2 };
  return prompts
    .sort((a, b) => order[a.priority] - order[b.priority])
    .slice(0, 3);
}
