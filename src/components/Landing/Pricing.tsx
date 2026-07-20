/**
 * src/components/landing/Pricing.tsx
 * ─────────────────────────────────────
 * Two-tier pricing (Free / Pro). Prices are hardcoded here — if these
 * ever need to sync with APP_CONFIG.PRICING (used in ExamPaywall/ProGate),
 * pull DISPLAY_PRICE from useUserStore instead of the literal "₦3,000".
 */

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { fadeUp } from "./animation";

const PLANS = [
  {
    name: "Free",
    price: "₦0",
    tag: "Start here",
    features: [
      "Full mock exams, real UTME timing",
      "Daily practice quizzes, all subjects",
      "Performance dashboard & streaks",
    ],
    cta: "Start Free",
    to: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "₦3,000",
    tag: "Per month · cancel anytime",
    features: [
      "See correct answers on every question",
      "AI Tutor — explains why each answer is right or wrong",
      "Full access to 4,180+ past questions (1990–2024)",
      "Browse past questions by subject, year, or topic",
    ],
    cta: "Go Pro",
    to: "/signup?plan=pro",
    highlighted: true,
  },
];

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="border-borderMuted border-t">
      <div className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <p className="text-brand mb-3 text-sm font-bold tracking-widest uppercase">
            Pricing
          </p>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Start free. Upgrade when you're serious.
          </h2>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2">
          {PLANS.map((p) => (
            <motion.div
              key={p.name}
              {...fadeUp}
              className={`rounded-2xl border p-8 ${
                p.highlighted
                  ? "border-brand bg-bgCard shadow-xl"
                  : "border-borderMuted bg-bgCard/50"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h3 className="font-display text-xl font-bold">{p.name}</h3>
                {p.highlighted && (
                  <span className="bg-brand rounded-full px-3 py-1 text-xs font-bold text-white">
                    Popular
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-4xl font-extrabold">{p.price}</span>
              </div>
              <p className="text-textMuted mt-1 text-sm">{p.tag}</p>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="text-brand mt-0.5 h-4 w-4 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={p.to}
                className={`mt-8 flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-colors ${
                  p.highlighted
                    ? "bg-brand hover:bg-brand-light text-white"
                    : "border-borderMuted hover:border-brand/40 border"
                }`}
              >
                {p.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;