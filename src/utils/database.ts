import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Conversation, Message, Reaction, User, CustomEmoji } from '@/types/chat';

interface ChatDatabase extends DBSchema {
  users: {
    key: string;
    value: User;
  };
  conversations: {
    key: string;
    value: Conversation;
    indexes: { 'lastMessageTime': Date };
  };
  customEmojis: {
    key: string;
    value: CustomEmoji;
    indexes: { 'userId': string };
  };
}

let dbPromise: Promise<IDBPDatabase<ChatDatabase>> | null = null;

const openDBInstance = async (): Promise<IDBPDatabase<ChatDatabase>> => {
  if (!dbPromise) {
    dbPromise = openDB<ChatDatabase>('chat-app-db', 3, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('users')) {
          db.createObjectStore('users', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('conversations')) {
          const conversationStore = db.createObjectStore('conversations', { keyPath: 'id' });
          conversationStore.createIndex('lastMessageTime', 'lastMessageTime');
        }
        if (!db.objectStoreNames.contains('customEmojis')) {
          const customEmojiStore = db.createObjectStore('customEmojis', { keyPath: 'id' });
          customEmojiStore.createIndex('userId', 'userId');
        }
      },
    });
  }
  return dbPromise;
};

export const initDatabase = async (): Promise<boolean> => {
  try {
    await openDBInstance();
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
};

export const saveUser = async (user: User): Promise<void> => {
  const db = await openDBInstance();
  const tx = db.transaction('users', 'readwrite');
  const store = tx.objectStore('users');
  await store.put(user);
  await tx.done;
};

export const getUser = async (id: string): Promise<User | undefined> => {
  const db = await openDBInstance();
  return db.get('users', id);
};

export const saveConversation = async (conversation: Conversation): Promise<Conversation> => {
  const db = await openDBInstance();
  const tx = db.transaction('conversations', 'readwrite');
  const store = tx.objectStore('conversations');
  await store.put(conversation);
  await tx.done;
  return conversation;
};

export const getConversation = async (id: string): Promise<Conversation | undefined> => {
  const db = await openDBInstance();
  return db.get('conversations', id);
};

export const getAllConversations = async (): Promise<Conversation[]> => {
  const db = await openDBInstance();
  return db.getAll('conversations');
};

export const getAllUsers = async (): Promise<User[]> => {
  const db = await openDBInstance();
  return db.getAll('users');
};

export const addMessageToConversation = async (
  conversationId: string,
  message: Message
): Promise<Conversation | undefined> => {
  const db = await openDBInstance();
  const tx = db.transaction('conversations', 'readwrite');
  const store = tx.objectStore('conversations');

  const conversation = await store.get(conversationId);
  if (!conversation) {
    console.error(`Conversation with id ${conversationId} not found`);
    return;
  }

  const updatedConversation: Conversation = {
    ...conversation,
    messages: [...conversation.messages, message],
    lastMessageText: message.text,
    lastMessageTime: message.timestamp,
  };

  await store.put(updatedConversation);
  await tx.done;
  return updatedConversation;
};

export const markConversationAsRead = async (conversationId: string): Promise<Conversation | undefined> => {
  const db = await openDBInstance();
  const tx = db.transaction('conversations', 'readwrite');
  const store = tx.objectStore('conversations');

  const conversation = await store.get(conversationId);
  if (!conversation) {
    console.error(`Conversation with id ${conversationId} not found`);
    return;
  }

  const updatedConversation: Conversation = {
    ...conversation,
    unreadCount: 0,
  };

  await store.put(updatedConversation);
  await tx.done;
  return updatedConversation;
};

export const addReactionToMessage = async (
  conversationId: string,
  messageId: string,
  reaction: Reaction
): Promise<Conversation | null> => {
  try {
    const db = await openDBInstance();
    const tx = db.transaction('conversations', 'readwrite');
    const store = tx.objectStore('conversations');

    const conversation = await store.get(conversationId);
    if (!conversation) {
      console.error(`Conversation with id ${conversationId} not found`);
      return null;
    }

    const updatedMessages = conversation.messages.map(message => {
      if (message.id === messageId) {
        const existingReactions = message.reactions || [];
        return {
          ...message,
          reactions: [...existingReactions, reaction],
        };
      }
      return message;
    });

    const updatedConversation: Conversation = {
      ...conversation,
      messages: updatedMessages,
    };

    await store.put(updatedConversation);
    await tx.done;
    return updatedConversation;
  } catch (error) {
    console.error('Error adding reaction to message:', error);
    return null;
  }
};

export const saveCustomEmoji = async (emoji: CustomEmoji): Promise<CustomEmoji> => {
  const db = await openDBInstance();
  const tx = db.transaction('customEmojis', 'readwrite');
  const store = tx.objectStore('customEmojis');
  await store.put(emoji);
  await tx.done;
  return emoji;
};

export const getCustomEmojisForUser = async (userId: string): Promise<CustomEmoji[]> => {
  const db = await openDBInstance();
  const index = db.transaction('customEmojis').store.index('userId');
  return index.getAll(userId);
};

export const deleteCustomEmoji = async (emojiId: string, userId: string): Promise<boolean> => {
  try {
    const db = await openDBInstance();
    const tx = db.transaction('customEmojis', 'readwrite');
    const store = tx.objectStore('customEmojis');
    await store.delete(emojiId);
    await tx.done;
    return true;
  } catch (error) {
    console.error('Error deleting custom emoji:', error);
    return false;
  }
};

export const editMessageInConversation = async (
  conversationId: string,
  messageId: string,
  newText: string
): Promise<Conversation | null> => {
  try {
    const conversation = await getConversation(conversationId);
    
    if (!conversation) {
      return null;
    }
    
    const updatedMessages = conversation.messages.map(message => {
      if (message.id === messageId) {
        return {
          ...message,
          text: newText,
          edited: true // Mark as edited
        };
      }
      return message;
    });
    
    const updatedConversation = {
      ...conversation,
      messages: updatedMessages
    };
    
    // Update in database
    const db = await openDBInstance();
    const tx = db.transaction('conversations', 'readwrite');
    const store = tx.objectStore('conversations');
    await store.put(updatedConversation);
    await tx.done;
    
    return updatedConversation;
  } catch (error) {
    console.error('Error editing message in conversation:', error);
    return null;
  }
};

export const deleteMessageInConversation = async (
  conversationId: string,
  messageId: string
): Promise<Conversation | null> => {
  try {
    const conversation = await getConversation(conversationId);
    
    if (!conversation) {
      return null;
    }
    
    // Find the message to mark as deleted
    const updatedMessages = conversation.messages.map(message => {
      if (message.id === messageId) {
        return {
          ...message,
          text: "This message was deleted", // Replace text with deletion notice
          deleted: true, // Mark as deleted
          attachmentUrl: undefined // Remove any attachments
        };
      }
      return message;
    });
    
    const updatedConversation = {
      ...conversation,
      messages: updatedMessages
    };
    
    // Update in database
    const db = await openDBInstance();
    const tx = db.transaction('conversations', 'readwrite');
    const store = tx.objectStore('conversations');
    await store.put(updatedConversation);
    await tx.done;
    
    return updatedConversation;
  } catch (error) {
    console.error('Error deleting message in conversation:', error);
    return null;
  }
};

export const updateUser = async (user: User): Promise<User> => {
  try {
    const db = await openDBInstance();
    const tx = db.transaction('users', 'readwrite');
    const store = tx.objectStore('users');
    await store.put(user);
    await tx.done;
    
    return user;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
};
