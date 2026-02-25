export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number | string;
  weightKg?: number;
  restSeconds?: number;
  notes?: string;
  videoUrl?: string;
}

export interface Workout {
  id: string;
  studentId: string;
  coachId: string;
  gymId: string;
  name: string;
  description?: string;
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}
