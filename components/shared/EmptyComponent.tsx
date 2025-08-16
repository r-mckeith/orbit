import FullScreenSpinner from 'components/shared/FullScreenSpinner';
import React from 'react';
import { Image } from 'react-native';
import { Paragraph, Text, YStack } from 'tamagui';

export default function EmptyComponent({ loading, message, footer, uri }: { loading: boolean; message: string; footer?: string; uri?: string }) {
  if (loading) {
    return <FullScreenSpinner />;
  }

  return (
    <YStack ai='center' jc='center' padding='$5' flex={1}>
      {uri && (
        <Image
          source={{
            uri: uri,
          }}
          style={{ width: 350, height: 250, borderRadius: 8, marginBottom: 20 }}
        />
      )}
      <Paragraph fontSize='$5' fontWeight='700' color='$gray10'>
        {message}
      </Paragraph>
      {footer && (
        <Text position='absolute' textAlign='center' bottom={0} color='$gray10' fontSize='$3' fontWeight='500'>
          {footer}
        </Text>
      )}
    </YStack>
  );
}
