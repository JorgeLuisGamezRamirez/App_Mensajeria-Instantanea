import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { chatService } from '../services/chatService';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen = ({ route, navigation }: Props) => {
  const [email, setEmail] = useState('jorge.gamez@uat.edu.mx');
  const targetChatId = route.params?.targetChatId;

  const handleLogin = async () => {
    if (!email.trim()) return;
    await chatService.login(email);
    
    if (targetChatId) {
      navigation.replace('Chat', { chatId: targetChatId });
    } else {
      navigation.replace('Home');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logo}>💬</Text>
        <Text style={styles.title}>Mensajería en Tiempo Real</Text>
        <Text style={styles.sub}>WebSockets & Deep Linking Demo</Text>

        {targetChatId ? (
          <View style={styles.deepLinkAlert}>
            <Text style={styles.deepLinkText}>🔗 Intentando acceder a conversación: {targetChatId}</Text>
          </View>
        ) : null}

        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput 
          value={email} 
          onChangeText={setEmail} 
          placeholder="usuario@correo.com" 
          style={styles.input}
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.btn} onPress={handleLogin}>
          <Text style={styles.btnText}>Iniciar Sesión / Acceder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: { backgroundColor: '#1E293B', padding: 26, borderRadius: 20, width: '100%', maxWidth: 380, alignItems: 'center' },
  logo: { fontSize: 44, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 4 },
  sub: { fontSize: 13, color: '#94A3B8', marginBottom: 20 },
  deepLinkAlert: { backgroundColor: '#334155', padding: 10, borderRadius: 8, marginBottom: 15, width: '100%' },
  deepLinkText: { color: '#38BDF8', fontSize: 12, textAlign: 'center', fontWeight: '600' },
  label: { fontSize: 12, color: '#CBD5E1', alignSelf: 'flex-start', marginBottom: 6 },
  input: { width: '100%', backgroundColor: '#0F172A', color: '#FFF', borderRadius: 10, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: '#475569' },
  btn: { backgroundColor: '#38BDF8', paddingVertical: 14, borderRadius: 12, width: '100%', alignItems: 'center' },
  btnText: { color: '#0F172A', fontWeight: 'bold', fontSize: 15 }
});
