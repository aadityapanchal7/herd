
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface ChatMessage {
  id: string;
  user_id: string;
  event_id: string;
  message: string;
  created_at: string;
  profile: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  }
}

interface Event {
  id: string;
  title: string;
  date: string;
  location_name: string;
}

const EventChat = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch event details and messages
  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;
      
      try {
        // Get event details
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('id, title, date, location_name')
          .eq('id', eventId)
          .single();
        
        if (eventError) throw eventError;
        if (!eventData) {
          toast.error('Event not found');
          navigate('/');
          return;
        }
        
        setEvent(eventData);
        
        // Get chat messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('event_chat_messages')
          .select(`
            id, 
            user_id, 
            event_id, 
            message, 
            created_at,
            profile:profiles(username, full_name, avatar_url)
          `)
          .eq('event_id', eventId)
          .order('created_at', { ascending: true });
        
        if (messagesError) throw messagesError;
        setMessages(messagesData || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load chat data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`event_chat_${eventId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'event_chat_messages',
        filter: `event_id=eq.${eventId}`
      }, (payload) => {
        // Fetch the complete message with profile info
        const fetchNewMessage = async () => {
          const { data, error } = await supabase
            .from('event_chat_messages')
            .select(`
              id, 
              user_id, 
              event_id, 
              message, 
              created_at,
              profile:profiles(username, full_name, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();
          
          if (error) {
            console.error('Error fetching new message:', error);
            return;
          }
          
          setMessages(prev => [...prev, data]);
        };
        
        fetchNewMessage();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, navigate]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !eventId) return;
    
    try {
      const { error } = await supabase
        .from('event_chat_messages')
        .insert({
          user_id: user.id,
          event_id: eventId,
          message: newMessage.trim()
        });
      
      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };
  
  // Format timestamp to readable time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-herd-purple"></div>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center flex-grow">
          <div className="text-center p-4">
            <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
            <Button onClick={() => navigate('/')}>Back to Events</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 flex-grow flex flex-col">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h1 className="text-xl font-bold">{event.title}</h1>
          <p className="text-sm text-gray-600">
            {new Date(event.date).toLocaleDateString()} at {event.location_name}
          </p>
        </div>
        
        <div className="flex-grow bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          <div className="p-4 bg-herd-purple text-white">
            <h2 className="font-semibold">Event Chat</h2>
          </div>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No messages yet. Be the first to say hello!
              </div>
            ) : (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${msg.user_id === user?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>
                        {getInitials(msg.profile?.full_name || msg.profile?.username || 'User')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div 
                        className={`rounded-lg px-4 py-2 inline-block ${
                          msg.user_id === user?.id 
                            ? 'bg-herd-purple text-white' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p>{msg.message}</p>
                      </div>
                      <div 
                        className={`text-xs text-gray-500 mt-1 ${
                          msg.user_id === user?.id ? 'text-right' : 'text-left'
                        }`}
                      >
                        <span className="font-medium">{msg.profile?.username || 'User'}</span> • {formatTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow"
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                Send
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventChat;
