import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useSegments } from 'expo-router';
import { RootLayoutNav } from '@app/_layout';

const mockReplace = jest.fn();

jest.mock('@/providers/AuthProvider', () => ({
  AuthProvider: ({ children }: any) => children,
  useAuth: jest.fn(),
}));

jest.mock('expo-router', () => {
  function MockStack({ children }: any) {
    return children ?? null;
  }
  MockStack.Screen = () => null;
  return {
    useRouter: () => ({ replace: mockReplace }),
    useSegments: jest.fn(),
    Stack: MockStack,
  };
});

jest.mock('@/providers/QueryProvider', () => ({
  QueryProvider: ({ children }: any) => children,
}));

jest.mock('@/components/common/LoadingScreen', () => ({
  LoadingScreen: () => null,
}));

jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }: any) => children,
}));

const mockUseAuth = useAuth as jest.Mock;
const mockUseSegments = useSegments as jest.Mock;

describe('RootLayoutNav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('isLoading=true → renders LoadingScreen, no redirect', () => {
    mockUseAuth.mockReturnValue({ user: null, role: null, isLoading: true });
    mockUseSegments.mockReturnValue([]);

    render(<RootLayoutNav />);

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('unauthenticated outside auth group → redirects to login', async () => {
    mockUseAuth.mockReturnValue({ user: null, role: null, isLoading: false });
    mockUseSegments.mockReturnValue(['(student)']);

    render(<RootLayoutNav />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
    });
  });

  it('authenticated in auth group with role=student → redirects to /(student)', async () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' }, role: 'student', isLoading: false });
    mockUseSegments.mockReturnValue(['(auth)']);

    render(<RootLayoutNav />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(student)');
    });
  });

  it('authenticated in auth group with role=coach → redirects to /(coach)', async () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' }, role: 'coach', isLoading: false });
    mockUseSegments.mockReturnValue(['(auth)']);

    render(<RootLayoutNav />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(coach)');
    });
  });

  it('authenticated in auth group with role=manager → redirects to /(manager)', async () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' }, role: 'manager', isLoading: false });
    mockUseSegments.mockReturnValue(['(auth)']);

    render(<RootLayoutNav />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(manager)');
    });
  });

  it('authenticated in auth group with role=admin → redirects to /(admin)', async () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' }, role: 'admin', isLoading: false });
    mockUseSegments.mockReturnValue(['(auth)']);

    render(<RootLayoutNav />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(admin)');
    });
  });

  it('authenticated in auth group with role=null → redirects to login (default case)', async () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' }, role: null, isLoading: false });
    mockUseSegments.mockReturnValue(['(auth)']);

    render(<RootLayoutNav />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
    });
  });

  it('authenticated in correct group → no redirect', async () => {
    mockUseAuth.mockReturnValue({ user: { uid: 'u1' }, role: 'student', isLoading: false });
    mockUseSegments.mockReturnValue(['(student)']);

    render(<RootLayoutNav />);

    await waitFor(() => expect(mockReplace).not.toHaveBeenCalled());
  });
});
