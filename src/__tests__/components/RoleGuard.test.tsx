import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { RoleGuard } from '@/components/common/RoleGuard';
import { useAuth } from '@/providers/AuthProvider';

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

const mockUseAuth = useAuth as jest.Mock;

describe('RoleGuard', () => {
  it('role in allowed → renders children', () => {
    mockUseAuth.mockReturnValue({ role: 'student' });

    const { getByText } = render(
      <RoleGuard allowed={['student']}>
        <Text>Protected Content</Text>
      </RoleGuard>,
    );

    expect(getByText('Protected Content')).toBeTruthy();
  });

  it('role not in allowed → renders default fallback "Acesso não autorizado."', () => {
    mockUseAuth.mockReturnValue({ role: 'coach' });

    const { getByText } = render(
      <RoleGuard allowed={['student']}>
        <Text>Protected Content</Text>
      </RoleGuard>,
    );

    expect(getByText(/Acesso não autorizado/)).toBeTruthy();
  });

  it('custom fallback prop rendered when unauthorized', () => {
    mockUseAuth.mockReturnValue({ role: 'coach' });

    const { getByText } = render(
      <RoleGuard allowed={['student']} fallback={<Text>Custom Fallback</Text>}>
        <Text>Protected Content</Text>
      </RoleGuard>,
    );

    expect(getByText('Custom Fallback')).toBeTruthy();
  });

  it('role is null → renders fallback (unauthenticated)', () => {
    mockUseAuth.mockReturnValue({ role: null });

    const { getByText } = render(
      <RoleGuard allowed={['student']}>
        <Text>Protected Content</Text>
      </RoleGuard>,
    );

    expect(getByText(/Acesso não autorizado/)).toBeTruthy();
  });
});
