import { create } from 'zustand';

export interface LeaderboardEntry {
  id:          string;
  rank:        number;
  name:        string;
  school:      string;
  score:       number;
  initials:    string;
  avatarBg:    string;  // dark bg colour for avatar circle
  avatarColor: string;  // text colour inside avatar circle
  change:      number;  // rank change this week (+/- positions)
}

type Scope = 'school' | 'national';

interface LeaderboardState {
  scope:            Scope;
  schoolEntries:    LeaderboardEntry[];
  nationalEntries:  LeaderboardEntry[];
  setScope:         (scope: Scope) => void;
  /** Returns the active list based on current scope */
  getEntries:       () => LeaderboardEntry[];
}

export const useLeaderboardStore = create<LeaderboardState>()((set, get) => ({
  scope: 'school',

  schoolEntries: [
    { id: 's1', rank: 1,  name: 'Tunde Kola',       school: 'Kings College',   score: 291, initials: 'TK', avatarBg: '#2A2000', avatarColor: '#F5C842', change: 0  },
    { id: 's2', rank: 2,  name: 'Ngozi Nwosu',      school: "Queen's College", score: 285, initials: 'NN', avatarBg: '#001A12', avatarColor: '#00C896', change: 1  },
    { id: 's3', rank: 3,  name: 'Fatima Abdullahi', school: 'FGC Abuja',       score: 278, initials: 'FA', avatarBg: '#1E0E00', avatarColor: '#C8814A', change: -1 },
    { id: 's4', rank: 37, name: 'Emeka Bright',     school: 'Loyola Jesuit',   score: 268, initials: 'EB', avatarBg: '#200008', avatarColor: '#FF7090', change: 2  },
    { id: 's5', rank: 39, name: 'Amara Obi',        school: 'FGGC Benin',      score: 263, initials: 'AO', avatarBg: '#001420', avatarColor: '#4B9FD6', change: -2 },
  ],

  nationalEntries: [
    { id: 'n1', rank: 1,   name: 'Chidi Eze',       school: 'FGSC Lagos',      score: 315, initials: 'CE', avatarBg: '#001A12', avatarColor: '#00C896', change: 0   },
    { id: 'n2', rank: 2,   name: 'Zara Mohammed',  school: 'GHS Kano',        score: 309, initials: 'ZM', avatarBg: '#1E0E00', avatarColor: '#C8814A', change: 3   },
    { id: 'n3', rank: 3,   name: 'Tunde Kola',     school: 'Kings College',   score: 291, initials: 'TK', avatarBg: '#2A2000', avatarColor: '#F5C842', change: 0   },
    { id: 'n4', rank: 284, name: 'Amara Obi',      school: 'FGGC Benin',      score: 263, initials: 'AO', avatarBg: '#001420', avatarColor: '#4B9FD6', change: 12  },
  ],

  setScope: (scope) => set({ scope }),

  getEntries: () => {
    const { scope, schoolEntries, nationalEntries } = get();
    return scope === 'school' ? schoolEntries : nationalEntries;
  },
}));