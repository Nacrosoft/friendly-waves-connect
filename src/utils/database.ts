import { Conversation, Message, User, Reaction, CustomEmoji } from "@/types/chat";

// Database configuration
const DB_NAME = 'messengerDB';
const DB_VERSION = 2; // Upgrading version for new store
const CONVERSATIONS_STORE = 'conversations';
const USERS_STORE = 'users';
const CUSTOM_EMOJIS_STORE = 'customEmojis';

// Initialize the database
export const initDatabase = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Database error:', event);
      reject(false);
    };
    
    request.onsuccess = () => {
      console.log('Database opened successfully');
      resolve(true);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores
      if (!db.objectStoreNames.contains(CONVERSATIONS_STORE)) {
        const conversationsStore = db.createObjectStore(CONVERSATIONS_STORE, { keyPath: 'id' });
        conversationsStore.createIndex('participantId', 'participants.id', { multiEntry: true });
      }
      
      if (!db.objectStoreNames.contains(USERS_STORE)) {
        const usersStore = db.createObjectStore(USERS_STORE, { keyPath: 'id' });
        usersStore.createIndex('name', 'name', { unique: false });
      }
      
      if (!db.objectStoreNames.contains(CUSTOM_EMOJIS_STORE)) {
        const customEmojisStore = db.createObjectStore(CUSTOM_EMOJIS_STORE, { keyPath: 'id' });
        customEmojisStore.createIndex('userId', 'userId', { unique: false });
      }
    };
  });
};

// Get database connection
const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = (event) => {
      console.error('Error opening database:', event);
      reject(event);
    };
    
    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };
  });
};

// User operations
export const saveUser = async (user: User): Promise<User> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USERS_STORE], 'readwrite');
    const store = transaction.objectStore(USERS_STORE);
    const request = store.put(user);
    
    request.onsuccess = () => {
      resolve(user);
    };
    
    request.onerror = (event) => {
      console.error('Error saving user:', event);
      reject(event);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

export const getUser = async (userId: string): Promise<User | null> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USERS_STORE], 'readonly');
    const store = transaction.objectStore(USERS_STORE);
    const request = store.get(userId);
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = (event) => {
      console.error('Error getting user:', event);
      reject(event);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

export const getAllUsers = async (): Promise<User[]> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([USERS_STORE], 'readonly');
    const store = transaction.objectStore(USERS_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = (event) => {
      console.error('Error getting all users:', event);
      reject(event);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Custom Emoji operations
export const saveCustomEmoji = async (emoji: CustomEmoji): Promise<CustomEmoji> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CUSTOM_EMOJIS_STORE, USERS_STORE], 'readwrite');
    const emojiStore = transaction.objectStore(CUSTOM_EMOJIS_STORE);
    const userStore = transaction.objectStore(USERS_STORE);
    
    // Save emoji
    const emojiRequest = emojiStore.put(emoji);
    
    emojiRequest.onsuccess = async () => {
      // Update user with new emoji reference
      const userRequest = userStore.get(emoji.userId);
      
      userRequest.onsuccess = () => {
        const user = userRequest.result;
        if (user) {
          if (!user.customEmojis) {
            user.customEmojis = [];
          }
          
          // Check if emoji already exists for user
          const existingIndex = user.customEmojis.findIndex(e => e.id === emoji.id);
          if (existingIndex >= 0) {
            user.customEmojis[existingIndex] = emoji;
          } else {
            user.customEmojis.push(emoji);
          }
          
          userStore.put(user);
        }
        
        resolve(emoji);
      };
      
      userRequest.onerror = (event) => {
        console.error('Error updating user with emoji:', event);
        reject(event);
      };
    };
    
    emojiRequest.onerror = (event) => {
      console.error('Error saving emoji:', event);
      reject(event);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

export const getCustomEmojisForUser = async (userId: string): Promise<CustomEmoji[]> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CUSTOM_EMOJIS_STORE], 'readonly');
    const store = transaction.objectStore(CUSTOM_EMOJIS_STORE);
    const index = store.index('userId');
    const request = index.getAll(userId);
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = (event) => {
      console.error('Error getting emojis for user:', event);
      reject(event);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

export const deleteCustomEmoji = async (emojiId: string, userId: string): Promise<boolean> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CUSTOM_EMOJIS_STORE, USERS_STORE], 'readwrite');
    const emojiStore = transaction.objectStore(CUSTOM_EMOJIS_STORE);
    const userStore = transaction.objectStore(USERS_STORE);
    
    // Delete emoji
    const emojiRequest = emojiStore.delete(emojiId);
    
    emojiRequest.onsuccess = async () => {
      // Update user to remove emoji reference
      const userRequest = userStore.get(userId);
      
      userRequest.onsuccess = () => {
        const user = userRequest.result;
        if (user && user.customEmojis) {
          user.customEmojis = user.customEmojis.filter(e => e.id !== emojiId);
          userStore.put(user);
        }
        
        resolve(true);
      };
      
      userRequest.onerror = (event) => {
        console.error('Error updating user after emoji deletion:', event);
        reject(event);
      };
    };
    
    emojiRequest.onerror = (event) => {
      console.error('Error deleting emoji:', event);
      reject(event);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

// Conversation operations
export const saveConversation = async (conversation: Conversation): Promise<Conversation> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONVERSATIONS_STORE], 'readwrite');
    const store = transaction.objectStore(CONVERSATIONS_STORE);
    const request = store.put(conversation);
    
    request.onsuccess = () => {
      resolve(conversation);
    };
    
    request.onerror = (event) => {
      console.error('Error saving conversation:', event);
      reject(event);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

export const getConversation = async (conversationId: string): Promise<Conversation | null> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONVERSATIONS_STORE], 'readonly');
    const store = transaction.objectStore(CONVERSATIONS_STORE);
    const request = store.get(conversationId);
    
    request.onsuccess = () => {
      resolve(request.result || null);
    };
    
    request.onerror = (event) => {
      console.error('Error getting conversation:', event);
      reject(event);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

export const getAllConversations = async (): Promise<Conversation[]> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CONVERSATIONS_STORE], 'readonly');
    const store = transaction.objectStore(CONVERSATIONS_STORE);
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result || []);
    };
    
    request.onerror = (event) => {
      console.error('Error getting all conversations:', event);
      reject(event);
    };
    
    transaction.oncomplete = () => {
      db.close();
    };
  });
};

export const addMessageToConversation = async (
  conversationId: string, 
  message: Message
): Promise<Conversation | null> => {
  // Get current conversation
  const conversation = await getConversation(conversationId);
  if (!conversation) return null;
  
  // Add message
  conversation.messages.push(message);
  
  // Update last message data
  conversation.lastMessageText = message.text;
  conversation.lastMessageTime = message.timestamp;
  
  // If the message is from someone else, increment unread count
  if (message.senderId !== conversation.participants.find(p => p.status === 'online')?.id) {
    conversation.unreadCount++;
  }
  
  // Save updated conversation
  return saveConversation(conversation);
};

export const markConversationAsRead = async (conversationId: string): Promise<Conversation | null> => {
  const conversation = await getConversation(conversationId);
  if (!conversation) return null;
  
  conversation.unreadCount = 0;
  conversation.messages = conversation.messages.map(message => ({
    ...message,
    read: true
  }));
  
  return saveConversation(conversation);
};

export const addReactionToMessage = async (
  conversationId: string, 
  messageId: string,
  reaction: Reaction
): Promise<Conversation | null> => {
  const conversation = await getConversation(conversationId);
  if (!conversation) return null;
  
  conversation.messages = conversation.messages.map(message => {
    if (message.id === messageId) {
      const currentReactions = message.reactions || [];
      // Avoid duplicate reactions from the same user
      const filteredReactions = currentReactions.filter(r => 
        !(r.userId === reaction.userId && 
          ((r.isCustom && r.customEmojiId === reaction.customEmojiId) || 
           (!r.isCustom && r.emoji === reaction.emoji)))
      );
      return {
        ...message,
        reactions: [...filteredReactions, reaction]
      };
    }
    return message;
  });
  
  return saveConversation(conversation);
};

// Seed database with initial data
export const seedDatabase = async (users: User[], conversations: Conversation[]): Promise<void> => {
  try {
    // Save all users
    for (const user of users) {
      await saveUser(user);
    }
    
    // Save all conversations
    for (const conversation of conversations) {
      await saveConversation(conversation);
    }
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
