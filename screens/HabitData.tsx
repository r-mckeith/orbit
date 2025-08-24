// app/(tabs)/details.tsx
import { useGetHabitStats } from '@/src/api/habits/useGetHabitStats';
import { AlertTriangle, CheckCircle2, Flame, TrendingUp } from '@tamagui/lucide-icons';
import { useMemo } from 'react';
import { H3, Paragraph, ScrollView, Separator, Stack, Text, XStack, YStack } from 'tamagui';

type Circle = 'outer' | 'middle' | 'inner';

export default function DetailsScreen() {
  const { data, isLoading, error } = useGetHabitStats({ days: 7 });

  const ranked = data?.ranked ?? [];
  const topByCircle = data?.topByCircle ?? {};
  const daysSinceByHabit = data?.daysSinceByHabit ?? {};

  const topOuter = topByCircle.outer;
  const topMiddle = topByCircle.middle;
  const topInner = topByCircle.inner;

  const outerToRevive = useMemo(() => {
    const outerRows = ranked.filter(r => r.habit.category === 'outer');
    if (outerRows.length === 0) return null;
    const best = outerRows
      .map(r => ({
        row: r,
        days: daysSinceByHabit[r.habit.id] ?? Number.POSITIVE_INFINITY,
      }))
      .sort((a, b) => b.days - a.days || a.row.habit.name.localeCompare(b.row.habit.name))[0];
    return best;
  }, [ranked, daysSinceByHabit]);

  const innerBest = useMemo(() => {
    const innerRows = ranked.filter(r => r.habit.category === 'inner');
    if (innerRows.length === 0) return null;
    const best = innerRows
      .map(r => ({
        row: r,
        days: daysSinceByHabit[r.habit.id] ?? Number.POSITIVE_INFINITY,
      }))
      .sort((a, b) => b.days - a.days || a.row.habit.name.localeCompare(b.row.habit.name))[0];
    return best;
  }, [ranked, daysSinceByHabit]);

  const middleMost = useMemo(() => {
    return (
      ranked
        .filter(r => r.habit.category === 'middle')
        .sort((a, b) => b.count - a.count || a.habit.name.localeCompare(b.habit.name))[0] ?? null
    );
  }, [ranked]);

  if (isLoading) {
    return (
      <ScrollView>
        <YStack p='$4'>
          <Text>Loading…</Text>
        </YStack>
      </ScrollView>
    );
  }
  if (error || !data) {
    return (
      <ScrollView>
        <YStack p='$4'>
          <Text>Something went wrong.</Text>
        </YStack>
      </ScrollView>
    );
  }

  return (
    <ScrollView>
      <YStack p='$4' gap='$4'>
        <YStack gap='$1'>
          <H3>Details</H3>
          <Paragraph theme='alt2'>Last 7 days overview</Paragraph>
        </YStack>

        <XStack gap='$3' f={1} $gtSm={{ flexDirection: 'row' }} flexWrap='wrap'>
          <Tile
            title='Top Outer'
            subtitle='Most completed (good)'
            value={topOuter ? `${topOuter.habit.name} · ${topOuter.count}` : '—'}
            icon={<TrendingUp />}
          />
          <Tile
            title='Top Middle'
            subtitle='Most recurring (caution)'
            value={topMiddle ? `${topMiddle.habit.name} · ${topMiddle.count}` : '—'}
            icon={<AlertTriangle color='$color' />}
          />
          <Tile
            title='Top Inner'
            subtitle='Most recurring (avoid)'
            value={topInner ? `${topInner.habit.name} · ${topInner.count}` : '—'}
            icon={<Flame color='$color' />}
          />
        </XStack>

        <Separator />

        <YStack gap='$2'>
          <Text fontWeight='700'>Activity · Last 7 days</Text>
          <YStack bg='$background' br='$4' p='$3' borderWidth={1} borderColor='$borderColor' gap='$2'>
            {ranked
              .filter(({ count }) => count > 0)
              .map(({ habit, count }) => (
                <XStack
                  key={habit.id}
                  jc='space-between'
                  ai='center'
                  py='$2'
                  borderBottomWidth={1}
                  borderColor='$backgroundHover'>
                  <Text>{habit.name}</Text>
                  <XStack ai='center' gap='$2'>
                    <Badge tone={habit.category as Circle} />
                    <Text fontWeight='700'>{count}</Text>
                  </XStack>
                </XStack>
              ))}
          </YStack>
        </YStack>

        <Separator />

        {/* Insights */}
        <YStack gap='$2'>
          <Text fontWeight='700'>Insights</Text>
          <YStack gap='$2'>
            {outerToRevive && (
              <Insight
                icon={<CheckCircle2 color='$color' />}
                title={`Get back to: ${outerToRevive.row.habit.name}`}
                desc={
                  outerToRevive.days === Number.POSITIVE_INFINITY
                    ? `Haven't logged this yet. Today could be day 1.`
                    : `It’s been ${outerToRevive.days} day${
                        outerToRevive.days === 1 ? '' : 's'
                      } since you last did this.`
                }
              />
            )}
            {innerBest && (
              <Insight
                icon={<Flame color='$color' />}
                title={`Avoid streak: ${innerBest.row.habit.name}`}
                desc={
                  innerBest.days === Number.POSITIVE_INFINITY
                    ? `You haven’t logged this inner-circle habit—nice!`
                    : `Congrats! ${innerBest.days} day${innerBest.days === 1 ? '' : 's'} since last time.`
                }
              />
            )}
            {middleMost && (
              <Insight
                icon={<AlertTriangle color='$color' />}
                title={`Caution: ${middleMost.habit.name}`}
                desc={`Occurred ${middleMost.count} time${middleMost.count === 1 ? '' : 's'} this week.`}
              />
            )}
          </YStack>
        </YStack>

        <YStack h='$6' />
      </YStack>
    </ScrollView>
  );
}

/* --- UI bits (unchanged) --- */
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
    <YStack f={1} minWidth={260} bg='$background' br='$4' p='$3' borderWidth={1} borderColor='$borderColor' gap='$1'>
      <XStack ai='center' gap='$2'>
        <Stack>{icon}</Stack>
        <Text fontWeight='700'>{title}</Text>
      </XStack>
      <Paragraph theme='alt2'>{subtitle}</Paragraph>
      <Text fontSize='$7' mt='$2' fontWeight='800'>
        {value}
      </Text>
    </YStack>
  );
}

function Badge({ tone }: { tone: Circle }) {
  const map: Record<Circle, { label: string; bg: string; fg: string }> = {
    outer: { label: 'Outer', bg: '#3b82f620', fg: '#3b82f6' },
    middle: { label: 'Middle', bg: '#f59e0b20', fg: '#f59e0b' },
    inner: { label: 'Inner', bg: '#ef444420', fg: '#ef4444' },
  };
  const { label, bg, fg } = map[tone];
  return (
    <XStack px='$2' py='$1' br='$3' bg={bg} borderWidth={1} borderColor={`${fg}55`}>
      <Text color={fg} fontSize='$2' fontWeight='700'>
        {label}
      </Text>
    </XStack>
  );
}

function Insight({ icon, title, desc }: { icon?: React.ReactNode; title: string; desc: string }) {
  return (
    <XStack ai='center' gap='$3' bg='$background' br='$4' p='$3' borderWidth={1} borderColor='$borderColor'>
      <Stack>{icon}</Stack>
      <YStack f={1}>
        <Text fontWeight='700'>{title}</Text>
        <Paragraph theme='alt2'>{desc}</Paragraph>
      </YStack>
    </XStack>
  );
}
