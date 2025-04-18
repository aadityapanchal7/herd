import React, { createContext, useContext, useEffect, useState } from 'react';
import { StreamChat, Channel as StreamChannel } from 'stream-chat';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

// Replace this placeholder with your actual Stream API key
// Normally this would be in an environment variable
const STREAM_API_KEY = '5x994h86b8xm'; // This is a public key, safe to include in code

type StreamChatContextType = {
  client: StreamChat | null;
  createChannel: (channelId: string, name: string) => Promise<StreamChannel | null>;
  getChannel: (channelId: string) => Promise<StreamChannel | null>;
  isLoading: boolean;
};

const StreamChatContext = createContext<StreamChatContextType | undefined>(undefined);

export const StreamChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<StreamChat | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasShownError, setHasShownError] = useState<boolean>(false);
  
  // Safely try to get auth context
  const auth = (() => {
    try {
      return useAuth();
    } catch (error) {
      console.warn('Auth context not available:', error);
      return { user: null, userProfile: null };
    }
  })();
  
  const { user, userProfile } = auth;

  useEffect(() => {
    // Initialize the Stream Chat client
    const initChat = async () => {
      if (!user) {
        setClient(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Initialize Stream Chat client
        const chatClient = StreamChat.getInstance(STREAM_API_KEY);
        
        // Check if we're already connected as this user
        if (chatClient.userID !== user.id) {
          // Connect the user
          await chatClient.connectUser(
            {
              id: user.id,
              name: userProfile?.full_name || userProfile?.username || user.email || 'Anonymous',
              image: userProfile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile?.username || user.email || 'User')}`,
            },
            // In production, you'd generate this token on your backend
            chatClient.devToken(user.id)
          );
        }

        setClient(chatClient);
        // Reset error state when successfully connected
        setHasShownError(false);
      } catch (error) {
        console.error('Error connecting to Stream Chat:', error);
        
        // Only show error toast if:
        // 1. We're not on the auth or home page (user is trying to access chat)
        // 2. We haven't shown an error already in this session
        const isAuthOrHomePage = 
          window.location.pathname === '/' ||
          window.location.pathname === '/auth' ||
          window.location.pathname.includes('/auth/callback');
        
        if (!isAuthOrHomePage && !hasShownError) {
          toast.error('Failed to connect to chat service');
          setHasShownError(true);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initChat();

    return () => {
      // Clean up function - disconnect when component unmounts
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
  }, [user, userProfile, hasShownError]);

  // Create a new channel or get an existing one
  const createChannel = async (channelId: string, name: string): Promise<StreamChannel | null> => {
    if (!client || !user) return null;

    try {
      // Initialize the channel
      const channel = client.channel('messaging', `event-${channelId}`, {
        name,
        members: [user.id],
        created_by_id: user.id,
      });

      // Query the channel to initialize it on the server side
      await channel.create();
      
      return channel;
    } catch (error) {
      console.error('Error creating channel:', error);
      toast.error('Failed to create chat room');
      return null;
    }
  };

  // Get an existing channel
  const getChannel = async (channelId: string): Promise<StreamChannel | null> => {
    if (!client) return null;

    try {
      const channel = client.channel('messaging', `event-${channelId}`);
      await channel.watch();
      return channel;
    } catch (error) {
      console.error('Error getting channel:', error);
      return null;
    }
  };

  return (
    <StreamChatContext.Provider value={{ client, createChannel, getChannel, isLoading }}>
      {children}
    </StreamChatContext.Provider>
  );
};

export const useStreamChat = () => {
  const context = useContext(StreamChatContext);
  if (context === undefined) {
    throw new Error('useStreamChat must be used within a StreamChatProvider');
  }
  return context;
};
