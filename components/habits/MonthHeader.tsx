import React from 'react';
import { Pressable } from 'react-native';
import { YStack, XStack, Text, useTheme } from 'tamagui';
import { startOfMonth, subMonths, isSameMonth } from 'date-fns';

type MonthHeaderProps = {
  selectedMonthStart: Date;
  setSelectedMonthStart: (date: Date) => void;
};

export default function MonthHeader({ selectedMonthStart, setSelectedMonthStart }: MonthHeaderProps) {
  const theme = useTheme();

  const currentMonthStart = startOfMonth(new Date());
  const lastMonthStart = subMonths(currentMonthStart, 1);
  const isThisMonth = isSameMonth(selectedMonthStart, currentMonthStart);

  const handleSelect = (monthStart: Date) => {
    setSelectedMonthStart(monthStart);
  };

  return (
    <YStack bc="$backgroundStrong" p="$3">
      <XStack jc="center" gap="$4">
        <Pressable onPress={() => handleSelect(lastMonthStart)}>
          <Text
            fontSize="$6"
            fontWeight="700"
            color={isThisMonth ? theme.gray10.val : theme.color.val}>
            Last Month
          </Text>
        </Pressable>
        <Pressable onPress={() => handleSelect(currentMonthStart)}>
          <Text
            fontSize="$6"
            fontWeight="700"
            color={isThisMonth ? theme.color.val : theme.gray10.val}>
            This Month
          </Text>
        </Pressable>
      </XStack>
    </YStack>
  );
}