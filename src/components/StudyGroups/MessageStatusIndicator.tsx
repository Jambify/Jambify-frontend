// src/components/StudyGroups/MessageStatusIndicator.tsx
import React from 'react';
import { Check, CheckCheck, Clock, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'failed';

interface Props {
  status: MessageStatus;
  onRetry?: () => void;
  className?: string;
}

const MessageStatusIndicator: React.FC<Props> = ({ status, onRetry, className }) => {
  if (status === 'sending') {
    return (
      <span className={cn('flex items-center gap-0.5 text-white/40', className)}>
        <Clock className="w-3 h-3 animate-pulse" />
      </span>
    );
  }

  if (status === 'sent') {
    return (
      <span className={cn('flex items-center gap-0.5 text-white/50', className)}>
        <Check className="w-3 h-3" />
      </span>
    );
  }

  if (status === 'delivered') {
    return (
      <span className={cn('flex items-center gap-0.5 text-white/70', className)}>
        <CheckCheck className="w-3 h-3" />
      </span>
    );
  }

  if (status === 'failed') {
    return (
      <button
        onClick={onRetry}
        title="Tap to retry"
        className={cn(
          'flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors',
          className
        )}
      >
        <WifiOff className="w-3 h-3" />
        {onRetry && <RefreshCw className="w-3 h-3 hover:rotate-180 transition-transform duration-500" />}
      </button>
    );
  }

  return null;
};

export default MessageStatusIndicator;