import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useChats } from "@/contexts/ChatContext";
import type { Chat, Message } from "@/types";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    Lock,
    MoreVertical,
    Send,
    Trash2,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { chats, sendMessage, toggleLock, deleteChat } = useChats();

  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Load all messages for this chat
  useEffect(() => {
    if (!id) return;

    const loadMessages = async () => {
      const currentChat = chats.find((c: Chat) => c.id === (id as string));
      if (currentChat) {
        setChat(currentChat);
        
        // In a real app, you would fetch all messages from Firebase
        // For now, we'll use mock data or just the last message
        if (currentChat.lastMessage) {
          // Simulate loading multiple messages
          const mockMessages: Message[] = [
            {
              id: '1',
              chatId: currentChat.id,
              senderId: currentChat.userId,
              content: 'Hello there!',
              type: 'text',
              timestamp: new Date(Date.now() - 3600000),
              isRead: true,
            },
            {
              id: '2',
              chatId: currentChat.id,
              senderId: user?.id || '',
              content: 'Hi! How are you?',
              type: 'text',
              timestamp: new Date(Date.now() - 1800000),
              isRead: true,
            },
            {
              id: '3',
              chatId: currentChat.id,
              senderId: currentChat.userId,
              content: 'I\'m good! Let\'s catch up soon.',
              type: 'text',
              timestamp: new Date(Date.now() - 600000),
              isRead: true,
            },
            currentChat.lastMessage
          ];
          
          setMessages(mockMessages);
        }
      }
      setIsLoading(false);
    };

    loadMessages();
  }, [id, chats, user]);

  const handleSend = async () => {
    if (!inputText.trim() || !user || !chat) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await sendMessage(chat.id, inputText.trim());

      const newMessage: Message = {
        id: Date.now().toString(),
        chatId: chat.id,
        senderId: user.id,
        content: inputText.trim(),
        type: "text",
        timestamp: new Date(),
        isRead: true,
      };
      setMessages((prev) => [...prev, newMessage]);
      setInputText("");

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert("Error", "Could not send message");
    }
  };

  const handleToggleLock = async () => {
    if (!chat) return;
    try {
      await toggleLock(chat.id);
      setShowMenu(false);
      setChat((prev: Chat | null) =>
        prev ? { ...prev, isLocked: !prev.isLocked } : null,
      );
      Alert.alert("Chat Lock", chat.isLocked ? "Chat unlocked" : "Chat locked");
    } catch (error) {
      Alert.alert("Error", "Could not toggle lock");
    }
  };

  const handleDeleteChat = () => {
    if (!chat) return;

    Alert.alert(
      "Delete Chat",
      "Are you sure you want to delete this chat? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteChat(chat.id);
              router.back();
            } catch (error) {
              Alert.alert("Error", "Could not delete chat");
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <LinearGradient
          colors={[Colors.background, Colors.surface]}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!chat) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.background, Colors.surface]}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView style={styles.safeArea}>
          <Text style={styles.errorText}>Chat not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            {chat.user.avatar ? (
              <Image
                source={{ uri: chat.user.avatar }}
                style={styles.headerAvatar}
              />
            ) : (
              <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {chat.user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View>
              <Text style={styles.headerName}>{chat.user.name}</Text>
              <Text style={styles.headerStatus}>
                {chat.user.isOnline ? "Online" : "Offline"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowMenu(!showMenu)}
            activeOpacity={0.7}
          >
            <MoreVertical size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {showMenu && (
          <View style={styles.quickMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleToggleLock}
            >
              <Lock size={18} color={Colors.text} />
              <Text style={styles.menuText}>
                {chat.isLocked ? "Unlock" : "Lock"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDeleteChat}
            >
              <Trash2 size={18} color={Colors.danger} />
              <Text style={[styles.menuText, { color: Colors.danger }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>Start the conversation!</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item: Message) => item.id}
            renderItem={({ item }: { item: Message }) => (
              <View
                style={[
                  styles.messageBubble,
                  item.senderId === user?.id
                    ? styles.ownMessage
                    : styles.otherMessage,
                ]}
              >
                <Text style={[
                  styles.messageText,
                  item.senderId === user?.id ? styles.ownMessageText : styles.otherMessageText
                ]}>
                  {item.content}
                </Text>
                <Text style={[
                  styles.messageTime,
                  item.senderId === user?.id ? styles.ownMessageTime : styles.otherMessageTime
                ]}>
                  {new Date(item.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            )}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={Colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={
                  inputText.trim()
                    ? [Colors.primary, Colors.primaryDark]
                    : [Colors.surface, Colors.surface]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.sendButtonGradient}
              >
                <Send
                  size={20}
                  color={inputText.trim() ? Colors.text : Colors.textTertiary}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
    gap: 12,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  headerName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  headerStatus: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  quickMenu: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
    backgroundColor: Colors.surface,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  messageList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageBubble: {
    marginVertical: 6,
    marginHorizontal: 4,
    padding: 12,
    borderRadius: 18,
    maxWidth: "80%",
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: Colors.surfaceLight,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownMessageText: {
    color: Colors.text,
  },
  otherMessageText: {
    color: Colors.text,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  ownMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  otherMessageTime: {
    color: Colors.textTertiary,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.text,
    maxHeight: 100,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  sendButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center",
  },
  backButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});