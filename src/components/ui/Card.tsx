import { View, ViewProps } from 'react-native';
import { ReactNode } from 'react';

interface CardProps extends ViewProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <View className={`bg-brand-surface rounded-2xl p-4 ${className}`} {...props}>
      {children}
    </View>
  );
}
