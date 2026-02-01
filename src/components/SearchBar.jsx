// components/SearchBar.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

export default function SearchBar({ onSearch, placeholder = 'Search menu items...' }) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500); // Increased debounce time

  // Only call onSearch when debouncedQuery changes
  useEffect(() => {
    if (debouncedQuery !== undefined) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  const clearSearch = () => {
    setQuery('');
    // Directly call onSearch with empty string
    onSearch('');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    // If empty, immediately clear search
    if (!value.trim()) {
      onSearch('');
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}