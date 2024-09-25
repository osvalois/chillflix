import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { fetchSearchSuggestions } from '../services/tmdbService';
import { SearchResult } from '../types';

export const useSearchLogic = (onSearch: (term: string) => void) => {
  const [inputValue, setInputValue] = useState('');
  const [debouncedInputValue] = useDebounce(inputValue, 300);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isListening, setIsListening] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleSearch = useCallback(() => {
    if (inputValue.trim() && typeof onSearch === 'function') {
      onSearch(inputValue.trim());
    }
  }, [inputValue, onSearch]);

  const handleVoiceSearch = useCallback(() => {
    setIsListening(prev => !prev);
    // Implement voice search logic here
  }, []);

  const handleSuggestionClick = useCallback((suggestion: SearchResult) => {
    setInputValue(suggestion.title);
    if (typeof onSearch === 'function') {
      onSearch(suggestion.title);
    }
  }, [onSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedInputValue) {
        try {
          const results = await fetchSearchSuggestions(debouncedInputValue);
          setSuggestions(results);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
        }
      } else {
        setSuggestions([]);
      }
    };
    fetchSuggestions();
  }, [debouncedInputValue]);

  return {
    inputValue,
    setInputValue,
    suggestions,
    isListening,
    handleInputChange,
    handleSearch,
    handleVoiceSearch,
    handleSuggestionClick,
    handleKeyDown,
  };
};