import { Plus } from '@tamagui/lucide-icons';
import { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, H2, H4, Input, Text, View, XStack, YStack, styled } from 'tamagui';

import { useAddHabit, useHabitCategories, useHabits } from '../../hooks/useHabits';
import { supabase } from '../../lib/supabase';
import { Habit, HabitCategory } from '../../types/habits';

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
      padding={Platform.select({ ios: 16, android: 32 })}
      display={visible ? 'flex' : 'none'}
    >
      <KeyboardAvoidingView 
        style={{ width: '100%', flex: 1, justifyContent: 'center' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <Card 
          width="100%" 
          maxWidth={500}
          backgroundColor="$background"
          borderWidth={1}
          borderColor="$borderColor"
          elevation={0}
          marginHorizontal={Platform.OS === 'ios' ? 0 : 16}
          alignSelf="center"
        >
        <YStack paddingHorizontal={20} paddingVertical={20} gap={24}>
          <YStack gap={8}>
            <H2 fontSize={24} fontWeight="600">New Habit</H2>
          </YStack>

          <YStack gap={24}>
            <YStack gap={8}>
              <Input
                id="habitName"
                placeholder=""
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
              {/* Outer Circle Button */}
              <Button
                width="100%"
                height={44}
                borderRadius={10}
                onPress={() => setSelectedCategory('outer')}
                backgroundColor={
                  selectedCategory === 'outer' 
                    ? `${getDefaultColorForCategory('outer', true)}20` 
                    : '$backgroundHover'
                }
                borderWidth={1.5}
                borderColor={
                  selectedCategory === 'outer' 
                    ? getDefaultColorForCategory('outer', true)
                    : '$borderColor'
                }
                paddingHorizontal={12}
                alignItems="center"
                justifyContent="center"
                pressStyle={{
                  backgroundColor: selectedCategory === 'outer' 
                    ? `${getDefaultColorForCategory('outer', true)}30` 
                    : '$backgroundHover'
                }}
              >
                <Text 
                  fontSize={14}
                  fontWeight={selectedCategory === 'outer' ? '600' : '500'}
                  color={
                    selectedCategory === 'outer' 
                      ? getDefaultColorForCategory('outer', true)
                      : '$color'
                  }
                >
                  Outer
                </Text>
              </Button>
              
              {/* Middle and Inner Circle Buttons */}
              <XStack gap={10} width="100%">
                {(['middle', 'inner'] as const).map((category) => {
                  const isSelected = selectedCategory === category;
                  const categoryColor = getDefaultColorForCategory(category, true);
                  
                  return (
                    <Button
                      key={category}
                      flex={1}
                      height={44}
                      borderRadius={10}
                      onPress={() => setSelectedCategory(category)}
                      backgroundColor={
                        isSelected 
                          ? `${categoryColor}20` 
                          : '$backgroundHover'
                      }
                      borderWidth={1.5}
                      borderColor={
                        isSelected 
                          ? categoryColor
                          : '$borderColor'
                      }
                      alignItems="center"
                      justifyContent="center"
                      pressStyle={{
                        backgroundColor: isSelected 
                          ? `${categoryColor}30` 
                          : '$backgroundHover'
                      }}
                    >
                      <Text 
                        fontSize={14}
                        fontWeight={isSelected ? '600' : '500'}
                        color={
                          isSelected 
                            ? categoryColor
                            : '$color'
                        }
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                    </Button>
                  );
                })}
              </XStack>
            </YStack>
          </YStack>

          <XStack 
            gap={12}
            justifyContent="space-between"
            paddingTop={16}
            width="100%"
          >
            <Button 
              onPress={onClose}
              paddingHorizontal={16}
              height={44}
              borderRadius={10}
              flex={1}
              alignItems="center"
              justifyContent="center"
              pressStyle={{
                backgroundColor: '$backgroundHover'
              }}
            >
              <Text fontSize={14} fontWeight="500" color="$color">
                Cancel
              </Text>
            </Button>
            <Button 
              onPress={handleSubmit}
              backgroundColor={`${getDefaultColorForCategory(selectedCategory, true)}20`}
              borderWidth={1.5}
              borderColor={getDefaultColorForCategory(selectedCategory, true)}
              paddingHorizontal={16}
              height={44}
              borderRadius={10}
              flex={1}
              alignItems="center"
              justifyContent="center"
              disabled={!habitName.trim()}
              opacity={!habitName.trim() ? 0.5 : 1}
              pressStyle={{
                backgroundColor: `${getDefaultColorForCategory(selectedCategory, true)}30`
              }}
            >
              <Text 
                fontSize={14} 
                fontWeight="600" 
                color={getDefaultColorForCategory(selectedCategory, true)}
              >
                Add Habit
              </Text>
            </Button>
          </XStack>
          </YStack>
        </Card>
      </KeyboardAvoidingView>
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
  color: string;
  created_at: string;
  user_id: string;
}

export default function HomeScreen() {
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [selectedHabits, setSelectedHabits] = useState<Record<string, boolean>>({});
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Get the current user session
  const [session, setSession] = useState<any>(null);
  const today = new Date().toISOString().split('T')[0];
  
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
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

  // Handle toggling a habit's selection state
  const handleToggleHabit = async (habitId: string, isSelected: boolean): Promise<void> => {
    if (!session) {
      throw new Error('Not authenticated');
    }

    try {
      if (isSelected) {
        // Add to habit_data
        const { error } = await supabase
          .from('habit_data')
          .insert([
            { 
              habit_id: habitId, 
              date: today,
              user_id: session.user.id 
            }
          ]);
        
        if (error) throw error;
      } else {
        // Remove from habit_data
        const { error } = await supabase
          .from('habit_data')
          .delete()
          .eq('habit_id', habitId)
          .eq('date', today)
          .eq('user_id', session.user.id);
        
        if (error) throw error;
      }
      
      // Update local state
      setSelectedHabits(prevSelectedHabits => ({
        ...prevSelectedHabits,
        [habitId]: isSelected
      }));
    } catch (err) {
      console.error('Error toggling habit:', err);
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
            <Title>Circles</Title>
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
