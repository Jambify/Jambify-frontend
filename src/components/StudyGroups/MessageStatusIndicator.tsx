// src/components/StudyGroups/MessageStatusIndicator.tsx
import React from "react";
import { Check, CheckCheck, Clock, WifiOff, RefreshCw } from "lucide-react";
import { cn } from "../../lib/utils/utils";

export type MessageStatus = "sending" | "sent" | "delivered" | "failed";

interface Props {
  status: MessageStatus;
  onRetry?: () => void;
  className?: string;
}

const MessageStatusIndicator: React.FC<Props> = ({
  status,
  onRetry,
  className,
}) => {
  if (status === "sending") {
    return (
      <span className={cn("flex items-center gap-0.5 text-textDim", className)}>
        <Clock className="w-3 h-3 animate-pulse" />
      </span>
    );
  }

  if (status === "sent") {
    return (
      <span
        className={cn("flex items-center gap-0.5 text-textMuted", className)}
      >
        <Check className="w-3 h-3" />
      </span>
    );
  }

  if (status === "delivered") {
    return (
      <span
        className={cn("flex items-center gap-0.5 text-brand-light", className)}
      >
        <CheckCheck className="w-3 h-3" />
      </span>
    );
  }

  if (status === "failed") {
    return (
      <button
        onClick={onRetry}
        title="Tap to retry"
        className={cn(
          "flex items-center gap-1 text-danger hover:text-danger/80 transition-all active:scale-95",
          className,
        )}
      >
        <WifiOff className="w-3.5 h-3.5" />
        {onRetry && <RefreshCw className="w-3 h-3 animate-spin" />}
      </button>
    );
  }

  return null;
};

export default MessageStatusIndicator;
