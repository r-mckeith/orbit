import React from 'react';
import { YStack, Text } from 'tamagui';

export default function SectionHeader({ title }: { title: string; }) {
  return (
    <YStack width='100%' pb='$4' backgroundColor='$backgroundStrong'>
      <Text fontSize='$6' fontWeight='700' color='$gray10' textAlign='center'>
        {title}
      </Text>
    </YStack>
  );
}
