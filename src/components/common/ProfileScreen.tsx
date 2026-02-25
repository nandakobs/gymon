import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { ChevronRight, ChevronDown, History, Lock, LogOut, User } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { getUserById } from '@/services/firebase/users.service';
import type { User as AppUser } from '@/types';

function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatMemberSince(createdAt: string | undefined): string {
  if (!createdAt) return '—';
  try {
    const d = new Date(createdAt);
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  } catch {
    return '—';
  }
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start gap-3">
      <Text className="text-brand-text-secondary text-sm w-16">{label}</Text>
      <Text className="text-brand-text-primary text-sm flex-1">{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, role, signOut } = useAuth();
  const router = useRouter();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserById(user.uid).then(setAppUser).catch(console.error);
  }, [user?.uid]);

  function toggleExpanded() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }

  const historyPath = role === 'student' ? '/(student)/history' : null;
  const changePasswordPath =
    role === 'student'
      ? '/(student)/profile/change-password'
      : role === 'coach'
      ? '/(coach)/profile/change-password'
      : null;

  return (
    <ScrollView className="flex-1 bg-brand-background">
      <Stack.Screen options={{ headerShown: false }} />


      <View className="items-center pt-14 pb-2">
        <Image

          source={require('../../../assets/images/icon.png')}
          style={{ width: 120, height: 48 }}
          resizeMode="contain"
        />
      </View>


      <View className="items-center px-6 pt-4 pb-8">
        <View className="w-20 h-20 rounded-full bg-brand-surface-2 items-center justify-center mb-3">
          <Text className="text-brand-text-primary text-2xl font-bold">
            {getInitials(appUser?.displayName ?? user?.displayName)}
          </Text>
        </View>
        <Text className="text-brand-text-primary text-xl font-semibold mb-1">
          {appUser?.displayName ?? user?.displayName ?? '—'}
        </Text>
        <Text className="text-brand-text-secondary text-sm">
          Membro desde: {formatMemberSince(appUser?.memberSince ?? appUser?.createdAt)}
        </Text>
      </View>


      <View className="px-6 gap-3 pb-10">


        <View className="bg-brand-surface rounded-2xl overflow-hidden">
          <TouchableOpacity
            className="p-4 flex-row items-center gap-3"
            onPress={toggleExpanded}
          >
            <User color="#A0A0B8" size={20} />
            <Text className="text-brand-text-primary flex-1 font-medium">Meus Dados</Text>
            {expanded ? (
              <ChevronDown color="#A0A0B8" size={18} />
            ) : (
              <ChevronRight color="#A0A0B8" size={18} />
            )}
          </TouchableOpacity>

          {expanded && (
            <View className="border-t border-brand-surface-2 px-4 pb-4 pt-3 gap-3">
              <DataRow label="Nome" value={appUser?.displayName ?? user?.displayName ?? '—'} />
              <DataRow label="E-mail" value={appUser?.email ?? user?.email ?? '—'} />
              <DataRow
                label="Altura"
                value={appUser?.height != null ? `${appUser.height} cm` : '—'}
              />
              <DataRow
                label="Peso"
                value={appUser?.weight != null ? `${appUser.weight} kg` : '—'}
              />
              <DataRow label="Objetivo" value={appUser?.goal ?? '—'} />
              <DataRow label="Condições" value={appUser?.medical_conditions ?? '—'} />
            </View>
          )}
        </View>


        {historyPath && (
          <TouchableOpacity
            className="bg-brand-surface rounded-2xl p-4 flex-row items-center gap-3"
            onPress={() => router.push(historyPath as any)}
          >
            <History color="#A0A0B8" size={20} />
            <Text className="text-brand-text-primary flex-1 font-medium">Histórico de Treinos</Text>
            <ChevronRight color="#A0A0B8" size={18} />
          </TouchableOpacity>
        )}


        {changePasswordPath && (
          <TouchableOpacity
            className="bg-brand-surface rounded-2xl p-4 flex-row items-center gap-3"
            onPress={() => router.push(changePasswordPath as any)}
          >
            <Lock color="#A0A0B8" size={20} />
            <Text className="text-brand-text-primary flex-1 font-medium">Redefinir Senha</Text>
            <ChevronRight color="#A0A0B8" size={18} />
          </TouchableOpacity>
        )}


        <TouchableOpacity
          className="bg-brand-surface rounded-2xl p-4 flex-row items-center gap-3"
          onPress={signOut}
        >
          <LogOut color="#F44336" size={20} />
          <Text className="text-brand-danger font-semibold flex-1">Sair</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}
