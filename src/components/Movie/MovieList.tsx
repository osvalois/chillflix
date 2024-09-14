import React from 'react';
import { SimpleGrid } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import MovieCard from './MovieCard';
import { Movie } from '../../services/movieService';

interface MovieListProps {
  movies: Movie[];
}

const MotionSimpleGrid = motion(SimpleGrid as any);

const MovieList: React.FC<MovieListProps> = ({ movies }) => {
  return (
    <AnimatePresence>
      <MotionSimpleGrid
        columns={{ base: 1, md: 3, lg: 4 }}
        spacing={8}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {movies.map((movie) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <MovieCard movie={movie} />
          </motion.div>
        ))}
      </MotionSimpleGrid>
    </AnimatePresence>
  );
};

export default MovieList;