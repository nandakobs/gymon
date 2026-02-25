import { Tabs } from 'expo-router';
import { Users, MessageSquare, User } from 'lucide-react-native';

export default function CoachLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E1E30',
          borderTopColor: '#2A2A3E',
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#606078',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Alunos',
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="inbox/index"
        options={{
          href: null
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="students"
        options={{
          href: null
        }}
      />
    </Tabs>
  );
}
