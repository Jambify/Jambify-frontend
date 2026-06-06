import React from "react";
import { useOfflineStore } from "../../Store/useOfflineStore";
import { cn } from "../../lib/utils/utils";

export interface OfflinePack {
  id: string;
  subject: string;
  years: string;
  count: number;
  size: string;
}

const SUBJ_ICONS: Record<string, string> = {
  English: "📖",
  Mathematics: "🔢",
  Physics: "⚡",
  Chemistry: "⚗️",
  Biology: "🧬",
};

const SUBJ_COLORS: Record<string, string> = {
  English: "#7B5FFF",
  Mathematics: "#00C896",
  Physics: "#FFB020",
  Chemistry: "#FF4D6D",
  Biology: "#00C896",
};

const OfflinePackCard: React.FC<{ pack: OfflinePack }> = ({ pack }) => {
  const { downloadedPacks, downloadingId, downloadPack, removePack } =
    useOfflineStore();
  const isDownloaded = downloadedPacks.includes(pack.id);
  const isDownloading = downloadingId === pack.id;
  const color = SUBJ_COLORS[pack.subject] ?? "#7B5FFF";

  return (
    <div
      className={cn(
        "bg-bgCard rounded-brand-lg flex items-center gap-4 border p-4 transition-all",
        isDownloaded
          ? "border-success/30"
          : "border-borderMuted hover:border-white/10",
      )}
    >
      {/* <Subject icon */}
      <div
        className="rounded-brand flex h-11 w-11 shrink-0 items-center justify-center text-xl"
        style={{ background: color + "18" }}
      >
        {SUBJ_ICONS[pack.subject] ?? "📚"}
      </div>

      {/* <Info */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{pack.subject}</p>
        <p className="text-textDim mt-0.5 text-[11px]">
          {pack.count} questions · {pack.years} · {pack.size}
        </p>
        {isDownloaded && (
          <p className="text-success mt-1 flex items-center gap-1 text-[11px]">
            ✓ Downloaded — available offline
          </p>
        )}
        {isDownloading && (
          <div className="bg-bgSurface mt-2 h-1 overflow-hidden rounded-full">
            <div
              className="bg-brand h-full animate-pulse rounded-full"
              style={{ width: "60%" }}
            />
          </div>
        )}
      </div>

      {/* <Action button */}
      <div className="shrink-0">
        {isDownloading ? (
          <button
            disabled
            className="rounded-brand bg-bgSurface border-borderMuted text-textDim cursor-not-allowed border px-3 py-1.5 text-xs"
          >
            Downloading…
          </button>
        ) : isDownloaded ? (
          <button
            onClick={() => removePack(pack.id)}
            className="rounded-brand bg-danger/10 border-danger/20 text-danger hover:bg-danger/20 border px-3 py-1.5 text-xs transition-all"
          >
            Remove
          </button>
        ) : (
          <button
            onClick={() => downloadPack(pack.id)}
            className="rounded-brand bg-brand/10 border-brand/20 text-brand-light hover:bg-brand/20 flex items-center gap-1.5 border px-3 py-1.5 text-xs transition-all"
          >
            ↓ Download
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflinePackCard;
