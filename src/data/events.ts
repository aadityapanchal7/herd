
import { Event } from '../types';

export const events: Event[] = [
  {
    id: '1',
    title: 'End of Semester Party',
    description: 'Come celebrate the end of the semester with music, food, and games!',
    date: '2023-12-15',
    time: '8:00 PM',
    location: {
      name: 'The Quad',
      address: 'University Main Quad',
      coordinates: [-122.1697, 37.4275], // Stanford University coordinates
    },
    location_name: 'The Quad',
    category: 'social',
    attendees: 45,
    capacity: 100,
    host: {
      name: 'Student Council',
      verified: true,
    },
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    image_url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
  },
  {
    id: '2',
    title: 'Exam Prep Study Group',
    description: 'Join fellow students to study for the upcoming calculus exam.',
    date: '2023-12-10',
    time: '3:00 PM',
    location: {
      name: 'Main Library',
      address: 'University Library, Room 202',
      coordinates: [-122.1689, 37.4268], // Nearby Stanford Library
    },
    location_name: 'Main Library',
    category: 'academic',
    attendees: 12,
    capacity: 20,
    host: {
      name: 'Math Club',
      verified: true,
    },
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
  },
  {
    id: '3',
    title: 'Intramural Basketball Tournament',
    description: 'Sign up your team for the end-of-year basketball tournament!',
    date: '2023-12-18',
    time: '2:00 PM',
    location: {
      name: 'Recreation Center',
      address: 'University Rec Center, Court 3',
      coordinates: [-122.1710, 37.4290], // Recreation center nearby
    },
    location_name: 'Recreation Center',
    category: 'sports',
    attendees: 32,
    capacity: 50,
    host: {
      name: 'Campus Recreation',
      verified: true,
    },
    image: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1742&q=80',
    image_url: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1742&q=80',
  },
  {
    id: '4',
    title: 'Campus Art Exhibition',
    description: 'View artwork created by students throughout the semester.',
    date: '2023-12-20',
    time: '5:00 PM',
    location: {
      name: 'Art Building',
      address: 'Fine Arts Building, Gallery 1',
      coordinates: [-122.1677, 37.4260], // Art building
    },
    location_name: 'Art Building',
    category: 'arts',
    attendees: 18,
    capacity: 75,
    host: {
      name: 'Art Department',
      verified: true,
    },
    image: 'https://images.unsplash.com/photo-1516570611566-4217d79a2c74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    image_url: 'https://images.unsplash.com/photo-1516570611566-4217d79a2c74?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
  },
  {
    id: '5',
    title: 'Hackathon 2023',
    description: 'Build innovative projects in 24 hours with great prizes!',
    date: '2023-12-08',
    time: '9:00 AM',
    location: {
      name: 'Engineering Building',
      address: 'Engineering Center, Floor 1',
      coordinates: [-122.1730, 37.4280], // Engineering building
    },
    location_name: 'Engineering Building',
    category: 'academic',
    attendees: 85,
    capacity: 150,
    host: {
      name: 'Tech Club',
      verified: true,
    },
    image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1712&q=80',
    image_url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1712&q=80',
  },
  {
    id: '6',
    title: 'Movie Night: Finals Edition',
    description: 'Take a break from studying with a screening of Ferris Bueller\'s Day Off.',
    date: '2023-12-12',
    time: '7:30 PM',
    location: {
      name: 'Student Union',
      address: 'Student Union, Auditorium',
      coordinates: [-122.1700, 37.4265], // Student union
    },
    location_name: 'Student Union',
    category: 'social',
    attendees: 28,
    capacity: 75,
    host: {
      name: 'Film Society',
      verified: false,
    },
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1625&q=80',
    image_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1625&q=80',
  },
];
