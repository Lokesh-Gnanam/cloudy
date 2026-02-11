import type { Chat, User, Message } from '@/types';

export const mockUsers: User[] = [
  {
    id: '2',
    privateId: '@alex',
    name: 'Alex ❤️',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isOnline: true,
    lastSeen: new Date(),
    bio: 'Forever yours 💕',
    isPublic: false,
  },
  {
    id: '3',
    privateId: '@sarah',
    name: 'Sarah',
    avatar: 'https://i.pravatar.cc/150?img=2',
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000),
    isPublic: true,
  },
];

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1',
      chatId: '1',
      senderId: '2',
      content: 'Hey! How was your day? 💕',
      type: 'text',
      timestamp: new Date(Date.now() - 7200000),
      isRead: true,
    },
    {
      id: '2',
      chatId: '1',
      senderId: '1',
      content: 'It was good! Missing you though 🥰',
      type: 'text',
      timestamp: new Date(Date.now() - 7000000),
      isRead: true,
    },
    {
      id: '3',
      chatId: '1',
      senderId: '2',
      content: 'Same here! Can\'t wait to see you tonight ❤️',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000),
      isRead: true,
    },
    {
      id: '4',
      chatId: '1',
      senderId: '1',
      content: 'What time are you thinking?',
      type: 'text',
      timestamp: new Date(Date.now() - 1800000),
      isRead: true,
    },
  ],
};

export const mockChats: Chat[] = [
  {
    id: '1',
    userId: '2',
    user: mockUsers[0],
    lastMessage: mockMessages['1'][mockMessages['1'].length - 1],
    unreadCount: 0,
    isLocked: false,
    isPinned: true,
    isArchived: false,
    isVanishMode: false,
    createdAt: new Date(Date.now() - 86400000 * 7),
  },
  {
    id: '2',
    userId: '3',
    user: mockUsers[1],
    lastMessage: {
      id: '5',
      chatId: '2',
      senderId: '3',
      content: 'Thanks for your help earlier!',
      type: 'text',
      timestamp: new Date(Date.now() - 86400000),
      isRead: false,
    },
    unreadCount: 1,
    isLocked: false,
    isPinned: false,
    isArchived: false,
    isVanishMode: false,
    createdAt: new Date(Date.now() - 86400000 * 14),
  },
];
