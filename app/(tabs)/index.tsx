import { useGetHabitStreaks, useGetHabitWeeklyStreaks } from '@api/habits/useGetHabitStreaks';
import { useGetHabitsWithData } from '@api/habits/useGetHabitsWithData';
import { AddHabitModal } from '@components/habits/AddHabit';
import HabitCard from '@components/habits/HabitCard';
import { HabitFilterButton, HabitFilterModal } from '@components/habits/HabitFilterMenu';
import EmptyComponent from '@components/shared/EmptyComponent';
import ScreenLayout from '@components/shared/ScreenLayout';
import SectionHeader from '@components/shared/SectionHeader';
import { useHabitContext } from '@src/contexts/HabitContext';
import { HabitWithData } from '@src/types';
import { addDays, format, startOfDay, startOfWeek } from 'date-fns';
import { chunk } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SectionList } from 'react-native';
import { XStack, YStack } from 'tamagui';

export default function Habits() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<HabitWithData | undefined>(undefined);

  const listRef = useRef<SectionList>(null);

  const handleEditHabit = (habit: HabitWithData) => {
    setSelectedHabit(habit);
    setShowAddModal(true);
  };

  const { selectedWeekStart, selectedSections, viewMode, showArchived, showDueToday, showWatchlist } =
    useHabitContext();

  const weekView = viewMode === 'week';
  const weekStart = startOfWeek(selectedWeekStart, { weekStartsOn: 1 });
  const weekEnd = addDays(weekStart, 6);

  const { data: habitsWithData = [], isLoading: habitsLoading } = useGetHabitsWithData(weekStart, weekEnd);
  const { data: streaks = [], isLoading: streaksLoading } = useGetHabitStreaks();
  const { data: weeklyStreaks = [], isLoading: weeklyStreaksLoading } = useGetHabitWeeklyStreaks();

  const streakMap = useMemo(() => {
    return new Map(streaks.map((s: { habit_id: number; streak: number }) => [s.habit_id, `${s.streak}-DAY STREAK`]));
  }, [streaks]);

  const weekStreakMap = useMemo(() => {
    return new Map(weeklyStreaks.map((s: { habit_id: number; week_streak: number }) => [s.habit_id, `${s.week_streak}-WEEK STREAK`]));
  }, [weeklyStreaks]);

  const sections = useMemo(() => {
    if (habitsLoading) return [];

    const todayISO = format(startOfDay(new Date()), 'yyyy-MM-dd');

    let filteredHabits: HabitWithData[] = [...habitsWithData];

    if (showDueToday) {
      filteredHabits = filteredHabits.filter(habit => 
        habit.data?.some((d: { date: string; due_today: boolean }) => d.date === todayISO && d.due_today)
      );
    }

    if (showWatchlist) {
      filteredHabits = filteredHabits.filter(habit => habit.watchlist === true);
    }

    const activeHabits = filteredHabits.filter(habit => !habit.archived);
    const archivedHabits = filteredHabits.filter(habit => habit.archived);

    const activeSections = selectedSections.map(section => ({
      title: section,
      data: activeHabits.filter(habit => habit.section === section),
    }));

    const allSections = [...activeSections];

    if (showArchived && archivedHabits.length > 0) {
      allSections.push({ title: 'archived', data: archivedHabits });
    }

    return allSections.filter(section => section.data.length > 0);
  }, [habitsWithData, habitsLoading, selectedSections, showArchived, showDueToday, showWatchlist, weekView]);

  const formattedSections = useMemo(() => {
    return sections.map(section => ({
      title: section.title,
      data: chunk(section.data, 2),
    }));
  }, [sections]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (listRef.current && sections.length > 0 && sections[0].data.length > 0) {
        listRef.current.scrollToLocation({
          sectionIndex: 0,
          itemIndex: 0,
          animated: true,
        });
      }
    }, 50);

    return () => clearTimeout(timeout);
  }, [viewMode]);

  const renderHabitItem = useCallback(
    ({ item }: { item: HabitWithData | HabitWithData[] }) => {
      if (Array.isArray(item)) {
        return (
          <XStack px='$2' gap='$2' mb='$2' jc='space-between'>
            {item.map(habit => {
              const streak = habit.timeframe === 'week' ? weekStreakMap.get(habit.id) : streakMap.get(habit.id);

              return (
                <YStack key={habit.id} flex={1}>
                  <HabitCard habit={habit} streak={streak} onPress={handleEditHabit} />
                </YStack>
              );
            })}
            {item.length === 1 && <YStack flex={1} />}
          </XStack>
        );
      }

      const habit = item;
      const streak = habit.timeframe === 'week' ? weekStreakMap.get(habit.id) : streakMap.get(habit.id);

      return <HabitCard habit={habit} streak={streak} onPress={handleEditHabit} />;
    },
    [streakMap, weekStreakMap, handleEditHabit]
  );

  const renderEmptyComponent = useCallback(() => {
    return (
      <EmptyComponent
        loading={habitsLoading}
        message={habitsWithData.length === 0 ? 'No habits found' : 'Please adjust your filters to see results.'}
        uri='https://y.yarn.co/d43e9bf4-9a05-421f-a93e-086e06e3f346_text.gif'
      />
    );
  }, [habitsLoading, streaksLoading, weeklyStreaksLoading, habitsWithData]);

  return (
    <>
      <ScreenLayout title='Circles' showAddButton={true} onPress={() => setShowAddModal(true)}>
        <HabitFilterButton showModal={showFilterModal} setShowModal={setShowFilterModal} />
        <SectionList
          ref={listRef}
          sections={viewMode === 'day' ? formattedSections : sections}
          keyExtractor={(item, index) => (viewMode === 'day' ? `section-${index}` : item.name + index)}
          contentContainerStyle={{ paddingBottom: 90 }}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={16}
          renderItem={({ item }) => renderHabitItem({ item })}
          renderSectionHeader={({ section }) =>
            section.data.length === 0 ? null : <SectionHeader title={section.title.toUpperCase()} />
          }
          ListEmptyComponent={renderEmptyComponent}
        />
      </ScreenLayout>
      <HabitFilterModal showModal={showFilterModal} setShowModal={setShowFilterModal} />
      <AddHabitModal
        show={showAddModal}
        habit={selectedHabit}
        onClose={() => {
          setShowAddModal(false);
          setSelectedHabit(undefined);
        }}
      />
    </>
  );
}
