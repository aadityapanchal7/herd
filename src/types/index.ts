
export type EventCategory = 'social' | 'academic' | 'sports' | 'arts' | 'other';

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: {
    name: string;
    address: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  location_name: string; // Added this property
  category: EventCategory;
  attendees: number;
  capacity: number;
  host: {
    name: string;
    verified: boolean;
  };
  image_url?: string; // Added this property
  image?: string; // Keeping original property
}

export interface SearchFilters {
  query: string;
  category: EventCategory | 'all';
  date: 'today' | 'tomorrow' | 'this-week' | 'this-month' | 'all';
}

export interface ChatMessage {
  id: string;
  user_id: string;
  event_id: string;
  message: string;
  created_at: string;
  profile: {
    username: string;
    full_name: string;
    avatar_url: string | null;
  }
}
