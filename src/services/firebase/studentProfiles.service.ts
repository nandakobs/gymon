import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config';
import type { StudentProfile } from '@/types';
import { FREEZES_PER_MONTH } from '@/utils/constants';

function defaultProfile(userId: string): StudentProfile {
  return {
    userId,
    streak: 0,
    streakConfig: {
      plannedDays: [],
      freezesRemaining: FREEZES_PER_MONTH,
      freezesResetAt: new Date().toISOString(),
    },
  };
}

export async function getStudentProfile(userId: string): Promise<StudentProfile> {
  const snap = await getDoc(doc(db, 'studentProfiles', userId));
  if (!snap.exists()) return defaultProfile(userId);
  return { userId, ...snap.data() } as StudentProfile;
}

export async function updateStudentProfile(
  userId: string,
  data: Partial<Omit<StudentProfile, 'userId'>>,
): Promise<void> {
  await setDoc(doc(db, 'studentProfiles', userId), data, { merge: true });
}
