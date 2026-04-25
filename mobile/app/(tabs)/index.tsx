import React, { useState } from 'react';
import { ScrollView, View, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { TrendingUp, Cpu, Wallet, Zap, LayoutGrid, Coins, Vote, Bell } from 'lucide-react-native';
import { router } from 'expo-router';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const { data: balanceResponse, isLoading: isBalLoading, refetch: refetchBal } = useQuery({
    queryKey: ['balance'],
    queryFn: () => api.billing.balance()
  });

  const { data: notificationsResponse, isLoading: isNotifyLoading, refetch: refetchNotify } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.notifications.list()
  });

  const balanceData = (balanceResponse as any)?.data || { credits: 0 };
  const notifications = (notificationsResponse as any)?.data?.notifications || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchBal(), refetchNotify()]);
    setRefreshing(false);
  };

  const quickActions = [
    { label: 'Marketplace', icon: LayoutGrid, color: '#7C3AED', href: '/(tabs)/marketplace' },
    { label: 'Stake', icon: Coins, color: '#10B981', href: '/(tabs)/staking' },
    { label: 'Governance', icon: Vote, color: '#3B82F6', href: '/(tabs)/governance' },
  ];

  return (
    <ScrollView 
      className="flex-1 bg-black"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
    >
      <View className="p-6 pt-12">
        <View className="flex-row justify-between items-start mb-8">
          <View>
            <Text className="text-gray-400 font-medium">Welcome back,</Text>
            <Text className="text-white text-3xl font-black">{user?.name || 'Operator'}</Text>
          </View>
          <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-900 items-center justify-center border border-gray-800">
            <Bell size={20} color="#7C3AED" />
          </TouchableOpacity>
        </View>

        <Card className="mb-8 bg-[#7C3AED10] border-[#7C3AED30] p-6">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-[#7C3AED] font-black uppercase tracking-widest text-[10px]">Total Credits</Text>
            <Zap size={14} color="#7C3AED" />
          </View>
          {isBalLoading ? (
            <View className="h-10 w-32 bg-gray-900 animate-pulse rounded-md" />
          ) : (
            <Text className="text-white text-4xl font-black">{balanceData.credits.toLocaleString()}</Text>
          )}
          <Text className="text-gray-500 text-xs mt-1">Available for agent invocations</Text>
        </Card>

        <Text className="text-white text-lg font-bold mb-4">Quick Actions</Text>
        <View className="flex-row justify-between mb-8">
          {quickActions.map((action, i) => (
            <TouchableOpacity 
              key={i} 
              onPress={() => router.push(action.href as any)}
              className="w-[30%] bg-gray-900 p-4 rounded-2xl items-center border border-gray-800"
            >
              <action.icon size={24} color={action.color} />
              <Text className="text-gray-400 text-[10px] font-bold uppercase mt-2 text-center">{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
            <Text className="text-[#7C3AED] font-bold text-xs">View All</Text>
          </TouchableOpacity>
        </View>

        {isNotifyLoading ? (
          [1, 2, 3].map(i => (
            <View key={i} className="h-16 bg-gray-900 rounded-xl mb-3 animate-pulse border border-gray-800" />
          ))
        ) : notifications.length > 0 ? (
          notifications.slice(0, 5).map((log: any, i: number) => (
            <View key={i} className="flex-row items-center justify-between py-4 border-b border-gray-900">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 items-center justify-center mr-3">
                  <Zap size={18} color="#7C3AED" />
                </View>
                <View>
                  <Text className="text-white font-bold text-sm">{log.title}</Text>
                  <Text className="text-gray-500 text-[10px] uppercase">{new Date(log.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="py-12 items-center justify-center border border-dashed border-gray-800 rounded-2xl">
            <Text className="text-gray-500 text-sm">No recent activity detected.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
