/**
 * Tests for autoProduce.preview endpoint
 * Verifies that the style preview query returns valid HTML for every
 * combination of typesetting style and trim size.
 */
import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { TYPESETTING_STYLES, TRIM_SIZES } from "./typesettingStyles";

// ─── Minimal mocks required by the router module ─────────────────────────────

vi.mock("./db", () => ({
  createProject: vi.fn(),
  getProjectsByUser: vi.fn(async () => []),
  getProjectById: vi.fn(async () => null),
  deleteProject: vi.fn(),
  getStepStatusesByProject: vi.fn(async () => []),
  upsertStepStatus: vi.fn(),
  upsertStepDates: vi.fn(),
  getFilesByProject: vi.fn(async () => []),
  createUploadedFile: vi.fn(),
  deleteUploadedFile: vi.fn(),
  getDueDatesByProject: vi.fn(async () => []),
  upsertPhaseDueDate: vi.fn(),
  deletePhaseDueDate: vi.fn(),
  updateProjectDeadline: vi.fn(),
  createProductionJob: vi.fn(),
  getProductionJobsByProject: vi.fn(async () => []),
  getProductionJobById: vi.fn(async () => null),
  updateProductionJob: vi.fn(),
}));

vi.mock("./manuscriptParser", () => ({
  parseManuscript: vi.fn(),
}));

vi.mock("./typesettingPipeline", () => ({
  produceBook: vi.fn(),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn(),
}));

// ─── Context helpers ──────────────────────────────────────────────────────────

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("autoProduce.preview", () => {
  it("returns HTML, styleLabel, trimLabel, and page dimensions for a valid style + trim", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.autoProduce.preview({
      styleId: "literary-fiction",
      trimSizeId: "6x9",
    });

    expect(result).toBeDefined();
    expect(typeof result.html).toBe("string");
    expect(result.html).toContain("<!DOCTYPE html>");
    expect(result.styleLabel).toBe("Literary Fiction");
    expect(result.trimLabel).toContain("6");
    expect(result.pageWidthPx).toBe(Math.round(6 * 96));
    expect(result.pageHeightPx).toBe(Math.round(9 * 96));
  });

  it("includes the correct Google Fonts link for the chosen style", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.autoProduce.preview({
      styleId: "self-help",
      trimSizeId: "5.5x8.5",
    });

    expect(result.html).toContain("fonts.googleapis.com");
    expect(result.html).toContain("Merriweather");
  });

  it("renders a drop-cap CSS rule for literary-fiction style", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.autoProduce.preview({
      styleId: "literary-fiction",
      trimSizeId: "6x9",
    });

    expect(result.html).toContain("drop-cap");
    expect(result.html).toContain("::first-letter");
  });

  it("does NOT render drop-cap CSS for commercial-fiction style", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.autoProduce.preview({
      styleId: "commercial-fiction",
      trimSizeId: "6x9",
    });

    expect(result.html).not.toContain("::first-letter");
  });

  it("falls back to default style (literary-fiction) for an unknown styleId", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.autoProduce.preview({
      styleId: "nonexistent-style",
      trimSizeId: "6x9",
    });

    // getTypesettingStyle falls back to index 0 = literary-fiction
    expect(result.styleLabel).toBe("Literary Fiction");
  });

  it("falls back to default trim size (6x9) for an unknown trimSizeId", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.autoProduce.preview({
      styleId: "literary-fiction",
      trimSizeId: "nonexistent-trim",
    });

    expect(result.trimLabel).toContain("6");
    expect(result.pageWidthPx).toBe(Math.round(6 * 96));
  });

  it("returns correct page dimensions for every trim size", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    for (const trim of TRIM_SIZES) {
      const result = await caller.autoProduce.preview({
        styleId: "literary-fiction",
        trimSizeId: trim.id,
      });

      expect(result.pageWidthPx).toBe(Math.round(trim.widthIn * 96));
      expect(result.pageHeightPx).toBe(Math.round(trim.heightIn * 96));
      expect(result.trimLabel).toBe(trim.label);
    }
  });

  it("returns valid HTML for every typesetting style", async () => {
    const caller = appRouter.createCaller(createPublicContext());

    for (const style of TYPESETTING_STYLES) {
      const result = await caller.autoProduce.preview({
        styleId: style.id,
        trimSizeId: "6x9",
      });

      expect(result.html).toContain("<!DOCTYPE html>");
      expect(result.html).toContain("</html>");
      expect(result.styleLabel).toBe(style.label);
      // Each preview should contain the sample chapter title
      expect(result.html).toContain("Chapter One");
    }
  });

  it("includes sample body text in the rendered HTML", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.autoProduce.preview({
      styleId: "narrative-nonfiction",
      trimSizeId: "5.5x8.5",
    });

    // Sample text from A Tale of Two Cities
    expect(result.html).toContain("best of times");
    expect(result.html).toContain("worst of times");
  });

  it("includes running header and footer in the rendered HTML", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.autoProduce.preview({
      styleId: "academic-textbook",
      trimSizeId: "7x10",
    });

    expect(result.html).toContain("running-header");
    expect(result.html).toContain("running-footer");
  });

  it("is accessible without authentication (publicProcedure)", async () => {
    // This test verifies the endpoint works with a null user context
    const caller = appRouter.createCaller(createPublicContext());

    // Should not throw even with no authenticated user
    await expect(
      caller.autoProduce.preview({ styleId: "poetry", trimSizeId: "5x8" })
    ).resolves.toBeDefined();
  });
});
