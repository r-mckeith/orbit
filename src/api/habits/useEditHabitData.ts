import { HabitData, HabitWithData } from '@src/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addDays, endOfDay, endOfMonth, endOfWeek, formatISO, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import { supabase } from '../useClient';

export type EditHabitDataInput = {
  habit: HabitWithData;
  selectedDate: Date;
  difference: number;
};

type MutationContext = {
  previousWeeklyData: HabitWithData[] | undefined;
  previousMonthlyData: HabitWithData[] | undefined;
};

export function useEditHabitData() {
  const queryClient = useQueryClient();

  return useMutation<HabitData, Error, EditHabitDataInput, MutationContext>({
    mutationFn: async ({ habit, selectedDate, difference }) => {
      const formattedDate = formatISO(startOfDay(selectedDate), { representation: 'complete' });

      // Find existing habit data for the selected date
      const { data: existingData, error: fetchError } = await supabase
        .from('habit_data')
        .select('*')
        .eq('habit_id', habit.id)
        .gte('created', startOfDay(formattedDate).toISOString())
        .lte('created', endOfDay(formattedDate).toISOString());

      if (fetchError) throw new Error('Failed to fetch habit data');

      if (existingData && existingData.length > 0) {
        // Update existing habit data
        const { data: updatedData, error: updateError } = await supabase
          .from('habit_data')
          .update({ count: Math.max(0, (existingData[0].count || 0) + difference) })
          .eq('id', existingData[0].id)
          .select()
          .single();

        if (updateError) throw new Error('Failed to update habit data');
        return updatedData;
      } else {
        // Create new habit data
        const { data: newData, error: insertError } = await supabase
          .from('habit_data')
          .insert([
            {
              habit_id: habit.id,
              count: Math.max(0, difference),
              created: formattedDate,
            },
          ])
          .select()
          .single();

        if (insertError) throw new Error('Failed to create new habit data');
        return newData;
      }
    },
    onMutate: async ({ habit, selectedDate, difference }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['habitsWithData'] });

      // Snapshot the previous values
      const previousWeeklyData = queryClient.getQueryData<HabitWithData[]>([
        'habitsWithData',
        startOfWeek(selectedDate).toISOString(),
        endOfWeek(selectedDate).toISOString(),
      ]);

      const previousMonthlyData = queryClient.getQueryData<HabitWithData[]>([
        'habitsWithData',
        startOfMonth(selectedDate).toISOString(),
        endOfMonth(selectedDate).toISOString(),
      ]);

      return { previousWeeklyData, previousMonthlyData };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousWeeklyData) {
        queryClient.setQueryData(
          [
            'habitsWithData',
            startOfWeek(variables.selectedDate).toISOString(),
            endOfWeek(variables.selectedDate).toISOString(),
          ],
          context.previousWeeklyData
        );
      }
      if (context?.previousMonthlyData) {
        queryClient.setQueryData(
          [
            'habitsWithData',
            startOfMonth(variables.selectedDate).toISOString(),
            endOfMonth(variables.selectedDate).toISOString(),
          ],
          context.previousMonthlyData
        );
      }
    },
    onSettled: (data, error, variables) => {
      const { habit, selectedDate } = variables;
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['habitsWithData'] 
      });
      
      // Invalidate stats and streaks
      queryClient.invalidateQueries({ 
        queryKey: ['monthlyHabitStats', habit.id] 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['habitStreaks'] 
      });
      
      queryClient.invalidateQueries({ 
        queryKey: ['weeklyHabitStreaks'] 
      });
      
      // Invalidate date-specific queries
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
      const monthStart = startOfMonth(selectedDate);
      const monthEnd = endOfMonth(selectedDate);
      
      // Invalidate weekly and monthly views
      queryClient.invalidateQueries({
        queryKey: [
          'habitsWithData', 
          weekStart.toISOString(), 
          weekEnd.toISOString()
        ]
      });
      
      queryClient.invalidateQueries({
        queryKey: [
          'habitsWithData', 
          monthStart.toISOString(), 
          monthEnd.toISOString()
        ]
      });
    },
  });
}