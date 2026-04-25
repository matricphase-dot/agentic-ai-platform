import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Pressable, ScrollView, RefreshControl } from 'react-native';
import { AgentCard } from '../../components/AgentCard';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Search } from 'lucide-react-native';

const CATEGORIES = ['All', 'Chatbot', 'Data Analyst', 'Code Assistant', 'Automation', 'Finance'];

export default function MarketplaceScreen() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: response, isLoading, refetch } = useQuery({
    queryKey: ['agents', debouncedSearch, category],
    queryFn: () => api.marketplace.list({ 
      search: debouncedSearch || undefined, 
      category: category === 'All' ? undefined : category 
    })
  });

  const agents = (response as any)?.data?.agents || [];

  return (
    <View className="flex-1 bg-black">
      <View className="p-6 pb-2 pt-12">
        <Text className="text-white text-3xl font-black mb-6">Marketplace</Text>
        
        <View className="flex-row items-center bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3 mb-6">
          <Search size={20} color="#6B7280" />
          <TextInput 
            placeholder="Search agents..." 
            placeholderTextColor="#6B7280"
            className="flex-1 ml-3 text-white font-medium"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="flex-row mb-4"
        >
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setCategory(cat)}
              className={`px-5 py-2.5 rounded-full mr-2 border ${
                category === cat ? 'bg-[#7C3AED] border-[#7C3AED]' : 'bg-gray-900 border-gray-800'
              }`}
            >
              <Text className={`font-bold text-xs ${category === cat ? 'text-white' : 'text-gray-400'}`}>
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList 
        data={agents}
        renderItem={({ item }) => <AgentCard agent={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 24, paddingTop: 0 }}
        refreshControl={
          <RefreshControl refreshing={isLoading && agents.length > 0} onRefresh={refetch} tintColor="#7C3AED" />
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="gap-y-4">
              {[1, 2, 3].map(i => (
                <View key={i} className="h-40 bg-gray-900 rounded-3xl animate-pulse border border-gray-800" />
              ))}
            </View>
          ) : (
            <View className="py-20 items-center justify-center">
              <Text className="text-gray-500 font-medium">No agents found matching criteria.</Text>
            </View>
          )
        }
      />
    </View>
  );
}
