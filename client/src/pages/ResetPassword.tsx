import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, CheckCircle2, KeyRound, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import SiteFooter from "@/components/SiteFooter";

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"request" | "sent" | "new-password" | "done">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState("");

  const requestMutation = trpc.account.requestPasswordReset.useMutation();
  const resetMutation = trpc.account.resetPassword.useMutation();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      setToken(t);
      setStep("new-password");
    }
  }, []);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await requestMutation.mutateAsync({ email: email.trim() });
      setStep("sent");
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email. Please try again.");
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || password !== confirmPassword) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    try {
      await resetMutation.mutateAsync({ token, password });
      setStep("done");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset password. The link may have expired.");
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
        {step === "request" && (
          <div className="bg-white/80 border border-[#c9a96e]/20 rounded-xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <KeyRound className="w-10 h-10 text-[#c9a96e] mx-auto mb-3" />
              <h1 className="font-serif text-2xl text-[#1a1008]">Forgot Password</h1>
              <p className="text-[#5c4a2a] text-sm mt-1">
                Enter your email and we'll send you a link to reset your password.
              </p>
            </div>
            <form onSubmit={handleRequest} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-[#3a2a14]">Email Address</Label>
                <Input
                  id="reset-email"
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
                disabled={requestMutation.isPending || !email.trim()}
                className="w-full bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold"
              >
                {requestMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Sending...</>
                ) : (
                  <><Mail className="w-4 h-4 mr-2" /> Send Reset Link</>
                )}
              </Button>
            </form>

            <div className="mt-4 pt-4 border-t border-[#c9a96e]/15 text-center">
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-[#8b6914] hover:text-[#c9a96e] underline"
              >
                Back to sign in
              </button>
            </div>
          </div>
        )}

        {step === "sent" && (
          <div className="bg-white/80 border border-[#c9a96e]/20 rounded-xl p-8 shadow-sm text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="font-serif text-2xl text-[#1a1008] mb-2">Check Your Email</h1>
            <p className="text-[#5c4a2a]">
              If an account exists for <strong>{email}</strong>, we've sent a password reset link.
            </p>
            <p className="text-[#7a6e60] text-sm mt-3">
              The link expires in 15 minutes. Check your spam folder if you don't see it.
            </p>
            <Button
              variant="outline"
              onClick={() => { setStep("request"); setEmail(""); }}
              className="mt-6 border-[#c9a96e]/40 text-[#5c4a2a]"
            >
              Try a different email
            </Button>
          </div>
        )}

        {step === "new-password" && (
          <div className="bg-white/80 border border-[#c9a96e]/20 rounded-xl p-8 shadow-sm">
            <div className="text-center mb-6">
              <KeyRound className="w-10 h-10 text-[#c9a96e] mx-auto mb-3" />
              <h1 className="font-serif text-2xl text-[#1a1008]">Set New Password</h1>
              <p className="text-[#5c4a2a] text-sm mt-1">
                Choose a new password for your account.
              </p>
            </div>
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-[#3a2a14]">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                    className="bg-white border-[#c9a96e]/30 focus:border-[#c9a96e] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a6e60] hover:text-[#3a2a14]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-[#3a2a14]">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="bg-white border-[#c9a96e]/30 focus:border-[#c9a96e]"
                />
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  Passwords do not match
                </div>
              )}
              <Button
                type="submit"
                disabled={resetMutation.isPending || !password.trim() || password !== confirmPassword || password.length < 8}
                className="w-full bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold"
              >
                {resetMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Resetting...</>
                ) : (
                  <><KeyRound className="w-4 h-4 mr-2" /> Reset Password</>
                )}
              </Button>
            </form>
          </div>
        )}

        {step === "done" && (
          <div className="bg-white/80 border border-[#c9a96e]/20 rounded-xl p-8 shadow-sm text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h1 className="font-serif text-2xl text-[#1a1008] mb-2">Password Updated</h1>
            <p className="text-[#5c4a2a]">
              Your password has been reset. You can now sign in with your new password.
            </p>
            <Button
              onClick={() => navigate("/login")}
              className="mt-6 bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold"
            >
              Go to Sign In
            </Button>
          </div>
        )}
      </div>

      <SiteFooter />
    </div>
  );
}
