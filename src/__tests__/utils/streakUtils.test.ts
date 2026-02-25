import { evaluateStreak } from '@/utils/streakUtils';
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
      plannedDays: [],
      freezesRemaining: 2,
      freezesResetAt: new Date('2026-03-01T00:00:00').toISOString(),
      evaluatedAt: undefined,
    },
    ...overrides,
    streakConfig: {
      plannedDays: [],
      freezesRemaining: 2,
      freezesResetAt: new Date('2026-03-01T00:00:00').toISOString(),
      evaluatedAt: undefined,
      ...(overrides.streakConfig ?? {}),
    },
  };
}

describe('evaluateStreak — idempotency', () => {
  it('returns null when already evaluated today', () => {
    const profile = makeProfile({ streakConfig: { plannedDays: [], freezesRemaining: 2, freezesResetAt: '', evaluatedAt: '2026-03-04' } });
    expect(evaluateStreak(profile)).toBeNull();
  });
});

describe('evaluateStreak — no history (first run)', () => {
  it('returns unchanged streak with no lookback when there is no reference date', () => {
    const profile = makeProfile({ streak: 5 });
    const result = evaluateStreak(profile);

    expect(result).not.toBeNull();
    expect(result!.streak).toBe(5);
    expect(result!.streakConfig?.evaluatedAt).toBe('2026-03-04');
  });
});

describe('evaluateStreak — freeze consumption during lookback', () => {

  it('consumes 1 freeze for 1 missed planned day (tuesday)', () => {
    const profile = makeProfile({
      streak: 10,
      streakConfig: {
        plannedDays: ['tuesday'],
        freezesRemaining: 2,
        freezesResetAt: new Date('2026-03-01').toISOString(),
        evaluatedAt: '2026-03-02',
      },
    });
    const result = evaluateStreak(profile);

    expect(result!.streak).toBe(10);
    expect(result!.streakConfig?.freezesRemaining).toBe(1);
  });

  it('does not consume freezes for missed unplanned days', () => {
    const profile = makeProfile({
      streak: 10,
      streakConfig: {
        plannedDays: ['monday'],
        freezesRemaining: 2,
        freezesResetAt: new Date('2026-03-01').toISOString(),
        evaluatedAt: '2026-03-02T12:00:00',
      },
    });
    const result = evaluateStreak(profile);

    expect(result!.streakConfig?.freezesRemaining).toBe(2);
    expect(result!.streak).toBe(10);
  });

  it('consumes 2 freezes for 2 missed planned days', () => {
    const profile = makeProfile({
      streak: 10,
      streakConfig: {
        plannedDays: ['monday', 'tuesday'],
        freezesRemaining: 2,
        freezesResetAt: new Date('2026-03-01').toISOString(),
        evaluatedAt: '2026-02-28',
      },
    });
    const result = evaluateStreak(profile);

    expect(result!.streak).toBe(10);
    expect(result!.streakConfig?.freezesRemaining).toBe(0);
  });

  it('resets streak to 0 when 3 planned days are missed and only 2 freezes available', () => {
    const profile = makeProfile({
      streak: 10,
      streakConfig: {
        plannedDays: ['sunday', 'monday', 'tuesday'],
        freezesRemaining: 2,
        freezesResetAt: new Date('2026-03-01').toISOString(),
        evaluatedAt: '2026-02-28',
      },
    });
    const result = evaluateStreak(profile);

    expect(result!.streak).toBe(0);
    expect(result!.streakConfig?.freezesRemaining).toBe(0);
  });

  it('streak stays at 0 when already 0 and more days are missed (no underflow)', () => {
    const profile = makeProfile({
      streak: 0,
      streakConfig: {
        plannedDays: ['sunday', 'monday', 'tuesday'],
        freezesRemaining: 0,
        freezesResetAt: new Date('2026-03-01').toISOString(),
        evaluatedAt: '2026-02-28',
      },
    });
    const result = evaluateStreak(profile);

    expect(result!.streak).toBe(0);
  });
});

describe('evaluateStreak — monthly freeze reset', () => {
  it('resets freezes to 2 when last reset was in the previous month', () => {
    const profile = makeProfile({
      streak: 10,
      streakConfig: {
        plannedDays: [],
        freezesRemaining: 0,
        freezesResetAt: new Date('2026-02-01').toISOString(),
        evaluatedAt: '2026-03-02',
      },
    });
    const result = evaluateStreak(profile);

    expect(result!.streakConfig?.freezesRemaining).toBe(2);
    expect(result!.streakConfig?.freezesResetAt).toContain('2026-03-01');
  });

  it('does not reset freezes when already reset this month', () => {
    const profile = makeProfile({
      streak: 10,
      streakConfig: {
        plannedDays: [],
        freezesRemaining: 0,
        freezesResetAt: new Date(2026, 2, 1, 12).toISOString(),
        evaluatedAt: '2026-03-02T12:00:00',
      },
    });
    const result = evaluateStreak(profile);

    expect(result!.streakConfig?.freezesRemaining).toBe(0);
  });

  it('applies monthly reset before evaluating missed days (reset then consume)', () => {
    const profile = makeProfile({
      streak: 10,
      streakConfig: {
        plannedDays: ['sunday', 'monday', 'tuesday'],
        freezesRemaining: 0,
        freezesResetAt: new Date('2026-02-01').toISOString(),
        evaluatedAt: '2026-02-28',
      },
    });
    const result = evaluateStreak(profile);

    expect(result!.streak).toBe(0);
    expect(result!.streakConfig?.freezesRemaining).toBe(0);
  });
});

describe('evaluateStreak — 30-day lookback cap', () => {
  it('does not look back more than 30 days even if evaluatedAt is old', () => {
    const SIXTY_DAYS_AGO = new Date('2026-01-03').toISOString().split('T')[0];
    const profile = makeProfile({
      streak: 10,
      streakConfig: {
        plannedDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        freezesRemaining: 2,
        freezesResetAt: new Date('2026-03-01').toISOString(),
        evaluatedAt: SIXTY_DAYS_AGO,
      },
    });
    const result = evaluateStreak(profile);

    expect(result!.streak).toBe(0);
    expect(result!.streakConfig?.evaluatedAt).toBe('2026-03-04');
  });
});

describe('evaluateStreak — lastCheckInDate as reference', () => {
  it('uses lastCheckInDate as reference when no evaluatedAt', () => {
    const profile = makeProfile({
      streak: 10,
      lastCheckInDate: '2026-03-02',
      streakConfig: {
        plannedDays: ['tuesday'],
        freezesRemaining: 2,
        freezesResetAt: new Date('2026-03-01').toISOString(),
        evaluatedAt: undefined,
      },
    });
    const result = evaluateStreak(profile);

    expect(result!.streakConfig?.freezesRemaining).toBe(1);
    expect(result!.streak).toBe(10);
  });

  it('performs no lookback when neither evaluatedAt nor lastCheckInDate exist', () => {
    const profile = makeProfile({
      streak: 5,
      lastCheckInDate: undefined,
      streakConfig: {
        plannedDays: ['tuesday'],
        freezesRemaining: 2,
        freezesResetAt: new Date('2026-03-01').toISOString(),
        evaluatedAt: undefined,
      },
    });
    const result = evaluateStreak(profile);

    expect(result!.streak).toBe(5);
    expect(result!.streakConfig?.freezesRemaining).toBe(2);
  });
});

describe('evaluateStreak — return shape', () => {
  it('always sets evaluatedAt to today in the result', () => {
    const profile = makeProfile();
    const result = evaluateStreak(profile);

    expect(result!.streakConfig?.evaluatedAt).toBe('2026-03-04');
  });

  it('result only contains streak and streakConfig keys', () => {
    const profile = makeProfile();
    const result = evaluateStreak(profile);

    expect(Object.keys(result!)).toEqual(expect.arrayContaining(['streak', 'streakConfig']));
    expect(Object.keys(result!).length).toBe(2);
  });
});
