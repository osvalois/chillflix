import React, { useState, useEffect, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tooltip,
  Badge,
  useBreakpointValue,
  Skeleton,
} from "@chakra-ui/react";
import { useToast } from "@chakra-ui/toast";
import { ArrowBackIcon, InfoIcon, StarIcon, DownloadIcon } from "@chakra-ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { getMovieInfo, getStreamUrl } from "../services/movieService";
import { formatFileSize, formatDuration } from "../utils/formatters";
import { useSpring, animated } from "react-spring";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { Player } from "@lottiefiles/react-lottie-player";
import { useQuery } from "react-query";
import { Blurhash } from "react-blurhash";

// Lazy load Swiper components
const Swiper = lazy(() => import('swiper/react').then(module => ({ default: module.Swiper })));
const SwiperSlide = lazy(() => import('swiper/react').then(module => ({ default: module.SwiperSlide })));

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// Import Swiper modules
import { EffectCoverflow, Pagination, Navigation } from 'swiper/modules';

const MotionBox = motion(Box as any);
const AnimatedBox = animated(Box);

interface MovieInfo {
  Name: string;
  InfoHash: string;
  Files: { Size: number }[];
}

const MoviePage: React.FC = () => {
  const { magnetUri } = useParams<{ magnetUri: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const accentColor = useColorModeValue("purple.500", "purple.300");

  const buttonSize = useBreakpointValue({ base: "md", md: "lg" });

  const { data: movieInfo, isLoading, error } = useQuery<MovieInfo, Error>(
    ["movieInfo", magnetUri],
    async () => {
      if (!magnetUri) throw new Error("No magnet URI provided");
      const infoHash = magnetUri.split(":")[3].split("&")[0];
      return await getMovieInfo(infoHash);
    },
    {
      onError: (error) => {
        console.error("Error fetching movie info:", error);
        toast({
          title: "Error",
          description: "No se pudo obtener la información de la película.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  const fadeIn = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? "translateY(0px)" : "translateY(50px)",
    config: { duration: 1000 },
  });

  useEffect(() => {
    if (movieInfo && !isLoading && !error) {
      setIsPlaying(true);
    }
  }, [movieInfo, isLoading, error]);

  if (isLoading) {
    return (
      <Box
        textAlign="center"
        py={20}
        bg={bgColor}
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={4}>
          <Player
            autoplay
            loop
            src="https://assets9.lottiefiles.com/packages/lf20_p8bfn5to.json"
            style={{ width: "200px", height: "200px" }}
          />
          <Text mt={4} fontSize="xl" color={textColor}>Cargando...</Text>
        </VStack>
      </Box>
    );
  }
  
  if (error || !movieInfo) {
    return (
      <Box
        textAlign="center"
        py={20}
        bg={bgColor}
        minHeight="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack spacing={6}>
          <Player
            autoplay
            loop
            src="https://assets5.lottiefiles.com/packages/lf20_afwjhfb2.json"
            style={{ width: "200px", height: "200px" }}
          />
          <Text fontSize="2xl" color={textColor}>Oops! No pudimos encontrar la película</Text>
          <Button
            onClick={() => navigate(-1)}
            leftIcon={<ArrowBackIcon />}
            size="lg"
            colorScheme="purple"
            variant="outline"
          >
            Volver a la búsqueda
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      maxW="100%"
      minHeight="100vh"
      bg={bgColor}
      color={textColor}
      overflow="hidden"
      position="relative"
    >
      <Box position="absolute" top={0} left={0} w="100%" h="100%" zIndex={-1}>
        <Blurhash
          hash="LGF5]+Yk^6#M@-5c,1J5@[or[Q6."
          width="100%"
          height="100%"
          resolutionX={32}
          resolutionY={32}
          punch={1}
        />
      </Box>

      <AnimatePresence>
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          position="relative"
          zIndex={1}
        >
          <VStack
            spacing={12}
            align="stretch"
            maxW="6xl"
            mx="auto"
            py={12}
            px={4}
          >
            {isPlaying && (
              <MotionBox
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Box p={4} borderRadius="xl" boxShadow="xl" bg={`${bgColor}CC`} backdropFilter="blur(10px)">
                  <video
                    controls
                    width="100%"
                    height="auto"
                    src={getStreamUrl(movieInfo.InfoHash)}
                  />
                </Box>
              </MotionBox>
            )}
            <HStack justify="space-between" wrap="wrap">
              <Tooltip label="Volver a la búsqueda" placement="top">
                <Button
                  onClick={() => navigate(-1)}
                  leftIcon={<ArrowBackIcon />}
                  variant="outline"
                  color={textColor}
                  borderColor={textColor}
                  _hover={{ bg: `${textColor}20` }}
                  size={buttonSize}
                >
                  Volver
                </Button>
              </Tooltip>
              <HStack>
                <Tooltip label="Información de la película" placement="top">
                  <Button
                    onClick={onOpen}
                    leftIcon={<InfoIcon />}
                    variant="outline"
                    color={textColor}
                    borderColor={textColor}
                    _hover={{ bg: `${textColor}20` }}
                    size={buttonSize}
                  >
                    Info
                  </Button>
                </Tooltip>
                <Tooltip label="Descargar película" placement="top">
                  <Button
                    leftIcon={<DownloadIcon />}
                    variant="outline"
                    color={textColor}
                    borderColor={textColor}
                    _hover={{ bg: `${textColor}20` }}
                    size={buttonSize}
                  >
                    Descargar
                  </Button>
                </Tooltip>
              </HStack>
            </HStack>

            <AnimatedBox style={fadeIn} ref={ref}>
              <Box p={8} borderRadius="2xl" boxShadow="2xl" bg={`${bgColor}CC`} backdropFilter="blur(10px)">
                <VStack spacing={6} align="stretch">
                  <Heading
                    as="h1"
                    size="3xl"
                    bgGradient={`linear(to-r, ${accentColor}, purple.200)`}
                    bgClip="text"
                    letterSpacing="tight"
                    textAlign="center"
                  >
                    {movieInfo.Name}
                  </Heading>

                  <HStack spacing={4} justifyContent="center">
                    <Badge colorScheme="yellow" fontSize="md" p={2} borderRadius="md">
                      <StarIcon mr={2} />
                      {(Math.random() * 2 + 3).toFixed(1)} / 5.0
                    </Badge>
                    <Badge colorScheme="purple" fontSize="md" p={2} borderRadius="md">
                      {formatDuration(Math.floor(Math.random() * 7200 + 3600))}
                    </Badge>
                    <Badge colorScheme="green" fontSize="md" p={2} borderRadius="md">
                      HD
                    </Badge>
                  </HStack>

                  <Text fontSize="xl" fontStyle="italic" color={`${textColor}80`} textAlign="center">
                    "{movieInfo.Name.split('.').slice(0, -1).join('.')}"
                  </Text>
                </VStack>
              </Box>
            </AnimatedBox>

            <Box>
              <Heading as="h2" size="xl" mb={4}>Escenas Destacadas</Heading>
              <Suspense fallback={<Skeleton height="400px" />}>
                <Swiper
                  effect="coverflow"
                  grabCursor={true}
                  centeredSlides={true}
                  slidesPerView="auto"
                  coverflowEffect={{
                    rotate: 50,
                    stretch: 0,
                    depth: 100,
                    modifier: 1,
                    slideShadows: true,
                  }}
                  pagination={true}
                  navigation={true}
                  modules={[EffectCoverflow, Pagination, Navigation]}
                  className="mySwiper"
                >
                  {[1, 2, 3, 4, 5].map((_, index) => (
                    <SwiperSlide key={index}>
                      <LazyLoadImage
                        src={`/api/placeholder/400/225?text=Escena ${index + 1}`}
                        alt={`Escena ${index + 1}`}
                        effect="blur"
                        width="100%"
                        height="auto"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Suspense>
            </Box>
          </VStack>
        </MotionBox>
      </AnimatePresence>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg={useColorModeValue("white", "gray.800")} borderRadius="2xl">
          <ModalHeader>Información de la Película</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              <Text>
                <strong>Tamaño:</strong> {formatFileSize(movieInfo.Files[0].Size)}
              </Text>
              <Text>
                <strong>Hash:</strong> {movieInfo.InfoHash}
              </Text>
              <Text>
                <strong>Fecha de lanzamiento:</strong> {new Date().toLocaleDateString()}
              </Text>
              <Text>
                <strong>Género:</strong> Acción, Aventura
              </Text>
              <Text>
                <strong>Director:</strong> John Doe
              </Text>
              <Text>
                <strong>Reparto:</strong> Actor 1, Actor 2, Actor 3
              </Text>
              <Text>
                <strong>Sinopsis:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MoviePage;