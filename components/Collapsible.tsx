// components/Collapsible.tsx
import { ChevronDown, ChevronRight } from '@tamagui/lucide-icons';
import { useState } from 'react';
import { Text, XStack, YStack, type StackProps } from 'tamagui';

type CollapsibleProps = StackProps & {
  title: string;
  defaultOpen?: boolean;
};

export function Collapsible({
  title,
  defaultOpen = true,
  children,
  ...frameProps
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <YStack {...frameProps}>
      <XStack
        ai="center"
        gap="$2"
        onPress={() => setIsOpen((v) => !v)}
        pressStyle={{ opacity: 0.8 }}
        cursor="pointer"
      >
        {isOpen ? <ChevronDown /> : <ChevronRight />}
        <Text fontSize="$6" fontWeight="600">
          {title}
        </Text>
      </XStack>

      {isOpen && (
        <YStack mt="$2">
          {children}
        </YStack>
      )}
    </YStack>
  );
}