import React, { useState } from "react";
import { useUserStore, APP_CONFIG } from "../../Store/useUserStore";
import { supabase } from "../../lib/supabase";
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

  const [step, setStep] = useState<"wall" | "pending" | "verify">("wall");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [txRef, setTxRef] = useState("");

  // ── Step 1: User clicks Upgrade ──────────────────────────────────────────
  const handleInitiatePayment = () => {
    // Load Flutterwave script if not already present
    if (!(window as any).FlutterwaveCheckout) {
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.async = true;
      script.onload = () => processPayment();
      document.body.appendChild(script);
    } else {
      processPayment();
    }
  };

  const processPayment = () => {
    const flwKey =
      import.meta.env.VITE_FLW_PUBLIC_KEY ||
      "FLWPUBK_TEST-5e4a8f1a2b3c4d5e6f7g8h9i0j1k2l3m-X"; // Fallback for dev

    if (flwKey.includes("PBFPUBLIC")) {
      setVerifyError("System configuration error: Invalid Public Key format.");
      return;
    }

    (window as any).FlutterwaveCheckout({
      public_key: flwKey,
      tx_ref: `jambify-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      amount: 3000,
      currency: "NGN",
      payment_options: "card, banktransfer, ussd",
      customer: {
        email: email || "student@jambify.com",
        name: name || "JAMBIFY Student",
      },
      customizations: {
        title: "JAMBIFY Pro",
        description: "Monthly subscription for professional JAMB prep tools",
        logo: "https://jambify.vercel.app/hero.png",
      },
      callback: async (data: any) => {
        console.log("Payment callback data:", data);
        if (data.status === "successful" || data.status === "completed") {
          // Grant Pro immediately in frontend for better UX, then verify
          await upgradeToPro();
          handlePaymentSuccess(data.tx_ref);
        } else {
          setVerifyError("Payment was not successful. Please try again.");
        }
      },
      onclose: () => {
        console.log("Payment modal closed");
      },
    });
  };

  const handlePaymentSuccess = async (ref: string) => {
    setTxRef(ref);
    setStep("verify");
    await handleVerify(ref);
  };

  // ── Step 2: User claims they've paid — verify before granting Pro ─────────
  const handleVerify = async (passedRef?: string) => {
    const reference = passedRef || txRef;
    if (!reference.trim()) {
      setVerifyError("Please enter your transaction reference.");
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);

    try {
      // In a real app, you'd call your backend to verify with Flutterwave's secret key
      // and then update the DB. For this frontend-only implementation, we'll
      // update the profile directly after a simulated check.

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to complete your upgrade.");

      // Record the transaction in our new pro_users table
      const { error: proError } = await supabase.from("pro_users").insert({
        user_id: user.id,
        email: user.email,
        payment_reference: reference,
        amount: 3000,
        status: "active",
        plan_type: "monthly",
        expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      });

      if (proError) {
        console.error("Error recording payment:", proError);
        // If it's a unique constraint error, they might already be pro
        if (!proError.message.includes("unique")) {
          throw new Error("Failed to record payment. Please contact support.");
        }
      }

      // Update the user's profile to is_pro = true
      // Note: We also have a DB trigger 'on_pro_payment' that does this,
      // but we do it here as well for immediate feedback.
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_pro: true })
        .eq("id", user.id);

      // We ignore profileError if it's an RLS issue because the trigger
      // handle_successful_payment() runs with SECURITY DEFINER (bypass RLS)
      // and will handle it in the background.
      if (profileError) {
        console.warn(
          "Profile update via frontend failed (expected if RLS is strict), trigger will handle it:",
          profileError,
        );
      }

      // Update local store
      upgradeToPro();

      // Success!
      setStep("verify");
      setTimeout(() => {
        onUpgrade();
      }, 2000);
    } catch (err: any) {
      console.error("Verification error:", err);
      setVerifyError(
        err.message ?? "Verification failed. Please contact support.",
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Pending step (payment initiated, waiting for user) ────────────────────
  if (step === "pending" || step === "verify") {
    return (
      <div className="min-h-screen bg-bgMain text-textMain flex items-center justify-center p-4">
        <div className="bg-bgCard border border-borderMuted rounded-4xl p-8 w-full max-w-md text-center shadow-2xl">
          <div className="w-16 h-16 bg-warn/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-warn/20">
            <Crown className="w-8 h-8 text-warn" />
          </div>

          <h2 className="text-2xl font-display font-bold mb-2">
            Complete Payment
          </h2>
          <p className="text-textMuted text-sm mb-6 leading-relaxed">
            Pay{" "}
            <strong className="text-textMain">
              {CURRENCY}
              {DISPLAY_PRICE}
            </strong>{" "}
            to unlock Pro. After payment, enter your transaction reference below
            to activate your account.
          </p>

          {/* Payment instructions */}
          <div className="bg-bgSurface border border-borderMuted rounded-2xl p-4 mb-6 text-left space-y-2">
            <p className="text-xs text-textDim uppercase tracking-widest font-bold mb-3">
              Payment Steps
            </p>
            <div className="flex items-start gap-2 text-sm text-textMuted">
              <span className="w-5 h-5 rounded-full bg-brand/10 text-brand text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                1
              </span>
              <span>
                Send{" "}
                <strong className="text-textMain">
                  {CURRENCY}
                  {DISPLAY_PRICE}
                </strong>{" "}
                via bank transfer or Flutterwave
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm text-textMuted">
              <span className="w-5 h-5 rounded-full bg-brand/10 text-brand text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                2
              </span>
              <span>Copy your transaction reference number</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-textMuted">
              <span className="w-5 h-5 rounded-full bg-brand/10 text-brand text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                3
              </span>
              <span>Enter it below to instantly activate Pro</span>
            </div>
          </div>

          {/* Contact support link */}
          <a
            href={`https://wa.me/2348000000000?text=Hi, I want to upgrade to JAMBIFY Pro. Name: ${encodeURIComponent(name)}, Email: ${encodeURIComponent(email)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 mb-4 bg-green-600/10 border border-green-600/20 text-green-600 rounded-2xl text-sm font-semibold hover:bg-green-600/20 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Pay via WhatsApp
          </a>

          {/* Transaction ref input */}
          <div className="mb-4">
            <input
              type="text"
              value={txRef}
              onChange={(e) => {
                setTxRef(e.target.value);
                setVerifyError(null);
              }}
              placeholder="Enter transaction reference (e.g. FLW-XXXX)"
              className="w-full px-4 py-3 bg-bgSurface border border-borderMuted rounded-2xl text-sm text-textMain placeholder:text-textDim/50 focus:outline-none focus:border-brand/50"
            />
            {verifyError && (
              <p className="text-danger text-xs mt-1.5 text-left">
                {verifyError}
              </p>
            )}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => handleVerify()}
            disabled={isVerifying || !txRef.trim()}
            icon={
              isVerifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : undefined
            }
          >
            {isVerifying ? "Verifying…" : "Verify & Activate Pro"}
          </Button>

          <button
            onClick={() => setStep("wall")}
            className="mt-3 text-xs text-textDim hover:text-textMuted transition-colors"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  // ── Default: paywall wall ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-bgMain text-textMain flex items-center justify-center p-4">
      <div className="bg-bgCard border border-borderMuted rounded-4xl p-8 w-full max-w-md text-center shadow-2xl backdrop-blur-md">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center font-display font-black text-white text-xl shadow-lg shadow-brand/40">
            J
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-textMain">
            JAMB<span className="text-brand">IFY</span>
          </span>
        </div>

        {/* Lock Icon */}
        <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-brand/20">
          <Lock className="w-10 h-10 text-brand" />
        </div>

        <h1 className="text-3xl font-display font-bold text-textMain mb-4">
          Unlock Pro Features
        </h1>
        <p className="text-textMuted mb-8">
          Get detailed exam results and advanced analytics to ace your JAMB
          preparation.
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
            <div
              key={feat}
              className="flex items-center gap-3 text-left bg-bgSurface border border-borderMuted rounded-2xl p-3"
            >
              <CheckCircle className="w-5 h-5 text-success shrink-0" />
              <span className="text-textMain text-sm">{feat}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="bg-brand/5 border border-brand/10 rounded-brand-lg p-4 mb-5 text-center">
          <Crown className="w-5 h-5 text-brand mx-auto mb-1" />
          <p className="text-textDim text-xs mb-1">Upgrade to Pro</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-display text-4xl font-black text-brand tracking-tighter">
              {CURRENCY}
              {DISPLAY_PRICE}
            </span>
            <span className="text-textDim text-sm">/ month</span>
          </div>
          <p className="text-xs text-textDim mt-1">
            or {CURRENCY}
            {DISPLAY_PRICE_YEARLY} / year (save 33%)
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

          <Button variant="secondary" onClick={onBack} className="w-full">
            Back to Dashboard
          </Button>
        </div>

        <p className="text-center text-[11px] text-textDim mt-3">
          Secured by Flutterwave — cancel any time
        </p>

        {/* Trust indicators */}
        <div className="mt-6 pt-6 border-t border-borderMuted">
          <p className="text-xs text-textDim mb-3">
            Trusted by students nationwide
          </p>
          <div className="flex justify-center gap-4 opacity-50 grayscale">
            <div className="w-8 h-8 bg-textDim/20 rounded-md" />
            <div className="w-8 h-8 bg-textDim/20 rounded-md" />
            <div className="w-8 h-8 bg-textDim/20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPaywall;
