// width="100%" $gtSm={{ width: '50%' }}


import HabitData from '@/screens/HabitData';
import Habits from '@/screens/Habits';
import { YStack } from 'tamagui';
export default function HomeScreen() {
  return (
    <YStack f={1} flexDirection="row">
      {/* Always render both, but control with media */}
      <YStack f={1} width="100%" $gtSm={{ width: '50%' }}>
        <Habits />
      </YStack>

      {/* Sidebar: hide on mobile, show on larger */}
      <YStack display="none" $gtSm={{ display: 'flex', width: '50%' }}>
        <HabitData />
      </YStack>
    </YStack>
  );
}