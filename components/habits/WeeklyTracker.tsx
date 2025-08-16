import React from 'react';
import { HabitWithData } from 'src/types';
import { YStack, XStack, Text } from 'tamagui';
import TrackerCell from './TrackerCell';

type WeeklyTracker = {
  habit: HabitWithData;
};

const WeeklyTracker = React.memo(({ habit }: WeeklyTracker) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <YStack gap='$2'>
      <XStack jc='space-between'>
        {days.map(day => (
          <XStack key={day} width={30} ai='center' jc='center'>
            <Text fontWeight='700' fontSize={12} color='$gray10'>
              {day}
            </Text>
          </XStack>
        ))}
      </XStack>

      <XStack jc='space-between'>
        {habit.data.map(({ date, count, target_met, due_today }) => (
          <TrackerCell
            key={date}
            habit={habit}
            date={date}
            count={count}
            target_met={target_met}
            due_today={due_today}
            size={30}
          />
        ))}
      </XStack>
    </YStack>
  );
});

export default WeeklyTracker;
