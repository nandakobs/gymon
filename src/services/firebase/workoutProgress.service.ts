import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from './config';

// exerciseId -> array of booleans, one per set (true = set done)
export type SetChecklist = Record<string, boolean[]>;

// Immutable snapshot of exercise details captured at the moment sets are checked
export type ExerciseSnapshot = {
  name: string;
  reps: number | string;
  weightKg?: number;
};
export type ExerciseSnapshots = Record<string, ExerciseSnapshot>;

function todayDocId(workoutId: string, studentId: string): string {
  const date = new Date().toISOString().split('T')[0]; // "2026-02-23"
  return `${workoutId}_${studentId}_${date}`;
}

export async function getProgressForToday(
  studentId: string,
  workoutId: string,
): Promise<SetChecklist> {
  const snap = await getDoc(doc(db, 'workoutProgress', todayDocId(workoutId, studentId)));
  return (snap.data()?.completedSets as SetChecklist) ?? {};
}

export type WorkoutProgressRecord = {
  id: string;
  workoutId: string;
  studentId: string;
  date: string; // "YYYY-MM-DD"
  completedSets: SetChecklist;
  exerciseSnapshots?: ExerciseSnapshots; // static copy of exercise details at time of check
  savedAt: string;
  studentNote?: string; // student's free-text note for the session
};

export async function getAllProgressForStudent(
  studentId: string,
): Promise<WorkoutProgressRecord[]> {
  const q = query(collection(db, 'workoutProgress'), where('studentId', '==', studentId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutProgressRecord));
}

export function subscribeToProgressForToday(
  studentId: string,
  workoutId: string,
  onUpdate: (checklist: SetChecklist) => void,
): () => void {
  const docRef = doc(db, 'workoutProgress', todayDocId(workoutId, studentId));
  return onSnapshot(docRef, (snap) => {
    onUpdate((snap.data()?.completedSets as SetChecklist) ?? {});
  });
}

export async function getFullProgressForToday(
  studentId: string,
  workoutId: string,
): Promise<{ completedSets: SetChecklist; studentNote: string; exerciseSnapshots: ExerciseSnapshots }> {
  const snap = await getDoc(doc(db, 'workoutProgress', todayDocId(workoutId, studentId)));
  const data = snap.data();
  return {
    completedSets: (data?.completedSets as SetChecklist) ?? {},
    studentNote: (data?.studentNote as string) ?? '',
    exerciseSnapshots: (data?.exerciseSnapshots as ExerciseSnapshots) ?? {},
  };
}

export async function saveStudentNote(
  studentId: string,
  workoutId: string,
  note: string,
): Promise<void> {
  await setDoc(
    doc(db, 'workoutProgress', todayDocId(workoutId, studentId)),
    { studentNote: note },
    { merge: true },
  );
}

export async function saveProgressForToday(
  studentId: string,
  workoutId: string,
  completedSets: SetChecklist,
  exerciseSnapshots: ExerciseSnapshots,
): Promise<void> {
  const date = new Date().toISOString().split('T')[0];
  await setDoc(doc(db, 'workoutProgress', todayDocId(workoutId, studentId)), {
    workoutId,
    studentId,
    date,
    completedSets,
    exerciseSnapshots,
    savedAt: new Date().toISOString(),
  });
}
