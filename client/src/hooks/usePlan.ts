import { useAuth } from "@/_core/hooks/useAuth";
import { useCallback, useMemo } from "react";

export type PlanFeature =
  | "ai_typesetting"
  | "kdp_export"
  | "timeline"
  | "templates"
  | "unlimited_projects"
  | "priority_support";

export type PlanName = "starter" | "kdp_ready" | "author_pro" | "publisher";

const PLAN_FEATURES: Record<PlanName, Set<PlanFeature>> = {
  starter: new Set(),
  kdp_ready: new Set([
    "ai_typesetting",
    "kdp_export",
    "templates",
  ]),
  author_pro: new Set([
    "ai_typesetting",
    "kdp_export",
    "timeline",
    "templates",
    "unlimited_projects",
  ]),
  publisher: new Set([
    "ai_typesetting",
    "kdp_export",
    "timeline",
    "templates",
    "unlimited_projects",
    "priority_support",
  ]),
};

const PROJECT_LIMITS: Record<PlanName, number> = {
  starter: 1,
  kdp_ready: 1,
  author_pro: Infinity,
  publisher: Infinity,
};

const FEATURE_LABELS: Record<PlanFeature, string> = {
  ai_typesetting: "AI Typesetting (PDF + EPUB)",
  kdp_export: "Amazon KDP-Ready Export",
  timeline: "Production Timeline",
  templates: "Book & Design Templates",
  unlimited_projects: "Unlimited Book Projects",
  priority_support: "Priority Email Support",
};

const MINIMUM_PLAN: Record<PlanFeature, PlanName> = {
  ai_typesetting: "kdp_ready",
  kdp_export: "kdp_ready",
  timeline: "author_pro",
  templates: "kdp_ready",
  unlimited_projects: "author_pro",
  priority_support: "publisher",
};

export function usePlan() {
  const { user } = useAuth();

  const plan: PlanName = (user?.plan as PlanName) ?? "starter";
  const isAdmin = !!(user as any)?.isAdmin;

  const canAccess = useCallback(
    (feature: PlanFeature) => isAdmin || PLAN_FEATURES[plan].has(feature),
    [plan, isAdmin]
  );

  return useMemo(
    () => ({
      plan: isAdmin ? "publisher" as PlanName : plan,
      canAccess,
      isAdmin,
      isStarter: !isAdmin && plan === "starter",
      isPro: isAdmin || plan === "author_pro",
      isPublisher: isAdmin || plan === "publisher",
      projectLimit: isAdmin ? Infinity : PROJECT_LIMITS[plan],
      getFeatureLabel: (f: PlanFeature) => FEATURE_LABELS[f],
      getMinimumPlan: (f: PlanFeature) => MINIMUM_PLAN[f],
      isKdpReady: plan === "kdp_ready",
      getMinimumPlanLabel: (f: PlanFeature) => {
        const p = MINIMUM_PLAN[f];
        return p === "kdp_ready" ? "KDP Ready" : p === "author_pro" ? "Author Pro" : "Publisher";
      },
    }),
    [plan, canAccess]
  );
}
