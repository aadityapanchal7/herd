
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
  const [mapboxToken, setMapboxToken] = useState<string>(
    'pk.eyJ1IjoibmlzaGFudDIwMDYiLCJhIjoiY204eG9yNWNkMDYxYzJ4cHdqZTg4YjVqZiJ9.z74lUbGBXRIrITGYJvj1zg'
  );

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    // Use the provided Mapbox token
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

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-[500px] rounded-lg shadow-md"
    />
  );
};

export default UniversitiesMap;
