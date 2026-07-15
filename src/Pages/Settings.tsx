import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import AppLayout from "../components/Layout/AppLayout";
import { useUserStore } from "../Store/useUserStore";
import ProfileForm from "../components/Settings/ProfileForm";
import ExamSettings from "../components/Settings/ExamSettings";
import DangerZone from "../components/Settings/DangerZone";
import HelpSupport from "../components/Settings/HelpSupport";
import { cn } from "../lib/utils/utils";

type Tab = "profile" | "exam" | "account" | "help";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "profile", label: "Profile", icon: "👤" },
  { id: "exam", label: "Exam settings", icon: "🎯" },
  { id: "account", label: "Account", icon: "⚙️" },
  { id: "help", label: "Help & Support", icon: "❓" },
];

const Settings: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { name } = useUserStore();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>(
    (location.state as any)?.activeTab || "profile",
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
      <div className="mx-auto max-w-2xl">
        {/* <── Page header ── */}
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Settings
          </h2>
          <p className="text-textMuted mt-1 text-sm">
            Manage your profile, exam targets, and account preferences.
          </p>
        </div>

        {/* <── Avatar + name hero ── */}
        <div className="bg-bgCard border-borderMuted rounded-brand-xl mb-5 flex items-center gap-4 border p-5">
          <div className="bg-brand font-display shadow-brand flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white">
            {initials || "?"}
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">
              {name || "Your name"}
            </p>
            <p className="text-textMuted mt-0.5 text-sm">Schooldra student</p>
          </div>
        </div>

        {/* <── Tab switcher ── */}
        <div className="bg-bgSurface rounded-brand-lg border-borderMuted mb-5 flex gap-1 border p-1">
          {TABS.map((tab) => (
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
              <span className="text-base leading-none">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* <── Tab content ── */}
        <div className="animate-fadeIn">
          {activeTab === "profile" && <ProfileForm />}
          {activeTab === "exam" && <ExamSettings />}
          {activeTab === "account" && <DangerZone />}
          {activeTab === "help" && <HelpSupport />}
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
