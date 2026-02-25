import { format, isToday, isYesterday, differenceInDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { WeekDay } from '@/types';

const WEEKDAY_MAP: Record<number, WeekDay> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

export function getTodayWeekDay(): WeekDay {
  return WEEKDAY_MAP[new Date().getDay()];
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isToday(d)) return 'Hoje';
  if (isYesterday(d)) return 'Ontem';
  return format(d, "d 'de' MMMM", { locale: ptBR });
}

export function daysBetween(a: Date, b: Date): number {
  return differenceInDays(startOfDay(b), startOfDay(a));
}

export function isStreakAtRisk(
  plannedDays: WeekDay[],
  lastCheckInDate: string | undefined,
  freezesRemaining: number
): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayWeekday = WEEKDAY_MAP[yesterday.getDay()];

  if (!plannedDays.includes(yesterdayWeekday)) return false;

  const lastCheckIn = lastCheckInDate ? new Date(lastCheckInDate) : null;
  const checkedInYesterday =
    lastCheckIn !== null && differenceInDays(startOfDay(yesterday), startOfDay(lastCheckIn)) === 0;

  return !checkedInYesterday && freezesRemaining === 0;
}
