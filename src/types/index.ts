export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';
export type ChatType = 'direct' | 'group';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isOnline: boolean;
  isTyping?: boolean;
}

export interface Attachment {
  id: string;
  url: string;
  type: 'image' | 'file';
  name: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  attachment?: Attachment;
  createdAt: number;
  status: MessageStatus;
  isEdited?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  type: ChatType;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  inviteCode?: string;
}
