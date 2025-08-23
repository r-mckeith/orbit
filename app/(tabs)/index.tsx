import { Plus } from '@tamagui/lucide-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, H2, Text, XStack, YStack, styled } from 'tamagui';
import { AddHabitModal, HabitCategoryCard } from '../../components/habits';
import { HABITS_QUERY_KEY, useAddHabit, useHabitCategories, useHabits } from '../../hooks/useHabits';
import { supabase } from '../../lib/supabase';
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

interface Session {
  user: {
    id: string;
    // Add other user properties as needed
  };
  // Add other session properties as needed
}

export default function HomeScreen() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Get the current user session
  const [session, setSession] = useState<Session | null>(null);
  const today = new Date().toISOString().split('T')[0];
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session as Session | null);
    };
    
    getSession();
  }, []);
  
  // Fetch habits using TanStack Query
  const { data: habits = [], isLoading, error } = useHabits(session?.user?.id || '');
  
  // Get categories with their associated habits
  const { data: categories = [] } = useHabitCategories(habits);
  
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

  // Mutation for toggling habit selection with optimistic updates
  const toggleHabitMutation = useMutation({
    mutationFn: async ({ habitId, isSelected }: { habitId: string; isSelected: boolean }) => {
      console.log('mutationFn called', { habitId, isSelected });
      
      if (!session) {
        console.error('No session found');
        throw new Error('Not authenticated');
      }

      if (isSelected) {
        console.log('Adding habit to habit_data');
        // Add to habit_data
        const { data, error } = await supabase
          .from('habit_data')
          .insert([
            { 
              habit_id: habitId, 
              date: today,
              user_id: session.user.id 
            }
          ])
          .select();
        
        console.log('Insert result', { data, error });
        
        if (error && error.code !== '23505') { // Ignore duplicate key errors
          console.error('Error inserting habit data:', error);
          throw error;
        }
        console.log('Habit added successfully');
      } else {
        console.log('Removing habit from habit_data');
        // Remove from habit_data
        const { error, count } = await supabase
          .from('habit_data')
          .delete()
          .eq('habit_id', habitId)
          .eq('date', today)
          .eq('user_id', session.user.id);
        
        console.log('Delete result', { error, count });
        
        if (error) {
          console.error('Error deleting habit data:', error);
          throw error;
        }
        console.log('Habit removed successfully');
      }
      return { habitId, isSelected };
    },
    // Optimistic update
    onMutate: async ({ habitId, isSelected }) => {
      console.log('onMutate called', { habitId, isSelected });
      
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: [HABITS_QUERY_KEY, session?.user.id] });

      // Snapshot the previous value
      const previousHabits = queryClient.getQueryData<Habit[]>([HABITS_QUERY_KEY, session?.user.id]);
      console.log('Previous habits:', previousHabits);

      // Optimistically update to the new value
      if (previousHabits) {
        const updatedHabits = previousHabits.map(habit => 
          habit.id === habitId 
            ? { ...habit, isSelected } 
            : habit
        );
        
        console.log('Setting query data with updated habits:', updatedHabits);
        queryClient.setQueryData<Habit[]>([HABITS_QUERY_KEY, session?.user.id], updatedHabits);
      }

      // Return a context object with the snapshotted value
      return { previousHabits };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      console.error('Mutation failed, rolling back', err);
      if (context?.previousHabits) {
        queryClient.setQueryData([HABITS_QUERY_KEY], context.previousHabits);
      }
    },
    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [HABITS_QUERY_KEY] });
    },
  });

  // Handle toggling a habit's selection state
  const handleToggleHabit = async (habitId: string, isSelected: boolean): Promise<void> => {
    console.log('handleToggleHabit called', { habitId, isSelected });
    try {
      console.log('Calling toggleHabitMutation.mutateAsync');
      const result = await toggleHabitMutation.mutateAsync({ habitId, isSelected });
      console.log('toggleHabitMutation completed', { result });
    } catch (err) {
      console.error('Error in handleToggleHabit:', err);
      throw err;
    }
  };

  return (
    <ScreenContainer>
      <ScrollView 
        ref={scrollViewRef} 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <ContentContainer>
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
            <H2>Circles</H2>
            <Button 
              circular 
              size="$4" 
              icon={<Plus size={'$7'} strokeWidth={3} />} 
              onPress={() => setIsAddModalVisible(true)}
              backgroundColor="$blue10"
              color="white"
            />
          </XStack>
          
          {isLoading ? (
            <YStack flex={1} justifyContent="center" alignItems="center" paddingVertical="$8">
              <Text>Loading habits...</Text>
            </YStack>
          ) : error ? (
            <YStack flex={1} justifyContent="center" alignItems="center" space="$2" paddingVertical="$8">
              <Text color="$red10">Failed to load habits</Text>
              <Button onPress={() => window.location.reload()}>
                <Text>Retry</Text>
              </Button>
            </YStack>
          ) : categories.length === 0 ? (
            <YStack flex={1} justifyContent="center" alignItems="center" space="$4" paddingVertical="$8">
              <Text>No habits found.</Text>
              <Button onPress={() => setIsAddModalVisible(true)}>
                <Text>Add Your First Habit</Text>
              </Button>
            </YStack>
          ) : (
            <YStack gap={16}>
              {categories.map(category => (
                <HabitCategoryCard 
                  key={category.id} 
                  category={category}
                  onToggleHabit={handleToggleHabit}
                />
              ))}
            </YStack>
          )}
        </ContentContainer>
      </ScrollView>
      
      <AddHabitModal 
        visible={isAddModalVisible}
        onClose={handleModalClose}
        onAddHabit={handleAddHabit}
      />
    </ScreenContainer>
  );
}
