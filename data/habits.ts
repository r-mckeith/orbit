import { HabitCategory } from '@/types/habits';

export const habitCategories: HabitCategory[] = [
  {
    id: 'outer',
    title: 'Outer Circle',
    habits: [
      { id: '1', name: 'Exercise', category: 'outer', frequency: 'Daily', color: '#4CAF50' },
      { id: '2', name: 'Meditate', category: 'outer', frequency: 'Daily', color: '#2196F3' },
      { id: '3', name: 'Read', category: 'outer', frequency: 'Daily', color: '#9C27B0' },
      { id: '4', name: 'Gratitude Journal', category: 'outer', frequency: 'Daily', color: '#FF9800' },
      { id: '5', name: 'Drink Water', category: 'outer', frequency: 'Throughout day', color: '#00BCD4' },
    ],
  },
  {
    id: 'middle',
    title: 'Middle Circle',
    habits: [
      { id: '6', name: 'Check Email', category: 'middle', frequency: '3x/day', color: '#607D8B' },
      { id: '7', name: 'Social Media', category: 'middle', frequency: '30 min', color: '#9E9E9E' },
      { id: '8', name: 'TV Time', category: 'middle', frequency: '1 hour', color: '#795548' },
      { id: '9', name: 'Snacking', category: 'middle', frequency: '2x/day', color: '#FFC107' },
    ],
  },
  {
    id: 'inner',
    title: 'Inner Circle',
    habits: [
      { id: '10', name: 'Late Night Snacking', category: 'inner', frequency: 'Avoid', color: '#F44336' },
      { id: '11', name: 'Procrastination', category: 'inner', frequency: 'Minimize', color: '#E91E63' },
      { id: '12', name: 'Skipping Meals', category: 'inner', frequency: 'Avoid', color: '#9C27B0' },
      { id: '13', name: 'Excessive Screen Time', category: 'inner', frequency: 'Limit', color: '#3F51B5' },
    ],
  },
];
