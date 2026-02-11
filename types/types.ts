export type User = {
  id: string;
  privateId: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen?: Date;
  isPublic: boolean;
  createdAt?: Date;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'voice';
  timestamp: Date;
  isRead: boolean;
};

export type Chat = {
  id: string;
  userId: string;
  user: User;
  lastMessage?: Message;
  unreadCount: number;
  isLocked: boolean;
  isPinned: boolean;
  isArchived: boolean;
  isVanishMode: boolean;
  createdAt: Date;
  updatedAt?: Date;
};

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

export type AuthContextType = AuthState & {
  signUp: (email: string, password: string, name: string, privateId: string) => Promise<User>;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  searchUserByPrivateId: (privateId: string) => Promise<User | null>;
};

export type ChatContextType = {
  chats: Chat[];
  loading: boolean;
  createOrGetChat: (userId: string) => Promise<string>;
  sendMessage: (chatId: string, content: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  toggleLock: (chatId: string) => Promise<void>;
  togglePin: (chatId: string) => Promise<void>;
  toggleArchive: (chatId: string) => Promise<void>;
  panicWipe: () => Promise<void>;
};

// Firebase data types for server responses
export type FirebaseUser = {
  id: string;
  privateId: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen?: any; // Firestore Timestamp
  isPublic: boolean;
  createdAt?: any; // Firestore Timestamp
};

export type FirebaseMessage = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'voice';
  timestamp: any; // Firestore Timestamp
  isRead: boolean;
};