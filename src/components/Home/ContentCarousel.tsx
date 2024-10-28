import React, { useRef, useCallback, useMemo, useState, useEffect, useReducer } from 'react';
import { Box, Flex, Heading, IconButton, useToken, Portal, useTheme, useToast } from '@chakra-ui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, EffectCoverflow, Autoplay, Parallax, Keyboard, A11y, Virtual } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaFire, FaStar, FaHeart, FaCalendar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useMediaQuery } from '@chakra-ui/react';
import { ErrorBoundary } from 'react-error-boundary';
import ContentCard from './ContentCard';

// Tipos mejorados
interface ContentBase {
  id: number;
  title?: string;
  name?: string;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  media_type: 'movie' | 'tv';
  overview?: string;
  genre_ids?: number[];
  vote_count?: number;
  popularity?: number;
  genres?: Array<{ id: number; name: string }>;
  runtime?: number;
}

export type CombinedContent = ContentBase;

// Estado del carrusel
interface CarouselState {
  isLoading: boolean;
  error: Error | null;
  activeIndex: number;
  isAnimating: boolean;
  isAutoPlaying: boolean;
  direction: 'prev' | 'next' | null;
  touchStartX: number | null;
  touchEndX: number | null;
  lastInteractionTime: number;
}

// Acciones del reducer
type CarouselAction =
  | { type: 'START_LOADING' }
  | { type: 'LOAD_SUCCESS' }
  | { type: 'LOAD_ERROR'; payload: Error }
  | { type: 'SET_ACTIVE_INDEX'; payload: number }
  | { type: 'START_ANIMATION'; payload: 'prev' | 'next' }
  | { type: 'END_ANIMATION' }
  | { type: 'TOGGLE_AUTOPLAY' }
  | { type: 'SET_TOUCH_START'; payload: number }
  | { type: 'SET_TOUCH_END'; payload: number }
  | { type: 'RESET_TOUCH' }
  | { type: 'UPDATE_LAST_INTERACTION' };

interface ContentCarouselProps {
  title: string;
  content: CombinedContent[];
  icon: keyof typeof iconMap;
  autoplay?: boolean;
  interval?: number;
  onSlideChange?: (index: number) => void;
  onCardClick?: (content: CombinedContent) => void;
}

// Constantes
const ANIMATION_DURATION = 0.3;
const MIN_SWIPE_DISTANCE = 50;
const SWIPE_VELOCITY_THRESHOLD = 0.5;
const INTERACTION_TIMEOUT = 3000;
const ERROR_RETRY_DELAY = 3000;
const MAX_RETRIES = 3;

const iconMap = {
  FaFire,
  FaStar,
  FaHeart,
  FaCalendar,
} as const;

// Reducer para manejar el estado del carrusel
const carouselReducer = (state: CarouselState, action: CarouselAction): CarouselState => {
  switch (action.type) {
    case 'START_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'LOAD_SUCCESS':
      return { ...state, isLoading: false };
    case 'LOAD_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SET_ACTIVE_INDEX':
      return { ...state, activeIndex: action.payload };
    case 'START_ANIMATION':
      return { ...state, isAnimating: true, direction: action.payload };
    case 'END_ANIMATION':
      return { ...state, isAnimating: false, direction: null };
    case 'TOGGLE_AUTOPLAY':
      return { ...state, isAutoPlaying: !state.isAutoPlaying };
    case 'SET_TOUCH_START':
      return { ...state, touchStartX: action.payload };
    case 'SET_TOUCH_END':
      return { ...state, touchEndX: action.payload };
    case 'RESET_TOUCH':
      return { ...state, touchStartX: null, touchEndX: null };
    case 'UPDATE_LAST_INTERACTION':
      return { ...state, lastInteractionTime: Date.now() };
    default:
      return state;
  }
};

// Componente de gestión de errores
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({
  error,
}) => {
  const toast = useToast();

  useEffect(() => {
    toast({
      title: "Error en el carrusel",
      description: error.message,
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }, [error, toast]);

  return null;
};

const ContentCarousel: React.FC<ContentCarouselProps> = ({
  title,
  icon,
  content,
  autoplay = false,
  interval = 3000,
  onSlideChange,
  onCardClick,
}) => {
  // Referencias y estado
  const swiperRef = useRef<SwiperType | null>(null);
  const retryCountRef = useRef(0);
  const [showControls, setShowControls] = useState(false);

  // Estado principal usando reducer
  const [state, dispatch] = useReducer(carouselReducer, {
    isLoading: false,
    error: null,
    activeIndex: 0,
    isAnimating: false,
    isAutoPlaying: autoplay,
    direction: null,
    touchStartX: null,
    touchEndX: null,
    lastInteractionTime: Date.now(),
  });

  // Hooks responsivos
  const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
  const [isLargerThan1024] = useMediaQuery("(min-width: 1024px)");
  const [isLargerThan1440] = useMediaQuery("(min-width: 1440px)");
  const toast = useToast();

  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  const theme = useTheme();
  const [purple400, pink400] = useToken('colors', ['purple.400', 'pink.400']);

  // Configuraciones responsivas
  const slidesPerView = useMemo(() => {
    if (!isLargerThan768) return 1;
    if (!isLargerThan1024) return 2;
    if (!isLargerThan1440) return 2.5;
    return 3;
  }, [isLargerThan768, isLargerThan1024, isLargerThan1440]);

  const spacing = useMemo(() => {
    if (!isLargerThan768) return 10;
    if (!isLargerThan1024) return 20;
    return 30;
  }, [isLargerThan768, isLargerThan1024]);

  // Manejadores de eventos táctiles optimizados
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dispatch({ type: 'SET_TOUCH_START', payload: e.touches[0].clientX });
    dispatch({ type: 'UPDATE_LAST_INTERACTION' });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!state.touchStartX || state.isAnimating || !swiperRef.current) return;

    const currentX = e.touches[0].clientX;
    dispatch({ type: 'SET_TOUCH_END', payload: currentX });

    const distance = currentX - state.touchStartX;
    const velocity = Math.abs(distance) / e.timeStamp;

    if (Math.abs(distance) > MIN_SWIPE_DISTANCE && velocity > SWIPE_VELOCITY_THRESHOLD) {
      try {
        if (distance > 0) {
          dispatch({ type: 'START_ANIMATION', payload: 'prev' });
          swiperRef.current.slidePrev();
        } else {
          dispatch({ type: 'START_ANIMATION', payload: 'next' });
          swiperRef.current.slideNext();
        }
      } catch (error) {
        console.error('Error during slide transition:', error);
        toast({
          title: "Error en la navegación",
          description: "No se pudo cambiar de slide",
          status: "error",
          duration: 3000,
        });
      } finally {
        dispatch({ type: 'RESET_TOUCH' });
      }
    }
  }, [state.touchStartX, state.isAnimating, toast]);

  // Manejador de navegación mejorado
  const handleNavigation = useCallback((direction: 'prev' | 'next') => {
    if (!swiperRef.current || state.isAnimating) return;

    try {
      dispatch({ type: 'START_ANIMATION', payload: direction });
      dispatch({ type: 'UPDATE_LAST_INTERACTION' });

      if (direction === 'prev') {
        swiperRef.current.slidePrev();
      } else {
        swiperRef.current.slideNext();
      }

      setTimeout(() => {
        dispatch({ type: 'END_ANIMATION' });
      }, ANIMATION_DURATION * 1000);
    } catch (error) {
      console.error('Navigation error:', error);
      toast({
        title: "Error en la navegación",
        description: "Intente nuevamente",
        status: "error",
        duration: 3000,
      });
    }
  }, [state.isAnimating, toast]);

  // Configuración de Swiper mejorada
  const swiperParams = useMemo(() => ({
    modules: [Navigation, EffectCoverflow, Autoplay, Parallax, Keyboard, A11y, Virtual],
    spaceBetween: spacing,
    slidesPerView,
    centeredSlides: true,
    loop: true,
    parallax: true,
    virtual: true,
    effect: "coverflow" as const,
    coverflowEffect: {
      rotate: isLargerThan768 ? 35 : 25,
      stretch: 0,
      depth: isLargerThan768 ? 100 : 50,
      modifier: 1.5,
      slideShadows: true,
    },
    autoplay: state.isAutoPlaying ? {
      delay: interval,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
      waitForTransition: true,
    } : false,
    navigation: false,
    grabCursor: true,
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    observer: true,
    observeParents: true,
    watchSlidesProgress: true,
    preventClicksPropagation: true,
    preventClicks: false,
    touchReleaseOnEdges: true,
    resistance: true,
    resistanceRatio: 0.85,
    on: {
      touchEnd: () => {
        dispatch({ type: 'RESET_TOUCH' });
      },
      slideChange: () => {
        if (swiperRef.current) {
          dispatch({ type: 'SET_ACTIVE_INDEX', payload: swiperRef.current.realIndex });
          onSlideChange?.(swiperRef.current.realIndex);
        }
      },
      error: (error: Error) => {
        console.error('Swiper error:', error);
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          setTimeout(() => {
            swiperRef.current?.update();
          }, ERROR_RETRY_DELAY);
        } else {
          dispatch({ type: 'LOAD_ERROR', payload: error });
        }
      },
    },
  }), [spacing, slidesPerView, state.isAutoPlaying, interval, isLargerThan768, onSlideChange]);

  // Componente de navegación optimizado
  const NavButton = useCallback(({ direction }: { direction: 'prev' | 'next' }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: showControls ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: ANIMATION_DURATION }}
    >
      <IconButton
        aria-label={`${direction} slide`}
        icon={direction === 'prev' ? <FaChevronLeft /> : <FaChevronRight />}
        position="absolute"
        top="50%"
        transform="translateY(-50%)"
        zIndex={2}
        {...(direction === 'prev' ? { left: 2 } : { right: 2 })}
        size={isLargerThan768 ? "lg" : "md"}
        variant="ghost"
        colorScheme="whiteAlpha"
        bg="rgba(0, 0, 0, 0.6)"
        backdropFilter="blur(4px)"
        boxShadow={theme.shadows.lg}
        onClick={() => handleNavigation(direction)}
        _hover={{
          bg: "rgba(0, 0, 0, 0.8)",
          transform: "translateY(-50%) scale(1.1)",
        }}
        _active={{
          transform: "translateY(-50%) scale(0.95)",
        }}
        display={isLargerThan768 ? "flex" : "none"}
      />
    </motion.div>
  ), [showControls, isLargerThan768, handleNavigation, theme.shadows.lg]);

  // Efectos y limpieza
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showControls) return;
      if (e.key === 'ArrowLeft') handleNavigation('prev');
      if (e.key === 'ArrowRight') handleNavigation('next');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (swiperRef.current?.autoplay) {
        swiperRef.current.autoplay.stop();
      }
    };
  }, [handleNavigation, showControls]);

  // Auto-reactivación del autoplay después de la inactividad
// Auto-reactivación del autoplay después de la inactividad
useEffect(() => {
  if (!autoplay) return;

  const checkInactivity = setInterval(() => {
    const timeSinceLastInteraction = Date.now() - state.lastInteractionTime;
    if (timeSinceLastInteraction > INTERACTION_TIMEOUT && !state.isAutoPlaying) {
      dispatch({ type: 'TOGGLE_AUTOPLAY' });
    }
  }, 1000);

  return () => clearInterval(checkInactivity);
}, [autoplay, state.lastInteractionTime, state.isAutoPlaying]);

// Gestión del estado de carga inicial
useEffect(() => {
  if (!content.length) {
    dispatch({ type: 'LOAD_ERROR', payload: new Error('No hay contenido disponible') });
    return;
  }

  dispatch({ type: 'START_LOADING' });
  try {
    // Precarga de imágenes para una experiencia más fluida
    const preloadImages = async () => {
      const imagePromises = content.map((item) => {
        return new Promise((resolve) => {
          if (item.backdrop_path || item.poster_path) {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = item.backdrop_path || item.poster_path || '';
          } else {
            resolve(false);
          }
        });
      });

      await Promise.all(imagePromises);
      dispatch({ type: 'LOAD_SUCCESS' });
    };

    preloadImages();
  } catch (error) {
    dispatch({ type: 'LOAD_ERROR', payload: error as Error });
  }
}, [content]);

return (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={() => {
      retryCountRef.current = 0;
      dispatch({ type: 'LOAD_SUCCESS' });
    }}
  >
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="initial"
        animate={inView ? "animate" : "initial"}
        exit="exit"
        variants={{
          initial: { opacity: 0, y: 50 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -50 },
        }}
        transition={{ duration: ANIMATION_DURATION }}
      >
        <Flex
          direction="column"
          mb={8}
          position="relative"
          onMouseEnter={() => {
            setShowControls(true);
            if (state.isAutoPlaying) {
              dispatch({ type: 'TOGGLE_AUTOPLAY' });
            }
          }}
          onMouseLeave={() => {
            setShowControls(false);
            const timeSinceLastInteraction = Date.now() - state.lastInteractionTime;
            if (timeSinceLastInteraction > INTERACTION_TIMEOUT) {
              dispatch({ type: 'TOGGLE_AUTOPLAY' });
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={() => dispatch({ type: 'RESET_TOUCH' })}
        >
          {/* Sección de título e icono con animación mejorada */}
          <Flex
            align="center"
            mb={6}
            p={4}
            borderRadius="xl"
            backdropFilter="blur(8px)"
            position="relative"
            sx={{
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: 'xl',
                background: `linear-gradient(135deg, ${purple400}20, ${pink400}20)`,
                filter: 'blur(8px)',
                zIndex: -1,
              }
            }}
          >
            <motion.div
              animate={{
                rotate: 360,
                transition: {
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Box
                as={iconMap[icon]}
                color="white"
                fontSize="2xl"
                p={4}
                bg={`linear-gradient(45deg, ${purple400}, ${pink400})`}
                borderRadius="full"
                boxShadow={theme.shadows.lg}
              />
            </motion.div>
            
            <Heading
              size={isLargerThan768 ? "2xl" : "xl"}
              ml={4}
              bgGradient={`linear(to-r, ${purple400}, ${pink400})`}
              bgClip="text"
              fontWeight="extrabold"
              letterSpacing="tight"
              _hover={{ letterSpacing: "wide", transition: "all 0.3s ease" }}
            >
              {title}
            </Heading>
          </Flex>

          {/* Sección del carrusel con gestión mejorada de estados */}
          <Box
            position="relative"
            px={isLargerThan768 ? 6 : 2}
            mx={isLargerThan768 ? 0 : -2}
          >
            {state.isLoading ? (
              <Flex justify="center" align="center" minH="300px">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Box
                    as={FaFire}
                    color={purple400}
                    fontSize="3xl"
                  />
                </motion.div>
              </Flex>
            ) : (
              <Swiper
                {...swiperParams}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
              >
                {content.map((item) => (
                  <SwiperSlide key={item.id}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Box
                        p={2}
                        cursor="pointer"
                        onClick={() => {
                          dispatch({ type: 'UPDATE_LAST_INTERACTION' });
                          onCardClick?.(item);
                        }}
                        role="group"
                        position="relative"
                        overflow="hidden"
                      >
                        <ContentCard 
                          content={item}
                          isActive={state.activeIndex === content.indexOf(item)}
                        />
                      </Box>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}

            <Portal>
              <NavButton direction="prev" />
              <NavButton direction="next" />
            </Portal>
          </Box>
        </Flex>
      </motion.div>
    </AnimatePresence>
  </ErrorBoundary>
);
};

export default React.memo(ContentCarousel);