import { View, Text } from 'react-native';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger';
}

const variantClasses: Record<string, string> = {
  primary: 'bg-brand-primary',
  success: 'bg-brand-success',
  warning: 'bg-brand-warning',
  danger: 'bg-brand-danger',
};

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  return (
    <View className={`px-2 py-0.5 rounded-full ${variantClasses[variant]}`}>
      <Text className="text-white text-xs font-semibold">{label}</Text>
    </View>
  );
}
