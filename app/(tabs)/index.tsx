import { AddHabitModal, HabitCategoryCard } from '@/components/habits';
import { useAddHabit } from '@/src/api/habits/useAddHabit';
import { useGetHabits } from '@/src/api/habits/useGetHabits';
import { useToggleHabitData } from '@/src/api/habits/useToggleHabitData';
import { Habit } from '@/types/habits';
import { Plus } from '@tamagui/lucide-icons';
import { useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, H2, Spinner, Text, XStack, YStack } from 'tamagui';

export default function HomeScreen() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { mutate: addHabit } = useAddHabit();
  const { mutate: toggleHabit } = useToggleHabitData();

  const { data: habits = [], isLoading, error } = useGetHabits();

  const CATEGORY_IDS = ['outer', 'middle', 'inner'] as const;

  function buildSections(habits: Habit[] = []) {
    return CATEGORY_IDS.map(id => {
      const title = id === 'inner' ? 'Inner Circle' : id === 'middle' ? 'Middle Circle' : 'Outer Circle';

      return {
        id,
        title,
        habits: habits.filter(h => h.category === id),
      };
    });
  }

  const sections = buildSections(habits);

  function handleAddHabit(newHabit: Omit<Habit, 'id' | 'created_at' | 'user_id'>) {
    addHabit(newHabit);
  }

  function handleToggleHabit(habitId: string) {
    toggleHabit({ habitId });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '$background' }}>
      <YStack padding={16} gap={10}>
        <XStack justifyContent='space-between' alignItems='center' marginBottom='$4'>
          <H2>Circles</H2>
          <Button
            circular
            size='$3'
            icon={<Plus size={'$2'} strokeWidth={3} />}
            onPress={() => setIsAddModalVisible(true)}
            backgroundColor='$blue10'
            color='white'
          />
        </XStack>
        <ScrollView ref={scrollViewRef} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <YStack flex={1} justifyContent='center' alignItems='center' paddingVertical='$8' gap='$10'>
              <Spinner />
              <Text>Loading habits...</Text>
            </YStack>
          ) : error ? (
            <YStack flex={1} justifyContent='center' alignItems='center' gap='$2' paddingVertical='$8'>
              <Text color='$red10'>Failed to load habits</Text>
              <Button onPress={() => window.location.reload()}>
                <Text>Retry</Text>
              </Button>
            </YStack>
          ) : habits.length === 0 ? (
            <YStack flex={1} justifyContent='center' alignItems='center' space='$4' paddingVertical='$8'>
              <Text>No habits found.</Text>
              <Button onPress={() => setIsAddModalVisible(true)}>
                <Text>Add Your First Habit</Text>
              </Button>
            </YStack>
          ) : (
            <YStack gap={10}>
              {sections.map(section => (
                <HabitCategoryCard key={section.id} category={section} onToggleHabit={handleToggleHabit} />
              ))}
            </YStack>
          )}
        </ScrollView>
      </YStack>

      <AddHabitModal visible={isAddModalVisible} onClose={() => setIsAddModalVisible(false)} onAddHabit={handleAddHabit} />
    </SafeAreaView>
  );
}
