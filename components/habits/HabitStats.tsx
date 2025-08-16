import React from 'react';
import { TrendingUp, CalendarCheck, PercentCircle, Flame, X } from '@tamagui/lucide-icons';
import { XStack, YStack, Spinner, Text } from 'tamagui';
import { startOfMonth } from 'node_modules/date-fns/startOfMonth';
import { useGetMonthlyHabitStats } from 'src/api/habits/useGetHabitStats';
import FullScreenSpinner from '../shared/FullScreenSpinner';

export default function HabitStats({ habitId }: { habitId: number }) {
  const { data: habitStats, isLoading } = useGetMonthlyHabitStats(startOfMonth(new Date()), habitId);

  if (isLoading || !habitStats) {
    return <FullScreenSpinner />;
  }

  return (
    <XStack gap='$3' px='$3' pt='$3' flexWrap='wrap' jc='space-between'>
      <YStack w='47%' p='$3' br='$4' backgroundColor='$backgroundStrong' ai='center' gap='$2'>
        <XStack ai='center' gap='$2'>
          <PercentCircle size='$1.5' />
          <Text fontWeight='700'>{Math.ceil(habitStats.completion_rate)}%</Text>
        </XStack>
        <Text color='$gray10' fontSize='$2'>
          Completion
        </Text>
      </YStack>

      <YStack w='47%' p='$3' br='$4' backgroundColor='$backgroundStrong' ai='center' gap='$2'>
        <XStack ai='center' gap='$2'>
          <CalendarCheck size='$1.5' />
          <Text fontWeight='700'>{habitStats.days_logged}</Text>
        </XStack>
        <Text color='$gray10' fontSize='$2'>
          Days Logged
        </Text>
      </YStack>

      <YStack w='47%' p='$3' br='$4' backgroundColor='$backgroundStrong' ai='center' gap='$2'>
        <XStack ai='center' gap='$2'>
          <TrendingUp size='$1.5' />
          <Text fontWeight='700'>{habitStats.percent_change ? `${habitStats.percent_change} %` : 'No change'}</Text>
        </XStack>
        <Text color='$gray10' fontSize='$2'>
          This Month
        </Text>
      </YStack>

      <YStack w='47%' p='$3' br='$4' backgroundColor='$backgroundStrong' ai='center' gap='$2'>
        <XStack ai='center' gap='$1'>
          <Flame size='$1.5' />
          <Text fontWeight='700'>{habitStats.current_streak > 0 ? habitStats.current_streak : 0}d</Text>
        </XStack>
        <Text color='$gray10' fontSize='$2'>
          Current Streak
        </Text>
      </YStack>
      <YStack w='47%' p='$3' br='$4' backgroundColor='$backgroundStrong' ai='center' gap='$2'>
        <XStack ai='center' gap='$2'>
          <Flame color='$orange10' size='$1.5' />
          <Text fontWeight='700'>{habitStats.longest_streak}d</Text>
        </XStack>
        <Text color='$gray10' fontSize='$2'>
          Longest Streak
        </Text>
      </YStack>

      <YStack w='47%' p='$3' br='$4' backgroundColor='$backgroundStrong' ai='center' gap='$2'>
        <XStack ai='center' gap='$2'>
          <X color='$red10' size='$1.5' />
          <Text fontWeight='700'>{habitStats.missed_days}</Text>
        </XStack>
        <Text color='$gray10' fontSize='$2'>
          Missed Days
        </Text>
      </YStack>
    </XStack>
  );
}
