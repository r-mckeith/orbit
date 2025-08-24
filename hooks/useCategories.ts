import { useCallback, useState } from 'react';
import { HabitCategory } from '../types/habits';

export function useCategories(initialCategories: HabitCategory[] = []) {
  const [categories, setCategories] = useState<HabitCategory[]>(initialCategories);

  const updateHabitSelection = useCallback((habitId: string, isSelected: boolean) => {
    setCategories(prevCategories => 
      prevCategories.map(category => ({
        ...category,
        habits: category.habits.map(habit => 
          habit.id === habitId ? { ...habit, isSelected } : habit
        )
      }))
    );
  }, []);

  return {
    categories,
    setCategories,
    updateHabitSelection
  };
}
