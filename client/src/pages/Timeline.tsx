/**
 * Timeline & Dashboard Page
 * - Gantt-style timeline view showing all 30 steps with estimated durations
 * - Step-level start/target dates with visual schedule status
 * - Compact dashboard table for at-a-glance project overview
 * - Production deadline with risk warnings
 */

import { useState, useMemo, useCallback } from "react";
import { Link, useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { phases } from "@/data/flowchartData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft, Calendar, Clock, AlertTriangle, CheckCircle2,
  SkipForward, Circle, LayoutList, BarChart2, Target, ChevronDown, ChevronRight
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────

type ViewMode = "gantt" | "table";

// ─── Helpers ─────────────────────────────────────────────────────

function formatDate(ts: number | null | undefined): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateInput(ts: number | null | undefined): string {
  if (!ts) return "";
  return new Date(ts).toISOString().split("T")[0];
}

function parseDateInput(val: string): number | null {
  if (!val) return null;
  const d = new Date(val + "T12:00:00");
  return isNaN(d.getTime()) ? null : d.getTime();
}

function daysBetween(a: number, b: number): number {
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function scheduleStatus(
  targetDate: number | null | undefined,
  status: string
): "on-track" | "due-soon" | "overdue" | "complete" | "skipped" | "unscheduled" {
  if (status === "complete") return "complete";
  if (status === "skipped") return "skipped";
  if (!targetDate) return "unscheduled";
  const now = Date.now();
  const diff = daysBetween(now, targetDate);
  if (diff < 0) return "overdue";
  if (diff <= 7) return "due-soon";
  return "on-track";
}

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  "complete":    { label: "Complete",    color: "#2d7a4f", bg: "#edf7f2", icon: <CheckCircle2 size={12} /> },
  "skipped":     { label: "Skipped",     color: "#8b7b6b", bg: "#f5f0e8", icon: <SkipForward size={12} /> },
  "overdue":     { label: "Overdue",     color: "#c0392b", bg: "#fdf0ef", icon: <AlertTriangle size={12} /> },
  "due-soon":    { label: "Due Soon",    color: "#d68910", bg: "#fef9ec", icon: <Clock size={12} /> },
  "on-track":    { label: "On Track",    color: "#2471a3", bg: "#eaf4fb", icon: <Calendar size={12} /> },
  "unscheduled": { label: "Unscheduled", color: "#a89880", bg: "#faf6ef", icon: <Circle size={12} /> },
};

// ─── Component ───────────────────────────────────────────────────

export default function Timeline() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const projectId = parseInt(id ?? "0", 10);

  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set(phases.map(p => p.id)));
  const [editingStep, setEditingStep] = useState<string | null>(null);
  const [editingDeadline, setEditingDeadline] = useState(false);

  // ── Auth redirect
  if (!authLoading && !isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.project.get.useQuery(
    { projectId },
    { enabled: isAuthenticated && projectId > 0 }
  );

  const setDatesMutation = trpc.step.setDates.useMutation({
    onSuccess: () => { utils.project.get.invalidate({ projectId }); setEditingStep(null); },
    onError: (e) => toast.error(e.message),
  });

  const setDeadlineMutation = trpc.project_deadline.set.useMutation({
    onSuccess: () => { utils.project.get.invalidate({ projectId }); setEditingDeadline(false); },
    onError: (e) => toast.error(e.message),
  });

  // ── Build flat list of all steps with their status data
  const allSteps = useMemo(() => {
    if (!data) return [];
    const statusMap = new Map(data.statuses.map(s => [s.stepId, s]));
    return phases.flatMap(phase =>
      phase.steps.map(step => ({
        step,
        phase,
        status: statusMap.get(step.id) ?? null,
      }))
    );
  }, [data]);

  // ── Summary counts
  const summary = useMemo(() => {
    const total = allSteps.length;
    const complete = allSteps.filter(s => s.status?.status === "complete").length;
    const skipped = allSteps.filter(s => s.status?.status === "skipped").length;
    const overdue = allSteps.filter(s => scheduleStatus(s.status?.targetDate, s.status?.status ?? "pending") === "overdue").length;
    const dueSoon = allSteps.filter(s => scheduleStatus(s.status?.targetDate, s.status?.status ?? "pending") === "due-soon").length;
    return { total, complete, skipped, overdue, dueSoon, pending: total - complete - skipped };
  }, [allSteps]);

  // ── Gantt: compute bar widths relative to total estimated days
  const totalEstimatedDays = useMemo(() =>
    phases.flatMap(p => p.steps).reduce((sum, s) => sum + s.estimatedDays, 0), []);

  const togglePhase = useCallback((phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  }, []);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#faf6ef] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#c9a96e] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#8b7b6b]">Loading timeline…</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#faf6ef] flex items-center justify-center">
        <p className="text-[#8b7b6b]">Project not found.</p>
      </div>
    );
  }

  const { project } = data;
  const deadlineStatus = project.productionDeadline
    ? scheduleStatus(project.productionDeadline, "pending")
    : "unscheduled";

  return (
    <div className="min-h-screen bg-[#faf6ef]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-[#2a1a0a] text-[#f5efe0] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Button
            variant="ghost" size="icon"
            className="text-[#c9a96e] hover:bg-[#c9a96e]/10 shrink-0"
            onClick={() => navigate(`/project/${projectId}`)}
          >
            <ArrowLeft size={18} />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif text-base sm:text-lg truncate">{project.title}</h1>
            <p className="text-xs text-[#c9a96e]/70">Production Timeline</p>
          </div>

          {/* Production deadline */}
          <div className="hidden sm:flex items-center gap-2">
            {editingDeadline ? (
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const val = (e.currentTarget.querySelector("input") as HTMLInputElement).value;
                  setDeadlineMutation.mutate({ projectId, productionDeadline: parseDateInput(val) });
                }}
              >
                <input
                  type="date"
                  defaultValue={formatDateInput(project.productionDeadline)}
                  className="text-xs bg-[#3a2a1a] border border-[#c9a96e]/30 rounded px-2 py-1 text-[#f5efe0]"
                  autoFocus
                />
                <Button type="submit" size="sm" className="h-7 text-xs bg-[#c9a96e] text-[#2a1a0a] hover:bg-[#a07840]">
                  Save
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-[#c9a96e]"
                  onClick={() => setEditingDeadline(false)}>Cancel</Button>
              </form>
            ) : (
              <button
                onClick={() => setEditingDeadline(true)}
                className="flex items-center gap-1.5 text-xs text-[#c9a96e]/70 hover:text-[#c9a96e] transition-colors"
              >
                <Target size={13} />
                {project.productionDeadline
                  ? <span>Deadline: {formatDate(project.productionDeadline)}</span>
                  : <span>Set production deadline</span>
                }
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-1 bg-[#3a2a1a] rounded-lg p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${viewMode === "table" ? "bg-[#c9a96e] text-[#2a1a0a] font-medium" : "text-[#c9a96e]/60 hover:text-[#c9a96e]"}`}
            >
              <LayoutList size={12} /> Table
            </button>
            <button
              onClick={() => setViewMode("gantt")}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${viewMode === "gantt" ? "bg-[#c9a96e] text-[#2a1a0a] font-medium" : "text-[#c9a96e]/60 hover:text-[#c9a96e]"}`}
            >
              <BarChart2 size={12} /> Gantt
            </button>
          </div>
        </div>
      </header>

      {/* ── Summary bar ── */}
      <div className="bg-white border-b border-[#e8dfd0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-[#2d7a4f]">
            <CheckCircle2 size={13} /> <strong>{summary.complete}</strong> complete
          </div>
          <div className="flex items-center gap-1.5 text-[#8b7b6b]">
            <SkipForward size={13} /> <strong>{summary.skipped}</strong> skipped
          </div>
          <div className="flex items-center gap-1.5 text-[#a89880]">
            <Circle size={13} /> <strong>{summary.pending}</strong> pending
          </div>
          {summary.overdue > 0 && (
            <div className="flex items-center gap-1.5 text-[#c0392b]">
              <AlertTriangle size={13} /> <strong>{summary.overdue}</strong> overdue
            </div>
          )}
          {summary.dueSoon > 0 && (
            <div className="flex items-center gap-1.5 text-[#d68910]">
              <Clock size={13} /> <strong>{summary.dueSoon}</strong> due soon
            </div>
          )}
          {project.productionDeadline && deadlineStatus === "overdue" && (
            <div className="ml-auto flex items-center gap-1.5 text-[#c0392b] font-medium">
              <AlertTriangle size={13} /> Production deadline passed!
            </div>
          )}
          {project.productionDeadline && deadlineStatus === "due-soon" && (
            <div className="ml-auto flex items-center gap-1.5 text-[#d68910] font-medium">
              <Clock size={13} /> Deadline in {daysBetween(Date.now(), project.productionDeadline)} days
            </div>
          )}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {viewMode === "table" ? (
          /* ══ TABLE VIEW ══ */
          <div className="space-y-6">
            {phases.map(phase => {
              const phaseSteps = allSteps.filter(s => s.phase.id === phase.id);
              const phaseComplete = phaseSteps.filter(s => s.status?.status === "complete").length;
              const isExpanded = expandedPhases.has(phase.id);

              return (
                <div key={phase.id} className="bg-white rounded-xl border border-[#e8dfd0] overflow-hidden">
                  {/* Phase header */}
                  <button
                    onClick={() => togglePhase(phase.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#faf6ef] transition-colors text-left"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: phase.accentColor }}
                    >
                      {phase.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-serif text-sm text-[#3a2a1a]">{phase.title}</span>
                      <span className="ml-2 text-xs text-[#a89880]">{phaseComplete}/{phaseSteps.length} complete</span>
                    </div>
                    {/* Phase progress bar */}
                    <div className="hidden sm:flex items-center gap-2 w-32">
                      <div className="flex-1 h-1.5 bg-[#e8dfd0] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${phaseSteps.length ? (phaseComplete / phaseSteps.length) * 100 : 0}%`,
                            backgroundColor: phase.accentColor,
                          }}
                        />
                      </div>
                      <span className="text-xs text-[#a89880] w-8 text-right">
                        {phaseSteps.length ? Math.round((phaseComplete / phaseSteps.length) * 100) : 0}%
                      </span>
                    </div>
                    {isExpanded ? <ChevronDown size={14} className="text-[#a89880] shrink-0" /> : <ChevronRight size={14} className="text-[#a89880] shrink-0" />}
                  </button>

                  {/* Step rows */}
                  {isExpanded && (
                    <div className="border-t border-[#e8dfd0]">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-[#faf6ef] text-[#a89880] uppercase tracking-wide">
                            <th className="text-left px-4 py-2 font-semibold">Step</th>
                            <th className="text-left px-3 py-2 font-semibold hidden sm:table-cell">Est. Duration</th>
                            <th className="text-left px-3 py-2 font-semibold hidden md:table-cell">Start Date</th>
                            <th className="text-left px-3 py-2 font-semibold">Target Date</th>
                            <th className="text-left px-3 py-2 font-semibold">Status</th>
                            <th className="text-left px-3 py-2 font-semibold hidden lg:table-cell">Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {phaseSteps.map(({ step, status }, idx) => {
                            const sched = scheduleStatus(status?.targetDate, status?.status ?? "pending");
                            const style = STATUS_STYLES[sched];
                            const isEditingThis = editingStep === step.id;

                            return (
                              <tr
                                key={step.id}
                                className={`border-t border-[#f0e8dc] hover:bg-[#faf6ef]/50 transition-colors ${idx % 2 === 0 ? "" : "bg-[#fdfaf5]"}`}
                              >
                                {/* Step name */}
                                <td className="px-4 py-2.5">
                                  <span className="font-medium text-[#3a2a1a]">{step.title}</span>
                                </td>

                                {/* Estimated duration */}
                                <td className="px-3 py-2.5 text-[#a89880] hidden sm:table-cell">
                                  {step.estimatedDays >= 30
                                    ? `~${Math.round(step.estimatedDays / 30)} mo`
                                    : `${step.estimatedDays}d`}
                                </td>

                                {/* Start date */}
                                <td className="px-3 py-2.5 hidden md:table-cell">
                                  {isEditingThis ? (
                                    <input
                                      type="date"
                                      defaultValue={formatDateInput(status?.startDate)}
                                      className="border border-[#c9a96e]/40 rounded px-1.5 py-0.5 text-xs w-32"
                                      onChange={(e) => {
                                        setDatesMutation.mutate({
                                          projectId,
                                          stepId: step.id,
                                          startDate: parseDateInput(e.target.value),
                                        });
                                      }}
                                    />
                                  ) : (
                                    <button
                                      onClick={() => setEditingStep(step.id)}
                                      className="text-[#a89880] hover:text-[#c9a96e] transition-colors"
                                    >
                                      {status?.startDate ? formatDate(status.startDate) : <span className="text-[#d0c8bc]">Set date</span>}
                                    </button>
                                  )}
                                </td>

                                {/* Target date */}
                                <td className="px-3 py-2.5">
                                  {isEditingThis ? (
                                    <input
                                      type="date"
                                      defaultValue={formatDateInput(status?.targetDate)}
                                      className="border border-[#c9a96e]/40 rounded px-1.5 py-0.5 text-xs w-32"
                                      onChange={(e) => {
                                        setDatesMutation.mutate({
                                          projectId,
                                          stepId: step.id,
                                          targetDate: parseDateInput(e.target.value),
                                        });
                                      }}
                                    />
                                  ) : (
                                    <button
                                      onClick={() => setEditingStep(step.id)}
                                      className="text-[#a89880] hover:text-[#c9a96e] transition-colors"
                                    >
                                      {status?.targetDate ? formatDate(status.targetDate) : <span className="text-[#d0c8bc]">Set date</span>}
                                    </button>
                                  )}
                                </td>

                                {/* Schedule status */}
                                <td className="px-3 py-2.5">
                                  <span
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                                    style={{ color: style.color, backgroundColor: style.bg }}
                                  >
                                    {style.icon} {style.label}
                                  </span>
                                </td>

                                {/* Notes */}
                                <td className="px-3 py-2.5 text-[#8b7b6b] max-w-[200px] truncate hidden lg:table-cell">
                                  {status?.notes || <span className="text-[#d0c8bc]">—</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* ══ GANTT VIEW ══ */
          <div className="space-y-4">
            <p className="text-xs text-[#a89880] mb-2">Bar width represents estimated industry-standard duration relative to the full production timeline ({totalEstimatedDays} business days total).</p>
            {phases.map(phase => {
              const phaseSteps = allSteps.filter(s => s.phase.id === phase.id);
              const isExpanded = expandedPhases.has(phase.id);

              return (
                <div key={phase.id} className="bg-white rounded-xl border border-[#e8dfd0] overflow-hidden">
                  {/* Phase header */}
                  <button
                    onClick={() => togglePhase(phase.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#faf6ef] transition-colors text-left"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: phase.accentColor }}
                    >
                      {phase.number}
                    </div>
                    <span className="font-serif text-sm text-[#3a2a1a] flex-1">{phase.title}</span>
                    {isExpanded ? <ChevronDown size={14} className="text-[#a89880]" /> : <ChevronRight size={14} className="text-[#a89880]" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-[#e8dfd0] px-4 py-3 space-y-2">
                      {phaseSteps.map(({ step, status }) => {
                        const sched = scheduleStatus(status?.targetDate, status?.status ?? "pending");
                        const style = STATUS_STYLES[sched];
                        const barWidth = Math.max(2, (step.estimatedDays / totalEstimatedDays) * 100);

                        return (
                          <div key={step.id} className="flex items-center gap-3">
                            {/* Step name */}
                            <div className="w-44 shrink-0 text-xs text-[#3a2a1a] truncate font-medium">{step.title}</div>

                            {/* Gantt bar */}
                            <div className="flex-1 h-6 bg-[#f0e8dc] rounded-full overflow-hidden relative">
                              <div
                                className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                                style={{
                                  width: `${barWidth}%`,
                                  backgroundColor: status?.status === "complete"
                                    ? "#2d7a4f"
                                    : status?.status === "skipped"
                                    ? "#a89880"
                                    : sched === "overdue"
                                    ? "#c0392b"
                                    : sched === "due-soon"
                                    ? "#d68910"
                                    : phase.accentColor,
                                  opacity: status?.status === "skipped" ? 0.4 : 0.85,
                                }}
                              >
                                {barWidth > 8 && (
                                  <span className="text-[9px] text-white font-medium">
                                    {step.estimatedDays >= 30
                                      ? `~${Math.round(step.estimatedDays / 30)}mo`
                                      : `${step.estimatedDays}d`}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Status badge */}
                            <div
                              className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium w-24 justify-center"
                              style={{ color: style.color, backgroundColor: style.bg }}
                            >
                              {style.icon} {style.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Related Tools footer backlinks */}
      <div className="border-t border-[#e8dfd0] bg-[#faf6ef] px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs text-[#8b7b6b] mb-3 font-semibold uppercase tracking-wide">Other Self-Publishing Tools</p>
          <div className="flex flex-wrap gap-2">
            {[
              { href: "/bible-studio", label: "Bible Design Studio" },
              { href: "/spine-calculator", label: "Spine Calculator" },
              { href: "/cover-designer", label: "Cover Designer" },
              { href: "/isbn-manager", label: "ISBN & Metadata" },
              { href: "/auto-produce", label: "Auto-Produce" },
              { href: "/resources", label: "Resources Hub" },
              { href: "/guide", label: "User Guide" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-xs px-3 py-1.5 rounded-full border border-[#d4c8b4] text-[#5c3d2e] hover:bg-[#c9a96e]/10 hover:border-[#c9a96e]/50 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
