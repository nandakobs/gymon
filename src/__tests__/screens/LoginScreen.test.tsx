import React from 'react';
import { Modal, TouchableOpacity } from 'react-native';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import LoginScreen from '@app/(auth)/login';
import { useAuth } from '@/providers/AuthProvider';

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

jest.mock('lucide-react-native', () => ({
  Eye: () => null,
  EyeOff: () => null,
}));

const mockUseAuth = useAuth as jest.Mock;

describe('LoginScreen', () => {
  const mockSignIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ signIn: mockSignIn });
  });

  it('email and password inputs are rendered', () => {
    const { getByPlaceholderText } = render(<LoginScreen />);

    expect(getByPlaceholderText('E-mail')).toBeTruthy();
    expect(getByPlaceholderText('Senha')).toBeTruthy();
  });

  it('"Entrar" button calls signIn with email and password', async () => {
    mockSignIn.mockResolvedValue(undefined);

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);

    fireEvent.changeText(getByPlaceholderText('E-mail'), 'user@test.com');
    fireEvent.changeText(getByPlaceholderText('Senha'), 'secret123');

    await act(async () => {
      fireEvent.press(getByText('Entrar'));
    });

    expect(mockSignIn).toHaveBeenCalledWith('user@test.com', 'secret123');
  });

  it('error message appears on rejected signIn', async () => {
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'));

    const { getByText, findByText } = render(<LoginScreen />);

    await act(async () => {
      fireEvent.press(getByText('Entrar'));
    });

    await findByText(/inválidos/);
  });

  it('button text shows "Entrando..." while loading', async () => {
    let resolveSignIn!: () => void;
    mockSignIn.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSignIn = resolve;
      }),
    );

    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText('Entrar'));

    await waitFor(() => {
      expect(getByText('Entrando...')).toBeTruthy();
    });

    await act(async () => {
      resolveSignIn();
    });
  });

  it('password visibility toggle changes secureTextEntry', () => {
    const { getByPlaceholderText, UNSAFE_getAllByType } = render(<LoginScreen />);

    const passwordInput = getByPlaceholderText('Senha');
    expect(passwordInput.props.secureTextEntry).toBe(true);

    const [eyeToggle] = UNSAFE_getAllByType(TouchableOpacity);
    fireEvent.press(eyeToggle);

    expect(getByPlaceholderText('Senha').props.secureTextEntry).toBe(false);
  });

  it('"Esqueceu a senha?" modal opens on link press, closes on "Entendi"', () => {
    const { getByText, UNSAFE_getByType } = render(<LoginScreen />);

    expect(UNSAFE_getByType(Modal).props.visible).toBe(false);

    fireEvent.press(getByText('Esqueceu a senha?'));
    expect(UNSAFE_getByType(Modal).props.visible).toBe(true);

    fireEvent.press(getByText('Entendi'));
    expect(UNSAFE_getByType(Modal).props.visible).toBe(false);
  });
});
