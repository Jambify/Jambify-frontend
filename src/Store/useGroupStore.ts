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
    // Step 1: fetch messages
    const { data: msgs, error: msgErr } = await supabase
      .from('group_messages')
      .select('*')
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(100);

    if (msgErr) throw msgErr;
    if (!msgs || msgs.length === 0) {
      set(s => ({ messages: { ...s.messages, [groupId]: [] }, msgLoading: false }));
      return;
    }

    // Step 2: fetch unique profile names for all senders in one query
    // This avoids the FK join issue entirely
    const uniqueIds = [...new Set(msgs.map(m => m.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', uniqueIds);

    // Build a lookup map: userId → name
    const nameMap = new Map<string, string>();
    (profiles || []).forEach(p => nameMap.set(p.id, p.name || 'Member'));

    const messages: ChatMessage[] = msgs.map(row => ({
      id:         row.id,
      group_id:   row.group_id,
      user_id:    row.user_id,
      author:     nameMap.get(row.user_id) || 'Member',  // ← no more "Unknown"
      message:    row.message,
      created_at: row.created_at,
      is_edited:  row.is_edited,
    }));

    set(s => ({ messages: { ...s.messages, [groupId]: messages }, msgLoading: false }));
  } catch (err) {
    console.error('loadMessages error:', err);
    set({ msgLoading: false });
  }
},

  sendMessage: async (groupId, text) => {
  const userId = useUserStore.getState().id;
  const name   = useUserStore.getState().name;
  if (!userId || !text.trim()) return;

  // Optimistic message with temp id — realtime will replace it
  const tempId = `temp-${Date.now()}`;
  const tempMsg: ChatMessage = {
    id:         tempId,
    group_id:   groupId,
    user_id:    userId,
    author:     name || 'You',
    message:    text.trim(),
    created_at: new Date().toISOString(),
    is_edited:  false,
  };

  set(s => ({
    messages: { ...s.messages, [groupId]: [...(s.messages[groupId] || []), tempMsg] },
  }));

  const { error } = await supabase
    .from('group_messages')
    .insert({ group_id: groupId, user_id: userId, message: text.trim() });

  if (error) {
    // Remove failed optimistic message
    set(s => ({
      messages: {
        ...s.messages,
        [groupId]: (s.messages[groupId] || []).filter(m => m.id !== tempId),
      },
    }));
    console.error('sendMessage error:', error.message);
  }
  // On success: the realtime subscription will fire, see it's our own message,
  // remove the temp- prefix message and insert the confirmed one.
},

  // ── subscribeToChat ────────────────────────────────────
subscribeToChat: (groupId) => {
  // Keep a local cache of IDs we've already shown (to dedup optimistic msgs)
  const seenIds = new Set<string>();

  // Pre-populate with messages we already have loaded
  const existing = get().messages[groupId] || [];
  existing.forEach(m => seenIds.add(m.id));

  const channel = supabase
    .channel(`group-chat-${groupId}-${Date.now()}`) // unique name prevents stale sub
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'group_messages',
        filter: `group_id=eq.${groupId}`,
      },
      async (payload) => {
        const row = payload.new as any;

        // Skip if we've already rendered this message (optimistic or loaded)
        // This is the key dedup — don't skip by user_id, skip by message id
        if (seenIds.has(row.id)) return;
        seenIds.add(row.id);

        // Get the author name — check store first, then fetch
        let authorName = 'Member';
        const myId   = useUserStore.getState().id;
        const myName = useUserStore.getState().name;

        if (row.user_id === myId) {
          // It's our own message confirmed by DB — replace the optimistic one
          authorName = myName || 'You';

          // Remove the temp- optimistic message and replace with confirmed one
          set(s => {
            const existing = (s.messages[groupId] || [])
              .filter(m => !m.id.startsWith('temp-'));
            const confirmed: ChatMessage = {
              id: row.id, group_id: row.group_id, user_id: row.user_id,
              author: authorName, message: row.message,
              created_at: row.created_at, is_edited: row.is_edited,
            };
            return { messages: { ...s.messages, [groupId]: [...existing, confirmed] } };
          });
          return;
        }

        // Someone else's message — fetch their name
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', row.user_id)
          .single();

        authorName = profile?.name || 'Member';

        const newMsg: ChatMessage = {
          id:         row.id,
          group_id:   row.group_id,
          user_id:    row.user_id,
          author:     authorName,
          message:    row.message,
          created_at: row.created_at,
          is_edited:  row.is_edited,
        };

        set(s => ({
          messages: {
            ...s.messages,
            [groupId]: [...(s.messages[groupId] || []), newMsg],
          },
        }));
      }
    )
    .subscribe((status) => {
      console.log(`[GroupChat] Realtime status for ${groupId}:`, status);
    });

  return () => {
    console.log(`[GroupChat] Unsubscribing from ${groupId}`);
    supabase.removeChannel(channel);
  };
},

  getMessages: (groupId) => get().messages[groupId] || [],
}));