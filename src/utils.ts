import { format, isToday, isYesterday } from 'date-fns';
import { HabitWithData, Schedule } from './types';

export function capitalizeFirstLetter(value: string | number): string {
  const str = value.toString();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatDayRelative(selectedDate: Date) {
  if (isToday(selectedDate)) {
    return ['Today'];
  }

  if (isYesterday(selectedDate)) {
    return ['Yesterday'];
  }

  return [format(selectedDate, 'MMM d, yyyy'), format(selectedDate, 'yyyy')];
}

const daysOfWeek: (keyof Schedule)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const shortDayMap: Record<keyof Schedule, string> = {
  monday: 'M',
  tuesday: 'T',
  wednesday: 'W',
  thursday: 'R',
  friday: 'F',
  saturday: 'S',
  sunday: 'U',
};

export function calculateDailyTarget(habit: HabitWithData): string {
  const { timeframe, target, schedule } = habit;

  if (!target || !timeframe) return 'No target';

  const timeText = target === 1 ? `${target} time /` : `${target} times /`;

  if (timeframe === 'custom' && schedule) {
    const selectedDays = daysOfWeek.filter(day => schedule[day]);
    const shortDays = selectedDays.map(day => shortDayMap[day]).join('');
    return `${timeText} ${shortDays}`;
  }

  return `${timeText} ${timeframe.toUpperCase()}`;
}
