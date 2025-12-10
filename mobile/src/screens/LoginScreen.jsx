import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Mail, Lock, Eye, EyeOff, MessageSquare } from 'lucide-react-native';

const LoginScreen = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { login, isLoggingIn } = useAuthStore();

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const res = await login(formData);
    if (!res.success) {
      Alert.alert('Error', res.message);
    }
    // Navigation to Home is handled by App.js based on authUser state
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <View className="items-center mb-8">
        <View className="w-16 h-16 bg-primary/10 items-center justify-center rounded-2xl bg-indigo-100 mb-4">
            <MessageSquare size={32} color="#4F46E5" />
        </View>
        <Text className="text-2xl font-bold text-gray-900">Welcome Back</Text>
        <Text className="text-gray-500 mt-2">Sign in to your account</Text>
      </View>

      <View className="space-y-4">
        {/* Email */}
        <View>
            <Text className="text-gray-700 mb-1">Email</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <Mail size={20} color="gray" className="mr-2" />
                <TextInput
                    className="flex-1 text-gray-900 ml-2"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>
        </View>

        {/* Password */}
        <View>
            <Text className="text-gray-700 mb-1">Password</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <Lock size={20} color="gray" className="mr-2" />
                <TextInput
                    className="flex-1 text-gray-900 ml-2"
                    placeholder="••••••••"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={20} color="gray" /> : <Eye size={20} color="gray" />}
                </TouchableOpacity>
            </View>
        </View>
        
        {/* Button */}
        <TouchableOpacity 
            className={`bg-indigo-600 rounded-lg py-3 mt-4 ${isLoggingIn ? 'opacity-70' : ''}`}
            onPress={handleLogin}
            disabled={isLoggingIn}
        >
            {isLoggingIn ? (
                <ActivityIndicator color="white" />
            ) : (
                <Text className="text-white text-center font-bold text-lg">Sign in</Text>
            )}
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center mt-6">
        <Text className="text-gray-500">Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text className="text-indigo-600 font-bold">Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
