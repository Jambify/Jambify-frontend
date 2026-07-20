/**
 * src/components/landing/FinalCTA.tsx
 * ──────────────────────────────────────
 * Closing call-to-action above the footer.
 */

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fadeUp } from "./animation";

const FinalCTA: React.FC = () => {
  return (
    <section className="border-borderMuted border-t">
      <motion.div {...fadeUp} className="mx-auto max-w-5xl px-6 py-16 text-center lg:py-24">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Ready to ace your JAMB exam?
        </h2>
        <p className="text-textMuted mx-auto mt-3 max-w-md">
          Join thousands of students already preparing smarter for the 2027 UTME.
        </p>
        <Link
          to="/signup"
          className="bg-brand hover:bg-brand-light mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white transition-colors"
        >
          Get Started Free <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  );
};

export default FinalCTA;