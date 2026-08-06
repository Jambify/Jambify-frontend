/**
 * src/components/landing/Hero.tsx
 * ───────────────────────────────────
 * Split hero: headline + stats on the left, product demo video on the right.
 * The question-count stat is fetched live from Supabase so it never goes
 * stale as questions are added/removed via the admin panel.
 *
 * Video loading strategy: the demo video is NOT downloaded on page load.
 * It previously had autoPlay + preload="metadata" together, which is a
 * contradiction — autoPlay forces an eager fetch regardless of the preload
 * hint, so the full file was downloading on every landing-page visit before
 * anyone had even seen the poster. Now: poster only, until the user clicks
 * play. Nothing video-related touches the network until then.
 */

import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { fadeUp } from "./animation";
import heroDemoVideo from "../../assets/Hero-Demo.mp4";
import heroPoster from "../../assets/hero.png";

// Shown instantly while the real count loads, and as a fallback if the
// fetch fails — keeps the layout stable instead of flashing "0+" or blank.
const FALLBACK_QUESTION_COUNT = 4180;

const Hero: React.FC = () => {
  const [questionCount, setQuestionCount] = useState<number>(
    FALLBACK_QUESTION_COUNT,
  );
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchCount() {
      // Dynamically imported so the Supabase client (and its ~50KB of JS)
      // isn't part of the critical landing-page bundle just to fetch one
      // number — it loads in parallel, after the initial render is unblocked.
      const { supabase } = await import("../../lib/supabase");

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
            className="text-brand mb-4 text-xs font-bold tracking-[0.3em] uppercase"
          >
            Built for JAMB students who want clarity and confidence
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="font-display text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Practice smarter.
            <br />
            Score higher.
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="text-textMuted mx-auto mt-5 max-w-xl text-lg lg:mx-0"
          >
            Pick a subject, take a quick quiz or full mock, and get instant
            guidance on the topics holding back your score. No fluff, just fast
            JAMB prep.
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start"
          >
            <Link
              to="/signup"
              className="bg-brand hover:bg-brand-light flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white shadow-[0_16px_40px_rgba(124,60,255,0.18)] transition-all"
            >
              Start free today <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/guest"
              className="border-borderMuted text-textMain hover:border-brand/40 inline-flex items-center gap-2 rounded-full border px-7 py-3.5 text-sm font-bold transition-all"
            >
              <Play className="h-4 w-4" /> Try guest mode
            </Link>
          </motion.div>

          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.2 }}
            className="border-borderMuted mt-10 grid max-w-xl grid-cols-1 gap-4 border-t pt-6 sm:grid-cols-3 lg:mx-0"
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-bgSurface/60 rounded-3xl p-4 text-center shadow-[0_18px_40px_rgba(0,0,0,0.12)]"
              >
                <div className="font-display text-textMain text-2xl font-extrabold">
                  {s.value}
                </div>
                <div className="text-textMuted mt-2 text-xs leading-snug">
                  {s.label}
                </div>
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
            {showVideo ? (
              // Only mounted — and only then does the browser fetch anything —
              // once the user has actually asked to see it.
              <video
                className="h-full w-full object-contain"
                poster={heroPoster}
                controls
                autoPlay
                playsInline
              >
                <source src={heroDemoVideo} type="video/mp4" />
              </video>
            ) : (
              <button
                type="button"
                onClick={() => setShowVideo(true)}
                aria-label="Play product demo video"
                className="group relative h-full w-full"
              >
                <img
                  src={heroPoster}
                  alt="SCHOOLDRA product demo preview"
                  className="h-full w-full object-contain"
                  width={1280}
                  height={720}
                  loading="lazy"
                />
                <span className="bg-black/30 absolute inset-0 flex items-center justify-center transition-colors group-hover:bg-black/40">
                  <span className="bg-brand shadow-brand/40 flex h-16 w-16 items-center justify-center rounded-full shadow-xl transition-transform group-hover:scale-105">
                    <Play className="ml-1 h-6 w-6 fill-white text-white" />
                  </span>
                </span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;