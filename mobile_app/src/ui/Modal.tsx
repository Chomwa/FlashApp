import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';
import { Button } from './Button';

const StyledModal = styled(RNModal);
const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface ModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  primaryAction?: {
    title: string;
    onPress: () => void;
  };
  secondaryAction?: {
    title: string;
    onPress: () => void;
  };
}

export const Modal: React.FC<ModalProps> = ({ 
  visible, 
  title, 
  message, 
  onClose,
  primaryAction,
  secondaryAction
}) => {
  return (
    <StyledModal 
      visible={visible} 
      transparent 
      animationType="fade"
      onRequestClose={onClose}
    >
      <StyledView className="flex-1 bg-black/60 items-center justify-center px-6">
        <StyledView className="bg-charcoal rounded-2xl p-6 w-full max-w-sm">
          <StyledText className="text-white text-xl font-semibold mb-2">
            {title}
          </StyledText>
          <StyledText className="text-white/80 text-base mb-6">
            {message}
          </StyledText>
          
          <StyledView className="space-y-3">
            {primaryAction && (
              <Button 
                title={primaryAction.title}
                onPress={primaryAction.onPress}
                variant="primary"
              />
            )}
            {secondaryAction && (
              <Button 
                title={secondaryAction.title}
                onPress={secondaryAction.onPress}
                variant="ghost"
              />
            )}
            {!primaryAction && !secondaryAction && (
              <Button 
                title="Close"
                onPress={onClose}
                variant="primary"
              />
            )}
          </StyledView>
        </StyledView>
      </StyledView>
    </StyledModal>
  );
};