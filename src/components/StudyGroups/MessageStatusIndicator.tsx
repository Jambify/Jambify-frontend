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
      <span className={cn("text-textDim flex items-center gap-0.5", className)}>
        <Clock className="h-3 w-3 animate-pulse" />
      </span>
    );
  }

  if (status === "sent") {
    return (
      <span
        className={cn("text-textMuted flex items-center gap-0.5", className)}
      >
        <Check className="h-3 w-3" />
      </span>
    );
  }

  if (status === "delivered") {
    return (
      <span
        className={cn("text-brand-light flex items-center gap-0.5", className)}
      >
        <CheckCheck className="h-3 w-3" />
      </span>
    );
  }

  if (status === "failed") {
    return (
      <button
        onClick={onRetry}
        title="Tap to retry"
        className={cn(
          "text-danger hover:text-danger/80 flex items-center gap-1 transition-all active:scale-95",
          className,
        )}
      >
        <WifiOff className="h-3.5 w-3.5" />
        {onRetry && <RefreshCw className="h-3 w-3 animate-spin" />}
      </button>
    );
  }

  return null;
};

export default MessageStatusIndicator;
