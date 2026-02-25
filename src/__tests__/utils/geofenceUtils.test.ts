import { haversineDistanceMeters, isWithinGeofence } from '@/utils/geofenceUtils';

// Refers to Av. Paulista 1578, São Paulo -- Museum de Arte
const GYM_LAT = -23.5618;
const GYM_LON = -46.6565;

const OFFSET_25M = 0.000225;
const OFFSET_51M = 0.000459;

describe('haversineDistanceMeters', () => {
  it('returns 0 for identical coordinates', () => {
    expect(haversineDistanceMeters(GYM_LAT, GYM_LON, GYM_LAT, GYM_LON)).toBe(0);
  });

  it('returns a distance < 50 for a point ~25 m away', () => {
    const dist = haversineDistanceMeters(GYM_LAT, GYM_LON, GYM_LAT + OFFSET_25M, GYM_LON);
    expect(dist).toBeGreaterThan(0);
    expect(dist).toBeLessThan(50);
  });

  it('returns a distance > 50 for a point ~51 m away', () => {
    const dist = haversineDistanceMeters(GYM_LAT, GYM_LON, GYM_LAT + OFFSET_51M, GYM_LON);
    expect(dist).toBeGreaterThan(50);
  });

  it('is symmetric (A→B equals B→A)', () => {
    const d1 = haversineDistanceMeters(GYM_LAT, GYM_LON, GYM_LAT + OFFSET_25M, GYM_LON);
    const d2 = haversineDistanceMeters(GYM_LAT + OFFSET_25M, GYM_LON, GYM_LAT, GYM_LON);
    expect(d1).toBeCloseTo(d2, 6);
  });
});

describe('isWithinGeofence', () => {
  it('returns true when user is inside the default 50 m radius', () => {
    expect(isWithinGeofence(GYM_LAT + OFFSET_25M, GYM_LON, GYM_LAT, GYM_LON)).toBe(true);
  });

  it('returns false when user is outside the default 50 m radius', () => {
    expect(isWithinGeofence(GYM_LAT + OFFSET_51M, GYM_LON, GYM_LAT, GYM_LON)).toBe(false);
  });

  it('returns true when user is at the exact boundary (distance ≤ radius)', () => {
    expect(isWithinGeofence(GYM_LAT, GYM_LON, GYM_LAT, GYM_LON)).toBe(true);
  });

  it('returns true for a custom 100 m radius when user is ~80 m away', () => {
    const OFFSET_80M = 0.00072;
    expect(isWithinGeofence(GYM_LAT + OFFSET_80M, GYM_LON, GYM_LAT, GYM_LON, 100)).toBe(true);
  });

  it('returns false for a custom 100 m radius when user is ~110 m away', () => {
    const OFFSET_110M = 0.00099;
    expect(isWithinGeofence(GYM_LAT + OFFSET_110M, GYM_LON, GYM_LAT, GYM_LON, 100)).toBe(false);
  });
});
