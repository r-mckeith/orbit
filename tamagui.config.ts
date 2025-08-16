import { createTamagui, createTokens } from 'tamagui';
import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';

// Define tokens manually since we're not using theme-base
export const tokens = createTokens({
  size: {
    xs: 10,
    sm: 14,
    md: 16,
    true: 16, // Default size
    lg: 20,
    xl: 24,
  },
  space: {
    xs: 4,
    sm: 8,
    md: 16,
    true: 16, // Default space
    lg: 24,
    xl: 32,
  },
  radius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
  },
  zIndex: {
    xs: 100,
    sm: 200,
    md: 300,
    lg: 400,
    xl: 500,
  },
  color: {
    white: '#fff',
    black: '#000',
    gray: '#808080',
  },
});

// Define a simple theme
const themes = {
  light: {
    background: '#fff',
    color: '#000',
    borderColor: '#e0e0e0',
  },
  dark: {
    background: '#121212',
    color: '#fff',
    borderColor: '#333',
  },
};

const headingFont = createInterFont();
const bodyFont = createInterFont();

export const config = createTamagui({
  defaultTheme: 'light',
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  themes,
  tokens,
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
});

export default config;

export type AppConfig = typeof config;
declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
