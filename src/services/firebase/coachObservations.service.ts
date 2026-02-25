import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from './config';

export interface CoachObservation {
  id: string;
  studentId: string;
  coachId: string;
  coachName: string;
  content: string;
  createdAt: string;
}

export async function addCoachObservation(
  data: Omit<CoachObservation, 'id'>,
): Promise<void> {
  await addDoc(collection(db, 'coachObservations'), data);
}

export async function getCoachObservations(
  studentId: string,
): Promise<CoachObservation[]> {
  const q = query(
    collection(db, 'coachObservations'),
    where('studentId', '==', studentId),
  );
  const snap = await getDocs(q);
  const results = snap.docs.map((d) => ({ id: d.id, ...d.data() } as CoachObservation));
  return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
