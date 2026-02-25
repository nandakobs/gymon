import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Tabs } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  getWorkoutById,
  createWorkout,
  updateWorkout,
} from '@/services/firebase/workouts.service';
import { Plus, Trash2 } from 'lucide-react-native';
import type { Exercise } from '@/types';

function makeExercise(): Exercise {
  return {
    id: Math.random().toString(36).slice(2),
    name: '',
    sets: 3,
    reps: 10,
    weightKg: undefined,
    restSeconds: 60,
    notes: '',
  };
}

export default function WorkoutEditor() {
  const { studentId, workoutId } = useLocalSearchParams<{
    studentId: string;
    workoutId?: string;
  }>();
  const router = useRouter();
  const { user, gymId } = useAuth();

  const isEditing = !!workoutId;
  const [workoutName, setWorkoutName] = useState('');
  const [description, setDescription] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([makeExercise()]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  useEffect(() => {
    if (!isEditing || !workoutId) return;
    (async () => {
      const w = await getWorkoutById(workoutId);
      if (w) {
        setWorkoutName(w.name);
        setDescription(w.description ?? '');
        setExercises(w.exercises.length > 0 ? w.exercises : [makeExercise()]);
      }
      setIsLoading(false);
    })();
  }, [workoutId, isEditing]);

  function addExercise() {
    setExercises((prev) => [...prev, makeExercise()]);
  }

  function removeExercise(id: string) {
    setExercises((prev) => prev.filter((e) => e.id !== id));
  }

  function updateExercise(id: string, field: keyof Exercise, value: unknown) {
    setExercises((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
  }

  async function handleSave() {
    if (!workoutName.trim()) {
      Alert.alert('Erro', 'Informe o nome do treino.');
      return;
    }
    const validExercises = exercises.filter((e) => e.name.trim());
    if (validExercises.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos um exercício com nome.');
      return;
    }
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const payload = {
        studentId: studentId!,
        coachId: user!.uid,
        gymId: gymId!,
        name: workoutName.trim(),
        description: description.trim(),
        exercises: validExercises,
        updatedAt: now,
      };
      if (isEditing) {
        await updateWorkout(workoutId!, payload);
      } else {
        await createWorkout({ ...payload, createdAt: now });
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Erro', e.message ?? 'Erro ao salvar treino.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-brand-background items-center justify-center">
        <ActivityIndicator color="#FF6B35" size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-brand-background"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 }}
    >
      <Tabs.Screen options={{ title: isEditing ? 'Editar Treino' : 'Novo Treino' }} />

      <Text className="text-brand-text-secondary text-sm mb-1">Nome do treino *</Text>
      <TextInput
        className="bg-brand-surface text-brand-text-primary rounded-xl px-4 py-3 mb-4"
        placeholder="Ex: Treino A – Peito e Tríceps"
        placeholderTextColor="#606078"
        value={workoutName}
        onChangeText={setWorkoutName}
      />

      <Text className="text-brand-text-secondary text-sm mb-1">Descrição (opcional)</Text>
      <TextInput
        className="bg-brand-surface text-brand-text-primary rounded-xl px-4 py-3 mb-6"
        placeholder="Observações gerais"
        placeholderTextColor="#606078"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={2}
      />

      <Text className="text-brand-text-primary text-lg font-semibold mb-3">Exercícios</Text>

      {exercises.map((ex, idx) => (
        <View key={ex.id} className="bg-brand-surface rounded-2xl p-4 mb-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-brand-text-secondary text-xs font-semibold uppercase tracking-wide">
              Exercício {idx + 1}
            </Text>
            {exercises.length > 1 && (
              <TouchableOpacity onPress={() => removeExercise(ex.id)} hitSlop={8}>
                <Trash2 color="#F44336" size={16} />
              </TouchableOpacity>
            )}
          </View>

          <TextInput
            className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-3 py-2.5 mb-3"
            placeholder="Nome do exercício *"
            placeholderTextColor="#606078"
            value={ex.name}
            onChangeText={(v) => updateExercise(ex.id, 'name', v)}
          />

          <View className="flex-row gap-2 mb-3">
            <View className="flex-1">
              <Text className="text-brand-text-muted text-xs mb-1 text-center">Séries</Text>
              <TextInput
                className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-2 py-2.5 text-center"
                placeholder="3"
                placeholderTextColor="#606078"
                keyboardType="numeric"
                value={ex.sets ? String(ex.sets) : ''}
                onChangeText={(v) => updateExercise(ex.id, 'sets', parseInt(v) || 0)}
              />
            </View>
            <View className="flex-1">
              <Text className="text-brand-text-muted text-xs mb-1 text-center">Reps</Text>
              <TextInput
                className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-2 py-2.5 text-center"
                placeholder="10"
                placeholderTextColor="#606078"
                value={String(ex.reps ?? '')}
                onChangeText={(v) => updateExercise(ex.id, 'reps', v)}
              />
            </View>
            <View className="flex-1">
              <Text className="text-brand-text-muted text-xs mb-1 text-center">Peso kg (opc.)</Text>
              <TextInput
                className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-2 py-2.5 text-center"
                placeholder="—"
                placeholderTextColor="#606078"
                keyboardType="decimal-pad"
                value={ex.weightKg != null ? String(ex.weightKg) : ''}
                onChangeText={(v) =>
                  updateExercise(ex.id, 'weightKg', v ? parseFloat(v) : undefined)
                }
              />
            </View>
            <View className="flex-1">
              <Text className="text-brand-text-muted text-xs mb-1 text-center">Desc.(s)</Text>
              <TextInput
                className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-2 py-2.5 text-center"
                placeholder="60"
                placeholderTextColor="#606078"
                keyboardType="numeric"
                value={ex.restSeconds != null ? String(ex.restSeconds) : ''}
                onChangeText={(v) =>
                  updateExercise(ex.id, 'restSeconds', v ? parseInt(v) : undefined)
                }
              />
            </View>
          </View>

          <TextInput
            className="bg-brand-surface-2 text-brand-text-primary rounded-xl px-3 py-2.5"
            placeholder="Observações (opcional)"
            placeholderTextColor="#606078"
            value={ex.notes ?? ''}
            onChangeText={(v) => updateExercise(ex.id, 'notes', v)}
          />
        </View>
      ))}

      <TouchableOpacity
        className="bg-brand-surface-2 rounded-xl py-3 flex-row items-center justify-center gap-2 mb-6"
        onPress={addExercise}
      >
        <Plus color="#FF6B35" size={18} />
        <Text className="text-brand-primary font-semibold">Adicionar Exercício</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className={`bg-brand-primary rounded-xl py-4 items-center ${isSaving ? 'opacity-50' : ''}`}
        onPress={handleSave}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white font-semibold text-base">
            {isEditing ? 'Salvar Alterações' : 'Criar Treino'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}
