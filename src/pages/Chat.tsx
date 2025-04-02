
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/types';
import Navbar from '@/components/Navbar';
import ChatRoom from '@/components/ChatRoom';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const Chat: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (error) throw error;

        // Format the event data to match our Event type
        const formattedEvent: Event = {
          id: data.id,
          title: data.title,
          description: data.description,
          date: data.date,
          time: data.time || '',
          location: {
            name: data.location_name,
            address: data.address,
            coordinates: [data.longitude, data.latitude],
          },
          location_name: data.location_name,
          category: data.category,
          attendees: data.attendees,
          capacity: data.capacity,
          host: {
            name: data.host_name,
            verified: data.host_verified,
          },
          image_url: data.image_url,
        };

        setEvent(formattedEvent);

        // Check if the user has RSVP'd for this event
        if (user) {
          const { count } = await supabase
            .from('rsvps')
            .select('*', { count: 'exact' })
            .eq('event_id', eventId);

          setParticipantCount(count || 0);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-herd-purple"></div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Event Not Found</h1>
            <p className="mb-4">The event you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/')} className="bg-herd-purple hover:bg-herd-purple-dark">
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-4 flex-1 flex flex-col">
        <div className="bg-white rounded-lg shadow-md flex flex-col h-[calc(100vh-132px)]">
          <div className="p-4 border-b flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(`/event/${eventId}`)}
                className="text-gray-500 hover:text-herd-purple"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="font-semibold">{event.title}</h2>
                <p className="text-sm text-gray-500">{new Date(event.date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-500">{participantCount} participants</span>
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatRoom />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
