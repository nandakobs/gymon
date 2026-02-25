import { View, Image, ActivityIndicator } from 'react-native';

export function LoadingScreen() {
  return (
    <View 
      className="flex-1 bg-brand-background items-center justify-center"
      style={{ backgroundColor: '#0F0F1A' }}
    >
      <Image
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        source={require('../../../assets/images/icon.png')}
        style={{ width: 200, height: 80, marginBottom: 20 }}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#FF6B35" />
    </View>
  );
}
