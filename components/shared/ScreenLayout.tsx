import React from 'react';
import { Button, YStack, Text, XStack } from 'tamagui';
import { Plus } from '@tamagui/lucide-icons';

type ScreenLayoutProps = {
  title: string;
  children: React.ReactNode;
  showAddButton?: boolean;
  onPress?: () => void;
  subHeader?: React.ReactNode;
};

export default function ScreenLayout({ title, children, showAddButton, onPress, subHeader }: ScreenLayoutProps) {
  return (
    <YStack flex={1} backgroundColor='$backgroundStrong' gap='$3'>
      <YStack backgroundColor='$backgroundStrong' zIndex={3} position='relative' px='$4' gap='$2'>
        <XStack jc='space-between' pb='$2'>
          <Text fontSize='$9' fontWeight='800' marginBottom='$2'>
            {title}
          </Text>

          {showAddButton && (
            <Button circular size='$4' onPress={onPress} backgroundColor='$blue8'>
              <Plus size='$1' strokeWidth={3} />
            </Button>
          )}
        </XStack>

        {subHeader}
      </YStack>
      <YStack flex={1} gap='$3' px='$2'>
        {children}
      </YStack>
    </YStack>
  );
}