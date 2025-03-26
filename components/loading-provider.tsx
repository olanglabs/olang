'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

interface LoadingContextProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextProps>({
  isLoading: false,
  setIsLoading: () => {},
});

export const useLoading = () => useContext(LoadingContext);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounced loading state to avoid flickering
  const setDebouncedLoading = useCallback((loading: boolean) => {
    if (loading) {
      // Start loading immediately
      setIsLoading(true);
    } else {
      // Delay turning off loading for a smoother experience
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }

      loadingTimeout.current = setTimeout(() => {
        setIsLoading(false);
      }, 400); // Small delay to avoid flickering
    }
  }, []);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeout.current) {
        clearTimeout(loadingTimeout.current);
      }
    };
  }, []);

  return (
    <LoadingContext.Provider
      value={{ isLoading, setIsLoading: setDebouncedLoading }}
    >
      {children}
    </LoadingContext.Provider>
  );
}
