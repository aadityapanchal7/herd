
import React from 'react';
import { Event } from '../types';
import EventCard from './EventCard';

interface EventListProps {
  events: Event[];
  title?: string;
  onRSVP?: (eventId: string) => void;
}

const EventList: React.FC<EventListProps> = ({ events, title, onRSVP }) => {
  return (
    <div className="w-full">
      {title && (
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard 
            key={event.id} 
            event={event}
          />
        ))}
      </div>
    </div>
  );
};

export default EventList;
