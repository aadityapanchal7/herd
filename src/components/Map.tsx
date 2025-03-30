
import React, { useEffect, useRef, useState } from 'react';
import { Event } from '../types';

interface MapComponentProps {
  events: Event[];
  onEventSelect?: (eventId: string) => void;
}

// This is a placeholder component for the MapBox integration
// In a real implementation, you would use MapBox GL JS
const MapComponent: React.FC<MapComponentProps> = ({ events, onEventSelect }) => {
  return (
    <div className="relative w-full h-96 rounded-xl bg-gray-100 overflow-hidden shadow-lg">
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-gray-500">
          Interactive map will be integrated here with MapBox GL JS
        </p>
      </div>
      
      {/* Show pins for visual representation */}
      {events.map((event) => (
        <div 
          key={event.id}
          className={`absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2 
            rounded-full bg-herd-category-${event.category} border-2 border-white
            flex items-center justify-center text-white text-xs font-bold
            cursor-pointer hover:scale-110 transition-transform`}
          style={{ 
            // These values are just for demo - in real implementation 
            // these would be calculated based on map bounds
            left: `${30 + Math.random() * 40}%`, 
            top: `${30 + Math.random() * 40}%` 
          }}
          onClick={() => onEventSelect && onEventSelect(event.id)}
          title={event.title}
        >
          {event.category.charAt(0).toUpperCase()}
        </div>
      ))}
      
      {/* Display a simple legend */}
      <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md">
        <div className="text-xs font-medium mb-1">Event Types</div>
        {['social', 'academic', 'sports', 'arts', 'other'].map((category) => (
          <div key={category} className="flex items-center text-xs mb-1">
            <div className={`w-3 h-3 rounded-full bg-herd-category-${category} mr-1`}></div>
            <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapComponent;
