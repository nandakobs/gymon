export type UserRole = 'student' | 'coach' | 'manager' | 'admin';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  gymId: string;
  coachId?: string;
  photoURL?: string;
  createdAt: string;
  weight?: number;
  height?: number;
  goal?: string;
  medical_conditions?: string;
  memberSince?: string;
}
