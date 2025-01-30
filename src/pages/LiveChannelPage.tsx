import React, { Suspense, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Box,
  Container,
  VStack,
  Text,
  Flex,
  Heading,
  useBreakpointValue,
  Slide,
  useDisclosure,
  Icon,
  Button,
  useToast,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Badge,
  Tooltip,
  keyframes,
  Skeleton,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Calendar, Info, Video, Menu, Clock, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { MovieStorageService } from '../services/movieStorageService';

// Types
interface ScheduledMovie {
  id: string;
  title: string;
  description: string;
  duration: number;
  startTime: Date;
  endTime: Date;
  torrent_hash: string;
  resource_index: number;
  thumbnail?: string;
  genre?: string;
  year?: number;
}

// Custom hooks
const useChannelState = () => {
  const [currentMovie, setCurrentMovie] = useState<ScheduledMovie | null>(null);
  const [selectedMovie, setSelectedMovie] = useState<ScheduledMovie | null>(null);
  const [progress, setProgress] = useState(0);
  const [schedule, setSchedule] = useState<ScheduledMovie[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const toast = useToast();

  const { data: movies, isLoading, error } = useQuery(
    'storedMovies',
    async () => {
      const service = MovieStorageService.getInstance();
      return service.getAllMovies();
    },
    {
      onError: () => {
        toast({
          title: 'Error loading movies',
          description: 'Could not load the channel content',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    }
  );

  // Generate schedule with improved time slots
  useEffect(() => {
    if (movies) {
      const now = new Date();
      let currentTime = new Date(now.setMinutes(0, 0, 0));
      
      const newSchedule = movies.map((movie) => {
        const duration = movie.movieDuration || 7200;
        const startTime = new Date(currentTime);
        const endTime = new Date(currentTime.getTime() + duration * 1000);
        
        currentTime = endTime;
        
        return {
            ...movie,
            startTime,
            endTime,
            duration,
        } as unknown as ScheduledMovie;
      });

      setSchedule(newSchedule);
    }
  }, [movies]);

  // Enhanced movie update logic
  useEffect(() => {
    if (schedule.length === 0) return;

    const updateCurrentMovie = () => {
      const now = new Date();
      if (selectedMovie) {
        setCurrentMovie(selectedMovie);
        const elapsed = now.getTime() - selectedMovie.startTime.getTime();
        const progress = (elapsed / (selectedMovie.duration * 1000)) * 100;
        setProgress(Math.min(progress, 100));
        return;
      }

      const current = schedule.find(
        movie => now >= movie.startTime && now < movie.endTime
      );
      
      if (current) {
        setCurrentMovie(current);
        const elapsed = now.getTime() - current.startTime.getTime();
        const progress = (elapsed / (current.duration * 1000)) * 100;
        setProgress(Math.min(progress, 100));
      }
    };

    const interval = setInterval(updateCurrentMovie, 1000);
    updateCurrentMovie();

    return () => clearInterval(interval);
  }, [schedule, selectedMovie]);

  const handleMovieSelect = useCallback((movie: ScheduledMovie) => {
    setSelectedMovie(movie);
    setProgress(0);
    toast({
      title: 'Switching Movie',
      description: `Now playing: ${movie.title}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right',
    });
  }, [toast]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const skipToNext = useCallback(() => {
    if (!currentMovie || schedule.length === 0) return;
    
    const currentIndex = schedule.findIndex(movie => movie.id === currentMovie.id);
    const nextMovie = schedule[(currentIndex + 1) % schedule.length];
    
    if (nextMovie) {
      handleMovieSelect(nextMovie);
    }
  }, [currentMovie, schedule, handleMovieSelect]);

  return {
    currentMovie,
    progress,
    schedule,
    isLoading,
    error,
    handleMovieSelect,
    selectedMovie,
    isMuted,
    toggleMute,
    skipToNext,
  };
};

// Components
const MovieCard: React.FC<{
  movie: ScheduledMovie;
  isCurrentMovie: boolean;
  isSelected: boolean;
  onClick: () => void;
}> = ({ movie, isCurrentMovie, isSelected, onClick }) => {
  const pulseAnimation = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  `;

  return (
    <Box
      p={4}
      bg={isSelected ? 'red.900' : isCurrentMovie ? 'gray.700' : 'gray.800'}
      borderRadius="md"
      cursor="pointer"
      onClick={onClick}
      _hover={{ bg: 'red.800', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      position="relative"
      animation={isCurrentMovie ? `${pulseAnimation} 2s infinite` : undefined}
    >
      <Flex justify="space-between" align="start" mb={2}>
        <Heading size="sm" noOfLines={2}>
          {movie.title}
        </Heading>
        {isCurrentMovie && (
          <Badge colorScheme="red" variant="solid">
            Live
          </Badge>
        )}
      </Flex>
      
      <Text fontSize="sm" color="gray.400" mb={2} noOfLines={2}>
        {movie.description}
      </Text>
      
      <Flex justify="space-between" align="center">
        <Text fontSize="xs" color="gray.500">
          {movie.startTime.toLocaleTimeString()} - {movie.endTime.toLocaleTimeString()}
        </Text>
        {movie.genre && (
          <Badge variant="outline" colorScheme="blue">
            {movie.genre}
          </Badge>
        )}
      </Flex>
    </Box>
  );
};

const NowPlayingInfo: React.FC<{
  currentMovie: ScheduledMovie;
  progress: number;
  onSkipNext: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
}> = ({ currentMovie, progress, onSkipNext, onToggleMute, isMuted }) => {
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: true });

  return (
    <Slide direction="bottom" in={isOpen} style={{ zIndex: 10 }}>
      <Box
        position="absolute"
        bottom="0"
        width="100%"
        bg="rgba(0, 0, 0, 0.8)"
        backdropFilter="blur(10px)"
        p={4}
        borderTop="1px solid"
        borderColor="whiteAlpha.200"
      >
        <Container maxW="container.xl">
          <VStack align="stretch" spacing={2}>
            <Flex justify="space-between" align="center">
              <Flex align="center" gap={2}>
                <Icon as={Play} color="red.500" />
                <Text fontWeight="bold">NOW PLAYING</Text>
                {currentMovie.genre && (
                  <Badge colorScheme="blue" ml={2}>
                    {currentMovie.genre}
                  </Badge>
                )}
              </Flex>
              <Flex gap={2}>
                <Tooltip label={isMuted ? 'Unmute' : 'Mute'}>
                  <IconButton
                    aria-label="Toggle mute"
                    icon={<Icon as={isMuted ? VolumeX : Volume2} />}
                    variant="ghost"
                    size="sm"
                    onClick={onToggleMute}
                  />
                </Tooltip>
                <Tooltip label="Skip to next">
                  <IconButton
                    aria-label="Skip to next"
                    icon={<Icon as={SkipForward} />}
                    variant="ghost"
                    size="sm"
                    onClick={onSkipNext}
                  />
                </Tooltip>
                <Button
                  size="sm"
                  leftIcon={<Info size={16} />}
                  variant="ghost"
                  onClick={onToggle}
                >
                  {isOpen ? 'Hide Info' : 'Show Info'}
                </Button>
              </Flex>
            </Flex>
            
            <Flex direction="column" gap={1}>
              <Heading size="md">{currentMovie.title}</Heading>
              {currentMovie.year && (
                <Text fontSize="sm" color="gray.400">
                  {currentMovie.year}
                </Text>
              )}
            </Flex>
            
            <Box
              w="100%"
              h="2px"
              bg="whiteAlpha.200"
              overflow="hidden"
              borderRadius="full"
            >
              <Box
                h="100%"
                w={`${progress}%`}
                bg="red.500"
                transition="width 1s linear"
              />
            </Box>
          </VStack>
        </Container>
      </Box>
    </Slide>
  );
};

// Main Component
const LiveChannelContent: React.FC = () => {
  const {
    currentMovie,
    progress,
    schedule,
    isLoading,
    error,
    handleMovieSelect,
    selectedMovie,
    isMuted,
    toggleMute,
    skipToNext,
  } = useChannelState();
  
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen, onOpen, onClose } = useDisclosure();

  const streamUrl = useMemo(() => {
    if (!currentMovie) return null;
    try {
      return `https://p2media.fly.dev/stream/${currentMovie.torrent_hash}/${currentMovie.resource_index}`;
    } catch (error) {
      console.error('Error generating stream URL:', error);
      return null;
    }
  }, [currentMovie]);

  if (isLoading) {
    return (
      <Box p={8}>
        <VStack spacing={4} align="stretch">
          <Skeleton height="40px" width="200px" />
          <Skeleton height="400px" />
          <Skeleton height="20px" />
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Flex
        direction="column"
        align="center"
        justify="center"
        h="100vh"
        p={8}
        textAlign="center"
      >
        <Icon as={Video} size={48} color="red.500" mb={4} />
        <Heading size="lg" mb={2}>Unable to Load Content</Heading>
        <Text color="gray.400">
          We're having trouble loading the channel content. Please try again later.
        </Text>
        <Button
          mt={4}
          onClick={() => window.location.reload()}
          colorScheme="red"
        >
          Refresh Page
        </Button>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg="gray.900" color="white">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Container maxW="container.xl" p={0}>
            <Flex direction={{ base: 'column', lg: 'row' }} h="100vh">
              {/* Main Playback Area */}
              <Box flex="1" position="relative" bg="black">
                <Suspense fallback={<LoadingSkeleton />}>
                  {streamUrl ? (
                    <video
                      key={currentMovie?.id}
                      src={streamUrl}
                      style={{ width: '100%', height: '100%' }}
                      autoPlay
                      controls
                      muted={isMuted}
                    />
                  ) : (
                    <Flex
                      h="100%"
                      align="center"
                      justify="center"
                      direction="column"
                      gap={4}
                    >
                      <Icon as={Video} size={48} />
                      <Text>No content available</Text>
                    </Flex>
                  )}
                </Suspense>
                
                {currentMovie && (
                  <NowPlayingInfo
                    currentMovie={currentMovie}
                    progress={progress}
                    onSkipNext={skipToNext}
                    onToggleMute={toggleMute}
                    isMuted={isMuted}
                  />
                )}
              </Box>

              {/* Mobile Menu Button */}
              {isMobile && (
                <IconButton
                  aria-label="Open program guide"
                  icon={<Icon as={Menu} />}
                  position="fixed"
                  top={4}
                  right={4}
                  onClick={onOpen}
                  colorScheme="red"
                  zIndex={20}
                />
              )}

              {/* Program Guide - Desktop */}
              {!isMobile && (
                <Box
                  w="400px"
                  bg="gray.800"
                  p={6}
                  overflowY="auto"
                  borderLeft="1px solid"
                  borderColor="gray.700"
                >
                  <Flex align="center" gap={2} mb={6}>
                    <Icon as={Calendar} />
                    <Heading size="md">Program Guide</Heading>
                  </Flex>
                  
                  <VStack spacing={4} align="stretch">
                    {schedule.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        isCurrentMovie={currentMovie?.id === movie.id}
                        isSelected={selectedMovie?.id === movie.id}
                        onClick={() => handleMovieSelect(movie)}
                      />
                    ))}
                  </VStack>
                </Box>
              )}

              {/* Program Guide - Mobile Drawer */}
              {isMobile && (
                <Drawer
                  isOpen={isOpen}
                  placement="right"
                  onClose={onClose}
                  size="full"
                >
                  <DrawerOverlay />
                  <DrawerContent bg="gray.800">
                    <DrawerCloseButton />
                    <DrawerHeader>
                      <Flex align="center" gap={2}>
                        <Icon as={Calendar} />
                        <Text>Program Guide</Text>
                      </Flex>
                    </DrawerHeader>

                    <DrawerBody>
                      <VStack spacing={4} align="stretch">
                        {schedule.map((movie) => (
                          <MovieCard
                            key={movie.id}
                            movie={movie}
                            isCurrentMovie={currentMovie?.id === movie.id}
                            isSelected={selectedMovie?.id === movie.id}
                            onClick={() => {
                              handleMovieSelect(movie);
                              onClose();
                            }}
                          />
                        ))}
                      </VStack>
                    </DrawerBody>
                  </DrawerContent>
                </Drawer>
              )}
            </Flex>
          </Container>
        </motion.div>
      </AnimatePresence>

      {/* Time indicator */}
      <Box
        position="fixed"
        top={4}
        left={4}
        bg="rgba(0, 0, 0, 0.8)"
        backdropFilter="blur(10px)"
        borderRadius="md"
        p={2}
        zIndex={20}
      >
        <Flex align="center" gap={2}>
          <Icon as={Clock} size={16} />
          <Text fontSize="sm" fontWeight="medium">
            {new Date().toLocaleTimeString()}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
};

// Page Wrapper
const LiveChannelPage: React.FC = () => {
  return (
    <HelmetProvider>
      <ErrorBoundary
        FallbackComponent={({ error }) => (
          <Flex
            direction="column"
            align="center"
            justify="center"
            h="100vh"
            p={8}
            bg="gray.900"
            color="white"
          >
            <Icon as={Video} size={48} color="red.500" mb={4} />
            <Heading size="lg" mb={2}>Something went wrong</Heading>
            <Text color="gray.400" textAlign="center" maxW="600px">
              We encountered an error while loading the channel.
              Please try refreshing the page or come back later.
            </Text>
            <Text color="gray.500" fontSize="sm" mt={4} maxW="600px" textAlign="center">
              Error details: {error.message}
            </Text>
            <Button
              mt={4}
              onClick={() => window.location.reload()}
              colorScheme="red"
            >
              Refresh Page
            </Button>
          </Flex>
        )}
      >
        <Helmet>
          <title>Live Channel - ChillFlix</title>
          <meta name="description" content="Watch movies live on ChillFlix" />
        </Helmet>
        <LiveChannelContent />
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default LiveChannelPage;