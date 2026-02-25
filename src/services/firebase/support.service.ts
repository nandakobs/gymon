import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';
import type { SupportRequest } from '@/types';

export async function getSupportRequestsByCoach(coachId: string): Promise<SupportRequest[]> {
  const q = query(
    collection(db, 'supportRequests'),
    where('coachId', '==', coachId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportRequest));
}

export async function createSupportRequest(
  studentId: string,
  coachId: string,
  message: string
): Promise<string> {
  const ref = doc(collection(db, 'supportRequests'));
  await setDoc(ref, {
    studentId,
    coachId,
    message,
    status: 'open',
    createdAt: Timestamp.now(),
  });
  return ref.id;
}

export async function closeSupportRequest(requestId: string) {
  await updateDoc(doc(db, 'supportRequests', requestId), { status: 'closed' });
}
