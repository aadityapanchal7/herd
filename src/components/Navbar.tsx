
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, Bell, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CreateEventDialog from './CreateEventDialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const notifications = [
    {
      id: 1,
      title: 'New RSVP',
      message: 'John D. RSVP\'d to your event "End of Semester Party"',
      time: '2 hours ago'
    },
    {
      id: 2,
      title: 'Event Reminder',
      message: 'Your event "Exam Prep Study Group" starts tomorrow',
      time: '5 hours ago'
    },
    {
      id: 3,
      title: 'New Message',
      message: 'Sarah posted in the "Basketball Tournament" chat',
      time: '1 day ago'
    }
  ];

  const handleClearNotifications = () => {
    setNotificationsCount(0);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-herd-purple-light to-herd-purple bg-clip-text text-transparent">Herd</span>
          </Link>
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
          <Popover open={showNotifications} onOpenChange={setShowNotifications}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-herd-text-secondary hover:text-herd-purple hover:bg-herd-purple/10">
                <Bell className="h-5 w-5" />
                {notificationsCount > 0 && (
                  <span className="absolute top-0 right-0 h-5 w-5 flex items-center justify-center text-xs bg-red-500 text-white rounded-full">
                    {notificationsCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-medium">Notifications</h3>
                {notificationsCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-herd-purple hover:text-herd-purple-dark"
                    onClick={handleClearNotifications}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length > 0 ? (
                  <div>
                    {notifications.map((notification) => (
                      <div key={notification.id} className="p-4 border-b hover:bg-gray-50 cursor-pointer">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-sm">{notification.title}</h4>
                          <span className="text-xs text-gray-500">{notification.time}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <p>No new notifications</p>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-herd-purple/10 text-herd-purple">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.id.substring(0, 8)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-500 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button 
                className="flex items-center gap-1 bg-herd-purple hover:bg-herd-purple-dark text-white"
                onClick={() => setIsCreateEventOpen(true)}
              >
                <PlusCircle className="h-4 w-4" />
                <span>Create Event</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="flex items-center gap-1 text-herd-text-secondary" asChild>
                <Link to="/auth">
                  <User className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              </Button>
              <Button className="flex items-center gap-1 bg-herd-purple hover:bg-herd-purple-dark text-white" asChild>
                <Link to="/auth?tab=signup">
                  <PlusCircle className="h-4 w-4" />
                  <span>Sign Up</span>
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
      <CreateEventDialog isOpen={isCreateEventOpen} onClose={() => setIsCreateEventOpen(false)} />
    </header>
  );
};

export default Navbar;
