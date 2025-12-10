import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useRef, useEffect, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Play, Pause } from 'lucide-react-native';

// Helper for formatted time
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const AudioBubble = ({ uri, isMyMessage }) => {
    const [sound, setSound] = useState();
    const [isPlaying, setIsPlaying] = useState(false);

    async function playSound() {
        if (isPlaying && sound) {
            await sound.pauseAsync();
            setIsPlaying(false);
            return;
        }

        if (sound) {
            await sound.playAsync();
            setIsPlaying(true);
            return;
        }

        try {
            await Audio.setAudioModeAsync({
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
            });

            // Extract base64 data properly
            const base64Data = uri.split('base64,')[1] || uri;
            const filename = `${FileSystem.cacheDirectory}audio_${Date.now()}.m4a`;

            await FileSystem.writeAsStringAsync(filename, base64Data, {
                encoding: FileSystem.EncodingType.Base64,
            });

            console.log('Loading Sound', filename);
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: filename },
                { shouldPlay: true }
            );
            setSound(newSound);
            setIsPlaying(true);

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsPlaying(false);
                    newSound.setPositionAsync(0);
                }
            });
        } catch (error) {
            console.error('Error playing sound:', error);
            alert('Error playing audio');
        }
    }

    useEffect(() => {
        return () => {
             // Cleanup sound
            if (sound) {
                console.log('Unloading Sound');
                sound.unloadAsync();
            }
        };
    }, [sound]);

    return (
        <View className="flex-row items-center gap-2 min-w-[100px]">
            <TouchableOpacity onPress={playSound} className="bg-gray-200 rounded-full p-2">
                 {isPlaying ? <Pause size={16} color="black" /> : <Play size={16} color="black" />}
            </TouchableOpacity>
            <Text className={isMyMessage ? "text-indigo-100" : "text-gray-900"}>Voice Message</Text>
        </View>
    );
};

const MessageList = () => {
  const { messages, isMessagesLoading, selectedUser, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { authUser } = useAuthStore();
  const flatListRef = useRef(null);

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, subscribeToMessages, unsubscribeFromMessages]);
  
  // Scroll to bottom when messages change
  // Note: Since we use inverted=true, "bottom" is actually the top of the list in code (index 0)
  // So adding new message at end of array (messages are chronological 0 -> old, N -> new)
  // We need to reverse the array for inverted FlatList or scroll appropriately.
  // Standard Inverted FlatList expects data[0] to be the most recent message.
  // But our store has messages chronological (0=oldest).
  // Strategy: Pass [...messages].reverse() to inverted FlatList.

  if (isMessagesLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const isMyMessage = item.senderId === authUser._id;

    return (
        <View className={`my-1 mx-2 flex-row ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
            {!isMyMessage && (
                <View className="flex-col justify-end mr-2 pb-1">
                     <Image 
                        source={{ uri: selectedUser?.profilePic || 'https://example.com/placeholder.png' }} 
                        className="w-8 h-8 rounded-full bg-gray-200"
                    />
                </View>
            )}

            <View 
                className={`rounded-2xl px-4 py-2 ${
                    isMyMessage ? 'bg-indigo-600 rounded-br-none' : 'bg-gray-200 rounded-bl-none'
                }`}
                style={{ maxWidth: '75%' }}
            >
                {item.image && (
                    <Image 
                        source={{ uri: item.image }} 
                        className="w-48 h-48 rounded-lg mb-2 bg-gray-300" 
                        resizeMode="cover"
                    />
                )}
                
                {item.audio && (
                    <AudioBubble uri={item.audio} isMyMessage={isMyMessage} />
                )}

                {item.text && (
                     <Text className={`text-base ${isMyMessage ? 'text-white' : 'text-gray-900'}`}>{item.text}</Text>
                )}

                <Text className={`text-[10px] mt-1 ${isMyMessage ? 'text-indigo-200' : 'text-gray-500'} self-end`}>
                    {formatTime(item.createdAt)}
                </Text>
            </View>
        </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={[...messages].reverse()} // Reverse for inverted list
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ paddingVertical: 10 }}
      inverted
      showsVerticalScrollIndicator={false}
    />
  );
};

export default MessageList;
