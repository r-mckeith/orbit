import { createAnimations } from '@tamagui/animations-react-native';
import { createInterFont } from '@tamagui/font-inter';
import { shorthands } from '@tamagui/shorthands';
import { createTamagui, createTokens } from 'tamagui';

// Create the tokens
const tokens = createTokens({
  // Size tokens
  size: {
    // Base sizes
    '0': 0,
    '0.5': 2,
    '1': 4,
    '2': 8,
    '3': 12,
    '4': 16,
    '5': 20,
    '6': 24,
    '8': 32,
    '10': 40,
    '12': 48,
    '16': 64,
    '20': 80,
    '24': 96,
    '32': 128,
    
    // Named sizes for semantic use
    xs: 12,
    sm: 14,
    md: 16,
    true: 16, // Default size
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    
    // Fixed sizes
    full: '100%',
    screen: '100vh',
    min: 'min-content',
    max: 'max-content',
  },
  
  // Space tokens (for margins and paddings)
  space: {
    '0': 0,
    '0.5': 2,
    '1': 4,
    '2': 8,
    '3': 12,
    '4': 16,
    '5': 20,
    '6': 24,
    '8': 32,
    '10': 40,
    '12': 48,
    '16': 64,
    '20': 80,
    '24': 96,
    '32': 128,
    true: 16, // Default space
  },
  
  // Border radius tokens
  radius: {
    '0': 0,
    '1': 4,
    '2': 8,
    '3': 12,
    '4': 16,
    '5': 20,
    '6': 24,
    full: 9999,
    
    // Named sizes
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
  },
  
  // Z-index tokens
  zIndex: {
    '0': 0,
    '1': 100,
    '2': 200,
    '3': 300,
    '4': 400,
    '5': 500,
    '6': 600,
    '7': 700,
    '8': 800,
    '9': 900,
    '10': 1000,
    max: 9999,
    
    // Named sizes
    xs: 100,
    sm: 200,
    md: 300,
    lg: 400,
    xl: 500,
    '2xl': 600,
  },
  
  // Color tokens
  color: {
    // Basic colors
    transparent: 'transparent',
    current: 'currentColor',
    black: '#000',
    white: '#fff',
    
    // Grayscale
    gray50: '#f9fafb',
    gray100: '#f3f4f6',
    gray200: '#e5e7eb',
    gray300: '#d1d5db',
    gray400: '#9ca3af',
    gray500: '#6b7280',
    gray600: '#4b5563',
    gray700: '#374151',
    gray800: '#1f2937',
    gray900: '#111827',
    
    // Brand colors
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    
    // Aliases for backward compatibility
    gray: '#6b7280',
  },
});

// Container sizes (used for max-width containers)
const containerSizes = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Define custom themes
const customThemes = {
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
  light_Tracker: {
    background: 'hsl(0, 0%, 96%)',
    backgroundHover: 'hsl(0, 0%, 92%)',
    borderIncomplete: 'hsl(0, 65%, 45%)',
    borderComplete: 'hsl(210, 80%, 45%)',
    borderFuture: 'hsl(0, 0%, 85%)',
    text: 'hsl(0, 0%, 20%)',
    textMuted: 'hsl(0, 0%, 50%)',
    spinner: 'hsl(0, 0%, 60%)',
  },
  dark_Tracker: {
    background: 'hsl(220, 20%, 14%)',
    backgroundHover: 'hsl(220, 20%, 18%)',
    borderIncomplete: 'hsl(0, 65%, 55%)',
    borderComplete: 'hsl(210, 90%, 60%)',
    borderFuture: 'hsl(220, 15%, 26%)',
    text: 'hsl(210, 15%, 85%)',
    color: 'hsl(210, 15%, 85%)',
    textMuted: 'hsl(220, 15%, 50%)',
    spinner: 'hsl(220, 15%, 50%)',
  },
};

// Configure animations
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

// Configure fonts
const headingFont = createInterFont();
const bodyFont = createInterFont();

// Create Tamagui config
export const config = createTamagui({
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

export default config;

export type AppConfig = typeof config;
declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}
