import { Conversation, Message, Reaction, User, CustomEmoji, Call, Story } from '@/types/chat';
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
  supabase,
  saveStoryToSupabase,
  getStoriesForUserFromSupabase,
  getAllStoriesFromSupabase,
  updateStoryViewersInSupabase
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

export const saveCall = async (call: Call): Promise<Call> => {
  try {
    if (!call.caller || !call.recipient) {
      throw new Error('Call must have both caller and recipient');
    }
    
    const { data, error } = await supabase
      .from('calls')
      .insert({
        id: call.id,
        caller_id: call.callerId,
        recipient_id: call.recipientId,
        status: call.status,
        start_time: call.startTime.toISOString(),
        end_time: call.endTime ? call.endTime.toISOString() : null,
        is_video: call.isVideo
      })
      .select()
      .single();

    if (error) {
      console.error('Error details:', error);
      throw error;
    }
    
    console.log('Call saved successfully:', data);
    return call;
  } catch (error) {
    console.error('Error saving call:', error);
    throw error;
  }
};

export const updateCall = async (call: Call): Promise<Call> => {
  try {
    const { data, error } = await supabase
      .from('calls')
      .update({
        status: call.status,
        end_time: call.endTime ? call.endTime.toISOString() : null
      })
      .eq('id', call.id)
      .select()
      .single();

    if (error) {
      console.error('Update call error details:', error);
      throw error;
    }
    
    console.log('Call updated successfully:', data);
    return call;
  } catch (error) {
    console.error('Error updating call:', error);
    throw error;
  }
};

export const getActiveCalls = async (userId: string): Promise<Call[]> => {
  try {
    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .or(`caller_id.eq.${userId},recipient_id.eq.${userId}`)
      .in('status', ['pending', 'active'])
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Get active calls error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) return [];
    
    const calls: Call[] = [];
    
    for (const callData of data) {
      const caller = await getUser(callData.caller_id);
      const recipient = await getUser(callData.recipient_id);
      
      if (caller && recipient) {
        calls.push({
          id: callData.id,
          callerId: callData.caller_id,
          caller,
          recipientId: callData.recipient_id,
          recipient,
          status: callData.status,
          startTime: new Date(callData.start_time),
          endTime: callData.end_time ? new Date(callData.end_time) : undefined,
          isVideo: callData.is_video
        });
      }
    }
    
    return calls;
  } catch (error) {
    console.error('Error getting active calls:', error);
    throw error;
  }
};

export const saveStory = async (story: Story): Promise<Story> => {
  return await saveStoryToSupabase(story);
};

export const getStoriesForUser = async (userId: string): Promise<Story[]> => {
  return await getStoriesForUserFromSupabase(userId);
};

export const getAllStories = async (): Promise<Story[]> => {
  return await getAllStoriesFromSupabase();
};

export const updateStoryViewers = async (storyId: string, viewerId: string): Promise<boolean> => {
  return await updateStoryViewersInSupabase(storyId, viewerId);
};
