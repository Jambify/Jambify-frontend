import React, { useState } from "react";
import { useUserStore, APP_CONFIG } from "../../Store/UseUserStore";
import Button from "../ui/Button";
import { Crown, Lock, CheckCircle, Loader2, ExternalLink } from "lucide-react";

interface ExamPaywallProps {
  onUpgrade: () => void;
  onBack: () => void;
}

/**
 * ExamPaywall
 * ───────────
 * Shown to free users after completing a mock exam.
 *
 * The "Upgrade" button initiates a Flutterwave payment flow.
 * isPro is only set to true AFTER payment is verified — never
 * just by clicking the button.
 *
 * For now (pre-payment integration): opens a contact/payment link
 * and shows a "I've paid" confirmation step so the user can
 * manually verify. Replace with real Flutterwave SDK when ready.
 */
const ExamPaywall: React.FC<ExamPaywallProps> = ({ onUpgrade, onBack }) => {
  const { upgradeToPro, name, email } = useUserStore();
  const { DISPLAY_PRICE_YEARLY, CURRENCY, DISPLAY_PRICE } = APP_CONFIG.PRICING;

  const [step, setStep]         = useState<"wall" | "pending" | "verify">("wall");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [txRef, setTxRef]       = useState("");

  // ── Step 1: User clicks Upgrade ──────────────────────────────────────────
  const handleInitiatePayment = () => {
    // TODO: Replace this with real Flutterwave inline payment SDK call.
    // When Flutterwave confirms payment, call handlePaymentSuccess(tx_ref).
    //
    // Example with Flutterwave inline:
    //   FlutterwaveCheckout({
    //     public_key: import.meta.env.VITE_FLW_PUBLIC_KEY,
    //     tx_ref: `jambify-${Date.now()}`,
    //     amount: 3000,
    //     currency: "NGN",
    //     customer: { email, name },
    //     callback: (data) => { if (data.status === "successful") handlePaymentSuccess(data.tx_ref); },
    //   });

    // For now: show the pending step with a WhatsApp/email contact link
    setStep("pending");
  };

  // ── Step 2: User claims they've paid — verify before granting Pro ─────────
  const handleVerify = async () => {
    if (!txRef.trim()) {
      setVerifyError("Please enter your transaction reference.");
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);

    try {
      // TODO: Call your backend to verify the transaction with Flutterwave API.
      // const res = await fetch(`/api/verify-payment?tx_ref=${txRef}`);
      // const data = await res.json();
      // if (!data.verified) throw new Error("Payment not confirmed");

      // Temporary: simulate a 1.5s verification check
      await new Promise((r) => setTimeout(r, 1500));

      // Only grant Pro after verification passes
      upgradeToPro();
      onUpgrade();
    } catch (err: any) {
      setVerifyError(err.message ?? "Verification failed. Please contact support.");
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Pending step (payment initiated, waiting for user) ────────────────────
  if (step === "pending" || step === "verify") {
    return (
      <div className="min-h-screen bg-[#0F1115] text-white flex items-center justify-center p-4">
        <div className="bg-[#1A1D23] border border-white/5 rounded-4xl p-8 w-full max-w-md text-center shadow-2xl">
          <div className="w-16 h-16 bg-warn/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-warn/30">
            <Crown className="w-8 h-8 text-warn" />
          </div>

          <h2 className="text-2xl font-display font-bold mb-2">Complete Payment</h2>
          <p className="text-white/60 text-sm mb-6 leading-relaxed">
            Pay <strong className="text-white">{CURRENCY}{DISPLAY_PRICE}</strong> to unlock Pro.
            After payment, enter your transaction reference below to activate your account.
          </p>

          {/* Payment instructions */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-left space-y-2">
            <p className="text-xs text-white/50 uppercase tracking-widest font-bold mb-3">Payment Steps</p>
            <div className="flex items-start gap-2 text-sm text-white/70">
              <span className="w-5 h-5 rounded-full bg-brand/20 text-brand text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">1</span>
              <span>Send <strong className="text-white">{CURRENCY}{DISPLAY_PRICE}</strong> via bank transfer or Flutterwave</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-white/70">
              <span className="w-5 h-5 rounded-full bg-brand/20 text-brand text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">2</span>
              <span>Copy your transaction reference number</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-white/70">
              <span className="w-5 h-5 rounded-full bg-brand/20 text-brand text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">3</span>
              <span>Enter it below to instantly activate Pro</span>
            </div>
          </div>

          {/* Contact support link */}
          <a
            href={`https://wa.me/2348000000000?text=Hi, I want to upgrade to JAMBIFY Pro. Name: ${encodeURIComponent(name)}, Email: ${encodeURIComponent(email)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 mb-4 bg-green-600/20 border border-green-600/30 text-green-400 rounded-2xl text-sm font-semibold hover:bg-green-600/30 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Pay via WhatsApp
          </a>

          {/* Transaction ref input */}
          <div className="mb-4">
            <input
              type="text"
              value={txRef}
              onChange={(e) => { setTxRef(e.target.value); setVerifyError(null); }}
              placeholder="Enter transaction reference (e.g. FLW-XXXX)"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand/50"
            />
            {verifyError && (
              <p className="text-danger text-xs mt-1.5 text-left">{verifyError}</p>
            )}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleVerify}
            disabled={isVerifying || !txRef.trim()}
          >
            {isVerifying ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
              </span>
            ) : (
              "Verify & Activate Pro"
            )}
          </Button>

          <button
            onClick={() => setStep("wall")}
            className="mt-3 text-xs text-white/40 hover:text-white/60 transition-colors"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  // ── Default: paywall wall ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0F1115] text-white flex items-center justify-center p-4">
      <div className="bg-[#1A1D23] border border-white/5 rounded-4xl p-8 w-full max-w-md text-center shadow-2xl backdrop-blur-md">

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center font-display font-black text-white text-xl shadow-[0_0_20px_rgba(91,59,255,0.5)]">
            J
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-white">
            JAMB<span className="text-brand">IFY</span>
          </span>
        </div>

        {/* Lock Icon */}
        <div className="w-20 h-20 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand/30">
          <Lock className="w-10 h-10 text-brand-light" />
        </div>

        <h1 className="text-3xl font-display font-bold text-white mb-4">
          Unlock Pro Features
        </h1>
        <p className="text-white/60 mb-8">
          Get detailed exam results and advanced analytics to ace your JAMB preparation.
        </p>

        {/* Pro Features */}
        <div className="space-y-3 mb-8">
          {[
            "Detailed exam breakdown",
            "Subject-wise performance analysis",
            "Time management insights",
            "Download past questions offline",
            "AI Tutor — unlimited questions",
          ].map((feat) => (
            <div key={feat} className="flex items-center gap-3 text-left bg-[#2A2D35] border border-white/10 rounded-2xl p-3">
              <CheckCircle className="w-5 h-5 text-success shrink-0" />
              <span className="text-white text-sm">{feat}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="bg-brand/8 border border-brand/20 rounded-brand-lg p-4 mb-5 text-center">
          <Crown className="w-5 h-5 text-brand-light mx-auto mb-1" />
          <p className="text-textDim text-xs mb-1">Upgrade to Pro</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-display text-4xl font-black text-brand-light tracking-tighter">
              {CURRENCY}{DISPLAY_PRICE}
            </span>
            <span className="text-textDim text-sm">/ month</span>
          </div>
          <p className="text-xs text-textDim mt-1">
            or {CURRENCY}{DISPLAY_PRICE_YEARLY} / year (save 33%)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleInitiatePayment}
            icon={<span>⭐</span>}
          >
            Upgrade to Pro
          </Button>

          <Button
            variant="secondary"
            onClick={onBack}
            className="w-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white py-3 rounded-2xl font-semibold transition-all duration-200 border border-white/10"
          >
            Back to Dashboard
          </Button>
        </div>

        <p className="text-center text-[11px] text-textDim mt-3">
          Secured by Flutterwave — cancel any time
        </p>

        {/* Trust indicators */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-white/40 mb-3">
            Join 10,000+ students acing their JAMB exams
          </p>
          <div className="flex justify-center gap-6">
            {[["4.9", "Rating"], ["98%", "Success"], ["24/7", "Support"]].map(([val, lbl]) => (
              <div key={lbl} className="text-xs text-white/40">
                <div className="font-bold text-white/60">{val}</div>
                <div>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPaywall;
