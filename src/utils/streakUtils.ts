import type { StudentProfile, WeekDay } from '@/types';
import { FREEZES_PER_MONTH } from './constants';

// ─── date helpers ─────────────────────────────────────────────────────────────

const JS_DAY_TO_WEEKDAY: Record<number, WeekDay> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ─── main evaluation ──────────────────────────────────────────────────────────

/**
 * Evaluates the streak state for missed planned days since the last evaluation.
 *
 * Rules:
 * - Any missed PLANNED day consumes a freeze (if available).
 * - When freezes run out and a planned day is missed, streak resets to 0.
 * - Freezes reset to FREEZES_PER_MONTH on the 1st of each month (non-cumulative).
 * - Evaluation is idempotent: returns null if already run today.
 *
 * Returns a partial StudentProfile to persist, or null if already up-to-date.
 */
export function evaluateStreak(profile: StudentProfile): Partial<StudentProfile> | null {
  const today = startOfDay(new Date());
  const todayStr = toDateStr(today);

  // Already evaluated today — nothing to do
  if (profile.streakConfig?.evaluatedAt === todayStr) return null;

  let streak = profile.streak ?? 0;
  let freezesRemaining = profile.streakConfig?.freezesRemaining ?? FREEZES_PER_MONTH;
  let freezesResetAt = profile.streakConfig?.freezesResetAt ?? new Date().toISOString();
  const plannedDays = profile.streakConfig?.plannedDays ?? [];
  const evaluatedAt = profile.streakConfig?.evaluatedAt;

  // 1. Monthly freeze reset — runs at most once per month
  const firstOfThisMonth = startOfDay(new Date(today.getFullYear(), today.getMonth(), 1));
  const lastReset = startOfDay(new Date(freezesResetAt));
  if (lastReset < firstOfThisMonth) {
    freezesRemaining = FREEZES_PER_MONTH;
    freezesResetAt = firstOfThisMonth.toISOString();
  }

  // 2. Evaluate missed planned days from (reference + 1) to yesterday
  //    Reference = last evaluatedAt, or lastCheckInDate, or nothing
  const refDate = evaluatedAt
    ? startOfDay(new Date(evaluatedAt))
    : profile.lastCheckInDate
    ? startOfDay(new Date(profile.lastCheckInDate))
    : null;

  if (refDate) {
    const yesterday = addDays(today, -1);
    // Cap lookback at 30 days to avoid processing months of history for new users
    const maxLookback = addDays(today, -30);
    const startFrom = refDate > maxLookback ? addDays(refDate, 1) : maxLookback;

    let cursor = startOfDay(startFrom);
    while (cursor <= yesterday) {
      const weekday = JS_DAY_TO_WEEKDAY[cursor.getDay()];
      if (plannedDays.includes(weekday)) {
        if (freezesRemaining > 0) {
          freezesRemaining--;
        } else {
          streak = 0;
          break;
        }
      }
      cursor = addDays(cursor, 1);
    }
  }

  return {
    streak,
    streakConfig: {
      plannedDays,
      freezesRemaining,
      freezesResetAt,
      evaluatedAt: todayStr,
    },
  };
}
