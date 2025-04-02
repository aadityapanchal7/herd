
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarClock, MapPin, User, MessageCircle } from 'lucide-react';
import { Event } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface EventCardProps {
  event: Event;
  onRSVP: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onRSVP }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Format date for display
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short', 
    day: 'numeric'
  });

  // Format time for display
  const formattedTime = new Date(event.date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Get category color
  const getCategoryColor = () => {
    switch(event.category) {
      case 'social': return 'bg-herd-category-social';
      case 'academic': return 'bg-herd-category-academic';
      case 'sports': return 'bg-herd-category-sports';
      case 'arts': return 'bg-herd-category-arts';
      default: return 'bg-herd-category-other';
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) {
      navigate(`/event/${event.id}/chat`);
    } else {
      navigate('/auth');
    }
  };

  return (
    <Card className="overflow-hidden group hover:shadow-md transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative h-32 md:h-48 bg-gray-200 overflow-hidden">
          {event.image_url ? (
            <img 
              src={event.image_url} 
              alt={event.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-r from-herd-purple-light to-herd-purple">
              <span className="text-white text-xl font-bold">{event.title.charAt(0)}</span>
            </div>
          )}
          <div className={`absolute top-2 right-2 ${getCategoryColor()} text-white px-2 py-1 rounded-full text-xs font-medium`}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{event.title}</h3>
        <p className="text-herd-text-secondary text-sm mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-herd-text-secondary">
            <CalendarClock size={16} className="mr-2" />
            <span>{formattedDate} • {formattedTime}</span>
          </div>
          <div className="flex items-center text-herd-text-secondary">
            <MapPin size={16} className="mr-2" />
            <span className="truncate">{event.location_name}</span>
          </div>
          <div className="flex items-center text-herd-text-secondary">
            <User size={16} className="mr-2" />
            <span>{event.attendees} / {event.capacity} attending</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          variant="default" 
          className="flex-1 bg-herd-purple hover:bg-herd-purple-dark"
          onClick={() => onRSVP(event.id)}
        >
          RSVP
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-herd-purple text-herd-purple hover:bg-herd-purple/10"
          onClick={handleChatClick}
        >
          <MessageCircle size={16} className="mr-2" />
          Chat
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
