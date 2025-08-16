import React, { useState } from 'react';
import { Button, Text, YStack } from 'tamagui';

type CustomDropdownProps = {
  items: string[];
  selectedItem: string | null;
  setSelectedItem: (item: string) => void;
};

export default function CustomDropdown({ items, selectedItem, setSelectedItem }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <YStack>
      <Button
        size='$3'
        borderWidth={1}
        borderColor='$borderColor'
        borderRadius='$4'
        backgroundColor='$blue8'
        onPress={() => setIsOpen(!isOpen)}
        width={100}
        mr='$2'
        elevation='$1'
      >
        <Text fontSize='$5' color='$color' fontWeight='600'>
          {selectedItem || items[0]}
        </Text>
      </Button>
      {isOpen && (
        <YStack
          position='absolute'
          top='100%'
          left={0}
          right={0}
          width={100}
          backgroundColor='$background'
          borderWidth={1}
          borderColor='$borderColor'
          borderRadius='$4'
          zIndex={100}
          elevation='$2'
          shadowColor='$color'
          shadowOffset={{ width: 0, height: 2 }}
          shadowOpacity={0.1}
          shadowRadius={4}
        >
          {items.map((item) => (
            <Button
              key={item}
              size='$3'
              borderWidth={0}
              br={item === selectedItem ? '$4' : 0}
              backgroundColor={item === selectedItem ? '$blue8' : '$backgroundStrong'}
              onPress={() => {
                setSelectedItem(item);
                setIsOpen(false);
              }}
              width='100%'
              px='$4'
              py='$2'
              hoverStyle={{ backgroundColor: '$backgroundHover' }}
            >
              <Text fontSize='$5' color={item === selectedItem ? 'white' : '$gray10'} fontWeight='600'>
                {item}
              </Text>
            </Button>
          ))}
        </YStack>
      )}
    </YStack>
  );
}
