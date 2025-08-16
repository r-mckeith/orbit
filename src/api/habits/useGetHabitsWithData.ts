import { useQuery } from '@tanstack/react-query';
import { supabase } from '../useClient';
import { HabitStreak, HabitWithData } from '../../types';

export function useGetHabitsWithData(
  startDate: Date,
  endDate: Date,
  habitIds: number[] | null = null
) {
  return useQuery<HabitWithData[]>({
    queryKey: ['habitsWithData', startDate.toISOString(), endDate.toISOString(), habitIds],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_habits_with_data', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        habit_ids: habitIds,
      })

      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: 1000 * 60 * 60,
    keepPreviousData: true,
    refetchOnWindowFocus: true,
    networkMode: 'offlineFirst',
  });
}

// DROP FUNCTION get_habits_with_data(timestamp without time zone,timestamp without time zone,bigint[]);
// CREATE OR REPLACE FUNCTION get_habits_with_data(
//   start_date TIMESTAMP,
//   end_date TIMESTAMP,
//   habit_ids BIGINT[] DEFAULT NULL
// )
// RETURNS TABLE (
//   id BIGINT,
//   name TEXT,
//   description TEXT,
//   section TEXT,
//   target SMALLINT,
//   timeframe TEXT,
//   schedule JSONB,
//   user_id UUID,
//   archived BOOLEAN,
//   created TIMESTAMPTZ,
//   watchlist BOOLEAN,
//   boundary BOOLEAN,
//   bottom_line BOOLEAN,
//   last_recorded DATE,
//   streak BIGINT,
//   data JSONB
// ) AS $$
// BEGIN
//   RETURN QUERY
//   SELECT
//     result.id,
//     result.name,
//     result.description,
//     result.section,
//     result.target,
//     result.timeframe,
//     result.schedule,
//     result.user_id,
//     result.archived,
//     result.created,
//     result.watchlist,
//     result.boundary,
//     result.bottom_line,
//     result.last_recorded,
//     result.streak,
//     result.data
//   FROM (
//     WITH date_series AS (
//       SELECT generate_series(start_date::DATE, end_date::DATE, '1 day') AS date
//     ),
//     habits_filtered AS (
//       SELECT * FROM habits
//       WHERE habit_ids IS NULL OR habits.id = ANY(habit_ids)
//     ),
//     last_logs AS (
//       SELECT hd.habit_id, MAX(hd.created)::DATE AS last_recorded
//       FROM habit_data hd
//       WHERE COALESCE(hd.count, 0) > 0
//       GROUP BY hd.habit_id
//     ),
//     habit_range_data AS (
//       SELECT 
//         h.id,
//         h.name,
//         h.description,
//         h.section,
//         h.target,
//         h.timeframe,
//         h.schedule,
//         h.user_id,
//         COALESCE(h.archived, FALSE) AS archived,
//         h.created AS habit_created,
//         COALESCE(h.watchlist, FALSE) AS watchlist,
//         COALESCE(h.boundary, FALSE) AS boundary,
//         COALESCE(h.bottom_line, FALSE) AS bottom_line,
//         ds.date,
//         COALESCE(hd.count, 0) AS count
//       FROM habits_filtered h
//       CROSS JOIN date_series ds
//       LEFT JOIN habit_data hd 
//         ON h.id = hd.habit_id AND hd.created::DATE = ds.date
//     ),
//     habit_logs AS (
//       SELECT
//         h.id AS habit_id,
//         hd.created::DATE AS log_date,
//         COALESCE(hd.count, 0) AS count
//       FROM habits h
//       JOIN habit_data hd ON hd.habit_id = h.id
//       WHERE h.user_id = auth.uid()
//         AND hd.created::DATE < CURRENT_DATE
//     ),
//     ordered_logs AS (
//       SELECT
//         habit_id,
//         log_date,
//         count,
//         ROW_NUMBER() OVER (PARTITION BY habit_id ORDER BY log_date DESC) AS rn,
//         SUM(CASE WHEN count > 0 THEN 1 ELSE 0 END)
//           OVER (PARTITION BY habit_id ORDER BY log_date DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS active_run
//       FROM habit_logs
//     ),
//     cutoff AS (
//       SELECT habit_id, MAX(log_date) AS latest_day
//       FROM habit_logs
//       WHERE count > 0
//       GROUP BY habit_id
//       HAVING MAX(log_date) = CURRENT_DATE - INTERVAL '1 day'
//     ),
//     streaks AS (
//       SELECT o.habit_id, COUNT(*) AS streak
//       FROM ordered_logs o
//       JOIN cutoff c ON c.habit_id = o.habit_id
//       WHERE o.log_date <= c.latest_day
//         AND o.count > 0
//         AND o.active_run = o.rn
//       GROUP BY o.habit_id
//     )

//     SELECT
//       hr.id,
//       hr.name,
//       hr.description,
//       hr.section,
//       hr.target,
//       hr.timeframe,
//       hr.schedule,
//       hr.user_id,
//       hr.archived,
//       hr.habit_created AS created,
//       hr.watchlist,
//       hr.boundary,
//       hr.bottom_line,
//       COALESCE(ll.last_recorded, NULL) AS last_recorded,
//       COALESCE(s.streak, 0) AS streak,
//       JSONB_AGG(
//         JSONB_BUILD_OBJECT(
//           'date', TO_CHAR(hr.date, 'YYYY-MM-DD'),
//           'count', hr.count,
//           'due_today',
//             CASE
//               WHEN hr.target IS NULL THEN FALSE
//               WHEN hr.timeframe = 'custom' THEN
//                 COALESCE((hr.schedule->>LOWER(TRIM(TO_CHAR(hr.date, 'Day'))))::boolean, FALSE)
//               WHEN hr.timeframe = 'day' THEN TRUE
//               WHEN hr.timeframe = 'week' THEN (
//                 SELECT COALESCE(SUM(hr2.count), 0)
//                 FROM habit_range_data hr2
//                 WHERE hr2.id = hr.id AND hr2.date < hr.date
//               ) < hr.target
//               WHEN hr.timeframe = 'month' THEN (
//                 SELECT COALESCE(SUM(hr2.count), 0)
//                 FROM habit_range_data hr2
//                 WHERE hr2.id = hr.id AND DATE_TRUNC('month', hr2.date) = DATE_TRUNC('month', hr.date)
//                   AND hr2.date < hr.date
//               ) < hr.target
//               ELSE FALSE
//             END,
//           'target_met',
//             CASE 
//               WHEN hr.section IN ('inner', 'middle') THEN
//                 CASE WHEN hr.count > 0 THEN FALSE ELSE TRUE END
//               WHEN hr.timeframe = 'day' THEN hr.count >= hr.target
//               WHEN hr.timeframe = 'week' THEN (
//                 SELECT SUM(count)
//                 FROM habit_range_data hr2
//                 WHERE hr2.id = hr.id
//               ) >= hr.target
//               WHEN hr.timeframe = 'month' THEN (
//                 SELECT SUM(count)
//                 FROM habit_range_data hr2
//                 WHERE hr2.id = hr.id AND DATE_TRUNC('month', hr2.date) = DATE_TRUNC('month', hr.date)
//               ) >= hr.target
//               WHEN hr.timeframe = 'custom' THEN (
//                 CASE 
//                   WHEN COALESCE(hr.schedule->>LOWER(TRIM(TO_CHAR(hr.date, 'Day'))), 'false')::boolean THEN hr.count >= hr.target
//                   ELSE NULL
//                 END
//               )
//               ELSE FALSE
//             END
//         ) ORDER BY hr.date
//       ) AS data
//     FROM habit_range_data hr
//     LEFT JOIN last_logs ll ON ll.habit_id = hr.id
//     LEFT JOIN streaks s ON s.habit_id = hr.id
//     GROUP BY 
//       hr.id, hr.name, hr.description, hr.section, hr.target, hr.timeframe, 
//       hr.schedule, hr.user_id, hr.archived, hr.habit_created,
//       hr.watchlist, hr.boundary, hr.bottom_line,
//       ll.last_recorded, s.streak
//   ) AS result;
// END;
// $$ LANGUAGE plpgsql;