import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { CheckIn } from '@/types';

export async function getCheckInsByStudent(studentId: string): Promise<CheckIn[]> {
  const q = query(
    collection(db, 'checkins'),
    where('studentId', '==', studentId),
    orderBy('timestamp', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as CheckIn));
}

export async function hasCheckedInToday(studentId: string): Promise<boolean> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const q = query(collection(db, 'checkins'), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  return snap.docs.some((d) => {
    const ts = d.data().timestamp;
    const date: Date = ts?.toDate ? ts.toDate() : new Date(ts);
    return date >= todayStart;
  });
}

export async function createCheckIn(studentId: string, gymId: string): Promise<string> {
  const ref = doc(collection(db, 'checkins'));
  await setDoc(ref, {
    studentId,
    gymId,
    timestamp: Timestamp.now(),
  });
  return ref.id;
}
