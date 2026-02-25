export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface StreakConfig {
  plannedDays: WeekDay[];
  freezesRemaining: number;
  freezesResetAt: string;
  evaluatedAt?: string;
}

export interface StudentProfile {
  userId: string;
  streak: number;
  streakConfig: StreakConfig;
  lastCheckInDate?: string;
  lastWorkoutId?: string;
  lastWorkoutDate?: string;
}
