import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { MapPin } from 'lucide-react-native';

interface CheckInButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  hasCheckedIn?: boolean;
}

export function CheckInButton({ onPress, isLoading, hasCheckedIn }: CheckInButtonProps) {
  if (hasCheckedIn) {
    return (
      <View className="bg-brand-success rounded-2xl p-4 flex-row items-center justify-center gap-2">
        <MapPin color="#fff" size={20} />
        <Text className="text-white font-semibold">Check-in realizado ✓</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      className="bg-brand-primary rounded-2xl p-4 flex-row items-center justify-center gap-2"
      onPress={onPress}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <MapPin color="#fff" size={20} />
          <Text className="text-white font-semibold">Confirmar presença</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
