import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, Form, Input, Text, XStack, YStack } from 'tamagui';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      router.replace('/(tabs)');
    } catch (error: any) {
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <YStack f={1} jc="center" p="$6" gap="$6" bg="$background">
      <YStack alignItems="center" gap="$2" mb="$4">
        <Text fontSize="$9" fontWeight="bold" color="$color">
          Welcome Back
        </Text>
      </YStack>
      
      <Form onSubmit={handleLogin} gap="$4" width="100%" maxWidth={400} alignSelf="center">
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
          
          <YStack gap="$2" mb="$2">
            <Input
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              size="$4"
              height={50}
              autoComplete="password"
              textContentType="password"
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
            <Text color="$red10" fontSize="$3">
              {error}
            </Text>
          ) : null}
          
          <Form.Trigger asChild>
            <Button
              size="$5"
              height={55}
              backgroundColor="blue"
              mt="$2"
              onPress={handleLogin}
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
                {loading ? 'Signing In...' : 'Sign In'}
              </Button.Text>
            </Button>
          </Form.Trigger>
          
          <XStack jc="center" mt="$3">
            <Text fontSize="$3" color="$colorHover" mr="$1">
              Don't have an account?
            </Text>
            <Text
              color="$blue10"
              fontSize="$3"
              fontWeight="600"
              onPress={() => router.push('/(auth)/signup')}
            >
              Sign up
            </Text>
          </XStack>
        </YStack>
      </Form>
    </YStack>
  );
}
