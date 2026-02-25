import { View, Text, FlatList } from 'react-native';

export default function SystemLogs() {
  return (
    <View className="flex-1 bg-brand-background">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-brand-text-primary text-2xl font-bold">Logs do Sistema</Text>
      </View>

      <FlatList
        data={[]}
        keyExtractor={(item) => String(item)}
        contentContainerStyle={{ paddingHorizontal: 24 }}
        ListEmptyComponent={
          <View className="bg-brand-surface rounded-2xl p-6 items-center">
            <Text className="text-brand-text-muted text-sm">
              Nenhum log registrado.
            </Text>
          </View>
        }
        renderItem={({ item }) => null}
      />
    </View>
  );
}
