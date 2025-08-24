import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Card, H2, Input, Text, XStack, YStack } from 'tamagui';
import { Habit, HabitCategory } from '../../types/habits';

export default function AddHabitModal({
  visible,
  onClose,
  onAddHabit,
}: {
  visible: boolean;
  onClose: () => void;
  onAddHabit: (habit: Omit<Habit, 'id'>) => void;
}) {
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
      color: getDefaultColorForCategory(selectedCategory),
    });

    setHabitName('');
    setSelectedCategory('outer');
    onClose();
  };

  return (
    <YStack
      position='absolute'
      top={0}
      left={0}
      right={0}
      bottom={0}
      backgroundColor='$backgroundStrong'
      justifyContent='center'
      alignItems='center'
      padding={Platform.select({ ios: 16, android: 32 })}
      display={visible ? 'flex' : 'none'}>
      <KeyboardAvoidingView
        style={{ width: '100%', flex: 1, justifyContent: 'center' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <Card
          width='100%'
          maxWidth={500}
          backgroundColor='$background'
          borderWidth={1}
          borderColor='$borderColor'
          elevation={0}
          marginHorizontal={Platform.OS === 'ios' ? 0 : 16}
          alignSelf='center'>
          <YStack paddingHorizontal={20} paddingVertical={20} gap={24}>
            <YStack gap={8}>
              <H2 fontSize={24} fontWeight='600'>
                New
              </H2>
            </YStack>

            <YStack gap={24}>
              <YStack gap={8}>
                <Input
                  id='habitName'
                  placeholder=''
                  value={habitName}
                  onChangeText={setHabitName}
                  autoFocus
                  fontSize={18}
                  height={56}
                  paddingHorizontal={16}
                  borderWidth={2}
                  borderColor='$borderColor'
                  backgroundColor='$backgroundHover'
                  color='$color'
                  placeholderTextColor='$colorHover'
                  borderRadius={12}
                  width='100%'
                />
              </YStack>

              <XStack gap={10} width='100%'>
                {(['outer', 'middle', 'inner'] as const).map(category => {
                  const isSelected = selectedCategory === category;
                  const categoryColor = getDefaultColorForCategory(category, true);

                  return (
                    <Button
                      key={category}
                      flex={1}
                      height={44}
                      borderRadius={10}
                      onPress={() => setSelectedCategory(category)}
                      backgroundColor={isSelected ? `${categoryColor}20` : '$backgroundHover'}
                      borderWidth={1.5}
                      borderColor={isSelected ? categoryColor : '$borderColor'}
                      alignItems='center'
                      justifyContent='center'
                      pressStyle={{
                        backgroundColor: isSelected ? `${categoryColor}30` : '$backgroundHover',
                      }}>
                      <Text
                        fontSize={14}
                        fontWeight={isSelected ? '600' : '500'}
                        color={isSelected ? categoryColor : '$color'}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </Text>
                    </Button>
                  );
                })}
              </XStack>
            </YStack>

            <XStack gap={12} justifyContent='space-between' paddingTop={16} width='100%'>
              <Button
              chromeless
                onPress={onClose}
                paddingHorizontal={16}
                height={44}
                borderRadius={10}
                flex={1}
                alignItems='center'
                justifyContent='center'
                >
                <Text fontSize={14} fontWeight='500' color='$color'>
                  Cancel
                </Text>
              </Button>
              <Button
                onPress={handleSubmit}
                backgroundColor={'$backgroundHover'}
                borderWidth={1.5}
                paddingHorizontal={16}
                height={44}
                borderRadius={10}
                flex={1}
                alignItems='center'
                justifyContent='center'
                disabled={!habitName.trim()}
                opacity={!habitName.trim() ? 0.5 : 1}
                pressStyle={{
                  backgroundColor: '$backgroundHover'
                }}>
                <Text fontSize={14} fontWeight='600'>
                  Add
                </Text>
              </Button>
            </XStack>
          </YStack>
        </Card>
      </KeyboardAvoidingView>
    </YStack>
  );
}

const getDefaultColorForCategory = (category: HabitCategory['id'], isSelected: boolean = false): string => {
  if (!isSelected) return '#BDBDBD';

  switch (category) {
    case 'outer':
      return '#3b82f6';
    case 'middle':
      return '#f59e0b';
    case 'inner':
      return '#ef4444';
    default:
      return '#9E9E9E';
  }
};
