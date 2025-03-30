
import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Filter, Calendar as CalendarIcon } from 'lucide-react';
import { SearchFilters } from '../types';

interface SearchFilterProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

const SearchFilterComponent: React.FC<SearchFilterProps> = ({ filters, onFilterChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, query: e.target.value });
  };

  const handleCategoryChange = (category: SearchFilters['category']) => {
    onFilterChange({ ...filters, category });
  };

  const handleDateChange = (date: SearchFilters['date']) => {
    onFilterChange({ ...filters, date });
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={filters.query}
            onChange={handleInputChange}
            placeholder="Search for events..."
            className="pl-10 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-herd-purple focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Category: {filters.category === 'all' ? 'All' : filters.category}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white">
              <DropdownMenuItem onClick={() => handleCategoryChange('all')}>
                All Categories
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCategoryChange('social')}>
                Social
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCategoryChange('academic')}>
                Academic
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCategoryChange('sports')}>
                Sports
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCategoryChange('arts')}>
                Arts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleCategoryChange('other')}>
                Other
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>Date: {filters.date === 'all' ? 'All' : filters.date}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white">
              <DropdownMenuItem onClick={() => handleDateChange('all')}>
                All Dates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateChange('today')}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateChange('tomorrow')}>
                Tomorrow
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateChange('this-week')}>
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDateChange('this-month')}>
                This Month
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default SearchFilterComponent;
