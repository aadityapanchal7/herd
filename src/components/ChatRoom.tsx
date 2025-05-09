
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import ChatMessage from './ChatMessage';
import { useParams } from 'react-router-dom';

interface Message {
  id: string;
  message: string;
  user_id: string;
  username: string;
  created_at: string;
}

const ChatRoom: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, userProfile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch messages when component mounts
  useEffect(() => {
    fetchMessages();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('public:event_chat_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'event_chat_messages', filter: `event_id=eq.${eventId}` }, 
        (payload) => {
          const newMsg = payload.new as any;
          // Add user info to message
          fetchMessageWithUserInfo(newMsg);
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const fetchMessages = async () => {
    try {
      // First get all messages for this event
      const { data: messagesData, error: messagesError } = await supabase
        .from('event_chat_messages')
        .select('id, message, user_id, created_at')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });
        
      if (messagesError) throw messagesError;
      
      // Then for each message, get the user profile data
      const formattedMessages: Message[] = [];
      
      for (const msg of messagesData || []) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', msg.user_id)
          .single();
          
        if (!userError) {
          formattedMessages.push({
            id: msg.id,
            message: msg.message,
            user_id: msg.user_id,
            username: userData?.username || userData?.full_name || 'Anonymous',
            created_at: msg.created_at
          });
        } else {
          // If there's an error getting user info, still show the message
          formattedMessages.push({
            id: msg.id,
            message: msg.message,
            user_id: msg.user_id,
            username: 'Anonymous',
            created_at: msg.created_at
          });
        }
      }
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchMessageWithUserInfo = async (message: any) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name')
        .eq('id', message.user_id)
        .single();
        
      if (error) throw error;
      
      setMessages(prev => [...prev, {
        id: message.id,
        message: message.message,
        user_id: message.user_id,
        username: data?.username || data?.full_name || 'Anonymous',
        created_at: message.created_at
      }]);
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;
    
    try {
      const { error } = await supabase
        .from('event_chat_messages')
        .insert({
          event_id: eventId,
          user_id: user.id,
          message: newMessage
        });
        
      if (error) throw error;
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-herd-purple"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No messages yet. Be the first to start the conversation!</p>
          </div>
        ) : (
          messages.map(message => (
            <ChatMessage 
              key={message.id}
              message={message.message}
              username={message.username}
              timestamp={message.created_at}
              isMine={message.user_id === user?.id}
            />
          ))
        )}
        <div ref={messageEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex items-center gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" className="bg-herd-purple hover:bg-herd-purple-dark">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
