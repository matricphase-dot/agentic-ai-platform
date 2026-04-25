import React, { useState } from 'react';
import { ScrollView, View, Text, RefreshControl, TouchableOpacity } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Clock, MessageSquare, ChevronRight, Vote } from 'lucide-react-native';
import { router } from 'expo-router';

export default function GovernanceScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ACTIVE');

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['proposals', filter],
    queryFn: () => api.governance.proposals({ status: filter })
  });

  const proposals = (response as any)?.data?.proposals || [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#10B981';
      case 'PASSED': return '#3B82F6';
      case 'REJECTED': return '#EF4444';
      default: return '#6B7280';
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-black"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7C3AED" />}
    >
      <View className="p-6 pt-12">
        <View className="mb-8">
          <Text className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mb-1">Protocol DAO</Text>
          <Text className="text-white text-3xl font-black">Governance</Text>
        </View>

        <View className="flex-row mb-8 gap-x-4">
          {['ACTIVE', 'PASSED', 'REJECTED'].map((f) => (
            <TouchableOpacity 
              key={f}
              onPress={() => setFilter(f)}
              className={`flex-1 py-3 rounded-2xl border items-center ${
                filter === f ? 'bg-[#7C3AED10] border-[#7C3AED50]' : 'bg-gray-900 border-gray-800'
              }`}
            >
              <Text className={`font-black text-[10px] tracking-tighter ${filter === f ? 'text-[#7C3AED]' : 'text-gray-500'}`}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-white text-xl font-bold mb-6">Proposals</Text>

        {isLoading ? (
          [1, 2, 3].map(i => (
            <View key={i} className="h-48 bg-gray-900 rounded-3xl mb-4 border border-gray-800 animate-pulse" />
          ))
        ) : proposals.length > 0 ? (
          proposals.map((prop: any, i: number) => (
            <Card 
              key={i} 
              className="mb-4 p-6 rounded-[32px]"
              onPress={() => router.push(`/proposal/${prop.id}`)}
            >
              <View className="flex-row items-center justify-between mb-4">
                <Badge label={prop.proposalType} />
                <View className="flex-row items-center">
                  <Clock size={12} color={getStatusColor(prop.status)} />
                  <Text style={{ color: getStatusColor(prop.status) }} className="text-[10px] font-black uppercase ml-1 tracking-widest">{prop.status}</Text>
                </View>
              </View>

              <Text className="text-white font-bold text-lg mb-4 leading-6">{prop.title}</Text>
              
              <View className="h-1.5 bg-gray-950 rounded-full overflow-hidden flex-row mb-6">
                <View className="h-full bg-[#10B981]" style={{ width: `${prop.votesFor || 0}%` }} />
                <View className="h-full bg-[#EF4444]" style={{ width: `${prop.votesAgainst || 0}%` }} />
              </View>

              <View className="flex-row items-center justify-between pt-4 border-t border-gray-950">
                <View className="flex-row items-center">
                  <Vote size={14} color="#6B7280" />
                  <Text className="text-gray-500 text-[10px] font-bold ml-1 uppercase tracking-widest">{prop.totalVotes || 0} Votes</Text>
                </View>
                <View className="flex-row items-center">
                   <Text className="text-[#7C3AED] font-black text-[10px] uppercase mr-1 tracking-widest">Details</Text>
                   <ChevronRight size={14} color="#7C3AED" />
                </View>
              </View>
            </Card>
          ))
        ) : (
          <View className="py-20 items-center justify-center border border-dashed border-gray-800 rounded-[32px]">
             <Text className="text-gray-500 font-medium">No proposals found in this epoch.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
