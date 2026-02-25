import { View, Text, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { resetPassword } from '@/services/firebase/auth.service';

export default function SettingsScreen() {
  const [pushEnabled, setPushEnabled] = useState(true);
  const { user } = useAuth();

  async function handleResetPassword() {
    if (!user?.email) return;
    try {
      await resetPassword(user.email);
      Alert.alert(
        'E-mail enviado',
        'Verifique sua caixa de entrada para redefinir sua senha.',
      );
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar o e-mail. Tente novamente.');
    }
  }

  return (
    <ScrollView className="flex-1 bg-brand-background">
      <View className="px-6 pt-6 pb-4">
        <Text className="text-brand-text-primary text-2xl font-bold">Configurações</Text>
      </View>

      <View className="px-6 gap-3">
        <View className="bg-brand-surface rounded-2xl p-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-brand-text-primary font-semibold">Notificações push</Text>
            <Text className="text-brand-text-secondary text-sm">
              Lembretes de treino e ofensiva
            </Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ false: '#2A2A3E', true: '#FF6B35' }}
            thumbColor="#FFFFFF"
          />
        </View>
        <TouchableOpacity
          className="bg-brand-surface rounded-2xl p-4 flex-row items-center justify-between"
          onPress={handleResetPassword}
        >
          <View className="flex-1">
            <Text className="text-brand-text-primary font-semibold">Redefinir senha</Text>
            <Text className="text-brand-text-secondary text-sm">
              Enviar link de redefinição para {user?.email}
            </Text>
          </View>
          <Text className="text-brand-primary text-sm font-semibold">Enviar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
