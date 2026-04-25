import React, { useState } from 'react';
import { ScrollView, View, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { TrendingUp, Lock, Coins, Zap } from 'lucide-react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function StakingScreen() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: positionsResponse, isLoading: isPosLoading, refetch: refetchPos } = useQuery({
    queryKey: ['staking-positions'],
    queryFn: () => api.staking.positions()
  });

  const { data: rewardsResponse, isLoading: isRewardsLoading, refetch: refetchRewards } = useQuery({
    queryKey: ['staking-rewards'],
    queryFn: () => api.staking.rewards()
  });

  const positions = (positionsResponse as any)?.data || [];
  const rewardsList = (rewardsResponse as any)?.data?.rewards || [];
  const rewardsTotal = rewardsList.reduce((sum: number, r: any) => sum + (r.claimed ? 0 : r.amount), 0);

  const claimMutation = useMutation({
    mutationFn: () => api.staking.claim(),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Rewards Claimed!' });
      queryClient.invalidateQueries({ queryKey: ['staking-positions'] });
      queryClient.invalidateQueries({ queryKey: ['staking-rewards'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
    onError: (e: any) => {
      Toast.show({ type: 'error', text1: 'Claim Failed', text2: e.response?.data?.message || e.message });
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchPos(), refetchRewards()]);
    setRefreshing(false);
  };

  return (
    <ScrollView 
      className="flex-1 bg-black"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
    >
      <View className="p-6 pt-12">
        <Text className="text-white text-3xl font-black mb-8">Staking</Text>

        <Card className="mb-8 border-[#7C3AED30] bg-[#7C3AED10] p-6 rounded-[32px]">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Claimable Yield</Text>
              <View className="flex-row items-baseline">
                <Text className="text-white text-4xl font-black">{rewardsTotal?.toLocaleString() || '0'}</Text>
                <Text className="text-gray-500 ml-2 font-bold text-sm">AGNT</Text>
              </View>
            </View>
            <View className="w-12 h-12 rounded-full bg-[#7C3AED20] items-center justify-center border border-[#7C3AED40]">
              <TrendingUp size={24} color="#7C3AED" />
            </View>
          </View>
          <Button 
            title="Collect All Rewards" 
            onPress={() => claimMutation.mutate()} 
            loading={claimMutation.isPending}
            className="w-full rounded-2xl"
          />
        </Card>

        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">Active Commitments</Text>
          <Badge label={`${positions.length} Active`} />
        </View>

        {isPosLoading ? (
          [1, 2].map(i => (
            <View key={i} className="h-40 bg-gray-900 rounded-3xl mb-4 border border-gray-800 animate-pulse" />
          ))
        ) : positions.length > 0 ? (
          positions.map((pos: any, i: number) => (
            <Card key={i} className="mb-4 p-6 rounded-[32px]">
              <View className="flex-row items-center justify-between mb-4">
                <View>
                  <Text className="text-white font-bold text-lg">{pos.agent?.name}</Text>
                  <Text className="text-gray-500 text-xs font-medium">Yield-bearing Asset</Text>
                </View>
                <Badge label="STAKED" variant="success" />
              </View>

              <View className="flex-row justify-between pt-5 border-t border-gray-900">
                <View>
                  <Text className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">Principal</Text>
                  <Text className="text-white font-black">{pos.amount?.toLocaleString()} AGNT</Text>
                </View>
                <View className="items-end">
                  <Text className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">Status</Text>
                  <View className="flex-row items-center">
                    <Lock size={12} color="#7C3AED" />
                    <Text className="text-[#7C3AED] font-black text-xs ml-1">Secure</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <View className="py-20 items-center justify-center border border-dashed border-gray-800 rounded-[32px]">
             <Coins size={48} color="#222" className="mb-4" />
             <Text className="text-gray-500 mb-6 text-center px-10">No active stakes found. Support agents to earn protocol rewards.</Text>
             <Button 
               title="Explore Marketplace" 
               onPress={() => router.push('/(tabs)/marketplace')} 
               variant="secondary" 
               className="px-8 rounded-2xl"
             />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
