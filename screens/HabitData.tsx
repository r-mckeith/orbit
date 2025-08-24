// app/(tabs)/details.tsx
import { AlertTriangle, CheckCircle2, Flame, TrendingUp } from '@tamagui/lucide-icons';
import { differenceInCalendarDays, isAfter, isWithinInterval, startOfDay, subDays } from 'date-fns';
import { useMemo } from 'react';
import { H3, Paragraph, ScrollView, Separator, Stack, Text, XStack, YStack } from 'tamagui';

// ---- Mock types (adapt to your real types later) ----
type Circle = 'outer' | 'middle' | 'inner';
type Habit = { id: string; name: string; category: Circle; polarity: 'do' | 'avoid' };
type HabitData = { habit_id: string; date: string }; // yyyy-MM-dd

// ---- Hardcoded sample data (last ~10 days) ----
const habits: Habit[] = [
  { id: 'h1', name: 'Morning Run', category: 'outer', polarity: 'do' },
  { id: 'h2', name: 'Read 20 min', category: 'outer', polarity: 'do' },
  { id: 'h3', name: 'Social Media Doomscroll', category: 'inner', polarity: 'avoid' },
  { id: 'h4', name: 'Evening Stretch', category: 'outer', polarity: 'do' },
  { id: 'h5', name: 'Late-night Snacks', category: 'middle', polarity: 'avoid' },
  { id: 'h6', name: 'Focus Block (2h)', category: 'outer', polarity: 'do' },
  { id: 'h7', name: 'Energy Drink', category: 'middle', polarity: 'avoid' },
];

const today = startOfDay(new Date());
const iso = (d: Date) => d.toISOString().slice(0, 10);

// pretend these are rows in `habit_data`
const habit_data: HabitData[] = [
  // today
  { habit_id: 'h2', date: iso(today) },
  { habit_id: 'h6', date: iso(today) },
  // yesterday
  { habit_id: 'h1', date: iso(subDays(today, 1)) },
  { habit_id: 'h5', date: iso(subDays(today, 1)) },
  // -2
  { habit_id: 'h1', date: iso(subDays(today, 2)) },
  { habit_id: 'h2', date: iso(subDays(today, 2)) },
  { habit_id: 'h7', date: iso(subDays(today, 2)) },
  // -3
  { habit_id: 'h3', date: iso(subDays(today, 3)) }, // inner (avoid) happened
  { habit_id: 'h6', date: iso(subDays(today, 3)) },
  // -4
  { habit_id: 'h1', date: iso(subDays(today, 4)) },
  { habit_id: 'h5', date: iso(subDays(today, 4)) },
  // -5
  { habit_id: 'h2', date: iso(subDays(today, 5)) },
  { habit_id: 'h6', date: iso(subDays(today, 5)) },
  // -6
  { habit_id: 'h1', date: iso(subDays(today, 6)) },
  { habit_id: 'h7', date: iso(subDays(today, 6)) },
  // older than a week
  { habit_id: 'h4', date: iso(subDays(today, 10)) },
  { habit_id: 'h3', date: iso(subDays(today, 10)) },
];

// ---- Small helpers ----
const byId = new Map(habits.map(h => [h.id, h]));
const last7 = { start: subDays(today, 6), end: today };

function countsInRange(rows: HabitData[], range = last7) {
  const map = new Map<string, number>();
  for (const r of rows) {
    const d = new Date(r.date + 'T00:00:00');
    if (isWithinInterval(d, range)) {
      map.set(r.habit_id, (map.get(r.habit_id) ?? 0) + 1);
    }
  }
  return map;
}

function lastOccurrence(habitId: string): Date | null {
  let last: Date | null = null;
  for (const r of habit_data) {
    if (r.habit_id !== habitId) continue;
    const d = new Date(r.date + 'T00:00:00');
    if (!last || isAfter(d, last)) last = d;
  }
  return last;
}

export default function HabitData() {
  const countsMap = useMemo(() => countsInRange(habit_data, last7), []);

  const ranked = useMemo(() => {
    // create a ranked list by last-7-day count (desc)
    const rows = habits.map(h => ({
      habit: h,
      count: countsMap.get(h.id) ?? 0,
    }));
    rows.sort((a, b) => b.count - a.count || a.habit.name.localeCompare(b.habit.name));
    return rows;
  }, [countsMap]);

  // Top by circle (Outer: most done; Middle: most recurring caution; Inner: most recurring avoid)
  const topOuter = ranked.filter(r => r.habit.category === 'outer')[0];
  const topMiddle = ranked.filter(r => r.habit.category === 'middle')[0];
  const topInner = ranked.filter(r => r.habit.category === 'inner')[0];

  // Insights
  // 1) Good habit to get back to: outer with the *longest* time since last completion
  const outerCandidates = habits.filter(h => h.category === 'outer');
  const getDaysSince = (h: Habit) => {
    const d = lastOccurrence(h.id);
    return d ? differenceInCalendarDays(today, d) : Infinity;
  };
  const outerToRevive = outerCandidates.slice().sort((a, b) => getDaysSince(b) - getDaysSince(a))[0];
  const outerToReviveDays = getDaysSince(outerToRevive);

  // 2) Inner streak congrats: days since last inner occurrence (more days = better)
  const innerHabits = habits.filter(h => h.category === 'inner');
  const innerBest = innerHabits.slice().sort((a, b) => getDaysSince(b) - getDaysSince(a))[0];
  const innerBestDays = getDaysSince(innerBest);

  // 3) Most recurring middle this week (caution)
  const middleHabits = habits.filter(h => h.category === 'middle');
  const middleMost = middleHabits
    .map(h => ({ h, c: countsMap.get(h.id) ?? 0 }))
    .sort((a, b) => b.c - a.c)[0];

  return (
    <ScrollView>
      <YStack p="$4" gap="$4">

        {/* Header */}
        <YStack gap="$1">
          <H3>Details</H3>
          <Paragraph theme="alt2">Last 7 days overview</Paragraph>
        </YStack>

        {/* Top tiles */}
        <XStack gap="$3" f={1} $gtSm={{ flexDirection: 'row' }} flexWrap="wrap">
          <Tile
            title="Top Outer"
            subtitle="Most completed (good)"
            value={topOuter ? `${topOuter.habit.name} · ${topOuter.count}` : '—'}
            icon={<TrendingUp />}
          />
          <Tile
            title="Top Middle"
            subtitle="Most recurring (caution)"
            value={topMiddle ? `${topMiddle.habit.name} · ${topMiddle.count}` : '—'}
            icon={<AlertTriangle color="$color" />}
          />
          <Tile
            title="Top Inner"
            subtitle="Most recurring (avoid)"
            value={topInner ? `${topInner.habit.name} · ${topInner.count}` : '—'}
            icon={<Flame color="$color" />}
          />
        </XStack>

        <Separator />

        {/* Ranked list of habits in last 7 days */}
        <YStack gap="$2">
          <Text fontWeight="700">Activity · Last 7 days</Text>
          <YStack bg="$background" br="$4" p="$3" borderWidth={1} borderColor="$borderColor" gap="$2">
            {ranked.map(({ habit, count }) => (
              <XStack key={habit.id} jc="space-between" ai="center" py="$2" borderBottomWidth={1} borderColor="$backgroundHover">
                <Text>{habit.name}</Text>
                <XStack ai="center" gap="$2">
                  <Badge tone={habit.category}>{habit.category}</Badge>
                  <Text fontWeight="700">{count}</Text>
                </XStack>
              </XStack>
            ))}
          </YStack>
        </YStack>

        <Separator />

        {/* Insights */}
        <YStack gap="$2">
          <Text fontWeight="700">Insights</Text>
          <YStack gap="$2">
            <Insight
              icon={<CheckCircle2 color="$color" />}
              title={`Get back to: ${outerToRevive.name}`}
              desc={
                outerToReviveDays === Infinity
                  ? `Haven't logged this yet. Today could be day 1.`
                  : `It’s been ${outerToReviveDays} day${outerToReviveDays === 1 ? '' : 's'} since you last did this.`
              }
            />
            <Insight
              icon={<Flame color="$color" />}
              title={`Avoid streak: ${innerBest.name}`}
              desc={
                innerBestDays === Infinity
                  ? `You haven’t logged this inner-circle habit—nice!`
                  : `Congrats! ${innerBestDays} day${innerBestDays === 1 ? '' : 's'} since last time.`
              }
            />
            {middleMost && (
              <Insight
                icon={<AlertTriangle color="$color" />}
                title={`Caution: ${middleMost.h.name}`}
                desc={`Occurred ${middleMost.c} time${middleMost.c === 1 ? '' : 's'} this week.`}
              />
            )}
          </YStack>
        </YStack>

        <YStack h="$6" />

      </YStack>
    </ScrollView>
  );
}

// ---- UI bits ----

function Tile({
  title,
  subtitle,
  value,
  icon,
}: {
  title: string;
  subtitle: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <YStack
      f={1}
      minWidth={260}
      bg="$background"
      br="$4"
      p="$3"
      borderWidth={1}
      borderColor="$borderColor"
      gap="$1"
    >
      <XStack ai="center" gap="$2">
        <Stack>{icon}</Stack>
        <Text fontWeight="700">{title}</Text>
      </XStack>
      <Paragraph theme="alt2">{subtitle}</Paragraph>
      <Text fontSize="$7" mt="$2" fontWeight="800">
        {value}
      </Text>
    </YStack>
  );
}

function Badge({ tone, children }: { tone: Circle, children: any }) {
  const map: Record<Circle, { label: string; bg: string; fg: string }> = {
    outer: { label: 'Outer', bg: '#3b82f620', fg: '#3b82f6' },
    middle: { label: 'Middle', bg: '#f59e0b20', fg: '#f59e0b' },
    inner: { label: 'Inner', bg: '#ef444420', fg: '#ef4444' },
  };
  const { label, bg, fg } = map[tone];
  return (
    <XStack px="$2" py="$1" br="$3" bg={bg} borderWidth={1} borderColor={`${fg}55`}>
      <Text color={fg} fontSize="$2" fontWeight="700">
        {label}
      </Text>
    </XStack>
  );
}

function Insight({ icon, title, desc }: { icon?: React.ReactNode; title: string; desc: string }) {
  return (
    <XStack ai="center" gap="$3" bg="$background" br="$4" p="$3" borderWidth={1} borderColor="$borderColor">
      <Stack>{icon}</Stack>
      <YStack f={1}>
        <Text fontWeight="700">{title}</Text>
        <Paragraph theme="alt2">{desc}</Paragraph>
      </YStack>
    </XStack>
  );
}