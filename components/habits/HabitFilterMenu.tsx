import React from 'react';
import { Button, Text, XStack, YStack, Separator, Switch, Label, Circle, useTheme } from 'tamagui';
import { ChevronDown, ChevronUp } from '@tamagui/lucide-icons';
import { useHabitContext } from 'src/contexts/HabitContext';
import { Archive, Calendar, Star } from '@tamagui/lucide-icons';
import { ModalWrapper } from '../shared/ModalWrapper';
import WeekHeader from './WeekHeader';

type ViewMode = 'day' | 'week' | 'list';

const modes: { label: string; value: ViewMode }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'List', value: 'list' },
];

export function HabitFilterButton({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}) {
  const { selectedSections, showDueToday, showArchived, showWatchlist, viewMode } = useHabitContext();

  const filterIcons = [
    selectedSections.includes('outer') && <Circle key='outer' size={12} backgroundColor='$green10' />,
    selectedSections.includes('middle') && <Circle key='middle' size={12} backgroundColor='$yellow10' />,
    selectedSections.includes('inner') && <Circle key='inner' size={12} backgroundColor='$red10' />,
    showDueToday && <Calendar key='calendar' size='$1' />,
    showArchived && <Archive key='archive' size='$1' />,
    showWatchlist && <Star key='star' size='$1' />,
  ].filter(Boolean);

  return (
    <XStack ai='center' jc='space-between' mx='$2'>
      <XStack ai='center' gap='$1'>
        <Button
          size='$3'
          onPress={() => setShowModal(!showModal)}
          borderColor='$placeholderColor'
          variant='outlined'
          mr='$2'>
          <XStack ai='center' gap='$2'>
            <Text fontSize={16} fontWeight='800'>
              Filters
            </Text>
            {showModal ? <ChevronUp size={20} strokeWidth={3} /> : <ChevronDown size={20} strokeWidth={3} />}
          </XStack>
        </Button>
        <XStack ai='center' gap='$2'>
          {filterIcons}
        </XStack>
      </XStack>
      {viewMode === 'week' && <WeekHeader />}
    </XStack>
  );
}

export function HabitFilterModal({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}) {
  const theme = useTheme();
  const {
    sections,
    selectedSections,
    showArchived,
    showWatchlist,
    viewMode,
    showDueToday,
    setSelectedSections,
    setShowArchived,
    setShowWatchlist,
    setViewMode,
    setShowDueToday,
  } = useHabitContext();

  if (!showModal) return null;

  const toggleSection = (section: string) => {
    if (selectedSections.includes(section)) {
      setSelectedSections(selectedSections.filter(s => s !== section));
    } else {
      setSelectedSections([...selectedSections, section]);
    }
  };

  function handleChangeViewMode(viewMode: ViewMode) {
    setShowModal(false);

    setViewMode(viewMode);
  }

  return (
    <ModalWrapper show={showModal} onClose={() => setShowModal(false)}>
      <Text fontWeight='800' textAlign='center'>
        View
      </Text>

      <XStack ai='center' jc='center' gap='$2'>
        {modes.map(mode => (
          <Button
            key={mode.value}
            size='$3'
            chromeless
            width='33%'
            backgroundColor={viewMode === mode.value ? '$blue10' : '$background'}
            color={viewMode === mode.value ? 'white' : '$color'}
            borderWidth={1}
            borderColor={viewMode === mode.value ? '$blue10' : '$borderColor'}
            onPress={() => handleChangeViewMode(mode.value)}>
            <Text>{mode.label}</Text>
          </Button>
        ))}
      </XStack>
      <Separator />
      <YStack gap='$2'>
        <Text fontWeight='800' textAlign='center'>
          Sections
        </Text>
        {sections.map(section => {
          const isSelected = selectedSections.includes(section);
          const label = section.charAt(0).toUpperCase() + section.slice(1) + ' Circle';

          return (
            <XStack jc='space-between' ai='center' key={section}>
              <XStack ai='center' gap='$2'>
                <Circle
                  size={12}
                  backgroundColor={
                    selectedSections.includes(section)
                      ? section === 'outer'
                        ? theme.green10.val
                        : section === 'middle'
                        ? theme.purple10.val
                        : theme.red10.val
                      : theme.gray6.val
                  }
                />
                <Label fontWeight='700'>{label}</Label>
              </XStack>

              <Switch size='$2' checked={isSelected} onCheckedChange={() => toggleSection(section)}>
                <Switch.Thumb />
              </Switch>
            </XStack>
          );
        })}
      </YStack>
      <Separator />
      <XStack jc='space-between' ai='center'>
        <Label fontWeight='700'>Due Today</Label>
        <Switch size='$2' checked={showDueToday} onCheckedChange={setShowDueToday}>
          <Switch.Thumb />
        </Switch>
      </XStack>

      <XStack jc='space-between' ai='center'>
        <Label fontWeight='700'>Watchlist Only</Label>
        <Switch size='$2' checked={showWatchlist} onCheckedChange={setShowWatchlist}>
          <Switch.Thumb />
        </Switch>
      </XStack>

      <XStack jc='space-between' ai='center'>
        <Label fontWeight='700'>Archived</Label>
        <Switch size='$2' checked={showArchived} onCheckedChange={setShowArchived}>
          <Switch.Thumb />
        </Switch>
      </XStack>
    </ModalWrapper>
  );
}
