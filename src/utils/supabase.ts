import { createClient } from '@supabase/supabase-js';
import { User, Conversation, Message, Reaction, CustomEmoji, Story } from '@/types/chat';
import { env } from '@/env';

// Supabase configuration
const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials are missing. Please check your environment variables.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Function to handle database errors
const handleDBError = (error: any, operation: string) => {
  console.error(`Database error during ${operation}:`, error);
  throw new Error(`Failed to ${operation}: ${error.message}`);
};

// User-related functions
export const saveUserToSupabase = async (user: User): Promise<void> => {
  try {
    const { error } = await supabase
      .from('users')
      .upsert({ 
        id: user.id,
        name: user.name,
        password: user.password,
        avatar: user.avatar,
        status: user.status,
        last_seen: user.lastSeen,
      });
    
    if (error) handleDBError(error, 'save user');
  } catch (error) {
    handleDBError(error, 'save user');
  }
};

export const getUserFromSupabase = async (id: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) handleDBError(error, 'get user');
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      password: data.password,
      avatar: data.avatar,
      status: data.status,
      lastSeen: new Date(data.last_seen),
    };
  } catch (error) {
    handleDBError(error, 'get user');
    return null;
  }
};

export const getAllUsersFromSupabase = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) handleDBError(error, 'get all users');
    
    return (data || []).map(user => ({
      id: user.id,
      name: user.name,
      password: user.password,
      avatar: user.avatar,
      status: user.status,
      lastSeen: new Date(user.last_seen),
    }));
  } catch (error) {
    handleDBError(error, 'get all users');
    return [];
  }
};

// Conversation-related functions
export const saveConversationToSupabase = async (conversation: Conversation): Promise<Conversation> => {
  try {
    // First, save the conversation
    const { error } = await supabase
      .from('conversations')
      .upsert({ 
        id: conversation.id,
        last_message_text: conversation.lastMessageText,
        last_message_time: conversation.lastMessageTime,
        unread_count: conversation.unreadCount
      });
    
    if (error) handleDBError(error, 'save conversation');
    
    // Then save participants
    await Promise.all(conversation.participants.map(async (participant) => {
      const { error } = await supabase
        .from('conversation_participants')
        .upsert({ 
          conversation_id: conversation.id,
          user_id: participant.id
        });
      
      if (error) handleDBError(error, 'save conversation participant');
    }));
    
    // Finally, save messages
    await Promise.all(conversation.messages.map(async (message) => {
      const { error } = await supabase
        .from('messages')
        .upsert({ 
          id: message.id,
          conversation_id: conversation.id,
          sender_id: message.senderId,
          text: message.text,
          timestamp: message.timestamp,
          read: message.read,
          type: message.type,
          reply_to_id: message.replyToId,
          attachment_url: message.attachmentUrl,
          edited: message.edited,
          deleted: message.deleted
        });
      
      if (error) handleDBError(error, 'save message');
      
      // Save reactions if present
      if (message.reactions && message.reactions.length > 0) {
        await Promise.all(message.reactions.map(async (reaction) => {
          const { error } = await supabase
            .from('reactions')
            .upsert({ 
              message_id: message.id,
              user_id: reaction.userId,
              emoji: reaction.emoji,
              is_custom: reaction.isCustom,
              custom_emoji_id: reaction.customEmojiId
            });
          
          if (error) handleDBError(error, 'save reaction');
        }));
      }
    }));
    
    return conversation;
  } catch (error) {
    handleDBError(error, 'save conversation');
    return conversation;
  }
};

export const getConversationFromSupabase = async (id: string): Promise<Conversation | null> => {
  try {
    // Get the conversation
    const { data: convData, error: convError } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (convError) handleDBError(convError, 'get conversation');
    if (!convData) return null;
    
    // Get participants
    const { data: participantData, error: partError } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', id);
    
    if (partError) handleDBError(partError, 'get conversation participants');
    
    // Get user details for each participant
    const participants: User[] = [];
    for (const p of participantData || []) {
      const user = await getUserFromSupabase(p.user_id);
      if (user) participants.push(user);
    }
    
    // Get messages
    const { data: messageData, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('timestamp', { ascending: true });
    
    if (msgError) handleDBError(msgError, 'get conversation messages');
    
    // Process messages and get reactions
    const messages: Message[] = [];
    for (const msg of messageData || []) {
      const { data: reactionData, error: reactError } = await supabase
        .from('reactions')
        .select('*')
        .eq('message_id', msg.id);
      
      if (reactError) handleDBError(reactError, 'get message reactions');
      
      const reactions: Reaction[] = (reactionData || []).map(r => ({
        emoji: r.emoji,
        userId: r.user_id,
        isCustom: r.is_custom,
        customEmojiId: r.custom_emoji_id
      }));
      
      messages.push({
        id: msg.id,
        senderId: msg.sender_id,
        text: msg.text,
        timestamp: new Date(msg.timestamp),
        read: msg.read,
        type: msg.type,
        reactions: reactions,
        replyToId: msg.reply_to_id,
        attachmentUrl: msg.attachment_url,
        edited: msg.edited,
        deleted: msg.deleted
      });
    }
    
    return {
      id: convData.id,
      participants,
      messages,
      lastMessageText: convData.last_message_text,
      lastMessageTime: new Date(convData.last_message_time),
      unreadCount: convData.unread_count
    };
  } catch (error) {
    handleDBError(error, 'get conversation');
    return null;
  }
};

export const getAllConversationsFromSupabase = async (): Promise<Conversation[]> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_time', { ascending: false });
    
    if (error) handleDBError(error, 'get all conversations');
    
    const conversations: Conversation[] = [];
    for (const conv of data || []) {
      const conversation = await getConversationFromSupabase(conv.id);
      if (conversation) conversations.push(conversation);
    }
    
    return conversations;
  } catch (error) {
    handleDBError(error, 'get all conversations');
    return [];
  }
};

export const addMessageToConversationInSupabase = async (
  conversationId: string,
  message: Message
): Promise<Conversation | null> => {
  try {
    // Save the message
    const { error } = await supabase
      .from('messages')
      .insert({
        id: message.id,
        conversation_id: conversationId,
        sender_id: message.senderId,
        text: message.text,
        timestamp: message.timestamp,
        read: message.read,
        type: message.type,
        reply_to_id: message.replyToId,
        attachment_url: message.attachmentUrl
      });
    
    if (error) handleDBError(error, 'add message to conversation');
    
    // Update conversation last message info
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        last_message_text: message.text,
        last_message_time: message.timestamp
      })
      .eq('id', conversationId);
    
    if (updateError) handleDBError(updateError, 'update conversation last message');
    
    // Return updated conversation
    return await getConversationFromSupabase(conversationId);
  } catch (error) {
    handleDBError(error, 'add message to conversation');
    return null;
  }
};

export const addReactionToMessageInSupabase = async (
  conversationId: string,
  messageId: string,
  reaction: Reaction
): Promise<Conversation | null> => {
  try {
    // Insert the reaction
    const { error } = await supabase
      .from('reactions')
      .insert({
        message_id: messageId,
        user_id: reaction.userId,
        emoji: reaction.emoji,
        is_custom: reaction.isCustom,
        custom_emoji_id: reaction.customEmojiId
      });
    
    if (error) handleDBError(error, 'add reaction');
    
    // Return the updated conversation
    return await getConversationFromSupabase(conversationId);
  } catch (error) {
    handleDBError(error, 'add reaction');
    return null;
  }
};

export const markConversationAsReadInSupabase = async (
  conversationId: string
): Promise<Conversation | null> => {
  try {
    // Update conversation unread count
    const { error } = await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', conversationId);
    
    if (error) handleDBError(error, 'mark conversation as read');
    
    // Return updated conversation
    return await getConversationFromSupabase(conversationId);
  } catch (error) {
    handleDBError(error, 'mark conversation as read');
    return null;
  }
};

export const saveCustomEmojiToSupabase = async (emoji: CustomEmoji): Promise<CustomEmoji> => {
  try {
    const { error } = await supabase
      .from('custom_emojis')
      .upsert({
        id: emoji.id,
        user_id: emoji.userId,
        name: emoji.name,
        url: emoji.url,
        type: emoji.type || 'image',
        created_at: emoji.createdAt
      });
    
    if (error) handleDBError(error, 'save custom emoji');
    
    return emoji;
  } catch (error) {
    handleDBError(error, 'save custom emoji');
    return emoji;
  }
};

export const getCustomEmojisForUserFromSupabase = async (userId: string): Promise<CustomEmoji[]> => {
  try {
    const { data, error } = await supabase
      .from('custom_emojis')
      .select('*')
      .eq('user_id', userId);
    
    if (error) handleDBError(error, 'get custom emojis');
    
    return (data || []).map(emoji => ({
      id: emoji.id,
      userId: emoji.user_id,
      name: emoji.name,
      url: emoji.url,
      type: emoji.type || 'image',
      createdAt: new Date(emoji.created_at || Date.now())
    }));
  } catch (error) {
    handleDBError(error, 'get custom emojis');
    return [];
  }
};

export const deleteCustomEmojiFromSupabase = async (emojiId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('custom_emojis')
      .delete()
      .eq('id', emojiId);
    
    if (error) handleDBError(error, 'delete custom emoji');
    
    return true;
  } catch (error) {
    handleDBError(error, 'delete custom emoji');
    return false;
  }
};

export const editMessageInSupabase = async (
  conversationId: string,
  messageId: string,
  newText: string
): Promise<Conversation | null> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        text: newText,
        edited: true
      })
      .eq('id', messageId);
    
    if (error) handleDBError(error, 'edit message');
    
    return await getConversationFromSupabase(conversationId);
  } catch (error) {
    handleDBError(error, 'edit message');
    return null;
  }
};

export const deleteMessageInSupabase = async (
  conversationId: string,
  messageId: string
): Promise<Conversation | null> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({
        text: "This message was deleted",
        deleted: true,
        attachment_url: null
      })
      .eq('id', messageId);
    
    if (error) handleDBError(error, 'delete message');
    
    return await getConversationFromSupabase(conversationId);
  } catch (error) {
    handleDBError(error, 'delete message');
    return null;
  }
};

export const updateUserInSupabase = async (user: User): Promise<User> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        name: user.name,
        password: user.password,
        avatar: user.avatar,
        status: user.status,
        last_seen: user.lastSeen
      })
      .eq('id', user.id);
    
    if (error) handleDBError(error, 'update user');
    
    return user;
  } catch (error) {
    handleDBError(error, 'update user');
    return user;
  }
};

export const saveStoryToSupabase = async (story: Story): Promise<Story> => {
  try {
    const { error } = await supabase
      .from('stories')
      .insert({
        id: story.id,
        user_id: story.userId,
        content: story.content,
        media_url: story.type !== 'text' ? story.content : null,
        created_at: new Date(story.createdAt).toISOString(),
        expires_at: new Date(story.expiresAt).toISOString(),
        viewers: story.viewers || []
      });
    
    if (error) handleDBError(error, 'save story');
    
    return story;
  } catch (error) {
    handleDBError(error, 'save story');
    return story;
  }
};

export const getStoriesForUserFromSupabase = async (userId: string): Promise<Story[]> => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    if (error) handleDBError(error, 'get stories for user');
    
    return (data || []).map(story => ({
      id: story.id,
      userId: story.user_id,
      type: story.media_url && (story.media_url.endsWith('.mp4') || story.media_url.endsWith('.mov')) ? 'video' : 
             story.media_url ? 'image' : 'text',
      content: story.media_url || story.content,
      createdAt: new Date(story.created_at),
      expiresAt: new Date(story.expires_at),
      viewers: story.viewers || [],
      bgColor: !story.media_url ? '#1e1e1e' : undefined
    }));
  } catch (error) {
    handleDBError(error, 'get stories for user');
    return [];
  }
};

export const getAllStoriesFromSupabase = async (): Promise<Story[]> => {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    if (error) handleDBError(error, 'get all stories');
    
    return (data || []).map(story => ({
      id: story.id,
      userId: story.user_id,
      type: story.media_url && (story.media_url.endsWith('.mp4') || story.media_url.endsWith('.mov')) ? 'video' : 
             story.media_url ? 'image' : 'text',
      content: story.media_url || story.content,
      createdAt: new Date(story.created_at),
      expiresAt: new Date(story.expires_at),
      viewers: story.viewers || [],
      bgColor: !story.media_url ? '#1e1e1e' : undefined
    }));
  } catch (error) {
    handleDBError(error, 'get all stories');
    return [];
  }
};

export const updateStoryViewersInSupabase = async (storyId: string, viewerId: string): Promise<boolean> => {
  try {
    // First get the current story to check if viewer is already in the list
    const { data: storyData, error: fetchError } = await supabase
      .from('stories')
      .select('viewers')
      .eq('id', storyId)
      .single();
    
    if (fetchError) handleDBError(fetchError, 'fetch story viewers');
    
    const currentViewers = storyData?.viewers || [];
    
    // Only add the viewer if they haven't viewed it already
    if (!currentViewers.includes(viewerId)) {
      const newViewers = [...currentViewers, viewerId];
      
      const { error } = await supabase
        .from('stories')
        .update({ viewers: newViewers })
        .eq('id', storyId);
      
      if (error) handleDBError(error, 'update story viewers');
    }
    
    return true;
  } catch (error) {
    handleDBError(error, 'update story viewers');
    return false;
  }
};
