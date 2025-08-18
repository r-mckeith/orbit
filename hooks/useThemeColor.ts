/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Platform } from 'react-native';
import { Colors } from '@/constants/Colors';
import useColorScheme from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const scheme = useColorScheme();
  const theme = Platform.OS === 'web' ? 'dark' : scheme || 'light';
  
  const colorFromProps = props[theme as keyof typeof props];
  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme as keyof typeof Colors][colorName];
  }
}
