
import React from 'react';
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, Bell, User } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <a href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-herd-purple-light to-herd-purple bg-clip-text text-transparent">Herd</span>
          </a>
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search events..."
              className="pl-10 py-2 w-full rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-herd-purple focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-herd-text-secondary hover:text-herd-purple hover:bg-herd-purple/10">
            <Bell className="h-5 w-5" />
          </Button>
          <Button variant="outline" className="flex items-center gap-1 text-herd-text-secondary">
            <User className="h-4 w-4" />
            <span>Login</span>
          </Button>
          <Button className="flex items-center gap-1 bg-herd-purple hover:bg-herd-purple-dark text-white">
            <PlusCircle className="h-4 w-4" />
            <span>Create Event</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
