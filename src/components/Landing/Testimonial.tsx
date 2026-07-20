/**
 * src/components/landing/Testimonial.tsx
 * ─────────────────────────────────────────
 * Single-quote testimonial. Swap this out for a real student quote +
 * photo once you have one — placeholder attribution flagged below.
 */

import React from "react";
import { motion } from "framer-motion";
import { fadeUp } from "./animation";

const Testimonial: React.FC = () => {
  return (
    <section className="border-borderMuted border-t">
      <motion.div {...fadeUp} className="mx-auto max-w-3xl px-6 py-16 text-center lg:py-24">
        <p className="font-display text-2xl leading-snug font-medium sm:text-3xl">
          "The mock exams felt exactly like the real UTME. The weak-topic tracker
          made me stop wasting time on subjects I was already good at."
        </p>
        {/* TODO: replace with a real student testimonial + name/course/score once available */}
        <p className="text-textMain mt-6 font-bold">Adebayo O.</p>
        <p className="text-textDim text-sm">Medicine & Surgery · scored 320</p>
      </motion.div>
    </section>
  );
};

export default Testimonial;