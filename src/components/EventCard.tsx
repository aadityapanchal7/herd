
import React from 'react';
import { Event } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, MapPin, Users, CheckCircle, MessageCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import RSVPDialog from './RSVPDialog';

interface EventCardProps {
  event: Event;
  onRSVP?: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onRSVP }) => {
  const [showRSVPDialog, setShowRSVPDialog] = React.useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'social': return 'bg-blue-100 text-blue-800';
      case 'academic': return 'bg-green-100 text-green-800';
      case 'sports': return 'bg-red-100 text-red-800';
      case 'arts': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const openRSVPDialog = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (onRSVP) {
      onRSVP(event.id);
    } else {
      setShowRSVPDialog(true);
    }
  };
  
  const closeRSVPDialog = () => {
    setShowRSVPDialog(false);
  };
  
  const handleChatClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    navigate(`/chat/${event.id}`);
  };

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <Badge className={`${getCategoryColor(event.category)}`}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Badge>
            {event.host.verified && (
              <Badge variant="outline" className="flex gap-1 text-blue-600 border-blue-200">
                <CheckCircle className="h-3 w-3" />
                <span>Verified Host</span>
              </Badge>
            )}
          </div>
          <CardTitle className="text-lg font-bold mt-2">{event.title}</CardTitle>
          <CardDescription className="line-clamp-2">{event.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-500">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{formatDate(event.date)}{event.time ? ` • ${event.time}` : ''}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="truncate">{event.location_name}</span>
            </div>
            <div className="flex items-center text-gray-500">
              <Users className="h-4 w-4 mr-2" />
              <span>{event.attendees} / {event.capacity} attendees</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2 flex justify-between">
          <Button 
            variant="outline" 
            size="sm"
            className="text-herd-purple border-herd-purple/30 hover:bg-herd-purple/10"
            onClick={handleChatClick}
          >
            <MessageCircle className="mr-1 h-4 w-4" /> Chat
          </Button>
          <Button 
            size="sm"
            className="bg-herd-purple hover:bg-herd-purple-dark"
            onClick={openRSVPDialog}
            disabled={event.attendees >= event.capacity}
          >
            {event.attendees >= event.capacity ? 'Event Full' : 'RSVP'}
          </Button>
        </CardFooter>
      </Card>
      
      {!onRSVP && (
        <RSVPDialog
          event={event}
          isOpen={showRSVPDialog}
          onClose={closeRSVPDialog}
        />
      )}
    </>
  );
};

export default EventCard;
