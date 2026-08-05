import React, { type ReactNode } from "react";
import { cn } from "../../lib/utils/utils";

interface GuestLayoutProps {
  children: ReactNode;
  className?: string;
}

const GuestLayout: React.FC<GuestLayoutProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        "bg-bgMain text-textMain selection:bg-brand/30 relative min-h-screen overflow-x-hidden font-sans",
        className,
      )}
    >
      {/* Global Ambient Glow for Guest Pages */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="bg-brand/10 absolute top-[-12%] left-[-10%] h-[44%] w-[44%] rounded-full blur-[140px]" />
        <div className="bg-teal/10 absolute right-[-12%] bottom-[-12%] h-[38%] w-[38%] rounded-full blur-[120px]" />
        <div className="bg-lime/20 absolute bottom-1/4 left-1/3 h-28 w-28 rounded-full blur-[80px] opacity-90" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GuestLayout;
