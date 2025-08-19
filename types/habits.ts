export type Habit = {
  id: string;
  name: string;
  category: 'outer' | 'middle' | 'inner';
  color: string;
  isSelected?: boolean;
};

export type HabitCategory = {
  id: 'outer' | 'middle' | 'inner';
  title: string;
  habits: Habit[];
};
