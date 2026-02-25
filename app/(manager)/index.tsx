import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Users, Calendar, TrendingDown, LogOut } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';

export default function ManagerDashboard() {
  const router = useRouter();
  const { signOut } = useAuth();

  const menuItems = [
    {
      label: 'Gerenciar Usuários',
      icon: Users,
      route: '/(manager)/users' as const,
    },
    {
      label: 'Configurar Calendário',
      icon: Calendar,
      route: '/(manager)/calendar-config' as const,
    },
    {
      label: 'Relatório de Churn',
      icon: TrendingDown,
      route: '/(manager)/churn-report' as const,
    },
  ];

  return (
    <ScrollView className="flex-1 bg-brand-background">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-brand-text-primary text-2xl font-bold">Painel do Gerente</Text>
      </View>

      <View className="px-6 gap-3">
        {menuItems.map(({ label, icon: Icon, route }) => (
          <TouchableOpacity
            key={route}
            className="bg-brand-surface rounded-2xl p-4 flex-row items-center gap-3"
            onPress={() => router.push(route)}
          >
            <Icon color="#FF6B35" size={24} />
            <Text className="text-brand-text-primary font-semibold flex-1">{label}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          className="bg-brand-surface rounded-2xl p-4 flex-row items-center gap-3"
          onPress={signOut}
        >
          <LogOut color="#F44336" size={24} />
          <Text className="text-brand-danger font-semibold">Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
