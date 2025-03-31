
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from './ui/button';

interface University {
  name: string;
  longitude: number;
  latitude: number;
  description?: string;
}

interface UniversitiesMapProps {
  universities: University[];
}

const UniversitiesMap: React.FC<UniversitiesMapProps> = ({ universities }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>(import.meta.env.VITE_MAPBOX_TOKEN || '');
  const [showTokenInput, setShowTokenInput] = useState<boolean>(!import.meta.env.VITE_MAPBOX_TOKEN);

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Use environment variable for Mapbox token
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283], // Centered on USA
      zoom: 3
    });

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Add markers for each university
    universities.forEach(uni => {
      new mapboxgl.Marker()
        .setLngLat([uni.longitude, uni.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <h3 class="font-bold text-lg">${uni.name}</h3>
          <p>${uni.description || ''}</p>
        `))
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
    };
  }, [universities, mapboxToken]);

  const handleTokenSubmit = () => {
    if (mapboxToken) {
      setShowTokenInput(false);
    }
  };

  if (showTokenInput) {
    return (
      <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
        <h3 className="text-lg font-bold mb-4">Mapbox Token Required</h3>
        <p className="mb-4">
          To display the map, please enter your Mapbox public token. You can find or create one at{' '}
          <a 
            href="https://account.mapbox.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Mapbox.com
          </a>
        </p>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={mapboxToken} 
            onChange={(e) => setMapboxToken(e.target.value)}
            placeholder="Enter Mapbox token"
            className="flex-grow p-2 border border-gray-300 rounded"
          />
          <Button onClick={handleTokenSubmit}>
            Submit
          </Button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          For production use, set the VITE_MAPBOX_TOKEN environment variable.
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-[500px] rounded-lg shadow-md"
    />
  );
};

export default UniversitiesMap;
