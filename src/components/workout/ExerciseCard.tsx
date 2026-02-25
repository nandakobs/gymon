import { View, Text } from 'react-native';
import type { Exercise } from '@/types';
import { formatWeight, formatReps } from '@/utils/formatters';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
}

export function ExerciseCard({ exercise, index }: ExerciseCardProps) {
  return (
    <View className="bg-brand-surface rounded-2xl p-4 mb-3">
      <View className="flex-row items-center gap-2 mb-2">
        <View className="w-7 h-7 rounded-full bg-brand-primary items-center justify-center">
          <Text className="text-white text-xs font-bold">{index + 1}</Text>
        </View>
        <Text className="text-brand-text-primary font-semibold flex-1">{exercise.name}</Text>
      </View>

      <View className="flex-row gap-4">
        <View>
          <Text className="text-brand-text-muted text-xs">Séries</Text>
          <Text className="text-brand-text-primary font-semibold">{exercise.sets}x</Text>
        </View>
        <View>
          <Text className="text-brand-text-muted text-xs">Reps</Text>
          <Text className="text-brand-text-primary font-semibold">
            {formatReps(exercise.reps)}
          </Text>
        </View>
        {exercise.weightKg !== undefined && (
          <View>
            <Text className="text-brand-text-muted text-xs">Carga</Text>
            <Text className="text-brand-text-primary font-semibold">
              {formatWeight(exercise.weightKg)}
            </Text>
          </View>
        )}
      </View>

      {exercise.notes && (
        <Text className="text-brand-text-secondary text-sm mt-2">{exercise.notes}</Text>
      )}
    </View>
  );
}
