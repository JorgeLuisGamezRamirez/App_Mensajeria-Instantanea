import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, Share, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { chatService } from '../services/chatService';
import { Message, ChatRoom, User } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const SAMPLE_ATTACHMENTS = [
  'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
  'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400'
];

export const ChatScreen = ({ route, navigation }: Props) => {
  const { chatId } = route.params;
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInfo, setChatInfo] = useState<ChatRoom | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const loadChatData = async () => {
    const user = await chatService.getCurrentUser();
    const chat = await chatService.findChatByDeepLink(chatId);

    if (!chat) {
      Alert.alert('Enlace Inválido', 'La conversación solicitada no existe o expiró.', [
        { text: 'Aceptar', onPress: () => navigation.navigate('Home') }
      ]);
      return;
    }

    const msgs = await chatService.getMessages(chatId);
    setCurrentUser(user);
    setChatInfo(chat);
    setMessages(msgs);
  };

  useEffect(() => {
    loadChatData();
  }, [chatId]);

  const handleSend = async (attachmentUrl?: string) => {
    if (!inputText.trim() && !attachmentUrl) return;

    const textToSend = inputText;
    setInputText('');
    
    // 1. Guardar mensaje enviado por MÍ
    await chatService.sendMessage(chatId, textToSend, undefined, attachmentUrl);
    await loadChatData();

    // 2. Simular respuesta en tiempo real del OTRO usuario (Ariel Perea)
    const otherUser = {
      id: chatInfo?.id === 'chat_direct_2' ? 'usr_2' : 'usr_3',
      name: chatInfo?.name || 'Ariel Perea'
    };

    setTimeout(() => {
      setIsTyping(true);
      setTimeout(async () => {
        setIsTyping(false);
        await chatService.sendMessage(chatId, '¡Mensaje recibido en tiempo real! 👍', otherUser);
        await loadChatData();
      }, 1500);
    }, 800);
  };

  const handleShareDeepLink = async () => {
    const deepLinkUrl = `https://chat.ejemplo.com/chat/${chatId}`;
    try {
      await Share.share({
        message: `Únete a la conversación en vivo: ${deepLinkUrl}`,
        url: deepLinkUrl
      });
    } catch (error) {
      console.log('Error compartiendo Deep Link:', error);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    await chatService.deleteMessage(msgId);
    loadChatData();
  };

  const getCheckMarks = (status: string) => {
    switch (status) {
      case 'read': return '✓✓';
      case 'delivered': return '✓✓';
      case 'sent': return '✓';
      default: return '⏳';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header del Chat */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Volver</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{chatInfo?.name || 'Ariel Perea'}</Text>
          <Text style={styles.headerSub}>
            {isTyping ? '✍️ escribiendo...' : '🟢 WebSocket Conectado'}
          </Text>
        </View>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShareDeepLink}>
          <Text style={styles.shareBtnText}>🔗 Enlace</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de Mensajes */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => {
          const isMine = item.senderId === currentUser?.id;

          return (
            <TouchableOpacity 
              onLongPress={() => isMine && handleDeleteMessage(item.id)} 
              style={[styles.msgBox, isMine ? styles.msgMine : styles.msgOther]}
            >
              <Text style={[styles.senderName, isMine ? styles.senderMine : styles.senderOther]}>
                {isMine ? 'Tú' : item.senderName}
              </Text>
              
              {item.attachment ? (
                <Image source={{ uri: item.attachment.url }} style={styles.msgAttachmentImg} />
              ) : null}

              <Text style={styles.msgText}>{item.text}</Text>
              
              <View style={styles.msgMeta}>
                <Text style={styles.msgTime}>
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                {isMine ? (
                  <Text style={[styles.checkMarks, item.status === 'read' && styles.checkRead]}>
                    {getCheckMarks(item.status)}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Barra de Entrada */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.attachBtn} onPress={() => handleSend(SAMPLE_ATTACHMENTS[0])}>
          <Text style={{ fontSize: 18 }}>📷</Text>
        </TouchableOpacity>
        <TextInput 
          value={inputText} 
          onChangeText={setInputText} 
          placeholder="Escribe un mensaje..." 
          placeholderTextColor="#94A3B8"
          style={styles.input} 
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
          <Text style={styles.sendBtnText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, backgroundColor: '#1E293B' },
  backBtn: { color: '#38BDF8', fontWeight: 'bold' },
  headerInfo: { alignItems: 'center' },
  headerTitle: { color: '#F8FAFC', fontWeight: 'bold', fontSize: 16 },
  headerSub: { color: '#10B981', fontSize: 11 },
  shareBtn: { backgroundColor: '#334155', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  shareBtnText: { color: '#38BDF8', fontSize: 11, fontWeight: 'bold' },
  msgBox: { padding: 12, borderRadius: 14, marginVertical: 4, marginHorizontal: 12, maxWidth: '80%' },
  msgMine: { alignSelf: 'flex-end', backgroundColor: '#0284C7' },
  msgOther: { alignSelf: 'flex-start', backgroundColor: '#334155' },
  senderName: { fontSize: 11, fontWeight: 'bold', marginBottom: 2 },
  senderMine: { color: '#BAE6FD' },
  senderOther: { color: '#38BDF8' },
  msgText: { color: '#FFF', fontSize: 14 },
  msgAttachmentImg: { width: 180, height: 120, borderRadius: 8, marginVertical: 4 },
  msgMeta: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4, gap: 4 },
  msgTime: { fontSize: 9, color: '#CBD5E1' },
  checkMarks: { fontSize: 10, color: '#CBD5E1', fontWeight: 'bold' },
  checkRead: { color: '#38BDF8' },
  inputBar: { flexDirection: 'row', padding: 10, backgroundColor: '#1E293B', alignItems: 'center', gap: 8 },
  attachBtn: { padding: 8, backgroundColor: '#334155', borderRadius: 20 },
  input: { flex: 1, backgroundColor: '#0F172A', color: '#FFF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14 },
  sendBtn: { backgroundColor: '#38BDF8', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16 },
  sendBtnText: { color: '#0F172A', fontWeight: 'bold', fontSize: 13 }
});
