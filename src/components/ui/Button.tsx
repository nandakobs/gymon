import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-brand-primary',
  secondary: 'bg-brand-surface',
  danger: 'bg-brand-danger',
};

const textClasses: Record<string, string> = {
  primary: 'text-white',
  secondary: 'text-brand-text-primary',
  danger: 'text-white',
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
}: ButtonProps) {
  return (
    <TouchableOpacity
      className={`rounded-xl py-4 items-center ${variantClasses[variant]} ${disabled || isLoading ? 'opacity-50' : ''}`}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text className={`font-semibold text-base ${textClasses[variant]}`}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}
