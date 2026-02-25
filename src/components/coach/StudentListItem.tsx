import { TouchableOpacity, View, Text } from 'react-native';
import { ChevronRight, Flame } from 'lucide-react-native';
import type { User } from '@/types';

interface StudentListItemProps {
  student: User;
  streak?: number;
  onPress: () => void;
}

export function StudentListItem({ student, streak = 0, onPress }: StudentListItemProps) {
  return (
    <TouchableOpacity
      className="bg-brand-surface rounded-2xl p-4 flex-row items-center gap-3 mb-3"
      onPress={onPress}
    >
      <View className="w-10 h-10 rounded-full bg-brand-surface-2 items-center justify-center">
        <Text className="text-brand-text-primary font-bold">
          {student.displayName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-brand-text-primary font-semibold">{student.displayName}</Text>
        <View className="flex-row items-center gap-1 mt-0.5">
          <Flame color="#FF6B35" size={12} />
          <Text className="text-brand-text-secondary text-xs">{streak} dias</Text>
        </View>
      </View>
      <ChevronRight color="#606078" size={20} />
    </TouchableOpacity>
  );
}
