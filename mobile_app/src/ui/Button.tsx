import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { styled } from 'nativewind';

const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledText = styled(Text);

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  size = 'lg'
}) => {
  const baseStyles = 'w-full items-center justify-center rounded-2xl';
  
  const variantStyles = {
    primary: 'bg-emerald',
    secondary: 'bg-sky',
    ghost: 'bg-transparent border border-divider'
  };

  const sizeStyles = {
    sm: 'py-3 px-4 min-h-[44px]',
    md: 'py-4 px-6 min-h-[56px]', 
    lg: 'py-6 px-8 min-h-[72px]'
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const isDisabled = disabled || loading;
  const opacityStyle = isDisabled ? 'opacity-50' : '';

  return (
    <StyledTouchableOpacity
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${opacityStyle}`}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <StyledText className={`${textSizeStyles[size]} font-semibold text-white`}>
          {title}
        </StyledText>
      )}
    </StyledTouchableOpacity>
  );
};