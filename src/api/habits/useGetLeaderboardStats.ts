import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../useClient';
import { startOfMonth, endOfMonth } from 'date-fns';

export type LeaderboardRow = {
  public_id: string;
  first_name: string;
  last_initial: string;
  city: string;
  state: string;
  sobriety_date: string;
  percent_inner: number;
  percent_middle: number;
  percent_outer: number;
};

export default function useLeaderboardProgress(startDate: Date, endDate: Date) {
  const formattedStartDate = startDate.toISOString();
  const formattedEndDate = endDate.toISOString();

  return useQuery<LeaderboardRow[], Error>({
    queryKey: ['leaderboardProgress'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_leaderboard_data', {
        start_ts: formattedStartDate,
        end_ts: formattedEndDate,
      });
      if (error) throw error;
      // our function returns one row per public_id
      return data as LeaderboardRow[];
    },
    staleTime: 1000 * 60 * 5, // 5m
    refetchOnWindowFocus: true,
  });
}

export function useFollowUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (publicId: string) => {
      const { error } = await supabase.rpc('follow_user_by_public_id', {
        p_public_id: publicId,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      // Invalidate the leaderboard query so it refetches
      queryClient.invalidateQueries({ queryKey: ['leaderboardProgress'] });
    },
  });
}

// create or replace function get_leaderboard_data(
//   start_ts timestamptz,
//   end_ts timestamptz
// )
// returns table (
//   user_id uuid,
//   first_name text,
//   last_initial text,
//   city text,
//   state text,
//   sobriety_date date,
//   percent_outer numeric,
//   percent_middle numeric,
//   percent_inner numeric,
//   last_logged timestamptz
// )
// language sql
// security definer
// as $$
//   with connected_users as (
//     select connected_user_id
//     from user_connections
//     where user_id = auth.uid()
//   ),
//   filtered_habit_data as (
//     select *
//     from habit_data
//     where created between start_ts and end_ts
//   ),
//   habit_totals as (
//     select
//       hd.user_id,
//       h.section,
//       count(*)::numeric as completed_count
//     from filtered_habit_data hd
//     join habits h on hd.habit_id = h.id
//     where hd.user_id in (select connected_user_id from connected_users)
//     group by hd.user_id, h.section
//   ),
//   last_logged_per_user as (
//     select
//       user_id,
//       max(created) as last_logged
//     from habit_data
//     where user_id in (select connected_user_id from connected_users)
//     group by user_id
//   ),
//   totals as (
//     select
//       user_id,
//       sum(completed_count) as total,
//       max(case when section = 'outer' then completed_count else 0 end) as outer_count,
//       max(case when section = 'middle' then completed_count else 0 end) as middle_count,
//       max(case when section = 'inner' then completed_count else 0 end) as inner_count
//     from habit_totals
//     group by user_id
//   )
//   select
//     u.user_id,
//     u.first_name,
//     u.last_initial,
//     u.city,
//     u.state,
//     u.sobriety_date,
//     round(t.outer_count / nullif(t.total, 0) * 100, 2) as percent_outer,
//     round(t.middle_count / nullif(t.total, 0) * 100, 2) as percent_middle,
//     round(t.inner_count / nullif(t.total, 0) * 100, 2) as percent_inner,
//     l.last_logged
//   from totals t
//   join user_profiles u on u.user_id = t.user_id
//   left join last_logged_per_user l on l.user_id = t.user_id;
// $$;