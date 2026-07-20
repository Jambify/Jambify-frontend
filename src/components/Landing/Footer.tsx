/**
 * src/components/landing/Footer.tsx
 * ─────────────────────────────────────
 */

import React from "react";
import { Link } from "react-router-dom";
import schooldraLogo from "../../assets/schooldraLogo.webp";

const Footer: React.FC = () => {
  return (
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
  );
};

export default Footer;