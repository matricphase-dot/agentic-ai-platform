import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { api } from '../../lib/api';
import { router, Link } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Toast.show({ type: 'error', text1: 'Please fill all fields' });
      return;
    }
    setIsLoading(true);
    try {
      const response: any = await api.auth.signup({ name, email, password });
      if (response.success) {
        Toast.show({ 
          type: 'success', 
          text1: 'Account Created', 
          text2: 'Check your email to verify your account.' 
        });
        router.replace('/(auth)/login');
      } else {
        throw new Error(response.message || 'Signup failed');
      }
    } catch (e: any) {
      Toast.show({ 
        type: 'error', 
        text1: 'Signup Failed', 
        text2: e.response?.data?.message || e.message 
      });
    } finally {
      setIsLoading(false);
    }
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
              JOIN THE <Text className="text-[#7C3AED] not-italic">FLEET</Text>
            </Text>
            <Text className="text-gray-400 font-medium mt-2">Create your decentralized AI identity.</Text>
          </View>

          <View className="gap-y-6">
            <Input 
              label="Full Name"
              placeholder="John Doe"
              value={name}
              onChangeText={setName}
            />
            <Input 
              label="Email"
              placeholder="j.doe@example.com"
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
              title="Create Identity"
              onPress={handleSignup}
              loading={isLoading}
              className="mt-4"
            />
          </View>

          <View className="mt-auto py-8 flex-row justify-center">
            <Text className="text-gray-500">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text className="text-[#7C3AED] font-bold">Log in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
