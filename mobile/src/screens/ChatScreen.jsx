import { View, Text, KeyboardAvoidingView, Platform, TouchableOpacity, Image } from 'react-native';
import React, { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import { ChevronLeft, Phone, Video } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatScreen = () => {
  const { selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages, isMessagesLoading, onlineUsers } = useChatStore();
  const navigation = useNavigation();

  useEffect(() => {
    if (selectedUser) {
        getMessages(selectedUser._id);
        subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  if (!selectedUser) {
    return (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator />
        </View>
    );
  }

  const isOnline = onlineUsers.includes(selectedUser._id);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-gray-100 bg-white z-10">
            <View className="flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-2 p-1">
                    <ChevronLeft size={24} color="#4B5563" />
                </TouchableOpacity>
                
                <View className="relative">
                    <Image 
                        source={{ uri: selectedUser.profilePic || 'https://example.com/placeholder.png' }} 
                        className="w-10 h-10 rounded-full bg-gray-200"
                    />
                    {isOnline && (
                        <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                    )}
                </View>

                <View className="ml-3">
                    <Text className="font-bold text-lg text-gray-900">{selectedUser.fullName}</Text>
                     <Text className="text-xs text-gray-500">{isOnline ? 'Online' : 'Offline'}</Text>
                </View>
            </View>

            <View className="flex-row items-center gap-4">
                <TouchableOpacity onPress={() => alert('Audio call functionality coming soon')}>
                    <Phone size={22} color="#4B5563" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => alert('Video call functionality coming soon')}>
                    <Video size={24} color="#4B5563" />
                </TouchableOpacity>
            </View>
        </View>

        {/* Messages */}
        <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
            <View className="flex-1 px-2">
                 <MessageList />
            </View>
            <MessageInput />
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
