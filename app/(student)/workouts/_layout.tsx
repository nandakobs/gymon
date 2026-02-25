import { Stack } from 'expo-router';

export default function WorkoutsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#1E1E30' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  );
}
