import React, { useState, useMemo } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { useUserStore } from '../Store/UseUserStore';
import Button from '../components/ui/Button';
import { Users,  Calendar, Star,  } from 'lucide-react';
import { cn } from '../lib/utils';

interface StudyGroup {
  id: string;
  name: string;
  subjectCombo: string;
  description: string;
  members: number;
  maxMembers: number;
  meetingTime: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  tags: string[];
  isJoined: boolean;
}

const SAMPLE_GROUPS: StudyGroup[] = [
  {
    id: '1',
    name: 'Medicine Masters 2025',
    subjectCombo: 'medicine',
    description: 'Focused group for medical school aspirants covering Biology, Chemistry, and Physics.',
    members: 12,
    maxMembers: 15,
    meetingTime: 'Mon, Wed, Fri - 4:00 PM',
    difficulty: 'Advanced',
    rating: 4.8,
    tags: ['Biology', 'Chemistry', 'Physics', 'Medical School'],
    isJoined: false
  },
  {
    id: '2',
    name: 'Engineering Elite',
    subjectCombo: 'engineering',
    description: 'Math and Physics intensive group for engineering candidates.',
    members: 8,
    maxMembers: 12,
    meetingTime: 'Tue, Thu - 5:30 PM',
    difficulty: 'Advanced',
    rating: 4.6,
    tags: ['Mathematics', 'Physics', 'Engineering', 'Problem Solving'],
    isJoined: false
  },
  {
    id: '3',
    name: 'Commerce Champions',
    subjectCombo: 'social-sci',
    description: 'Economics and Government focused study group for business students.',
    members: 15,
    maxMembers: 20,
    meetingTime: 'Sat - 10:00 AM',
    difficulty: 'Intermediate',
    rating: 4.5,
    tags: ['Economics', 'Government', 'Commerce', 'Business'],
    isJoined: false
  },
  {
    id: '4',
    name: 'Law & Arts Collective',
    subjectCombo: 'law',
    description: 'Literature and Government preparation for law school candidates.',
    members: 10,
    maxMembers: 15,
    meetingTime: 'Wed, Sun - 3:00 PM',
    difficulty: 'Intermediate',
    rating: 4.7,
    tags: ['Literature', 'Government', 'Law', 'Arts'],
    isJoined: false
  },
  {
    id: '5',
    name: 'Science Foundation',
    subjectCombo: 'medicine',
    description: 'Beginner-friendly group covering basic sciences for medical aspirants.',
    members: 18,
    maxMembers: 25,
    meetingTime: 'Daily - 6:00 PM',
    difficulty: 'Beginner',
    rating: 4.4,
    tags: ['Biology', 'Chemistry', 'Beginner', 'Foundation'],
    isJoined: false
  }
];

const SUBJECT_COMBO_LABELS: Record<string, string> = {
  'medicine': 'Medicine & Pharmacy',
  'engineering': 'Engineering & Tech',
  'social-sci': 'Social Sciences',
  'law': 'Law & Arts'
};

const DIFFICULTY_COLORS: Record<string, string> = {
  'Beginner': 'text-green-500 bg-green-500/10',
  'Intermediate': 'text-yellow-500 bg-yellow-500/10',
  'Advanced': 'text-red-500 bg-red-500/10'
};

const StudyGroups: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { subjectCombo: userSubjectCombo } = useUserStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [joinedGroups, setJoinedGroups] = useState<string[]>([]);

  const filteredGroups = useMemo(() => {
    if (selectedFilter === 'all') {
      return SAMPLE_GROUPS;
    }
    if (selectedFilter === 'my-combo' && userSubjectCombo) {
      return SAMPLE_GROUPS.filter(group => group.subjectCombo === userSubjectCombo);
    }
    return SAMPLE_GROUPS.filter(group => group.subjectCombo === selectedFilter);
  }, [selectedFilter, userSubjectCombo]);

  const handleJoinGroup = (groupId: string) => {
    setJoinedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isGroupJoined = (groupId: string) => joinedGroups.includes(groupId);

  return (
    <AppLayout currentPage="study-groups" isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Study Groups</h1>
          <p className="text-gray-400">
            Connect with peers studying the same subjects as you
            {userSubjectCombo && ` (${SUBJECT_COMBO_LABELS[userSubjectCombo] || userSubjectCombo})`}
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedFilter('all')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              selectedFilter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            )}
          >
            All Groups
          </button>
          {userSubjectCombo && (
            <button
              onClick={() => setSelectedFilter('my-combo')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                selectedFilter === 'my-combo'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
            >
              My Subject Combo
            </button>
          )}
          {Object.entries(SUBJECT_COMBO_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedFilter(key)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                selectedFilter === key
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-gray-800 border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition-all"
            >
              {/* Group Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{group.name}</h3>
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                    {SUBJECT_COMBO_LABELS[group.subjectCombo]}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-white">{group.rating}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">{group.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {group.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {group.tags.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                    +{group.tags.length - 3}
                  </span>
                )}
              </div>

              {/* Group Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{group.members}/{group.maxMembers} members</span>
                  </div>
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    DIFFICULTY_COLORS[group.difficulty]
                  )}>
                    {group.difficulty}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{group.meetingTime}</span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                onClick={() => handleJoinGroup(group.id)}
                className={cn(
                  'w-full',
                  isGroupJoined(group.id)
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                )}
              >
                {isGroupJoined(group.id) ? 'Joined' : 'Join Group'}
              </Button>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No groups found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your filters or check back later for new groups.
            </p>
            <Button
              onClick={() => setSelectedFilter('all')}
              variant="secondary"
              className="bg-gray-800 hover:bg-gray-700 text-white"
            >
              View All Groups
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StudyGroups;