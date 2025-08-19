import { useState, useCallback } from 'react';
import { HabitCategory, Habit } from '../types/habits';

type SetCategoriesAction = (prevCategories: HabitCategory[]) => HabitCategory[];

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
