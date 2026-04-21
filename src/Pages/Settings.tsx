import React, { useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { useUserStore } from '../Store/UseUserStore';
import ProfileForm from '../components/Settings/ProfileForm';
import ExamSettings from '../components/Settings/ExamSettings';
import DangerZone from '../components/Settings/DangerZone';
import { cn } from '../lib/utils';

type Tab = 'profile' | 'exam' | 'account';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'profile', label: 'Profile',      icon: '👤' },
  { id: 'exam',    label: 'Exam settings', icon: '🎯' },
  { id: 'account', label: 'Account',       icon: '⚙️' },
];

const Settings: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { name } = useUserStore();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <AppLayout currentPage="settings" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
      <div className="max-w-2xl mx-auto">

        {/* <── Page header ── */}
        <div className="mb-6">
          <h2 className="font-display text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-sm text-textMuted mt-1">
            Manage your profile, exam targets, and account preferences.
          </p>
        </div>

        {/* <── Avatar + name hero ── */}
        <div className="bg-bgCard border border-borderMuted rounded-brand-xl p-5 mb-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center font-display text-xl font-bold text-white shrink-0 shadow-brand">
            {initials || '?'}
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight">
              {name || 'Your name'}
            </p>
            <p className="text-sm text-textMuted mt-0.5">JAMBIFY student</p>
          </div>
        </div>

        {/* <── Tab switcher ── */}
        <div className="flex gap-1 mb-5 bg-bgSurface p-1 rounded-brand-lg border border-borderMuted">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-brand text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-bgCard text-textMain shadow-sm border border-borderMuted'
                  : 'text-textMuted hover:text-textMain touch-target no-double-tap active:scale-95',
              )}
            >
              <span className="text-base leading-none">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* <── Tab content ── */}
        <div className="animate-fadeIn">
          {activeTab === 'profile' && <ProfileForm />}
          {activeTab === 'exam'    && <ExamSettings />}
          {activeTab === 'account' && <DangerZone />}
        </div>

      </div>
    </AppLayout>
  );
};

export default Settings;