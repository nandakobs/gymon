import type { WeekDay } from './student.types';

export interface OperatingHours {
  open: string;
  close: string;
}

export interface DaySchedule {
  enabled: boolean;
  open: string;
  close: string;
}

export interface Gym {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  operatingDays: WeekDay[];
  operatingHours: Record<WeekDay, OperatingHours>;
  schedule?: Record<WeekDay, DaySchedule>;
  managerId: string;
}
