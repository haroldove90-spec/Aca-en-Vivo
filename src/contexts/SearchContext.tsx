import React, { createContext, useContext, useState } from 'react';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dates: { checkIn: string; checkOut: string };
  setDates: (dates: { checkIn: string; checkOut: string }) => void;
  guests: number;
  setGuests: (guests: number) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [dates, setDates] = useState({ checkIn: '', checkOut: '' });
  const [guests, setGuests] = useState(2);

  return (
    <SearchContext.Provider value={{ 
      searchQuery, 
      setSearchQuery,
      dates,
      setDates,
      guests,
      setGuests
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) throw new Error('useSearch must be used within SearchProvider');
  return context;
};
