import React from "react";
import { cn } from "../../lib/utils/utils";

interface StatCardProps {
  emoji: string;
  label: string;
  value: string;
  change: string;
  up?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  emoji,
  label,
  value,
  change,
  up,
}) => (
  <div className="bg-bgCard border-borderMuted rounded-brand-lg hover:border-brand/20 group border p-5 transition-colors">
    <div className="bg-brand/5 group-hover:bg-brand/10 mb-3 flex h-9 w-9 items-center justify-center rounded-lg text-lg transition-colors">
      {emoji}
    </div>
    <p className="text-textDim mb-1 text-[11px] font-medium tracking-widest uppercase">
      {label}
    </p>
    <p className="font-display text-2xl font-bold tracking-tight">{value}</p>
    <p className={cn("mt-1 text-[11px]", up ? "text-success" : "text-textDim")}>
      {up && "↑ "}
      {change}
    </p>
  </div>
);

export default StatCard;
