import React, { useState } from "react";
import { useUserStore } from "../../Store/useUserStore";
import Button from "../ui/Button";
import { APP_CONFIG } from "../../Store/useUserStore"; // Importing the app config for pricing details
import { Crown } from "lucide-react";
import { supabase } from "../../lib/supabase";
const PRO_FEATURES = [
  "Download all subject packs for offline use",
  "Access 4,180+ real JAMB questions (1990–2024)",
  "Audio explanations for every answer",
  "Spaced repetition scheduling (SM-2 algorithm)",
  "Priority access to new question packs",
  "Ad-free experience",
];

const ProGate: React.FC = () => {
  const { upgradeToPro, name, email } = useUserStore();
  // Destructure the "Standard" values here
  const { DISPLAY_PRICE_YEARLY, CURRENCY, DISPLAY_PRICE } = APP_CONFIG.PRICING;

  const [isInitiating, setIsInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleUpgrade = () => {
    setIsInitiating(true);
    setError(null);

    if (!(window as any).FlutterwaveCheckout) {
      const script = document.createElement("script");
      script.src = "https://checkout.flutterwave.com/v3.js";
      script.async = true;
      script.onload = () => {
        setIsInitiating(false);
        processPayment();
      };
      script.onerror = () => {
        setIsInitiating(false);
        setError("Failed to load payment gateway.");
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
      setError("Payment configuration missing.");
      return;
    }

    try {
      (window as any).FlutterwaveCheckout({
        public_key: flwKey,
        tx_ref: `schooldra-pro-${Date.now()}`,
        amount: 3000,
        currency: "NGN",
        payment_options: "card, banktransfer, ussd",
        customer: {
          email: email || "student@schooldra.com",
          name: name || "Schooldra Student",
        },
        customizations: {
          title: "Schooldra Pro",
          description: "Full access to all JAMB prep features",
          logo: "https://schooldra.vercel.app/Schooldra.LOGO.png",
        },
        callback: async (data: any) => {
          if (data.status === "successful" || data.status === "completed") {
            try {
              // Record or update the transaction in pro_users table
              const {
                data: { user },
              } = await supabase.auth.getUser();
              if (user) {
                await supabase.from("pro_users").upsert(
                  {
                    user_id: user.id,
                    email: user.email,
                    payment_reference: data.tx_ref,
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
              }
            } catch (err) {
              console.error("Error recording payment:", err);
            }

            // Update local store
            await upgradeToPro();
            // Optional: refresh or show success
          } else {
            setError("Payment failed. Please try again.");
          }
        },
        onclose: () => {
          console.log("Payment modal closed");
          setShowCancelConfirm(true);
        },
      });
    } catch (err) {
      setError("Could not initiate payment.");
    }
  };

  return (
    <div className="animate-fadeIn mx-auto max-w-md py-6">
      {/* <Lock icon */}
      <div className="bg-warn/10 border-warn/20 mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border text-3xl">
        🔒
      </div>

      <div className="mb-6 text-center">
        <div className="bg-warn/15 border-warn/25 text-warn mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold">
          ⭐ PRO FEATURE
        </div>
        <h3 className="font-display mb-2 text-xl font-bold tracking-tight">
          Offline Past Questions
        </h3>
        <p className="text-textMuted text-sm">
          Download question packs to study anywhere — no internet required.
          Upgrade to Pro to unlock offline access.
        </p>
      </div>

      {/* <Feature list */}
      <div className="bg-bgCard border-borderMuted rounded-brand-lg mb-5 border p-4">
        <p className="text-textDim mb-3 text-[11px] font-medium tracking-widest uppercase">
          What you get with Pro
        </p>
        <div className="flex flex-col gap-2">
          {PRO_FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-2.5 text-sm">
              <span className="bg-success/15 text-success mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
                ✓
              </span>
              <span className="text-textMuted">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* <Pricing */}
      <div className="bg-brand/8 border-brand/20 rounded-brand-lg mb-5 border p-4 text-center">
        <Crown className="text-brand-light h-5 w-5" />
        <p className="text-textDim mb-1 text-xs">Upgrade to Pro</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-display text-brand-light text-4xl font-black tracking-tighter">
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

      {error && (
        <p className="text-danger mb-4 text-center text-xs font-medium">
          {error}
        </p>
      )}

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleUpgrade}
        loading={isInitiating}
        icon={!isInitiating ? <span>⭐</span> : undefined}
      >
        Upgrade to Pro
      </Button>
      <p className="text-textDim mt-3 text-center text-[11px]">
        secured by flutterwave --- cancel any time
      </p>

      {/* Custom Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-bgCard border-borderMuted w-full max-w-sm rounded-3xl border p-6 shadow-2xl">
            <div className="text-center">
              <div className="bg-warn/10 border-warn/20 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border">
                <Crown className="text-warn h-6 w-6" />
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
                    handleUpgrade();
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
  );
};

export default ProGate;
