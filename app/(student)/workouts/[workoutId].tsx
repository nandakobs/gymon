import {
  View,
  Text,
  ScrollView,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { getWorkoutById } from '@/services/firebase/workouts.service';
import {
  getFullProgressForToday,
  saveProgressForToday,
  saveStudentNote,
  type SetChecklist,
  type ExerciseSnapshots,
} from '@/services/firebase/workoutProgress.service';
import { Clock, Dumbbell, Weight, CheckCheck } from 'lucide-react-native';
import type { Workout, Exercise } from '@/types';

function allSetsDone(sets: boolean[] | undefined, total: number): boolean {
  return (sets?.length ?? 0) === total && (sets?.every(Boolean) ?? false);
}

function countDone(sets: boolean[] | undefined): number {
  return sets?.filter(Boolean).length ?? 0;
}

function SetRow({
  index,
  reps,
  weightKg,
  done,
  onToggle,
}: {
  index: number;
  reps: number | string;
  weightKg?: number;
  done: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center gap-3 py-3 border-b border-brand-surface-2"
    >
      <View
        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          done ? 'bg-brand-primary border-brand-primary' : 'border-brand-text-muted'
        }`}
      >
        {done && <Text className="text-white text-xs font-bold">✓</Text>}
      </View>

      <Text className={`flex-1 text-sm ${done ? 'text-brand-text-muted line-through' : 'text-brand-text-primary'}`}>
        Série {index + 1}
      </Text>

      <Text className={`text-sm ${done ? 'text-brand-text-muted' : 'text-brand-text-secondary'}`}>
        {reps} rep{typeof reps === 'number' && reps !== 1 ? 's' : ''}
        {weightKg != null ? `  ·  ${weightKg} kg` : ''}
      </Text>
    </Pressable>
  );
}

function ExerciseCard({
  exercise,
  index,
  setsDone,
  onToggleSet,
  onToggleAll,
}: {
  exercise: Exercise;
  index: number;
  setsDone: boolean[];
  onToggleSet: (setIndex: number) => void;
  onToggleAll: () => void;
}) {
  const totalSets = exercise.sets;
  const doneCount = countDone(setsDone);
  const isComplete = allSetsDone(setsDone, totalSets);

  return (
    <View
      className={`rounded-2xl mb-3 overflow-hidden border ${
        isComplete ? 'border-green-500/40' : 'border-transparent'
      }`}
    >
      <View className="bg-brand-surface p-4">
        <View className="flex-row items-center gap-3 mb-1">
          <View
            className={`w-7 h-7 rounded-full items-center justify-center ${
              isComplete ? 'bg-green-500' : 'bg-brand-primary'
            }`}
          >
            {isComplete ? (
              <Text className="text-white text-xs font-bold">✓</Text>
            ) : (
              <Text className="text-white text-xs font-bold">{index + 1}</Text>
            )}
          </View>

          <Text className="text-brand-text-primary font-semibold text-base flex-1">
            {exercise.name}
          </Text>

          <TouchableOpacity onPress={onToggleAll} hitSlop={8}>
            <Text className={`text-xs font-semibold ${isComplete ? 'text-brand-text-muted' : 'text-brand-primary'}`}>
              {isComplete ? 'Desmarcar' : 'Marcar todas'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row gap-3 mb-1 ml-10">
          {exercise.weightKg != null && (
            <View className="flex-row items-center gap-1">
              <Weight color="#606078" size={12} />
              <Text className="text-brand-text-muted text-xs">{exercise.weightKg} kg</Text>
            </View>
          )}
          {exercise.restSeconds != null && (
            <View className="flex-row items-center gap-1">
              <Clock color="#606078" size={12} />
              <Text className="text-brand-text-muted text-xs">{exercise.restSeconds}s descanso</Text>
            </View>
          )}
          <Text className="text-brand-text-muted text-xs ml-auto">
            {doneCount}/{totalSets}
          </Text>
        </View>

        <View className="mt-2 border-t border-brand-surface-2">
          {Array.from({ length: totalSets }).map((_, i) => (
            <SetRow
              key={i}
              index={i}
              reps={exercise.reps}
              weightKg={exercise.weightKg}
              done={setsDone[i] ?? false}
              onToggle={() => onToggleSet(i)}
            />
          ))}
        </View>

        {exercise.notes ? (
          <Text className="text-brand-text-muted text-xs italic mt-3 ml-1">
            {exercise.notes}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

type SaveStatus = 'idle' | 'saving' | 'saved';

export default function WorkoutDetail() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const { user } = useAuth();

  const [workout, setWorkout] = useState<Workout | null>(null);
  const [checklist, setChecklist] = useState<SetChecklist>({});
  const [sessionNote, setSessionNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const snapshotsRef = useRef<ExerciseSnapshots>({});

  useEffect(() => {
    if (!workoutId || !user) return;
    Promise.all([
      getWorkoutById(workoutId),
      getFullProgressForToday(user.uid, workoutId).catch(() => ({ completedSets: {} as SetChecklist, studentNote: '', exerciseSnapshots: {} as ExerciseSnapshots })),
    ]).then(([w, saved]) => {
      setWorkout(w);
      setSessionNote(saved.studentNote);
      snapshotsRef.current = saved.exerciseSnapshots ?? {};
      if (w) {
        const initial: SetChecklist = {};
        w.exercises.forEach((ex) => {
          const savedSets = saved.completedSets[ex.id];
          initial[ex.id] =
            savedSets?.length === ex.sets ? savedSets : Array(ex.sets).fill(false);
        });
        setChecklist(initial);
      }
    }).finally(() => setIsLoading(false));

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      if (noteTimer.current) clearTimeout(noteTimer.current);
    };
  }, [workoutId, user]);

  function scheduleSave(next: SetChecklist) {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    setSaveStatus('saving');
    saveTimer.current = setTimeout(async () => {
      if (!user || !workoutId) return;
      try {
        await saveProgressForToday(user.uid, workoutId, next, snapshotsRef.current);
        setSaveStatus('saved');
        savedTimer.current = setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('idle');
      }
    }, 600);
  }

  function toggleSet(exercise: Exercise, setIndex: number) {
    setChecklist((prev) => {
      const sets = [...(prev[exercise.id] ?? [])];
      sets[setIndex] = !sets[setIndex];
      const next = { ...prev, [exercise.id]: sets };

      if (sets.some(Boolean)) {
        snapshotsRef.current = {
          ...snapshotsRef.current,
          [exercise.id]: { name: exercise.name, reps: exercise.reps, weightKg: exercise.weightKg },
        };
      } else {
        const { [exercise.id]: _removed, ...rest } = snapshotsRef.current;
        snapshotsRef.current = rest;
      }

      scheduleSave(next);
      return next;
    });
  }

  function scheduleNoteSave(note: string) {
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(async () => {
      if (!user || !workoutId) return;
      await saveStudentNote(user.uid, workoutId, note).catch(() => {});
    }, 800);
  }

  function handleNoteChange(text: string) {
    setSessionNote(text);
    scheduleNoteSave(text);
  }

  function toggleAllSets(exercise: Exercise) {
    setChecklist((prev) => {
      const current = prev[exercise.id] ?? Array(exercise.sets).fill(false);
      const allDone = current.length === exercise.sets && current.every(Boolean);
      const next = { ...prev, [exercise.id]: Array(exercise.sets).fill(!allDone) };

      if (!allDone) {
        snapshotsRef.current = {
          ...snapshotsRef.current,
          [exercise.id]: { name: exercise.name, reps: exercise.reps, weightKg: exercise.weightKg },
        };
      } else {
        const { [exercise.id]: _removed, ...rest } = snapshotsRef.current;
        snapshotsRef.current = rest;
      }

      scheduleSave(next);
      return next;
    });
  }

  const totalSets = workout?.exercises.reduce((acc, ex) => acc + ex.sets, 0) ?? 0;
  const doneSets = workout?.exercises.reduce(
    (acc, ex) => acc + countDone(checklist[ex.id]),
    0,
  ) ?? 0;
  const progressRatio = totalSets > 0 ? doneSets / totalSets : 0;
  const workoutDone = totalSets > 0 && doneSets === totalSets;

  if (isLoading) {
    return (
      <View className="flex-1 bg-brand-background items-center justify-center">
        <Stack.Screen options={{ title: 'Carregando...' }} />
        <ActivityIndicator color="#FF6B35" size="large" />
      </View>
    );
  }

  if (!workout) {
    return (
      <View className="flex-1 bg-brand-background items-center justify-center">
        <Stack.Screen options={{ title: 'Treino' }} />
        <Text className="text-brand-text-muted">Treino não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-brand-background"
      contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
    >
      <Stack.Screen
        options={{
          title: workout.name,
          headerRight: () => (
            <Text
              className={`text-xs mr-2 ${
                saveStatus === 'saved'
                  ? 'text-green-400'
                  : saveStatus === 'saving'
                  ? 'text-brand-text-muted'
                  : 'text-transparent'
              }`}
            >
              {saveStatus === 'saving' ? 'Salvando...' : 'Salvo ✓'}
            </Text>
          ),
        }}
      />

      <View className="bg-brand-surface rounded-2xl p-4 mb-5">
        <View className="flex-row items-center gap-3 mb-3">
          <View className="w-10 h-10 rounded-xl bg-brand-surface-2 items-center justify-center">
            {workoutDone ? (
              <CheckCheck color="#4CAF50" size={22} />
            ) : (
              <Dumbbell color="#FF6B35" size={22} />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-brand-text-primary text-lg font-bold">{workout.name}</Text>
            <Text className="text-brand-text-muted text-xs">
              {doneSets}/{totalSets} séries concluídas
            </Text>
          </View>
        </View>

        <View className="h-2 bg-brand-surface-2 rounded-full overflow-hidden">
          <View
            className={`h-full rounded-full ${workoutDone ? 'bg-green-500' : 'bg-brand-primary'}`}
            style={{ width: `${progressRatio * 100}%` }}
          />
        </View>

        {workout.description ? (
          <Text className="text-brand-text-secondary text-sm mt-3">{workout.description}</Text>
        ) : null}
      </View>

      {workout.exercises.map((ex, idx) => (
        <ExerciseCard
          key={ex.id}
          exercise={ex}
          index={idx}
          setsDone={checklist[ex.id] ?? Array(ex.sets).fill(false)}
          onToggleSet={(setIndex) => toggleSet(ex, setIndex)}
          onToggleAll={() => toggleAllSets(ex)}
        />
      ))}

      {workoutDone && (
        <View className="mt-2 bg-green-500/10 border border-green-500/30 rounded-2xl p-4 items-center gap-1">
          <Text className="text-2xl">🎉</Text>
          <Text className="text-green-400 font-bold text-base">Treino concluído!</Text>
          <Text className="text-brand-text-muted text-sm text-center">
            Todas as séries foram marcadas. Ótimo trabalho!
          </Text>
        </View>
      )}

      <View className="mt-4 bg-brand-surface rounded-2xl p-4">
        <Text className="text-brand-text-secondary text-xs font-semibold mb-2">
          OBSERVAÇÕES DA SESSÃO
        </Text>
        <TextInput
          className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-4 py-3"
          placeholder="Como foi o treino hoje? Anote dores, progressos ou qualquer observação..."
          placeholderTextColor="#606078"
          value={sessionNote}
          onChangeText={handleNoteChange}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={{ minHeight: 96 }}
        />
        <Text className="text-brand-text-muted text-xs mt-2">
          Salvo automaticamente · Visível para seu coach.
        </Text>
      </View>
    </ScrollView>
  );
}
