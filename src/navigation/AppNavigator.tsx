import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';

import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { chatService } from '../services/chatService';

export type RootStackParamList = {
  Login: { targetChatId?: string };
  Home: undefined;
  Chat: { chatId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const prefix = Linking.createURL('/');

export const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState<'Login' | 'Home'>('Login');
  const [targetChatId, setTargetChatId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserAndLink = async () => {
      const user = await chatService.getCurrentUser();
      const initialUrl = await Linking.getInitialURL();

      if (initialUrl) {
        const parsed = Linking.parse(initialUrl);
        if (parsed.path && parsed.path.includes('chat/')) {
          const extractedChatId = parsed.path.split('chat/')[1];
          setTargetChatId(extractedChatId);
        }
      }

      setInitialRoute(user ? 'Home' : 'Login');
      setLoading(false);
    };

    checkUserAndLink();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer
      linking={{
        prefixes: [prefix, 'https://chat.ejemplo.com'],
        config: {
          screens: {
            Chat: 'chat/:chatId'
          }
        }
      }}
    >
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          initialParams={{ targetChatId }} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
