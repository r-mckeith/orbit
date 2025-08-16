import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { startOfDay } from 'date-fns';

type HabitContextType = {
  sections: string[];
  selectedWeekStart: Date;
  selectedSections: string[];
  searchText: string;
  viewMode: 'day' | 'week' | 'list';
  showWatchlist: boolean;
  showArchived: boolean;
  showDueToday: boolean;
  showFilterDropdown: boolean;
  setSelectedWeekStart: React.Dispatch<React.SetStateAction<Date>>;
  setSelectedSections: React.Dispatch<React.SetStateAction<string[]>>;
  setSearchText: React.Dispatch<React.SetStateAction<string>>;
  setViewMode: React.Dispatch<React.SetStateAction<'day' | 'week' | 'list'>>;
  setShowWatchlist: React.Dispatch<React.SetStateAction<boolean>>;
  setShowArchived: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDueToday: React.Dispatch<React.SetStateAction<boolean>>;
  setShowFilterDropdown: React.Dispatch<React.SetStateAction<boolean>>;
};

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const useHabitContext = () => {
  const context = useContext(HabitContext);
  if (!context) {
    throw new Error('useHabitContext must be used within a HabitProvider');
  }
  return context;
};

type HabitProviderProps = {
  children: ReactNode;
};

export const HabitProvider = ({ children }: HabitProviderProps) => {
  const today = startOfDay(new Date());

  const [selectedWeekStart, setSelectedWeekStart] = useState(today);
  const [selectedSections, setSelectedSections] = useState<string[]>(['outer', 'middle', 'inner']);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'list'>('day');
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showDueToday, setShowDueToday] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const sections = ['outer', 'middle', 'inner'];

  useEffect(() => {
    const updateToday = () => setSelectedWeekStart(startOfDay(new Date()));

    updateToday();

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active') updateToday();
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, []);

  return (
    <HabitContext.Provider
      value={{
        sections,
        selectedWeekStart,
        selectedSections,
        searchText,
        viewMode,
        showWatchlist,
        showArchived,
        showDueToday,
        showFilterDropdown,
        setSelectedWeekStart,
        setSelectedSections,
        setSearchText,
        setViewMode,
        setShowWatchlist,
        setShowArchived,
        setShowDueToday,
        setShowFilterDropdown,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export default HabitContext;