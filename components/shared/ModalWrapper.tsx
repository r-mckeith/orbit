import React from 'react';
import { YStack, ZStack, Text, useWindowDimensions } from 'tamagui';

export function ModalWrapper({
  title,
  show,
  onClose,
  children,
  fullscreen,
}: {
  title?: string;
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
  fullscreen?: boolean;
}) {
  if (!show) return null;
  const width = useWindowDimensions().width;

  return (
    <ZStack position='absolute' top={0} left={0} right={0} bottom={0} zIndex={200} pointerEvents='box-none'>
      {/* Overlay to detect click outside */}
      <YStack
        position='absolute'
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor='$backgroundStrong'
        opacity={0.98}
        pointerEvents='auto'
        onPress={onClose}
      />
      <YStack
        position='absolute'
        top={fullscreen ? 0 : '50%'}
        left={fullscreen ? 0 : '50%'}
        width={fullscreen ? width : width - 35}
        height={fullscreen ? '100%' : undefined}
        elevation='$3'
        pb={90}
        transform={fullscreen ? undefined : [{ translateX: '-50%' }, { translateY: '-50%' }]}
        pointerEvents='box-none'
        zIndex={201}>
        <YStack gap='$3' bc='$backgroundStrong' p='$3' borderRadius='$4' borderColor='$borderColor' borderWidth={1} flex={1}>
          {title && (
            <Text fontSize='$7' fontWeight='800' textAlign='center'>
              {title}
            </Text>
          )}
          {children}
        </YStack>
      </YStack>
    </ZStack>
  );
}
