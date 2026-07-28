import React from "react";

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

export default { Section, Field };
