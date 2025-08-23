import { Plus } from '@tamagui/lucide-icons';
import { useRef, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, H2, Text, XStack, YStack, styled } from 'tamagui';
import { AddHabitModal, HabitCategoryCard } from '../../components/habits';
import { useAddHabit, useHabitCategories, useHabits } from '../../hooks/useHabits';
import { useToggleHabitData } from '../../src/api/habits/useToggleHabitData';
import { Habit } from '../../types/habits';

// Styled components for the main layout
const ScreenContainer = styled(SafeAreaView, {
  flex: 1,
  backgroundColor: '$background',
});

const ContentContainer = styled(YStack, {
  padding: 16,
  space: 16,
});

export default function HomeScreen() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const { data: habits = [], isLoading, error } = useHabits();

  const { data: categories = [] } = useHabitCategories(habits);

  const { mutate: toggleHabit } = useToggleHabitData();

  // Mutation for adding a new habit
  const addHabitMutation = useAddHabit();

  // Handle modal close
  const handleModalClose = () => {
    setIsAddModalVisible(false);
  };

  // Handle adding a new habit
  const handleAddHabit = async (newHabit: Omit<Habit, 'id' | 'created_at' | 'user_id'>) => {
    try {
      await addHabitMutation.mutateAsync(newHabit);
      setIsAddModalVisible(false);
    } catch (err) {
      console.error('Error adding habit:', err);
      Alert.alert('Error', 'Failed to add habit');
    }
  };
  function handleToggleHabit(habitId: string) {
    toggleHabit({ habitId });
  }

  return (
    <ScreenContainer>
      <ScrollView ref={scrollViewRef} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <ContentContainer>
          <XStack justifyContent='space-between' alignItems='center' marginBottom='$4'>
            <H2>Circles</H2>
            <Button
              circular
              size='$4'
              icon={<Plus size={'$7'} strokeWidth={3} />}
              onPress={() => setIsAddModalVisible(true)}
              backgroundColor='$blue10'
              color='white'
            />
          </XStack>

          {isLoading ? (
            <YStack flex={1} justifyContent='center' alignItems='center' paddingVertical='$8'>
              <Text>Loading habits...</Text>
            </YStack>
          ) : error ? (
            <YStack flex={1} justifyContent='center' alignItems='center' space='$2' paddingVertical='$8'>
              <Text color='$red10'>Failed to load habits</Text>
              <Button onPress={() => window.location.reload()}>
                <Text>Retry</Text>
              </Button>
            </YStack>
          ) : categories.length === 0 ? (
            <YStack flex={1} justifyContent='center' alignItems='center' space='$4' paddingVertical='$8'>
              <Text>No habits found.</Text>
              <Button onPress={() => setIsAddModalVisible(true)}>
                <Text>Add Your First Habit</Text>
              </Button>
            </YStack>
          ) : (
            <YStack gap={16}>
              {categories.map(category => (
                <HabitCategoryCard key={category.id} category={category} onToggleHabit={handleToggleHabit} />
              ))}
            </YStack>
          )}
        </ContentContainer>
      </ScrollView>

      <AddHabitModal visible={isAddModalVisible} onClose={handleModalClose} onAddHabit={handleAddHabit} />
    </ScreenContainer>
  );
}
