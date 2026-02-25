import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { isWithinGeofence } from '@/utils/geofenceUtils';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: false,
  });

  const getCurrentLocation = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState((s) => ({
          ...s,
          isLoading: false,
          error: 'Permissão de localização negada.',
        }));
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setState({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        error: null,
        isLoading: false,
      });

      return location.coords;
    } catch {
      setState((s) => ({
        ...s,
        isLoading: false,
        error: 'Não foi possível obter sua localização.',
      }));
      return null;
    }
  }, []);

  const checkGeofence = useCallback(
    (gymLat: number, gymLon: number) => {
      if (state.latitude === null || state.longitude === null) return false;
      return isWithinGeofence(state.latitude, state.longitude, gymLat, gymLon);
    },
    [state.latitude, state.longitude]
  );

  return { ...state, getCurrentLocation, checkGeofence };
}
