import { Conversation, Message, Reaction, User, CustomEmoji } from '@/types/chat';
import {
  saveUserToSupabase,
  getUserFromSupabase,
  getAllUsersFromSupabase,
  saveConversationToSupabase,
  getConversationFromSupabase,
  getAllConversationsFromSupabase,
  addMessageToConversationInSupabase,
  markConversationAsReadInSupabase,
  addReactionToMessageInSupabase,
  saveCustomEmojiToSupabase,
  getCustomEmojisForUserFromSupabase,
  deleteCustomEmojiFromSupabase,
  editMessageInSupabase,
  deleteMessageInSupabase,
  updateUserInSupabase,
  supabase
} from './supabase';

export const initDatabase = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (error) {
      console.error('Failed to connect to Supabase:', error);
      return false;
    }
    console.log('Successfully connected to Supabase database');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
};

export const saveUser = async (user: User): Promise<void> => {
  await saveUserToSupabase(user);
};

export const getUser = async (id: string): Promise<User | undefined> => {
  const user = await getUserFromSupabase(id);
  return user || undefined;
};

export const saveConversation = async (conversation: Conversation): Promise<Conversation> => {
  return await saveConversationToSupabase(conversation);
};

export const getConversation = async (id: string): Promise<Conversation | undefined> => {
  const conversation = await getConversationFromSupabase(id);
  return conversation || undefined;
};

export const getAllConversations = async (): Promise<Conversation[]> => {
  return await getAllConversationsFromSupabase();
};

export const getAllUsers = async (): Promise<User[]> => {
  return await getAllUsersFromSupabase();
};

export const addMessageToConversation = async (
  conversationId: string,
  message: Message
): Promise<Conversation | undefined> => {
  const conversation = await addMessageToConversationInSupabase(conversationId, message);
  return conversation || undefined;
};

export const markConversationAsRead = async (conversationId: string): Promise<Conversation | undefined> => {
  const conversation = await markConversationAsReadInSupabase(conversationId);
  return conversation || undefined;
};

export const addReactionToMessage = async (
  conversationId: string,
  messageId: string,
  reaction: Reaction
): Promise<Conversation | null> => {
  return await addReactionToMessageInSupabase(conversationId, messageId, reaction);
};

export const saveCustomEmoji = async (emoji: CustomEmoji): Promise<CustomEmoji> => {
  return await saveCustomEmojiToSupabase(emoji);
};

export const getCustomEmojisForUser = async (userId: string): Promise<CustomEmoji[]> => {
  return await getCustomEmojisForUserFromSupabase(userId);
};

export const deleteCustomEmoji = async (emojiId: string, userId: string): Promise<boolean> => {
  return await deleteCustomEmojiFromSupabase(emojiId);
};

export const editMessageInConversation = async (
  conversationId: string,
  messageId: string,
  newText: string
): Promise<Conversation | null> => {
  return await editMessageInSupabase(conversationId, messageId, newText);
};

export const deleteMessageInConversation = async (
  conversationId: string,
  messageId: string
): Promise<Conversation | null> => {
  return await deleteMessageInSupabase(conversationId, messageId);
};

export const updateUser = async (user: User): Promise<User> => {
  return await updateUserInSupabase(user);
};
