import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { getWorkoutsByStudent } from '@/services/firebase/workouts.service';
import { Dumbbell, ChevronRight } from 'lucide-react-native';
import type { Workout } from '@/types';

export default function WorkoutList() {
  const { user } = useAuth();
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkouts = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      setWorkouts(await getWorkoutsByStudent(user.uid));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
    }, [fetchWorkouts])
  );

  return (
    <View className="flex-1 bg-brand-background">
      <Stack.Screen options={{ title: 'Meus Treinos' }} />

      {isLoading ? (
        <ActivityIndicator color="#FF6B35" className="mt-16" />
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(w) => w.id}
          contentContainerStyle={{ padding: 24 }}
          ListEmptyComponent={
            <View className="items-center pt-20 gap-3">
              <Dumbbell color="#606078" size={40} />
              <Text className="text-brand-text-muted text-base">
                Nenhum treino cadastrado ainda.
              </Text>
              <Text className="text-brand-text-muted text-sm text-center px-8">
                Seu coach irá cadastrar seus planos de treino em breve.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-brand-surface rounded-2xl p-4 mb-3 flex-row items-center gap-3"
              onPress={() => router.push(`/(student)/workouts/${item.id}` as any)}
              activeOpacity={0.75}
            >
              <View className="w-10 h-10 rounded-xl bg-brand-surface-2 items-center justify-center">
                <Dumbbell color="#FF6B35" size={20} />
              </View>
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
              <ChevronRight color="#606078" size={18} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
