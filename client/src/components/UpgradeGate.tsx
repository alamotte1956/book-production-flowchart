import { type PlanFeature, usePlan } from "@/hooks/usePlan";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface UpgradeGateProps {
  feature: PlanFeature;
  children: React.ReactNode;
  inline?: boolean;
}

export function UpgradeGate({ feature, children, inline = false }: UpgradeGateProps) {
  const { canAccess, getFeatureLabel, getMinimumPlanLabel } = usePlan();
  const [, navigate] = useLocation();

  if (canAccess(feature)) {
    return <>{children}</>;
  }

  const label = getFeatureLabel(feature);
  const requiredPlan = getMinimumPlanLabel(feature);

  if (inline) {
    return (
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#c9a96e]/5 to-[#c9a96e]/10 border border-[#c9a96e]/20 rounded-xl">
        <div className="w-10 h-10 rounded-full bg-[#c9a96e]/15 flex items-center justify-center flex-shrink-0">
          <Lock size={18} className="text-[#c9a96e]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#2c1a00]">{label}</p>
          <p className="text-xs text-[#8b7b6b]">Available on {requiredPlan} and above</p>
        </div>
        <Button
          size="sm"
          onClick={() => navigate("/pricing")}
          className="bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] text-xs flex-shrink-0"
        >
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#c9a96e]/20 to-[#c9a96e]/5 flex items-center justify-center mx-auto mb-6">
          <Sparkles size={36} className="text-[#c9a96e]" />
        </div>
        <h2 className="font-serif text-2xl text-[#2c1a00] mb-3">
          Unlock {label}
        </h2>
        <p className="text-[#8b7b6b] text-sm mb-2">
          This feature is available on the <strong className="text-[#5c3d2e]">{requiredPlan}</strong> plan and above.
        </p>
        <p className="text-[#8b7b6b] text-xs mb-8">
          Upgrade to access AI-powered typesetting, KDP exports, production timelines, templates, and unlimited book projects.
        </p>
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => navigate("/pricing")}
            className="w-full bg-gradient-to-r from-[#c9a96e] to-[#b8944f] hover:from-[#d4b480] hover:to-[#c9a96e] text-[#1a1008] font-semibold py-3 shadow-md shadow-[#c9a96e]/15"
          >
            View Plans & Pricing
            <ArrowRight size={16} className="ml-2" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="w-full border-[#c9a96e]/30 text-[#5c3d2e] hover:bg-[#faf6ef]"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
