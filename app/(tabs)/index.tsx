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

const HabitPillComponent = ({ habit }: { habit: Habit }) => {
  const [isSelected, setIsSelected] = useState(false);
  const color = getDefaultColorForCategory(habit.category, isSelected);
  
  return (
    <HabitPill 
      key={habit.id}
      onPress={() => setIsSelected(!isSelected)}
      style={{
        backgroundColor: isSelected ? `${color}20` : '#E0E0E0',
        borderWidth: 1,
        borderColor: isSelected ? `${color}40` : '#333',
      }}
    >
      <HabitPillText style={{ 
        color: isSelected ? color : '#333',
        opacity: isSelected ? 1 : 0.9
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

const HabitCategoryCard = ({ category }: { category: HabitCategory }) => {
  return (
    <CategoryCard key={category.id}>
      <YStack gap={8}>
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
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [categories, setCategories] = useState<HabitCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch habits from Supabase
  const fetchHabits = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('habits')
        .select('*')
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      // Transform the data into the format expected by the UI
      const habitsByCategory = (data as SupabaseHabit[]).reduce((acc, habit) => {
        if (!acc[habit.category]) {
          acc[habit.category] = [];
        }
        acc[habit.category].push({
          id: habit.id,
          name: habit.name,
          category: habit.category,
          // frequency: habit.frequency,
          color: habit.color
        });
        return acc;
      }, {} as Record<string, Habit[]>);

      // Define category titles and ensure they match the HabitCategory type
      type CategoryId = 'outer' | 'middle' | 'inner';
      const categoryTitles: Record<CategoryId, string> = {
        outer: 'Outer Circle',
        middle: 'Middle Circle',
        inner: 'Inner Circle'
      };

      // Initialize all categories with empty habits array
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
      const { data, error } = await supabase
        .from('habits')
        .insert([
          {
            name: newHabit.name,
            category: newHabit.category,
            // frequency: newHabit.frequency,
            color: newHabit.color,
            user_id: (await supabase.auth.getSession()).data.session?.user.id
          }
        ])
        .select();

      if (error) throw error;
      
      // Refresh the habits list
      fetchHabits();
      return true;
    } catch (err) {
      console.error('Error adding habit:', err);
      Alert.alert('Error', 'Failed to add habit. Please try again.');
      return false;
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
                <HabitCategoryCard key={category.id} category={category} />
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
