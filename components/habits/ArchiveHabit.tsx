import { AlertDialog, Button, Text, XStack, YStack } from 'tamagui';
import { HabitWithData } from '@src/types';

type ArchiveHabit = {
  habit: HabitWithData;
  archiveHabit: any;
};

export function ArchiveHabit({ habit, archiveHabit }: ArchiveHabit) {
  const unarchiveDescription = `${habit.name} will be moved back to your ${habit.section} circle.`;
  const archiveDescription = `You will still be able to find ${habit.name} under archived habits on your home screen and you will not lose any data.`;

  function handleArchive() {
    setTimeout(() => {
      archiveHabit({
        habitId: habit.id,
        name: habit.name,
        description: habit.description,
        section: habit.section,
        target: habit.target,
        timeframe: habit.timeframe, 
        schedule: habit.schedule,
        archived: !habit.archived,
        target_met: habit.target_met,
        watchlist: habit.watchlist,
      });
    }, 500);
  }

  return (
    <AlertDialog native>
      <AlertDialog.Trigger asChild>
        <Button backgroundColor='#F59E0B' width='40%'>
          <Text>{habit.archived ? 'Unarchive' : 'Archive'}</Text>
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
            <AlertDialog.Title>{`Confirm ${habit.archived ? 'unarchive' : 'archive'}?`}</AlertDialog.Title>
            <AlertDialog.Description>
              {habit.archived ? unarchiveDescription : archiveDescription}
            </AlertDialog.Description>

            <XStack gap='$3' justifyContent='flex-end'>
              <AlertDialog.Cancel asChild>Cancel</AlertDialog.Cancel>
              <AlertDialog.Action asChild onPress={handleArchive}>
                {habit.archived ? 'Unarchive' : 'Archive'}
              </AlertDialog.Action>
            </XStack>
          </YStack>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog>
  );
}
