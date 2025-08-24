import { Card, H4, XStack, YStack, styled } from 'tamagui';
import { HabitCategory } from '../../types/habits';
import HabitPill from './HabitPill';


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

const HabitPillsContainer = styled(XStack, {
  flexWrap: 'wrap',
  marginTop: 12,
  paddingBottom: 4,
});

interface HabitCategoryCardProps {
  category: HabitCategory;
  onToggleHabit: (habitId: string) => void;
}

export default function HabitCategoryCard({ 
  category, 
  onToggleHabit 
}: HabitCategoryCardProps) {
  return (
    <CategoryCard key={category.id}>
      <YStack gap={8}>
        <CategoryTitle>{category.title}</CategoryTitle>
        <HabitPillsContainer>
          {category.habits.map(habit => (
            <HabitPill
              key={habit.id} 
              habit={habit} 
              onToggleHabit={onToggleHabit}
            />
          ))}
        </HabitPillsContainer>
      </YStack>
    </CategoryCard>
  );
};