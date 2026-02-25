import { ReactNode } from 'react';
import { View, Text } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import type { UserRole } from '@/types';

interface RoleGuardProps {
  allowed: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ allowed, children, fallback }: RoleGuardProps) {
  const { role } = useAuth();

  if (!role || !allowed.includes(role)) {
    return (
      fallback ?? (
        <View className="flex-1 items-center justify-center bg-brand-background">
          <Text className="text-brand-text-secondary">Acesso não autorizado.</Text>
        </View>
      )
    );
  }

  return <>{children}</>;
}
