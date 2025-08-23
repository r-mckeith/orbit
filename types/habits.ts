import { HabitData } from './types';

export type Habit = {
  id: string;
  name: string;
  category: 'outer' | 'middle' | 'inner';
  color: string;
  isSelected?: boolean;
  habit_data?: HabitData[];
  selected?: boolean; // For optimistic updates
};

export type HabitCategory = {
  id: 'outer' | 'middle' | 'inner';
  title: string;
  habits: Habit[];
};
