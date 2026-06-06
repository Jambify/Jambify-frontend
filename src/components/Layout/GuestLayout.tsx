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
        <div className="bg-brand/5 absolute top-[-10%] left-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
        <div className="bg-brand/10 absolute right-[-10%] bottom-[-10%] h-[40%] w-[40%] rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GuestLayout;
