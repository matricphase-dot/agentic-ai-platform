import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { ChevronLeft, Info, Coins, ShieldCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export default function StakeAmountScreen() {
  const { agentId } = useLocalSearchParams<{ agentId: string }>();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState('');

  const { data: agentResponse } = useQuery({
    queryKey: ['agent', agentId],
    queryFn: () => api.marketplace.get(agentId as string)
  });

  const { data: balanceResponse } = useQuery({
    queryKey: ['balance'],
    queryFn: () => api.billing.balance()
  });

  const agent = (agentResponse as any)?.data;
  const balance = (balanceResponse as any)?.data?.credits || 0;

  const stakeMutation = useMutation({
    mutationFn: () => api.staking.stake(agentId as string, Number(amount)),
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ 
        type: 'success', 
        text1: 'Stake Successful', 
        text2: 'Your AGNT is now securing the network.' 
      });
      queryClient.invalidateQueries({ queryKey: ['staking-positions'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      router.back();
    },
    onError: (e: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Toast.show({ 
        type: 'error', 
        text1: 'Stake Failed', 
        text2: e.response?.data?.message || e.message 
      });
    }
  });

  const handleStake = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
       Toast.show({ type: 'error', text1: 'Invalid amount' });
       return;
    }
    if (Number(amount) > balance) {
      Toast.show({ type: 'error', text1: 'Insufficient balance' });
      return;
    }
    stakeMutation.mutate();
  };

  const selectPreset = (val: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAmount(val.toString());
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="px-6 pt-6">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-900 rounded-full items-center justify-center mb-6 border border-gray-800">
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>

        <View className="mb-10">
          <Text className="text-gray-500 font-black uppercase tracking-[4px] text-[10px] mb-2">Protocol Commitment</Text>
          <Text className="text-white text-3xl font-black leading-10">{agent?.name}</Text>
        </View>

        <View>
          <Card className="mb-8 p-8 rounded-[32px] bg-gray-950 border-gray-900">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Stake Amount</Text>
              <Coins size={14} color="#7C3AED" />
            </View>
            <View className="flex-row items-baseline mb-6">
              <TextInput 
                className="text-white text-5xl font-black flex-1"
                placeholder="0"
                placeholderTextColor="#222"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                autoFocus
              />
              <Text className="text-gray-500 font-bold ml-2 text-xl">AGNT</Text>
            </View>
            <View className="flex-row items-center border-t border-gray-900 pt-6 justify-between">
              <Text className="text-gray-600 font-black uppercase text-[9px] tracking-widest">Available Balance</Text>
              <Text className="text-[#7C3AED] font-black text-sm">{balance.toLocaleString()} AGNT</Text>
            </View>
          </Card>

          <View className="flex-row justify-between mb-10 gap-x-2">
             {[10, 50, 100, 500].map(val => (
               <TouchableOpacity 
                 key={val} 
                 onPress={() => selectPreset(val)}
                 className="flex-1 bg-gray-900 py-4 rounded-2xl border border-gray-800 items-center"
               >
                 <Text className="text-gray-400 font-black text-xs">{val}</Text>
               </TouchableOpacity>
             ))}
          </View>

          <View className="bg-[#10B98105] border border-[#10B98120] p-6 rounded-[24px] flex-row items-start mb-10">
             <ShieldCheck size={20} color="#10B981" />
             <View className="ml-4 flex-1">
               <Text className="text-[#10B981] text-[10px] font-black uppercase tracking-widest mb-1">Network Security</Text>
               <Text className="text-gray-500 text-xs leading-5">
                 Your stake will be locked for 7 days. You earn a proportional share of agent revenue during this period.
               </Text>
             </View>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="mt-auto px-6 pb-10"
      >
        <Button 
          title="Confirm & Stake Tokens" 
          onPress={handleStake} 
          loading={stakeMutation.isPending}
          className="h-16 rounded-2xl"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
