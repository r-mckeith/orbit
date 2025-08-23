import { useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';
import { Text, View, styled } from 'tamagui';
import { Habit, HabitCategory } from '../../types/habits';

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
  habit: Habit;
  onToggleHabit: (habitId: string) => void;
}

export default function HabitPillComponent({ 
  habit, 
  onToggleHabit
}: HabitPillComponentProps) {
  const [localIsSelected, setLocalIsSelected] = useState(habit.isSelected ?? false);
  
  // Update local state when the prop changes
  useEffect(() => {
    console.log('Habit prop changed', { habitId: habit.id, isSelected: habit.isSelected });
    setLocalIsSelected(prev => {
      // Only update if the value has actually changed
      if (habit.isSelected !== undefined && habit.isSelected !== prev) {
        console.log('Updating local isSelected state from prop', { prev, new: habit.isSelected });
        return habit.isSelected;
      }
      return prev;
    });
  }, [habit.isSelected]);
  
  // Use a ref to track the current value to avoid stale closures
  const isSelectedRef = useRef(localIsSelected);
  isSelectedRef.current = localIsSelected;
  
  const color = getDefaultColorForCategory(habit.category, localIsSelected);
  
  return (
    <Pressable onPress={() => onToggleHabit(habit.id)}>
      <HabitPill 
        key={habit.id}
        style={{
          backgroundColor: localIsSelected ? `${color}20` : '#f1f1f1',
          borderWidth: 1,
          borderColor: localIsSelected ? `${color}40` : '#e0e0e0',
        }}
      >
        <HabitPillText style={{ 
          color: localIsSelected ? color : '#333',
          opacity: localIsSelected ? 1 : 0.9
        }}>
          {habit.name}
        </HabitPillText>
      </HabitPill>
    </Pressable>
  );
};

// Helper function to get default colors for categories
const getDefaultColorForCategory = (category: HabitCategory['id'], isSelected: boolean = false): string => {
  // Return neutral color if not selected
  if (!isSelected) return '#BDBDBD';
  
  // Return category-specific color when selected
  switch (category) {
    case 'outer': return '#3b82f6';  // blue-500
    case 'middle': return '#f59e0b'; // yellow-500
    case 'inner': return '#ef4444';  // red-500
    default: return '#9E9E9E';
  }
};


