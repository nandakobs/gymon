import { View, Text, TextInput, TouchableOpacity, Modal, Pressable, Image } from 'react-native';
import { useState } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureMode, setSecureMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  async function handleLogin() {
    setError(null);
    setIsLoading(true);
    try {
      await signIn(email, password);
    } catch {
      setError('E-mail ou senha inválidos.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-brand-background px-6 justify-center items-center">
      <Image
        source={require('../../assets/images/icon.png')}
        style={{ width: 200, height: 80 }}
        resizeMode="contain"
      />
      <Text className="text-brand-text-secondary text-base mt-2 mb-8 text-center">
        Entre na sua conta para continuar
      </Text>

      {error && (
        <Text className="text-brand-danger text-sm mb-4 w-full">{error}</Text>
      )}

      <TextInput
        className="w-full bg-brand-surface text-brand-text-primary rounded-xl px-4 py-3 mb-4"
        placeholder="E-mail"
        placeholderTextColor="#606078"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />

      <View className="w-full flex-row items-center bg-brand-surface rounded-xl px-4 mb-2">
        <TextInput
          className="flex-1 text-brand-text-primary py-3"
          placeholder="Senha"
          placeholderTextColor="#606078"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secureMode}
        />
        <TouchableOpacity onPress={() => setSecureMode(!secureMode)}>
          {secureMode ? (
            <Eye size={20} color="#606078" />
          ) : (
            <EyeOff size={20} color="#606078" />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        className="self-end mb-6"
        onPress={() => setShowForgotModal(true)}
      >
        <Text className="text-brand-primary text-sm">Esqueceu a senha?</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className={`w-full rounded-xl py-4 items-center ${
          isLoading ? 'bg-brand-primary/50' : 'bg-brand-primary'
        }`}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text className="text-white font-semibold text-base">
          {isLoading ? 'Entrando...' : 'Entrar'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showForgotModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowForgotModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-6">
          <View className="bg-brand-surface rounded-xl p-6 w-full max-w-sm">
            <Text className="text-brand-text-primary text-lg font-semibold mb-4">
              Esqueceu a senha?
            </Text>
            <Text className="text-brand-text-secondary text-sm mb-4">
              Entre em contato com o administrador do seu gym para resetar sua senha.
            </Text>
            <TouchableOpacity
              className="bg-brand-primary rounded-xl py-3 items-center"
              onPress={() => setShowForgotModal(false)}
            >
              <Text className="text-white font-semibold">Entendi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
