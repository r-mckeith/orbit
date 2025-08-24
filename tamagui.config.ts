import { createAnimations } from '@tamagui/animations-react-native';
import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';
import { themes, tokens } from '@tamagui/themes';
import { createTamagui } from 'tamagui';

const customThemes = {
  ...themes,
  // light: {
  //   background: 'hsl(0, 0%, 96%)',
  //   backgroundHover: 'hsl(0, 0%, 92%)',
  //   borderIncomplete: 'hsl(0, 65%, 45%)',
  //   borderComplete: 'hsl(210, 80%, 45%)',
  //   borderFuture: 'hsl(0, 0%, 85%)',
  //   text: 'hsl(0, 0%, 20%)',
  //   textMuted: 'hsl(0, 0%, 50%)',
  //   spinner: 'hsl(0, 0%, 60%)',
  // },
  // dark: {
  //   // background: 'hsl(220, 20%, 14%)',
  //   backgroundHover: 'hsl(220, 20%, 18%)',
  //   borderIncomplete: 'hsl(0, 65%, 55%)',
  //   borderComplete: 'hsl(210, 90%, 60%)',
  //   borderFuture: 'hsl(220, 15%, 26%)',
  //   text: 'hsl(210, 15%, 85%)',
  //   color: 'hsl(210, 15%, 85%)',
  //   textMuted: 'hsl(220, 15%, 50%)',
  //   spinner: 'hsl(220, 15%, 50%)',
  // },
};

const animations = createAnimations({
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
    snapPoints: [90],
  },
  quick: {
    type: 'timing',
    duration: 150,
  },
});

const headingFont = createInterFont();
const bodyFont = createInterFont();

const config = createTamagui({
  animations,
  defaultTheme: 'dark',
  defaultFont: 'body',
  shouldAddPrefersColorThemes: false,
  themeClassNameOnRoot: false,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  themes: customThemes,
  tokens,
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 661 },
    gtSm: { minWidth: 801 },
    gtMd: { minWidth: 1021 },
    gtLg: { minWidth: 1281 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: 'none' },
    pointerCoarse: { pointer: 'coarse' },
  },
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;