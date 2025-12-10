import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { Power, User } from 'lucide-react-native';
import { initSocket, disconnectSocket } from '../lib/socket';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = ({ navigation }) => {
  const { logout, authUser } = useAuthStore();
  const { getUsers, users, isUsersLoading, setSelectedUser, selectedUser, subscribeToOnlineUsers, unsubscribeFromOnlineUsers, onlineUsers } = useChatStore();

  useEffect(() => {
    getUsers();
    
    if (authUser) {
      initSocket(authUser._id);
      subscribeToOnlineUsers();
    }

    return () => {
      unsubscribeFromOnlineUsers();
      disconnectSocket();
    };
  }, [authUser]);

  const handleUserPress = (user) => {
    setSelectedUser(user);
    navigation.navigate('Chat');
  };

  const renderUser = ({ item }) => {
    const isOnline = onlineUsers.includes(item._id);

    return (
      <TouchableOpacity 
        className="flex-row items-center p-4 border-b border-gray-100 bg-white"
        onPress={() => handleUserPress(item)}
      >
        <View className="relative">
          {item.profilePic ? (
             <Image 
                source={{ uri: item.profilePic }} 
                className="w-12 h-12 rounded-full bg-gray-200"
             />
          ) : (
            <View className="w-12 h-12 rounded-full bg-gray-200 justify-center items-center">
                <User size={24} color="gray" />
            </View>
          )}
          {isOnline && (
            <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </View>

        <View className="ml-3 flex-1">
          <Text className="font-semibold text-gray-900">{item.fullName}</Text>
          <Text className="text-sm text-gray-500" numberOfLines={1}>
             {isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* Header */}
      <View className="flex-row justify-between items-center p-4 border-b border-gray-100 bg-white">
        <Text className="text-2xl font-bold text-gray-900">Chats</Text>
        <TouchableOpacity onPress={logout} className="p-2 bg-gray-100 rounded-full">
          <Power size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* User List */}
      {isUsersLoading ? (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : (
        <FlatList
            data={users}
            keyExtractor={item => item._id}
            renderItem={renderUser}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
                <View className="p-4 items-center">
                    <Text className="text-gray-500">No users found</Text>
                </View>
            }
        />
      )}
    </SafeAreaView>
  );
};

export default HomeScreen;
