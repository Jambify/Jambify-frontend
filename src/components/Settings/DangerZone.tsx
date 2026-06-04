import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../Store/useUserStore";
import Button from "../ui/Button";
import { Section } from "./Shared";
import { LogOut, AlertCircle, Info, ShieldAlert } from "lucide-react";

const DangerZone: React.FC = () => {
  const navigate = useNavigate();
  const signOut = useUserStore((s) => s.signOut);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate("/signin", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── App Information ─────────────────────────────── */}
      <Section title="System Information">
        <div className="flex flex-col gap-1">
          {[
            { label: "App Version", value: "1.0.4 (Stable)", icon: Info },
            { label: "Platform", value: "JAMBIFY Web + Mobile", icon: Info },
            { label: "Security", value: "End-to-end encryption", icon: Info },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-3 border-b border-borderMuted last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm text-textMuted font-medium">
                  {item.label}
                </span>
              </div>
              <span className="text-sm text-textMain font-bold bg-bgSurface px-3 py-1 rounded-lg border border-borderMuted">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Session Management ───────────────────────────── */}
      <Section title="Session Management">
        <div className="p-1">
          <p className="text-sm text-textMuted mb-5 leading-relaxed">
            Ready to end your session? Your study progress and groups will be
            waiting for you when you return.
          </p>
          <Button
            variant="secondary"
            fullWidth
            onClick={handleLogout}
            loading={isLoggingOut}
            icon={
              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            }
            className="bg-bgSurface border-borderMuted hover:bg-bgDeep text-textMain font-bold py-6 rounded-2xl group transition-all"
          >
            Sign Out of Account
          </Button>
        </div>
      </Section>

      {/* ── Security Zone ────────────────────────────────── */}
      <Section title="Security Zone">
        <div className="bg-danger/5 border border-danger/10 rounded-2xl p-5 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <ShieldAlert size={80} className="text-danger" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-danger" />
              <p className="text-sm font-bold text-danger uppercase tracking-tight">
                Critical Actions
              </p>
            </div>
            <p className="text-sm text-textMuted mb-6 leading-relaxed">
              Permanently delete your profile and clear all study data. This
              action is irreversible.
            </p>

            {!confirmDelete ? (
              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={() => setConfirmDelete(true)}
                className="font-bold py-4 rounded-xl border-danger/30"
              >
                Delete My Account
              </Button>
            ) : (
              <div className="bg-bgCard border border-danger/20 rounded-xl p-4 animate-in zoom-in-95 duration-200">
                <p className="text-sm text-danger font-black mb-4 flex items-center gap-2">
                  <TriangleAlert className="w-4 h-4" /> Final Confirmation
                  Required
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => {
                      /* Handle delete logic if needed */
                    }}
                    className="py-4 rounded-xl shadow-lg shadow-danger/20"
                  >
                    Yes, Delete Everything
                  </Button>
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => setConfirmDelete(false)}
                    className="text-textDim hover:text-white"
                  >
                    Cancel Action
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Section>
    </div>
  );
};

const TriangleAlert = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export default DangerZone;
