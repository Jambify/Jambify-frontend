import React from 'react';
import { useOfflineStore } from '../../Store/useOfflineStore';
import { cn } from '../../lib/utils';

export interface OfflinePack {
  id:      string;
  subject: string;
  years:   string;
  count:   number;
  size:    string;
}

const SUBJ_ICONS: Record<string, string> = {
  English: '📖', Mathematics: '🔢', Physics: '⚡',
  Chemistry: '⚗️', Biology: '🧬',
};

const SUBJ_COLORS: Record<string, string> = {
  English: '#7B5FFF', Mathematics: '#00C896', Physics: '#FFB020',
  Chemistry: '#FF4D6D', Biology: '#00C896',
};

const OfflinePackCard: React.FC<{ pack: OfflinePack }> = ({ pack }) => {
  const { downloadedPacks, downloadingId, downloadPack, removePack } = useOfflineStore();
  const isDownloaded  = downloadedPacks.includes(pack.id);
  const isDownloading = downloadingId === pack.id;
  const color         = SUBJ_COLORS[pack.subject] ?? '#7B5FFF';

  return (
    <div className={cn(
      'bg-bgCard border rounded-brand-lg p-4 flex items-center gap-4 transition-all',
      isDownloaded ? 'border-success/30' : 'border-borderMuted hover:border-white/10',
    )}>

      {/* <Subject icon */}
      <div
        className="w-11 h-11 rounded-brand flex items-center justify-center text-xl shrink-0"
        style={{ background: color + '18' }}
      >
        {SUBJ_ICONS[pack.subject] ?? '📚'}
      </div>

      {/* <Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{pack.subject}</p>
        <p className="text-[11px] text-textDim mt-0.5">
          {pack.count} questions · {pack.years} · {pack.size}
        </p>
        {isDownloaded && (
          <p className="text-[11px] text-success mt-1 flex items-center gap-1">
            ✓ Downloaded — available offline
          </p>
        )}
        {isDownloading && (
          <div className="mt-2 h-1 bg-bgSurface rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        )}
      </div>

      {/* <Action button */}
      <div className="shrink-0">
        {isDownloading ? (
          <button
            disabled
            className="text-xs px-3 py-1.5 rounded-brand bg-bgSurface border border-borderMuted text-textDim cursor-not-allowed"
          >
            Downloading…
          </button>
        ) : isDownloaded ? (
          <button
            onClick={() => removePack(pack.id)}
            className="text-xs px-3 py-1.5 rounded-brand bg-danger/10 border border-danger/20 text-danger hover:bg-danger/20 transition-all"
          >
            Remove
          </button>
        ) : (
          <button
            onClick={() => downloadPack(pack.id)}
            className="text-xs px-3 py-1.5 rounded-brand bg-brand/10 border border-brand/20 text-brand-light hover:bg-brand/20 transition-all flex items-center gap-1.5"
          >
            ↓ Download
          </button>
        )}
      </div>
    </div>
  );
};

export default OfflinePackCard;