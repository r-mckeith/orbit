import React, { useState, useCallback } from 'react';
import { startOfDay, parseISO, isAfter, isBefore } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { HabitWithData } from 'src/types';
import { useEditHabitData } from 'src/api/habits/useEditHabitData';
import { Text, Spinner, Button } from 'tamagui';
import EditHabitData from '../habits/EditHabitData';

type TrackerCellProps = {
  habit: HabitWithData;
  date: string;
  count: number;
  target_met: boolean | null;
  due_today: boolean;
  isLoading?: boolean;
  size: number;
};

export default React.memo(function TrackerCell({
  habit,
  date,
  count,
  target_met,
  due_today,
  isLoading,
  size,
}: TrackerCellProps) {
  const { mutate: editHabitData } = useEditHabitData();
  const [editDataModal, setEditDataModal] = useState(false);
  const [dateSelected, setDateSelected] = useState<Date | null>(null);
  const [countSelected, setCountSelected] = useState<number>(0);

  const parsedDate = startOfDay(parseISO(date));
  const isFuture = isAfter(parsedDate, new Date());

  const habitCreated = startOfDay(new Date(habit.created));
  const isPast = isBefore(parsedDate, habitCreated);

  const selectDate = useCallback(() => {
    if (!date) return;
    setDateSelected(startOfDay(parsedDate));
    setCountSelected(count || 0);
    setEditDataModal(true);
  }, [date, count]);

  const handleLongPress = useCallback(() => {
    if (!date) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    editHabitData({
      habit,
      selectedDate: parsedDate,
      difference: 1,
    });
  }, [editHabitData, habit, date]);

  const getStatusColor = () => {
    if (isFuture || (isPast && !count)) {
      return '$gray6';
    }

    // Inner and Middle Circle Logic
    if (habit.section === 'inner') {
      return count > 0 ? '$red10' : '$green10';
    }

    if (habit.section === 'middle') {
      return count > 0 ? '$yellow10' : '$green10';
    }

    // Targeted Habit Logic (custom)
    if (habit.target && habit.timeframe === 'custom') {
      if (due_today && target_met) return '$green10';
      if (due_today && count > 0) return '$yellow10';
      if (due_today && count === 0) return '$red10';
      if (!due_today && count > 0) return '$green10';
      return '$gray8';
    }

    // Targeted Habit Logic (e.g. Outer)
    if (habit.target && due_today) {
      if (target_met) return '$green10';
      if (count > 0) return '$yellow10'; // Attempt made
      return '$red10'; // Missed target
    }

    // Fallback for untargeted habits
    return count > 0 ? '$green10' : '$gray10';
  };

  const borderColor = getStatusColor();

  return (
    <>
      <Button
        width={size}
        height={size}
        br={size / 2}
        p={0}
        borderColor={borderColor}
        bw={2}
        onPress={selectDate}
        onLongPress={handleLongPress}
        disabled={isFuture}
        bc={isFuture ? '$placeholderColor' : undefined}>
        {isLoading ? (
          <Spinner color='$placeholderColor' />
        ) : isFuture || (isPast && !count) ? null : (
          <Text fontWeight='bold' fontSize={size / 2}>
            {count}
          </Text>
        )}
      </Button>

      {dateSelected && (
        <EditHabitData
          habit={habit}
          open={editDataModal}
          setOpen={setEditDataModal}
          selectedDate={dateSelected}
          initialCount={countSelected}
        />
      )}
    </>
  );
});
