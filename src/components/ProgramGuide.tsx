import React from 'react';
import {
  VStack,
  Box,
  Flex,
  Text,
  Icon,
  Progress,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { Film, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export interface ScheduledMovie {
  id: string;
  tmdb_id: number;
  title: string;
  classification: string;
  torrent_hash: string;
  resource_index: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  poster_path?: string;
}

interface ProgramGuideProps {
  schedule: ScheduledMovie[];
  currentMovie: ScheduledMovie | null;
  onMovieClick?: (movie: ScheduledMovie) => void;
}

const ProgramGuide: React.FC<ProgramGuideProps> = ({
  schedule,
  currentMovie,
  onMovieClick
}) => {
  const bgColor = useColorModeValue('gray.100', 'gray.700');
  const activeBgColor = useColorModeValue('blue.100', 'blue.900');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const getStatusBadge = (movie: ScheduledMovie) => {
    const now = new Date();
    if (currentMovie?.id === movie.id) {
      return (
        <Badge colorScheme="red" variant="solid">
          Live Now
        </Badge>
      );
    } else if (movie.startTime > now) {
      return (
        <Badge colorScheme="gray">
          Coming Up
        </Badge>
      );
    } else {
      return (
        <Badge colorScheme="gray" variant="outline">
          Ended
        </Badge>
      );
    }
  };

  return (
    <VStack spacing={4} align="stretch" w="100%">
      {schedule.map((movie) => (
        <MotionBox
          key={movie.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onMovieClick?.(movie)}
          cursor="pointer"
        >
          <Box
            bg={currentMovie?.id === movie.id ? activeBgColor : bgColor}
            p={4}
            borderRadius="lg"
            border="1px solid"
            borderColor={borderColor}
            transition="all 0.2s"
            position="relative"
            overflow="hidden"
          >
            <Flex justify="space-between" align="center" mb={2}>
              <Flex align="center" gap={2}>
                <Icon as={Clock} size={16} />
                <Text fontWeight="bold">
                  {format(movie.startTime, 'HH:mm')}
                </Text>
                <Text color="gray.500">-</Text>
                <Text>{format(movie.endTime, 'HH:mm')}</Text>
              </Flex>
              {getStatusBadge(movie)}
            </Flex>

            <Flex align="center" gap={3} mb={2}>
              <Icon as={Film} size={20} />
              <Text fontSize="lg" fontWeight="semibold">
                {movie.title}
              </Text>
            </Flex>

            {currentMovie?.id === movie.id && (
              <Box mt={2}>
                <Text fontSize="sm" mb={1}>
                  Progress
                </Text>
                <Progress
                  value={(new Date().getTime() - movie.startTime.getTime()) /
                    (movie.duration * 1000) * 100}
                  size="sm"
                  colorScheme="red"
                  borderRadius="full"
                  hasStripe
                  isAnimated
                />
              </Box>
            )}
          </Box>
        </MotionBox>
      ))}
    </VStack>
  );
};

export default React.memo(ProgramGuide);