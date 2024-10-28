import React from 'react';
import { Box, Container, VStack, Flex, keyframes } from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box as any);
const MotionFlex = motion(Flex as any);

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

const glassStyle = {
  background: "rgba(255, 255, 255, 0.03)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: 
    "0 4px 30px rgba(0, 0, 0, 0.1), " +
    "inset 0 0 20px rgba(255, 255, 255, 0.05), " +
    "0 0 0 1px rgba(255, 255, 255, 0.1)",
  overflow: "hidden",
  position: "relative" as "relative",
};

const lightEffect = {
  content: '""',
  position: "absolute" as "absolute",
  top: "-50%",
  left: "-50%",
  width: "200%",
  height: "200%",
  background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
  opacity: 0.5,
};

const skeletonBaseStyle = {
  background: "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)",
  backgroundSize: "1000px 100%",
  animation: `${shimmer} 2s infinite linear`,
};

const LoadingSkeleton: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Video Player Skeleton */}
        <MotionBox
          {...glassStyle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={lightEffect} />
          <Box height="400px" {...skeletonBaseStyle} borderRadius="10px" />
        </MotionBox>

        {/* Movie Details Skeleton */}
        <MotionBox
          {...glassStyle}
          p={6}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box sx={lightEffect} />
          <MotionFlex 
            justify="space-between" 
            align="center" 
            mb={6}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Box width="60%" height="40px" {...skeletonBaseStyle} borderRadius="md" />
            <Box width="100px" height="40px" {...skeletonBaseStyle} borderRadius="md" />
          </MotionFlex>
          <MotionFlex 
            wrap="wrap" 
            gap={4}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Box width="100px" height="24px" {...skeletonBaseStyle} borderRadius="md" />
            <Box width="120px" height="24px" {...skeletonBaseStyle} borderRadius="md" />
            <Box width="80px" height="24px" {...skeletonBaseStyle} borderRadius="md" />
          </MotionFlex>
        </MotionBox>

        {/* File List Skeleton */}
        <MotionBox
          {...glassStyle}
          p={6}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Box sx={lightEffect} />
          <Box width="150px" height="30px" mb={6} {...skeletonBaseStyle} borderRadius="md" />
          <VStack align="stretch" spacing={4}>
            {[...Array(5)].map((_, index) => (
              <MotionBox
                key={index}
                height="20px"
                {...skeletonBaseStyle}
                borderRadius="md"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 * index }}
              />
            ))}
          </VStack>
        </MotionBox>
      </VStack>
    </Container>
  );
};

export default LoadingSkeleton;