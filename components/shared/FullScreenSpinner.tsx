import React from 'react';
import { Spinner, YStack } from 'tamagui';

export default function FullScreenSpinner() {
  return (
    <YStack flex={1} backgroundColor='$backgroundStrong' jc='center' ai='center'>
      <Spinner />
    </YStack>
  );
}
