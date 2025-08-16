import React from 'react';
import { Text } from 'tamagui';
import { differenceInDays } from 'node_modules/date-fns/differenceInDays';
import { useGetSettings } from 'src/api/settings/useGetSettings';

export default function DayCount() {
  const { data: settings = [] } = useGetSettings();

  const sobrietyDate = settings[0]?.sobriety_date ? new Date(settings[0].sobriety_date) : new Date();
  const daysSince = differenceInDays(new Date(), sobrietyDate);

  const text = `You have ${daysSince} ${daysSince === 1 ? 'day' : 'days'} sober`;

  return (
    <Text color='white' fontSize='$8' fontWeight='bold'>
      {daysSince > 0 ? text : ''}
    </Text>
  );
}
