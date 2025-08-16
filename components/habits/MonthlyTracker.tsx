import React, { useMemo } from 'react';
import { FlatList } from 'react-native';
import { startOfMonth, getDay, getDaysInMonth, addDays, parseISO, isSameDay } from 'date-fns';
import { HabitWithData } from 'src/types';
import { YStack, XStack, Text } from 'tamagui';
import TrackerCell from './TrackerCell';

type MonthlyTrackerProps = {
  habit: HabitWithData;
  isLoading: boolean;
};

const CELL_SIZE = 36;

export default React.memo(function MonthlyTracker({ habit, isLoading }: MonthlyTrackerProps) {
  const formattedMonthData = useMemo(() => {
    const monthlyData = habit.data;
    const referenceDate = monthlyData.length > 0 ? parseISO(monthlyData[0].date) : new Date();
    const startOfMonthDate = startOfMonth(referenceDate);
    const daysInCurrentMonth = getDaysInMonth(startOfMonthDate);
    const startDayIndex = (getDay(startOfMonthDate) + 6) % 7;

    const emptyDays = Array.from({ length: startDayIndex }, (_, i) => ({
      date: addDays(startOfMonthDate, i - startDayIndex).toISOString(),
      isPlaceholder: true,
      count: 0,
      target_met: false,
      due_today: false,
    }));

    const daysArray = Array.from({ length: daysInCurrentMonth }, (_, i) => {
      const currentDate = addDays(startOfMonthDate, i);
      const habitEntry = monthlyData?.find(hd => hd.date && isSameDay(parseISO(hd.date), currentDate));

      return {
        date: currentDate.toISOString(),
        count: habitEntry?.count ?? 0,
        target_met: habitEntry?.target_met ?? false,
        due_today: habitEntry?.due_today ?? false,
        isPlaceholder: false,
      };
    });

    const totalDays = emptyDays.length + daysArray.length;
    const remainingDays = (7 - (totalDays % 7)) % 7;
    const nextMonthDate = addDays(startOfMonthDate, daysInCurrentMonth);

    const endPlaceholders = Array.from({ length: remainingDays }, (_, i) => ({
      date: addDays(nextMonthDate, i).toISOString(),
      isPlaceholder: true,
      count: 0,
      target_met: false,
      due_today: false,
    }));

    return [...emptyDays, ...daysArray, ...endPlaceholders];
  }, [habit]);

  return (
    <YStack ai='center' jc='center'>
      <FlatList
        data={formattedMonthData}
        numColumns={7}
        keyExtractor={(item, index) => `${item.date}-${index}`}
        scrollEnabled={false}
        initialNumToRender={7}
        windowSize={2}
        getItemLayout={(_, index) => ({ length: 50, offset: 50 * index, index })}
        columnWrapperStyle={{ justifyContent: 'space-around' }}
        ListHeaderComponent={() => (
          <XStack jc='space-between' px='$3' pt='$3'>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
              <XStack key={day} width={CELL_SIZE} ai='center' jc='center'>
                <Text fontWeight='bold' fontSize={12} color='$gray10'>
                  {day}
                </Text>
              </XStack>
            ))}
          </XStack>
        )}
        renderItem={({ item }) => {
          const { date, count, target_met, due_today } = item;
          return (
            <XStack my='$2' px='$2'>
              {item.isPlaceholder ? (
                <YStack width={CELL_SIZE} height={CELL_SIZE} />
              ) : (
                <TrackerCell
                  habit={habit}
                  date={date}
                  count={count}
                  target_met={target_met}
                  due_today={due_today}
                  isLoading={isLoading}
                  size={CELL_SIZE}
                />
              )}
            </XStack>
          );
        }}
      />
    </YStack>
  );
});
