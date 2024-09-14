import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Container,

  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { searchMovies, Movie } from "../services/movieService";
import { useToast } from "@chakra-ui/toast";
import { GlassmorphicBox } from "../components/UI/GlassmorphicBox";
import useDebounce from "../hooks/useDebounce";
import SearchBar from "../components/Search/SearchBar";
import MovieList from "../components/Movie/MovieList";

const MotionBox = motion(Box);

export const Home: React.FC = () => {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const bgGradient = useColorModeValue(
    "linear(to-br, purple.400, pink.200)",
    "linear(to-br, purple.900, pink.700)"
  );
  const textColor = useColorModeValue("gray.800", "white");

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length > 2) {
      setIsLoading(true);
      try {
        const results = await searchMovies(searchQuery);
        setMovies(results);
        if (results.length === 0) {
          toast({
            title: "Sin resultados",
            description: "No se encontraron películas que coincidan con tu búsqueda.",
            status: "info",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        console.error("Error searching movies:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error al buscar películas. Por favor, intenta de nuevo más tarde.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    } else {
      setMovies([]);
    }
  }, [toast]);

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return (
    <Box
      minHeight="100vh"
      bgGradient={bgGradient}
      backgroundAttachment="fixed"
      py={12}
    >
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <MotionBox
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassmorphicBox p={8} borderRadius="xl">
              <Heading
                as="h1"
                size="2xl"
                textAlign="center"
                bgGradient="linear(to-r, purple.400, pink.400)"
                bgClip="text"
                mb={4}
              >
                Chillflix
              </Heading>
              <Text fontSize="xl" textAlign="center" color={textColor}>
                Descubre y disfruta de las mejores películas en streaming
              </Text>
            </GlassmorphicBox>
          </MotionBox>
          
          <MotionBox
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassmorphicBox p={6} borderRadius="xl">
              <SearchBar
                query={query}
                onQueryChange={setQuery}
                onSearch={() => handleSearch(query)}
                isLoading={isLoading}
              />
            </GlassmorphicBox>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <MovieList movies={movies} />
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
};

export default Home;