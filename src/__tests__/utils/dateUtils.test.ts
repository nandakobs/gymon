import { getTodayWeekDay, formatDate, daysBetween, isStreakAtRisk } from '@/utils/dateUtils';

const TODAY = new Date('2026-03-04T12:00:00.000Z');
const YESTERDAY_STR = '2026-03-03T12:00:00';

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(TODAY);
});

afterEach(() => {
  jest.useRealTimers();
});

describe('getTodayWeekDay', () => {
  it('returns the correct weekday for the faked date (Wednesday)', () => {
    expect(getTodayWeekDay()).toBe('wednesday');
  });
});

describe('formatDate', () => {
  it('returns "Hoje" for today', () => {
    expect(formatDate(new Date('2026-03-04T08:00:00'))).toBe('Hoje');
  });

  it('returns "Ontem" for yesterday', () => {
    expect(formatDate(new Date('2026-03-03T08:00:00'))).toBe('Ontem');
  });

  it('returns Portuguese long-form date for older dates', () => {
    expect(formatDate(new Date('2026-01-15T08:00:00'))).toBe('15 de janeiro');
  });

  it('accepts an ISO string input for today', () => {
    expect(formatDate('2026-03-04T08:00:00')).toBe('Hoje');
  });
});

describe('daysBetween', () => {
  it('returns 0 for the same date', () => {
    const d = new Date('2026-03-04');
    expect(daysBetween(d, d)).toBe(0);
  });

  it('returns 3 when b is 3 days after a', () => {
    expect(daysBetween(new Date('2026-03-01'), new Date('2026-03-04'))).toBe(3);
  });

  it('returns -3 when b is 3 days before a (reversed order)', () => {
    expect(daysBetween(new Date('2026-03-04'), new Date('2026-03-01'))).toBe(-3);
  });
});

describe('isStreakAtRisk', () => {
  it('returns true when yesterday was planned, no check-in, and no freezes left', () => {
    expect(isStreakAtRisk(['tuesday'], undefined, 0)).toBe(true);
  });

  it('returns false when the student checked in yesterday', () => {
    expect(isStreakAtRisk(['tuesday'], YESTERDAY_STR, 0)).toBe(false);
  });

  it('returns false when the student has freezes remaining', () => {
    expect(isStreakAtRisk(['tuesday'], undefined, 1)).toBe(false);
  });

  it('returns false when yesterday was not a planned day', () => {
    expect(isStreakAtRisk(['monday'], undefined, 0)).toBe(false);
  });

  it('returns false when plannedDays is empty', () => {
    expect(isStreakAtRisk([], undefined, 0)).toBe(false);
  });

  it('returns false when both a freeze and a check-in exist', () => {
    expect(isStreakAtRisk(['tuesday'], YESTERDAY_STR, 2)).toBe(false);
  });
});
