import React from 'react';
import { Box, Flex, Container, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Header from './Header';
import Footer from './Footer';
import GlassmorphicBox from '../UI/GlassmorphicBox';
const MotionBox = motion(Box);

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const bgGradient = useColorModeValue(
    'linear(to-br, purple.50, pink.50)',
    'linear(to-br, gray.900, purple.900)'
  );
  const textColor = useColorModeValue('gray.800', 'gray.100');

  return (
    <Flex
      direction="column"
      minHeight="100vh"
      bgGradient={bgGradient}
      color={textColor}
    >
      <Header />
      <MotionBox
        as="main"
        flex={1}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Container maxW="container.xl" py={12}>
          <GlassmorphicBox borderRadius="xl" boxShadow="xl">
            {children}
          </GlassmorphicBox>
        </Container>
      </MotionBox>
      <Footer />
    </Flex>
  );
};

export default Layout;