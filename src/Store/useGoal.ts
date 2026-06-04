import { create } from 'zustand';

export type Goal = {
  id: string;
  label: string;
  xp: number;
  done: boolean;
};

type GoalState = {
  goals: Goal[];
  toggleGoal: (id: string) => void;
  resetGoals: () => void;
};

const initialGoals: Goal[] = [
  { id: '1', label: 'Complete 2 practice tests', xp: 20, done: false },
  { id: '2', label: 'Study Mathematics (1 hour)', xp: 15, done: false },
  { id: '3', label: 'Revise Biology notes', xp: 10, done: false },
  { id: '4', label: 'Answer 20 past questions', xp: 25, done: false },
];

export const useGoalStore = create<GoalState>((set) => ({
  goals: initialGoals,

  toggleGoal: (id) =>
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === id ? { ...goal, done: !goal.done } : goal
      ),
    })),

  resetGoals: () =>
    set(() => ({
      goals: initialGoals,
    })),
}));
