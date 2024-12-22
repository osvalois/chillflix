import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import {
  Box,
  Container,
  VStack,
  Text,
  Heading,
  Flex,
  keyframes,
  useToast,
  chakra,
} from '@chakra-ui/react';
import { useAuth } from '../components/Auth/AuthContext';
import { useDynamicBackground } from '../hooks/useDynamicBackground';
import GlassmorphicBox from '../components/UI/GlassmorphicBox';
import { GoogleSignInButton } from '../components/Auth/SocialButton';


const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0); }
  25% { transform: translateY(-15px) rotate(-2deg); }
  75% { transform: translateY(-8px) rotate(2deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 0.5; }
`;

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
      type: "spring",
      damping: 20,
      stiffness: 100
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 200
    }
  }
};

const GlowingBackground = chakra(Box, {
  baseStyle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '150%',
    height: '150%',
    background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
    filter: 'blur(40px)',
    zIndex: -1,
  },
});

interface AuthProps {
  className?: string;
}

const Auth: React.FC<AuthProps> = ({ className }) => {
  const { signInWithGoogle, isLoading, error } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const controls = useAnimation();
  const { bgGradient, textColor } = useDynamicBackground();

  const from = location.state?.from?.pathname || '/';

  const handleGoogleSignIn = async () => {
    if (isAuthenticating) return;

    try {
      setIsAuthenticating(true);
      controls.start({
        scale: [1, 0.98, 1],
        transition: { duration: 0.2 }
      });

      await signInWithGoogle();
      setIsSuccess(true);

      toast({
        title: "Welcome to Chillflix!",
        description: "Successfully authenticated. Redirecting you...",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
        variant: "subtle",
      });

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1500);
    } catch (err) {
      setIsAuthenticating(false);
      controls.start({ x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.5 } });

      toast({
        title: "Authentication Failed",
        description: error || "Please try again later",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
        variant: "subtle",
      });
      console.error('Auth error:', err);
    }
  };

  return (
    <ParallaxProvider>
      <Box
        minH="100vh"
        bgGradient={bgGradient}
        backgroundAttachment="fixed"
        position="relative"
        overflow="hidden"
        className={className}
      >
        {/* Enhanced Background Elements */}
        <Box
          position="absolute"
          inset="0"
          opacity="0.1"
          bgRepeat="repeat"
          bgSize="50px"
          sx={{
            animation: `${float} 20s ease-in-out infinite`,
          }}
        />

        {/* Animated particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <Box
            key={i}
            position="absolute"
            width="2px"
            height="2px"
            borderRadius="full"
            bg="whiteAlpha.400"
            sx={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `${pulse} ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}

        <Container
          maxW="container.md"
          py={{ base: 10, md: 20 }}
          px={{ base: 4, md: 6 }}
          position="relative"
        >
          <Parallax translateY={[-20, 20]}>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <GlassmorphicBox

              >
                <GlowingBackground />

                <VStack
                  spacing={{ base: 8, md: 10 }}
                  p={{ base: 8, md: 12 }}
                  position="relative"
                >

                  {/* Enhanced Welcome Text */}
                  <motion.div variants={itemVariants}>
                    <VStack spacing={4}>
                      <img src='chillflix.png' width={'50%'} />
                      <Heading
                        fontSize={{ base: "4xl", md: "5xl" }}
                        bgGradient="linear(to-r, blue.400, purple.500)"
                        bgClip="text"
                        letterSpacing="tight"
                        textAlign="center"
                        fontWeight="bold"
                        sx={{
                          textShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        }}
                      >
                        Welcome to Chillflix
                      </Heading>
                      <Text
                        color={textColor}
                        fontSize={{ base: "lg", md: "xl" }}
                        textAlign="center"
                        maxW="md"
                        opacity={0.9}
                        letterSpacing="wide"
                      >
                        Your gateway to endless entertainment
                      </Text>
                    </VStack>
                  </motion.div>

                  {/* Enhanced Sign In Button */}
                  <motion.div
                    variants={itemVariants}
                    className="flex justify-center items-center w-full"
                  >
                    <GoogleSignInButton onClick={handleGoogleSignIn} />
                  </motion.div>

                  {/* Enhanced Status Messages */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        style={{ width: "100%" }}
                      >
                        <Box
                          p={6}
                          bg="rgba(254, 178, 178, 0.15)"
                          backdropFilter="blur(12px)"
                          borderRadius="xl"
                          borderWidth="1px"
                          borderColor="red.300"
                          position="relative"
                          overflow="hidden"
                          sx={{
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '1px',
                              background: 'linear-gradient(90deg, transparent, rgba(254, 178, 178, 0.5), transparent)',
                            }
                          }}
                        >
                          <Flex align="center" gap={3}>
                            <Box
                              p={2}
                              borderRadius="full"
                              bg="red.100"
                              color="red.500"
                            >
                              <motion.div
                                animate={{
                                  rotate: [0, 5, -5, 0],
                                  transition: {
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatDelay: 1
                                  }
                                }}
                              >
                                <ShieldCheck size={20} />
                              </motion.div>
                            </Box>
                            <Text
                              color="red.600"
                              fontSize="md"
                              fontWeight="medium"
                              sx={{
                                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                              }}
                            >
                              {error}
                            </Text>
                          </Flex>
                        </Box>
                      </motion.div>
                    )}

                    {isSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        style={{ width: "100%" }}
                      >
                        <Box
                          p={6}
                          bg="rgba(154, 230, 180, 0.15)"
                          backdropFilter="blur(12px)"
                          borderRadius="xl"
                          borderWidth="1px"
                          borderColor="green.300"
                          position="relative"
                          overflow="hidden"
                          sx={{
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '1px',
                              background: 'linear-gradient(90deg, transparent, rgba(154, 230, 180, 0.5), transparent)',
                            }
                          }}
                        >
                          <Flex align="center" gap={3}>
                            <Box
                              p={2}
                              borderRadius="full"
                              bg="green.100"
                              color="green.500"
                            >
                              <motion.div
                                animate={{
                                  scale: [1, 1.2, 1],
                                  transition: {
                                    duration: 1,
                                    repeat: Infinity,
                                    repeatDelay: 0.5
                                  }
                                }}
                              >
                                <ShieldCheck size={20} />
                              </motion.div>
                            </Box>
                            <VStack align="flex-start" spacing={1}>
                              <Text
                                color="green.600"
                                fontSize="md"
                                fontWeight="medium"
                                sx={{
                                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                }}
                              >
                                Successfully logged in!
                              </Text>
                              <Text
                                color="green.500"
                                fontSize="sm"
                                opacity={0.9}
                              >
                                Redirecting you to your destination...
                              </Text>
                            </VStack>
                          </Flex>
                        </Box>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Additional Security Info - Positioned at bottom */}
                  <motion.div
                    variants={itemVariants}
                    className="w-full flex justify-center items-end mt-auto" // Añadido mt-auto para empujar hacia abajo
                  >
                    <div className="flex items-center justify-center gap-2 mt-8 mb-4 opacity-70">
                      <p className="text-sm text-center text-gray-600">
                        Secure authentication powered by Google
                      </p>
                    </div>
                  </motion.div></VStack>
              </GlassmorphicBox>
            </motion.div>
          </Parallax>
        </Container>
      </Box>
    </ParallaxProvider>
  );
};

export default Auth;