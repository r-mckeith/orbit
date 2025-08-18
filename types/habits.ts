export type Habit = {
  id: string;
  name: string;
  category: 'outer' | 'middle' | 'inner';
  frequency?: string;
  color: string;
};

export type HabitCategory = {
  id: 'outer' | 'middle' | 'inner';
  title: string;
  habits: Habit[];
};
