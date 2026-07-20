/**
 * src/components/landing/animations.ts
 * ───────────────────────────────────────
 * Shared scroll-reveal animation variant used across all landing sections.
 */

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: "easeOut" as any },
};