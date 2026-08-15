import React from "react";
import { cn } from "../../lib/utils/utils";
import { ExplanationText } from "../shared/ExplanationText";

interface ExplanationBoxProps {
  visible: boolean;
  text: string;
}

const ExplanationBox: React.FC<ExplanationBoxProps> = ({ visible, text }) => {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "border-brand rounded-r-brand-lg border-l-[3px]",
        "bg-brand/5 border-brand/20 border-l-brand border px-4 py-3.5",
        "animate-slideDown",
      )}
    >
      <div className="mb-1.5 flex items-center gap-2">
        <span className="text-sm">💡</span>
        <span className="text-brand-light text-[11px] font-semibold tracking-widest uppercase">
          Explanation
        </span>
      </div>
      <p className="text-textMuted text-sm leading-relaxed">
        <ExplanationText text={text} />
      </p>
    </div>
  );
};

export default ExplanationBox;