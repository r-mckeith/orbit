import { useQuery } from '@tanstack/react-query';
import { startOfMonth } from 'date-fns';
import { supabase } from '../useClient';

export function useGetMonthlyHabitStats(selectedDate: Date, habitId: number) {
  const startDate = startOfMonth(selectedDate).toISOString();

  return useQuery<any | undefined>({
    queryKey: ['monthlyHabitStats', habitId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_monthly_habit_stats', {
        input_date: startDate,
        habit_id_param: habitId ?? null,
      });

      if (error) throw new Error(error.message);
      return data?.[0];
    },
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: true,
    networkMode: 'offlineFirst',
  });
}

// CREATE OR REPLACE FUNCTION get_habit_stats(
//   start_date DATE,
//   end_date DATE,
//   habit_ids BIGINT[] DEFAULT NULL
// )
// RETURNS TABLE (
//   habit_id BIGINT,
//   name TEXT,
//   days_logged BIGINT,
//   missed_days BIGINT,
//   completion_rate NUMERIC,
//   percent_change NUMERIC,
//   current_streak BIGINT,
//   longest_streak BIGINT
// ) AS $$
// DECLARE
//   total_days INT := (end_date - start_date + 1);
//   total_days_in_month INT := DATE_PART('day', end_date);
// BEGIN
//   RETURN QUERY
//   WITH habits_filtered AS (
//     SELECT * FROM habits
//     WHERE habit_ids IS NULL OR habits.id = ANY(habit_ids)
//   ),
//   habit_data_in_range AS (
//     SELECT * FROM habit_data
//     WHERE created::DATE BETWEEN start_date AND end_date
//   ),
//   prev_month_data AS (
//     SELECT hd.habit_id, SUM(hd.count) AS total
//     FROM habit_data hd
//     WHERE hd.created::DATE BETWEEN (start_date - INTERVAL '1 month') AND (start_date - INTERVAL '1 day')
//     GROUP BY hd.habit_id
//   ),
//   date_series AS (
//     SELECT generate_series(start_date, end_date, INTERVAL '1 day')::DATE AS date
//   ),
//   stats_per_habit AS (
//     SELECT
//       h.id AS habit_id,
//       h.name,
//       h.target,
//       h.timeframe,
//       COUNT(*) FILTER (WHERE COALESCE(hd.count, 0) > 0) AS days_logged,
//       COUNT(*) FILTER (WHERE COALESCE(hd.count, 0) = 0) AS missed_days,
//       COALESCE(SUM(hd.count), 0) AS total_count,
//       COALESCE(pm.total, 0) AS prev_month_total
//     FROM habits_filtered h
//     CROSS JOIN date_series ds
//     LEFT JOIN habit_data_in_range hd ON hd.habit_id = h.id AND hd.created::DATE = ds.date
//     LEFT JOIN prev_month_data pm ON pm.habit_id = h.id
//     GROUP BY h.id, h.name, h.target, h.timeframe, pm.total
//   ),
//   habit_days AS (
//     SELECT
//       h.id AS habit_id,
//       ds.date,
//       COALESCE(hd.count, 0) AS count
//     FROM habits_filtered h
//     CROSS JOIN date_series ds
//     LEFT JOIN habit_data_in_range hd ON hd.habit_id = h.id AND hd.created::DATE = ds.date
//   ),
//   streaks AS (
//     SELECT
//       habit_id,
//       MAX(streak_length) AS longest_streak,
//       COALESCE((
//         SELECT streak_length FROM (
//           SELECT habit_id, COUNT(*) AS streak_length,
//                  ROW_NUMBER() OVER (PARTITION BY habit_id ORDER BY date DESC) AS rn
//           FROM (
//             SELECT habit_id, date, count,
//                    SUM(CASE WHEN count > 0 THEN 0 ELSE 1 END) OVER (PARTITION BY habit_id ORDER BY date) AS group_id
//             FROM habit_days
//           ) grouped
//           WHERE count > 0
//           GROUP BY habit_id, group_id, date
//         ) latest
//         WHERE rn = 1
//       ), 0) AS current_streak
//     FROM habit_days
//     WHERE count > 0
//     GROUP BY habit_id
//   )
//   SELECT
//     s.habit_id,
//     s.name,
//     s.days_logged,
//     s.missed_days,
//     CASE
//       WHEN s.target IS NULL OR s.target = 0 THEN 100
//       WHEN s.timeframe IN ('day', 'custom') THEN LEAST((s.days_logged::NUMERIC / total_days) * 100, 100)
//       WHEN s.timeframe = 'week' THEN LEAST((s.total_count::NUMERIC / GREATEST(1, FLOOR(total_days / 7.0) * s.target)) * 100, 100)
//       WHEN s.timeframe = 'month' THEN LEAST((s.total_count::NUMERIC / GREATEST(1, s.target * (total_days::NUMERIC / total_days_in_month))) * 100, 100)
//       ELSE 0
//     END AS completion_rate,
//     CASE
//       WHEN s.prev_month_total = 0 THEN NULL
//       ELSE ROUND(((s.total_count::NUMERIC - s.prev_month_total) / NULLIF(s.prev_month_total, 0)) * 100, 1)
//     END AS percent_change,
//     streaks.current_streak,
//     streaks.longest_streak
//   FROM stats_per_habit s
//   LEFT JOIN streaks ON streaks.habit_id = s.habit_id;
// END;
// $$ LANGUAGE plpgsql;