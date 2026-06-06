import React from "react";
import { useUserStore } from "../../Store/useUserStore";
import Button from "../ui/Button";
import { APP_CONFIG } from "../../Store/useUserStore"; // Importing the app config for pricing details
import { Crown } from "lucide-react";
const PRO_FEATURES = [
  "Download all subject packs for offline use",
  "Access 4,180+ real JAMB questions (1990–2024)",
  "Audio explanations for every answer",
  "Spaced repetition scheduling (SM-2 algorithm)",
  "Priority access to new question packs",
  "Ad-free experience",
];

const ProGate: React.FC = () => {
  const upgradeToPro = useUserStore((s) => s.upgradeToPro);
  // Destructure the "Standard" values here
  const { DISPLAY_PRICE_YEARLY, CURRENCY, DISPLAY_PRICE } = APP_CONFIG.PRICING;

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

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={upgradeToPro}
        icon={<span>⭐</span>}
      >
        Upgrade to Pro
      </Button>
      <p className="text-textDim mt-3 text-center text-[11px]">
        secured by flutterwave --- cancel any time
      </p>
    </div>
  );
};

export default ProGate;
