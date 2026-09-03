/**
 * src/components/landing/SocialProofMarquee.tsx
 * ───────────────────────────────────────────────
 * Scrolling strip of university names that helps students recognize their
 * intended destinations without making an unsupported usage claim.
 */

import React from "react";
import { motion } from "framer-motion";

const SCHOOLS = [
  "UNILAG",
  "OAU",
  "Covenant University",
  "UNN",
  "ABU Zaria",
  "LASU",
  "FUTA",
  "UNIPORT",
  "UNIZIK",
  "UNICAL",
  "UNIBEN",
  "UI",
  "UNILORIN",
  "UNIJOS",
  "FUTO",
];

const SocialProofMarquee: React.FC = () => {
  return (
    <section className="border-borderMuted overflow-hidden border-y py-8">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-textDim mb-5 text-center text-xs font-bold tracking-widest uppercase">
          Built for students targeting universities such as
        </p>
        <div className="relative flex overflow-x-hidden mask-[linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <motion.div
            className="flex gap-10 whitespace-nowrap"
            initial={{ x: "0%" }}
            animate={{ x: "-50%" }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          >
            {[...SCHOOLS, ...SCHOOLS].map((s, i) => (
              <span
                key={i}
                className="text-textMuted shrink-0 text-sm font-medium"
              >
                {s}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofMarquee;
