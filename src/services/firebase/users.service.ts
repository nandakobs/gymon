import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './config';
import type { User } from '@/types';

export async function getUserById(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as User;
}

export async function createUser(uid: string, data: Omit<User, 'id'>) {
  await setDoc(doc(db, 'users', uid), data);
}

export async function updateUser(uid: string, data: Partial<User>) {
  await updateDoc(doc(db, 'users', uid), data as Record<string, unknown>);
}

export async function deleteUser(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid));
}

export async function getUsersByGym(gymId: string): Promise<User[]> {
  const q = query(collection(db, 'users'), where('gymId', '==', gymId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
}

export async function getUsersByGymAndRole(gymId: string, role: string): Promise<User[]> {
  const q = query(
    collection(db, 'users'),
    where('gymId', '==', gymId),
    where('role', '==', role)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
}
