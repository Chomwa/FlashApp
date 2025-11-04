import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledTextInput = styled(TextInput);
const StyledText = styled(Text);

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  leftIcon, 
  rightIcon, 
  ...props 
}) => {
  return (
    <StyledView className="mb-4">
      {label && (
        <StyledText className="text-white text-sm font-medium mb-2">
          {label}
        </StyledText>
      )}
      <StyledView className={`bg-charcoal border rounded-2xl flex-row items-center px-4 py-3 ${
        error ? 'border-danger' : 'border-divider'
      }`}>
        {leftIcon && <StyledView className="mr-3">{leftIcon}</StyledView>}
        <StyledTextInput
          className="flex-1 text-white text-base"
          placeholderTextColor="#6F8A9A"
          {...props}
        />
        {rightIcon && <StyledView className="ml-3">{rightIcon}</StyledView>}
      </StyledView>
      {error && (
        <StyledText className="text-danger text-sm mt-1">
          {error}
        </StyledText>
      )}
    </StyledView>
  );
};