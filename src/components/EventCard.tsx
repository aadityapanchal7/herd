import React, { useState } from 'react';
import { Event } from '../types';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface EventCardProps {
  event: Event;
  onRSVP?: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onRSVP }) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const capacityPercentage = (event.attendees / event.capacity) * 100;
  let capacityColor = 'bg-green-500';
  
  if (capacityPercentage >= 90) {
    capacityColor = 'bg-red-500';
  } else if (capacityPercentage >= 60) {
    capacityColor = 'bg-yellow-500';
  }

  return (
    <>
      <Card 
        className="overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 h-full flex flex-col cursor-pointer"
        onClick={() => setIsDetailOpen(true)}
      >
        <div className="relative h-48 overflow-hidden">
          <div className="absolute top-3 right-3 z-10">
            <Badge className={`bg-herd-category-${event.category} hover:bg-herd-category-${event.category}/90`}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </Badge>
          </div>
          {event.image ? (
            <img 
              src={event.image} 
              alt={event.title} 
              className="w-full h-48 object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className={`w-full h-48 flex items-center justify-center bg-herd-category-${event.category}/20`}>
              <span className="text-2xl font-bold text-herd-category-${event.category}">
                {event.title.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <CardContent className="flex-grow p-4">
          <h3 className="text-xl font-semibold mb-2 line-clamp-1">{event.title}</h3>
          
          <div className="flex items-center text-sm text-herd-text-secondary mb-2">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(event.date)}</span>
            <span className="mx-1">•</span>
            <Clock className="h-4 w-4 mr-1" />
            <span>{event.time}</span>
          </div>
          
          <div className="flex items-start text-sm text-herd-text-secondary mb-3">
            <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{event.location.name}</span>
          </div>
          
          <p className="text-sm text-herd-text-secondary line-clamp-2 mb-3">
            {event.description}
          </p>
          
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-1" />
            <span className="text-herd-text-secondary">{event.attendees}/{event.capacity} attending</span>
          </div>
          
          <div className="w-full h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
            <div 
              className={`h-full ${capacityColor} rounded-full`} 
              style={{ width: `${capacityPercentage}%` }}
            ></div>
          </div>
        </CardContent>
        
        <CardFooter className="p-4 pt-0">
          <Button 
            className="w-full bg-herd-purple hover:bg-herd-purple-dark"
            onClick={(e) => {
              e.stopPropagation();
              onRSVP && onRSVP(event.id);
            }}
          >
            Join Event
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{event.title}</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6">
            {event.image && (
              <img 
                src={event.image} 
                alt={event.title} 
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            <div>
              <DialogDescription>
                <div className="space-y-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location.name}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{event.attendees}/{event.capacity} attending</span>
                  </div>
                  <Badge className={`bg-herd-category-${event.category}`}>
                    {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                  </Badge>
                </div>
                <p className="mt-4 text-herd-text-secondary">{event.description}</p>
              </DialogDescription>
              <Button 
                className="mt-4 w-full bg-herd-purple hover:bg-herd-purple-dark"
                onClick={() => onRSVP && onRSVP(event.id)}
              >
                RSVP to Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventCard;
