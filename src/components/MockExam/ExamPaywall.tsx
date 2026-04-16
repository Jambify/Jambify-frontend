import React from 'react';
import { useUserStore } from '../../Store/UseUserStore';
import Button from '../ui/Button';
import { Crown, Lock, CheckCircle } from 'lucide-react';

interface ExamPaywallProps {
  onUpgrade: () => void;
  onBack: () => void;
}

const ExamPaywall: React.FC<ExamPaywallProps> = ({ onUpgrade, onBack }) => {
  const upgradeToPro = useUserStore((s) => s.upgradeToPro);

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
        <h1 className="text-3xl font-display font-bold text-white mb-4">Unlock Pro Features</h1>
        <p className="text-white/60 mb-8">
          Get detailed exam results and advanced analytics to ace your JAMB preparation.
        </p>

        {/* Pro Features */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 text-left bg-[#2A2D35] border border-white/10 rounded-2xl p-3">
            <CheckCircle className="w-5 h-5 text-success shrink-0" />
            <span className="text-white">Detailed exam breakdown</span>
          </div>
          <div className="flex items-center gap-3 text-left bg-[#2A2D35] border border-white/10 rounded-2xl p-3">
            <CheckCircle className="w-5 h-5 text-success shrink-0" />
            <span className="text-white">Subject-wise performance analysis</span>
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
        <div className="bg-brand/10 border border-brand/20 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="w-5 h-5 text-brand-light" />
            <span className="text-brand-light font-bold">Premium Access</span>
          </div>
          <div className="text-3xl font-display font-black text-brand-light mb-1">¥2,999</div>
          <div className="text-sm text-white/60">One-time payment</div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleUpgrade}
            className="w-full bg-brand hover:bg-brand/90 text-white py-3 rounded-2xl font-semibold transition-all duration-200 shadow-lg shadow-brand/20 flex items-center justify-center gap-2"
          >
            <Crown className="w-5 h-5" />
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
