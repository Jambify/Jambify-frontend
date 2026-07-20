/**
 * src/pages/LandingPage.tsx
 * ───────────────────────────
 * Merged from two prior landing page variants:
 *   - Base layout, pricing, and FAQ kept from the "split hero" version
 *   - University marquee (social proof) merged in from the "centered hero" version
 * Split into components under src/components/Landing/ so each section
 * can be edited/reordered/A-B tested independently.
 */

import React from "react";
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