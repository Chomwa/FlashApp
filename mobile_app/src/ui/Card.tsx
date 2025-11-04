import React from 'react';
import { View, ViewProps } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);

interface CardProps extends ViewProps {
  children?: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  padding = 'md',
  ...rest 
}) => {
  const paddingStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <StyledView 
      className={`bg-charcoal rounded-2xl ${paddingStyles[padding]}`} 
      {...rest}
    >
      {children}
    </StyledView>
  );
};