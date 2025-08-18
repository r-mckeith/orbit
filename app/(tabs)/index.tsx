<<<<<<< HEAD
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
=======
import { Plus } from '@tamagui/lucide-icons';
import { useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, H2, H4, Input, Text, View, XStack, YStack, styled } from 'tamagui';

import { habitCategories } from '@/data/habits';
import { Habit, HabitCategory } from '@/types/habits';

// Styled component for habit pills
const HabitPill = styled(View, {
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  marginRight: 8,
  marginBottom: 8,
  alignSelf: 'flex-start',
  maxWidth: '100%',
});

const HabitPillText = styled(Text, {
  fontWeight: '600',
  fontSize: 14,
  numberOfLines: 1,
  ellipsizeMode: 'tail',
});

const HabitPillComponent = ({ habit }: { habit: Habit }) => {
  return (
    <HabitPill 
      key={habit.id} 
      style={{
        backgroundColor: `${habit.color}20`,
        borderWidth: 1,
        borderColor: `${habit.color}40`,
      }}
    >
      <HabitPillText style={{ color: habit.color }}>
        {habit.name}
      </HabitPillText>
    </HabitPill>
  );
};

// Styled component for category cards
const CategoryCard = styled(Card, {
  marginBottom: 16,
  padding: 16,
  borderRadius: 8,
  backgroundColor: '$backgroundHover',
  borderWidth: 1,
  borderColor: '$borderColor',
});

const CategoryTitle = styled(H4, {
  color: '$color',
  fontWeight: '600',
  marginBottom: 4,
});

const CategoryDescription = styled(Text, {
  color: '$colorHover',
  fontSize: 14,
  opacity: 0.8,
});

const HabitPillsContainer = styled(XStack, {
  flexWrap: 'wrap',
  marginTop: 12,
  paddingBottom: 4,
});

const HabitCategoryCard = ({ category }: { category: HabitCategory }) => {
  return (
    <CategoryCard key={category.id}>
      <YStack space={8}>
        <CategoryTitle>{category.title}</CategoryTitle>
        
        <HabitPillsContainer>
          {category.habits.map(habit => (
            <HabitPillComponent key={habit.id} habit={habit} />
          ))}
        </HabitPillsContainer>
      </YStack>
    </CategoryCard>
  );
};

// Styled components for the main layout
const ScreenContainer = styled(SafeAreaView, {
  flex: 1,
  backgroundColor: '$background',
});

const ContentContainer = styled(YStack, {
  padding: 16,
  space: 16,
});

const HeaderContainer = styled(YStack, {
  space: 8,
  paddingBottom: 8,
});

const Title = styled(H2, {
  color: '$color',
  fontWeight: '700',
});

const AddHabitModal = ({ visible, onClose, onAddHabit }: { 
  visible: boolean; 
  onClose: () => void;
  onAddHabit: (habit: Omit<Habit, 'id'>) => void;
}) => {
  const [habitName, setHabitName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory['id']>('outer');

  const handleSubmit = () => {
    if (!habitName.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }
    
    onAddHabit({
      name: habitName.trim(),
      category: selectedCategory,
      frequency: 'Daily', // Default frequency, can be made configurable later
      color: getDefaultColorForCategory(selectedCategory)
    });
    
    setHabitName('');
    setSelectedCategory('outer');
    onClose();
  };

  return (
    <View 
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor="$background"
      justifyContent="center"
      alignItems="center"
      padding={32}
      display={visible ? 'flex' : 'none'}
    >
      <Card 
        width="100%" 
        maxWidth={500}
        backgroundColor="$background"
        borderWidth={1}
        borderColor="$borderColor"
        elevation={0}
        marginHorizontal={16}
      >
        <YStack paddingHorizontal={20} paddingVertical={20} gap={24}>
          <YStack gap={8}>
            <H2 fontSize={24} fontWeight="600">New Habit</H2>
          </YStack>

          <YStack gap={24}>
            <YStack gap={8}>
              <Input
                id="habitName"
                placeholder="e.g., Drink 8 glasses of water"
                value={habitName}
                onChangeText={setHabitName}
                autoFocus
                fontSize={18}
                height={56}
                paddingHorizontal={16}
                borderWidth={2}
                borderColor="$borderColor"
                backgroundColor="$backgroundHover"
                color="$color"
                placeholderTextColor="$colorHover"
                borderRadius={12}
                width="100%"
              />
            </YStack>
            
            <YStack gap={10}>              
              {/* Outer Button - Full Width */}
              <Button
                width="100%"
                height={44}
                borderRadius={10}
                onPress={() => setSelectedCategory('outer')}
                backgroundColor={
                  selectedCategory === 'outer' 
                    ? getDefaultColorForCategory('outer') + '20' 
                    : '$backgroundHover'
                }
                borderWidth={1.5}
                borderColor={
                  selectedCategory === 'outer' 
                    ? getDefaultColorForCategory('outer')
                    : '$borderColor'
                }
                paddingHorizontal={12}
                alignItems="center"
                justifyContent="center"
              >
                <Text 
                  fontSize={14}
                  fontWeight={selectedCategory === 'outer' ? '600' : '500'}
                  color={selectedCategory === 'outer' 
                    ? getDefaultColorForCategory('outer')
                    : '$color'}
                >
                  Outer
                </Text>
              </Button>
              
              {/* Middle and Inner Buttons - Side by Side */}
              <XStack gap={10} width="100%">
                {(['middle', 'inner'] as const).map((category) => (
                  <Button
                    key={category}
                    flex={1}
                    height={44}
                    borderRadius={10}
                    onPress={() => setSelectedCategory(category)}
                    backgroundColor={
                      selectedCategory === category 
                        ? getDefaultColorForCategory(category) + '20' 
                        : '$backgroundHover'
                    }
                    borderWidth={1.5}
                    borderColor={
                      selectedCategory === category 
                        ? getDefaultColorForCategory(category)
                        : '$borderColor'
                    }
                    paddingHorizontal={12}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text 
                      fontSize={14}
                      fontWeight={selectedCategory === category ? '600' : '500'}
                      color={selectedCategory === category 
                        ? getDefaultColorForCategory(category)
                        : '$color'}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </Text>
                  </Button>
                ))}
              </XStack>
            </YStack>
          </YStack>

          <XStack 
            gap={12}
            justifyContent="flex-end"
            paddingTop={16}
          >
            <Button 
              size="large"
              onPress={onClose}
              backgroundColor="$backgroundHover"
              borderWidth={0}
              paddingHorizontal={20}
              height={48}
              borderRadius={12}
            >
              <Text fontSize={16} fontWeight="500">Cancel</Text>
            </Button>
            <Button 
              size="large"
              onPress={handleSubmit}
              backgroundColor={getDefaultColorForCategory(selectedCategory)}
              borderWidth={0}
              paddingHorizontal={24}
              height={48}
              borderRadius={12}
              disabled={!habitName.trim()}
              opacity={!habitName.trim() ? 0.5 : 1}
            >
              <Text fontSize={16} fontWeight="600" color="white">
                Add Habit
              </Text>
            </Button>
          </XStack>
        </YStack>
      </Card>
    </View>
  );
};

// Helper function to get default colors for categories
const getDefaultColorForCategory = (category: HabitCategory['id']): string => {
  switch (category) {
    case 'outer': return '#4CAF50';
    case 'middle': return '#9E9E9E';
    case 'inner': return '#F44336';
    default: return '#4CAF50';
  }
};

export default function HomeScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [categories, setCategories] = useState(habitCategories);

  const handleAddHabit = (newHabit: Omit<Habit, 'id'>) => {
    // In a real app, you would add this to your state management
    const newCategories = categories.map(category => {
      if (category.id === newHabit.category) {
        return {
          ...category,
          habits: [
            ...category.habits,
            {
              ...newHabit,
              id: Date.now().toString(), // Simple ID generation
            }
          ]
        };
      }
      return category;
    });
    
    setCategories(newCategories);
  };

  return (
    <ScreenContainer>
      <ScrollView 
        ref={scrollViewRef} 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ContentContainer>
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
            <Title>Circles</Title>
            <Button 
              circular 
              size="$4" 
              icon={<Plus size="$1" />} 
              onPress={() => setIsAddModalVisible(true)}
              backgroundColor="$blue10"
              color="white"
            />
          </XStack>
          
          <YStack space={16}>
            {categories.map(category => (
              <HabitCategoryCard key={category.id} category={category} />
            ))}
          </YStack>
        </ContentContainer>
      </ScrollView>
      
      <AddHabitModal 
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAddHabit={handleAddHabit}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
>>>>>>> restored-basic-ui
