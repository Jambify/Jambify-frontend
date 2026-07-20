/**
 * src/components/landing/ShowcaseSection.tsx
 * ─────────────────────────────────────────────
 * One reusable alternating image/text block. Rendered 3x by ShowcaseList
 * for Mock Exams, Past Questions, and Performance Tracking.
 */

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { fadeUp } from "./animation";

export interface ShowcaseSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  desc: string;
  bullets: string[];
  cta: string;
  image: string;
  reverse: boolean;
  onCtaClick: () => void;
}

const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({
  id,
  eyebrow,
  title,
  desc,
  bullets,
  cta,
  image,
  reverse,
  onCtaClick,
}) => {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
      <div
        className={`flex flex-col items-center gap-10 lg:gap-16 ${
          reverse ? "lg:flex-row-reverse" : "lg:flex-row"
        }`}
      >
        <motion.div {...fadeUp} className="flex-1">
          <p className="text-brand mb-3 text-sm font-bold tracking-widest uppercase">
            {eyebrow}
          </p>
          <h2 className="font-display mb-4 text-3xl font-bold sm:text-4xl">{title}</h2>
          <p className="text-textMuted mb-6 max-w-md text-lg">{desc}</p>
          <ul className="mb-6 space-y-2">
            {bullets.map((b) => (
              <li key={b} className="text-textMain flex items-start gap-2 text-sm">
                <Check className="text-brand mt-0.5 h-4 w-4 shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={onCtaClick}
            className="text-brand hover:text-brand-light inline-flex items-center gap-1.5 text-sm font-bold"
          >
            {cta} <ArrowRight className="h-4 w-4" />
          </button>
        </motion.div>
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
          className="border-borderMuted bg-bgCard flex-1 overflow-hidden rounded-2xl border shadow-xl"
        >
          <img src={image} alt={title} className="w-full object-cover" />
        </motion.div>
      </div>
    </section>
  );
};

export default ShowcaseSection;