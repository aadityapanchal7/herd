import React, { useEffect, useState } from 'react';
import { Channel as StreamChannel, StreamChat, MessageResponse } from 'stream-chat';
import { Card } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { useStreamChat } from '@/context/StreamChatContext';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  user: {
    id: string;
    name: string;
  };
  created_at: string;
}

const StreamChatRoom: React.FC<{ eventName: string }> = ({ eventName }) => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, userProfile } = useAuth();
  const { createChannel, getChannel, isLoading: clientLoading } = useStreamChat();
  
  const [channel, setChannel] = useState<StreamChannel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeChannel = async () => {
      if (!eventId || !user || clientLoading) return;

      try {
        let eventChannel = await getChannel(eventId);
        
        if (!eventChannel) {
          eventChannel = await createChannel(eventId, eventName || `Event Chat ${eventId}`);
        }

        if (eventChannel) {
          setChannel(eventChannel);
          
          const response = await eventChannel.query({ messages: { limit: 30 } });
          if (response.messages) {
            const formattedMessages: Message[] = response.messages.map(msg => ({
              id: msg.id,
              text: msg.text || '',
              user: {
                id: msg.user?.id || '',
                name: msg.user?.name || 'Unknown User'
              },
              created_at: msg.created_at || new Date().toISOString()
            }));
            setMessages(formattedMessages.reverse());
          }

          eventChannel.on('message.new', (event) => {
            if (event.message) {
              const newMsg: Message = {
                id: event.message.id,
                text: event.message.text || '',
                user: {
                  id: event.message.user?.id || '',
                  name: event.message.user?.name || 'Unknown User'
                },
                created_at: event.message.created_at || new Date().toISOString()
              };
              setMessages((prevMessages) => [...prevMessages, newMsg]);
            }
          });

          eventChannel.on('message.updated', (event) => {
            if (event.message) {
              setMessages((prevMessages) => 
                prevMessages.map((msg) => {
                  if (msg.id === event.message.id) {
                    return {
                      id: event.message.id,
                      text: event.message.text || '',
                      user: {
                        id: event.message.user?.id || '',
                        name: event.message.user?.name || 'Unknown User'
                      },
                      created_at: event.message.created_at || new Date().toISOString()
                    };
                  }
                  return msg;
                })
              );
            }
          });

          eventChannel.on('message.deleted', (event) => {
            if (event.message) {
              setMessages((prevMessages) => 
                prevMessages.filter((msg) => msg.id !== event.message.id)
              );
            }
          });

          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing channel:', error);
        toast.error('Failed to load chat room');
        setLoading(false);
      }
    };

    initializeChannel();

    return () => {
      if (channel) {
        channel.off('message.new');
        channel.off('message.updated');
        channel.off('message.deleted');
      }
    };
  }, [eventId, user, clientLoading, createChannel, getChannel, eventName]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !channel || !user) return;
    
    try {
      await channel.sendMessage({
        text: newMessage.trim(),
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (loading || clientLoading) {
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
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.user.id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] ${message.user.id === user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback>
                    {getInitials(message.user.name || 'User')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div 
                    className={`rounded-lg px-4 py-2 inline-block ${
                      message.user.id === user?.id 
                        ? 'bg-herd-purple text-white' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p>{message.text}</p>
                  </div>
                  <div 
                    className={`text-xs text-gray-500 mt-1 ${
                      message.user.id === user?.id ? 'text-right' : 'text-left'
                    }`}
                  >
                    <span className="font-medium">{message.user.name || 'User'}</span> • {formatTime(message.created_at)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <form onSubmit={handleSendMessage} className="border-t p-4">
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

export default StreamChatRoom;
