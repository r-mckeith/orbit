import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { Habit, HabitCategory } from '../types/habits';

export const HABITS_QUERY_KEY = 'habits';

export const useHabits = () => {
  return useQuery({
    queryKey: [HABITS_QUERY_KEY],
    queryFn: async () => {
      // Get today's date in the local timezone
      const today = new Date().toISOString().split('T')[0];
      
      // Get all habits - RLS will filter by user
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true });

      if (habitsError) throw habitsError;
      
      // Get today's habit_data - RLS will filter by user
      const { data: habitData, error: dataError } = await supabase
        .from('habit_data')
        .select('habit_id')
        .eq('date', today);

      if (dataError) throw dataError;
      
      // Create a Set of habit IDs that are selected today for quick lookup
      const selectedHabitIds = new Set(habitData?.map(hd => hd.habit_id) || []);
      
      // Add isSelected property to each habit
      return habits.map(habit => ({
        ...habit,
        isSelected: selectedHabitIds.has(habit.id)
      })) as Habit[];
    }
  });
};

export const useAddHabit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newHabit: Omit<Habit, 'id' | 'created_at' | 'user_id'>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('habits')
        .insert([{ ...newHabit, user_id: session.user.id }])
        .select()
        .single();

      if (error) throw error;
      return data as Habit;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: [HABITS_QUERY_KEY] });
    },
  });
};

export const useHabitCategories = (habits: Habit[] = []) => {
  return useQuery<HabitCategory[]>({
    queryKey: ['habitCategories', habits.length],
    queryFn: async () => {
      // This could be replaced with a proper API call if categories are stored in the database
      const categories: Record<string, Omit<HabitCategory, 'habits'>> = {
        'outer': { id: 'outer', title: 'Outer Circle' },
        'middle': { id: 'middle', title: 'Middle Circle' },
        'inner': { id: 'inner', title: 'Inner Circle' },
      };

      // Group habits by category
      const habitsByCategory = habits.reduce<Record<string, Habit[]>>((acc, habit) => {
        if (!acc[habit.category]) {
          acc[habit.category] = [];
        }
        acc[habit.category].push(habit);
        return acc;
      }, {});

      // Merge categories with their habits
      return Object.values(categories).map(category => ({
        ...category,
        habits: habitsByCategory[category.id] || []
      }));
    },
    enabled: habits.length > 0,
  });
};
