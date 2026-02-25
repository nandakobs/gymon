import { View, Text } from 'react-native';
import { WifiOff } from 'lucide-react-native';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <View className="bg-brand-warning px-4 py-2 flex-row items-center gap-2">
      <WifiOff color="#000" size={16} />
      <Text className="text-black text-sm font-semibold">
        Sem conexão — modo offline
      </Text>
    </View>
  );
}
