import React, { useRef, useCallback, useMemo, useState } from 'react';
import { Box, Flex, Heading, IconButton, useToken, Portal } from '@chakra-ui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, EffectCoverflow, Autoplay, Parallax } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useBreakpointValue } from '@chakra-ui/react';
import { useDebounce } from 'use-debounce';
import useSound from 'use-sound';
import ContentCard from './ContentCard';
import { DynamicIcon } from '../Movie/Icons';

// Style imports
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

// Constants
const ANIMATION_DURATION = 0.3;
const SLIDE_CHANGE_DELAY = 300;

const ContentCarousel: React.FC<ContentCarouselProps> = ({
  title,
  content,
  autoplay = false,
  interval = 3000,
  onSlideChange,
  onCardClick,
}) => {
  // Refs
  const swiperRef = useRef<SwiperType | null>(null);
  
  // State
  const [activeIndex, setActiveIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Hooks
  const { ref, inView } = useInView({ threshold: 0.2, triggerOnce: true });
  const [purple400, pink400] = useToken('colors', ['purple.400', 'pink.400']);
  const isMobile = useBreakpointValue({ base: true, md: false });
  const [debouncedIsInteracting] = useDebounce(isInteracting, 100);
  
  // Sound effects
  const [playHover] = useSound('/assets/sounds/hover.mp3', { volume: 0.3 });
  const [playClick] = useSound('/assets/sounds/click.mp3', { volume: 0.4 });

  // Memoized configurations
  const swiperConfig = useMemo(() => ({
    modules: [Navigation, EffectCoverflow, Autoplay, Parallax],
    spaceBetween: 30,
    slidesPerView: isMobile ? 1 : 2.5,
    centeredSlides: true,
    loop: true,
    effect: "coverflow" as const,
    coverflowEffect: {
      rotate: 35,
      stretch: 0,
      depth: 100,
      modifier: 1.5,
      slideShadows: true,
    },
    autoplay: autoplay && !debouncedIsInteracting ? {
      delay: interval,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    } : false,
    grabCursor: true,
    keyboard: { enabled: true },
    preventInteractionOnTransition: true,
    speed: 500,
  }), [autoplay, interval, debouncedIsInteracting, isMobile]);

  // Handlers
  const handleSlideChange = useCallback((swiper: SwiperType) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setActiveIndex(swiper.realIndex);
    onSlideChange?.(swiper.realIndex);
    playClick();

    setTimeout(() => setIsTransitioning(false), SLIDE_CHANGE_DELAY);
  }, [isTransitioning, onSlideChange, playClick]);

  const handleInteraction = useCallback((type: 'enter' | 'leave') => {
    if (isTransitioning) return;
    
    setIsInteracting(type === 'enter');
    type === 'enter' && playHover();
  }, [isTransitioning, playHover]);

  // Navigation component
  const NavigationButton = useCallback(({ direction }: { direction: 'prev' | 'next' }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: ANIMATION_DURATION }}
    >
      <IconButton
        aria-label={`${direction} slide`}
        icon={<DynamicIcon 
          name={direction === 'prev' ? "ChevronLeft" : "ChevronRight"} 
          size={20} 
          style="default" 
        />}
        position="absolute"
        top="50%"
        transform="translateY(-50%)"
        {...(direction === 'prev' ? { left: 4 } : { right: 4 })}
        size={isMobile ? "md" : "lg"}
        variant="ghost"
        colorScheme="whiteAlpha"
        bg="rgba(0, 0, 0, 0.6)"
        backdropFilter="blur(4px)"
        onClick={() => {
          if (!swiperRef.current || isTransitioning) return;
          direction === 'prev' 
            ? swiperRef.current.slidePrev() 
            : swiperRef.current.slideNext();
        }}
        onMouseEnter={() => handleInteraction('enter')}
        onMouseLeave={() => handleInteraction('leave')}
        isDisabled={isTransitioning}
        _hover={{
          bg: "rgba(0, 0, 0, 0.8)",
          transform: "translateY(-50%) scale(1.1)",
        }}
      />
    </motion.div>
  ), [isMobile, isTransitioning, handleInteraction]);

  // Content renderer
  const renderContent = useMemo(() => (
    content.map((item: CombinedContent) => (
      <SwiperSlide key={item.id} data-swiper-parallax="-300">
        <Box
          p={4}
          transition={`all ${ANIMATION_DURATION}s ease`}
          _hover={{ transform: 'scale(1.02)' }}
          position="relative"
          overflow="hidden"
          onClick={() => !isTransitioning && onCardClick?.(item)}
          cursor={isTransitioning ? "wait" : "pointer"}
          role="group"
        >
          <ContentCard
            content={item}
            isActive={activeIndex === content.indexOf(item)}
          />
        </Box>
      </SwiperSlide>
    ))
  ), [content, activeIndex, isTransitioning, onCardClick]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: ANIMATION_DURATION }}
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
            _hover={{ letterSpacing: "wider" }}
          >
            {title}
          </Heading>
        </Flex>

        {/* Carousel */}
        <Box
          position="relative"
          px={isMobile ? 2 : 6}
          mx={isMobile ? -4 : 0}
          onMouseEnter={() => handleInteraction('enter')}
          onMouseLeave={() => handleInteraction('leave')}
          sx={{
            '.swiper-slide': {
              transition: `all ${ANIMATION_DURATION}s ease`,
              filter: 'brightness(0.7)',
              transform: 'scale(0.95)',
            },
            '.swiper-slide-active': {
              filter: 'brightness(1)',
              transform: 'scale(1.05)',
              zIndex: 1,
            },
            '.swiper-slide-prev, .swiper-slide-next': {
              filter: 'brightness(0.85)',
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
            {renderContent}
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

export default React.memo(ContentCarousel);