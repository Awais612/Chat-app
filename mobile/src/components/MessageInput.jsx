import { View, TextInput, TouchableOpacity, Alert, Image, ActivityIndicator, Text } from 'react-native';
import React, { useState, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { Image as ImageIcon, Mic, Send, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MessageInput = () => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const recordingRef = useRef(null);
  const { sendMessage, sendTypingStatus } = useChatStore();
  const [isSending, setIsSending] = useState(false);
  const insets = useSafeAreaInsets();

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Permission denied', 'Microphone permission is required');

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    if (!recordingRef.current) return;

    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    recordingRef.current = null;

    if (uri) {
      try {
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        handleSendMessage(null, `data:audio/m4a;base64,${base64Audio}`);
      } catch (error) {
        console.error('Error processing audio', error);
      }
    }
  };

  const handleSendMessage = async (imgData = null, audioData = null) => {
    if (!text.trim() && !image && !imgData && !audioData) return;

    setIsSending(true);
    const messageData = {
      text: text.trim(),
      image: imgData || image,
      audio: audioData,
    };

    const res = await sendMessage(messageData);
    setIsSending(false);

    if (res.success) {
      setText('');
      setImage(null);
    } else {
        Alert.alert('Error', 'Failed to send message');
    }
  };

  return (
    <View 
      className="p-2 bg-white border-t border-gray-100 w-full"
      style={{ paddingBottom: Math.max(insets.bottom, 20) }}
    >
      {image && (
        <View className="relative mb-2 w-20 h-20">
          <Image source={{ uri: image }} className="w-20 h-20 rounded-lg" />
          <TouchableOpacity 
            className="absolute -top-1 -right-1 bg-gray-200 rounded-full p-1"
            onPress={() => setImage(null)}
          >
            <X size={12} color="black" />
          </TouchableOpacity>
        </View>
      )}

      <View className="flex-row items-center gap-2">
        <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
            <TextInput
                className="flex-1 text-gray-900 mx-2 max-h-20"
                placeholder="Type a message..."
                value={text}
                onChangeText={(val) => {
                    setText(val);
                    sendTypingStatus(val.length > 0);
                }}
                multiline
            />
            
            <TouchableOpacity onPress={handleImagePick}>
                 <ImageIcon size={20} color={image ? "#4F46E5" : "gray"} />
            </TouchableOpacity>
        </View>

        {text.trim() || image ? (
             <TouchableOpacity 
                className="bg-indigo-600 rounded-full p-3 items-center justify-center"
                onPress={() => handleSendMessage()}
                disabled={isSending}
             >
                {isSending ? <ActivityIndicator size="small" color="white"/> : <Send size={20} color="white" />}
             </TouchableOpacity>
        ) : (
            <TouchableOpacity 
                className={`rounded-full p-3 items-center justify-center ${isRecording ? 'bg-red-500' : 'bg-gray-200'}`}
                onLongPress={startRecording}
                onPressOut={stopRecording}
                activeOpacity={0.7}
            >
                <Mic size={20} color={isRecording ? "white" : "black"} />
            </TouchableOpacity>
        )}
      </View>
      {isRecording && <Text className="text-center text-red-500 text-xs mt-1">Recording... (Release to send)</Text>}
    </View>
  );
};

export default MessageInput;
