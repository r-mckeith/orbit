import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../useClient';
import { UserProfile } from '../../types';

type UserProfilePayload = {
  [key: string]: any;
};

export function useAddOrUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserProfile, Error, UserProfilePayload>(
    async profile => {
      const { data: existingRows, error: fetchError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(fetchError);
        throw new Error('Failed to fetch user profiles row');
      }

      if (existingRows) {
        const { data, error: updateError } = await supabase
          .from('user_profiles')
          .update(profile)
          .eq('id', existingRows.id)
          .select();

        if (updateError) {
          console.error(updateError);
          throw new Error('Failed to update user profile');
        }

        return data;
      } else {
        const { data, error: insertError } = await supabase.from('user_profiles').insert([profile]).select();

        if (insertError) {
          console.error(insertError);
          throw new Error('Failed to insert user profile');
        }
        return data;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profile']);
      },
    }
  );
}
