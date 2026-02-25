export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface StreakConfig {
  plannedDays: WeekDay[];
  freezesRemaining: number;
  /** ISO date of the last monthly freeze reset */
  freezesResetAt: string;
  /** YYYY-MM-DD — last date streak was evaluated for missed days */
  evaluatedAt?: string;
}

export interface StudentProfile {
  userId: string;
  streak: number;
  streakConfig: StreakConfig;
  lastCheckInDate?: string;
  lastWorkoutId?: string;
  lastWorkoutDate?: string; // "YYYY-MM-DD"
  // coach_observations was a single-field approach — replaced by the coachObservations collection
}
