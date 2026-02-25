import { View, Text, ScrollView } from 'react-native';

export default function ChurnReport() {
  return (
    <ScrollView className="flex-1 bg-brand-background">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-brand-text-primary text-2xl font-bold">
          Relatório de Churn
        </Text>
        <Text className="text-brand-text-secondary text-sm mt-1">
          Alunos em risco de cancelamento
        </Text>
      </View>

      <View className="mx-6 bg-brand-surface rounded-2xl p-4">
        <Text className="text-brand-text-secondary text-sm">
          O relatório de churn aparecerá aqui.
        </Text>
      </View>
    </ScrollView>
  );
}
