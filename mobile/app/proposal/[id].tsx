import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ChevronLeft, CheckCircle2, XCircle, MinusCircle, Clock, Users } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function ProposalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: response, isLoading } = useQuery({
    queryKey: ['proposal', id],
    queryFn: () => api.governance.proposal(id as string)
  });

  const prop = (response as any)?.data;

  const voteMutation = useMutation({
    mutationFn: (choice: string) => api.governance.vote(id as string, choice),
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Vote Recorded!' });
      queryClient.invalidateQueries({ queryKey: ['proposal', id] });
    },
    onError: (e: any) => {
      Toast.show({ type: 'error', text1: 'Vote Failed', text2: e.response?.data?.message || e.message });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#10B981';
      case 'PASSED': return '#3B82F6';
      case 'REJECTED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (isLoading) return (
    <View className="flex-1 bg-black items-center justify-center">
      <Text className="text-gray-500 font-bold uppercase tracking-widest animate-pulse">Syncing DAO Data...</Text>
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="p-6 pt-12">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-gray-900 rounded-full items-center justify-center mb-6 border border-gray-800">
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>

        <View className="flex-row items-center justify-between mb-6">
          <Badge label={prop?.proposalType || 'DAO'} />
          <View className="flex-row items-center">
            <Clock size={14} color={getStatusColor(prop?.status)} />
            <Text style={{ color: getStatusColor(prop?.status) }} className="text-xs font-black uppercase ml-1 tracking-widest">{prop?.status}</Text>
          </View>
        </View>

        <Text className="text-white text-3xl font-black mb-6 leading-10">{prop?.title}</Text>
        
        <View className="flex-row items-center mb-10 bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
          <View className="w-10 h-10 rounded-full bg-[#7C3AED20] border border-[#7C3AED40] items-center justify-center mr-3">
             <Users size={20} color="#7C3AED" />
          </View>
          <View>
            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Proposed by</Text>
            <Text className="text-white font-bold">{prop?.proposer || 'Ecosystem Treasury'}</Text>
          </View>
        </View>

        <Text className="text-white text-lg font-bold mb-4">Description</Text>
        <Text className="text-gray-400 leading-7 mb-10 text-sm">
          {prop?.description}
        </Text>

        <Text className="text-white text-lg font-bold mb-6">Current Tally</Text>
        <View className="gap-y-4 mb-12">
          {[
            { label: 'For', value: prop?.votesFor || 0, color: '#10B981', icon: CheckCircle2, choice: 'FOR' },
            { label: 'Against', value: prop?.votesAgainst || 0, color: '#EF4444', icon: XCircle, choice: 'AGAINST' },
            { label: 'Abstain', value: prop?.votesAbstain || 0, color: '#6B7280', icon: MinusCircle, choice: 'ABSTAIN' }
          ].map((item, i) => (
            <Card key={i} className="p-5 rounded-[24px] border-gray-900 bg-gray-950">
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                  <item.icon color={item.color} size={18} />
                  <Text className="text-gray-200 font-bold ml-2">{item.label}</Text>
                </View>
                <Text style={{ color: item.color }} className="font-black">{item.value}%</Text>
              </View>
              <View className="h-1.5 bg-black rounded-full overflow-hidden">
                <View className="h-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
              </View>
            </Card>
          ))}
        </View>

        {prop?.status === 'ACTIVE' && (
          <View className="p-8 bg-[#7C3AED10] border border-[#7C3AED30] rounded-[32px] mb-12">
            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-[4px] text-center mb-6">Cast Your Influence</Text>
            <View className="flex-row gap-x-3">
              <Button 
                title="FOR" 
                onPress={() => voteMutation.mutate('FOR')} 
                loading={voteMutation.isPending && voteMutation.variables === 'FOR'}
                className="flex-1 rounded-2xl h-14" 
              />
              <Button 
                title="AGAINST" 
                onPress={() => voteMutation.mutate('AGAINST')} 
                variant="danger" 
                loading={voteMutation.isPending && voteMutation.variables === 'AGAINST'}
                className="flex-1 rounded-2xl h-14" 
              />
            </View>
            <TouchableOpacity 
              onPress={() => voteMutation.mutate('ABSTAIN')}
              disabled={voteMutation.isPending}
              className="mt-6 items-center"
            >
              <Text className="text-gray-500 font-bold text-xs uppercase tracking-widest">Abstain from vote</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
