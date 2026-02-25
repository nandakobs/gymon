import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './config';
import type { Gym } from '@/types';

export async function getGymById(gymId: string): Promise<Gym | null> {
  const snap = await getDoc(doc(db, 'gyms', gymId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Gym;
}

export async function getAllGyms(): Promise<Gym[]> {
  const snap = await getDocs(collection(db, 'gyms'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Gym));
}

export async function updateGym(gymId: string, data: Partial<Gym>) {
  await updateDoc(doc(db, 'gyms', gymId), data as Record<string, unknown>);
}
