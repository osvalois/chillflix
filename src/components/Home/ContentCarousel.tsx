import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { Box, Flex, Heading, IconButton, useToken, Portal, useTheme } from '@chakra-ui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, EffectCoverflow, Autoplay, Parallax } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

import useSound from 'use-sound';
import { useBreakpointValue } from '@chakra-ui/react';
import { useDebounce } from 'use-debounce';
import ContentCard from './ContentCard';
// Style imports
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import 'swiper/css/parallax';
import { DynamicIcon } from '../Movie/Icons';

// Types with stricter definitions
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

interface ContentCarouselProps {
  title: string;
  content: CombinedContent[];
  autoplay?: boolean;
  interval?: number;
  onSlideChange?: (index: number) => void;
  onCardClick?: (content: CombinedContent) => void;
}

interface CarouselState {
  activeSlide: number;
  isInteracting: boolean;
  autoplayEnabled: boolean;
  isTransitioning: boolean;
  error: string | null;
}

// Constants
const ANIMATION_DURATION = 0.3;
const HOVER_DEBOUNCE_TIME = 100;
const TRANSITION_LOCK_TIME = 300;

// Enhanced animations configuration
const animations = {
  slide: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  },
  icon: {
    initial: { rotate: 0 },
    animate: { rotate: 360 },
    transition: { duration: 20, repeat: Infinity, ease: "linear" },
  },
};

// Enhanced carousel state management
const useCarouselState = (initialAutoplay = false): [CarouselState, React.Dispatch<React.SetStateAction<CarouselState>>] => {
  const [state, setState] = useState<CarouselState>({
    activeSlide: 0,
    isInteracting: false,
    autoplayEnabled: initialAutoplay,
    isTransitioning: false,
    error: null,
  });

  return [state, setState];
};

const useCarouselBreakpoints = () => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ md: true, lg: false });
  
  return useMemo(() => ({
    isMobile,
    isTablet,
    slidesPerView: isMobile ? 1 : isTablet ? 1.5 : 2.5,
  }), [isMobile, isTablet]);
};

// Enhanced error boundary component
const ErrorBoundary: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <Box p={4}>An error occurred. Please try again.</Box>;
  }

  return <>{children}</>;
};

const ContentCarousel: React.FC<ContentCarouselProps> = ({
  title,
  content,
  autoplay = false,
  interval = 3000,
  onSlideChange,
  onCardClick,
}) => {
  // Enhanced refs and state management
  const swiperRef = useRef<SwiperType | null>(null);
  const transitionLockRef = useRef<boolean>(false);
  const [state, setState] = useCarouselState(autoplay);
  const [debouncedIsInteracting] = useDebounce(state.isInteracting, HOVER_DEBOUNCE_TIME);

  // Hooks
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const theme = useTheme();
  const [purple400, pink400] = useToken('colors', ['purple.400', 'pink.400']);
  const { isMobile, slidesPerView } = useCarouselBreakpoints();

  // Optimized sound effects with error handling
  const [playHover] = useSound('/assets/sounds/hover.mp3', {
    volume: 0.3,
    preload: false,
    sprite: {
      hover: [0, 300]
    }
  });
  const [playClick] = useSound('/assets/sounds/click.mp3', {
    volume: 0.4,
    preload: false,
    sprite: {
      click: [0, 300]
    }
  });

  // Enhanced Swiper configuration
  const swiperConfig = useMemo(() => ({
    modules: [Navigation, EffectCoverflow, Autoplay, Parallax],
    spaceBetween: 30,
    slidesPerView,
    centeredSlides: true,
    loop: true,
    parallax: true,
    effect: "coverflow" as const,
    coverflowEffect: {
      rotate: 35,
      stretch: 0,
      depth: 100,
      modifier: 1.5,
      slideShadows: true,
    },
    autoplay: state.autoplayEnabled && !debouncedIsInteracting ? {
      delay: interval,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    } : false,
    navigation: false,
    grabCursor: true,
    keyboard: { enabled: true, onlyInViewport: true },
    observer: true,
    observeParents: true,
    watchSlidesProgress: true,
    preventInteractionOnTransition: true,
    speed: 500,
    touchRatio: 1,
    threshold: 5,
  }), [state.autoplayEnabled, interval, debouncedIsInteracting, slidesPerView]);

  // Enhanced slide change handler with error prevention
  const handleSlideChange = useCallback((swiper: SwiperType) => {
    if (transitionLockRef.current) return;

    try {
      const newIndex = swiper.realIndex;
      
      if (newIndex !== state.activeSlide) {
        transitionLockRef.current = true;
        
        setState(prev => ({
          ...prev,
          activeSlide: newIndex,
          isTransitioning: true,
          error: null
        }));

        onSlideChange?.(newIndex);
        playClick();

        // Release transition lock after delay
        setTimeout(() => {
          transitionLockRef.current = false;
          setState(prev => ({
            ...prev,
            isTransitioning: false
          }));
        }, TRANSITION_LOCK_TIME);
      }
    } catch (error) {
      console.error('Slide change error:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to change slide'
      }));
    }
  }, [state.activeSlide, onSlideChange, playClick]);

  // Enhanced interaction handler
  const handleInteraction = useCallback((type: 'enter' | 'leave') => {
    if (state.isTransitioning) return;

    try {
      setState(prev => ({
        ...prev,
        isInteracting: type === 'enter',
        autoplayEnabled: type === 'leave' && autoplay,
        error: null
      }));

      if (type === 'enter') {
        playHover();
      }
    } catch (error) {
      console.error('Interaction error:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to handle interaction'
      }));
    }
  }, [state.isTransitioning, autoplay, playHover]);

  // Enhanced navigation buttons with error handling
  const NavigationButton = useMemo(() => {
    return ({ direction }: { direction: 'prev' | 'next' }) => {
      const handleClick = () => {
        if (!swiperRef.current || state.isTransitioning) return;

        try {
          direction === 'prev'
            ? swiperRef.current.slidePrev()
            : swiperRef.current.slideNext();
        } catch (error) {
          console.error('Navigation error:', error);
          setState(prev => ({
            ...prev,
            error: 'Failed to navigate'
          }));
        }
      };

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: ANIMATION_DURATION }}
        >
          <IconButton
            aria-label={`${direction} slide`}
            icon={direction === 'prev' ?    <DynamicIcon name="ChevronLeft" size={20} style="default" />: <DynamicIcon name="ChevronRight" size={20} style="default" />}
            position="absolute"
            top="50%"
            transform="translateY(-50%)"
            zIndex={2}
            {...(direction === 'prev' ? { left: 4 } : { right: 4 })}
            size={isMobile ? "md" : "lg"}
            variant="ghost"
            colorScheme="whiteAlpha"
            bg="rgba(0, 0, 0, 0.6)"
            backdropFilter="blur(4px)"
            boxShadow={theme.shadows.lg}
            _hover={{
              bg: "rgba(0, 0, 0, 0.8)",
              transform: "translateY(-50%) scale(1.1)",
            }}
            onClick={handleClick}
            onMouseEnter={() => handleInteraction('enter')}
            onMouseLeave={() => handleInteraction('leave')}
            isDisabled={state.isTransitioning}
          />
        </motion.div>
      );
    };
  }, [handleInteraction, isMobile, state.isTransitioning, theme.shadows.lg]);

  // Enhanced content rendering with error handling
  const renderContent = useMemo(() => (
    content.map((item: CombinedContent) => (
      <SwiperSlide
        key={item.id}
        data-swiper-parallax="-300"
      >
        <ErrorBoundary>
          <Box
            p={4}
            transition={`all ${ANIMATION_DURATION}s cubic-bezier(0.4, 0, 0.2, 1)`}
            _hover={{ transform: 'scale(1.02)' }}
            position="relative"
            overflow="hidden"
            onClick={() => !state.isTransitioning && onCardClick?.(item)}
            cursor={state.isTransitioning ? "wait" : "pointer"}
            role="group"
          >
            <ContentCard
              content={item}
              isActive={state.activeSlide === content.indexOf(item)}
            />
          </Box>
        </ErrorBoundary>
      </SwiperSlide>
    ))
  ), [content, state.activeSlide, state.isTransitioning, onCardClick]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (swiperRef.current) {
        swiperRef.current.destroy(true, true);
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <AnimatePresence>
        <motion.div
          ref={ref}
          initial="initial"
          animate={inView ? "animate" : "initial"}
          exit="exit"
          variants={animations.slide}
          transition={{ duration: ANIMATION_DURATION }}
        >
          <Flex
            direction="column"
            mb={16}
            position="relative"
          >
            {/* Header Section */}
            <Flex
              align="center"
              mb={8}
              p={4}
              borderRadius="xl"
              backdropFilter="blur(8px)"
              position="relative"
              _before={{
                content: '""',
                position: 'absolute',
                inset: 0,
                bgGradient: `linear(to-r, ${purple400}, ${pink400})`,
                opacity: 0.1,
                borderRadius: 'xl',
                filter: 'blur(2px)',
              }}
            >
              <motion.div
                variants={animations.icon}
                style={{
                  background: `linear-gradient(45deg, ${purple400}, ${pink400})`,
                  width: "70px",
                  height: "70px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "24px",
                  boxShadow: theme.shadows.lg,
                }}
              >
                <Box
                  color="white"
                  fontSize="2xl"
                />
              </motion.div>

              <Heading
                size={isMobile ? "xl" : "2xl"}
                bgGradient={`linear(to-r, ${purple400}, ${pink400})`}
                bgClip="text"
                fontWeight="extrabold"
                letterSpacing="tight"
                textShadow="2px 2px 4px rgba(0,0,0,0.1)"
                transition="all 0.3s ease"
                _hover={{
                  letterSpacing: "wider",
                  transform: "scale(1.01)",
                }}
              >
                {title}
              </Heading>
            </Flex>

            {/* Carousel Section */}
            <Box
              position="relative"
              px={isMobile ? 2 : 6}
              mx={isMobile ? -4 : 0}
              onMouseEnter={() => handleInteraction('enter')}
              onMouseLeave={() => handleInteraction('leave')}
              sx={{
                '& .swiper-slide': {
                  transition: `all ${ANIMATION_DURATION}s cubic-bezier(0.4, 0, 0.2, 1)`,
                  filter: 'brightness(0.7) blur(1px)',
                  transform: 'scale(0.95)',
                },
                '& .swiper-slide-active': {
                  filter: 'brightness(1) blur(0px)',
                  transform: 'scale(1.05)',
                  zIndex: 1,
                  pointerEvents: state.isTransitioning ? 'none' : 'auto',
                },
                '& .swiper-slide-prev, & .swiper-slide-next': {
                  filter: 'brightness(0.85) blur(0.5px)',
                  transform: 'scale(0.98)',
                  pointerEvents: state.isTransitioning ? 'none' : 'auto',
                },
                // Prevent interaction during transitions
                '& .swiper-wrapper': {
                  pointerEvents: state.isTransitioning ? 'none' : 'auto',
                },
                // Improved transition handling
                '& .swiper-slide-transform': {
                  transition: `all ${ANIMATION_DURATION}s cubic-bezier(0.4, 0, 0.2, 1)`,
                },
                // Better visual feedback during transitions
                '& .swiper-slide-shadow-left, & .swiper-slide-shadow-right': {
                  transition: `opacity ${ANIMATION_DURATION}s ease-in-out`,
                },
              }}
            >
              <ErrorBoundary>
                <Swiper
                  {...swiperConfig}
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper;
                    // Initialize swiper with safety checks
                    try {
                      swiper.on('beforeTransitionStart', () => {
                        setState(prev => ({
                          ...prev,
                          isTransitioning: true
                        }));
                      });
                      
                      swiper.on('transitionEnd', () => {
                        // Delay transition end to prevent rapid state changes
                        setTimeout(() => {
                          setState(prev => ({
                            ...prev,
                            isTransitioning: false
                          }));
                        }, 50);
                      });

                      // Handle swiper errors
                    } catch (error) {
                      console.error('Swiper initialization error:', error);
                    }
                  }}
                  onSlideChange={handleSlideChange}
                  // Additional event handlers for better stability
                  onTouchStart={() => {
                    setState(prev => ({
                      ...prev,
                      isInteracting: true
                    }));
                  }}
                  onTouchEnd={() => {
                    setTimeout(() => {
                      setState(prev => ({
                        ...prev,
                        isInteracting: false
                      }));
                    }, TRANSITION_LOCK_TIME);
                  }}
                  // Prevent multiple slide changes during transition
                  allowTouchMove={!state.isTransitioning}
                  // Better touch handling
                  touchStartPreventDefault={true}
                  touchStartForcePreventDefault={true}
                  resistance={true}
                  resistanceRatio={0.85}
                >
                  {renderContent}
                </Swiper>

                <Portal>
                  <AnimatePresence>
                    {!state.isTransitioning && (
                      <>
                        <NavigationButton direction="prev" />
                        <NavigationButton direction="next" />
                      </>
                    )}
                  </AnimatePresence>
                </Portal>

                {/* Error Message Display */}
                {state.error && (
                  <Box
                    position="absolute"
                    bottom={4}
                    left="50%"
                    transform="translateX(-50%)"
                    bg="red.500"
                    color="white"
                    px={4}
                    py={2}
                    borderRadius="md"
                    zIndex={1000}
                  >
                    {state.error}
                  </Box>
                )}
              </ErrorBoundary>
            </Box>
          </Flex>
        </motion.div>
      </AnimatePresence>
    </ErrorBoundary>
  );
};

// Memoize the entire component for better performance
export default React.memo(ContentCarousel, (prevProps, nextProps) => {
  // Custom comparison function to prevent unnecessary re-renders
  return (
    prevProps.title === nextProps.title &&
    prevProps.content === nextProps.content &&
    prevProps.autoplay === nextProps.autoplay &&
    prevProps.interval === nextProps.interval
  );
});