import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../useClient';
import { NoteProps } from '../../types';

type HabitWithNotes = {
  habit_name: string;
  notes: NoteProps[];
};

async function deleteNote(noteId: number): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', noteId);
  if (error) throw new Error(error.message);
}

export function useDeleteNote(habitId: number) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number, { previousData: HabitWithNotes | undefined }>(
    async (noteId) => await deleteNote(noteId),
    {
      onMutate: async (noteId) => {
        const queryKey = ['notes', habitId];
        await queryClient.cancelQueries(queryKey);

        const previousData = queryClient.getQueryData<HabitWithNotes>(queryKey);

        queryClient.setQueryData<HabitWithNotes>(queryKey, (old = { habit_name: '', notes: [] }) => ({
          ...old,
          notes: old.notes.filter((note) => note.id !== noteId),
        }));

        return { previousData };
      },

      onError: (_err, _noteId, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(['notes', habitId], context.previousData);
        }
      },

      onSettled: () => {
        queryClient.invalidateQueries(['notes', habitId]);
      },
    }
  );
}