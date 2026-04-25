import React from 'react';
import { ScrollView, View, Text, Pressable, Alert, Linking } from 'react-native';
import { Image } from 'expo-image';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/auth.store';
import { Settings, Shield, Bell, Key, LogOut, ExternalLink, Activity, Coins, Vote } from 'lucide-react-native';
import { CONFIG } from '../../lib/config';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to terminate this session?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: logout },
    ]);
  };

  const openDashboard = () => {
    Linking.openURL('https://agenticai-frontend-3tam.onrender.com/dashboard');
  };

  const settingsItems = [
    { label: 'Notification Preferences', icon: Bell, color: '#3B82F6' },
    { label: 'API Keys', icon: Key, color: '#7C3AED', action: openDashboard },
    { label: 'Security & Privacy', icon: Shield, color: '#10B981' },
    { label: 'Help & Support', icon: Settings, color: '#F59E0B' },
  ];

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="p-6 pt-12">
        <View className="items-center mb-10">
          <View className="relative">
            <Image 
              source={{ uri: user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=7C3AED&color=fff` }}
              className="w-32 h-32 rounded-full border-4 border-gray-900 mb-4"
            />
            <View className="absolute bottom-6 right-2 w-6 h-6 bg-[#10B981] rounded-full border-4 border-black" />
          </View>
          <Text className="text-white text-3xl font-black">{user?.name || 'Operator'}</Text>
          <Text className="text-gray-500 font-medium">{user?.email}</Text>
          <View className="flex-row mt-4 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-10 gap-x-3">
          {[
            { label: 'Agents', value: '0', icon: Activity },
            { label: 'Stakes', value: '0', icon: Coins },
            { label: 'Votes', value: '0', icon: Vote }
          ].map((stat, i) => (
            <View key={i} className="items-center p-4 bg-gray-900 rounded-2xl border border-gray-800 flex-1">
               <stat.icon size={16} color="#444" className="mb-2" />
               <Text className="text-white font-black text-lg">{stat.value}</Text>
               <Text className="text-gray-600 text-[8px] font-black uppercase tracking-widest">{stat.label}</Text>
            </View>
          ))}
        </View>

        <Text className="text-white text-lg font-bold mb-4">Settings</Text>
        <View className="gap-y-3 mb-10">
          {settingsItems.map((item, i) => (
            <Pressable 
              key={i} 
              onPress={item.action}
              className="bg-gray-900 border border-gray-800 p-5 rounded-2xl flex-row items-center justify-between"
            >
              <View className="flex-row items-center">
                <View style={{ backgroundColor: `${item.color}15` }} className="w-10 h-10 rounded-xl items-center justify-center mr-4">
                   <item.icon size={20} color={item.color} />
                </View>
                <Text className="text-gray-200 font-bold">{item.label}</Text>
              </View>
              <ExternalLink size={16} color="#333" />
            </Pressable>
          ))}
        </View>

        <Button 
          title="Terminate Session" 
          onPress={handleLogout} 
          variant="ghost" 
          className="mb-6"
          leftIcon={<LogOut size={20} color="#EF4444" />}
        />

        <View className="items-center pb-10">
          <Text className="text-gray-800 text-[10px] uppercase font-black tracking-[4px]">Agentic AI Protocol</Text>
          <Text className="text-gray-800 text-[10px] mt-1">Connected to: {CONFIG.API_URL.replace('https://', '')}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
