import { Timestamp } from 'firebase/firestore';

export type SupportStatus = 'open' | 'closed';

export interface SupportRequest {
  id: string;
  studentId: string;
  coachId: string;
  message: string;
  status: SupportStatus;
  createdAt: Timestamp;
}
