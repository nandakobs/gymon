import { Stack } from 'expo-router';
import ChangePasswordScreen from '@/components/common/ChangePasswordScreen';

export default function ChangePasswordRoute() {
  return (
    <>
      <Stack.Screen options={{ title: 'Alterar Senha' }} />
      <ChangePasswordScreen />
    </>
  );
}
