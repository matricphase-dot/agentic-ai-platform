import React, { useState, useRef, useMemo, useCallback } from 'react';
import { ScrollView, View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Star, ChevronLeft, Share2, Zap, Play, Terminal, Info, Send } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { api } from '../../lib/api';
import BottomSheet, { BottomSheetView, BottomSheetTextInput } from '@gorhom/bottom-sheet';

export default function AgentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [invoking, setInvoking] = useState(false);
  const [invocationResult, setInvocationResult] = useState<any>(null);
  const [input, setInput] = useState('');
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%'], []);

  const { data: response, isLoading } = useQuery({
    queryKey: ['agent', id],
    queryFn: () => api.marketplace.get(id as string)
  });

  const agent = (response as any)?.data;

  const handleInvoke = async () => {
    if (!input.trim()) {
      Toast.show({ type: 'error', text1: 'Input required' });
      return;
    }
    setInvoking(true);
    try {
      const res: any = await api.invoke.run(id as string, { input });
      setInvocationResult(res.data || res);
      bottomSheetRef.current?.close();
      Toast.show({ type: 'success', text1: 'Invocation Success' });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Invocation Failed', text2: e.response?.data?.message || e.message });
    } finally {
      setInvoking(false);
    }
  };

  const openInvokeSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  if (isLoading) return (
    <View className="flex-1 bg-black items-center justify-center">
      <Text className="text-gray-500 font-bold uppercase tracking-widest animate-pulse">Syncing Agent...</Text>
    </View>
  );

  return (
    <View className="flex-1 bg-black">
      <ScrollView className="flex-1">
        <View className="relative h-72">
          <Image 
            source={{ uri: agent?.imageUrl || 'https://images.unsplash.com/photo-1677442136019-21780ecad995' }}
            className="w-full h-full opacity-50"
            contentFit="cover"
          />
          <View className="absolute top-12 left-6 right-6 flex-row justify-between">
            <Pressable onPress={() => router.back()} className="w-10 h-10 bg-black/50 rounded-full items-center justify-center border border-white/10">
              <ChevronLeft size={24} color="white" />
            </Pressable>
            <Pressable className="w-10 h-10 bg-black/50 rounded-full items-center justify-center border border-white/10">
              <Share2 size={20} color="white" />
            </Pressable>
          </View>
          <View className="absolute bottom-6 left-6 right-6">
            <View className="flex-row items-center gap-x-2 mb-2">
              <Badge label={agent?.category} />
              <View className="flex-row items-center bg-black/50 px-2 py-1 rounded-md">
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Text className="text-white text-[10px] font-bold ml-1">{agent?.analytics?.avgRating?.toFixed(1) || '5.0'}</Text>
              </View>
            </View>
            <Text className="text-white text-3xl font-black">{agent?.name}</Text>
          </View>
        </View>

        <View className="p-6">
          <View className="flex-row items-center mb-8">
            <Image source={{ uri: agent?.creator?.avatar || 'https://github.com/shadcn.png' }} className="w-10 h-10 rounded-full mr-3 border border-gray-800" />
            <View>
              <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">Architect</Text>
              <Text className="text-white font-bold">{agent?.user?.name || 'Protocol Labs'}</Text>
            </View>
          </View>

          <View className="flex-row justify-between mb-8 gap-x-3">
            {[
              { label: 'Uptime', value: '99.9%', color: '#10B981' },
              { label: 'Latency', value: '84ms', color: '#3B82F6' },
              { label: 'Runs', value: '1.4k', color: '#7C3AED' }
            ].map((stat, i) => (
              <View key={i} className="items-center px-4 py-3 bg-gray-900 rounded-2xl border border-gray-800 flex-1">
                 <Text className="text-gray-500 text-[8px] font-black uppercase mb-1 tracking-widest">{stat.label}</Text>
                 <Text style={{ color: stat.color }} className="font-black text-xs">{stat.value}</Text>
              </View>
            ))}
          </View>

          <Text className="text-white text-lg font-bold mb-3">Capabilities</Text>
          <Text className="text-gray-400 leading-relaxed mb-8 text-sm">
            {agent?.description}
          </Text>

          <Card className="mb-8 border-[#7C3AED50] bg-[#7C3AED10] p-6 rounded-[32px]">
            <View className="flex-row justify-between mb-4">
              <View>
                <Text className="text-white font-bold text-lg">Infrastructure Cost</Text>
                <Text className="text-[#7C3AED] text-xs font-medium">{agent?.pricePerCall || 0} Credits per invocation</Text>
              </View>
              <Zap size={24} color="#7C3AED" />
            </View>
            <Button 
              title="Initialize Session" 
              onPress={openInvokeSheet} 
              className="rounded-2xl"
              leftIcon={<Play size={18} color="white" />}
            />
          </Card>

          {invocationResult && (
            <View className="mb-8">
              <View className="flex-row items-center mb-3">
                <Terminal size={16} color="#10B981" />
                <Text className="text-[#10B981] font-bold text-[10px] uppercase ml-2 tracking-widest">Execution Trace</Text>
              </View>
              <View className="bg-gray-950 p-4 rounded-2xl border border-gray-800">
                <Text className="text-gray-300 font-mono text-[11px]">
                  {typeof invocationResult === 'string' ? invocationResult : JSON.stringify(invocationResult, null, 2)}
                </Text>
              </View>
            </View>
          )}

          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-white text-lg font-bold">Staking Infrastructure</Text>
            <Info size={18} color="#6B7280" />
          </View>
          <Card className="mb-12 p-6 rounded-[32px]">
            <Text className="text-gray-400 text-sm mb-5 leading-relaxed">Stake AGNT on this agent to secure its compute nodes and earn 30% of its revenue share.</Text>
            <Button 
              title={`Stake on ${agent?.name}`} 
              onPress={() => router.push(`/stake/${id}`)} 
              variant="secondary"
              className="rounded-2xl"
            />
          </Card>
        </View>
      </ScrollView>

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#0F0F0F' }}
        handleIndicatorStyle={{ backgroundColor: '#333' }}
      >
        <BottomSheetView className="p-6 gap-y-4">
          <Text className="text-white text-xl font-bold">Agent Input</Text>
          <Text className="text-gray-500 text-xs">Enter the parameters for this agent invocation.</Text>
          <BottomSheetTextInput
            className="bg-gray-900 text-white p-4 rounded-xl border border-gray-800 min-h-[100px]"
            placeholder="Type your command or query..."
            placeholderTextColor="#444"
            multiline
            value={input}
            onChangeText={setInput}
          />
          <Button 
            title="Run Agent" 
            onPress={handleInvoke} 
            loading={invoking}
            className="mt-2"
            leftIcon={<Send size={18} color="white" />}
          />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
