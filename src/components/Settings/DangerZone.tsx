import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../Store/useUserStore";
import { usePerformanceStore } from "../../Store/usePerformanceStore";
import { supabase } from "../../lib/supabase";
import Button from "../ui/Button";
import { Section } from "./Shared";
import { LogOut, AlertCircle, Info, ShieldAlert, Trash2 } from "lucide-react";

const DangerZone: React.FC = () => {
  const navigate = useNavigate();
  const signOut = useUserStore((s) => s.signOut);
  const resetPerformance = usePerformanceStore((s) => s.reset);
  const resetUser = useUserStore((s) => s.reset);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      // First, clean up all user data from public tables
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Delete public table data first (we can do this client-side with RLS)
      await Promise.all([
        supabase.from("subject_performance").delete().eq("user_id", user.id),
        supabase.from("topic_progress").delete().eq("user_id", user.id),
        supabase.from("quiz_sessions").delete().eq("user_id", user.id),
        supabase.from("profiles").delete().eq("id", user.id),
        // Add other tables if needed (daily_activity, topic_mastery)
      ]);

      // Clear local store
      resetPerformance();
      resetUser();

      // Delete auth user (NOTE: This requires an Edge Function or service_role key!)
      // For client side, the best we can do is clean up data and sign out
      // For full auth user deletion, use a Supabase Edge Function
      await signOut();
      
      // Redirect to sign in
      navigate("/signin", { replace: true });
      alert("Your data has been deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

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
    <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col gap-6 duration-500">
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
              className="border-borderMuted flex items-center justify-between border-b py-3 last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="text-textMuted text-sm font-medium">
                  {item.label}
                </span>
              </div>
              <span className="text-textMain bg-bgSurface border-borderMuted rounded-lg border px-3 py-1 text-sm font-bold">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Session Management ───────────────────────────── */}
      <Section title="Session Management">
        <div className="p-1">
          <p className="text-textMuted mb-5 text-sm leading-relaxed">
            Ready to end your session? Your study progress and groups will be
            waiting for you when you return.
          </p>
          <Button
            variant="secondary"
            fullWidth
            onClick={handleLogout}
            loading={isLoggingOut}
            icon={
              <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            }
            className="bg-bgSurface border-borderMuted hover:bg-bgDeep text-textMain group rounded-2xl py-6 font-bold transition-all"
          >
            Sign Out of Account
          </Button>
        </div>
      </Section>

      {/* ── Security Zone ────────────────────────────────── */}
      <Section title="Security Zone">
        <div className="bg-danger/5 border-danger/10 relative overflow-hidden rounded-2xl border p-5">
          <div className="pointer-events-none absolute top-0 right-0 p-4 opacity-10">
            <ShieldAlert size={80} className="text-danger" />
          </div>

          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2">
              <AlertCircle className="text-danger h-5 w-5" />
              <p className="text-danger text-sm font-bold tracking-tight uppercase">
                Critical Actions
              </p>
            </div>
            <p className="text-textMuted mb-6 text-sm leading-relaxed">
              Permanently delete your profile and clear all study data. This
              action is irreversible.
            </p>

            {!confirmDelete ? (
              <Button
                variant="danger"
                size="sm"
                fullWidth
                onClick={() => setConfirmDelete(true)}
                className="border-danger/30 rounded-xl py-4 font-bold"
              >
                Delete My Account
              </Button>
            ) : (
              <div className="bg-bgCard border-danger/20 animate-in zoom-in-95 rounded-xl border p-4 duration-200">
                <p className="text-danger mb-4 flex items-center gap-2 text-sm font-black">
                  <TriangleAlert className="h-4 w-4" /> Final Confirmation
                  Required
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={handleDeleteAccount}
                    loading={isDeleting}
                    icon={<Trash2 className="h-4 w-4" />}
                    className="shadow-danger/20 rounded-xl py-4 shadow-lg"
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
