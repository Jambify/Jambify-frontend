import React from "react";
import { WifiOff, RefreshCcw, X } from "lucide-react";

interface NetworkErrorAlertProps {
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const NetworkErrorAlert: React.FC<NetworkErrorAlertProps> = ({
  message = "You're currently offline. Please check your internet connection.",
  onRetry,
  onDismiss,
}) => {
  return (
    <div className="network-error-alert fixed top-6 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 animate-in fade-in slide-in-from-top-8 duration-500">
      <div className="relative overflow-hidden rounded-2xl bg-[#ff4d4d] p-5 shadow-2xl ring-1 ring-white/20">
        {/* Decorative background element */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-black/10 blur-xl" />

        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white shadow-inner">
            <WifiOff size={24} strokeWidth={2.5} />
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-black uppercase tracking-widest text-white/90">
                Network Error
              </h3>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="rounded-lg p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            
            <p className="mt-2 text-[15px] font-bold leading-snug text-white">
              {message}
            </p>

            <div className="mt-4 flex gap-3">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[13px] font-black uppercase tracking-wider text-[#ff4d4d] transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
                >
                  <RefreshCcw size={14} strokeWidth={3} />
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkErrorAlert;