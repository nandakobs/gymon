import { useStreak } from '@/hooks/useStreak';
import type { StudentProfile } from '@/types';

const TODAY = new Date('2026-03-04T10:00:00.000Z');

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(TODAY);
});

afterEach(() => {
  jest.useRealTimers();
});

function makeProfile(overrides: Partial<StudentProfile> = {}): StudentProfile {
  return {
    userId: 'u1',
    streak: 10,
    streakConfig: {
      plannedDays: ['wednesday'],
      freezesRemaining: 2,
      freezesResetAt: new Date('2026-03-01').toISOString(),
    },
    ...overrides,
    streakConfig: {
      plannedDays: ['wednesday'],
      freezesRemaining: 2,
      freezesResetAt: new Date('2026-03-01').toISOString(),
      ...(overrides.streakConfig ?? {}),
    },
  };
}

describe('useStreak', () => {
  it('returns safe defaults when profile is undefined', () => {
    const result = useStreak(undefined, false);

    expect(result.streak).toBe(0);
    expect(result.plannedDays).toEqual([]);
    expect(result.freezesRemaining).toBe(2);
    expect(result.isTodayPlanned).toBe(false);
    expect(result.isAtRisk).toBe(false);
    expect(result.willLoseStreak).toBe(false);
  });

  it('isTodayPlanned is true and isAtRisk is true when today is planned and not checked in', () => {
    const result = useStreak(makeProfile(), false);

    expect(result.isTodayPlanned).toBe(true);
    expect(result.isAtRisk).toBe(true);
  });

  it('isAtRisk is false when student already checked in today', () => {
    const result = useStreak(makeProfile(), true);

    expect(result.isTodayPlanned).toBe(true);
    expect(result.isAtRisk).toBe(false);
  });

  it('isTodayPlanned is false when today (wednesday) is not in plannedDays', () => {
    const result = useStreak(makeProfile({ streakConfig: { plannedDays: ['monday'], freezesRemaining: 2, freezesResetAt: '' } }), false);

    expect(result.isTodayPlanned).toBe(false);
    expect(result.isAtRisk).toBe(false);
  });

  it('willLoseStreak is true when at risk, no freezes, and streak > 0', () => {
    const result = useStreak(
      makeProfile({ streak: 5, streakConfig: { plannedDays: ['wednesday'], freezesRemaining: 0, freezesResetAt: '' } }),
      false,
    );

    expect(result.willLoseStreak).toBe(true);
  });

  it('willLoseStreak is false when at risk but a freeze is available', () => {
    const result = useStreak(
      makeProfile({ streak: 5, streakConfig: { plannedDays: ['wednesday'], freezesRemaining: 1, freezesResetAt: '' } }),
      false,
    );

    expect(result.willLoseStreak).toBe(false);
  });

  it('willLoseStreak is false when streak is already 0 (nothing to lose)', () => {
    const result = useStreak(
      makeProfile({ streak: 0, streakConfig: { plannedDays: ['wednesday'], freezesRemaining: 0, freezesResetAt: '' } }),
      false,
    );

    expect(result.willLoseStreak).toBe(false);
  });
});
