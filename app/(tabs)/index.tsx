import { Plus } from '@tamagui/lucide-icons';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, H2, H4, Input, Text, View, XStack, YStack, styled } from 'tamagui';

import { supabase } from '@/lib/supabase';
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

interface HabitPillComponentProps {
  habit: Habit;
  onToggleHabit: (habitId: string, isSelected: boolean) => Promise<void>;
}

const HabitPillComponent = ({ 
  habit, 
  onToggleHabit
}: HabitPillComponentProps) => {
  const [isToggling, setIsToggling] = useState(false);
  const color = getDefaultColorForCategory(habit.category, habit.isSelected);
  
  const toggleHabitSelection = async () => {
    if (isToggling) return; // Prevent double-taps
    
    setIsToggling(true);
    
    try {
      // The optimistic update is handled by the parent component
      // No need to fetch habits again as we're updating optimistically
      await onToggleHabit(habit.id, !habit.isSelected);
    } catch (err) {
      console.error('Error toggling habit selection:', err);
      Alert.alert('Error', 'Failed to update habit tracking');
    } finally {
      setIsToggling(false);
    }
  };
  
  return (
    <HabitPill 
      key={habit.id}
      onPress={toggleHabitSelection}
      style={{
        backgroundColor: habit.isSelected ? `${color}20` : '#f1f1f1',
        borderWidth: 1,
        borderColor: habit.isSelected ? `${color}40` : '#e0e0e0',
      }}
    >
      <HabitPillText style={{ 
        color: habit.isSelected ? color : '#333',
        opacity: habit.isSelected ? 1 : 0.9
      }}>
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

interface HabitCategoryCardProps {
  category: HabitCategory;
  onToggleHabit: (habitId: string, isSelected: boolean) => Promise<void>;
}

const HabitCategoryCard = ({ 
  category, 
  onToggleHabit 
}: HabitCategoryCardProps) => {
  return (
    <CategoryCard key={category.id}>
      <YStack gap={8}>
        <CategoryTitle>{category.title}</CategoryTitle>
        <HabitPillsContainer>
          {category.habits.map(habit => (
            <HabitPillComponent 
              key={habit.id} 
              habit={habit} 
              onToggleHabit={onToggleHabit}
            />
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
      // frequency: 'Daily', // Default frequency, can be made configurable later
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
              size='$4'
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
              size='$4'
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
const getDefaultColorForCategory = (category: HabitCategory['id'], isSelected: boolean = false): string => {
  // Return neutral color if not selected
  if (!isSelected) return '#BDBDBD';
  
  // Return category-specific color when selected
  switch (category) {
    case 'outer': return '#3b82f6';  // blue-500
    case 'middle': return '#f59e0b'; // yellow-500
    case 'inner': return '#ef4444';  // red-500
    default: return '#9E9E9E';
  }
};

// Define the structure for the habit data from Supabase
interface SupabaseHabit {
  id: string;
  name: string;
  category: 'outer' | 'middle' | 'inner';
  // frequency: string;
  color: string;
  created_at: string;
  user_id: string;
}

export default function HomeScreen() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [categories, setCategories] = useState<HabitCategory[]>([]);
  
  // Function to handle toggling a habit's selection state
  const handleToggleHabit = async (habitId: string, isSelected: boolean): Promise<void> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const today = new Date().toISOString().split('T')[0];
    
    if (isSelected) {
      // Add a new habit_data entry
      const { error: insertError } = await supabase
        .from('habit_data')
        .insert([{ 
          habit_id: habitId,
          user_id: session.user.id,
          date: today
        }]);
      
      if (insertError) throw insertError;
    } else {
      // Remove the habit_data entry
      const { error: deleteError } = await supabase
        .from('habit_data')
        .delete()
        .eq('habit_id', habitId)
        .eq('date', today);
        
      if (deleteError) throw deleteError;
    }
    
    // Update local state
    setCategories(prevCategories => 
      prevCategories.map(category => ({
        ...category,
        habits: category.habits.map(habit => 
          habit.id === habitId ? { ...habit, isSelected } : habit
        )
      }))
    );
    
    // No return value needed as we're using Promise<void>
  };
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const fetchHabits = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Get the current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Fetch all habits for the user
      const { data: habitsData, error: habitsError } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (habitsError) throw habitsError;

      // Fetch today's completed habits
      const { data: completedHabits, error: completedError } = await supabase
        .from('habit_data')
        .select('habit_id')
        .eq('date', today)
        .eq('user_id', session.user.id);

      if (completedError) throw completedError;

      // Create a set of completed habit IDs for quick lookup
      const completedHabitIds = new Set(completedHabits?.map(h => h.habit_id) || []);

      // Transform the data into the format expected by the UI
      const habitsByCategory = (habitsData || []).reduce<Record<string, Habit[]>>((acc, habit) => {
        if (!acc[habit.category]) {
          acc[habit.category] = [];
        }
        acc[habit.category].push({
          id: habit.id,
          name: habit.name,
          category: habit.category,
          color: habit.color,
          isSelected: completedHabitIds.has(habit.id)
        });
        return acc;
      }, {});

      // Define category titles and ensure they match the HabitCategory type
      type CategoryId = 'outer' | 'middle' | 'inner';
      const categoryTitles: Record<CategoryId, string> = {
        outer: 'Outer Circle',
        middle: 'Middle Circle',
        inner: 'Inner Circle'
      };

      // Initialize all categories with their habits
      const loadedCategories: HabitCategory[] = (['outer', 'middle', 'inner'] as const)
        .map((id) => ({
          id,
          title: categoryTitles[id],
          habits: habitsByCategory[id] || []
        }));

      setCategories(loadedCategories);
    } catch (err) {
      console.error('Error fetching habits:', err);
      setError('Failed to load habits. Please try again.');
      throw err; // Re-throw the error so callers can handle it
    } finally {
      setIsLoading(false);
    }
  };

  // Load habits when component mounts
  useEffect(() => {
    fetchHabits();
  }, []);

  // Refresh habits when the modal is closed
  const handleModalClose = () => {
    setIsAddModalVisible(false);
    fetchHabits();
  };

  const handleAddHabit = async (newHabit: Omit<Habit, 'id'>) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'You must be logged in to add habits');
        return;
      }

      // Ensure all required fields are present
      const habitToAdd = {
        name: newHabit.name,
        category: newHabit.category,
        color: newHabit.color,
        user_id: session.user.id,
      };

      const { data, error } = await supabase
        .from('habits')
        .insert([habitToAdd])
        .select();

      if (error) throw error;

      // Refresh the habits list
      fetchHabits();
    } catch (err) {
      console.error('Error adding habit:', err);
      Alert.alert('Error', 'Failed to add habit');
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
            <Title>Circles</Title>
            <Button 
              circular 
              size="$4" 
              icon={<Plus size="$lg" />} 
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
              <Text color="$red10">{error}</Text>
              <Button onPress={fetchHabits}>
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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
