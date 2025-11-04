import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styled } from 'nativewind';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface ViralCardProps {
  id: string;
  emoji: string;
  title: string;
  color: string;
  isSelected: boolean;
  onPress: (id: string) => void;
}

export const ViralCard: React.FC<ViralCardProps> = ({
  id,
  emoji,
  title,
  color,
  isSelected,
  onPress
}) => {
  return (
    <StyledTouchableOpacity
      className={`${color} rounded-3xl p-6 items-center min-w-[120px] min-h-[140px] justify-center ${
        isSelected ? 'ring-2 ring-sky scale-105' : ''
      }`}
      onPress={() => onPress(id)}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 12,
      }}
    >
      <StyledText className="text-4xl mb-4">{emoji}</StyledText>
      <StyledText className="text-white text-sm font-light text-center tracking-wide">
        {title}
      </StyledText>
      
      {/* Professional Selection Indicator */}
      {isSelected && (
        <StyledView className="absolute -top-3 -right-3 w-8 h-8 bg-sky rounded-full items-center justify-center border-2 border-navy">
          <StyledText className="text-white text-sm font-bold">✓</StyledText>
        </StyledView>
      )}
    </StyledTouchableOpacity>
  );
};

// Professional viral cards for modern payments
export const VIRAL_CARDS = [
  { id: 'thanks', emoji: '🙏', title: 'Thanks', color: 'bg-emerald' },
  { id: 'business', emoji: '🐝', title: 'Bzz-ness', color: 'bg-gold' },
  { id: 'celebration', emoji: '🎉', title: 'Celebration', color: 'bg-sky' },
  { id: 'halloween', emoji: '🎃', title: 'Halloween', color: 'bg-danger' },
  { id: 'birthday', emoji: '🎂', title: 'Birthday', color: 'bg-emerald' },
  { id: 'coffee', emoji: '☕', title: 'Coffee', color: 'bg-gold' },
  { id: 'love', emoji: '❤️', title: 'Love', color: 'bg-danger' },
  { id: 'fire', emoji: '🔥', title: 'Fire', color: 'bg-danger' },
  { id: 'rocket', emoji: '🚀', title: 'Launch', color: 'bg-sky' },
  { id: 'cool', emoji: '😎', title: 'Cool', color: 'bg-charcoal' },
  { id: 'party', emoji: '🎊', title: 'Party', color: 'bg-sky' },
  { id: 'gift', emoji: '🎁', title: 'Gift', color: 'bg-emerald' },
];