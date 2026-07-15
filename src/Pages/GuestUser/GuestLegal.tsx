// src/components/Legal/LegalPage.tsx

import React from "react";
import type { LegalBlock } from "../../Data/legalContent";
import { FileText } from "lucide-react";

interface LegalPageProps {
  title: string;
  effectiveDate: string;
  blocks: LegalBlock[];
}

const LegalPage: React.FC<LegalPageProps> = ({
  title,
  effectiveDate,
  blocks,
}) => {
  // Process blocks to group consecutive bullets into proper lists
  const processedBlocks = blocks.reduce(
    (acc, block) => {
      if (block.type === "bullet") {
        const lastBlock = acc[acc.length - 1];
        if (Array.isArray(lastBlock)) {
          lastBlock.push(block);
        } else {
          acc.push([block]);
        }
      } else {
        acc.push(block);
      }
      return acc;
    },
    [] as (LegalBlock | LegalBlock[])[],
  );

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header Section */}
      <div className="mb-10 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-brand/10 text-brand flex h-12 w-12 items-center justify-center rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-brand text-sm font-bold tracking-wide uppercase">
              SCHOOLDRA Legal
            </p>
            <h1 className="text-textMain text-3xl font-extrabold tracking-tight">
              {title}
            </h1>
          </div>
        </div>
        <div className="bg-bgCard border-borderMuted flex items-center gap-2 rounded-xl border px-4 py-3">
          <span className="text-textDim text-sm font-medium">
            Effective Date:
          </span>
          <span className="text-brand-light font-semibold">
            {effectiveDate}
          </span>
        </div>
      </div>

      {/* Content Container */}
      <div className="space-y-8">
        {processedBlocks.map((block, i) => {
          if (Array.isArray(block)) {
            // Render bullet list
            return (
              <ul key={i} className="space-y-3 pl-6">
                {block.map((bullet, j) => (
                  <li
                    key={j}
                    className="text-textDim list-disc text-sm leading-relaxed"
                  >
                    {bullet.text}
                  </li>
                ))}
              </ul>
            );
          }

          switch (block.type) {
            case "h1":
              return (
                <div key={i} className="space-y-2">
                  <div className="bg-borderMuted h-px" />
                  <h2 className="text-brand pt-4 text-xl font-bold">
                    {block.text}
                  </h2>
                </div>
              );
            case "h2":
              return (
                <h3
                  key={i}
                  className="text-textMain pt-2 text-base font-semibold"
                >
                  {block.text}
                </h3>
              );
            case "note":
              return (
                <div
                  key={i}
                  className="bg-warn/5 border-warn/20 rounded-xl border p-4"
                >
                  <p className="text-warn/90 text-sm leading-relaxed italic">
                    {block.text}
                  </p>
                </div>
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

      {/* Footer */}
      <div className="bg-bgCard border-borderMuted mt-12 rounded-xl border p-6 text-center">
        <p className="text-textDim text-xs">
          If you have any questions about these legal documents, please contact
          us at{" "}
          <a
            href="mailto:support@schooldra.com"
            className="text-brand font-medium hover:underline"
          >
            support@Schooldra.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default LegalPage;
