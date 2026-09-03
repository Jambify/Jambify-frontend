import React, { useState } from "react";
import PageHelmet from "../components/SEO/PageHelmet";
import { useLocation, useNavigate } from "react-router";
import AppLayout from "../components/Layout/AppLayout";
import { useUserStore } from "../Store/useUserStore";
import ProfileForm from "../components/Settings/ProfileForm";
import ExamSettings from "../components/Settings/ExamSettings";
import DangerZone from "../components/Settings/DangerZone";
import HelpSupport from "../components/Settings/HelpSupport";
import OfflinePackCard from "../components/PastQuestions/OfflinePackCard";
import { OFFLINE_PACKS } from "../Data/offlinePacks";
import { cn } from "../lib/utils/utils";
import {
  User,
  Target,
  Settings as SettingsIcon,
  HelpCircle,
  Download,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Tab = "profile" | "exam" | "offline" | "account" | "help";

interface SettingsLocationState {
  activeTab?: Tab;
}

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "exam", label: "Exam settings", icon: Target },
  { id: "offline", label: "Offline packs", icon: Download },
  { id: "account", label: "Account", icon: SettingsIcon },
  { id: "help", label: "Help & Support", icon: HelpCircle },
];

const Settings: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { name, isAdmin, isModerator, isPro } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>(
    (location.state as SettingsLocationState)?.activeTab || "profile",
  );
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <AppLayout
      currentPage="settings"
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
    >
      <PageHelmet
        title="Settings | SCHOOLDRA"
        description="Manage your profile, exam targets, and account preferences for your JAMB UTME preparation."
        canonical="https://www.schooldra.com/settings"
      />
      <div className="mx-auto max-w-2xl">
        {/* Page header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Settings
            </h2>
            <p className="text-textMuted mt-1 text-sm">
              Manage your profile, exam targets, and account preferences.
            </p>
          </div>

          {/* Admin Panel Button — shown to both admin and moderator */}
          {(isAdmin || isModerator) && (
            <button
              onClick={() => navigate("/admin")}
              className="bg-brand hover:bg-brand/90 rounded-brand flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white transition-all sm:w-auto sm:py-2"
            >
              <Wrench className="h-4 w-4" />
              <span>Admin Panel</span>
            </button>
          )}
        </div>

        {/* Avatar + name hero */}
        <div className="bg-bgCard border-borderMuted rounded-brand-xl mb-5 flex items-center gap-4 border p-5">
          <div className="bg-brand font-display shadow-brand flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white">
            {initials || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-semibold tracking-tight wrap-break-word whitespace-normal">
              {name || "Your name"}
            </p>
            <p className="text-textMuted mt-0.5 text-sm">
              {isAdmin
                ? "Schooldra admin"
                : isModerator
                  ? "Schooldra moderator"
                  : "Schooldra student"}
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="bg-bgSurface rounded-brand-lg border-borderMuted mb-5 flex gap-1 border p-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "rounded-brand flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-bgCard text-textMain border-borderMuted border shadow-sm"
                    : "text-textMuted hover:text-textMain touch-target no-double-tap active:scale-95",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="animate-fadeIn">
          {activeTab === "profile" && <ProfileForm />}
          {activeTab === "exam" && <ExamSettings />}
          {activeTab === "offline" && (
            <section className="space-y-4">
              <div>
                <h3 className="font-display text-lg font-bold">
                  Offline packs
                </h3>
                <p className="text-textMuted mt-1 text-sm">
                  Download question packs now so you can practise without an
                  internet connection.
                </p>
              </div>
              {isPro ? (
                <div className="space-y-3">
                  {OFFLINE_PACKS.map((pack) => (
                    <OfflinePackCard key={pack.id} pack={pack} />
                  ))}
                </div>
              ) : (
                <div className="bg-bgCard border-borderMuted rounded-brand-xl border p-5 text-sm">
                  <p className="font-semibold">
                    Offline packs are a Pro feature.
                  </p>
                  <p className="text-textMuted mt-1">
                    Upgrade to download and manage question packs on this
                    device.
                  </p>
                </div>
              )}
            </section>
          )}
          {activeTab === "account" && <DangerZone />}
          {activeTab === "help" && <HelpSupport />}
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
