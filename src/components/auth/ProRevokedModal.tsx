import React, { useEffect, useRef, useState } from "react";
import { useUserStore } from "../../Store/useUserStore";
import { AlertTriangle } from "lucide-react";

const ProRevokedModal: React.FC = () => {
  const { isPro, isAuthenticated } = useUserStore();
  const [showModal, setShowModal] = useState(false);
  const prevIsProRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      prevIsProRef.current = null;
      return;
    }

    // Check if pro was just revoked
    if (prevIsProRef.current === true && isPro === false) {
      setShowModal(true);
    }
    prevIsProRef.current = isPro;
  }, [isPro, isAuthenticated]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowModal(false)}
      />
      <div className="bg-bgCard border-danger/30 rounded-brand-xl animate-in fade-in zoom-in-95 relative z-10 w-full max-w-md border p-8 shadow-2xl duration-200">
        <div className="bg-warn/10 border-warn/25 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border">
          <AlertTriangle className="text-warn h-8 w-8" />
        </div>
        <h2 className="text-textMain mb-3 text-center text-2xl font-bold">
          Pro Access Revoked
        </h2>
        <p className="text-textDim mb-6 text-center">
          Your Pro access has been revoked. If this was a mistake, please
          contact us at{" "}
          <span className="text-brand font-semibold">
            support@schooldra.com
          </span>
          .
        </p>
        <button
          onClick={() => setShowModal(false)}
          className="rounded-brand bg-brand hover:bg-brand-light shadow-brand/20 flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-white shadow-md transition-all"
        >
          Okay, Got it
        </button>
      </div>
    </div>
  );
};

export default ProRevokedModal;
