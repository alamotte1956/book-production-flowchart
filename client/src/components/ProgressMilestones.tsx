import {
  Check, Clock, Circle, BookOpen, Palette, Eye, Barcode, Truck, Rocket, PenTool,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type StepStatusType = "pending" | "complete" | "skipped";

interface StepStatusMap {
  [stepId: string]: { status: StepStatusType; notes: string | null };
}

interface Milestone {
  id: string;
  label: string;
  icon: LucideIcon;
  stepIds: string[];
  color: string;
}

const milestones: Milestone[] = [
  {
    id: "manuscript",
    label: "Manuscript Ready",
    icon: PenTool,
    stepIds: ["idea", "writing", "self-edit", "proposal", "review", "contract"],
    color: "#c9a96e",
  },
  {
    id: "editorial",
    label: "Editing Complete",
    icon: BookOpen,
    stepIds: ["dev-edit", "line-edit", "copyedit", "author-review"],
    color: "#2d4a3e",
  },
  {
    id: "typesetting",
    label: "Typesetting",
    icon: PenTool,
    stepIds: ["text-design", "typesetting"],
    color: "#6b4c8a",
  },
  {
    id: "review",
    label: "Review & Proofing",
    icon: Eye,
    stepIds: ["first-pass", "second-pass", "final-pass"],
    color: "#8b5e3c",
  },
  {
    id: "cover",
    label: "Cover Design",
    icon: Palette,
    stepIds: ["cover-design", "cover-print"],
    color: "#6b4c8a",
  },
  {
    id: "isbn",
    label: "ISBN & Metadata",
    icon: Barcode,
    stepIds: ["preflight", "indexing", "isbn"],
    color: "#4a6741",
  },
  {
    id: "distribution",
    label: "Distribution",
    icon: Truck,
    stepIds: ["paper", "printing", "binding", "quality", "warehouse", "distribute"],
    color: "#7a2e3a",
  },
  {
    id: "launch",
    label: "Launch",
    icon: Rocket,
    stepIds: ["marketing", "digital", "sales", "rights"],
    color: "#2d4a3e",
  },
];

function getMilestoneStatus(
  milestone: Milestone,
  statusMap: StepStatusMap
): "done" | "in-progress" | "upcoming" {
  const statuses = milestone.stepIds.map(
    (id) => statusMap[id]?.status || "pending"
  );
  const doneCount = statuses.filter(
    (s) => s === "complete" || s === "skipped"
  ).length;
  if (doneCount === statuses.length) return "done";
  if (doneCount > 0) return "in-progress";
  return "upcoming";
}

function getNextAction(
  milestone: Milestone,
  statusMap: StepStatusMap
): string | null {
  for (const id of milestone.stepIds) {
    const st = statusMap[id]?.status || "pending";
    if (st === "pending") {
      return id;
    }
  }
  return null;
}

export default function ProgressMilestones({
  statusMap,
}: {
  statusMap: StepStatusMap;
}) {
  const completedMilestones = milestones.filter(
    (m) => getMilestoneStatus(m, statusMap) === "done"
  ).length;
  const totalMilestones = milestones.length;
  const pct = Math.round((completedMilestones / totalMilestones) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mb-8"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#e8dfd0] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#c9a96e] to-[#e0c48a] flex items-center justify-center shadow-sm">
              <Rocket size={18} className="text-white" />
            </div>
            <div>
              <h3 className="font-serif text-base font-semibold text-[#3a2a1a]">
                Publishing Milestones
              </h3>
              <p className="text-xs text-[#7a6e60]">
                {completedMilestones} of {totalMilestones} milestones reached
              </p>
            </div>
          </div>
          <span className="text-lg font-serif font-bold text-[#c9a96e]">
            {pct}%
          </span>
        </div>

        <div className="relative">
          <div className="absolute left-[18px] top-4 bottom-4 w-0.5 bg-[#e8dfd0]" />

          <div className="absolute left-[18px] top-4 w-0.5 bg-gradient-to-b from-[#c9a96e] to-[#e0c48a] transition-all duration-700 ease-out"
            style={{
              height: `${totalMilestones > 1 ? (completedMilestones / (totalMilestones - 1)) * 100 : 0}%`,
              maxHeight: "calc(100% - 2rem)",
            }}
          />

          <div className="space-y-1">
            {milestones.map((milestone, idx) => {
              const status = getMilestoneStatus(milestone, statusMap);
              const Icon = milestone.icon;
              const nextStep = status === "in-progress" ? getNextAction(milestone, statusMap) : null;

              const doneCount = milestone.stepIds.filter(
                (id) =>
                  statusMap[id]?.status === "complete" ||
                  statusMap[id]?.status === "skipped"
              ).length;
              const totalCount = milestone.stepIds.length;

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.3 }}
                  className="relative flex items-start gap-4 py-2.5 pl-0"
                >
                  <div
                    className={`relative z-10 w-[37px] h-[37px] rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                      status === "done"
                        ? "bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-200"
                        : status === "in-progress"
                        ? "bg-white border-[#c9a96e] shadow-sm shadow-amber-100"
                        : "bg-[#f8f5ef] border-[#e0d8c8]"
                    }`}
                  >
                    {status === "done" ? (
                      <Check size={16} className="text-white" />
                    ) : status === "in-progress" ? (
                      <Icon size={16} style={{ color: milestone.color }} />
                    ) : (
                      <Circle size={14} className="text-[#c4b99a]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          status === "done"
                            ? "text-emerald-700"
                            : status === "in-progress"
                            ? "text-[#3a2a1a]"
                            : "text-[#a89880]"
                        }`}
                      >
                        {milestone.label}
                      </span>
                      {status === "done" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold">
                          Done
                        </span>
                      )}
                      {status === "in-progress" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-semibold flex items-center gap-1">
                          <Clock size={9} />
                          In Progress
                        </span>
                      )}
                    </div>

                    {status === "in-progress" && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 max-w-[120px] rounded-full bg-[#e8dfd0] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(doneCount / totalCount) * 100}%`,
                              backgroundColor: milestone.color,
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-[#8b7b6b]">
                          {doneCount}/{totalCount}
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
