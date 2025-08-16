import { useQuery } from '@tanstack/react-query';
import { supabase } from '../useClient';
import { NoteProps } from '../../types';

type HabitWithNotes = NoteProps & {
  habits: { name: string } | null;
  habit_name?: string;
};


export function useGetNotes(habitId: number) {
  return useQuery<HabitWithNotes>({
    queryKey: ['notes', habitId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habits')
        .select(`
          name,
          notes (
            id,
            created,
            note
          )
        `)
        .eq('id', habitId)
        .order('created', { referencedTable: 'notes', ascending: false })
        .single();

      if (error) throw new Error(error.message);

      return {
        habit_name: data.name,
        notes: data.notes ?? [],
      };
    },
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
}