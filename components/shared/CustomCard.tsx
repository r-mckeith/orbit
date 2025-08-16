import React from 'react';
import { YStack } from 'tamagui';

export default function CustomCard({ children, height, onPress }: { children: React.ReactNode, height?: number, onPress?: () => void }) {
  return (
    <YStack
      onPress={onPress ? () => onPress() : undefined}
      backgroundColor='$backgroundStrong'
      borderRadius='$6'
      px='$4'
      py='$2'
      height={height ? height : undefined}
      marginBottom='$3'
      elevation='$2'
      borderWidth={1}
      borderColor='$borderColor'>
      {children}
    </YStack>
  );
}
