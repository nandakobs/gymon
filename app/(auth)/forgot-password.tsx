import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { resetPassword } from '@/services/firebase/auth.service';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    setError(null);
    setIsLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch {
      setError('Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  if (sent) {
    return (
      <View className="flex-1 bg-brand-background px-6 justify-center">
        <Text className="text-brand-text-primary text-2xl font-bold mb-3">E-mail enviado</Text>
        <Text className="text-brand-text-secondary text-base mb-8">
          Se esse endereço estiver cadastrado, você receberá um link para redefinir sua senha.
        </Text>
        <TouchableOpacity
          className="bg-brand-primary rounded-xl py-4 items-center"
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text className="text-white font-semibold text-base">Voltar ao login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-background px-6 justify-center">
      <TouchableOpacity className="mb-6" onPress={() => router.back()}>
        <Text className="text-brand-text-secondary text-base">← Voltar</Text>
      </TouchableOpacity>

      <Text className="text-brand-text-primary text-2xl font-bold mb-2">Esqueceu a senha?</Text>
      <Text className="text-brand-text-secondary text-base mb-8">
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </Text>

      {error && (
        <Text className="text-brand-danger text-sm mb-4">{error}</Text>
      )}

      <TextInput
        className="bg-brand-surface text-brand-text-primary rounded-xl px-4 py-3 mb-6"
        placeholder="E-mail"
        placeholderTextColor="#606078"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoFocus
      />

      <TouchableOpacity
        className="bg-brand-primary rounded-xl py-4 items-center"
        onPress={handleReset}
        disabled={isLoading || email.trim().length === 0}
      >
        <Text className="text-white font-semibold text-base">
          {isLoading ? 'Enviando...' : 'Enviar link'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
