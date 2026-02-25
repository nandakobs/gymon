import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { changePassword } from '@/services/firebase/auth.service';

function mapFirebaseError(code: string): string {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Senha atual incorreta.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    case 'auth/requires-recent-login':
      return 'Por segurança, faça login novamente antes de alterar a senha.';
    case 'auth/weak-password':
      return 'A nova senha precisa ter pelo menos 6 caracteres.';
    default:
      return 'Não foi possível alterar a senha. Tente novamente.';
  }
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => router.back(), 1800);
    return () => clearTimeout(t);
  }, [success]);

  async function handleSubmit() {
    setError(null);

    if (!current) {
      setError('Informe sua senha atual.');
      return;
    }
    if (next.length < 6) {
      setError('A nova senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (next !== confirm) {
      setError('A confirmação não coincide com a nova senha.');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(current, next);
      setSuccess(true);
    } catch (e: any) {
      const code: string = e?.code ?? '';
      setError(mapFirebaseError(code));
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <View className="flex-1 bg-brand-background items-center justify-center px-6">
        <View className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 w-full items-center gap-3">
          <Text className="text-green-400 text-xl font-bold">Senha alterada!</Text>
          <Text className="text-brand-text-secondary text-sm text-center">
            Sua senha foi atualizada com sucesso. Redirecionando...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-brand-background"
      contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-brand-text-secondary text-sm mb-6">
        Digite sua senha atual para confirmar sua identidade e depois escolha a nova senha.
      </Text>

      {error && (
        <View className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
          <Text className="text-red-400 text-sm">{error}</Text>
        </View>
      )}

      <Text className="text-brand-text-secondary text-xs mb-1 ml-1">Senha atual</Text>
      <TextInput
        className="bg-brand-surface text-brand-text-primary rounded-xl px-4 py-3 mb-4"
        placeholder="Senha atual"
        placeholderTextColor="#606078"
        value={current}
        onChangeText={setCurrent}
        secureTextEntry
        autoCapitalize="none"
      />

      <Text className="text-brand-text-secondary text-xs mb-1 ml-1">Nova senha</Text>
      <TextInput
        className="bg-brand-surface text-brand-text-primary rounded-xl px-4 py-3 mb-4"
        placeholder="Mínimo 6 caracteres"
        placeholderTextColor="#606078"
        value={next}
        onChangeText={setNext}
        secureTextEntry
        autoCapitalize="none"
      />

      <Text className="text-brand-text-secondary text-xs mb-1 ml-1">Confirmar nova senha</Text>
      <TextInput
        className="bg-brand-surface text-brand-text-primary rounded-xl px-4 py-3 mb-8"
        placeholder="Repita a nova senha"
        placeholderTextColor="#606078"
        value={confirm}
        onChangeText={setConfirm}
        secureTextEntry
        autoCapitalize="none"
      />

      <TouchableOpacity
        className={`bg-brand-primary rounded-xl py-4 items-center ${isLoading ? 'opacity-60' : ''}`}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text className="text-white font-semibold text-base">
          {isLoading ? 'Salvando...' : 'Salvar nova senha'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
