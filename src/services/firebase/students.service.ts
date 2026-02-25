import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import type { User } from '@/types';

export async function getStudentsByCoach(coachId: string): Promise<User[]> {
  const q = query(collection(db, 'users'), where('coachId', '==', coachId), where('role', '==', 'student'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
}

export async function getStudentsByGym(gymId: string): Promise<User[]> {
  const q = query(
    collection(db, 'users'),
    where('gymId', '==', gymId),
    where('role', '==', 'student'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as User));
}

export async function assignCoach(studentId: string, coachId: string) {
  await updateDoc(doc(db, 'users', studentId), { coachId });
}
