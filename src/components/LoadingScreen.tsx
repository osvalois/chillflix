import { Player } from "@lottiefiles/react-lottie-player";
import {
  Box,
  Container,
  VStack,
  Text,
  Grid,
  Flex,
  keyframes
} from '@chakra-ui/react';

const pulse = keyframes`
  0% { opacity: 0.4 }
  50% { opacity: 0.7 }
  100% { opacity: 0.4 }
`;

const LoadingScreen = () => {
  const pulseAnimation = `${pulse} 2s infinite`;

  return (
    <Box
      position="fixed"
      inset="0"
      bgGradient="linear(to-br, gray.900, gray.800, black)"
      overflow="hidden"
    >
      <Container maxW="container.xl" height="100vh">
        <Flex
          height="100%"
          alignItems="center"
          justifyContent="center"
          position="relative"
        >
          {/* Glassmorphic container */}
          <Box
            backdropFilter="blur(16px)"
            bg="whiteAlpha.100"
            rounded="xl"
            p={8}
            boxShadow="2xl"
            position="relative"
            zIndex={2}
            width="100%"
            maxW="3xl"
          >
            {/* Animation container */}

            {/* Skeleton loading indicators */}
            <VStack mt={8} spacing={4} width="100%">
              <Flex gap={4} width="100%">
                <Box
                  w="64px"
                  h="64px"
                  bg="whiteAlpha.200"
                  rounded="lg"
                  animation={pulseAnimation}
                />
                <VStack flex={1} spacing={2} align="stretch">
                  <Box
                    h="16px"
                    bg="whiteAlpha.200"
                    rounded="md"
                    animation={pulseAnimation}
                  />
                  <Box
                    h="16px"
                    bg="whiteAlpha.200"
                    rounded="md"
                    width="83%"
                    animation={pulseAnimation}
                  />
                </VStack>
              </Flex>

              <Grid templateColumns="repeat(3, 1fr)" gap={4} width="100%">
                {[...Array(3)].map((_, i) => (
                  <Box
                    key={i}
                    h="96px"
                    bg="whiteAlpha.200"
                    rounded="lg"
                    animation={pulseAnimation}
                  />
                ))}
              </Grid>

              <Box
                h="16px"
                bg="whiteAlpha.200"
                rounded="md"
                width="75%"
                animation={pulseAnimation}
              />
              <Box
                h="16px"
                bg="whiteAlpha.200"
                rounded="md"
                width="50%"
                animation={pulseAnimation}
              />
            </VStack>
          </Box>

          {/* Background gradient orbs */}
          <Box
            position="absolute"
            top="25%"
            left="25%"
            w="256px"
            h="256px"
            bg="purple.500"
            opacity={0.3}
            rounded="full"
            filter="blur(64px)"
            animation={pulseAnimation}
          />
          <Box
            position="absolute"
            bottom="25%"
            right="25%"
            w="256px"
            h="256px"
            bg="blue.500"
            opacity={0.3}
            rounded="full"
            filter="blur(64px)"
            animation={pulseAnimation}
          />
        </Flex>
      </Container>
    </Box>
  );
};

export default LoadingScreen;