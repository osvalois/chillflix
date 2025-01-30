
import React, { Suspense, useState, useEffect, useMemo } from 'react';
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
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Calendar, Info, Video } from 'lucide-react';
import { ErrorBoundary } from 'react-error-boundary';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import { useQuery } from 'react-query';

// Components


// Services
import ProgramGuide, { ScheduledMovie } from '../components/ProgramGuide';
import { MovieStorageService } from '../services/movieStorageService';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorFallback from '../components/UI/ErrorFallback';

// Custom hook for managing channel state
const useChannelState = () => {
  const [currentMovie, setCurrentMovie] = useState<ScheduledMovie | null>(null);
  const [progress, setProgress] = useState(0);
  const [schedule, setSchedule] = useState<ScheduledMovie[]>([]);
  const toast = useToast();

  // Query stored movies
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
    }
  );

  // Generate schedule
  useEffect(() => {
    if (movies) {
      const now = new Date();
      let currentTime = new Date(now.setMinutes(0, 0, 0));
      
      const newSchedule = movies.map((movie) => {
        const duration = 7200; // 2 hours default
        const startTime = new Date(currentTime);
        const endTime = new Date(currentTime.getTime() + duration * 1000);
        
        currentTime = endTime;
        
        return {
          ...movie,
          startTime,
          endTime,
          duration,
        } as ScheduledMovie;
      });

      setSchedule(newSchedule);
    }
  }, [movies]);

  // Update current movie and progress
  useEffect(() => {
    if (schedule.length === 0) return;

    const updateCurrentMovie = () => {
      const now = new Date();
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
  }, [schedule]);

  return {
    currentMovie,
    progress,
    schedule,
    isLoading,
    error,
  };
};

// Now Playing Info Component
const NowPlayingInfo: React.FC<{
  currentMovie: ScheduledMovie;
  progress: number;
}> = ({ currentMovie, progress }) => {
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
              </Flex>
              <Button
                size="sm"
                leftIcon={<Info size={16} />}
                variant="ghost"
                onClick={onToggle}
              >
                {isOpen ? 'Hide Info' : 'Show Info'}
              </Button>
            </Flex>
            
            <Heading size="md">{currentMovie.title}</Heading>
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
    error
  } = useChannelState();
  
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Generate stream URL
  const streamUrl = useMemo(() => {
    if (!currentMovie) return null;
    try {
      return `https://p2media.fly.dev/stream/${currentMovie.torrent_hash}/${currentMovie.resource_index}`;
    } catch (error) {
      console.error('Error generating stream URL:', error);
      return null;
    }
  }, [currentMovie]);

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorFallback error={error} resetErrorBoundary={function (): void {
      throw new Error('Function not implemented.');
  } } />;

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
                      src={streamUrl}
                      style={{ width: '100%', height: '100%' }}
                      autoPlay
                      controls
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
                  />
                )}
              </Box>

              {/* Program Guide */}
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
                  
                  <Suspense fallback={<LoadingSkeleton />}>
                    <ProgramGuide
                      schedule={schedule}
                      currentMovie={currentMovie}
                    />
                  </Suspense>
                </Box>
              )}
            </Flex>
          </Container>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

// Page Wrapper
const LiveChannelPage: React.FC = () => {
  return (
    <HelmetProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Helmet>
          <title>Live Channel - ChillFlix</title>
        </Helmet>
        <LiveChannelContent />
      </ErrorBoundary>
    </HelmetProvider>
  );
};

export default LiveChannelPage;