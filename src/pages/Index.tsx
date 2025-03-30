
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import EventList from '../components/EventList';
import Map from '../components/Map';
import SearchFilters from '../components/SearchFilters';
import { events } from '../data/events';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchFilters as SearchFiltersType, Event, EventCategory } from '../types';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState<SearchFiltersType>({
    query: '',
    category: 'all',
    date: 'all',
  });

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
                Find and join events happening around your campus. From parties to study groups, we've got you covered.
              </p>
            </div>
          </div>
          
          <SearchFilters 
            filters={filters} 
            onFilterChange={setFilters} 
          />
          
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger 
                value="list" 
                onClick={() => setActiveTab('list')}
                className="flex-1"
              >
                List View
              </TabsTrigger>
              <TabsTrigger 
                value="map" 
                onClick={() => setActiveTab('map')}
                className="flex-1"
              >
                Map View
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              {filteredEvents.length > 0 ? (
                <EventList events={filteredEvents} />
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
          </Tabs>
        </section>
        
        {activeTab === 'list' && (
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Trending Events</h2>
            <EventList events={trendingEvents} />
          </section>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold bg-gradient-to-r from-herd-purple-light to-herd-purple bg-clip-text text-transparent">
                Herd
              </span>
              <p className="text-sm text-herd-text-secondary mt-1">
                Connecting college communities through events.
              </p>
            </div>
            <div className="flex gap-4 text-sm text-herd-text-secondary">
              <a href="#" className="hover:text-herd-purple transition-colors">About</a>
              <a href="#" className="hover:text-herd-purple transition-colors">Privacy</a>
              <a href="#" className="hover:text-herd-purple transition-colors">Terms</a>
              <a href="#" className="hover:text-herd-purple transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
