import React from 'react';
import { Box, Button, Container, Heading, Text, VStack, useToast, Flex } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FallbackProps } from 'react-error-boundary';
import { FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';

const MotionBox = motion(Box as any);
const MotionFlex = motion(Flex as any);

const glassStyle = {
  background: "rgba(255, 255, 255, 0.05)",
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

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const toast = useToast();

  const handleTryAgain = () => {
    resetErrorBoundary();
  };

  const handleReportError = () => {
    console.error('Reported error:', error);
    toast({
      title: "Error Reported",
      description: "We've received your report and will investigate shortly.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.xl" h="100vh" display="flex" alignItems="center" justifyContent="center">
      <AnimatePresence>
        <MotionBox
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          sx={glassStyle}
          p={8}
          w="100%"
          maxW="600px"
        >
          <Box sx={lightEffect} />
          <VStack spacing={6} align="stretch" position="relative" zIndex={1}>
            <Flex align="center" justify="center">
              <MotionFlex
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                mr={4}
              >
                <FiAlertTriangle size="2em" color="red" />
              </MotionFlex>
              <Heading as="h1" size="xl" bgGradient="linear(to-r, red.400, pink.500)" bgClip="text">
                Oops! An Error Occurred
              </Heading>
            </Flex>
            <Text color="whiteAlpha.800" textAlign="center">
              We encountered an unexpected issue while processing your request.
            </Text>
            <Box 
              bg="rgba(255, 255, 255, 0.05)"
              p={4}
              borderRadius="md"
              fontFamily="monospace"
              fontSize="sm"
              color="red.300"
              boxShadow="inset 0 2px 4px rgba(0,0,0,0.1)"
            >
              {error.message || "An unknown error occurred"}
            </Box>
            <Text color="whiteAlpha.800" fontSize="sm" textAlign="center">
              Our team has been notified and is working on a solution. 
              In the meantime, you can try the following:
            </Text>
            <VStack spacing={4}>
              <Button 
                leftIcon={<FiRefreshCw />}
                onClick={handleTryAgain} 
                width="full"
                bgGradient="linear(to-r, blue.400, blue.600)"
                color="white"
                _hover={{
                  bgGradient: "linear(to-r, blue.500, blue.700)",
                }}
                transition="all 0.3s"
              >
                Try Again
              </Button>
              <Button 
                onClick={handleReportError} 
                width="full"
                variant="outline"
                borderColor="whiteAlpha.300"
                color="whiteAlpha.900"
                _hover={{
                  bg: "whiteAlpha.100",
                }}
                transition="all 0.3s"
              >
                Report This Error
              </Button>
            </VStack>
          </VStack>
        </MotionBox>
      </AnimatePresence>
    </Container>
  );
};

export default ErrorFallback;