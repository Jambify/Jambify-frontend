import React from "react";
import { useUserStore } from "../../Store/UseUserStore";
import Button from "../ui/Button";
import { Crown, Lock, CheckCircle } from "lucide-react";
import { APP_CONFIG } from "../../Store/UseUserStore";

interface ExamPaywallProps {
  onUpgrade: () => void;
  onBack: () => void;
}

const ExamPaywall: React.FC<ExamPaywallProps> = ({ onUpgrade, onBack }) => {
  const upgradeToPro = useUserStore((s) => s.upgradeToPro);
  // destructuring the price
  const { DISPLAY_PRICE_YEARLY, CURRENCY, DISPLAY_PRICE } = APP_CONFIG.PRICING;

  const handleUpgrade = () => {
    upgradeToPro();
    onUpgrade();
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-white flex items-center justify-center p-4">
      <div className="bg-[#1A1D23] border border-white/5 rounded-4xl p-8 w-full max-w-md text-center shadow-2xl backdrop-blur-md">
        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center font-display font-black text-white text-xl shadow-[0_0_20px_rgba(var(--brand-rgb),0.5)]">
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

        {/* Title */}
        <h1 className="text-3xl font-display font-bold text-white mb-4">
          Unlock Pro Features
        </h1>
        <p className="text-white/60 mb-8">
          Get detailed exam results and advanced analytics to ace your JAMB
          preparation.
        </p>

        {/* Pro Features */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 text-left bg-[#2A2D35] border border-white/10 rounded-2xl p-3">
            <CheckCircle className="w-5 h-5 text-success shrink-0" />
            <span className="text-white">Detailed exam breakdown</span>
          </div>
          <div className="flex items-center gap-3 text-left bg-[#2A2D35] border border-white/10 rounded-2xl p-3">
            <CheckCircle className="w-5 h-5 text-success shrink-0" />
            <span className="text-white">
              Subject-wise performance analysis
            </span>
          </div>
          <div className="flex items-center gap-3 text-left bg-[#2A2D35] border border-white/10 rounded-2xl p-3">
            <CheckCircle className="w-5 h-5 text-success shrink-0" />
            <span className="text-white">Time management insights</span>
          </div>
          <div className="flex items-center gap-3 text-left bg-[#2A2D35] border border-white/10 rounded-2xl p-3">
            <CheckCircle className="w-5 h-5 text-success shrink-0" />
            <span className="text-white">Download past questions offline</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-brand/8 border border-brand/20 rounded-brand-lg p-4 mb-5 text-center">
        <Crown className="w-5 h-5 text-brand-light" />
        <p className="text-textDim text-xs mb-1">Upgrade to Pro</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="font-display text-4xl font-black text-brand-light tracking-tighter">{CURRENCY}{DISPLAY_PRICE}</span>
          <span className="text-textDim text-sm">/ month</span>
        </div>
        <p className="text-xs text-textDim mt-1">or {CURRENCY}{DISPLAY_PRICE_YEARLY} / year (save 33%)</p>
      </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleUpgrade}
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
       secured by flutterwave --- cancel any time
      </p>

        {/* Trust indicators */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-xs text-white/40 mb-3">
            Join 10,000+ students acing their JAMB exams
          </p>
          <div className="flex justify-center gap-4">
            <div className="text-xs text-white/40">
              <div className="font-bold text-white/60">4.9</div>
              <div>Rating</div>
            </div>
            <div className="text-xs text-white/40">
              <div className="font-bold text-white/60">98%</div>
              <div>Success</div>
            </div>
            <div className="text-xs text-white/40">
              <div className="font-bold text-white/60">24/7</div>
              <div>Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPaywall;
