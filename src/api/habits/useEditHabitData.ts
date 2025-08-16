import {
  startOfDay,
  endOfDay,
  isSameDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  formatISO,
  parseISO,
  addDays,
} from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../useClient';
import { HabitWithData, HabitData } from '../../types';

export type EditHabitDataInput = {
  habit: HabitWithData;
  selectedDate: Date;
  difference: number;
};

export function useEditHabitData() {
  const queryClient = useQueryClient();

  return useMutation<
    HabitData,
    Error,
    EditHabitDataInput,
    {
      previousWeeklyData: HabitWithData[] | null;
      previousMonthlyData: HabitWithData[] | null;
    }
  >(
    async ({ habit, selectedDate, difference }) => {
      const formattedDate = formatISO(startOfDay(selectedDate), { representation: 'complete' });

      const { data, error } = await supabase
        .from('habit_data')
        .select('*')
        .eq('habit_id', habit.id)
        .gte('created', startOfDay(formattedDate).toISOString())
        .lte('created', endOfDay(formattedDate).toISOString());

      if (error) throw new Error('Failed to fetch habit data');

      if (data.length > 0) {
        const { data: updatedData, error: updateError } = await supabase
          .from('habit_data')
          .update({ count: data[0].count + difference })
          .eq('id', data[0].id)
          .select();

        if (updateError) throw new Error('Failed to update habit data');
        return updatedData[0];
      } else {
        const newData = { created: formattedDate, habit_id: habit.id, count: difference };
        const { data: insertedData, error: insertError } = await supabase.from('habit_data').insert([newData]).select();

        if (insertError) throw new Error('Failed to insert habit data');
        return insertedData[0];
      }
    },

    {
      onMutate: async newData => {
        const { selectedDate, habit, difference } = newData;

        const startOfWeekDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const endOfWeekDate = endOfWeek(selectedDate, { weekStartsOn: 1 });

        const startOfMonthDate = startOfMonth(selectedDate);
        const endOfMonthDate = endOfMonth(selectedDate);

        const weeklyKey = ['habitsWithData', startOfWeekDate.toISOString(), endOfWeekDate.toISOString(), [habit.id]];
        const monthlyKey = ['habitsWithData', startOfMonthDate.toISOString(), endOfMonthDate.toISOString(), [habit.id]];

        const previousWeeklyData = queryClient.getQueryData<HabitWithData[]>(weeklyKey) ?? null;
        const previousMonthlyData = queryClient.getQueryData<HabitWithData[]>(monthlyKey) ?? null;

        const patchHabitData = (habit: HabitWithData) => ({
          ...habit,
          data: habit.data.map(day =>
            isSameDay(parseISO(day.date), selectedDate) ? { ...day, count: day.count + difference } : day
          ),
        });

        if (previousWeeklyData) {
          queryClient.setQueryData(weeklyKey, (old: HabitWithData[] = []) =>
            old.map(h => (h.id === habit.id ? patchHabitData(h) : h))
          );
        }

        if (previousMonthlyData) {
          queryClient.setQueryData(monthlyKey, (old: HabitWithData[] = []) =>
            old.map(h => (h.id === habit.id ? patchHabitData(h) : h))
          );
        }

        return {
          previousWeeklyData,
          previousMonthlyData,
        };
      },

      onError: (_, variables, context) => {
        const { selectedDate, habit } = variables;

        const startOfWeekDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const endOfWeekDate = endOfWeek(selectedDate, { weekStartsOn: 1 });

        const startOfMonthDate = startOfMonth(selectedDate);
        const endOfMonthDate = endOfMonth(selectedDate);

        if (context?.previousWeeklyData) {
          queryClient.setQueryData(
            ['habitsWithData', startOfWeekDate.toISOString(), endOfWeekDate.toISOString(), [habit.id]],
            context.previousWeeklyData
          );
        }

        if (context?.previousMonthlyData) {
          queryClient.setQueryData(
            ['habitsWithData', startOfMonthDate.toISOString(), endOfMonthDate.toISOString(), [habit.id]],
            context.previousMonthlyData
          );
        }
      },

      onSettled: (_, __, variables) => {
        const { selectedDate, habit } = variables;

        const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }).toISOString();
  const weekEnd = addDays(weekStart, 6).toISOString();
        const monthStart = startOfMonth(selectedDate).toISOString();
        const monthEnd = endOfMonth(selectedDate).toISOString();

        queryClient.invalidateQueries({
          predicate: query => {
            const [key, start, end, ids] = query.queryKey as [string, string, string, number[] | null];

            return (
              key === 'habitsWithData' &&
              ((start === weekStart && end === weekEnd) || (start === monthStart && end === monthEnd)) &&
              (ids === null || ids.includes(habit.id))
            );
          },
        });

        queryClient.invalidateQueries(['monthlyHabitStats', habit.id]);
        queryClient.invalidateQueries(['habitStreaks']);
        queryClient.invalidateQueries(['weeklyHabitStreaks']);
      },
    }
  );
}