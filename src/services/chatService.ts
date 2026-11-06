import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, ChatRoom, User, MessageStatus } from '../types';

const STORAGE_USERS_KEY = '@chat_app_users';
const STORAGE_CHATS_KEY = '@chat_app_chats';
const STORAGE_MESSAGES_KEY = '@chat_app_messages';
const STORAGE_SESSION_KEY = '@chat_app_current_user';

export const mockUsers: User[] = [
  { id: 'usr_1', name: 'Jorge Luis Gámez', email: 'jorge.gamez@uat.edu.mx', avatar: 'https://picsum.photos/id/64/100/100', isOnline: true },
  { id: 'usr_2', name: 'Ariel Perea', email: 'ariel.perea@uat.edu.mx', avatar: 'https://picsum.photos/id/1005/100/100', isOnline: true },
  { id: 'usr_3', name: 'Ismael del Ángel', email: 'ismael.delangel@uat.edu.mx', avatar: 'https://picsum.photos/id/1025/100/100', isOnline: false },
  { id: 'usr_4', name: 'Edgar Rocha', email: 'edgar.rocha@uat.edu.mx', avatar: 'https://picsum.photos/id/1012/100/100', isOnline: true }
];

export const mockChats: ChatRoom[] = [
  {
    id: '12345',
    name: 'Grupo Sistemas UAT',
    type: 'group',
    participants: mockUsers,
    unreadCount: 2,
    inviteCode: '12345'
  },
  {
    id: 'chat_direct_2',
    name: 'Ariel Perea',
    type: 'direct',
    participants: [mockUsers[0], mockUsers[1]],
    unreadCount: 0
  }
];

export const chatService = {
  // Autenticación de Usuario
  login: async (email: string): Promise<User> => {
    const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || {
      id: 'usr_' + Date.now(),
      name: email.split('@')[0],
      email: email,
      avatar: 'https://picsum.photos/id/1062/100/100',
      isOnline: true
    };
    await AsyncStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
    return user;
  },

  getCurrentUser: async (): Promise<User | null> => {
    const data = await AsyncStorage.getItem(STORAGE_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout: async () => {
    await AsyncStorage.removeItem(STORAGE_SESSION_KEY);
  },

  // Obtener conversaciones e historial
  getChats: async (): Promise<ChatRoom[]> => {
    const data = await AsyncStorage.getItem(STORAGE_CHATS_KEY);
    return data ? JSON.parse(data) : mockChats;
  },

  getMessages: async (chatId: string): Promise<Message[]> => {
    const data = await AsyncStorage.getItem(STORAGE_MESSAGES_KEY);
    const allMessages: Message[] = data ? JSON.parse(data) : [];
    return allMessages.filter(m => m.chatId === chatId).sort((a, b) => a.createdAt - b.createdAt);
  },

  // Enviar Mensaje (Con ciclo de estados WebSocket: sending -> sent -> delivered -> read)
  sendMessage: async (chatId: string, text: string, attachmentUrl?: string): Promise<Message> => {
    const currentUser = await chatService.getCurrentUser();
    const data = await AsyncStorage.getItem(STORAGE_MESSAGES_KEY);
    const allMessages: Message[] = data ? JSON.parse(data) : [];

    const newMessage: Message = {
      id: 'msg_' + Date.now(),
      chatId,
      senderId: currentUser?.id || 'usr_1',
      senderName: currentUser?.name || 'Jorge',
      text,
      createdAt: Date.now(),
      status: 'sent',
      attachment: attachmentUrl ? { id: 'att_' + Date.now(), url: attachmentUrl, type: 'image', name: 'adjunto.jpg' } : undefined
    };

    allMessages.push(newMessage);
    await AsyncStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(allMessages));
    return newMessage;
  },

  // Editar y Eliminar mensajes
  editMessage: async (messageId: string, newText: string) => {
    const data = await AsyncStorage.getItem(STORAGE_MESSAGES_KEY);
    const allMessages: Message[] = data ? JSON.parse(data) : [];
    const msg = allMessages.find(m => m.id === messageId);
    if (msg) {
      msg.text = newText;
      msg.isEdited = true;
      await AsyncStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(allMessages));
    }
  },

  deleteMessage: async (messageId: string) => {
    const data = await AsyncStorage.getItem(STORAGE_MESSAGES_KEY);
    const allMessages: Message[] = data ? JSON.parse(data) : [];
    const filtered = allMessages.filter(m => m.id !== messageId);
    await AsyncStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(filtered));
  },

  // Crear Conversación Grupal
  createGroup: async (name: string, participantIds: string[]): Promise<ChatRoom> => {
    const chats = await chatService.getChats();
    const selectedParticipants = mockUsers.filter(u => participantIds.includes(u.id));
    
    const newChat: ChatRoom = {
      id: 'group_' + Date.now(),
      name,
      type: 'group',
      participants: selectedParticipants,
      unreadCount: 0,
      inviteCode: 'group_' + Date.now()
    };

    chats.unshift(newChat);
    await AsyncStorage.setItem(STORAGE_CHATS_KEY, JSON.stringify(chats));
    return newChat;
  },

  // Validar Deep Link
  findChatByDeepLink: async (chatId: string): Promise<ChatRoom | null> => {
    const chats = await chatService.getChats();
    return chats.find(c => c.id === chatId || c.inviteCode === chatId) || null;
  }
};
