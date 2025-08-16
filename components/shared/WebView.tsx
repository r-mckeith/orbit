import * as WebBrowser from 'expo-web-browser';
import { Button } from 'react-native';

const openInAppBrowser = async () => {
  await WebBrowser.openBrowserAsync('https://saa-recovery.org/daily-meditation-from-voices-of-recovery/');
};

export default function WebView() {
  return <Button title="Daily Meditation" onPress={openInAppBrowser} />;
}