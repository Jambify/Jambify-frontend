// src/components/ui/ConfirmModal.tsx
import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { cn } from "../../lib/utils/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger",
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: "bg-danger/10 text-danger",
          button: "bg-danger hover:bg-danger/80 text-white",
        };
      case "warning":
        return {
          icon: "bg-warn/10 text-warn",
          button: "bg-warn hover:bg-warn/80 text-white",
        };
      default:
        return {
          icon: "bg-brand/10 text-brand",
          button: "bg-brand hover:bg-brand-light text-white",
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-bgCard border-borderMuted rounded-brand-2xl animate-in fade-in zoom-in w-full max-w-sm overflow-hidden border shadow-2xl duration-200">
        <div className="border-borderMuted flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                typeStyles.icon,
              )}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
            <h3 className="font-display text-lg font-bold">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-bgSurface flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
          >
            <X className="text-textDim h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-textMuted text-sm leading-relaxed">{message}</p>
        </div>

        <div className="border-borderMuted bg-bgSurface/50 flex gap-3 border-t p-4">
          <button
            onClick={onClose}
            className="rounded-brand bg-bgCard border-borderMuted text-textMain hover:bg-bgDeep flex-1 border py-2.5 text-sm font-medium transition-colors active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "rounded-brand flex-1 py-2.5 text-sm font-medium transition-all active:scale-95",
              typeStyles.button,
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
