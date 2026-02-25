import { View, Text } from 'react-native';
import { Flame } from 'lucide-react-native';

interface StreakWidgetProps {
  streak: number;
  freezesRemaining: number;
}

export function StreakWidget({ streak, freezesRemaining }: StreakWidgetProps) {
  return (
    <View className="bg-brand-surface rounded-2xl p-4">
      <Text className="text-brand-text-secondary text-sm mb-1">Ofensiva atual</Text>
      <View className="flex-row items-center gap-2">
        <Flame color="#FF6B35" size={32} />
        <Text className="text-brand-text-primary text-4xl font-bold">{streak}</Text>
        <Text className="text-brand-text-secondary text-base self-end mb-1">
          {streak === 1 ? 'dia' : 'dias'}
        </Text>
      </View>
      <Text className="text-brand-text-muted text-xs mt-2">
        ❄️ {freezesRemaining} {freezesRemaining === 1 ? 'freeze restante' : 'freezes restantes'}
      </Text>
    </View>
  );
}
