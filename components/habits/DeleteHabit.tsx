import { AlertDialog, Button, Text, XStack, YStack } from 'tamagui';
import { HabitWithData } from '@src/types';

type DeleteHabit = {
  habit: HabitWithData;
  deleteHabit: any;
};

export function DeleteHabit({ habit, deleteHabit }: DeleteHabit) {
  function handleDelete() {
    setTimeout(() => {
      deleteHabit(habit.id);
    }, 0);
  }

  return (
    <AlertDialog native>
      <AlertDialog.Trigger asChild>
        <Button backgroundColor='#EF4444' width='40%'>
          <Text>Delete</Text>
        </Button>
      </AlertDialog.Trigger>

      <AlertDialog.Portal>
        <AlertDialog.Overlay
          key='overlay'
          animation='quick'
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />
        <AlertDialog.Content
          bordered
          elevate
          key='content'
          animation={[
            'quick',
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          x={0}
          scale={1}
          opacity={1}
          y={0}>
          <YStack>
            <AlertDialog.Title>{`Confirm Delete?`}</AlertDialog.Title>
            <AlertDialog.Description>{`You will lose any data associated with ${habit.name}. This cannot be undone.`}</AlertDialog.Description>

            <XStack gap='$3' justifyContent='flex-end'>
              <AlertDialog.Cancel asChild>Cancel</AlertDialog.Cancel>
              <AlertDialog.Action asChild onPress={handleDelete}>
                Delete
              </AlertDialog.Action>
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
