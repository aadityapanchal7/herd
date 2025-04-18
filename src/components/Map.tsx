import React, { useEffect, useRef, useState } from 'react';
import { Event } from '../types';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapComponentProps {
  events: Event[];
  onEventSelect?: (eventId: string) => void;
}

// Set your Mapbox access token here - in a real application, this should be in an environment variable
mapboxgl.accessToken = 'pk.eyJ1IjoieW91ci11c2VybmFtZSIsImEiOiJjbGV5d3pzZTQwMGswM3FzNXB6emJzcnRrIn0';

const MapComponent: React.FC<MapComponentProps> = ({ events, onEventSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Initialize map when component mounts
  useEffect(() => {
    if (map.current) return; // initialize map only once
    if (!mapContainer.current) return; // wait for container to be ready

    // Create a new map instance
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-122.1697, 37.4275], // Default center (can be calculated from events)
      zoom: 14
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Set loaded state when map is ready
    map.current.on('load', () => {
      setLoaded(true);
    });

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add markers when map is loaded and when events change
  useEffect(() => {
    if (!map.current || !loaded || events.length === 0) return;

    // Remove existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Calculate bounds to contain all event locations
    const bounds = new mapboxgl.LngLatBounds();

    // Add new markers for each event
    events.forEach(event => {
      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = `w-6 h-6 rounded-full bg-herd-category-${event.category} border-2 border-white
        flex items-center justify-center text-white text-xs font-bold cursor-pointer`;
      markerEl.innerHTML = event.category.charAt(0).toUpperCase();
      markerEl.style.width = '30px';
      markerEl.style.height = '30px';
      markerEl.style.borderRadius = '50%';
      markerEl.style.display = 'flex';
      markerEl.style.alignItems = 'center';
      markerEl.style.justifyContent = 'center';
      markerEl.style.fontWeight = 'bold';
      markerEl.style.fontSize = '12px';
      markerEl.style.color = 'white';
      markerEl.style.border = '2px solid white';
      markerEl.style.cursor = 'pointer';
      
      // Apply category-specific background color
      switch(event.category) {
        case 'social':
          markerEl.style.backgroundColor = '#3B82F6'; // blue
          break;
        case 'academic':
          markerEl.style.backgroundColor = '#10B981'; // green
          break;
        case 'sports':
          markerEl.style.backgroundColor = '#EF4444'; // red
          break;
        case 'arts':
          markerEl.style.backgroundColor = '#8B5CF6'; // purple
          break;
        case 'other':
          markerEl.style.backgroundColor = '#6B7280'; // gray
          break;
      }
      
      // Create and add the marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(event.location.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div>
                <h3 class="font-bold text-sm">${event.title}</h3>
                <p class="text-xs">${event.location.name}</p>
                <p class="text-xs">${event.date} • ${event.time}</p>
                <button class="mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 view-event-button" data-event-id="${event.id}">
                  View Details
                </button>
              </div>
            `)
        )
        .addTo(map.current);
        
      // Track the marker for cleanup
      markers.current.push(marker);
      
      // Add the location to bounds
      bounds.extend(event.location.coordinates);
      
      // Add click event for the popup buttons
      marker.getPopup().on('open', () => {
        setTimeout(() => {
          const viewButton = document.querySelector(`.view-event-button[data-event-id="${event.id}"]`);
          if (viewButton) {
            viewButton.addEventListener('click', () => {
              if (onEventSelect) {
                onEventSelect(event.id);
              }
            });
          }
        }, 0);
      });
    });
    
    // Fit map to contain all markers with padding
    if (events.length > 1) {
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    } else if (events.length === 1) {
      // If only one event, center on it
      map.current.flyTo({
        center: events[0].location.coordinates,
        zoom: 15
      });
    }
  }, [events, loaded, onEventSelect]);

  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Display a simple legend */}
      <div className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md z-10">
        <div className="text-xs font-medium mb-1">Event Types</div>
        {[
          { category: 'social', label: 'Social' },
          { category: 'academic', label: 'Academic' },
          { category: 'sports', label: 'Sports' },
          { category: 'arts', label: 'Arts' },
          { category: 'other', label: 'Other' }
        ].map(({ category, label }) => (
          <div key={category} className="flex items-center text-xs mb-1">
            <div className={`w-3 h-3 rounded-full bg-herd-category-${category} mr-1`} 
                 style={{
                   backgroundColor: 
                     category === 'social' ? '#3B82F6' : 
                     category === 'academic' ? '#10B981' : 
                     category === 'sports' ? '#EF4444' : 
                     category === 'arts' ? '#8B5CF6' : '#6B7280'
                 }}></div>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapComponent;