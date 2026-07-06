// src/components/Legal/LegalPage.tsx

import React from "react";
import type { LegalBlock } from "../../Data/legalContent";

interface LegalPageProps {
  title: string;
  effectiveDate: string;
  blocks: LegalBlock[];
}

const LegalPage: React.FC<LegalPageProps> = ({ title, effectiveDate, blocks }) => {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <div className="mb-8 text-center">
        <p className="text-brand text-sm font-bold tracking-wide uppercase">JAMBIFY</p>
        <h1 className="text-textMain mt-1 text-2xl font-bold">{title}</h1>
        <p className="text-textDim mt-1 text-sm italic">Effective Date: {effectiveDate}</p>
      </div>

      <div className="bg-bgCard border-borderMuted rounded-brand-xl space-y-4 border p-6">
        {blocks.map((block, i) => {
          switch (block.type) {
            case "h1":
              return (
                <h2 key={i} className="text-brand pt-4 text-lg font-bold first:pt-0">
                  {block.text}
                </h2>
              );
            case "h2":
              return (
                <h3 key={i} className="text-textMain pt-2 text-base font-semibold">
                  {block.text}
                </h3>
              );
            case "note":
              return (
                <p key={i} className="text-textDim text-sm italic">
                  {block.text}
                </p>
              );
            case "bullet":
              return (
                <li key={i} className="text-textDim ml-5 list-disc text-sm leading-relaxed">
                  {block.text}
                </li>
              );
            case "p":
            default:
              return (
                <p key={i} className="text-textDim text-sm leading-relaxed">
                  {block.text}
                </p>
              );
          }
        })}
      </div>
    </div>
  );
};

export default LegalPage;