import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../useClient';
import { NoteProps, NewNoteProps } from '../../types';

type HabitWithNotes = {
  habit_name: string;
  notes: NoteProps[];
};

async function addOrUpdateNote(note: NewNoteProps): Promise<NoteProps> {
  if (note.id) {
    // 🔄 Update existing note
    const { data, error } = await supabase
      .from('notes')
      .update({ note: note.note })
      .eq('id', note.id)
      .select()
      .single();

    if (error) throw new Error('Failed to update note');
    return data;
  } else {
    // ➕ Insert new note
    const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          note: note.note,
          habit_id: note.habit_id,
          created: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw new Error('Failed to add note');
    return data;
  }
}

export function useAddOrUpdateNote(habitId: number) {
  const queryClient = useQueryClient();

  return useMutation<NoteProps, Error, NewNoteProps, { previousNotes: HabitWithNotes | undefined }>(
    async (note) => await addOrUpdateNote(note),
    {
      onMutate: async (newNote) => {
        const queryKey = ['notes', habitId];
        await queryClient.cancelQueries(queryKey);

        const previousNotes = queryClient.getQueryData<HabitWithNotes>(queryKey);

        queryClient.setQueryData<HabitWithNotes>(queryKey, (old = { habit_name: '', notes: [] }) => {
          const optimisticNote: NoteProps = {
            id: newNote.id ?? Math.random().toString(),
            note: newNote.note,
            habit_id: newNote.habit_id,
            created: new Date().toISOString(),
          };

          const newNotes = newNote.id
            ? old.notes.map((n) => (n.id === newNote.id ? optimisticNote : n))
            : [...old.notes, optimisticNote];

          return { ...old, notes: newNotes };
        });

        return { previousNotes };
      },

      onSuccess: (newNote) => {
        queryClient.setQueryData<HabitWithNotes>(['notes', habitId], (old = { habit_name: '', notes: [] }) => ({
          ...old,
          notes: old.notes.map((n) => (n.id === newNote.id ? newNote : n)),
        }));
      },

      onError: (_err, _newNote, context) => {
        if (context?.previousNotes) {
          queryClient.setQueryData(['notes', habitId], context.previousNotes);
        }
      },

      onSettled: () => {
        queryClient.invalidateQueries(['notes', habitId]);
      },
    }
  );
}