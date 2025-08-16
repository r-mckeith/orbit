import { Button, Input, Label, Paragraph, Sheet, Switch, TextArea, XStack, YStack } from 'tamagui';
import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Keyboard } from 'react-native';
import { HabitWithData, Schedule } from '@src/types';
import CustomDropdown from '../shared/CustomDropdown';
import { ChevronDown, Plus, X } from '@tamagui/lucide-icons';
import { Text } from 'tamagui';
import { useAddOrUpdateHabit } from '@src/api/habits/useAddOrUpdateHabit';
import { ArchiveHabit } from './ArchiveHabit';
import { DeleteHabit } from './DeleteHabit';
import { useDeleteHabit } from 'src/api/habits';
import { ModalWrapper } from '../shared/ModalWrapper';

export function AddHabitButton({ onPress }: { onPress: () => void }) {
  return (
    <Button circular size='$4' onPress={onPress} backgroundColor='$blue8'>
      <Plus size='$1' strokeWidth={3} />
    </Button>
  );
}

// used to add or edit a habit
// if we receive a habit that means we're editing

type AddHabit = {
  habit?: HabitWithData;
  show: boolean;
  onClose: () => void;
};

type DayOfWeek = keyof Schedule;

const defaultedSchedule = {
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  saturday: false,
  sunday: false,
};

const monToThurs: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday'];
const friToSun: DayOfWeek[] = ['friday', 'saturday', 'sunday'];
const daysOfWeek = [...monToThurs, ...friToSun];

export function AddHabitModal({ habit, show, onClose }: AddHabit) {
  const { mutate: saveHabit } = useAddOrUpdateHabit();
  const { mutate: deleteHabit } = useDeleteHabit();

  const defaultName = habit ? habit.name : '';
  const defaultHasDescription = habit?.description ? true : false;
  const defaultDescription = habit ? habit.description : '';
  const defaultSection = habit?.section || 'outer';
  const defaultHasTarget = habit ? !!habit.target : true;
  const defaultTarget = habit && habit.target ? habit.target : 1;
  const defaultTimeframe = habit && habit.timeframe ? habit.timeframe : 'day';
  const defaultSchedule = habit && habit.schedule ? habit.schedule : defaultedSchedule;
  const defaultWatchlist = habit && habit.watchlist ? habit.watchlist : false;
  const defaultBottom = habit && habit.bottom ? habit.bottom : false;
  const defaultBoundary = habit && habit.boundary ? habit.boundary : false;

  const habitSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    hasDescription: z.boolean().optional(),
    description: z.string().optional(),
    section: z.string(),
    hasTarget: z.boolean(),
    target: z.number().optional(),
    timeframe: z.string().optional(),
    schedule: z.object({
      monday: z.boolean(),
      tuesday: z.boolean(),
      wednesday: z.boolean(),
      thursday: z.boolean(),
      friday: z.boolean(),
      saturday: z.boolean(),
      sunday: z.boolean(),
    }),
    watchlist: z.boolean().optional(),
    bottom: z.boolean().optional(),
    boundary: z.boolean().optional(),
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: defaultName,
      description: defaultDescription,
      hasDescription: defaultDescription !== '',
      section: defaultSection,
      hasTarget: defaultHasTarget,
      target: defaultTarget,
      timeframe: defaultTimeframe,
      schedule: defaultSchedule,
      watchlist: defaultWatchlist,
      bottom: defaultBottom,
      boundary: defaultBoundary,
    },
  });

  useEffect(() => {
    reset({
      name: habit?.name ?? '',
      description: habit?.description ?? '',
      hasDescription: habit?.description ? true : false,
      section: habit?.section ?? 'outer',
      hasTarget: habit ? !!habit.target : true,
      target: habit?.target ?? 1,
      timeframe: habit?.timeframe ?? 'day',
      schedule: habit?.schedule ?? defaultedSchedule,
      watchlist: habit?.watchlist ?? false,
      bottom: habit?.bottom ?? false,
      boundary: habit?.boundary ?? false,
    });
  }, [habit, reset]);

  const hasChanges =
    habit &&
    (watch('name') !== habit.name ||
      watch('description') !== habit.description ||
      watch('section') !== habit.section ||
      watch('hasTarget') !== !!habit.target ||
      (watch('hasTarget') &&
        (watch('target') !== habit.target || (habit.timeframe && watch('timeframe') !== habit.timeframe))) ||
      (habit.schedule && JSON.stringify(watch('schedule')) !== JSON.stringify(habit.schedule)) ||
      (habit.watchlist !== undefined && watch('watchlist') !== habit.watchlist) ||
      (habit.bottom !== undefined && watch('bottom') !== habit.bottom) ||
      (habit.boundary !== undefined && watch('boundary') !== habit.boundary));

  const disabled = watch('name') === '' || (habit && !hasChanges);
  const timeframes = ['day', 'week', 'month', 'custom'];

  function handleClose() {
    Keyboard.dismiss();
    onClose();
    resetState();
  }

  function handleSave(data: any) {
    saveHabit({
      habitId: habit ? habit.id : undefined,
      name: data.name,
      description: data.description,
      section: data.section,
      target: data.section === 'outer' ? data.target || null : null,
      timeframe: data.section === 'outer' ? data.timeframe || null : null,
      schedule: data.section === 'outer' ? data.schedule || null : null,
      watchlist: data.watchlist,
      bottom_line: data.section === 'inner' ? data.bottom || null : null,
      boundary: data.section === 'middle' ? data.boundary || null : null,
    });
  }

  function handleSaveAndAdd(data: any) {
    handleSave(data);
    resetState();
  }

  function handleSaveAndClose(data: any) {
    handleSave(data);
    handleClose();
  }

  function resetState() {
    setValue('name', defaultName);
    setValue('description', defaultDescription);
    setValue('hasDescription', defaultHasDescription);
    setValue('section', defaultSection);
    setValue('hasTarget', defaultHasTarget);
    setValue('target', defaultTarget);
    setValue('timeframe', defaultTimeframe);
    setValue('schedule', defaultSchedule);
    setValue('watchlist', defaultWatchlist);
    setValue('bottom', defaultBottom);
    setValue('boundary', defaultBoundary);
  }

  const handleSetSchedule = (key: keyof Schedule, value: boolean) => {
    const currentSchedule = watch('schedule') || defaultSchedule;
    setValue('schedule', { ...currentSchedule, [key]: value });
  };

  function toggleTarget() {
    const currentValue = watch('hasTarget');

    if (currentValue) {
      setValue('hasTarget', false);
      setValue('target', undefined);
      setValue('timeframe', undefined);
      setValue('schedule', defaultedSchedule);
    } else {
      setValue('hasTarget', true);
      setValue('target', defaultTarget);
      setValue('timeframe', defaultTimeframe);
      setValue('schedule', defaultSchedule);
    }

    // Trigger hasChanges update
    const currentSection = watch('section');
    setValue('section', currentSection);
  }
  if (!show) return null;

  return (
    <ModalWrapper show={show} onClose={onClose} fullscreen>
      <XStack jc='space-between' ai='center'>
        <Button chromeless onPress={onClose}>
          <X />
        </Button>
        <Text fontSize='$7' fontWeight='800'>
          {habit ? habit.name : 'Add Habit'}
        </Text>
        <Button chromeless onPress={onClose} disabled={disabled}>
          <Text color={disabled ? undefined : '$blue8'} fontWeight='600'>
            Save
          </Text>
        </Button>
      </XStack>

      <YStack gap='$2'>
        <YStack>
          <Label fontSize='$5' color='$color' fontWeight='600'>
            Circle
          </Label>
          <XStack gap='$3' ai='center' jc='center' backgroundColor='$background' borderRadius='$4' overflow='hidden'>
            {['outer', 'middle', 'inner'].map(section => {
              return (
                <Controller
                  key={section}
                  control={control}
                  name='section'
                  render={({ field: { onChange, value } }) => (
                    <Button
                      flex={1}
                      key={section}
                      backgroundColor={value === section ? '$blue8' : '$background'}
                      borderWidth={1}
                      borderColor={value === section ? '$blue8' : '$borderColor'}
                      onPress={() => {
                        onChange(section);
                        if (section !== 'outer') {
                          setValue('hasTarget', false);
                        } else if (section === 'outer') {
                          toggleTarget();
                        }
                      }}
                      padding='$2'
                      borderRadius='$4'
                      elevation={value === section ? '$2' : undefined}>
                      <Text
                        fontSize='$4'
                        color={value === section ? 'white' : '$gray10'}
                        fontWeight={value === section ? '800' : '400'}
                        textAlign='center'>
                        {section.charAt(0).toUpperCase() + section.slice(1)}
                      </Text>
                    </Button>
                  )}
                />
              );
            })}
          </XStack>
        </YStack>

        <YStack>
          <Label fontSize='$5' color='$color' fontWeight='600'>
            Name
          </Label>
          <Controller
            control={control}
            name='name'
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder='Enter habit name'
                value={value}
                onChangeText={onChange}
                backgroundColor='$background'
                borderRadius='$4'
                size='$4'
                returnKeyType='done'
              />
            )}
          />
          {errors.name && (
            <Text color='$red10' fontSize='$3'>
              {errors.name.message}
            </Text>
          )}
        </YStack>

        <YStack>
          <XStack ai='center' jc='space-between' onPress={() => setValue('hasDescription', !watch('hasDescription'))}>
            <Label fontSize='$5' color='$color' fontWeight='600'>
              Description
            </Label>
            <ChevronDown rotate={watch('hasDescription') ? '180deg' : '0deg'} transition='transform 150ms' />
          </XStack>

          {watch('hasDescription') && (
            <Controller
              control={control}
              name='description'
              render={({ field: { onChange, value } }) => (
                <TextArea
                  placeholder='Add more details...'
                  value={value}
                  onChangeText={onChange}
                  backgroundColor='$background'
                  borderRadius='$4'
                  size='$4'
                />
              )}
            />
          )}
        </YStack>

        <XStack ai='center' jc='space-between'>
          <Label paddingRight='$2' justifyContent='flex-end' fontSize='$5' fontWeight='600'>
            Watchlist
          </Label>
          <Controller
            control={control}
            name='watchlist'
            render={({ field: { onChange, value } }) => (
              <Switch size='$2' checked={value} onCheckedChange={onChange} bw={1}>
                <Switch.Thumb animation='quick' size='$2.5' />
              </Switch>
            )}
          />
        </XStack>

        <XStack ai='center' jc='space-between'>
          <Label paddingRight='$2' justifyContent='flex-end' fontSize='$5' fontWeight='600'>
            {watch('section') === 'middle' ? 'Boundary' : watch('section') === 'inner' ? 'Bottom Line' : 'Target'}
          </Label>
          <Controller
            control={control}
            name='hasTarget'
            render={({ field: { value } }) => (
              <Switch size='$2' checked={value} onCheckedChange={() => toggleTarget()} bw={1}>
                <Switch.Thumb animation='quick' size='$2.5' />
              </Switch>
            )}
          />
        </XStack>

        {watch('hasTarget') && (
          <XStack ai='center' jc='space-between' bc='$backgroundStrong' br='$4' zIndex={5} p='$2'>
            <Controller
              control={control}
              name='target'
              render={({ field: { onChange, value } }) => (
                <Input
                  flex={1}
                  keyboardType='numeric'
                  value={value !== null && value !== undefined ? value.toString() : ''}
                  onChangeText={input => {
                    if (input === '') {
                      onChange(null);
                    } else {
                      onChange(Number(input.replace(/^0+/, '')));
                    }
                  }}
                  maxLength={2}
                  textAlign='center'
                  backgroundColor='$backgroundStrong'
                  fontSize={18}
                  fontWeight='600'
                  color='$color'
                />
              )}
            />

            <Paragraph fontSize={18} minWidth={80} textAlign='center' flex={1} fontWeight='500'>
              {watch('target') === null || watch('target') === 1 ? 'time per' : 'times per'}
            </Paragraph>
            <XStack>
              <CustomDropdown
                items={timeframes}
                selectedItem={watch('timeframe') ?? null}
                setSelectedItem={value => setValue('timeframe', value)}
              />
            </XStack>
          </XStack>
        )}

        {watch('hasTarget') && watch('timeframe') === 'custom' && (
          <XStack jc='space-evenly' ai='center' backgroundColor='$backgroundStrong' py='$2' br='$4' borderWidth={1} borderColor='$borderColor'>
            {daysOfWeek.map(day => {
              return (
                <Button
                  key={day}
                  h={40}
                  w={40}
                  br={16}
                  p={0}
                  onPress={() => handleSetSchedule(day, !watch('schedule')[day])}
                  backgroundColor={watch('schedule')[day] ? '$blue8' : undefined}>
                  <Text fontSize='$1'>{day.slice(0, 3).toUpperCase()}</Text>
                </Button>
              );
            })}
          </XStack>
        )}
      </YStack>
      <YStack position='absolute' bottom={5} gap='$3' jc='space-between' left={10} right={10}>
        {habit && (
          <XStack ai='center' jc='space-around'>
            <ArchiveHabit habit={habit} archiveHabit={saveHabit} />
            <DeleteHabit habit={habit} deleteHabit={deleteHabit} />
          </XStack>
        )}
        <XStack jc='space-around'>
          <Button
            width={!habit ? '45%' : '90%'}
            backgroundColor={disabled ? undefined : habit ? '$blue8' : '$blue4'}
            onPress={handleSubmit(handleSaveAndClose)}
            disabled={disabled}>
            <Text fontWeight='600' color='white' fontSize='$6'>
              Save
            </Text>
          </Button>
          {!habit && (
            <Button
              width='45%'
              backgroundColor={disabled ? undefined : '$blue8'}
              onPress={handleSubmit(handleSaveAndAdd)}
              disabled={disabled}>
              <Text fontWeight='600' color='white' fontSize='$6'>
                Save & Add
              </Text>
            </Button>
          )}
        </XStack>
      </YStack>
    </ModalWrapper>
  );
}
