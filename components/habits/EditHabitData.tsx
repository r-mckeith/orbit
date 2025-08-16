import { Button, Sheet, XStack, YStack, Text, Paragraph } from 'tamagui';
import React, { useEffect, useState } from 'react';
import { HabitWithData } from '@src/types';
import { Check, Minus, Plus } from '@tamagui/lucide-icons';
import { calculateDailyTarget, formatDayRelative } from 'src/utils';
import { useEditHabitData } from 'src/api/habits/useEditHabitData';

type EditHabitDataProps = {
  habit: HabitWithData;
  selectedDate: Date;
  initialCount: number;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function EditHabitData({ habit, selectedDate, initialCount, open, setOpen }: EditHabitDataProps) {
  const [dayCount, setDayCount] = useState<number>(initialCount);
  const { mutate: editHabitData } = useEditHabitData();

  useEffect(() => {
    if (open) {
      setDayCount(initialCount);
    }
  }, [initialCount, open]);

  function incrementDayCount() {
    setDayCount(prev => prev + 1);
  }

  function decrementDayCount() {
    if (dayCount > 0) {
      setDayCount(prev => prev - 1);
    }
  }

  function handleSave() {
    setOpen(false);

    editHabitData({
      habit: habit,
      selectedDate: selectedDate,
      difference: dayCount - initialCount,
    });
  }

  function handleClose() {
    setOpen(!open);
    setDayCount(initialCount);
  }

  return (
    <Sheet modal open={open} onOpenChange={setOpen} dismissOnSnapToBottom>
      <Sheet.Overlay animation='quick' enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} opacity={0.5} />

      <Sheet.Frame
        justifyContent='center'
        alignSelf='center'
        maxHeight='40%'
        width='80%'
        borderRadius='$4'
        padding='$4'
        backgroundColor='$background'
        elevation='$4'>
        <YStack gap='$4' alignItems='center'>
          <Text fontSize='$6' fontWeight='bold'>
            {habit.name}
          </Text>
          <Paragraph color='$gray10'>{formatDayRelative(selectedDate)[0]}</Paragraph>

          <XStack ai='center' jc='space-around' gap='$4'>
            <Button chromeless onPress={decrementDayCount} disabled={dayCount <= 0}>
              <Minus size='$2' color={dayCount <= 0 ? '$gray10' : undefined} />
            </Button>

            <Text fontSize='$10' fontWeight='bold' minWidth={40} textAlign='center'>
              {dayCount}
            </Text>

            <Button chromeless onPress={incrementDayCount}>
              <Plus size='$2' />
            </Button>
          </XStack>
          <Text>{calculateDailyTarget(habit)}</Text>

          <XStack gap='$4' jc='center'>
            <Button size='$3' variant='outlined' onPress={handleClose}>
              Cancel
            </Button>

            <Button
              size='$3'
              icon={Check}
              backgroundColor={dayCount === initialCount ? '$gray6' : '$blue9'}
              disabled={dayCount === initialCount}
              onPress={handleSave}>
              Save
            </Button>
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
