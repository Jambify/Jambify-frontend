/**
 * src/components/landing/Navbar.tsx
 * ───────────────────────────────────
 * Sticky nav with scroll-aware blur background and mobile menu.
 */

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import schooldraLogo from "../../assets/schooldraLogo.webp";

const NAV_LINKS = ["Mock Exams", "Past Questions", "Performance", "Pricing", "FAQ"];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        isScrolled
          ? "bg-bgMain/80 border-borderMuted shadow-sm backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
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
          {NAV_LINKS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-textMuted hover:text-textMain text-sm font-medium transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/guest"
            className="text-textMuted hover:text-textMain hidden text-sm font-bold transition-colors md:block"
          >
            Practice Mode
          </Link>
          <Link
            to="/signup"
            className="bg-brand hover:bg-brand-light rounded-full px-5 py-2.5 text-sm font-bold text-white transition-colors"
          >
            Get Started
          </Link>
          <button
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-borderMuted bg-bgMain flex flex-col gap-4 border-t px-6 py-4 md:hidden"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-textMain text-sm font-bold"
            >
              {item}
            </a>
          ))}
          <Link
            to="/guest"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-textMain text-sm font-bold"
          >
            Practice Mode
          </Link>
          <Link
            to="/signin"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-textMuted text-sm font-bold"
          >
            Sign In
          </Link>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;