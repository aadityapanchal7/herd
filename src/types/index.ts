
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
  category: EventCategory;
  attendees: number;
  capacity: number;
  host: {
    name: string;
    verified: boolean;
  };
  image?: string;
}

export interface SearchFilters {
  query: string;
  category: EventCategory | 'all';
  date: 'today' | 'tomorrow' | 'this-week' | 'this-month' | 'all';
}
