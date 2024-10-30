import React, { useEffect, useMemo } from 'react';
import { Box, Flex, useColorModeValue, useDisclosure, ScaleFade, keyframes } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import Header from './Header';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorBoundary from '../ErrorHandling/ErrorBoundary';

const MotionBox = motion(Box as any);

const GlassmorphicBox = React.forwardRef<HTMLDivElement, any>((props, ref) => (
  <Box
    ref={ref}
    borderRadius={{ base: 'lg', md: 'xl' }}
    boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
    backdropFilter="blur(10px)"
    border="1px solid"
    position="relative"
    overflow="hidden"
    _before={{
      content: '""',
      position: 'absolute',
      top: '-50%',
      left: '-50%',
      right: '-50%',
      bottom: '-50%',
      background: 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)',
      transform: 'rotate(45deg)',
      zIndex: -1,
    }}
    {...props}
  />
));

GlassmorphicBox.displayName = 'GlassmorphicBox';

const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

interface LayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
  error?: Error | null;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  isLoading = false, 
  error = null,
}) => {
  const bgGradient = useColorModeValue(
    'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 25%, #ffecd2 50%, #fcb69f 75%, #ff9a9e 100%)',
    'linear-gradient(45deg, #434343 0%, #000000 25%, #434343 50%, #000000 75%, #434343 100%)'
  );
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const glassColor = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.1)');
  const borderColor = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');
  const { isOpen, onOpen } = useDisclosure();
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
    onOpen();
  }, [controls, onOpen]);

  const memoizedContent = useMemo(() => (
    isLoading ? (
      <LoadingSpinner />
    ) : error ? (
      <Box textAlign="center" color="red.500" fontWeight="bold">
        Error: {error.message}
      </Box>
    ) : (
      <Box position="relative" zIndex={1}>
        {children}
      </Box>
    )
  ), [isLoading, error, children]);

  return (
    <ErrorBoundary>
      <Flex
        direction="column"
        minHeight="100vh"
        bgGradient={bgGradient}
        backgroundSize="400% 400%"
        animation={`${gradientAnimation} 15s ease infinite`}
        color={textColor}
        transition="all 0.3s ease"
      >
        <Header />
        <MotionBox
          as="main"
          flex={1}
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ duration: 0.5 }}
          pt={{ base: "16", md: "20" }}
          pb={{ base: "12", md: "16" }}
          width="100%"
        >
          <Box 
            width="100%" 
            maxW="1400px" 
            mx="auto"
            px={{ base: '1', sm: '2', md: '3' }}
          >
            <ScaleFade in={isOpen} initialScale={0.95}>
              <GlassmorphicBox
                bg={glassColor}
                borderColor={borderColor}
                p={{ base: 2, sm: 3 }}
                mx={{ base: 0, sm: '1' }}
                borderRadius={{ base: 'md', md: 'lg' }}
              >
                {memoizedContent}
              </GlassmorphicBox>
            </ScaleFade>
          </Box>
        </MotionBox>
      </Flex>
    </ErrorBoundary>
  );
};

export default Layout;