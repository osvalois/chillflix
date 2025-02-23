// src/pages/MoviePage/MoviePage.tsx
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider } from 'react-helmet-async';
import MoviePageContent from '../components/Streaming/MoviePageContent';
import ErrorFallback from '../components/UI/ErrorFallback';
import { Box } from '@chakra-ui/react';

const TvPageWrapper: React.FC = () => {
  const handleError = (error: Error) => {
    console.error('MoviePage Error:', error);
  };

  return (
    <HelmetProvider>
      <ErrorBoundary 
        FallbackComponent={ErrorFallback}
        onError={handleError}
      >
        <Box 
          position="relative"
          minH="100vh"
          overflow="hidden"
        >
          <MoviePageContent />
        </Box>
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default TvPageWrapper;

