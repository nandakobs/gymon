import { hasCheckedInToday } from '@/services/firebase/checkins.service';
import { getDocs } from 'firebase/firestore';

jest.mock('@/services/firebase/config', () => ({ db: {} }));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDocs: jest.fn(),
  setDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  Timestamp: { now: jest.fn(() => ({ seconds: 0, nanoseconds: 0 })) },
}));

const mockGetDocs = getDocs as jest.Mock;

const TODAY = new Date('2026-03-04T12:00:00.000Z');

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(TODAY);
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

function makeSnap(docs: { timestamp: unknown }[]) {
  return {
    docs: docs.map((d) => ({ data: () => d })),
  };
}

describe('hasCheckedInToday', () => {
  it('returns false when there are no check-in documents', async () => {
    mockGetDocs.mockResolvedValue(makeSnap([]));
    await expect(hasCheckedInToday('student-1')).resolves.toBe(false);
  });

  it('returns true for a Firestore Timestamp from today (via .toDate())', async () => {
    const todayTs = {
      toDate: () => new Date('2026-03-04T08:00:00.000Z'),
    };
    mockGetDocs.mockResolvedValue(makeSnap([{ timestamp: todayTs }]));
    await expect(hasCheckedInToday('student-1')).resolves.toBe(true);
  });

  it('returns false for a Firestore Timestamp from yesterday (via .toDate())', async () => {
    const yesterdayTs = {
      toDate: () => new Date('2026-03-03T20:00:00.000Z'),
    };
    mockGetDocs.mockResolvedValue(makeSnap([{ timestamp: yesterdayTs }]));
    await expect(hasCheckedInToday('student-1')).resolves.toBe(false);
  });

  it('returns true for a plain JS Date from today (fallback path, no .toDate method)', async () => {
    const plainDate = new Date('2026-03-04T09:00:00.000Z');
    mockGetDocs.mockResolvedValue(makeSnap([{ timestamp: plainDate }]));
    await expect(hasCheckedInToday('student-1')).resolves.toBe(true);
  });

  it('returns false when multiple documents exist but all are from previous days', async () => {
    const oldTs1 = { toDate: () => new Date('2026-03-02T10:00:00.000Z') };
    const oldTs2 = { toDate: () => new Date('2026-03-01T10:00:00.000Z') };
    mockGetDocs.mockResolvedValue(makeSnap([{ timestamp: oldTs1 }, { timestamp: oldTs2 }]));
    await expect(hasCheckedInToday('student-1')).resolves.toBe(false);
  });
});
