import { GEOFENCE_RADIUS_METERS } from './constants';

/**
 * Haversine formula — returns distance in metres between two GPS coordinates.
 */
export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6_371_000; // Earth radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function isWithinGeofence(
  userLat: number,
  userLon: number,
  gymLat: number,
  gymLon: number,
  radiusMeters: number = GEOFENCE_RADIUS_METERS
): boolean {
  return haversineDistanceMeters(userLat, userLon, gymLat, gymLon) <= radiusMeters;
}
