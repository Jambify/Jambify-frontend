import React, { useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { useGroupStore } from '../Store/useGroupStore';
// import { useUserStore } from '../Store/UseUserStore';
import GroupCard from '../components/StudyGroups/GroupCard';
import GroupChat from '../components/StudyGroups/GroupChat';
import CreateGroupModal from '../components/StudyGroups/CreateGroupModal';
import Button from '../components/ui/Button';

const StudyGroups: React.FC = () => {
     const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { groups, myGroupIds, joinGroup, leaveGroup } = useGroupStore();
//   const { name } = useUserStore();
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [showCreate, setShowCreate]       = useState(false);
  const [tab, setTab]                     = useState<'discover' | 'my-groups'>('discover');

  const myGroups       = groups.filter(g => myGroupIds.includes(g.id));
  const discoverGroups = groups.filter(g => !myGroupIds.includes(g.id));
  const activeGroup    = groups.find(g => g.id === activeGroupId);

  /* ── If a group is open show the chat view ── */
  if (activeGroup) {
    return (
      <AppLayout currentPage="groups" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
        <GroupChat
          group={activeGroup}
          onBack={() => setActiveGroupId(null)}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout currentPage="groups" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>

      {/* <Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Study Groups</h2>
          <p className="text-sm text-textMuted mt-1">
            Study with peers, share strategies, challenge each other.
          </p>
        </div>
        <Button
          variant="primary" size="sm"
          onClick={() => setShowCreate(true)}
          icon={<span className="text-base leading-none">+</span>}
        >
          Create group
        </Button>
      </div>

      {/* <Tab switcher */}
      <div className="flex gap-1 bg-bgSurface border border-borderMuted rounded-brand p-1 mb-5 w-fit">
        {([
          ['discover',  'Discover'],
          ['my-groups', `My groups${myGroups.length ? ` (${myGroups.length})` : ''}`],
        ] as [string, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={`px-4 py-1.5 rounded text-xs font-medium transition-all ${
              tab === key
                ? 'bg-bgCard text-textMain border border-borderMuted shadow-sm'
                : 'text-textMuted hover:text-textMain'
            }`}
          >{label}</button>
        ))}
      </div>

      {/* <Discover tab */}
      {tab === 'discover' && (
        <div className="animate-fadeIn">
          {discoverGroups.length === 0 ? (
            <div className="text-center py-12 text-textDim">
              <div className="text-4xl mb-3">🎉</div>
              <p className="text-sm">You've joined all available groups!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {discoverGroups.map(g => (
                <GroupCard
                  key={g.id} group={g}
                  isMember={false}
                  onJoin={() => joinGroup(g.id)}
                  onOpen={() => setActiveGroupId(g.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* <My groups tab */}
      {tab === 'my-groups' && (
        <div className="animate-fadeIn">
          {myGroups.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-sm text-textDim mb-4">
                You haven't joined any groups yet.
              </p>
              <Button variant="secondary" size="sm"
                onClick={() => setTab('discover')}>
                Browse groups
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myGroups.map(g => (
                <GroupCard
                  key={g.id} group={g}
                  isMember={true}
                  onLeave={() => leaveGroup(g.id)}
                  onOpen={() => setActiveGroupId(g.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <CreateGroupModal onClose={() => setShowCreate(false)} />
      )}

    </AppLayout>
  );
};

export default StudyGroups;