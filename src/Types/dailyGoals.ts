// src/Types/dailyGoals.ts

export interface DailyGoal {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  // The check function will be defined in the store, not part of the data structure
}

export interface DailyGoalProgress {
  id: string; // Same as DailyGoal id
  completed: boolean;
  completedAt: string | null; // ISO date string
  goal_id: string;

}

export interface DailyGoalsState {
  date: string; // YYYY-MM-DD format
  goals: DailyGoal[];
  progress: DailyGoalProgress[];
  totalXpEarnedToday: number;
}
