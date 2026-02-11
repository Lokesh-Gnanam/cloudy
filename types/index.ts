export interface User {
  id: string;
  privateId: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: Date;
  isPublic: boolean;
  createdAt?: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: "text" | "image" | "video" | "file";
  timestamp: Date;
  isRead: boolean;
  imageUrl?: string;
  videoUrl?: string;
  fileUrl?: string;
  fileName?: string;
  vanishAt?: Date; // Time when message disappears
  isVanished?: boolean;
}

export interface Chat {
  id: string;
  userId: string;
  user: User;
  lastMessage?: Message;
  unreadCount: number;
  isLocked: boolean;
  isPinned: boolean;
  isArchived: boolean;
  isHidden: boolean; // Hide chat from main list
  isVanishMode: boolean; // Enable disappearing messages
  vanishTimer: number; // Seconds before message disappears (0 = disabled, 3600 = 1 hour)
  createdAt: Date;
  updatedAt?: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ChatContextType {
  chats: Chat[];
  loading: boolean;
  createOrGetChat: (userId: string) => Promise<string>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  deleteAllChats: () => Promise<void>; // Delete all chats at once
  toggleLock: (chatId: string) => Promise<void>;
  togglePin: (chatId: string) => Promise<void>;
  toggleArchive: (chatId: string) => Promise<void>;
  toggleHide: (chatId: string) => Promise<void>; // Hide/show chat
  toggleVanishMode: (chatId: string, timer?: number) => Promise<void>; // Enable/disable vanish mode
  panicWipe: () => Promise<void>;
}
