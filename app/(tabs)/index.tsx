import { useRef } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, H2, H4, Text, View, XStack, YStack, styled } from 'tamagui';

import { habitCategories } from '@/data/habits';
import { Habit, HabitCategory } from '@/types/habits';

// Styled component for habit pills
const HabitPill = styled(View, {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  marginRight: 8,
  marginBottom: 8,
  alignSelf: 'flex-start',
  maxWidth: '100%',
});

const HabitPillText = styled(Text, {
  fontWeight: '600',
  fontSize: 14,
  numberOfLines: 1,
  ellipsizeMode: 'tail',
});

const HabitPillComponent = ({ habit }: { habit: Habit }) => {
  return (
    <HabitPill 
      key={habit.id} 
      style={{
        backgroundColor: `${habit.color}20`,
        borderWidth: 1,
        borderColor: `${habit.color}40`,
      }}
    >
      <HabitPillText style={{ color: habit.color }}>
        {habit.name}
      </HabitPillText>
    </HabitPill>
  );
};

// Styled component for category cards
const CategoryCard = styled(Card, {
  marginBottom: 16,
  padding: 16,
  borderRadius: 8,
  backgroundColor: '$backgroundHover',
  borderWidth: 1,
  borderColor: '$borderColor',
});

const CategoryTitle = styled(H4, {
  color: '$color',
  fontWeight: '600',
  marginBottom: 4,
});

const CategoryDescription = styled(Text, {
  color: '$colorHover',
  fontSize: 14,
  opacity: 0.8,
});

const HabitPillsContainer = styled(XStack, {
  flexWrap: 'wrap',
  marginTop: 12,
  paddingBottom: 4,
});

const HabitCategoryCard = ({ category }: { category: HabitCategory }) => {
  return (
    <CategoryCard key={category.id}>
      <YStack space={8}>
        <CategoryTitle>{category.title}</CategoryTitle>
        
        <HabitPillsContainer>
          {category.habits.map(habit => (
            <HabitPillComponent key={habit.id} habit={habit} />
          ))}
        </HabitPillsContainer>
      </YStack>
    </CategoryCard>
  );
};

// Styled components for the main layout
const ScreenContainer = styled(SafeAreaView, {
  flex: 1,
  backgroundColor: '$background',
});

const ContentContainer = styled(YStack, {
  padding: 16,
  space: 16,
});

const HeaderContainer = styled(YStack, {
  space: 8,
  paddingBottom: 8,
});

const Title = styled(H2, {
  color: '$color',
  fontWeight: '700',
});

export default function HomeScreen() {
  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <ScreenContainer>
      <ScrollView 
        ref={scrollViewRef} 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ContentContainer>
          <HeaderContainer>
            <Title>Circles</Title>
          </HeaderContainer>
          
          <YStack space={16}>
            {habitCategories.map(category => (
              <HabitCategoryCard key={category.id} category={category} />
            ))}
          </YStack>
        </ContentContainer>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
