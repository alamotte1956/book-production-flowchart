import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface CheckoutGateProps {
  open: boolean;
  onClose: () => void;
  onConfirmed: (checkoutToken: string) => void;
  planName: string;
}

export default function CheckoutGate({ open, onClose, onConfirmed, planName }: CheckoutGateProps) {
  const [step, setStep] = useState<"register" | "confirm" | "done">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [confirmToken, setConfirmToken] = useState("");
  const [confirmUrl, setConfirmUrl] = useState<string | null>(null);

  const registerMutation = trpc.account.register.useMutation();
  const confirmMutation = trpc.account.confirmEmail.useMutation();

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
        setConfirmUrl((result as any).confirmUrl ?? null);
        setStep("confirm");
        toast.success("Check your email for a confirmation link.");
      }
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmToken.trim()) return;

    try {
      const result = await confirmMutation.mutateAsync({ token: confirmToken.trim() });
      if (result.success && result.checkoutToken) {
        setStep("done");
        toast.success("Email confirmed! Proceeding to checkout...");
        setTimeout(() => onConfirmed(result.checkoutToken), 800);
      }
    } catch (err: any) {
      toast.error(err.message || "Invalid or expired confirmation token. Please try again.");
    }
  };

  const handleClose = () => {
    setStep("register");
    setName("");
    setEmail("");
    setAgreedTerms(false);
    setConfirmToken("");
    setConfirmUrl(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-md bg-[#f3efe6] border-[#c9a96e]/30">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-[#1a1008] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#c9a96e]" />
            {step === "register" && "Create Your Account"}
            {step === "confirm" && "Confirm Your Email"}
            {step === "done" && "Email Confirmed!"}
          </DialogTitle>
          <DialogDescription className="text-[#5c4a2a]">
            {step === "register" && `An email-confirmed account is required to purchase the ${planName} plan.`}
            {step === "confirm" && "Enter the confirmation token to verify your email address."}
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

        {step === "confirm" && (
          <form onSubmit={handleConfirm} className="space-y-4 mt-2">
            <div className="rounded-lg bg-[#c9a96e]/10 border border-[#c9a96e]/20 p-3">
              <p className="text-sm text-[#5c4a2a]">
                A confirmation email has been sent to <strong>{email}</strong>.
                Enter the token from the email to verify your address.
              </p>
              {confirmUrl && (
                <a
                  href={confirmUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#8b6914] underline mt-2 block"
                >
                  Auto-confirm (dev mode only)
                </a>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="gate-token" className="text-[#3a2a14]">Confirmation Token</Label>
              <Input
                id="gate-token"
                value={confirmToken}
                onChange={(e) => setConfirmToken(e.target.value)}
                placeholder="Paste your confirmation token"
                required
                className="bg-white border-[#c9a96e]/30 focus:border-[#c9a96e]"
              />
            </div>
            <Button
              type="submit"
              disabled={confirmMutation.isPending || !confirmToken.trim()}
              className="w-full bg-[#c9a96e] hover:bg-[#b8944f] text-[#1a1008] font-semibold"
            >
              {confirmMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Verifying...</>
              ) : (
                <><CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Email</>
              )}
            </Button>
          </form>
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
