import { Pressable } from 'react-native';
import { Text, View, styled } from 'tamagui';
import type { Habit, HabitCategory } from '../../types/habits';

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

interface HabitPillComponentProps {
  habit: Habit & { isSelected?: boolean };
  onToggleHabit: (habitId: string) => void;
}

export default function HabitPillComponent({
  habit,
  onToggleHabit,
}: HabitPillComponentProps) {
  const isSelected = !!habit.isSelected;
  const color = getDefaultColorForCategory(habit.category);

  return (
    <Pressable onPress={() => onToggleHabit(habit.id)}>
      <HabitPill
        style={{
          backgroundColor: isSelected ? `${color}20` : '#f1f1f1',
          borderWidth: 1,
          borderColor: isSelected ? `${color}40` : '#e0e0e0',
        }}
      >
        <HabitPillText
          style={{
            color: isSelected ? color : '#333', // ✅ category color if selected, default text if not
            opacity: isSelected ? 1 : 0.9,
          }}
        >
          {habit.name}
        </HabitPillText>
      </HabitPill>
    </Pressable>
  );
}

// Always return the category color (used when selected)
const getDefaultColorForCategory = (category: HabitCategory['id']): string => {
  switch (category) {
    case 'outer':
      return '#3b82f6'; // blue-500
    case 'middle':
      return '#f59e0b'; // yellow-500
    case 'inner':
      return '#ef4444'; // red-500
    default:
      return '#9E9E9E'; // neutral fallback
  }
};