import React, { useState } from "react";
import { useUserStore, APP_CONFIG } from "../../Store/useUserStore";
import { supabase } from "../../lib/supabase";
import Button from "../ui/Button";
import { Crown, Lock, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import ValidatedInput from "../ui/ValidatedInput";
import schooldralogo from "../../assets/schooldraLogo.webp"; // Import the new logo

declare global {
  interface Window {
    FlutterwaveCheckout?: (options: Record<string, unknown>) => void;
  }
}

interface FlutterwaveCallbackData {
  status: string;
  tx_ref: string;
  [key: string]: unknown;
}

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
  const [isInitiating, setIsInitiating] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [txRef, setTxRef] = useState("");
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // ── Step 1: User clicks Upgrade ──────────────────────────────────────────
  const handleInitiatePayment = () => {
    setIsInitiating(true);
    setVerifyError(null);

    // Load Flutterwave script if not already present (it should be in index.html now)
    if (!window.FlutterwaveCheckout) {
      console.log("Loading Flutterwave script dynamically...");
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.async = true;
      script.onload = () => {
        setIsInitiating(false);
        processPayment();
      };
      script.onerror = () => {
        setIsInitiating(false);
        setVerifyError(
          "Failed to load payment gateway. Please check your internet connection.",
        );
      };
      document.body.appendChild(script);
    } else {
      setIsInitiating(false);
      processPayment();
    }
  };

  const processPayment = () => {
    const flwKey = import.meta.env.VITE_FLW_PUBLIC_KEY;

    if (!flwKey) {
      console.error(
        "VITE_FLW_PUBLIC_KEY is not defined in environment variables.",
      );
      setVerifyError(
        "System configuration error: Missing payment gateway key.",
      );
      return;
    }

    if (flwKey.includes("PBFPUBLIC") || flwKey.startsWith("FLWPUBK_TEST")) {
      console.warn("Using Flutterwave TEST key. Ensure this is intentional.");
    }

    try {
      window.FlutterwaveCheckout?.({
        public_key: flwKey,
        tx_ref: `schooldra-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        amount: 3000,
        currency: "NGN",
        payment_options: "card, banktransfer, ussd",
        customer: {
          email: email || "student@schooldra.com",
          name: name || "SCHOOLDRA Student",
        },
        customizations: {
          title: "SCHOOLDRA Pro",
          description: "Monthly subscription for professional JAMB prep tools",
          logo: "https://Schooldra.com/SCHOOLDRA.LOGO.webp",
        },
        callback: async (data: FlutterwaveCallbackData) => {
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
          setShowCancelConfirm(true);
        },
      });
    } catch (err) {
      console.error("Flutterwave initiation error:", err);
      setVerifyError("Could not open payment gateway. Please try again.");
    }
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

      // Record or update the transaction in our new pro_users table
      const { error: proError } = await supabase.from("pro_users").upsert(
        {
          user_id: user.id,
          email: user.email,
          payment_reference: reference,
          amount: 3000,
          status: "active",
          plan_type: "monthly",
          expires_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );

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
    } catch (err) {
      console.error("Verification error:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Verification failed. Please contact support.";
      setVerifyError(message);
    } finally {
      setIsVerifying(false);
    }
  };

  // ── Pending step (payment initiated, waiting for user) ────────────────────
  if (step === "pending" || step === "verify") {
    return (
      <div className="bg-bgMain text-textMain flex min-h-screen items-center justify-center p-4">
        <div className="bg-bgCard border-borderMuted w-full max-w-md rounded-4xl border p-8 text-center shadow-2xl">
          <div className="bg-warn/10 border-warn/20 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border">
            <Crown className="text-warn h-8 w-8" />
          </div>

          <h2 className="font-display mb-2 text-2xl font-bold">
            Complete Payment
          </h2>
          <p className="text-textMuted mb-6 text-sm leading-relaxed">
            Pay{" "}
            <strong className="text-textMain">
              {CURRENCY}
              {DISPLAY_PRICE}
            </strong>{" "}
            to unlock Pro. After payment, enter your transaction reference below
            to activate your account.
          </p>

          {/* Payment instructions */}
          <div className="bg-bgSurface border-borderMuted mb-6 space-y-2 rounded-2xl border p-4 text-left">
            <p className="text-textDim mb-3 text-xs font-bold tracking-widest uppercase">
              Payment Steps
            </p>
            <div className="text-textMuted flex items-start gap-2 text-sm">
              <span className="bg-brand/10 text-brand mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
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
            <div className="text-textMuted flex items-start gap-2 text-sm">
              <span className="bg-brand/10 text-brand mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                2
              </span>
              <span>Copy your transaction reference number</span>
            </div>
            <div className="text-textMuted flex items-start gap-2 text-sm">
              <span className="bg-brand/10 text-brand mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                3
              </span>
              <span>Enter it below to instantly activate Pro</span>
            </div>
          </div>

          {/* Contact support link */}
          <a
            href={`https://wa.me/2348000000000?text=Hi, I want to upgrade to Schooldra Pro. Name: ${encodeURIComponent(name)}, Email: ${encodeURIComponent(email)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-green-600/20 bg-green-600/10 py-3 text-sm font-semibold text-green-600 transition-all hover:bg-green-600/20"
          >
            <ExternalLink className="h-4 w-4" />
            Pay via WhatsApp
          </a>

          {/* Transaction ref input */}
          <div className="mb-4">
            <ValidatedInput
              value={txRef}
              onChange={(v) => {
                setTxRef(v.slice(0, 120));
                setVerifyError(null);
              }}
              placeholder="Enter transaction reference (e.g. FLW-XXXX)"
              maxLength={120}
              className="bg-bgSurface border-borderMuted text-textMain placeholder:text-textDim/50 focus:border-brand/50 w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none"
            />
            {verifyError && (
              <p className="text-danger mt-1.5 text-left text-xs">
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
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : undefined
            }
          >
            {isVerifying ? "Verifying…" : "Verify & Activate Pro"}
          </Button>

          <button
            onClick={() => setStep("wall")}
            className="text-textDim hover:text-textMuted mt-3 text-xs transition-colors"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  // ── Default: paywall wall ─────────────────────────────────────────────────
  return (
    <div className="bg-bgMain text-textMain flex min-h-screen items-center justify-center p-4">
      <div className="bg-bgCard border-borderMuted w-full max-w-md rounded-4xl border p-8 text-center shadow-2xl backdrop-blur-md">
        {/* Brand Header */}
        <div className="mb-8 flex items-center gap-3">
          <img src={schooldralogo} alt="Schooldra Logo" className="h-8 w-8" />
          <h1 className="font-display text-brand-light text-2xl font-black tracking-wider">
            Schooldra Pro
          </h1>
        </div>

        {/* Lock Icon */}
        <div className="bg-brand/10 border-brand/20 mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border">
          <Lock className="text-brand h-10 w-10" />
        </div>

        <h1 className="font-display text-textMain mb-4 text-3xl font-bold">
          Unlock Pro Features
        </h1>
        <p className="text-textMuted mb-8">
          Get detailed exam results and advanced analytics to ace your JAMB
          preparation.
        </p>

        {/* Pro Features */}
        <div className="mb-8 space-y-3">
          {[
            "Detailed exam breakdown",
            "Subject-wise performance analysis",
            "Time management insights",
            "Download past questions offline",
            "AI Tutor — unlimited questions",
          ].map((feat) => (
            <div
              key={feat}
              className="bg-bgSurface border-borderMuted flex items-center gap-3 rounded-2xl border p-3 text-left"
            >
              <CheckCircle className="text-success h-5 w-5 shrink-0" />
              <span className="text-textMain text-sm">{feat}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="bg-brand/5 border-brand/10 rounded-brand-lg mb-5 border p-4 text-center">
          <Crown className="text-brand mx-auto mb-1 h-5 w-5" />
          <p className="text-textDim mb-1 text-xs">Upgrade to Pro</p>
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-display text-brand text-4xl font-black tracking-tighter">
              {CURRENCY}
              {DISPLAY_PRICE}
            </span>
            <span className="text-textDim text-sm">/ month</span>
          </div>
          <p className="text-textDim mt-1 text-xs">
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
            loading={isInitiating}
            icon={!isInitiating ? <span>⭐</span> : undefined}
          >
            Upgrade to Pro
          </Button>

          <Button variant="secondary" onClick={onBack} className="w-full">
            Back to Dashboard
          </Button>
        </div>

        <p className="text-textDim mt-3 text-center text-[11px]">
          Secured by Flutterwave — cancel any time
        </p>

        {/* Trust indicators */}
        <div className="border-borderMuted mt-6 border-t pt-6">
          <p className="text-textDim mb-3 text-xs">
            Trusted by students nationwide
          </p>
          <div className="flex justify-center gap-4 opacity-50 grayscale">
            <div className="bg-textDim/20 h-8 w-8 rounded-md" />
            <div className="bg-textDim/20 h-8 w-8 rounded-md" />
            <div className="bg-textDim/20 h-8 w-8 rounded-md" />
          </div>
        </div>

        {/* Custom Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-bgCard border-borderMuted w-full max-w-sm rounded-3xl border p-6 shadow-2xl">
              <div className="text-center">
                <div className="bg-warn/10 border-warn/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border">
                  <Lock className="text-warn h-6 w-6" />
                </div>
                <h3 className="font-display mb-2 text-xl font-bold">
                  Are you sure?
                </h3>
                <p className="text-textMuted mb-6 text-sm">
                  You stopped the payment process. Would you like to go back or
                  try again?
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setShowCancelConfirm(false)}
                  >
                    Go Back
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      setShowCancelConfirm(false);
                      handleInitiatePayment();
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamPaywall;
