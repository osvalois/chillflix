import React, { useState } from 'react';
import { Box, Text, Flex, Icon, AspectRatio, Badge, Button, Skeleton, VStack, keyframes } from '@chakra-ui/react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { FaStar, FaPlay, FaInfoCircle, FaCalendar, FaUsers } from 'react-icons/fa';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useNavigate } from 'react-router-dom';
import 'react-lazy-load-image-component/src/effects/blur.css';
import GlassmorphicBox from '../UI/GlassmorphicBox';
import { GlassPrimaryButton } from '../UI/GlassPrimaryButton';
import { GlassSecondaryButton } from '../UI/GlassSecondaryButton';
import { FiPlay } from 'react-icons/fi';

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

const ContentCard = ({ content, isLoading = false }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);


  const rotateX = useTransform(mouseY, [0, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [0, 300], [-5, 5]);

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
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02 }}
      style={{ rotateX, rotateY }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
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
            colorScheme={content.media_type === 'movie' ? "purple" : "teal"}
            variant="solid"
            fontSize="md"
            px={4}
            py={2}
            borderRadius="full"
            boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
          >
            {content.media_type === 'movie' ? 'Movie' : 'TV Series'}
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
  lottieAnimation="public/play.json"
  onClick={() => navigate(`/stream/${content.id}`)}
>
  Play
</GlassPrimaryButton>
          <GlassSecondaryButton
            icon={<FaInfoCircle />}
            onClick={() =>  navigate(`/movie/${content.id}`)}
            width="48%"
          >
            More Info
          </GlassSecondaryButton>
        </Flex>
      </MotionFlex>

      <AnimatePresence>
        {isHovered && (
          <MotionBox
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>
    </GlassmorphicBox>
  );
};

export default ContentCard;