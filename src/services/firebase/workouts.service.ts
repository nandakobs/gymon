import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from './config';
import type { Workout } from '@/types';

export async function getWorkoutsByStudent(studentId: string): Promise<Workout[]> {
  const q = query(collection(db, 'workouts'), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Workout));
}

// Used by coaches: includes gymId in the query so Firestore security rules can be verified.
export async function getWorkoutsByStudentForCoach(
  studentId: string,
  gymId: string,
): Promise<Workout[]> {
  const q = query(
    collection(db, 'workouts'),
    where('studentId', '==', studentId),
    where('gymId', '==', gymId),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Workout));
}

export async function getWorkoutById(workoutId: string): Promise<Workout | null> {
  const snap = await getDoc(doc(db, 'workouts', workoutId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Workout;
}

export async function createWorkout(workout: Omit<Workout, 'id'>): Promise<string> {
  const ref = doc(collection(db, 'workouts'));
  await setDoc(ref, workout);
  return ref.id;
}

export async function updateWorkout(workoutId: string, data: Partial<Workout>) {
  await updateDoc(doc(db, 'workouts', workoutId), data as Record<string, unknown>);
}

export async function deleteWorkout(workoutId: string) {
  await deleteDoc(doc(db, 'workouts', workoutId));
}
