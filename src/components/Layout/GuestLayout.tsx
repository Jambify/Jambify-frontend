import React, { type ReactNode } from "react";
import { cn } from "../../lib/utils/utils";

interface GuestLayoutProps {
  children: ReactNode;
  className?: string;
}

const GuestLayout: React.FC<GuestLayoutProps> = ({ children, className }) => {
  return (
    <div className={cn(
      "min-h-screen bg-bgMain text-textMain font-sans selection:bg-brand/30 relative overflow-x-hidden",
      className
    )}>
      {/* Global Ambient Glow for Guest Pages */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand/10 blur-[120px] rounded-full" />
      </div>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default GuestLayout;
