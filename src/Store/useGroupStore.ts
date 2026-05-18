// src/Store/useGroupStore.ts - COMPLETE REPLACEMENT
import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useUserStore } from './UseUserStore';

export interface ChatMessage {
  id: string;
  group_id: string;
  user_id: string;
  author: string;
  message: string;
  created_at: string;
  is_edited: boolean;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  icon: string;
  join_code: string;
  is_private: boolean;
  member_count: number;
  created_by: string;
  created_at: string;
  isActive: boolean;
  recentMembers: string[];

}

interface GroupState {
  groups: StudyGroup[];
  myGroupIds: string[];
  messages: Record<string, ChatMessage[]>;
  loading: boolean;
  msgLoading: boolean;
  error: string | null;
  loadGroups: () => Promise<void>;
  loadMyGroups: () => Promise<void>;
  createGroup: (data: { name: string; description: string; subject: string }) => Promise<void>;
  joinGroup: (id: string) => Promise<void>;
  joinByCode: (code: string) => Promise<{ error: string | null }>;
  leaveGroup: (id: string) => Promise<void>;
  loadMessages: (groupId: string) => Promise<void>;
  sendMessage: (groupId: string, text: string) => Promise<void>;
  subscribeToChat: (groupId: string) => () => void;
  getMessages: (groupId: string) => ChatMessage[];
}

const SUBJECT_ICONS: Record<string, string> = {
  'English': '📖', 'Mathematics': '🔢', 'Physics': '⚡',
  'Chemistry': '⚗️', 'Biology': '🧬', 'Economics': '📊',
  'Government': '🏛️', 'Literature': '📚', 'CRS/IRS': '✝️',
  'History': '📜', 'Mixed': '📑',
};

export const useGroupStore = create<GroupState>()((set, get) => ({
  groups: [],
  myGroupIds: [],
  messages: {},
  loading: false,
  msgLoading: false,
  error: null,

  loadGroups: async () => {
    set({ loading: true, error: null });
    try {
      // SIMPLE QUERY - NO JOINS
      const { data: groupsData, error: groupsError } = await supabase
        .from('study_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      if (!groupsData || groupsData.length === 0) {
        set({ groups: [], loading: false });
        return;
      }

      // Map groups with icons
      const mappedGroups = groupsData.map(group => ({
        ...group,
        icon: SUBJECT_ICONS[group.subject] || '📚',
        recentMembers: [],
        isActive: false,
      }));

      set({ groups: mappedGroups as StudyGroup[], loading: false });
    } catch (err: any) {
      console.error('loadGroups error:', err);
      set({ error: err.message, loading: false });
    }
  },

  loadMyGroups: async () => {
    const userId = useUserStore.getState().id;
    if (!userId) {
      set({ myGroupIds: [] });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

      if (error) throw error;
      set({ myGroupIds: data?.map(r => r.group_id) || [] });
    } catch (err) {
      console.error('loadMyGroups error:', err);
      set({ myGroupIds: [] });
    }
  },

  createGroup: async (data) => {
    const userId = useUserStore.getState().id;
    if (!userId) {
      console.error('Cannot create group: No user logged in');
      return;
    }

    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('study_groups')
        .insert({
          name: data.name,
          description: data.description,
          subject: data.subject,
          created_by: userId,
        });

      if (error) throw error;

      // Reload both group lists
      await get().loadGroups();
      await get().loadMyGroups();
    } catch (err: any) {
      console.error('createGroup error:', err);
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  joinGroup: async (groupId) => {
    const userId = useUserStore.getState().id;
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({ group_id: groupId, user_id: userId, role: 'member' });

      if (error) throw error;

      // Update myGroupIds and reload groups
      set(state => ({ 
        myGroupIds: [...new Set([...state.myGroupIds, groupId])] 
      }));
      await get().loadGroups();
    } catch (err) {
      console.error('joinGroup error:', err);
    }
  },

  joinByCode: async (code) => {
    const userId = useUserStore.getState().id;
    if (!userId) return { error: 'Please sign in to join groups' };

    try {
      const { data: group, error: groupError } = await supabase
        .from('study_groups')
        .select('id')
        .eq('join_code', code.toUpperCase().trim())
        .single();

      if (groupError || !group) {
        return { error: 'Invalid join code. Please check and try again.' };
      }

      const { error: insertError } = await supabase
        .from('group_members')
        .insert({ group_id: group.id, user_id: userId, role: 'member' });

      if (insertError) {
        if (insertError.code === '23505') {
          return { error: 'You are already a member of this group.' };
        }
        return { error: 'Failed to join group. Please try again.' };
      }

      set(state => ({ 
        myGroupIds: [...new Set([...state.myGroupIds, group.id])] 
      }));
      await get().loadGroups();
      return { error: null };
    } catch (err) {
      return { error: 'Something went wrong. Please try again.' };
    }
  },

  leaveGroup: async (groupId) => {
    const userId = useUserStore.getState().id;
    if (!userId) return;

    try {
      await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId);

      set(state => ({ 
        myGroupIds: state.myGroupIds.filter(id => id !== groupId) 
      }));
      await get().loadGroups();
    } catch (err) {
      console.error('leaveGroup error:', err);
    }
  },

  loadMessages: async (groupId) => {
    set({ msgLoading: true });
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select(`
          id,
          group_id,
          user_id,
          message,
          created_at,
          is_edited
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;

      // Get author names separately
      const messagesWithAuthors = await Promise.all(
        (data || []).map(async (msg) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', msg.user_id)
            .single();
          
          return {
            id: msg.id,
            group_id: msg.group_id,
            user_id: msg.user_id,
            author: profile?.name || 'Unknown',
            message: msg.message,
            created_at: msg.created_at,
            is_edited: msg.is_edited,
          };
        })
      );

      set(s => ({
        messages: { ...s.messages, [groupId]: messagesWithAuthors },
        msgLoading: false,
      }));
    } catch (err) {
      console.error('loadMessages error:', err);
      set({ msgLoading: false });
    }
  },

  sendMessage: async (groupId, text) => {
    const userId = useUserStore.getState().id;
    const name = useUserStore.getState().name;
    
    if (!userId || !text.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const tempMsg: ChatMessage = {
      id: tempId,
      group_id: groupId,
      user_id: userId,
      author: name || 'You',
      message: text.trim(),
      created_at: new Date().toISOString(),
      is_edited: false,
    };

    // Optimistic update
    set(s => ({
      messages: {
        ...s.messages,
        [groupId]: [...(s.messages[groupId] || []), tempMsg],
      },
    }));

    // Send to server
    const { error } = await supabase
      .from('group_messages')
      .insert({ 
        group_id: groupId, 
        user_id: userId, 
        message: text.trim() 
      });

    if (error) {
      // Rollback on error
      set(s => ({
        messages: {
          ...s.messages,
          [groupId]: (s.messages[groupId] || []).filter(m => m.id !== tempId),
        },
      }));
      console.error('sendMessage error:', error);
    }
  },

  subscribeToChat: (groupId) => {
    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;
          const myId = useUserStore.getState().id;
          
          // Skip if it's our own message (already added optimistically)
          if (newMsg.user_id === myId) return;

          // Get author name
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', newMsg.user_id)
            .single();

          const message: ChatMessage = {
            id: newMsg.id,
            group_id: newMsg.group_id,
            user_id: newMsg.user_id,
            author: profile?.name || 'Member',
            message: newMsg.message,
            created_at: newMsg.created_at,
            is_edited: newMsg.is_edited,
          };

          set(s => ({
            messages: {
              ...s.messages,
              [groupId]: [...(s.messages[groupId] || []), message],
            },
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  getMessages: (groupId) => get().messages[groupId] || [],
}));