import type { StudentProfile, WeekDay } from '@/types';
import { FREEZES_PER_MONTH } from '@/utils/constants';

const JS_DAY_TO_WEEKDAY: WeekDay[] = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
];

function getTodayWeekDay(): WeekDay {
  return JS_DAY_TO_WEEKDAY[new Date().getDay()];
}

export interface StreakStatus {
  streak: number;
  plannedDays: WeekDay[];
  freezesRemaining: number;
  isTodayPlanned: boolean;
  isAtRisk: boolean;
  willLoseStreak: boolean;
}

export function useStreak(
  profile: StudentProfile | undefined,
  checkedInToday: boolean,
): StreakStatus {
  const streak = profile?.streak ?? 0;
  const plannedDays = profile?.streakConfig?.plannedDays ?? [];
  const freezesRemaining = profile?.streakConfig?.freezesRemaining ?? FREEZES_PER_MONTH;

  const isTodayPlanned = plannedDays.includes(getTodayWeekDay());
  const isAtRisk = isTodayPlanned && !checkedInToday;
  const willLoseStreak = isAtRisk && freezesRemaining === 0 && streak > 0;

  return { streak, plannedDays, freezesRemaining, isTodayPlanned, isAtRisk, willLoseStreak };
}
