/**
 * src/components/landing/Hero.tsx
 * ───────────────────────────────────
 * Split hero: headline + stats on the left, product demo video on the right.
 * The question-count stat is fetched live from Supabase so it never goes
 * stale as questions are added/removed via the admin panel.
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { fadeUp } from "./animation";
import { supabase } from "../../lib/supabase";
import heroDemoVideo from "../../assets/Hero-Demo.mp4";

// Shown instantly while the real count loads, and as a fallback if the
// fetch fails — keeps the layout stable instead of flashing "0+" or blank.
const FALLBACK_QUESTION_COUNT = 4180;

const Hero: React.FC = () => {
  const [questionCount, setQuestionCount] = useState<number>(FALLBACK_QUESTION_COUNT);

  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      const { count, error } = await supabase
        .from("questions")
        .select("id", { count: "exact", head: true });

      if (!cancelled && !error && typeof count === "number") {
        setQuestionCount(count);
      }
      // On error, questionCount just stays at FALLBACK_QUESTION_COUNT — no visible failure.
    }

    fetchCount();
    return () => {
      cancelled = true;
    };
  }, []);

  const formattedCount = questionCount.toLocaleString();

  const stats = [
    { value: `${formattedCount}+`, label: "Questions from 1990–2024" },
    { value: "180", label: "Questions per mock, real UTME timing" },
    { value: "4", label: "Subjects tracked per student" },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 pt-14 pb-10 lg:pt-20 lg:pb-16">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div className="text-center lg:text-left">
          <motion.p
            {...fadeUp}
            className="text-brand mb-4 text-xs font-bold tracking-widest uppercase"
          >
            Built for the 2027 UTME
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="font-display text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Ace your JAMB.
            <br />
            Know exactly where you stand.
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="text-textMuted mx-auto mt-5 max-w-xl text-lg lg:mx-0"
          >
            Real mock exams, {formattedCount}+ past questions with an AI Tutor that
            explains every answer, and a dashboard that tells you which topics are
            actually costing you marks.
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          >
            <Link
              to="/signup"
              className="bg-brand hover:bg-brand-light flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition-colors"
            >
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/guest"
              className="border-borderMuted text-textMain hover:border-brand/40 inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-bold transition-colors"
            >
              <Play className="h-4 w-4" /> Try Practice Mode
            </Link>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-borderMuted pt-6 lg:mx-0"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center lg:text-left">
                <div className="font-display text-2xl font-extrabold">{s.value}</div>
                <div className="text-textMuted mt-1 text-xs leading-snug">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
          className="bg-bgCard border-borderMuted overflow-hidden rounded-xl border shadow-2xl"
        >
          <div className="bg-bgSurface border-borderMuted flex items-center gap-2 border-b px-4 py-2">
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <div className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="bg-bgMain/50 ml-2 h-4 w-48 rounded" />
          </div>
          <div className="relative aspect-video">
            <video className="h-full w-full object-contain" autoPlay muted loop playsInline>
              <source src={heroDemoVideo} type="video/mp4" />
            </video>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;