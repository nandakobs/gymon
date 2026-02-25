import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'GymOn',
  slug: 'gymon',
  version: '1.0.0',
  platforms: ['android'],
  orientation: 'portrait',
  scheme: 'gymon',
  primaryColor: '#0F0F1A',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'dark',
  backgroundColor: '#0F0F1A',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#0F0F1A',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/old-icon.png',
      backgroundColor: '#0F0F1A',
    },
    backgroundColor: '#0F0F1A',
    package: 'com.gymOn.app',
    googleServicesFile: './google-services.json',
    newArchEnabled: true,
  },
  plugins: [
    'expo-system-ui',
    'expo-router',
    'expo-secure-store',
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'O GymOn precisa da sua localização para confirmar que você está na academia.',
        locationWhenInUsePermission:
          'O GymOn precisa da sua localização para confirmar que você está na academia.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        color: '#FF6B35',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    tsconfigPaths: true,
  },
  extra: {
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    eas: {
      projectId: 'YOUR_EAS_PROJECT_ID',
    },
  },
});
