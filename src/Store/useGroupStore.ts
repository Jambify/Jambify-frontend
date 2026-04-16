import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ChatMessage {
  id:     string;
  author: string;
  text:   string;
  time:   string;
}

export interface StudyGroup {
  id:            string;
  name:          string;
  description:   string;
  subject:       string;
  icon:          string;
  memberCount:   number;
  recentMembers: string[];
  isActive:      boolean;
  messages:      ChatMessage[];
}

interface GroupState {
  groups:       StudyGroup[];
  myGroupIds:   string[];
  createGroup:  (data: Pick<StudyGroup, 'name' | 'description' | 'subject' | 'icon'>) => void;
  joinGroup:    (id: string) => void;
  leaveGroup:   (id: string) => void;
  sendMessage:  (groupId: string, msg: Pick<ChatMessage, 'author' | 'text'>) => void;
  getMessages:  (groupId: string) => ChatMessage[];
}

const now = () => new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      myGroupIds: [],

      groups: [
        {
          id: 'g1', icon: '⚗️', subject: 'Chemistry',
          name: 'Chemistry Crew 2025',
          description: 'Focused on organic reactions, acid-base chemistry and JAMB past questions from 2015 onwards.',
          memberCount: 47, isActive: true,
          recentMembers: ['Tunde', 'Ngozi', 'Fatima', 'Emeka', 'Amara'],
          messages: [
            { id: 'm1', author: 'Tunde',  text: 'Anyone understand the equilibrium constant question from 2022?', time: '09:14' },
            { id: 'm2', author: 'Ngozi',  text: 'Yes! Le Chatelier principle — increase pressure shifts equilibrium toward fewer moles of gas.', time: '09:17' },
            { id: 'm3', author: 'Fatima', text: 'Thanks Ngozi. The 2019 organic naming question was confusing too.', time: '09:22' },
          ],
        },
        {
          id: 'g2', icon: '🔢', subject: 'Mathematics',
          name: 'Maths Masters',
          description: 'Tackling integration, sequences, and permutations together. Daily problem sets and solution sharing.',
          memberCount: 63, isActive: false,
          recentMembers: ['Emeka', 'Amara', 'Chidi', 'Zara'],
          messages: [
            { id: 'm4', author: 'Chidi', text: 'GP sum formula: Sn = a(1-rⁿ)/(1-r). Memorise this!', time: '08:05' },
            { id: 'm5', author: 'Zara',  text: 'What about when r=1? The formula breaks down.', time: '08:09' },
            { id: 'm6', author: 'Chidi', text: 'Good catch — when r=1, Sn = na. JAMB loves that edge case.', time: '08:12' },
          ],
        },
        {
          id: 'g3', icon: '⚡', subject: 'Physics',
          name: 'Physics Force',
          description: 'Mechanics, waves, electromagnetism — we cover it all. Weekly mock quizzes every Sunday.',
          memberCount: 38, isActive: true,
          recentMembers: ['Bayo', 'Kemi', 'Dele'],
          messages: [
            { id: 'm7', author: 'Bayo', text: 'Sunday quiz starts at 4pm. Topic: projectile motion.', time: '14:00' },
          ],
        },
        {
          id: 'g4', icon: '📚', subject: 'Mixed',
          name: 'JAMB 2025 General',
          description: 'Open group for all subjects. Share tips, resources, motivation and past question links.',
          memberCount: 214, isActive: true,
          recentMembers: ['Tunde', 'Ngozi', 'Fatima', 'Emeka', 'Amara', 'Bayo'],
          messages: [
            { id: 'm8', author: 'Amara', text: 'JAMB registration closes end of month. Has anyone gotten their profile code?', time: '11:30' },
            { id: 'm9', author: 'Emeka', text: 'Yes, visit any accredited CBT centre with your JAMB registration slip.', time: '11:45' },
          ],
        },
      ],

      createGroup: (data) => {
        const newGroup: StudyGroup = {
          id:            `g-${Date.now()}`,
          name:          data.name,
          description:   data.description,
          subject:       data.subject,
          icon:          data.icon,
          memberCount:   1,
          recentMembers: [],
          isActive:      false,
          messages:      [],
        };
        set((s) => ({
          groups:     [...s.groups, newGroup],
          myGroupIds: [...s.myGroupIds, newGroup.id],
        }));
      },

      joinGroup: (id) =>
        set((s) => ({
          myGroupIds: s.myGroupIds.includes(id)
            ? s.myGroupIds
            : [...s.myGroupIds, id],
          groups: s.groups.map(g =>
            g.id === id ? { ...g, memberCount: g.memberCount + 1 } : g
          ),
        })),

      leaveGroup: (id) =>
        set((s) => ({
          myGroupIds: s.myGroupIds.filter(gid => gid !== id),
          groups: s.groups.map(g =>
            g.id === id ? { ...g, memberCount: Math.max(1, g.memberCount - 1) } : g
          ),
        })),

      sendMessage: (groupId, msg) => {
        const message: ChatMessage = {
          id:   `msg-${Date.now()}`,
          author: msg.author,
          text:   msg.text,
          time:   now(),
        };
        set((s) => ({
          groups: s.groups.map(g =>
            g.id === groupId
              ? { ...g, messages: [...g.messages, message], isActive: true }
              : g
          ),
        }));
      },

      getMessages: (groupId) =>
        get().groups.find(g => g.id === groupId)?.messages ?? [],
    }),
    {
      name: 'jambready-groups',
      partialize: (s) => ({
        myGroupIds: s.myGroupIds,
        groups:     s.groups,
      }),
    },
  ),
);