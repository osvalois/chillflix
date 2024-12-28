import React, { useRef, useCallback, useMemo, useState } from 'react';
import { Box, Flex, Heading, IconButton, useToken, Portal, useTheme } from '@chakra-ui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, EffectCoverflow, Autoplay, Parallax } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useBreakpointValue } from '@chakra-ui/react';
import ContentCard from './ContentCard';
import { DynamicIcon } from '../Movie/Icons';

// Styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import 'swiper/css/parallax';

// Types
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
}

interface ContentCarouselProps {
  title: string;
  content: ContentBase[];
  autoplay?: boolean;
  interval?: number;
  onSlideChange?: (index: number) => void;
  onCardClick?: (content: ContentBase) => void;
}

// Constants
const TRANSITION_DURATION = 300;
const BREAKPOINTS = {
  base: 1,
  md: 1.5,
  lg: 2.5
};

const ContentCarousel: React.FC<ContentCarouselProps> = ({
  title,
  content,
  autoplay = false,
  interval = 3000,
  onSlideChange,
  onCardClick,
}) => {
  // Refs & State
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Hooks
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const theme = useTheme();
  const [purple400, pink400] = useToken('colors', ['purple.400', 'pink.400']);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const slidesPerView = useBreakpointValue(BREAKPOINTS) ?? 1;

  // Memoized Swiper Config
  const swiperConfig = useMemo(() => ({
    modules: [Navigation, EffectCoverflow, Autoplay, Parallax],
    spaceBetween: 30,
    slidesPerView,
    centeredSlides: true,
    loop: true,
    effect: "coverflow",
    coverflowEffect: {
      rotate: 35,
      stretch: 0,
      depth: 100,
      modifier: 1.5,
      slideShadows: true,
    },
    autoplay: autoplay ? {
      delay: interval,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    } : false,
    speed: 500,
    preventInteractionOnTransition: true,
    observer: true,
    observeParents: true,
  }), [autoplay, interval, slidesPerView]);

  // Handlers
  const handleSlideChange = useCallback((swiper: SwiperType) => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setActiveSlide(swiper.realIndex);
      onSlideChange?.(swiper.realIndex);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, TRANSITION_DURATION);
    }
  }, [isTransitioning, onSlideChange]);

  const handleNavigation = useCallback((direction: 'prev' | 'next') => {
    if (swiperRef.current && !isTransitioning) {
      direction === 'prev' 
        ? swiperRef.current.slidePrev() 
        : swiperRef.current.slideNext();
    }
  }, [isTransitioning]);

  // Memoized Navigation Button Component
  const NavigationButton = useCallback(({ direction }: { direction: 'prev' | 'next' }) => (
    <IconButton
      aria-label={`${direction} slide`}
      icon={
        direction === 'prev' 
          ? <DynamicIcon name="ChevronLeft" size={20} style="default" />
          : <DynamicIcon name="ChevronRight" size={20} style="default" />
      }
      position="absolute"
      top="50%"
      transform="translateY(-50%)"
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
      onClick={() => handleNavigation(direction)}
      isDisabled={isTransitioning}
    />
  ), [handleNavigation, isMobile, isTransitioning, theme.shadows.lg]);

  // Memoized Content
  const carouselContent = useMemo(() => (
    content.map((item) => (
      <SwiperSlide key={item.id} data-swiper-parallax="-300">
        <Box
          p={4}
          transition={`all ${TRANSITION_DURATION}ms ease`}
          _hover={{ transform: 'scale(1.02)' }}
          position="relative"
          overflow="hidden"
          onClick={() => !isTransitioning && onCardClick?.(item)}
          cursor={isTransitioning ? "wait" : "pointer"}
          role="group"
        >
          <ContentCard
            content={item}
            isActive={activeSlide === content.indexOf(item)}
          />
        </Box>
      </SwiperSlide>
    ))
  ), [content, activeSlide, isTransitioning, onCardClick]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.3 }}
    >
      <Flex direction="column" mb={16} position="relative">
        {/* Header */}
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
          <Heading
            size={isMobile ? "xl" : "2xl"}
            bgGradient={`linear(to-r, ${purple400}, ${pink400})`}
            bgClip="text"
            fontWeight="extrabold"
            letterSpacing="tight"
          >
            {title}
          </Heading>
        </Flex>

        {/* Carousel */}
        <Box
          position="relative"
          px={isMobile ? 2 : 6}
          mx={isMobile ? -4 : 0}
          sx={{
            '.swiper-slide': {
              transition: `all ${TRANSITION_DURATION}ms ease`,
              filter: 'brightness(0.7) blur(1px)',
              transform: 'scale(0.95)',
            },
            '.swiper-slide-active': {
              filter: 'brightness(1) blur(0px)',
              transform: 'scale(1.05)',
              zIndex: 1,
            },
            '.swiper-slide-prev, .swiper-slide-next': {
              filter: 'brightness(0.85) blur(0.5px)',
              transform: 'scale(0.98)',
            },
          }}
        >
          <Swiper
            {...swiperConfig}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            onSlideChange={handleSlideChange}
          >
            {carouselContent}
          </Swiper>

          <Portal>
            <AnimatePresence>
              {!isTransitioning && (
                <>
                  <NavigationButton direction="prev" />
                  <NavigationButton direction="next" />
                </>
              )}
            </AnimatePresence>
          </Portal>
        </Box>
      </Flex>
    </motion.div>
  );
};

export default React.memo(ContentCarousel, (prevProps, nextProps) => {
  return (
    prevProps.title === nextProps.title &&
    prevProps.content === nextProps.content &&
    prevProps.autoplay === nextProps.autoplay &&
    prevProps.interval === nextProps.interval
  );
});