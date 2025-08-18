import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, Form, Input, Text, XStack, YStack } from 'tamagui';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { error } = await signUp(email, password);
      if (error) throw error;
      router.replace('/(tabs)');
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack f={1} jc="center" p="$6" gap="$6" bg="$background">
      <YStack alignItems="center" gap="$2" mb="$4">
        <Text fontSize="$9" fontWeight="bold" color="$color">
          Create an Account
        </Text>
      </YStack>
      
      <Form onSubmit={handleSignUp} gap="$4" width="100%" maxWidth={400} alignSelf="center">
        <YStack gap="$4">
          <YStack gap="$2">
            <Input
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              size="$4"
              height={50}
              autoComplete="email"
              textContentType="emailAddress"
              borderWidth={1}
              borderColor="$borderColor"
              focusStyle={{
                borderColor: '$blue10',
                shadowColor: '$blue5',
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
              }}
            />
          </YStack>
          
          <YStack gap="$2">
            <Input
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              size="$4"
              height={50}
              autoComplete="password-new"
              textContentType="newPassword"
              borderWidth={1}
              borderColor="$borderColor"
              focusStyle={{
                borderColor: '$blue10',
                shadowColor: '$blue5',
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
              }}
            />
          </YStack>
          
          <YStack gap="$2" mb="$2">
            <Input
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              size="$4"
              height={50}
              autoComplete="password-new"
              textContentType="newPassword"
              returnKeyType="done"
              borderWidth={1}
              borderColor="$borderColor"
              focusStyle={{
                borderColor: '$blue10',
                shadowColor: '$blue5',
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
              }}
            />
          </YStack>
          
          {error ? (
            <Text color="$red10" fontSize="$2">
              {error}
            </Text>
          ) : null}
          
          <Form.Trigger asChild>
            <Button
              size="$5"
              height={55}
              backgroundColor="$blue10"
              mt="$2"
              onPress={handleSignUp}
              disabled={loading}
              pressStyle={{ backgroundColor: '$blue9' }}
              elevation="$1"
              shadowColor="$blue5"
              shadowRadius={10}
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.2}
            >
              <Button.Text 
                fontSize="$5" 
                fontWeight="600"
                color="white"
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button.Text>
            </Button>
          </Form.Trigger>
          
          <XStack jc="center" mt="$2">
            <Text fontSize="$2" color="$color10">
              Already have an account?{' '}
              <Text 
                color="$blue10" 
                textDecorationLine="underline"
                onPress={() => router.push('/(auth)/login')}
              >
                Sign in
              </Text>
            </Text>
          </XStack>
        </YStack>
      </Form>
    </YStack>
  );
}
