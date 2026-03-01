import { formatWeight, formatDuration, formatReps, formatStreak } from '@/utils/formatters';

describe('formatWeight', () => {
  it('formats regular kg values', () => {
    expect(formatWeight(80)).toBe('80 kg');
  });

  it('formats 999 kg as kg (below threshold)', () => {
    expect(formatWeight(999)).toBe('999 kg');
  });

  it('formats 1000 as tonnes', () => {
    expect(formatWeight(1000)).toBe('1.0 t');
  });

  it('formats 1500 as 1.5 t', () => {
    expect(formatWeight(1500)).toBe('1.5 t');
  });
});

describe('formatDuration', () => {
  it('formats 0 seconds as 00:00', () => {
    expect(formatDuration(0)).toBe('00:00');
  });

  it('formats 90 seconds as 01:30', () => {
    expect(formatDuration(90)).toBe('01:30');
  });

  it('formats 3600 seconds as 60:00 (no hour roll-over)', () => {
    expect(formatDuration(3600)).toBe('60:00');
  });

  it('zero-pads both minutes and seconds', () => {
    expect(formatDuration(65)).toBe('01:05');
  });
});

describe('formatReps', () => {
  it('returns singular "rep" for 1', () => {
    expect(formatReps(1)).toBe('1 rep');
  });

  it('returns plural "reps" for numbers > 1', () => {
    expect(formatReps(12)).toBe('12 reps');
  });

  it('returns the string as-is when reps is already a string', () => {
    expect(formatReps('até a falha')).toBe('até a falha');
  });

  it('returns plural "reps" for 0', () => {
    expect(formatReps(0)).toBe('0 reps');
  });
});

describe('formatStreak', () => {
  it('returns singular "dia" for 1', () => {
    expect(formatStreak(1)).toBe('1 dia');
  });

  it('returns plural "dias" for counts > 1', () => {
    expect(formatStreak(30)).toBe('30 dias');
  });

  it('returns plural "dias" for 0', () => {
    expect(formatStreak(0)).toBe('0 dias');
  });
});
