// src/components/ui/ConfirmModal.tsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'bg-danger/10 text-danger',
          button: 'bg-danger hover:bg-danger/80 text-white',
        };
      case 'warning':
        return {
          icon: 'bg-warn/10 text-warn',
          button: 'bg-warn hover:bg-warn/80 text-white',
        };
      default:
        return {
          icon: 'bg-brand/10 text-brand',
          button: 'bg-brand hover:bg-brand-light text-white',
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-bgCard border border-borderMuted rounded-brand-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-borderMuted">
          <div className="flex items-center gap-3">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", typeStyles.icon)}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="font-display font-bold text-lg">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bgSurface transition-colors"
          >
            <X className="w-4 h-4 text-textDim" />
          </button>
        </div>
        
        <div className="p-5">
          <p className="text-sm text-textMuted leading-relaxed">{message}</p>
        </div>
        
        <div className="flex gap-3 p-4 border-t border-borderMuted bg-bgSurface/50">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-brand text-sm font-medium bg-bgCard border border-borderMuted text-textMain hover:bg-bgDeep transition-colors active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={cn("flex-1 py-2.5 rounded-brand text-sm font-medium transition-all active:scale-95", typeStyles.button)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;