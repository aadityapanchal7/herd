
import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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

  useEffect(() => {
    if (!mapContainer.current) return;

    // Use environment variable for Mapbox token
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283], // Centered on USA
      zoom: 3
    });

    // Add markers for each university
    universities.forEach(uni => {
      new mapboxgl.Marker()
        .setLngLat([uni.longitude, uni.latitude])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <h3>${uni.name}</h3>
          <p>${uni.description || ''}</p>
        `))
        .addTo(map.current!);
    });

    return () => {
      map.current?.remove();
    };
  }, [universities]);

  return (
    <div 
      ref={mapContainer} 
      className="w-full h-[500px] rounded-lg shadow-md"
    />
  );
};

export default UniversitiesMap;
