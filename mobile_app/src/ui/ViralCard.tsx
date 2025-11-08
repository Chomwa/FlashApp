import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { styled } from 'nativewind';
import FastImage from 'react-native-fast-image';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTouchableOpacity = styled(TouchableOpacity);

interface ViralCardProps {
  id: string;
  emoji?: string;
  gifUrl?: string;
  title: string;
  color: string;
  isSelected: boolean;
  animated?: boolean;
  onPress: (id: string) => void;
  type?: 'emoji' | 'gif';
}

export const ViralCard: React.FC<ViralCardProps> = ({
  id,
  emoji,
  gifUrl,
  title,
  color,
  isSelected,
  animated = false,
  onPress,
  type = 'emoji'
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Different animations for different card types
  useEffect(() => {
    console.log(`ViralCard ${id}: animated=${animated}, starting animation`);
    if (!animated) {
      console.log(`ViralCard ${id}: animation disabled`);
      return;
    }

    const createAnimation = () => {
      // Pulse animation for most cards
      if (['fire', 'flash_gang', 'periodt', 'emergency'].includes(id)) {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
          ])
        );
      }

      // Money floating animation removed (now using GIF)

      // Bounce animation for dance/celebration
      if (['slay', 'weekend_vibes', 'birthday'].includes(id)) {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, {
              toValue: -8,
              duration: 600,
              useNativeDriver: true,
            }),
            Animated.timing(bounceAnim, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );
      }

      // Rotate animation for clock, spinning elements
      if (['clock_it', 'main_character', 'rocket'].includes(id)) {
        return Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          })
        );
      }

      // Shake animation for stress/ghost
      if (['exam_stress', 'ghosted'].includes(id)) {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, {
              toValue: 0.05,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: -0.05,
              duration: 100,
              useNativeDriver: true,
            }),
            Animated.timing(rotateAnim, {
              toValue: 0,
              duration: 100,
              useNativeDriver: true,
            }),
          ])
        );
      }

      // Default gentle pulse for custom cards and others
      console.log(`ViralCard ${id}: using default pulse animation`);
      return Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animation = createAnimation();
    animation.start();

    return () => animation.stop();
  }, [animated, id, scaleAnim, rotateAnim, bounceAnim, pulseAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  const getAnimationStyle = () => {
    if (['fire', 'flash_gang', 'periodt', 'emergency'].includes(id)) {
      return { transform: [{ scale: pulseAnim }] };
    }
    // ka_something animation removed (now using GIF)
    if (['slay', 'weekend_vibes', 'birthday'].includes(id)) {
      return { transform: [{ translateY: bounceAnim }] };
    }
    if (['clock_it', 'main_character', 'rocket'].includes(id)) {
      return { transform: [{ rotate: rotation }] };
    }
    if (['exam_stress', 'ghosted'].includes(id)) {
      return { transform: [{ rotate: rotation }] };
    }
    return { transform: [{ scale: scaleAnim }] };
  };

  return (
    <StyledTouchableOpacity
      className={`${
        type === 'gif' ? 'bg-transparent' : color
      } rounded-3xl ${
        type === 'gif' ? 'p-0 overflow-hidden' : 'p-6 items-center justify-center'
      } ${
        isSelected ? 'ring-2 ring-sky scale-105' : ''
      }`}
      style={{
        width: type === 'gif' ? 120 : undefined,
        height: type === 'gif' ? 140 : undefined,
        minWidth: type === 'gif' ? undefined : 120,
        minHeight: type === 'gif' ? undefined : 140,
        ...(type === 'gif' ? {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        } : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 12,
        })
      }}
      onPress={() => onPress(id)}
    >
      {type === 'gif' && gifUrl ? (
        // Professional GIF Card - Full visual impact
        <Animated.View 
          style={{
            ...(animated ? getAnimationStyle() : {}),
            position: 'relative',
            width: 120,
            height: 140,
            borderRadius: 24,
            overflow: 'hidden'
          }}
        >
          {/* Debug info */}
          {console.log(`Rendering GIF card: ${id} - Container: 120x140`)}
          <FastImage
            source={{
              uri: gifUrl,
              priority: FastImage.priority.high,
              cache: FastImage.cacheControl.immutable,
            }}
            style={{
              width: 120,
              height: 140,
              borderRadius: 24,
            }}
            resizeMode={FastImage.resizeMode.contain}
            onLoad={() => console.log(`GIF loaded: ${id} - ${title}`)}
            onError={(error) => console.log(`GIF error: ${id}`, error)}
          />
          {/* Subtle title overlay */}
          <StyledView 
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              paddingVertical: 8,
              paddingHorizontal: 12,
            }}
          >
            <StyledText className="text-white text-xs font-medium text-center">
              {title}
            </StyledText>
          </StyledView>
        </Animated.View>
      ) : (
        // Classic emoji card
        <>
          <Animated.View style={animated ? getAnimationStyle() : undefined}>
            <StyledText className="text-4xl mb-4">{emoji}</StyledText>
          </Animated.View>
          <StyledText className="text-white text-sm font-light text-center tracking-wide">
            {title}
          </StyledText>
        </>
      )}
      
      {/* Enhanced Selection Indicator with Animation */}
      {isSelected && (
        <Animated.View 
          className="absolute -top-3 -right-3 w-8 h-8 bg-sky rounded-full items-center justify-center border-2 border-navy"
          style={{
            transform: [{ scale: pulseAnim }]
          }}
        >
          <StyledText className="text-white text-sm font-bold">✓</StyledText>
        </Animated.View>
      )}

      {/* Glow effect for special cards */}
      {animated && ['clock_it', 'flash_gang', 'payday'].includes(id) && (
        <StyledView 
          className="absolute inset-0 rounded-3xl opacity-20"
          style={{
            backgroundColor: '#FFD700',
            shadowColor: '#FFD700',
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 20,
          }}
        />
      )}
    </StyledTouchableOpacity>
  );
};

// Gen Z Flash Cards with Moving Memes & Zambian Slang
export const VIRAL_CARDS = [
  // Flash GIF Collection - Professional Visual Impact
  { 
    id: 'money_rain_gif', 
    type: 'gif',
    gifUrl: 'https://media.giphy.com/media/51tWMdS3obRJexg8GV/giphy.gif',
    title: 'Ka Sunthn', 
    color: 'bg-emerald', 
    animated: false 
  },
  { 
    id: 'celebration_gif', 
    type: 'gif',
    gifUrl: 'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
    title: 'Victory', 
    color: 'bg-sky', 
    animated: false 
  },
  { 
    id: 'flash_speed_gif', 
    type: 'gif',
    gifUrl: 'https://media.giphy.com/media/3ov9jQX2Ow4bM5xxuM/giphy.gif',
    title: 'Instant', 
    color: 'bg-gold', 
    animated: false 
  },
  { 
    id: 'fire_gif', 
    type: 'gif',
    gifUrl: 'https://media.giphy.com/media/3o85xIO33l7RlmLR4I/giphy.gif',
    title: 'Fire', 
    color: 'bg-danger', 
    animated: false 
  },
  {
    id: 'thank_you_gif',
    type: 'gif',
    gifUrl: 'https://media.giphy.com/media/3oz8xAFtqoOUUrsh7W/giphy.gif',
    title: 'Thank You',
    color: 'bg-emerald',
    animated: false
  },
  {
    id: 'party_gif',
    type: 'gif', 
    gifUrl: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    title: 'Party Time',
    color: 'bg-sky',
    animated: false
  },
  {
    id: 'success_gif',
    type: 'gif',
    gifUrl: 'https://media.giphy.com/media/a0h7sAqON67nO/giphy.gif',
    title: 'Success',
    color: 'bg-gold',
    animated: false
  },
  {
    id: 'dance_gif',
    type: 'gif',
    gifUrl: 'https://media.giphy.com/media/l3q2XhfQ8oCkm1Ts4/giphy.gif',
    title: 'Slay',
    color: 'bg-danger',
    animated: false
  },
  {
    id: 'mind_blown_gif',
    type: 'gif',
    gifUrl: 'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif',
    title: 'Mind Blown',
    color: 'bg-charcoal',
    animated: false
  },

  // Classic/Essential
  { id: 'thanks', emoji: '🙏', title: 'Thanks', color: 'bg-emerald', animated: false },
  { id: 'fire', emoji: '🔥', title: 'Fire', color: 'bg-danger', animated: true },
  { id: 'rocket', emoji: '🚀', title: 'Sending It', color: 'bg-sky', animated: true },
  
  // Zambian Slang
  { id: 'clock_it', emoji: '⏰', title: 'Clock It', color: 'bg-gold', animated: true },
  { id: 'flash_gang', emoji: '⚡', title: 'Flash Gang', color: 'bg-sky', animated: true },
  { id: 'no_cap', emoji: '🧢', title: 'No Cap', color: 'bg-charcoal', animated: false },
  { id: 'its_giving', emoji: '💅', title: "It's Giving", color: 'bg-danger', animated: false },
  
  // Mobile Money Culture
  { id: 'data_hero', emoji: '📱', title: 'Data Hero', color: 'bg-sky', animated: true },
  { id: 'airtime_savior', emoji: '📶', title: 'Airtime Savior', color: 'bg-emerald', animated: true },
  { id: 'lunch_rescue', emoji: '🍽️', title: 'Lunch Rescue', color: 'bg-gold', animated: false },
  { id: 'transport_sorted', emoji: '🚗', title: 'Transport Sorted', color: 'bg-charcoal', animated: false },
  
  // Meme Energy
  { id: 'big_mood', emoji: '😤', title: 'Big Mood', color: 'bg-danger', animated: false },
  { id: 'periodt', emoji: '💯', title: 'Periodt', color: 'bg-emerald', animated: true },
  { id: 'slay', emoji: '💃', title: 'Slay', color: 'bg-sky', animated: true },
  { id: 'bestie', emoji: '👯', title: 'Bestie Energy', color: 'bg-gold', animated: false },
  
  // Celebration/Special
  { id: 'birthday', emoji: '🎂', title: 'Birthday Vibes', color: 'bg-emerald', animated: true },
  { id: 'payday', emoji: '💰', title: 'Payday Energy', color: 'bg-gold', animated: true },
  { id: 'emergency', emoji: '🆘', title: 'Emergency Flash', color: 'bg-danger', animated: true },
  { id: 'love_you', emoji: '❤️', title: 'Love You', color: 'bg-danger', animated: true },
  
  // University/Student Life
  { id: 'broke_student', emoji: '📚', title: 'Broke Student', color: 'bg-charcoal', animated: false },
  { id: 'exam_stress', emoji: '😵', title: 'Exam Stress', color: 'bg-danger', animated: true },
  { id: 'weekend_vibes', emoji: '🕺', title: 'Weekend Vibes', color: 'bg-sky', animated: true },
  
  // Funny/Relatable
  { id: 'ghosted', emoji: '👻', title: 'You Ghosted Me', color: 'bg-charcoal', animated: true },
  { id: 'main_character', emoji: '⭐', title: 'Main Character', color: 'bg-gold', animated: true },
  { id: 'understood_assignment', emoji: '✅', title: 'Understood Assignment', color: 'bg-emerald', animated: false },
];