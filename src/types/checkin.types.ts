import { Timestamp } from 'firebase/firestore';

export interface CheckIn {
  id: string;
  studentId: string;
  gymId: string;
  timestamp: Timestamp;
}
