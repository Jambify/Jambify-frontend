/**
 * src/components/landing/FAQ.tsx
 * ─────────────────────────────────
 * Native <details>/<summary> accordion — no JS state needed, and it's
 * accessible and indexable by search crawlers by default.
 */

import React from "react";
import { motion } from "framer-motion";
import { fadeUp } from "./animation";

const FAQS = [
  {
    q: "What's the difference between Free and Pro?",
    a: "Free lets you take full mock exams and daily practice quizzes across every subject, with real UTME timing. Pro unlocks the correct answer and explanation for every question, the AI Tutor, and full access to the past-questions bank.",
  },
  {
    q: "What does the AI Tutor actually do?",
    a: "After you answer a question, the AI Tutor explains — in plain terms — why the correct answer is right and why the option you picked was wrong, so you actually learn from every mistake instead of just seeing a red X.",
  },
  {
    q: "How many past questions do you have?",
    a: "4,180+ real JAMB past questions spanning 1990–2024, organized by subject, year, and topic. Pro members can browse the full bank; everyone else gets a 12-question preview per subject in Practice Mode.",
  },
  {
    q: "Can I try it before paying?",
    a: "Yes. Practice Mode is open with no sign-up required — you get 12 questions per subject to get a feel for the question style before creating an account.",
  },
  {
    q: "Is Schooldra aligned with the 2027 JAMB syllabus?",
    a: "Yes. Every subject bank is updated to the current JAMB syllabus, and mock exams follow the current UTME structure and timing.",
  },
  {
    q: "Is there a yearly plan?",
    a: "Not currently — Pro is ₦3,000/month with no long-term commitment. Cancel anytime.",
  },
  {
    q: "Can I use it on my phone?",
    a: "Yes. Schooldra is built mobile-first — practice, take mocks, and check your dashboard from any phone.",
  },
];

const FAQ: React.FC = () => {
  return (
    <section id="faq" className="border-borderMuted border-t">
      <div className="mx-auto max-w-3xl px-6 py-16 lg:py-24">
        <motion.h2
          {...fadeUp}
          className="font-display mb-10 text-center text-3xl font-bold sm:text-4xl"
        >
          Questions students ask
        </motion.h2>
        <div className="divide-borderMuted border-borderMuted divide-y border-t border-b">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="text-textMain font-bold">{f.q}</span>
                <span className="text-textMuted text-2xl leading-none transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="text-textMuted mt-3 text-sm leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;