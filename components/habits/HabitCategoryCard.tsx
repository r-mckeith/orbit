// components/habits/HabitCategoryCard.tsx
import { XStack, styled } from 'tamagui';
import type { HabitCategory } from '../../types/habits';
import { Collapsible } from '../Collapsible';
import HabitPill from './HabitPill';

const CategoryCard = styled(Collapsible, {
  name: 'CategoryCard',
  marginBottom: 16,
  padding: 16,
  borderRadius: 8,
  backgroundColor: '$backgroundHover',
  borderWidth: 1,
  borderColor: '$borderColor',
});

const HabitPillsContainer = styled(XStack, {
  flexWrap: 'wrap',
  marginTop: 12,
  paddingBottom: 4,
  gap: 8,
});

interface HabitCategoryCardProps {
  category: HabitCategory;
  onToggleHabit: (habitId: string) => void;
}

export default function HabitCategoryCard({
  category,
  onToggleHabit,
}: HabitCategoryCardProps) {
  return (
    <CategoryCard key={category.id} title={category.title}>
      <HabitPillsContainer>
        {category.habits.map((habit) => (
          <HabitPill key={habit.id} habit={habit} onToggleHabit={onToggleHabit} />
        ))}
      </HabitPillsContainer>
    </CategoryCard>
  );
}