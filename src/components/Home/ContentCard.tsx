import React from 'react';
import { Box, Text, Flex, Icon, AspectRatio, Badge, Skeleton, VStack, keyframes } from '@chakra-ui/react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { FaStar, FaInfoCircle, FaCalendar, FaUsers } from 'react-icons/fa';
import { FiPlay } from 'react-icons/fi';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useNavigate } from 'react-router-dom';
import 'react-lazy-load-image-component/src/effects/blur.css';
import GlassmorphicBox from '../UI/GlassmorphicBox';
import { GlassPrimaryButton } from '../UI/GlassPrimaryButton';
import { GlassSecondaryButton } from '../UI/GlassSecondaryButton';
import { ContentCardProps } from '../../types';

const MotionBox = motion(Box as any);
const MotionFlex = motion(Flex as any);

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const skeletonBaseStyle = {
  background: "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)",
  backgroundSize: "1000px 100%",
  animation: `${shimmer} 2s infinite linear`,
};

const ContentCard: React.FC<ContentCardProps> = ({ content, isLoading = false }) => {
  const navigate = useNavigate();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  let movieType = content.media_type ?? content.type;
  const getContentLink = () => {
    return `/${content.media_type ?? content.type}/${content.id}`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent card click if the click was on a button
    if ((e.target as HTMLElement).closest('button')) return;
    navigate(getContentLink());
  };

  if (isLoading) {
    return (
      <GlassmorphicBox
        height="700px"
        width="100%"
        borderRadius="30px"
        overflow="hidden"
        position="relative"
      >
        <VStack spacing={4} align="stretch" p={8}>
          <Skeleton height="400px" {...skeletonBaseStyle} borderRadius="20px" />
          <Skeleton height="40px" width="60%" {...skeletonBaseStyle} borderRadius="full" />
          <Skeleton height="20px" width="40%" {...skeletonBaseStyle} borderRadius="full" />
          <Skeleton height="100px" {...skeletonBaseStyle} borderRadius="10px" />
          <Flex justify="space-between">
            <Skeleton height="50px" width="48%" {...skeletonBaseStyle} borderRadius="full" />
            <Skeleton height="50px" width="48%" {...skeletonBaseStyle} borderRadius="full" />
          </Flex>
        </VStack>
      </GlassmorphicBox>
    );
  }

  return (
    <GlassmorphicBox
      as={motion.div}
      height="700px"
      width="100%"
      borderRadius="30px"
      overflow="hidden"
      position="relative"
      cursor="pointer"
      onClick={handleCardClick}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }}
      whileHover={{ scale: 1.02 }}
    >
      <AspectRatio ratio={16 / 9} width="100%" height="60%">
        <LazyLoadImage
          src={`https://image.tmdb.org/t/p/original${content.backdrop_path || content.poster_path}`}
          alt={content.title || content.name}
          effect="blur"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </AspectRatio>

      <MotionFlex
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        flexDirection="column"
        justify="flex-end"
        p={8}
        bgGradient="linear(to-t, rgba(0,0,0,0.9), rgba(0,0,0,0.3))"
      >
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Badge
            colorScheme={ movieType.toLowerCase() === 'movie' ? "purple" : "teal"}
            variant="solid"
            fontSize="md"
            px={4}
            py={2}
            borderRadius="full"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
          >
            {movieType.toLowerCase() === 'movie' ? 'Movie' : 'TV Series'}
          </Badge>
          <Flex
            align="center"
            bg="rgba(255, 255, 255, 0.2)"
            borderRadius="full"
            px={4}
            py={2}
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
          >
            <Icon as={FaStar} color="yellow.400" mr={2} />
            <Text fontSize="xl" color="white" fontWeight="bold">
              {content.vote_average ? content.vote_average.toFixed(1) : 'N/A'}
            </Text>
          </Flex>
        </Flex>

        <MotionBox
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Text
            fontSize="4xl"
            fontWeight="bold"
            color="white"
            mb={2}
            textShadow="2px 2px 4px rgba(0,0,0,0.3)"
          >
            {content.title || content.name}
          </Text>
        </MotionBox>

        <Flex alignItems="center" mb={4}>
          <Icon as={FaCalendar} color="gray.300" mr={2} />
          <Text fontSize="lg" color="gray.300">
            {new Date(content.release_date || content.first_air_date).getFullYear()}
          </Text>
          <Box mx={4} borderLeft="1px solid" borderColor="gray.500" height="20px" />
          <Icon as={FaUsers} color="gray.300" mr={2} />
          <Text fontSize="lg" color="gray.300">
            {content.popularity ? Math.round(content.popularity).toLocaleString() : 'N/A'} views
          </Text>
        </Flex>

        <MotionBox
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Text color="gray.100" fontSize="lg" mb={6} lineHeight="1.6" noOfLines={3}>
            {content.overview}
          </Text>
        </MotionBox>

        <Flex justifyContent="space-between">
          <GlassPrimaryButton
            icon={<FiPlay />}
            onClick={(e) => {
              e.stopPropagation();
              navigate(getContentLink());
            }}
          >
            Play
          </GlassPrimaryButton>
          <GlassSecondaryButton
            icon={<FaInfoCircle />}
            onClick={(e: { stopPropagation: () => void; }) => {
              e.stopPropagation();
              navigate(getContentLink());
            }}
            width="48%"
          >
            More Info
          </GlassSecondaryButton>
        </Flex>
      </MotionFlex>

      <AnimatePresence>
        <MotionBox
          key="hover-overlay"
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      </AnimatePresence>
    </GlassmorphicBox>
  );
};

export default ContentCard;