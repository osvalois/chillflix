// src/pages/MoviePage/MoviePage.tsx
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { MoviePageContent } from '../components/Streaming/MoviePageContent';
import ErrorFallback from '../components/UI/ErrorFallback';


const MoviePageWrapper: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MoviePageContent />
    </ErrorBoundary>
  );
};

export default MoviePageWrapper;
