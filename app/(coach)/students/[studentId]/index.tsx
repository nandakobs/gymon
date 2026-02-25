import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { getWorkoutsByStudentForCoach, deleteWorkout } from '@/services/firebase/workouts.service';
import { useAuth } from '@/providers/AuthProvider';
import {
  addCoachObservation,
  getCoachObservations,
  type CoachObservation,
} from '@/services/firebase/coachObservations.service';
import {
  Plus,
  Pencil,
  Trash2,
  Dumbbell,
  History,
  MessageSquarePlus,
} from 'lucide-react-native';
import type { User, Workout } from '@/types';

function formatMemberSince(date: string | undefined): string {
  if (!date) return '—';
  try {
    return new Date(date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  } catch {
    return '—';
  }
}

function formatObsDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start gap-3 py-2 border-b border-brand-surface-2">
      <Text className="text-brand-text-muted text-sm" style={{ width: 104 }}>{label}</Text>
      <Text className="text-brand-text-primary text-sm flex-1">{value}</Text>
    </View>
  );
}

export default function StudentDetail() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const router = useRouter();
  const { user, gymId } = useAuth();

  const [student, setStudent] = useState<User | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [observations, setObservations] = useState<CoachObservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [newObsText, setNewObsText] = useState('');
  const [isSavingObs, setIsSavingObs] = useState(false);

  const fetchData = useCallback(async () => {
    if (!studentId || !gymId) return;
    setIsLoading(true);
    try {
      const [studentSnap, workoutList, obsList] = await Promise.all([
        getDoc(doc(db, 'users', studentId)),
        getWorkoutsByStudentForCoach(studentId, gymId),
        getCoachObservations(studentId).catch(() => [] as CoachObservation[]),
      ]);
      if (studentSnap.exists()) {
        setStudent({ id: studentSnap.id, ...studentSnap.data() } as User);
      }
      setWorkouts(workoutList);
      setObservations(obsList);
    } finally {
      setIsLoading(false);
    }
  }, [studentId, gymId]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  async function handleAddObservation() {
    if (!newObsText.trim() || !studentId || !user) return;
    setIsSavingObs(true);
    try {
      await addCoachObservation({
        studentId,
        coachId: user.uid,
        coachName: user.displayName ?? 'Coach',
        content: newObsText.trim(),
        createdAt: new Date().toISOString(),
      });
      setNewObsText('');
      setObservations((prev) => [
        {
          id: Date.now().toString(),
          studentId,
          coachId: user.uid,
          coachName: user.displayName ?? 'Coach',
          content: newObsText.trim(),
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar a observação. Tente novamente.');
    } finally {
      setIsSavingObs(false);
    }
  }

  function confirmDelete(workout: Workout) {
    Alert.alert(
      'Excluir treino',
      `Tem certeza que deseja excluir "${workout.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteWorkout(workout.id);
            setWorkouts((prev) => prev.filter((w) => w.id !== workout.id));
          },
        },
      ],
    );
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-brand-background items-center justify-center">
        <Stack.Screen options={{ title: 'Carregando...' }} />
        <ActivityIndicator color="#FF6B35" size="large" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: student?.displayName ?? 'Aluno' }} />
      <ScrollView
        className="flex-1 bg-brand-background"
        contentContainerStyle={{ paddingBottom: 40 }}
      >

      <View className="px-6 pt-4 pb-3 flex-row items-center gap-2 justify-end">
        <TouchableOpacity
          className="flex-row items-center gap-1.5 bg-brand-surface rounded-xl px-3 py-2"
          onPress={() => router.push(`/(coach)/students/${studentId}/history` as any)}
        >
          <History color="#A0A0B8" size={15} />
          <Text className="text-brand-text-secondary text-sm">Histórico</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-row items-center gap-1.5 bg-brand-primary rounded-xl px-3 py-2"
          onPress={() => router.push(`/(coach)/students/${studentId}/workout-editor` as any)}
        >
          <Plus color="#fff" size={15} />
          <Text className="text-white font-semibold text-sm">Novo Treino</Text>
        </TouchableOpacity>
      </View>

      {student && (
        <View className="mx-6 mb-4 bg-brand-surface rounded-2xl overflow-hidden">
          <View className="px-4 pt-4 pb-3 flex-row items-center gap-3 border-b border-brand-surface-2">
            <View className="w-12 h-12 rounded-full bg-brand-surface-2 items-center justify-center">
              <Text className="text-brand-text-primary font-bold text-lg">
                {getInitials(student.displayName)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-brand-text-primary font-bold text-base">
                {student.displayName}
              </Text>
              <Text className="text-brand-text-secondary text-xs">{student.email}</Text>
            </View>
          </View>

          <View className="px-4 pb-2">
            <ProfileRow label="Membro desde" value={formatMemberSince((student as any).memberSince ?? student.createdAt)} />
            <ProfileRow
              label="Altura"
              value={student.height != null ? `${student.height} cm` : '—'}
            />
            <ProfileRow
              label="Peso"
              value={student.weight != null ? `${student.weight} kg` : '—'}
            />
            <ProfileRow label="Objetivo" value={student.goal ?? '—'} />
            <ProfileRow
              label="Cond. médicas"
              value={student.medical_conditions ?? '—'}
            />
          </View>
        </View>
      )}

      <View className="mx-6 mb-4 bg-brand-surface rounded-2xl p-4">
        <Text className="text-brand-text-secondary text-xs font-semibold mb-3">
          OBSERVAÇÕES DO COACH
        </Text>

        <TextInput
          className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-4 py-3 mb-2"
          placeholder="Nova observação sobre o aluno..."
          placeholderTextColor="#606078"
          value={newObsText}
          onChangeText={setNewObsText}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          style={{ minHeight: 76 }}
        />
        <TouchableOpacity
          className={`flex-row items-center justify-center gap-2 bg-brand-primary rounded-xl py-3 mb-4 ${isSavingObs || !newObsText.trim() ? 'opacity-50' : ''}`}
          onPress={handleAddObservation}
          disabled={isSavingObs || !newObsText.trim()}
        >
          {isSavingObs ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <MessageSquarePlus color="#fff" size={15} />
              <Text className="text-white font-semibold text-sm">Adicionar observação</Text>
            </>
          )}
        </TouchableOpacity>

        {observations.length === 0 ? (
          <Text className="text-brand-text-muted text-sm text-center py-2">
            Nenhuma observação registrada ainda.
          </Text>
        ) : (
          observations.map((obs) => (
            <View key={obs.id} className="bg-brand-surface-2 rounded-xl px-4 py-3 mb-2">
              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-brand-primary text-xs font-semibold">{obs.coachName}</Text>
                <Text className="text-brand-text-muted text-xs">{formatObsDate(obs.createdAt)}</Text>
              </View>
              <Text className="text-brand-text-secondary text-sm">{obs.content}</Text>
            </View>
          ))
        )}
      </View>

      <View className="mx-6 mb-4">
        <Text className="text-brand-text-secondary text-xs font-semibold mb-2">
          TREINOS CADASTRADOS
        </Text>

        {workouts.length === 0 ? (
          <View className="bg-brand-surface rounded-2xl p-6 items-center gap-3">
            <Dumbbell color="#606078" size={32} />
            <Text className="text-brand-text-muted text-sm">Nenhum treino cadastrado.</Text>
          </View>
        ) : (
          workouts.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-brand-surface rounded-2xl p-4 mb-3"
              activeOpacity={0.75}
              onPress={() =>
                router.push(
                  `/(coach)/students/${studentId}/workout-editor?workoutId=${item.id}` as any,
                )
              }
            >
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1">
                  <Text className="text-brand-text-primary font-semibold" numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.description ? (
                    <Text className="text-brand-text-secondary text-xs mt-0.5" numberOfLines={1}>
                      {item.description}
                    </Text>
                  ) : null}
                  <Text className="text-brand-text-muted text-xs mt-1">
                    {item.exercises.length} exercício{item.exercises.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <View className="flex-row gap-4 pt-0.5">
                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        `/(coach)/students/${studentId}/workout-editor?workoutId=${item.id}` as any,
                      )
                    }
                    hitSlop={8}
                  >
                    <Pencil color="#A0A0B8" size={18} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(item)} hitSlop={8}>
                    <Trash2 color="#F44336" size={18} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
      </ScrollView>
    </>
  );
}
