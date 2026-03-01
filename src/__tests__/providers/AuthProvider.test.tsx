import React from 'react';
import { Text } from 'react-native';
import { render, renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { getDoc } from 'firebase/firestore';

jest.mock('@/services/firebase/config', () => ({
  auth: {},
  db: {},
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
}));

const mockOnAuthStateChanged = onAuthStateChanged as jest.Mock;
const mockSignInWithEmailAndPassword = signInWithEmailAndPassword as jest.Mock;
const mockFirebaseSignOut = firebaseSignOut as jest.Mock;
const mockGetDoc = getDoc as jest.Mock;

function Consumer() {
  const { user, role, gymId, isLoading } = useAuth();
  return (
    <>
      <Text testID="isLoading">{isLoading ? 'loading' : 'ready'}</Text>
      <Text testID="user">{user ? (user as any).uid : 'null'}</Text>
      <Text testID="role">{role ?? 'null'}</Text>
      <Text testID="gymId">{gymId ?? 'null'}</Text>
    </>
  );
}

function ConsumerWithoutProvider() {
  useAuth();
  return null;
}

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockReturnValue(() => {});
  });

  it('isLoading is true on mount before onAuthStateChanged fires', () => {
    mockOnAuthStateChanged.mockImplementation(() => () => {});

    const { getByTestId } = render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(getByTestId('isLoading').props.children).toBe('loading');
  });

  it('isLoading becomes false after onAuthStateChanged fires', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
      callback(null);
      return () => {};
    });

    const { getByTestId } = render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('isLoading').props.children).toBe('ready');
    });
  });

  it('when Firebase user is null → user, role, gymId all null', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
      callback(null);
      return () => {};
    });

    const { getByTestId } = render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('user').props.children).toBe('null');
      expect(getByTestId('role').props.children).toBe('null');
      expect(getByTestId('gymId').props.children).toBe('null');
    });
  });

  it('when Firebase user exists → fetches Firestore doc → sets role and gymId', async () => {
    const mockUser = { uid: 'user-123' };
    mockGetDoc.mockResolvedValue({
      data: () => ({ role: 'student', gymId: 'gym-456' }),
    });
    mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
      callback(mockUser);
      return () => {};
    });

    const { getByTestId } = render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('role').props.children).toBe('student');
      expect(getByTestId('gymId').props.children).toBe('gym-456');
    });
    expect(mockGetDoc).toHaveBeenCalled();
  });

  it('signIn calls signInWithEmailAndPassword with correct args', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
      callback(null);
      return () => {};
    });
    mockSignInWithEmailAndPassword.mockResolvedValue({});

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.signIn('test@example.com', 'password123');
    });

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      {},
      'test@example.com',
      'password123',
    );
  });

  it('signOut calls Firebase signOut', async () => {
    mockOnAuthStateChanged.mockImplementation((_auth: any, callback: any) => {
      callback(null);
      return () => {};
    });
    mockFirebaseSignOut.mockResolvedValue({});

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockFirebaseSignOut).toHaveBeenCalledWith({});
  });

  it('useAuth() outside AuthProvider throws', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<ConsumerWithoutProvider />)).toThrow(
      'useAuth must be used within AuthProvider',
    );
    consoleSpy.mockRestore();
  });
});
