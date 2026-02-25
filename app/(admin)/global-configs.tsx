import { View, Text, ScrollView } from 'react-native';

export default function GlobalConfigs() {
  return (
    <ScrollView className="flex-1 bg-brand-background">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-brand-text-primary text-2xl font-bold">
          Configurações Globais
        </Text>
        <Text className="text-brand-text-secondary text-sm mt-1">
          Parâmetros do sistema GymOn
        </Text>
      </View>

      <View className="mx-6 bg-brand-surface rounded-2xl p-4">
        <Text className="text-brand-text-secondary text-sm">
          As configurações globais aparecerão aqui.
        </Text>
      </View>
    </ScrollView>
  );
}
