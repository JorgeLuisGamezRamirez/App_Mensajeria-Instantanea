import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, LayoutAnimation, Platform, UIManager } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { chatService, mockUsers } from '../services/chatService';
import { ChatRoom, User } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export const HomeScreen = ({ navigation }: Props) => {
  const [chats, setChats] = useState<ChatRoom[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'chats' | 'users'>('chats');

  const loadData = async () => {
    const user = await chatService.getCurrentUser();
    const data = await chatService.getChats();
    setCurrentUser(user);
    setChats(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleCreateGroup = async () => {
    const newGroup = await chatService.createGroup('Nuevo Grupo de Estudio', ['usr_1', 'usr_2', 'usr_3']);
    loadData();
    navigation.navigate('Chat', { chatId: newGroup.id });
  };

  const handleLogout = async () => {
    await chatService.logout();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View style={styles.container}>
      {/* Header Perfil */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: currentUser?.avatar || 'https://picsum.photos/id/64/100/100' }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{currentUser?.name || 'Usuario'}</Text>
            <Text style={styles.userStatus}>🟢 Conectado (WebSocket Activo)</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'chats' && styles.tabActive]} onPress={() => setActiveTab('chats')}>
          <Text style={[styles.tabText, activeTab === 'chats' && styles.tabTextActive]}>Conversaciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'users' && styles.tabActive]} onPress={() => setActiveTab('users')}>
          <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>Usuarios Conectados</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'chats' ? (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.chatCard} onPress={() => navigation.navigate('Chat', { chatId: item.id })}>
              <View style={styles.chatIconBox}>
                <Text style={styles.chatIconEmoji}>{item.type === 'group' ? '👥' : '👤'}</Text>
              </View>
              <View style={styles.chatContent}>
                <View style={styles.chatTopRow}>
                  <Text style={styles.chatName}>{item.name}</Text>
                  {item.unreadCount > 0 ? (
                    <View style={styles.badgeUnread}>
                      <Text style={styles.badgeUnreadText}>{item.unreadCount}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.chatSub}>
                  {item.type === 'group' ? `${item.participants.length} participantes` : 'Mensaje privado'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <FlatList
          data={mockUsers}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.userCard}>
              <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.userNameText}>{item.name}</Text>
                <Text style={styles.userEmailText}>{item.email}</Text>
              </View>
              <Text style={item.isOnline ? styles.statusOnline : styles.statusOffline}>
                {item.isOnline ? '🟢 Online' : '⚪ Offline'}
              </Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={handleCreateGroup}>
        <Text style={styles.fabText}>+ Crear Grupo</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#1E293B' },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  userName: { color: '#F8FAFC', fontWeight: 'bold', fontSize: 16 },
  userStatus: { color: '#10B981', fontSize: 11, fontWeight: '600' },
  logoutBtn: { backgroundColor: '#334155', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  logoutBtnText: { color: '#EF4444', fontSize: 12, fontWeight: 'bold' },
  tabs: { flexDirection: 'row', backgroundColor: '#1E293B', borderTopWidth: 1, borderTopColor: '#334155' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#38BDF8' },
  tabText: { color: '#94A3B8', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#38BDF8' },
  chatCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  chatIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  chatIconEmoji: { fontSize: 20 },
  chatContent: { flex: 1 },
  chatTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatName: { color: '#F8FAFC', fontWeight: 'bold', fontSize: 15 },
  badgeUnread: { backgroundColor: '#38BDF8', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeUnreadText: { color: '#0F172A', fontSize: 11, fontWeight: 'bold' },
  chatSub: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#1E293B' },
  userAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  userNameText: { color: '#F8FAFC', fontWeight: '600', fontSize: 14 },
  userEmailText: { color: '#94A3B8', fontSize: 11 },
  statusOnline: { color: '#10B981', fontSize: 12, fontWeight: 'bold' },
  statusOffline: { color: '#64748B', fontSize: 12 },
  fab: { position: 'absolute', bottom: 20, right: 20, left: 20, backgroundColor: '#38BDF8', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  fabText: { color: '#0F172A', fontWeight: 'bold', fontSize: 15 }
});
