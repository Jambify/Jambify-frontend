import React from 'react';
import { useUserStore } from '../../Store/UseUserStore';
import Button from '../ui/Button';
import { APP_CONFIG } from '../../Store/UseUserStore'; // Importing the app config for pricing details
import { Crown } from 'lucide-react';
const PRO_FEATURES = [
  'Download all subject packs for offline use',
  'Access 4,180+ real JAMB questions (1990–2024)',
  'Audio explanations for every answer',
  'Spaced repetition scheduling (SM-2 algorithm)',
  'Priority access to new question packs',
  'Ad-free experience',
];

const ProGate: React.FC = () => {
  const upgradeToPro = useUserStore((s) => s.upgradeToPro);
 // Destructure the "Standard" values here
  const { DISPLAY_PRICE_YEARLY, CURRENCY, DISPLAY_PRICE } = APP_CONFIG.PRICING;


  return (
    <div className="max-w-md mx-auto py-6 animate-fadeIn">

      {/* <Lock icon */}
      <div className="w-16 h-16 bg-warn/10 border border-warn/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">
        🔒
      </div>

      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 bg-warn/15 border border-warn/25 text-warn text-xs font-bold px-3 py-1 rounded-full mb-3">
          ⭐ PRO FEATURE
        </div>
        <h3 className="font-display text-xl font-bold tracking-tight mb-2">
          Offline Past Questions
        </h3>
        <p className="text-sm text-textMuted">
          Download question packs to study anywhere — no internet required.
          Upgrade to Pro to unlock offline access.
        </p>
      </div>

      {/* <Feature list */}
      <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-4 mb-5">
        <p className="text-[11px] uppercase tracking-widest text-textDim font-medium mb-3">
          What you get with Pro
        </p>
        <div className="flex flex-col gap-2">
          {PRO_FEATURES.map((f) => (
            <div key={f} className="flex items-start gap-2.5 text-sm">
              <span className="w-4 h-4 rounded-full bg-success/15 text-success flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                ✓
              </span>
              <span className="text-textMuted">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* <Pricing */}
      <div className="bg-brand/8 border border-brand/20 rounded-brand-lg p-4 mb-5 text-center">
       <Crown className="w-5 h-5 text-brand-light" />
        <p className="text-textDim text-xs mb-1">Upgrade to Pro</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-display text-4xl font-black text-brand-light tracking-tighter">{CURRENCY}{DISPLAY_PRICE}</span>
          <span className="text-textDim text-sm">/ month</span>
        </div>
        <p className="text-xs text-textDim mt-1">or {CURRENCY}{DISPLAY_PRICE_YEARLY} / year (save 33%)</p>
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
      <p className="text-center text-[11px] text-textDim mt-3">
       secured by flutterwave --- cancel any time
      </p>
    </div>
  );
};

export default ProGate;