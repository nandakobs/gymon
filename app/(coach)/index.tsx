import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { getStudentsByGym } from '@/services/firebase/students.service';
import { ChevronRight } from 'lucide-react-native';
import type { User } from '@/types';

export default function CoachDashboard() {
  const { user, gymId } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    if (!gymId) return;
    setIsLoading(true);
    try {
      const list = await getStudentsByGym(gymId);
      list.sort((a, b) =>
        a.displayName.localeCompare(b.displayName, 'pt-BR', { sensitivity: 'base' }),
      );
      setStudents(list);
    } finally {
      setIsLoading(false);
    }
  }, [gymId]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  return (
    <View className="flex-1 bg-brand-background">
      <View className="px-6 pt-14 pb-2">
        <Text className="text-brand-text-secondary text-base">Olá,</Text>
        <Text className="text-brand-text-primary text-2xl font-bold">
          {user?.displayName ?? 'Coach'}
        </Text>
      </View>

      <View className="px-6 py-3 flex-row items-center justify-between">
        <Text className="text-brand-text-primary text-lg font-semibold">Alunos da Academia</Text>
        {!isLoading && (
          <Text className="text-brand-text-muted text-sm">{students.length}</Text>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator color="#FF6B35" className="mt-8" />
      ) : (
        <FlatList
          data={students}
          keyExtractor={(s) => s.id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="bg-brand-surface rounded-2xl p-6 items-center">
              <Text className="text-brand-text-muted text-sm">
                Nenhum aluno cadastrado na academia.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              className="bg-brand-surface rounded-2xl p-4 mb-3 flex-row items-center gap-3"
              onPress={() => router.push(`/(coach)/students/${item.id}` as any)}
            >
              <View className="w-10 h-10 rounded-full bg-brand-surface-2 items-center justify-center">
                <Text className="text-brand-text-primary font-bold text-base">
                  {item.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-brand-text-primary font-semibold">{item.displayName}</Text>
                <Text className="text-brand-text-secondary text-xs mt-0.5">{item.email}</Text>
              </View>
              <ChevronRight color="#606078" size={18} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
