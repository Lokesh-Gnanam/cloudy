import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { useChats } from "@/contexts/ChatContext";
import type { Chat } from "@/types/types";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
    Eye,
    EyeOff,
    Flame,
    Lock,
    Pin,
    Plus,
    Search,
    Settings,
    Shield,
} from "lucide-react-native";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function HomeScreen() {
  const router = useRouter();
  const { user, searchUserByPrivateId } = useAuth();
  const {
    chats,
    createOrGetChat,
    panicWipe,
    toggleHide,
    toggleVanishMode,
    deleteAllChats,
  } = useChats();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchResults, setSearchResults] = useState<User | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showChatMenu, setShowChatMenu] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Error", "Please enter a Private ID");
      return;
    }

    // Ensure it starts with @
    const query = searchQuery.trim().startsWith("@")
      ? searchQuery.trim()
      : `@${searchQuery.trim()}`;

    setIsSearching(true);
    try {
      const foundUser = await searchUserByPrivateId(query);
      if (foundUser) {
        setSearchResults(foundUser);
      } else {
        Alert.alert("Not Found", "No user found with that Private ID");
        setSearchResults(null);
      }
    } catch (error) {
      Alert.alert("Error", "Could not search for user");
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartChat = async (otherUser: User) => {
    if (otherUser.id === user?.id) {
      Alert.alert("Error", "You cannot start a chat with yourself");
      return;
    }

    try {
      const chatId = await createOrGetChat(otherUser.id);
      setShowSearchModal(false);
      setSearchQuery("");
      setSearchResults(null);
      router.push(`/chat/${chatId}`);
    } catch (error) {
      Alert.alert("Error", "Could not start chat");
    }
  };

  const handlePanicWipe = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    Alert.alert(
      "Panic Wipe",
      "Are you sure you want to delete all chats? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await panicWipe();
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              Alert.alert("Success", "All chats have been deleted");
            } catch (error) {
              Alert.alert("Error", "Failed to delete chats");
            }
          },
        },
      ],
    );
  };

  const filteredChats = chats
    .filter((chat) => showHidden || !chat.isHidden) // Hide hidden chats unless showHidden is true
    .filter(
      (chat) =>
        chat.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.user.privateId.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.background, Colors.surface]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Cloudy</Text>
              <Text style={styles.headerSubtitle}>
                {user?.privateId || "Loading..."}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowHidden(!showHidden)}
                activeOpacity={0.7}
              >
                {showHidden ? (
                  <Eye size={22} color={Colors.primary} />
                ) : (
                  <EyeOff size={22} color={Colors.textSecondary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handlePanicWipe}
                activeOpacity={0.7}
              >
                <Shield size={22} color={Colors.danger} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/settings/privacy")}
                activeOpacity={0.7}
              >
                <Settings size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search chats or Private ID..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => {
                if (searchQuery.trim()) {
                  const filtered = chats.filter(
                    (chat) =>
                      chat.user.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      chat.user.privateId
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()),
                  );
                  if (filtered.length === 0 && !searchQuery.startsWith("@")) {
                    setSearchQuery("@" + searchQuery);
                  }
                }
              }}
            />
          </View>
        </View>

        {filteredChats.length === 0 && !searchQuery ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Lock size={48} color={Colors.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>No Chats Yet</Text>
            <Text style={styles.emptyText}>
              Search for someone by their Private ID to start a secure
              conversation
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.chatItemWrapper}>
                <TouchableOpacity
                  style={styles.chatItem}
                  onPress={() => router.push(`/chat/${item.id}`)}
                  onLongPress={() => {
                    setSelectedChat(item.id);
                    setShowChatMenu(true);
                    Haptics.selectionAsync();
                  }}
                  activeOpacity={0.7}
                >
                  <ChatItem chat={item} />
                </TouchableOpacity>
                {item.isHidden && (
                  <View style={styles.hiddenBadge}>
                    <EyeOff size={12} color={Colors.text} />
                  </View>
                )}
              </View>
            )}
            contentContainerStyle={styles.chatList}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              searchQuery ? (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>No chats found</Text>
                  <Text style={styles.noResultsSubtext}>
                    Try searching by Private ID
                  </Text>
                </View>
              ) : null
            }
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowSearchModal(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Plus size={28} color={Colors.text} strokeWidth={2.5} />
          </LinearGradient>
        </TouchableOpacity>

        <Modal
          visible={showSearchModal}
          animationType="slide"
          transparent
          onRequestClose={() => {
            setShowSearchModal(false);
            setSearchQuery("");
            setSearchResults(null);
          }}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Search User</Text>
              <Text style={styles.modalSubtitle}>
                Enter a Private ID to start chatting
              </Text>

              <View style={styles.searchModalInput}>
                <Search size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="@username"
                  placeholderTextColor={Colors.textTertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  onSubmitEditing={handleSearch}
                  autoFocus
                />
              </View>

              {isSearching && (
                <View style={styles.searchingContainer}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.searchingText}>Searching...</Text>
                </View>
              )}

              {searchResults && (
                <View style={styles.searchResult}>
                  <View style={styles.resultHeader}>
                    {searchResults.avatar ? (
                      <Image
                        source={{ uri: searchResults.avatar }}
                        style={styles.resultAvatar}
                      />
                    ) : (
                      <View
                        style={[styles.resultAvatar, styles.avatarPlaceholder]}
                      >
                        <Text style={styles.avatarText}>
                          {searchResults.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.resultInfo}>
                      <Text style={styles.resultName}>
                        {searchResults.name}
                      </Text>
                      <Text style={styles.resultPrivateId}>
                        {searchResults.privateId}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() => handleStartChat(searchResults)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.chatButtonText}>Start Chat</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setShowSearchModal(false);
                    setSearchQuery("");
                    setSearchResults(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleSearch}
                  activeOpacity={0.7}
                  disabled={isSearching}
                >
                  <Text style={styles.modalButtonTextPrimary}>Search</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>

      <Modal
        visible={showChatMenu}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setShowChatMenu(false);
          setSelectedChat(null);
        }}
      >
        <View style={styles.menuContainer}>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Chat Options</Text>

            {selectedChat && (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={async () => {
                    try {
                      await toggleHide(selectedChat);
                      const chat = chats.find((c) => c.id === selectedChat);
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success,
                      );
                      Alert.alert(
                        "Success",
                        `Chat ${chat?.isHidden ? "shown" : "hidden"}`,
                      );
                    } catch (error) {
                      Alert.alert("Error", "Failed to hide chat");
                    }
                    setShowChatMenu(false);
                  }}
                >
                  <View style={styles.menuItemContent}>
                    <EyeOff size={20} color={Colors.primary} />
                    <Text style={styles.menuItemText}>Hide Chat</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={async () => {
                    try {
                      await toggleVanishMode(selectedChat, 3600);
                      const chat = chats.find((c) => c.id === selectedChat);
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success,
                      );
                      Alert.alert(
                        "Success",
                        `Vanish mode ${chat?.isVanishMode ? "enabled" : "disabled"}`,
                      );
                    } catch (error) {
                      Alert.alert("Error", "Failed to toggle vanish mode");
                    }
                    setShowChatMenu(false);
                  }}
                >
                  <View style={styles.menuItemContent}>
                    <Flame size={20} color={Colors.vanishMode} />
                    <Text style={styles.menuItemText}>Vanish Mode</Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.menuItem, styles.menuItemDanger]}
              onPress={() => {
                setShowChatMenu(false);
                Alert.alert(
                  "Delete All Chats",
                  "Are you sure? This cannot be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          await deleteAllChats();
                          Haptics.notificationAsync(
                            Haptics.NotificationFeedbackType.Success,
                          );
                          Alert.alert("Success", "All chats deleted");
                        } catch (error) {
                          Alert.alert("Error", "Failed to delete chats");
                        }
                      },
                    },
                  ],
                );
              }}
            >
              <View style={styles.menuItemContent}>
                <Shield size={20} color={Colors.danger} />
                <Text style={[styles.menuItemText, { color: Colors.danger }]}>
                  Delete All Chats
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowChatMenu(false);
                setSelectedChat(null);
              }}
            >
              <Text style={styles.menuItemText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ChatItem({ chat }: { chat: Chat }) {
  const getTimeString = (date?: Date) => {
    if (!date) return "";
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return "now";
  };

  return (
    <>
      <View style={styles.avatarContainer}>
        {chat.user.avatar ? (
          <Image source={{ uri: chat.user.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {chat.user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {chat.user.isOnline && <View style={styles.onlineIndicator} />}
        {chat.isPinned && (
          <View style={styles.pinBadge}>
            <Pin size={10} color={Colors.text} />
          </View>
        )}
      </View>

      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <View style={styles.chatNameContainer}>
            <Text style={styles.chatName} numberOfLines={1}>
              {chat.user.name}
            </Text>
            {chat.isLocked && (
              <Lock
                size={14}
                color={Colors.textSecondary}
                style={styles.lockIcon}
              />
            )}
            {chat.isVanishMode && (
              <Flame
                size={14}
                color={Colors.vanishMode}
                style={styles.lockIcon}
              />
            )}
          </View>
          <Text style={styles.timestamp}>
            {getTimeString(chat.lastMessage?.timestamp)}
          </Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {chat.lastMessage?.content || "No messages yet"}
          </Text>
          {chat.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {Math.min(chat.unreadCount, 99)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </>
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
  },
  chatList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  chatItem: {
    flexDirection: "row",
    paddingVertical: 12,
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 22,
    fontWeight: "600",
    color: Colors.text,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.online,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  pinBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  chatInfo: {
    flex: 1,
    justifyContent: "center",
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 6,
  },
  chatName: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
  },
  lockIcon: {
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontSize: 15,
    color: Colors.textSecondary,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: "hidden",
    elevation: 12,
  },
  fabGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: Colors.textTertiary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  searchModalInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  searchingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  searchResult: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 12,
  },
  resultAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text,
  },
  resultPrivateId: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chatButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalButtonPrimary: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  modalButtonTextPrimary: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  chatItemWrapper: {
    position: "relative",
  },
  hiddenBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  menuContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: Colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  menuItemDanger: {
    backgroundColor: "#ffebee",
    borderColor: Colors.danger,
  },
});
