import React from 'react';
import { Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { YStack, XStack, Text, Separator, useTheme, ThemeableStack, AnimatePresence } from 'tamagui';
import { HabitStackParamsList, HabitWithData } from 'src/types';
import { ChevronRight } from '@tamagui/lucide-icons';
import WeeklyTracker from './WeeklyTracker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useHabitContext } from 'src/contexts/HabitContext';
import { calculateDailyTarget } from 'src/utils';
import TrackerCell from './TrackerCell';
import { isSameDay, startOfDay, parseISO, differenceInDays } from 'date-fns';
import CustomCard from '../shared/CustomCard';

type HabitScreenNavigationProp = StackNavigationProp<HabitStackParamsList, 'HabitMain'>;

export default React.memo(function HabitCard({
  habit,
  streak,
  onPress,
}: {
  habit: HabitWithData;
  streak: string | undefined;
  onPress: (habit: HabitWithData) => void;
}) {
  const navigation = useNavigation<HabitScreenNavigationProp>();
  const { viewMode } = useHabitContext();
  const theme = useTheme();

  const handlePressDetails = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('HabitDetails', { id: habit.id });
  };

  const weekCount = habit.data.reduce((sum, day) => sum + (day.count || 0), 0);
  const currentData = habit.data.find(day => isSameDay(startOfDay(parseISO(day.date)), new Date()));

  const { section } = habit;
  const highlightColor =
    section === 'outer' ? theme.green10.val : section === 'middle' ? theme.yellow10.val : theme.red10.val;

  const highlightText =
    habit.last_recorded !== null
      ? isSameDay(parseISO(habit.last_recorded.toString()), new Date())
        ? 'TODAY'
        : isSameDay(parseISO(habit.last_recorded.toString()), new Date().setDate(new Date().getDate() - 1))
        ? 'YESTERDAY'
        : `${differenceInDays(new Date(), habit.last_recorded)} DAYS AGO`
      : 'NEVER';

  return (
    <Pressable onLongPress={() => onPress(habit)} delayLongPress={300}>
      <CustomCard height={viewMode === 'day' ? 190 : undefined}>
        <Pressable onPress={viewMode === 'list' ? () => onPress(habit) : handlePressDetails}>
          <YStack position='absolute' width={3} />
          <YStack gap='$1' mb={viewMode === 'list' ? undefined : '$2'} py={viewMode === 'list' ? '$2' : undefined}>
            <XStack jc='space-between' ai='center'>
              <Text fontSize='$6' fontWeight='900' color={highlightColor} numberOfLines={1} ellipsizeMode='tail'>
                {habit.name}
              </Text>
              {viewMode !== 'list' && <ChevronRight size='$1' color='$gray10' />}
            </XStack>
            {viewMode === 'list' && habit.description && (
              <Text fontSize='$3' color='$gray10' fontWeight='600' numberOfLines={1} ellipsizeMode='tail'>
                {habit.description}
              </Text>
            )}
            {viewMode !== 'list' && (
              <Text fontSize='$3' color='$gray10' fontWeight='600' numberOfLines={1} ellipsizeMode='tail'>
                {calculateDailyTarget(habit)}
              </Text>
            )}
          </YStack>
        </Pressable>
        {viewMode !== 'list' && <Separator borderColor='$gray6' mb='$3' />}

        {/* Weekly Tracker */}
        {viewMode === 'week' && (
          <YStack flex={1} justifyContent='center' mb='$3'>
            <AnimatePresence>
              <WeeklyTracker habit={habit} />
            </AnimatePresence>
          </YStack>
        )}

        {/* Progress */}
        <YStack width='100%' gap='$2'>
          <XStack width='100%' justifyContent='space-between' alignItems='center'>
            {viewMode === 'day' && (
              <YStack>
                <Text fontSize='$4' color='$gray9' fontWeight='600'>
                  Last Recorded
                </Text>
                <Text fontSize='$4' fontWeight='600'>
                  {highlightText}
                </Text>
              </YStack>
            )}

            {viewMode === 'week' && (
              <XStack ai='center' jc='space-between'>
                <XStack gap='$2' jc='flex-start'>
                  <Text fontSize='$4' color='$gray9' fontWeight='600'>
                    Last Recorded:
                  </Text>
                  <Text fontSize='$4' fontWeight='600'>
                    {highlightText}
                  </Text>
                </XStack>
              </XStack>
            )}
            {viewMode === 'week' && streak !== undefined && streak !== '' && (
              <XStack ai='center' justifyContent='flex-end'>
                <Text fontSize='$4' color='$green10' fontWeight='600'>
                  {streak}
                </Text>
              </XStack>
            )}

            {viewMode === 'day' && (
              <AnimatePresence>
                <XStack alignItems='flex-end' justifyContent='flex-end' width={50}>
                  <TrackerCell
                    habit={habit}
                    date={currentData?.date || startOfDay(new Date()).toISOString()}
                    count={currentData?.count || 0}
                    target_met={currentData?.target_met || null}
                    due_today={currentData?.due_today || false}
                    size={40}
                  />
                </XStack>
              </AnimatePresence>
            )}
          </XStack>
          {viewMode === 'day' && (
            <YStack width='100%' justifyContent='flex-start'>
              <Text fontSize='$4' color='$gray9' fontWeight='600'>
                Completed
              </Text>
              <Text fontSize='$4' fontWeight='600'>
                {weekCount === 1 ? '1 TIME THIS WEEK' : `${weekCount} TIMES THIS WEEK`}
              </Text>
            </YStack>
          )}

          {viewMode === 'day' && <XStack width='100%' justifyContent='space-between'></XStack>}
        </YStack>

        {viewMode === 'day' && streak !== undefined && streak !== '' && (
          <XStack ai='center' justifyContent='center'>
            <Text fontSize='$4' color='$green10' fontWeight='600'>
              {streak}
            </Text>
          </XStack>
        )}
      </CustomCard>
    </Pressable>
  );
});
