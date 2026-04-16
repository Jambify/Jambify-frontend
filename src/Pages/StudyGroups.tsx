import React, { useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { useGroupStore } from '../Store/useGroupStore';
import GroupCard from '../components/StudyGroups/GroupCard';
import GroupChat from '../components/StudyGroups/GroupChat';
import CreateGroupModal from '../components/StudyGroups/CreateGroupModal';
import Button from '../components/ui/Button';
import { cn } from '../lib/utils';
import { Users, Plus, Search, TriangleAlert, Filter, Beaker, Cpu, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TabButtonProps {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={cn(
      'px-4 py-1.5 rounded-brand text-xs font-medium transition-all',
      isActive
        ? 'bg-bgCard text-textMain border border-borderMuted shadow-sm'
        : 'text-textMuted hover:text-textMain'
    )}
  >
    {children}
  </button>
);

const StudyGroups: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { groups, myGroupIds, joinGroup, leaveGroup } = useGroupStore();
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [tab, setTab] = useState<'discover' | 'my-groups'>('discover');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [groupToLeave, setGroupToLeave] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Subject categories
  const subjectCategories = [
    { id: 'all', name: 'All Groups', icon: Filter },
    { id: 'science', name: 'Science', icon: Beaker, subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics'] },
    { id: 'engineering', name: 'Engineering', icon: Cpu, subjects: ['Mathematics', 'Physics'] },
    { id: 'arts-social', name: 'Arts & Social', icon: Palette, subjects: ['English', 'Literature', 'Economics', 'Government', 'CRS/IRS', 'History'] }
  ];

  const myGroups = groups.filter(g => myGroupIds.includes(g.id));
  const discoverGroups = groups.filter(g => !myGroupIds.includes(g.id));
  const activeGroup = groups.find(g => g.id === activeGroupId);

  // Filter groups based on selected category
  const getFilteredGroups = (groupsList: typeof groups) => {
    if (selectedCategory === 'all') return groupsList;
    
    const category = subjectCategories.find(cat => cat.id === selectedCategory);
    if (!category) return groupsList;
    
    return groupsList.filter(group => 
      (category.subjects?.includes(group.subject) || false) || 
      group.subject === 'Mixed'
    );
  };

  const filteredDiscoverGroups = getFilteredGroups(discoverGroups);
  const filteredMyGroups = getFilteredGroups(myGroups);

  const handleLeaveGroup = (groupId: string) => {
    setGroupToLeave(groupId);
    setIsLeaveModalOpen(true);
  };

  const confirmLeaveGroup = () => {
    if (groupToLeave) {
      leaveGroup(groupToLeave);
      setGroupToLeave(null);
      setIsLeaveModalOpen(false);
    }
  };

  const cancelLeaveGroup = () => {
    setGroupToLeave(null);
    setIsLeaveModalOpen(false);
  };

  // If a group is open show chat view
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">Study Groups</h2>
          <p className="text-sm text-textMuted mt-1">
            Study with peers, share strategies, challenge each other.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowCreate(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Create group
        </Button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-bgSurface border border-borderMuted rounded-brand p-1 mb-5 w-fit overflow-x-auto no-scrollbar">
        <TabButton
          isActive={tab === 'discover'}
          onClick={() => setTab('discover')}
        >
          <div className="flex items-center gap-2">
            <Search className="w-3 h-3" />
            Discover
          </div>
        </TabButton>
        <TabButton
          isActive={tab === 'my-groups'}
          onClick={() => setTab('my-groups')}
        >
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3" />
            My groups{myGroups.length > 0 && ` (${myGroups.length})`}
          </div>
        </TabButton>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 bg-bgSurface border border-borderMuted rounded-brand p-2 mb-5 overflow-x-auto no-scrollbar">
        {subjectCategories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-brand text-xs font-medium transition-all shrink-0',
                selectedCategory === category.id
                  ? 'bg-bgCard text-textMain border border-borderMuted shadow-sm'
                  : 'text-textMuted hover:text-textMain'
              )}
            >
              <Icon className="w-3 h-3" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Discover tab */}
      {tab === 'discover' && (
        <div className="animate-fadeIn">
          {filteredDiscoverGroups.length === 0 ? (
            <div className="text-center py-12 text-textDim">
              <div className="text-4xl mb-3">
                {selectedCategory === 'all' ? 'You\'ve joined all available groups!' : 'No groups in this category'}
              </div>
              <p className="text-sm">
                {selectedCategory === 'all' 
                  ? 'You\'ve joined all available groups!' 
                  : `No groups found in ${subjectCategories.find(cat => cat.id === selectedCategory)?.name}. Try other categories.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDiscoverGroups.map((g, index) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                >
                  <GroupCard
                    group={g}
                    isMember={false}
                    onJoin={() => joinGroup(g.id)}
                    onOpen={() => setActiveGroupId(g.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My groups tab */}
      {tab === 'my-groups' && (
        <div className="animate-fadeIn">
          {filteredMyGroups.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">
                {myGroups.length === 0 ? 'You haven\'t joined any groups yet.' : 'No groups in this category'}
              </div>
              <p className="text-sm text-textDim mb-4">
                {myGroups.length === 0 
                  ? 'You haven\'t joined any groups yet.' 
                  : `No groups found in ${subjectCategories.find(cat => cat.id === selectedCategory)?.name}. Try other categories.`
                }
              </p>
              {myGroups.length === 0 && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setTab('discover')}
                >
                  Browse groups
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMyGroups.map((g, index) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: index * 0.1,
                    ease: "easeOut"
                  }}
                >
                  <GroupCard
                    group={g}
                    isMember={true}
                    onLeave={() => handleLeaveGroup(g.id)}
                    onOpen={() => setActiveGroupId(g.id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <CreateGroupModal onClose={() => setShowCreate(false)} />
      )}

      {/* Leave Group Confirmation Modal */}
      <AnimatePresence>
        {isLeaveModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={cancelLeaveGroup}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-bgCard border border-borderMuted rounded-brand-2xl p-6 w-full max-w-md shadow-card"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Warning Icon */}
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10">
                <TriangleAlert className="w-8 h-8 text-amber-500" />
              </div>

              {/* Modal Content */}
              <div className="text-center mb-6">
                <h3 className="font-display text-xl font-bold tracking-tight text-textMain mb-2">
                  Leave this Squad?
                </h3>
                <p className="text-sm text-textMuted leading-relaxed">
                  You will lose access to the shared resources and discussion history for this group.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  size="md"
                  fullWidth
                  onClick={cancelLeaveGroup}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={confirmLeaveGroup}
                  className="bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20"
                >
                  Yes, Leave Group
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default StudyGroups;