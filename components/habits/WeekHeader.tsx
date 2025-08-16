import React from 'react';
import { Pressable } from 'react-native';
import { YStack, XStack, Text, Separator } from 'tamagui';
import { startOfWeek, subWeeks, isSameWeek, startOfDay } from 'date-fns';
import { useHabitContext } from 'src/contexts/HabitContext';
import { ArrowLeft, ArrowRight } from '@tamagui/lucide-icons';

export default function SimpleWeekToggle() {
  const { selectedWeekStart, setSelectedWeekStart } = useHabitContext();

  const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const lastWeekStart = subWeeks(currentWeekStart, 1);

  const isThisWeek = isSameWeek(selectedWeekStart, currentWeekStart, { weekStartsOn: 1 });

  const handleSelect = (weekStart: Date) => {
    setSelectedWeekStart(startOfDay(weekStart));
  };

  return (
    <YStack bc='$backgroundStrong'>
      {isThisWeek && (
        <XStack jc='center' gap='$2' ai='center'>
          <Pressable onPress={() => handleSelect(lastWeekStart)}>
            <ArrowLeft size='$1' />
          </Pressable>
          <Separator vertical borderColor='$borderColor' bw={2} height='100%' />
          <Text fontSize='$5' fontWeight='700'>
            This Week
          </Text>
        </XStack>
      )}
      {!isThisWeek && (
        <XStack jc='center' gap='$2' ai='center'>
          <Text fontSize='$5' fontWeight='700'>
            Last Week
          </Text>
          <Separator vertical borderColor='$borderColor' bw={2} height='100%' />

          <Pressable onPress={() => handleSelect(currentWeekStart)}>
            <ArrowRight size='$1' />
          </Pressable>
        </XStack>
      )}
    </YStack>
  );
}
