import { useWorkoutSessionStore } from '@/store/workoutSessionStore';

const initialState = {
  workoutId: null,
  startedAt: null,
  completedSets: [],
  timerSeconds: 0,
  isTimerRunning: false,
};

beforeEach(() => {
  useWorkoutSessionStore.setState(initialState);
});

describe('workoutSessionStore — initial state', () => {
  it('starts with all fields at their zero values', () => {
    const state = useWorkoutSessionStore.getState();
    expect(state.workoutId).toBeNull();
    expect(state.startedAt).toBeNull();
    expect(state.completedSets).toEqual([]);
    expect(state.timerSeconds).toBe(0);
    expect(state.isTimerRunning).toBe(false);
  });
});

describe('workoutSessionStore — session lifecycle', () => {
  it('startSession sets workoutId, a valid ISO startedAt, and clears completedSets', () => {
    useWorkoutSessionStore.getState().startSession('workout-abc');

    const state = useWorkoutSessionStore.getState();
    expect(state.workoutId).toBe('workout-abc');
    expect(state.startedAt).not.toBeNull();
    expect(new Date(state.startedAt!).toISOString()).toBe(state.startedAt);
    expect(state.completedSets).toEqual([]);
  });

  it('endSession resets all state to initial values', () => {
    useWorkoutSessionStore.getState().startSession('workout-abc');
    useWorkoutSessionStore.getState().logSet({ exerciseId: 'e1', setIndex: 0, weightKg: 60, reps: 10, completedAt: new Date().toISOString() });
    useWorkoutSessionStore.getState().startTimer();
    useWorkoutSessionStore.getState().tickTimer();

    useWorkoutSessionStore.getState().endSession();

    const state = useWorkoutSessionStore.getState();
    expect(state.workoutId).toBeNull();
    expect(state.startedAt).toBeNull();
    expect(state.completedSets).toEqual([]);
    expect(state.timerSeconds).toBe(0);
    expect(state.isTimerRunning).toBe(false);
  });
});

describe('workoutSessionStore — set logging', () => {
  const set1 = { exerciseId: 'e1', setIndex: 0, weightKg: 60, reps: 10, completedAt: '2026-03-04T10:00:00.000Z' };
  const set2 = { exerciseId: 'e1', setIndex: 1, weightKg: 65, reps: 8, completedAt: '2026-03-04T10:02:00.000Z' };
  const set3 = { exerciseId: 'e2', setIndex: 0, weightKg: 80, reps: 5, completedAt: '2026-03-04T10:05:00.000Z' };

  it('logSet appends a set to completedSets', () => {
    useWorkoutSessionStore.getState().logSet(set1);

    expect(useWorkoutSessionStore.getState().completedSets).toEqual([set1]);
  });

  it('multiple logSet calls accumulate in order', () => {
    useWorkoutSessionStore.getState().logSet(set1);
    useWorkoutSessionStore.getState().logSet(set2);
    useWorkoutSessionStore.getState().logSet(set3);

    expect(useWorkoutSessionStore.getState().completedSets).toEqual([set1, set2, set3]);
  });
});

describe('workoutSessionStore — timer', () => {
  it('tickTimer increments timerSeconds by 1 each call', () => {
    useWorkoutSessionStore.getState().tickTimer();
    useWorkoutSessionStore.getState().tickTimer();
    useWorkoutSessionStore.getState().tickTimer();

    expect(useWorkoutSessionStore.getState().timerSeconds).toBe(3);
  });

  it('startTimer sets isTimerRunning to true', () => {
    useWorkoutSessionStore.getState().startTimer();
    expect(useWorkoutSessionStore.getState().isTimerRunning).toBe(true);
  });

  it('pauseTimer sets isTimerRunning to false', () => {
    useWorkoutSessionStore.getState().startTimer();
    useWorkoutSessionStore.getState().pauseTimer();
    expect(useWorkoutSessionStore.getState().isTimerRunning).toBe(false);
  });

  it('resetTimer zeros timerSeconds and stops the timer', () => {
    useWorkoutSessionStore.getState().startTimer();
    useWorkoutSessionStore.getState().tickTimer();
    useWorkoutSessionStore.getState().tickTimer();

    useWorkoutSessionStore.getState().resetTimer();

    expect(useWorkoutSessionStore.getState().timerSeconds).toBe(0);
    expect(useWorkoutSessionStore.getState().isTimerRunning).toBe(false);
  });
});
