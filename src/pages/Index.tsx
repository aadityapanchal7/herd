import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import EventList from '../components/EventList';
import Map from '../components/Map';
import UniversitiesMap from '../components/UniversitiesMap';
import SearchFilters from '../components/SearchFilters';
import { events } from '../data/events';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchFilters as SearchFiltersType, Event, EventCategory } from '../types';
import { toast } from 'sonner';

const universities = [
  { name: 'UT Austin', longitude: -97.7372, latitude: 30.2849, description: 'University of Texas at Austin' },
  { name: 'Georgia Tech', longitude: -84.3963, latitude: 33.7756, description: 'Georgia Institute of Technology' },
  { name: 'Ole Miss', longitude: -89.5362, latitude: 34.3647, description: 'University of Mississippi' },
  { name: 'Harvard', longitude: -71.1167, latitude: 42.3770, description: 'Harvard University' },
  { name: 'Stanford', longitude: -122.1697, latitude: 37.4275, description: 'Stanford University' }
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'map' | 'universities'>('list');
  const [filters, setFilters] = useState<SearchFiltersType>({
    query: '',
    category: 'all',
    date: 'all',
  });

  const handleRSVP = (eventId: string) => {
    // Placeholder RSVP functionality
    toast.success('RSVP Successful!', {
      description: 'You have been added to the event attendee list.'
    });
  };

  // Filter events based on search filters
  const filteredEvents = events.filter((event) => {
    // Filter by search query
    if (filters.query && !event.title.toLowerCase().includes(filters.query.toLowerCase()) &&
        !event.description.toLowerCase().includes(filters.query.toLowerCase())) {
      return false;
    }

    // Filter by category
    if (filters.category !== 'all' && event.category !== filters.category) {
      return false;
    }

    // Filter by date (simplified for this demo)
    if (filters.date !== 'all') {
      const eventDate = new Date(event.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filters.date === 'today') {
        const endOfDay = new Date(today);
        endOfDay.setHours(23, 59, 59, 999);
        if (eventDate < today || eventDate > endOfDay) return false;
      } 
      else if (filters.date === 'tomorrow') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const endOfTomorrow = new Date(tomorrow);
        endOfTomorrow.setHours(23, 59, 59, 999);
        if (eventDate < tomorrow || eventDate > endOfTomorrow) return false;
      }
      else if (filters.date === 'this-week') {
        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
        if (eventDate < today || eventDate > endOfWeek) return false;
      }
      else if (filters.date === 'this-month') {
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        if (eventDate < today || eventDate > endOfMonth) return false;
      }
    }

    return true;
  });

  // Group events by category for the trending section
  const eventsByCategory: Record<EventCategory, Event[]> = {
    social: [],
    academic: [],
    sports: [],
    arts: [],
    other: []
  };

  events.forEach(event => {
    eventsByCategory[event.category].push(event);
  });

  // Get a few trending events from each category
  const trendingEvents = Object.values(eventsByCategory)
    .flatMap(categoryEvents => categoryEvents.slice(0, 1))
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6 flex-grow">
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-herd-purple-light to-herd-purple bg-clip-text text-transparent">
                Discover Campus Events
              </h1>
              <p className="text-herd-text-secondary mt-2 max-w-2xl">
                Find and join events happening around your campus. From study groups to parties, there's something for everyone.
              </p>
            </div>
          </div>
          
          <SearchFilters 
            filters={filters} 
            onFilterChange={setFilters} 
          />
          
          <Tabs 
            defaultValue="list" 
            className="w-full" 
            onValueChange={(value) => setActiveTab(value as 'list' | 'map' | 'universities')}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="list" className="flex-1">List View</TabsTrigger>
              <TabsTrigger value="map" className="flex-1">Event Map</TabsTrigger>
              <TabsTrigger value="universities" className="flex-1">Campus Locations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              {filteredEvents.length > 0 ? (
                <EventList 
                  events={filteredEvents} 
                  onRSVP={handleRSVP} 
                />
              ) : (
                <div className="text-center py-10">
                  <h3 className="text-xl font-semibold mb-2">No events found</h3>
                  <p className="text-herd-text-secondary">
                    Try adjusting your filters to find more events.
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="map">
              <Map events={filteredEvents} />
            </TabsContent>
            
            <TabsContent value="universities">
              <UniversitiesMap universities={universities} />
            </TabsContent>
          </Tabs>
        </section>
      </main>
    </div>
  );
};

export default Index;
