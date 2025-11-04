import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { styled } from 'nativewind';
import { VIRAL_CARDS } from './ViralCard';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);
const StyledScrollView = styled(ScrollView);
const StyledPressable = styled(Pressable);

interface CardSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCard: string | null;
  onSelectCard: (cardId: string | null) => void;
}

interface CardProps {
  id: string;
  emoji: string;
  title: string;
  isSelected: boolean;
  onPress: (id: string) => void;
}

const Card: React.FC<CardProps> = ({ id, emoji, title, isSelected, onPress }) => {
  return (
    <StyledTouchableOpacity
      className={`bg-white/5 border border-white/10 rounded-2xl p-4 items-center h-[120px] justify-center w-full ${
        isSelected ? 'border-sky bg-sky/10' : ''
      }`}
      onPress={() => onPress(id)}
    >
      <StyledText className="text-3xl mb-2">{emoji}</StyledText>
      <StyledText className="text-white text-sm font-light text-center">
        {title}
      </StyledText>
      
      {isSelected && (
        <StyledView className="absolute -top-2 -right-2 w-6 h-6 bg-sky rounded-full items-center justify-center">
          <StyledText className="text-white text-xs font-bold">✓</StyledText>
        </StyledView>
      )}
    </StyledTouchableOpacity>
  );
};

export const CardSelectionModal: React.FC<CardSelectionModalProps> = ({
  visible,
  onClose,
  selectedCard,
  onSelectCard
}) => {
  const handleCardPress = (cardId: string) => {
    const newSelection = selectedCard === cardId ? null : cardId;
    onSelectCard(newSelection);
    onClose();
  };

  // Group cards by category
  const featuredCard = VIRAL_CARDS.find(card => card.id === 'business');
  const seasonalCards = VIRAL_CARDS.filter(card => ['halloween', 'birthday', 'celebration'].includes(card.id));
  const otherCards = VIRAL_CARDS.filter(card => !['business', 'halloween', 'birthday', 'celebration'].includes(card.id));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <StyledView className="flex-1 bg-black/50 justify-end">
        <StyledPressable 
          className="flex-1"
          onPress={onClose}
        />
        <StyledView 
          className="bg-navy rounded-t-3xl flex-1"
          style={{ minHeight: '80%', maxHeight: '90%' }}
        >
            {/* Header */}
            <StyledView className="flex-row items-center justify-between px-6 py-4 border-b border-white/10">
              <StyledTouchableOpacity onPress={onClose}>
                <StyledText className="text-white text-2xl font-light">✕</StyledText>
              </StyledTouchableOpacity>
              <StyledText className="text-white text-xl font-light">Choose a card</StyledText>
              <StyledView className="w-6" />
            </StyledView>

            <StyledScrollView 
              className="flex-1"
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
            >
                {/* Featured Card */}
                {featuredCard && (
                  <StyledView className="py-6">
                    <StyledView className="items-center mb-6">
                      <Card
                        id={featuredCard.id}
                        emoji={featuredCard.emoji}
                        title={featuredCard.title}
                        isSelected={selectedCard === featuredCard.id}
                        onPress={handleCardPress}
                      />
                    </StyledView>
                    <StyledText className="text-white text-xl font-light text-center mb-2">
                      Greeting Card of the Year
                    </StyledText>
                  </StyledView>
                )}

                {/* Seasonal Cards */}
                {seasonalCards.length > 0 && (
                  <StyledView className="py-4">
                    <StyledText className="text-white text-lg font-light mb-4">
                      In season
                    </StyledText>
                    <StyledScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 16 }}
                    >
                      {seasonalCards.map((card) => (
                        <Card
                          key={card.id}
                          id={card.id}
                          emoji={card.emoji}
                          title={card.title}
                          isSelected={selectedCard === card.id}
                          onPress={handleCardPress}
                        />
                      ))}
                    </StyledScrollView>
                  </StyledView>
                )}

                {/* Other Cards */}
                {otherCards.length > 0 && (
                  <StyledView className="py-4">
                    <StyledText className="text-white text-lg font-light mb-4">
                      All cards
                    </StyledText>
                    <StyledView className="flex-row flex-wrap justify-between">
                      {otherCards.map((card, index) => (
                        <StyledView key={card.id} className="w-[48%] mb-4">
                          <Card
                            id={card.id}
                            emoji={card.emoji}
                            title={card.title}
                            isSelected={selectedCard === card.id}
                            onPress={handleCardPress}
                          />
                        </StyledView>
                      ))}
                    </StyledView>
                  </StyledView>
                )}

                {/* Remove Card Option */}
                {selectedCard && (
                  <StyledView className="py-4 border-t border-white/10">
                    <StyledTouchableOpacity
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 items-center"
                      onPress={() => handleCardPress('')}
                    >
                      <StyledText className="text-white/60 font-light">Remove card</StyledText>
                    </StyledTouchableOpacity>
                  </StyledView>
                )}
            </StyledScrollView>
        </StyledView>
      </StyledView>
    </Modal>
  );
};