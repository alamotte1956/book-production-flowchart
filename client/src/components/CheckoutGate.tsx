import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, CheckCircle2, Loader2, ShieldCheck, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CheckoutGateProps {
  open: boolean;
  onClose: () => void;
  onConfirmed: (checkoutToken: string) => void;
  planName: string;
}

export default function CheckoutGate({ open, onClose, onConfirmed, planName }: CheckoutGateProps) {
  const [step, setStep] = useState<"register" | "waiting" | "done">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [devConfirmUrl, setDevConfirmUrl] = useState<string | null>(null);
  const [pollNonce, setPollNonce] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const registerMutation = trpc.account.register.useMutation();
  const resendMutation = trpc.account.resendConfirmation.useMutation();
  const checkStatusMutation = trpc.account.checkEmailStatus.useMutation();

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (resendTimerRef.current) clearTimeout(resendTimerRef.current);
    };
  }, []);

  const startPolling = (nonce: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const result = await checkStatusMutation.mutateAsync({ pollNonce: nonce });
        if (result.confirmed && result.checkoutToken) {
          if (pollRef.current) clearInterval(pollRef.current);
          setStep("done");
          toast.success("Email confirmed! Proceeding to checkout...");
          setTimeout(() => onConfirmed(result.checkoutToken!), 800);
        }
      } catch {
      }
    }, 3000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    if (!agreedTerms) {
      toast.error("Please agree to the Privacy Policy & Terms of Service to continue.");
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        agreedToTerms: true,
      });

      if (result.status === "already_confirmed" && result.checkoutToken) {
        setStep("done");
        toast.success("Email already verified! Proceeding to checkout...");
        setTimeout(() => onConfirmed(result.checkoutToken), 800);
      } else {
        const nonce = (result as any).pollNonce ?? null;
        setPollNonce(nonce);
        setDevConfirmUrl((result as any).confirmUrl ?? null);
        setStep("waiting");
        setShowResend(false);
        resendTimerRef.current = setTimeout(() => setShowResend(true), 120000);
        if (nonce) startPolling(nonce);
        toast.success("Confirmation email sent! Check your inbox.");
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    }
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    try {
      const result = await resendMutation.mutateAsync({ email: email.trim() });
      if (result.status === "already_confirmed" && result.checkoutToken) {
        if (pollRef.current) clearInterval(pollRef.current);
        setStep("done");
        toast.success("Email already verified! Proceeding to checkout...");
        setTimeout(() => onConfirmed(result.checkoutToken), 800);
      } else {
        const nonce = (result as any).pollNonce ?? null;
        setPollNonce(nonce);
        setDevConfirmUrl((result as any).confirmUrl ?? null);
        setShowResend(false);
        if (resendTimerRef.current) clearTimeout(resendTimerRef.current);
        resendTimerRef.current = setTimeout(() => setShowResend(true), 120000);
        if (nonce) startPolling(nonce);
        toast.success("Confirmation email resent. Check your inbox.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to resend. Please try again.");
    }
  };

  const handleDevConfirm = async () => {
    if (!devConfirmUrl) return;
    const tokenMatch = devConfirmUrl.match(/token=([^&]+)/);
    if (!tokenMatch) return;
    try {
      const resp = await fetch(`/api/trpc/account.confirmEmail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ json: { token: tokenMatch[1] } }),
      });
      const data = await resp.json();
      if (data?.result?.data?.json?.success) {
        if (pollRef.current) clearInterval(pollRef.current);
        setStep("done");
        toast.success("Email confirmed! Proceeding to checkout...");
        setTimeout(() => onConfirmed(data.result.data.json.checkoutToken), 800);
      }
    } catch {
      toast.error("Auto-confirm failed.");
    }
  };

  const handleClose = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (resendTimerRef.current) clearTimeout(resendTimerRef.current);
    setStep("register");
    setName("");
    setEmail("");
    setAgreedTerms(false);
    setDevConfirmUrl(null);
    setPollNonce(null);
    setShowResend(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md bg-[#f3efe6] border-[#c9a96e]/30">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-[#1a1008] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#c9a96e]" />
            {step === "register" && "Create Your Account"}
            {step === "waiting" && "Check Your Email"}
            {step === "done" && "Email Confirmed!"}
          </DialogTitle>
          <DialogDescription className="text-[#5c4a2a]">
            {step === "register" && `An email-confirmed account is required to purchase the ${planName} plan.`}
            {step === "waiting" && "Click the confirmation link in the email we just sent you."}
            {step === "done" && "Your email is verified. Redirecting to secure checkout..."}
          </DialogDescription>
        </DialogHeader>

        {step === "register" && (
          <form onSubmit={handleRegister} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="gate-name" className="text-[#3a2a14]">Full Name</Label>
              <Input
                id="gate-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="bg-white border-[#c9a96e]/30 focus:border-[#c9a96e]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gate-email" className="text-[#3a2a14]">Email Address</Label>
              <Input
                id="gate-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="bg-white border-[#c9a96e]/30 focus:border-[#c9a96e]"
              />
            </div>
            <div className="flex items-start gap-2">
              <Checkbox
                id="gate-terms"
                checked={agreedTerms}
                onCheckedChange={(checked) => setAgreedTerms(checked === true)}
                className="mt-0.5 border-[#c9a96e]/50 data-[state=checked]:bg-[#c9a96e] data-[state=checked]:border-[#c9a96e]"
              />
              <Label htmlFor="gate-terms" className="text-sm text-[#5c4a2a] leading-relaxed cursor-pointer">
                I agree to the{" "}
                <a href="/privacy-terms" target="_blank" className="text-[#8b6914] underline hover:text-[#c9a96e]">
                  Privacy Policy & Terms of Service
                </a>
              </Label>
            </div>
            <Button
              type="submit"
              disabled={registerMutation.isPending || !name.trim() || !email.trim() || !agreedTerms}
              className="w-full bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold"
            >
              {registerMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating Account...</>
              ) : (
                <><Mail className="w-4 h-4 mr-2" /> Create Account & Verify Email</>
              )}
            </Button>
          </form>
        )}

        {step === "waiting" && (
          <div className="space-y-4 mt-2">
            <div className="rounded-lg bg-[#c9a96e]/10 border border-[#c9a96e]/20 p-4 text-center">
              <Mail className="w-10 h-10 text-[#c9a96e] mx-auto mb-3" />
              <p className="text-sm text-[#5c4a2a]">
                We sent a confirmation email to <strong className="text-[#1a1008]">{email}</strong>
              </p>
              <p className="text-xs text-[#5c4a2a]/70 mt-1">
                Click the link in the email. This page will update automatically.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-[#5c4a2a]/70">
              <Loader2 className="w-4 h-4 animate-spin text-[#c9a96e]" />
              Waiting for confirmation...
            </div>

            {devConfirmUrl && (
              <Button
                type="button"
                onClick={handleDevConfirm}
                variant="outline"
                className="w-full border-green-500/40 text-green-700 hover:bg-green-50"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Quick Confirm (Dev Mode)
              </Button>
            )}

            {showResend && (
              <Button
                type="button"
                variant="outline"
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="w-full border-[#c9a96e]/40 text-[#5c4a2a] hover:bg-[#c9a96e]/10"
              >
                {resendMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Resending...</>
                ) : (
                  <><RefreshCw className="w-4 h-4 mr-2" /> Resend Confirmation Email</>
                )}
              </Button>
            )}

            <p className="text-xs text-center text-[#5c4a2a]/50">
              Don't see it? Check your spam folder.
            </p>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center py-6 gap-3">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
            <p className="text-[#3a2a14] font-medium">Redirecting to Stripe checkout...</p>
            <Loader2 className="w-5 h-5 animate-spin text-[#c9a96e]" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
