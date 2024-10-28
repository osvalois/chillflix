import React, { useEffect, useMemo } from 'react';
import { 
  Box, 
  Flex, 
  Container, 
  useColorModeValue, 
  useDisclosure, 
  ScaleFade, 
  keyframes
} from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorBoundary from '../ErrorHandling/ErrorBoundary';

// Definición de tipos
interface LayoutProps {
  children: React.ReactNode;
  isLoading?: boolean;
  error?: Error | null;
}

interface GlassmorphicBoxProps {
  children: React.ReactNode;
  [key: string]: any;
}

// Componentes de Motion
const MotionBox = motion(Box as any);

// Animaciones
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Componente Glassmorphic optimizado
const GlassmorphicBox: React.FC<GlassmorphicBoxProps> = React.memo(({ children, ...props }) => {
  const glassColor = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.1)');
  const borderColor = useColorModeValue('rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)');

  return (
    <Box
      borderRadius="2xl"
      boxShadow="0 8px 32px 0 rgba(31, 38, 135, 0.37)"
      backdropFilter="blur(10px)"
      border="1px solid"
      borderColor={borderColor}
      bg={glassColor}
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
    >
      {children}
    </Box>
  );
});

GlassmorphicBox.displayName = 'GlassmorphicBox';

// Componente principal
const Layout: React.FC<LayoutProps> = ({ children, isLoading = false, error = null }) => {
  const { isOpen, onOpen } = useDisclosure({ defaultIsOpen: false });
  const controls = useAnimation();
  
  // Memoización de valores de color
  const bgGradient = useColorModeValue(
    'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 25%, #ffecd2 50%, #fcb69f 75%, #ff9a9e 100%)',
    'linear-gradient(45deg, #434343 0%, #000000 25%, #434343 50%, #000000 75%, #434343 100%)'
  );
  const textColor = useColorModeValue('gray.800', 'gray.100');

  // Animación inicial
  useEffect(() => {
    const initializeAnimation = async () => {
      await controls.start({ opacity: 1, y: 0 });
      onOpen();
    };

    initializeAnimation();
  }, [controls, onOpen]);

  // Contenido memorizado
  const memoizedContent = useMemo(() => {
    if (isLoading) return <LoadingSpinner />;
    if (error) {
      return (
        <Box textAlign="center" color="red.500" fontWeight="bold">
          Error: {error.message}
        </Box>
      );
    }
    return <Box position="relative" zIndex={1}>{children}</Box>;
  }, [isLoading, error, children]);

  return (
    <ErrorBoundary>
      <Flex
        direction="column"
        minHeight="100vh"
        bgGradient={bgGradient}
        backgroundSize="400% 400%"
        sx={{
          animation: `${gradientAnimation} 15s ease infinite`,
        }}
        color={textColor}
        transition="all 0.3s ease"
      >
        <Header />
        
        <MotionBox
          as="main"
          flex="1"
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          transition={{ 
            duration: 0.5,
            ease: "easeOut"
          }}
          pt={{ base: "16", sm: "20", md: "24", lg: "32" }}
          pb={{ base: "12", sm: "14", md: "16", lg: "20" }}
          px={{ base: "4", sm: "6", md: "8", lg: "10" }}
        >
          <Container 
            maxW="container.xl"
            px={{ base: "2", sm: "4", md: "6" }}
          >
            <ScaleFade 
              in={isOpen} 
              initialScale={0.9}
              transition={{ enter: { duration: 0.3 } }}
            >
              <GlassmorphicBox
                p={{ base: "4", sm: "6", md: "8" }}
                mt={{ base: "4", sm: "6", md: "8" }}
              >
                {memoizedContent}
              </GlassmorphicBox>
            </ScaleFade>
          </Container>
        </MotionBox>

        <Footer />
      </Flex>
    </ErrorBoundary>
  );
};

export default React.memo(Layout);