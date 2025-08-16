
export type NewHabit = {
  name: string;
  description?: string;
  section: string;
  target: number | null;
  timeframe: string | null;
  schedule?: Schedule | null;
  target_met: boolean | null;
  watchlist?: boolean;
  has_target?: boolean;
  boundary?: boolean;
  bottom_line?: boolean;
};

export type HabitData = {
  date: string;
  count: number;
  target_met: boolean;
  due_today: boolean
}

export type HabitWithData = NewHabit & {
  id: number;
  user_id: string;
  archived: boolean;
  created: Date;
  last_recorded: Date;
  streak: number;
  total_count: number;
  data: HabitData[];
  days: boolean[];
  boundary?: boolean;
  bottom?: boolean;
};

export type HabitStreak = {
  habit_id: number;
  streak: number;
};

export type WeekStreak = {
  habit_id: number;
  week_streak: number;
};

export type Schedule = {
  'monday': boolean;
  'tuesday': boolean;
  'wednesday': boolean;
  'thursday': boolean;
  'friday': boolean;
  'saturday': boolean;
  'sunday': boolean;
};

export type HabitStackParamsList = {
  HabitMain: undefined;
  HabitDetails: { id: number };
  HabitNotes: { id: number };
}

export type GratitudeStackParamsList = {
  GratitudeMain: undefined;
  GratitudeDetails: { date: string };
}

export type HabitsStackParamList = {
  HabitsMain: undefined;
  HabitDetails: { id: number; habit: HabitWithData };
};

export type ContentStackParamList = {
  ContentMain: undefined;
  ContentDetails: { item: string };
};

export type NoteProps = any;

export type NewNoteProps = any;

export type UserProfile = any;

export type UserSetting = any;
export type NewUserSetting = any;

export type OnboardingStepProps = {
onNext: () => void;
  onBack: () => void;
  onSkip?: () => void;
};

export type HabitStats = {
  completion_rate: number;
  days_logged: number;
  missed_days: number;
  percent_change: number;
  current_streak: number;
  longest_streak: number;
}