import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);

interface LoaderProps {
  text?: string;
  size?: 'small' | 'large';
}

export const Loader: React.FC<LoaderProps> = ({ 
  text = 'Loading...', 
  size = 'large' 
}) => {
  return (
    <StyledView className="items-center justify-center py-8">
      <ActivityIndicator 
        size={size} 
        color="#00B15C" 
      />
      {text && (
        <StyledText className="text-white/80 text-base mt-4 text-center">
          {text}
        </StyledText>
      )}
    </StyledView>
  );
};