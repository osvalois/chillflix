// src/components/Movie/MovieCard.tsx
import React from "react";
import { Box, Image, Text, VStack, Button } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { Movie } from "../../services/movieService";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <Box
      maxW="sm"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      transition="all 0.3s"
      _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
    >
      <Image src="/api/placeholder/300/450" alt={movie.title} />
      <VStack p={4} align="start" spacing={2}>
        <Text fontWeight="bold" fontSize="xl" noOfLines={1}>
          {movie.title}
        </Text>
        <Text color="gray.500">Año: {movie.year}</Text>
        <Text color="gray.500">Idioma: {movie.language}</Text>
        <Text color="gray.500">Calidad: {movie.quality}</Text>
        <Button
          as={RouterLink}
          to={`/movie/${encodeURIComponent(movie.magnet)}`}
          colorScheme="brand"
          width="full"
        >
          Ver detalles
        </Button>
      </VStack>
    </Box>
  );
};

export default React.memo(MovieCard);