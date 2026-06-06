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
  <div className="bg-bgCard border-borderMuted rounded-brand-lg border p-5">
    <h4 className="text-textDim mb-4 text-[11px] font-medium tracking-widest uppercase">
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
      <label className="text-textDim mb-2 block text-[11px] font-medium tracking-widest uppercase">
        {label}
      </label>
    )}
    {children}
    {error && <p className="text-danger mt-1.5 text-[11px]">{error}</p>}
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
