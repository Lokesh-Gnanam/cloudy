import { auth, db } from "@/config/firebase";
import type { Chat, ChatContextType, Message } from "@/types";
import createContextHook from "@nkzw/create-context-hook";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export const [ChatProvider, useChats] = createContextHook<ChatContextType>(
  () => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const currentUser = auth.currentUser;

    useEffect(() => {
      if (!currentUser) {
        setChats([]);
        setLoading(false);
        return;
      }

      const loadChats = async () => {
        try {
          const chatsSnapshot = await getDocs(
            query(
              collection(db, "chats"),
              where("participants", "array-contains", currentUser.uid),
            ),
          );

          const chatList: Chat[] = [];
          for (const chatDoc of chatsSnapshot.docs) {
            const chatData = chatDoc.data();
            const otherUserId = chatData.participants.find(
              (id: string) => id !== currentUser.uid,
            );

            if (otherUserId) {
              const userDoc = await getDoc(doc(db, "users", otherUserId));
              if (userDoc.exists()) {
                const messagesSnapshot = await getDocs(
                  collection(db, "chats", chatDoc.id, "messages"),
                );
                const messages = messagesSnapshot.docs.map(
                  (msg) =>
                    ({
                      id: msg.id,
                      ...msg.data(),
                    }) as Message,
                );

                chatList.push({
                  id: chatDoc.id,
                  userId: otherUserId,
                  user: userDoc.data() as any,
                  lastMessage: messages[messages.length - 1],
                  unreadCount: chatData.unreadCount || 0,
                  isLocked: chatData.isLocked || false,
                  isPinned: chatData.isPinned || false,
                  isArchived: chatData.isArchived || false,
                  isHidden: chatData.isHidden || false,
                  isVanishMode: chatData.isVanishMode || false,
                  vanishTimer: chatData.vanishTimer || 0,
                  createdAt: chatData.createdAt?.toDate?.() || new Date(),
                });
              }
            }
          }

          setChats(
            chatList.sort(
              (a, b) =>
                (b.lastMessage?.timestamp as any)?.getTime?.() -
                  (a.lastMessage?.timestamp as any)?.getTime?.() || 0,
            ),
          );
        } catch (error) {
          console.error("Error loading chats:", error);
        } finally {
          setLoading(false);
        }
      };

      loadChats();
    }, [currentUser]);

    const createOrGetChat = async (userId: string): Promise<string> => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        const participants = [currentUser.uid, userId].sort();
        const chatQuery = query(
          collection(db, "chats"),
          where("participants", "==", participants),
        );
        const chatSnapshot = await getDocs(chatQuery);

        if (!chatSnapshot.empty) {
          return chatSnapshot.docs[0].id;
        }

        const newChatRef = doc(collection(db, "chats"));
        await setDoc(newChatRef, {
          participants,
          createdAt: serverTimestamp(),
          isVanishMode: false,
          vanishTimer: 0,
          isLocked: false,
          isPinned: false,
          isArchived: false,
          isHidden: false,
          unreadCount: 0,
        });

        return newChatRef.id;
      } catch (error) {
        console.error("Error creating/getting chat:", error);
        throw error;
      }
    };

    const sendMessage = async (
      chatId: string,
      content: string,
    ): Promise<void> => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        const messageRef = doc(collection(db, "chats", chatId, "messages"));
        await setDoc(messageRef, {
          senderId: currentUser.uid,
          content,
          type: "text",
          timestamp: serverTimestamp(),
          isRead: false,
        });

        await updateDoc(doc(db, "chats", chatId), {
          lastMessage: {
            id: messageRef.id,
            content,
            timestamp: serverTimestamp(),
            senderId: currentUser.uid,
          },
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    };

    const deleteChat = async (chatId: string): Promise<void> => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        await deleteDoc(doc(db, "chats", chatId));
        setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      } catch (error) {
        console.error("Error deleting chat:", error);
        throw error;
      }
    };

    const toggleLock = async (chatId: string): Promise<void> => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        const chat = chats.find((c) => c.id === chatId);
        if (chat) {
          await updateDoc(doc(db, "chats", chatId), {
            isLocked: !chat.isLocked,
          });

          setChats((prev) =>
            prev.map((c) =>
              c.id === chatId ? { ...c, isLocked: !c.isLocked } : c,
            ),
          );
        }
      } catch (error) {
        console.error("Error toggling lock:", error);
        throw error;
      }
    };

    const togglePin = async (chatId: string): Promise<void> => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        const chat = chats.find((c) => c.id === chatId);
        if (chat) {
          await updateDoc(doc(db, "chats", chatId), {
            isPinned: !chat.isPinned,
          });

          setChats((prev) =>
            prev.map((c) =>
              c.id === chatId ? { ...c, isPinned: !c.isPinned } : c,
            ),
          );
        }
      } catch (error) {
        console.error("Error toggling pin:", error);
        throw error;
      }
    };

    const toggleArchive = async (chatId: string): Promise<void> => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        const chat = chats.find((c) => c.id === chatId);
        if (chat) {
          await updateDoc(doc(db, "chats", chatId), {
            isArchived: !chat.isArchived,
          });

          setChats((prev) =>
            prev.map((c) =>
              c.id === chatId ? { ...c, isArchived: !c.isArchived } : c,
            ),
          );
        }
      } catch (error) {
        console.error("Error toggling archive:", error);
        throw error;
      }
    };

    const panicWipe = async (): Promise<void> => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        for (const chat of chats) {
          await deleteChat(chat.id);
        }
      } catch (error) {
        console.error("Error panic wiping:", error);
        throw error;
      }
    };

    const toggleHide = async (chatId: string): Promise<void> => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        const chat = chats.find((c) => c.id === chatId);
        if (chat) {
          await updateDoc(doc(db, "chats", chatId), {
            isHidden: !chat.isHidden,
          });

          setChats((prev) =>
            prev.map((c) =>
              c.id === chatId ? { ...c, isHidden: !c.isHidden } : c,
            ),
          );
        }
      } catch (error) {
        console.error("Error toggling hide:", error);
        throw error;
      }
    };

    const toggleVanishMode = async (
      chatId: string,
      timer = 3600,
    ): Promise<void> => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        const chat = chats.find((c) => c.id === chatId);
        if (chat) {
          await updateDoc(doc(db, "chats", chatId), {
            isVanishMode: !chat.isVanishMode,
            vanishTimer: !chat.isVanishMode ? timer : 0,
          });

          setChats((prev) =>
            prev.map((c) =>
              c.id === chatId
                ? {
                    ...c,
                    isVanishMode: !c.isVanishMode,
                    vanishTimer: !c.isVanishMode ? timer : 0,
                  }
                : c,
            ),
          );
        }
      } catch (error) {
        console.error("Error toggling vanish mode:", error);
        throw error;
      }
    };

    const deleteAllChats = async (): Promise<void> => {
      if (!currentUser) throw new Error("User not authenticated");

      try {
        for (const chat of chats) {
          await deleteDoc(doc(db, "chats", chat.id));
        }
        setChats([]);
      } catch (error) {
        console.error("Error deleting all chats:", error);
        throw error;
      }
    };

    return {
      chats,
      loading,
      createOrGetChat,
      sendMessage,
      deleteChat,
      deleteAllChats,
      toggleLock,
      togglePin,
      toggleArchive,
      toggleHide,
      toggleVanishMode,
      panicWipe,
    };
  },
);
