import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import schooldraLogo from "../assets/schooldraLogo.png";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  // Cast "easeOut" as any to bypass the strict type check
  transition: { duration: 0.6, ease: "easeOut" as any }, 
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const schools = [
    "UNILAG",
    "University of Ibadan",
    "OAU",
    "Covenant University",
    "UNN",
    "ABU Zaria",
  ];

  const showcaseSections = [
    {
      eyebrow: "Mock exams",
      title: "Sit the real thing before exam day",
      desc: "180 questions, real JAMB timing, and scoring that mirrors the actual UTME — so results day isn't a surprise.",
      cta: "See how mock exams work",
      image: "/src/assets/showcase-mockexam.png",
      reverse: false,
    },
    {
      eyebrow: "Past questions",
      title: "Every question, sorted your way",
      desc: "Browse by subject, year, or topic. Questions from 2015 onward, all in one place.",
      cta: "Browse past questions",
      image: "/src/assets/showcase-pastquestions.png",
      reverse: true,
    },
    {
      eyebrow: "Performance tracking",
      title: "See exactly where you're improving",
      desc: "Daily quizzes target your weakest subjects automatically, and your dashboard shows the trend over time.",
      cta: "See performance tracking",
      image: "/src/assets/showcase-performance.png",
      reverse: false,
    },
  ];

  return (
    <>
      <Helmet>
        <title>SCHOOLDRA - Best JAMB UTME Preparation App</title>
        <meta
          name="description"
          content="Prepare for JAMB UTME with realistic mock exams, past questions, and AI-powered learning. Get the score you need for your dream course!"
        />
        <meta property="og:title" content="SCHOOLDRA - Best JAMB UTME Preparation App" />
        <meta
          property="og:description"
          content="Prepare for JAMB UTME with realistic mock exams, past questions, and AI-powered learning. Get the score you need for your dream course!"
        />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.schooldra.com" />
      </Helmet>

      <div className="bg-bgMain text-textMain min-h-screen">
        {/* NAVIGATION — clean, backdrop-blur on scroll like Shopify */}
        <nav className="bg-bgMain/80 border-borderMuted sticky top-0 z-50 border-b backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div
              className="flex cursor-pointer items-center gap-2.5"
              onClick={() => navigate("/")}
            >
              <img src={schooldraLogo} alt="Schooldra" className="h-8 w-8" />
              <span className="font-display text-lg font-bold tracking-tight">
                Schooldra
              </span>
            </div>
            <div className="hidden items-center gap-8 md:flex">
              <a href="#mock-exams" className="text-textMuted hover:text-textMain text-sm font-medium transition-colors">
                Mock Exams
              </a>
              <a href="#past-questions" className="text-textMuted hover:text-textMain text-sm font-medium transition-colors">
                Past Questions
              </a>
              <a href="#performance" className="text-textMuted hover:text-textMain text-sm font-medium transition-colors">
                Performance
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/signin"
                className="text-textDim hover:text-textMain hidden px-3 py-2 text-sm font-medium transition-colors sm:block"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-brand hover:bg-brand-light rounded-full px-5 py-2.5 text-sm font-bold text-white transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO — big centered headline, then a large product preview beneath, Shopify-style */}
        <section className="mx-auto max-w-5xl px-6 pt-20 pb-8 text-center lg:pt-28">
          <motion.p
            {...fadeUp}
            className="text-brand mb-5 text-sm font-bold tracking-widest uppercase"
          >
            2027 JAMB syllabus is here
          </motion.p>
          <motion.h1
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.05 }}
            className="font-display mx-auto max-w-3xl text-4xl leading-[1.08] font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Everything you need to ace your JAMB, in one place
          </motion.h1>
          <motion.p
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.1 }}
            className="text-textMuted mx-auto mt-6 max-w-xl text-lg"
          >
            Realistic mock exams, thousands of past questions, and
            performance tracking — built for Nigerian students preparing for
            UTME.
          </motion.p>
          <motion.div
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/signup"
              className="bg-brand hover:bg-brand-light flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold text-white transition-colors"
            >
              Start Free Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/guest"
              className="border-borderMuted text-textMain hover:border-brand/40 rounded-full border px-7 py-3.5 text-sm font-bold transition-colors"
            >
              Try Practice Mode
            </Link>
          </motion.div>
        </section>

        {/* HERO PRODUCT PREVIEW — replace the video src with a real screen recording,
            or delete the <video> and use only the <img> poster if you don't have one yet */}
        <motion.section
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
          className="mx-auto max-w-6xl px-6 pb-16 lg:pb-24"
        >
          <div className="border-borderMuted bg-bgCard overflow-hidden rounded-2xl border shadow-2xl">
            <video
              className="w-full"
              autoPlay
              muted
              loop
              playsInline
              poster="/assets/dashboard-preview.png"
            >
              <source src="/src/assets/hero-demo.mp4" type="video/mp4" />
            </video>
          </div>
        </motion.section>

        {/* SOCIAL PROOF STRIP — school names instead of Shopify's merchant logos */}
        <section className="border-borderMuted border-y">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <p className="text-textDim mb-5 text-center text-xs font-bold tracking-widest uppercase">
              Trusted by students preparing at
            </p>
            <div className="text-textMuted flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium">
              {schools.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ALTERNATING SHOWCASE SECTIONS — the core Shopify pattern:
            big real image, short focused copy, alternating left/right */}
        {showcaseSections.map((s, idx) => (
          <section
            key={s.title}
            id={
              idx === 0
                ? "mock-exams"
                : idx === 1
                  ? "past-questions"
                  : "performance"
            }
            className="mx-auto max-w-6xl px-6 py-16 lg:py-24"
          >
            <div
              className={`flex flex-col items-center gap-10 lg:gap-16 ${
                s.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
              }`}
            >
              <motion.div {...fadeUp} className="flex-1">
                <p className="text-brand mb-3 text-sm font-bold tracking-widest uppercase">
                  {s.eyebrow}
                </p>
                <h2 className="font-display mb-4 text-3xl font-bold sm:text-4xl">
                  {s.title}
                </h2>
                <p className="text-textMuted mb-6 max-w-md text-lg">
                  {s.desc}
                </p>
                <button
                  onClick={() => navigate("/signup")}
                  className="text-brand hover:text-brand-light inline-flex items-center gap-1.5 text-sm font-bold"
                >
                  {s.cta} <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
              <motion.div
                {...fadeUp}
                transition={{ ...fadeUp.transition, delay: 0.1 }}
                className="border-borderMuted bg-bgCard flex-1 overflow-hidden rounded-2xl border shadow-xl"
              >
                <img
                  src={s.image}
                  alt={s.title}
                  className="w-full object-cover"
                />
              </motion.div>
            </div>
          </section>
        ))}

        {/* TESTIMONIAL */}
        <section className="border-borderMuted border-t">
          <motion.div
            {...fadeUp}
            className="mx-auto max-w-3xl px-6 py-16 text-center lg:py-24"
          >
            <p className="font-display text-2xl leading-snug font-medium sm:text-3xl">
              "SCHOOLDRA's mock exams were exactly what I needed. The
              performance tracking helped me find my weak areas before it was
              too late."
            </p>
            <p className="text-textMain mt-6 font-bold">Adebayo O.</p>
            <p className="text-textDim text-sm">
              Medicine & Surgery · scored 320
            </p>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="border-borderMuted border-t">
          <motion.div
            {...fadeUp}
            className="mx-auto max-w-5xl px-6 py-16 text-center lg:py-24"
          >
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Ready to ace your JAMB exam?
            </h2>
            <p className="text-textMuted mx-auto mt-3 max-w-md">
              Join thousands of students already preparing smarter for the
              2027 UTME.
            </p>
            <Link
              to="/signup"
              className="bg-brand hover:bg-brand-light mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white transition-colors"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="border-borderMuted border-t">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="flex items-center gap-2">
                <img src={schooldraLogo} alt="Schooldra" className="h-6 w-6" />
                <span className="font-display text-sm font-bold">Schooldra</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <Link to="/guest/privacy-policy" className="text-textMuted hover:text-brand transition-colors">
                  Privacy Policy
                </Link>
                <Link to="/guest/terms-of-service" className="text-textMuted hover:text-brand transition-colors">
                  Terms of Service
                </Link>
                <Link to="/guest" className="text-textMuted hover:text-brand transition-colors">
                  Practice Mode
                </Link>
              </div>
            </div>
            <div className="text-textDim mt-8 text-center text-xs">
              © {new Date().getFullYear()} Schooldra. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;