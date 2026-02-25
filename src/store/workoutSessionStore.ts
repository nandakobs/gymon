import { create } from 'zustand';

interface SetLog {
  exerciseId: string;
  setIndex: number;
  weightKg: number;
  reps: number;
  completedAt: string;
}

interface WorkoutSessionState {
  workoutId: string | null;
  startedAt: string | null;
  completedSets: SetLog[];
  timerSeconds: number;
  isTimerRunning: boolean;

  startSession: (workoutId: string) => void;
  endSession: () => void;
  logSet: (set: SetLog) => void;
  tickTimer: () => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
}

export const useWorkoutSessionStore = create<WorkoutSessionState>((set) => ({
  workoutId: null,
  startedAt: null,
  completedSets: [],
  timerSeconds: 0,
  isTimerRunning: false,

  startSession: (workoutId) =>
    set({ workoutId, startedAt: new Date().toISOString(), completedSets: [] }),

  endSession: () =>
    set({
      workoutId: null,
      startedAt: null,
      completedSets: [],
      timerSeconds: 0,
      isTimerRunning: false,
    }),

  logSet: (setLog) =>
    set((state) => ({ completedSets: [...state.completedSets, setLog] })),

  tickTimer: () =>
    set((state) => ({ timerSeconds: state.timerSeconds + 1 })),

  startTimer: () => set({ isTimerRunning: true }),
  pauseTimer: () => set({ isTimerRunning: false }),
  resetTimer: () => set({ timerSeconds: 0, isTimerRunning: false }),
}));
