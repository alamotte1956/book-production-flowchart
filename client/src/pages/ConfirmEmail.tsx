import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteFooter from "@/components/SiteFooter";

export default function ConfirmEmail() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [email, setEmail] = useState<string | null>(null);
  const confirmMutation = trpc.account.confirmEmail.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    confirmMutation.mutateAsync({ token }).then((result) => {
      setStatus("success");
      setEmail(result.email ?? null);
    }).catch(() => {
      setStatus("error");
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#f3efe6]">
      <nav className="sticky top-0 z-50 bg-[#1a1008]/90 backdrop-blur-sm border-b border-[#c9a96e]/15">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2.5">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663211654017/kGjPju6hKCvCsjZhgUHyqj/CDPlargelogo_25428631.PNG"
              alt="Easy Book Publishers"
              className="h-10 w-auto object-contain"
            />
            <span className="font-serif text-[#f5d98a] text-lg md:text-xl tracking-wide hidden sm:block">Easy Book Publishers</span>
          </button>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-[#c9a96e]" />
            <h1 className="font-serif text-2xl text-[#1a1008]">Verifying your email...</h1>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle2 className="w-16 h-16 text-green-600" />
            <h1 className="font-serif text-3xl text-[#1a1008]">Email Confirmed!</h1>
            <p className="text-[#5c4a2a] text-lg">
              {email ? `Your email ${email} has been verified.` : "Your email has been verified."}
            </p>
            <p className="text-[#5c4a2a]/90">
              You can now return to the pricing page to complete your purchase.
            </p>
            <Button
              onClick={() => navigate("/pricing")}
              className="mt-4 bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold px-8"
            >
              Go to Pricing
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="w-16 h-16 text-red-500" />
            <h1 className="font-serif text-3xl text-[#1a1008]">Verification Failed</h1>
            <p className="text-[#5c4a2a] text-lg">
              The confirmation link is invalid or has already been used.
            </p>
            <Button
              onClick={() => navigate("/pricing")}
              className="mt-4 bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold px-8"
            >
              Go to Pricing
            </Button>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
