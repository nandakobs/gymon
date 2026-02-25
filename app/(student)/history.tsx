import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { getAllProgressForStudent } from '@/services/firebase/workoutProgress.service';
import { getWorkoutsByStudent } from '@/services/firebase/workouts.service';
import { CheckCheck, Dumbbell } from 'lucide-react-native';
import type { Workout } from '@/types';
import type { WorkoutProgressRecord, SetChecklist } from '@/services/firebase/workoutProgress.service';

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function countDone(sets: boolean[] | undefined): number {
  return sets?.filter(Boolean).length ?? 0;
}

function hasAnyProgress(completedSets: SetChecklist): boolean {
  return Object.values(completedSets).some((sets) => sets.some(Boolean));
}

type DayEntry = {
  date: string;
  records: Array<{ record: WorkoutProgressRecord; workout: Workout | undefined }>;
};

function ExerciseRow({
  name,
  done,
  total,
}: {
  name: string;
  done: number;
  total: number;
}) {
  const allDone = done === total;
  return (
    <View className="flex-row items-center gap-3 py-1.5">
      <View
        className={`w-5 h-5 rounded-full items-center justify-center border ${
          allDone ? 'bg-green-500 border-green-500' : 'border-brand-primary bg-brand-primary/20'
        }`}
      >
        {allDone ? (
          <Text className="text-white text-[9px] font-bold">✓</Text>
        ) : (
          <Text className="text-brand-primary text-[9px] font-bold">{done}</Text>
        )}
      </View>
      <Text className="flex-1 text-brand-text-secondary text-sm">{name}</Text>
      <Text className="text-brand-text-muted text-xs">
        {done}/{total} série{total !== 1 ? 's' : ''}
      </Text>
    </View>
  );
}

function WorkoutHistoryCard({
  record,
  workout,
}: {
  record: WorkoutProgressRecord;
  workout: Workout | undefined;
}) {
  const name = workout?.name ?? 'Treino removido';
  const snaps = record.exerciseSnapshots;
  const hasSnaps = snaps && Object.keys(snaps).length > 0;

  const exerciseItems = hasSnaps
    ? Object.entries(snaps)
        .filter(([id]) => record.completedSets[id]?.some(Boolean))
        .map(([id, snap]) => ({
          id,
          name: snap.name,
          done: countDone(record.completedSets[id]),
          total: record.completedSets[id]?.length ?? 1,
        }))
    : (workout?.exercises ?? [])
        .filter((ex) => record.completedSets[ex.id]?.some(Boolean))
        .map((ex) => ({
          id: ex.id,
          name: ex.name,
          done: countDone(record.completedSets[ex.id]),
          total: ex.sets,
        }));

  const totalInPlan = workout?.exercises.length ?? exerciseItems.length;
  const doneExercises = exerciseItems.filter((e) => e.done === e.total).length;
  const allComplete = exerciseItems.length > 0 && doneExercises === exerciseItems.length;

  return (
    <View className={`rounded-2xl mb-3 border overflow-hidden ${allComplete ? 'border-green-500/30' : 'border-transparent'}`}>
      <View className="bg-brand-surface p-4">
        <View className="flex-row items-center gap-3 mb-2">
          <View className={`w-8 h-8 rounded-xl items-center justify-center ${allComplete ? 'bg-green-500' : 'bg-brand-primary'}`}>
            {allComplete ? (
              <CheckCheck color="#fff" size={14} />
            ) : (
              <Dumbbell color="#fff" size={14} />
            )}
          </View>
          <View className="flex-1">
            <Text className="text-brand-text-primary font-semibold">{name}</Text>
            <Text className="text-brand-text-muted text-xs">
              {exerciseItems.length}/{totalInPlan} exercício{totalInPlan !== 1 ? 's' : ''} concluído{exerciseItems.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {exerciseItems.map((item) => (
          <ExerciseRow key={item.id} name={item.name} done={item.done} total={item.total} />
        ))}

        {record.studentNote ? (
          <View className="mt-3 bg-brand-surface-2 rounded-xl px-3 py-2">
            <Text className="text-brand-text-muted text-xs mb-1">Observação da sessão</Text>
            <Text className="text-brand-text-secondary text-sm">{record.studentNote}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [days, setDays] = useState<DayEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [records, workoutList] = await Promise.all([
        getAllProgressForStudent(user.uid),
        getWorkoutsByStudent(user.uid),
      ]);

      const workoutMap = new Map(workoutList.map((w) => [w.id, w]));

      const filtered = records.filter((r) => hasAnyProgress(r.completedSets));
      filtered.sort((a, b) => b.date.localeCompare(a.date));

      const grouped: Record<string, DayEntry['records']> = {};
      for (const record of filtered) {
        if (!grouped[record.date]) grouped[record.date] = [];
        grouped[record.date].push({ record, workout: workoutMap.get(record.workoutId) });
      }

      setDays(
        Object.entries(grouped).map(([date, records]) => ({ date, records })),
      );
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  return (
    <ScrollView
      className="flex-1 bg-brand-background"
      contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
    >
      <Text className="text-brand-text-primary text-2xl font-bold mb-6">Histórico</Text>

      {isLoading ? (
        <ActivityIndicator color="#FF6B35" />
      ) : days.length === 0 ? (
        <View className="items-center mt-16 gap-3">
          <Dumbbell color="#606078" size={40} />
          <Text className="text-brand-text-muted text-base">Nenhum treino registrado ainda.</Text>
          <Text className="text-brand-text-muted text-sm text-center">
            Marque séries nos seus treinos e elas aparecerão aqui.
          </Text>
        </View>
      ) : (
        days.map(({ date, records }) => (
          <View key={date} className="mb-6">
            <Text className="text-brand-text-secondary text-sm font-semibold mb-3 capitalize">
              {formatDate(date)}
            </Text>
            {records.map(({ record, workout }) => (
              <WorkoutHistoryCard key={record.id} record={record} workout={workout} />
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}
