import { Redirect } from 'expo-router';

export default function AuthIndex() {
  // This will automatically redirect to the login screen
  return <Redirect href="/(auth)/login" />;
}
