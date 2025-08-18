import { ColorSchemeName, Platform, useColorScheme as rnUseColorScheme } from 'react-native';

// This hook will use the platform-appropriate implementation
const useColorScheme = (): NonNullable<ColorSchemeName> => {
  // On native platforms, use the built-in hook
  if (Platform.OS !== 'web' && rnUseColorScheme) {
    return rnUseColorScheme() || 'light';
  }
  
  // On web, we'll use a simple implementation
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    return mq.matches ? 'dark' : 'light';
  }
  
  // Fallback to light theme
  return 'light';
};

export default useColorScheme;

