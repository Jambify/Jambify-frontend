/**
 * src/pages/LandingPage.tsx
 * ───────────────────────────
 * Merged from two prior landing page variants:
 *   - Base layout, pricing, and FAQ kept from the "split hero" version
 *   - University marquee (social proof) merged in from the "centered hero" version
 * Split into components under src/components/Landing/ so each section
 * can be edited/reordered/A-B tested independently.
 *
 * Added: a hash-scroll effect. The Navbar's nav links (Mock Exams, Pricing,
 * FAQ, etc.) route back here as "/#section-id" when clicked from any other
 * page (like /about), since plain <a href="#section-id"> only works while
 * already on this page. Once React Router lands us back on "/", this effect
 * reads the hash and scrolls to the matching section — otherwise the URL
 * would update but the page would just sit at the top with no scroll.
 */

import React, { useEffect } from "react";
import { useLocation } from "react-router";
import PageHelmet from "../components/SEO/PageHelmet";
import Navbar from "../components/Landing/NavBar";
import Hero from "../components/Landing/Hero";
import SocialProofMarquee from "../components/Landing/Socialproofmarquee";
import ShowcaseList from "../components/Landing/Showcaselist";
import Pricing from "../components/Landing/Pricing";
import Testimonial from "../components/Landing/Testimonial";
import FAQ from "../components/Landing/Faq";
import FinalCTA from "../components/Landing/Finalcta";
import Footer from "../components/Landing/Footer";

const LandingPage: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");

    // A short delay gives the section components (and any images/fonts
    // inside them) a chance to lay out before we measure scroll position —
    // scrolling immediately on mount can land short if content above the
    // target is still shifting height.
    const timer = setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);

    return () => clearTimeout(timer);
  }, [location.hash]);

  return (
    <>
      <PageHelmet
        title="SCHOOLDRA — JAMB UTME prep with mock exams & weak-topic tracking"
        description="Realistic JAMB mock exams, 12,000+ past questions with worked solutions, and performance tracking that finds your weak topics. Built for Nigerian UTME students."
        canonical="https://www.schooldra.com"
      />

      <div className="bg-bgMain text-textMain min-h-screen">
        <Navbar />
        <Hero />
        <SocialProofMarquee />
        <ShowcaseList />
        <Pricing />
        <Testimonial />
        <FAQ />
        <FinalCTA />
        <Footer />
      </div>
    </>
  );
};

export default LandingPage;