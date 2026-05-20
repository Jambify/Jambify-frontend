/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   4. Add these two shared helpers at the bottom of any
      Settings component file, or create:
      src/components/Settings/shared.tsx
      and import Section, Field, inputCls from there.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
import React from "react";
import { cn } from "../../lib/utils/utils";

export const Section: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <div className="bg-bgCard border border-borderMuted rounded-brand-lg p-5">
    <h4 className="text-[11px] uppercase tracking-widest text-textDim font-medium mb-4">
      {title}
    </h4>
    {children}
  </div>
);

export const Field: React.FC<{
  label?: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, error, children }) => (
  <div className="mb-4 last:mb-0">
    {label && (
      <label className="block text-[11px] text-textDim uppercase tracking-widest font-medium mb-2">
        {label}
      </label>
    )}
    {children}
    {error && <p className="text-[11px] text-danger mt-1.5">{error}</p>}
  </div>
);

export const inputCls = (hasError: boolean) =>
  cn(
    "w-full px-4 py-2.5 bg-bgSurface rounded-brand border text-sm text-textMain",
    "placeholder:text-textDim focus:outline-none transition-colors",
    hasError
      ? "border-danger focus:border-danger"
      : "border-borderMuted focus:border-brand/50",
  );

export default { Section, Field, inputCls };
