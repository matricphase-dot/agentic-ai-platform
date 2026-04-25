import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/auth.store';
import { router, Link } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Missing credentials' });
      return;
    }
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Toast.show({ 
        type: 'error', 
        text1: 'Login Failed', 
        text2: e.response?.data?.message || 'Invalid email or password' 
      });
    }
  };

  const quickLogin = (e: string) => {
    setEmail(e);
    setPassword('Demo@1234');
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-12">
          <View className="mb-12">
            <Text className="text-white text-4xl font-black italic tracking-tighter">
              AGENTIC <Text className="text-[#7C3AED] not-italic">AI</Text>
            </Text>
            <Text className="text-gray-400 font-medium mt-2">The AI Agent Infrastructure Layer.</Text>
          </View>

          <View className="gap-y-6">
            <Input 
              label="Email Address"
              placeholder="operator@agenticai.dev"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <Input 
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <Button 
              title="Initialize Session"
              onPress={handleLogin}
              loading={isLoading}
              className="mt-4"
            />
          </View>

          {__DEV__ && (
            <View className="mt-10">
              <Text className="text-gray-500 text-xs mb-4 text-center uppercase tracking-widest">Quick Access (Dev Mode)</Text>
              <View className="flex-row flex-wrap justify-center gap-2">
                {['alice@agenticai.dev', 'bob@agenticai.dev', 'demo@agenticai.dev'].map((acc) => (
                  <TouchableOpacity 
                    key={acc}
                    onPress={() => quickLogin(acc)}
                    className="bg-gray-900 px-3 py-2 rounded-lg border border-gray-800"
                  >
                    <Text className="text-gray-400 text-xs font-medium">{acc.split('@')[0]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View className="mt-auto py-8 flex-row justify-center">
            <Text className="text-gray-500">Need an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text className="text-[#7C3AED] font-bold">Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
