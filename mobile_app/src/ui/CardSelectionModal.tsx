import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Pressable } from 'react-native';
import { styled } from 'nativewind';
import { VIRAL_CARDS, ViralCard } from './ViralCard';

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

  // Group cards by category - Gen Z focused
  const featuredCard = VIRAL_CARDS.find(card => card.id === 'clock_it');
  const trendingCards = VIRAL_CARDS.filter(card => ['flash_gang', 'periodt', 'slay', 'main_character', 'no_cap'].includes(card.id));
  const moodCards = VIRAL_CARDS.filter(card => ['fire', 'big_mood', 'its_giving', 'bestie'].includes(card.id));
  const helpfulCards = VIRAL_CARDS.filter(card => ['data_hero', 'lunch_rescue', 'transport_sorted', 'emergency', 'ka_something'].includes(card.id));
  const otherCards = VIRAL_CARDS.filter(card => ![
    'clock_it', 'flash_gang', 'periodt', 'slay', 'main_character', 'no_cap',
    'fire', 'big_mood', 'its_giving', 'bestie',
    'data_hero', 'lunch_rescue', 'transport_sorted', 'emergency', 'ka_something'
  ].includes(card.id));

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
                      <ViralCard
                        id={featuredCard.id}
                        emoji={featuredCard.emoji}
                        title={featuredCard.title}
                        color={featuredCard.color}
                        animated={featuredCard.animated}
                        isSelected={selectedCard === featuredCard.id}
                        onPress={handleCardPress}
                      />
                    </StyledView>
                    <StyledText className="text-white text-xl font-light text-center mb-2">
                      🔥 Card of the Year 🔥
                    </StyledText>
                  </StyledView>
                )}

                {/* Trending Cards */}
                {trendingCards.length > 0 && (
                  <StyledView className="py-4">
                    <StyledText className="text-white text-lg font-light mb-4">
                      ✨ Trending Now
                    </StyledText>
                    <StyledScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 12 }}
                    >
                      {trendingCards.map((card) => (
                        <ViralCard
                          key={card.id}
                          id={card.id}
                          emoji={card.emoji}
                          title={card.title}
                          color={card.color}
                          animated={card.animated}
                          isSelected={selectedCard === card.id}
                          onPress={handleCardPress}
                        />
                      ))}
                    </StyledScrollView>
                  </StyledView>
                )}

                {/* Mood Cards */}
                {moodCards.length > 0 && (
                  <StyledView className="py-4">
                    <StyledText className="text-white text-lg font-light mb-4">
                      💯 Mood Energy
                    </StyledText>
                    <StyledScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: 12 }}
                    >
                      {moodCards.map((card) => (
                        <ViralCard
                          key={card.id}
                          id={card.id}
                          emoji={card.emoji}
                          title={card.title}
                          color={card.color}
                          animated={card.animated}
                          isSelected={selectedCard === card.id}
                          onPress={handleCardPress}
                        />
                      ))}
                    </StyledScrollView>
                  </StyledView>
                )}

                {/* Helpful Cards */}
                {helpfulCards.length > 0 && (
                  <StyledView className="py-4">
                    <StyledText className="text-white text-lg font-light mb-4">
                      🦸 Life Savers
                    </StyledText>
                    <StyledView className="flex-row flex-wrap justify-between">
                      {helpfulCards.map((card) => (
                        <StyledView key={card.id} className="w-[48%] mb-4">
                          <ViralCard
                            id={card.id}
                            emoji={card.emoji}
                            title={card.title}
                            color={card.color}
                            animated={card.animated}
                            isSelected={selectedCard === card.id}
                            onPress={handleCardPress}
                          />
                        </StyledView>
                      ))}
                    </StyledView>
                  </StyledView>
                )}

                {/* Other Cards */}
                {otherCards.length > 0 && (
                  <StyledView className="py-4">
                    <StyledText className="text-white text-lg font-light mb-4">
                      🎭 More Vibes
                    </StyledText>
                    <StyledView className="flex-row flex-wrap justify-between">
                      {otherCards.map((card) => (
                        <StyledView key={card.id} className="w-[48%] mb-4">
                          <ViralCard
                            id={card.id}
                            emoji={card.emoji}
                            title={card.title}
                            color={card.color}
                            animated={card.animated}
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