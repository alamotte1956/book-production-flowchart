import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import SiteFooter from "@/components/SiteFooter";

export default function Login() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"email" | "sent">("email");
  const [email, setEmail] = useState("");

  const loginMutation = trpc.account.sendLoginLink.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success") {
      toast.success("You're logged in!");
      navigate("/dashboard");
    }
    const error = params.get("error");
    if (error === "missing_token" || error === "invalid_token") {
      toast.error("Invalid or expired login link. Please request a new one.");
    } else if (error === "expired_token") {
      toast.error("This login link has expired. Please request a new one.");
    } else if (error === "server_error") {
      toast.error("Something went wrong. Please try again.");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await loginMutation.mutateAsync({ email: email.trim() });
      setStep("sent");
    } catch (err: any) {
      toast.error(err.message || "Failed to send login link. Please try again.");
    }
  };

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

      <div className="max-w-md mx-auto px-6 py-24">
        {step === "email" && (
          <div className="bg-white/80 border border-[#c9a96e]/20 rounded-xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <ShieldCheck className="w-10 h-10 text-[#c9a96e] mx-auto mb-3" />
              <h1 className="font-serif text-2xl text-[#1a1008]">Sign In</h1>
              <p className="text-[#5c4a2a] text-sm mt-1">
                Enter your email and we'll send you a sign-in link.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-[#3a2a14]">Email Address</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-white border-[#c9a96e]/30 focus:border-[#c9a96e]"
                />
              </div>
              <Button
                type="submit"
                disabled={loginMutation.isPending || !email.trim()}
                className="w-full bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold"
              >
                {loginMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</>
                ) : (
                  <><Mail className="w-4 h-4 mr-2" /> Send Sign-In Link</>
                )}
              </Button>
            </form>
          </div>
        )}

        {step === "sent" && (
          <div className="bg-white/80 border border-[#c9a96e]/20 rounded-xl p-8 shadow-sm text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="font-serif text-2xl text-[#1a1008] mb-2">Check Your Email</h1>
            <p className="text-[#5c4a2a]">
              We sent a sign-in link to <strong>{email}</strong>.
            </p>
            <p className="text-[#7a6e60] text-sm mt-3">
              Click the link in the email to sign in. The link expires in 15 minutes.
            </p>
            <Button
              variant="outline"
              onClick={() => setStep("email")}
              className="mt-6 border-[#c9a96e]/40 text-[#5c4a2a]"
            >
              Try a different email
            </Button>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
