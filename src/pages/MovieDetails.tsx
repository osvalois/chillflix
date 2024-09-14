// src/pages/MovieDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Spinner,
  AspectRatio,
} from '@chakra-ui/react';
import { getMovieInfo, getStreamUrl, extractInfoHash, MovieInfo } from '../services/movieService';

const MovieDetails: React.FC = () => {
  const { magnetUri } = useParams<{ magnetUri: string }>();
  const [movieInfo, setMovieInfo] = useState<MovieInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMovieInfo = async () => {
      if (!magnetUri) return;

      try {
        const infoHash = extractInfoHash(decodeURIComponent(magnetUri));
        const info = await getMovieInfo(infoHash);
        setMovieInfo(info);
      } catch (err) {
        console.error('Error fetching movie info:', err);
        setError('Error al cargar la información de la película. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovieInfo();
  }, [magnetUri]);

  if (isLoading) {
    return (
      <Container centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (error || !movieInfo) {
    return (
      <Container centerContent>
        <Text color="red.500">{error || 'No se pudo cargar la información de la película.'}</Text>
      </Container>
    );
  }

  const streamUrl = getStreamUrl(movieInfo.InfoHash);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="2xl">{movieInfo.Name}</Heading>
        <AspectRatio ratio={16 / 9}>
          <Box
            as="video"
            src={streamUrl}
            controls
            width="100%"
            height="auto"
            borderRadius="md"
            boxShadow="lg"
          />
        </AspectRatio>
        <Box>
          <Heading as="h2" size="lg" mb={4}>Archivos</Heading>
          {movieInfo.Files.map((file, index) => (
            <Text key={index}>
              {file.Path} - {(file.Size / 1024 / 1024).toFixed(2)} MB
            </Text>
          ))}
        </Box>
      </VStack>
    </Container>
  );
};

export default MovieDetails;