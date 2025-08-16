import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../useClient';
import { UserSetting } from '../../types';

type UserSettingPayload = {
  [key: string]: any;
};

export function useAddOrUpdateSetting() {
  const queryClient = useQueryClient();

  return useMutation<UserSetting, Error, UserSettingPayload>(
    async setting => {
      const { data: existingRows, error: fetchError } = await supabase
        .from('user_settings')
        .select('id')
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(fetchError);
        throw new Error('Failed to fetch user settings row');
      }

      if (existingRows) {
        const { data, error: updateError } = await supabase
          .from('user_settings')
          .update(setting)
          .eq('id', existingRows.id)
          .select();

        if (updateError) {
          console.error(updateError);
          throw new Error('Failed to update user setting');
        }

        return data;
      } else {
        const { data, error: insertError } = await supabase.from('user_settings').insert([setting]).select();

        if (insertError) {
          console.error(insertError);
          throw new Error('Failed to insert user setting');
        }
        return data;
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['settings']);
      },
    }
  );
}
