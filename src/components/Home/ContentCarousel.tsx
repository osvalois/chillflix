import React, { useRef, useCallback, useMemo, useState, useEffect } from 'react';
import { Box, Flex, Heading, IconButton, useToken, Portal, useTheme } from '@chakra-ui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, EffectCoverflow, Autoplay, Parallax } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FaFire, FaStar, FaHeart, FaCalendar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import useSound from 'use-sound';
import { useBreakpointValue } from '@chakra-ui/react';
import debounce from 'lodash/debounce';
import ContentCard from './ContentCard';

// Importaciones de estilos
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import 'swiper/css/parallax';

// Tipos mejorados
interface ContentBase {
  id: number;
  title?: string;
  name?: string;
  backdrop_path: string | null;  // Cambiado para aceptar null
  poster_path: string | null;    // Cambiado para aceptar null
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

// Tipo para el contenido combinado que puede venir de diferentes fuentes
export type CombinedContent = ContentBase;

interface ContentCarouselProps {
  title: string;
  content: CombinedContent[]; 
  icon: keyof typeof iconMap;
  autoplay?: boolean;
  interval?: number;
  onSlideChange?: (index: number) => void;
  onCardClick?: (content: CombinedContent) => void;
}

// Constantes y configuraciones
const ANIMATION_DURATION = 0.3;
const iconMap = {
  FaFire,
  FaStar,
  FaHeart,
  FaCalendar,
} as const;

// Animaciones predefinidas
const slideAnimations = {
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
};

const iconAnimations = {
  initial: { rotate: 0 },
  animate: { rotate: 360 },
  transition: { duration: 20, repeat: Infinity, ease: "linear" },
};

const ContentCarousel: React.FC<ContentCarouselProps> = ({ 
  title, 
  icon, 
  content,
  autoplay = true, 
  interval = 3000,
  onSlideChange,
  onCardClick 
}) => {
  // Refs y estados
  const swiperRef = useRef<SwiperType | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  // Hooks
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const theme = useTheme();
  const [purple400, pink400] = useToken('colors', ['purple.400', 'pink.400']);
  
  // Breakpoints responsivos usando Chakra
  const isMobile = useBreakpointValue({ base: true, md: false });
  const isTablet = useBreakpointValue({ md: true, lg: false });
  
  const slidesPerView = useMemo(() => {
    if (isMobile) return 1;
    if (isTablet) return 1.5;
    return 2.5;
  }, [isMobile, isTablet]);

  // Efectos de sonido optimizados
  const [playHover] = useSound('/assets/sounds/hover.mp3', { 
    volume: 0.3,
    soundEnabled: true,
  });
  
  const [playClick] = useSound('/assets/sounds/click.mp3', { 
    volume: 0.4,
    soundEnabled: true,
  });

  // Handlers optimizados
  const handleSlideChange = useCallback((swiper: SwiperType) => {
    const newIndex = swiper.realIndex;
    onSlideChange?.(newIndex);
    playClick();
  }, [onSlideChange, playClick]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    playHover();
  }, [playHover]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  // Configuración de Swiper mejorada
  const swiperParams = useMemo(() => ({
    modules: [Navigation, EffectCoverflow, Autoplay, Parallax],
    spaceBetween: isMobile ? 20 : 30,
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
    autoplay: autoplay && !isHovered ? {
      delay: interval,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    } : false,
    navigation: false,
    grabCursor: true,
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    observer: true,
    observeParents: true,
  }), [autoplay, interval, isMobile, slidesPerView, isHovered]);

  // Componente de navegación optimizado
  const NavButton = useCallback(({ direction }: { direction: 'prev' | 'next' }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
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
        onClick={() => {
          if (!swiperRef.current) return;
          direction === 'prev' 
            ? swiperRef.current.slidePrev() 
            : swiperRef.current.slideNext();
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </motion.div>
  ), [handleMouseEnter, handleMouseLeave, isMobile, theme.shadows.lg]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (swiperRef.current?.autoplay) {
        swiperRef.current.autoplay.stop();
      }
    };
  }, []);

  // Optimización de rendimiento
  const debouncedSlideChange = useMemo(
    () => debounce(handleSlideChange, 100),
    [handleSlideChange]
  );

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="initial"
        animate={inView ? "animate" : "initial"}
        exit="exit"
        variants={slideAnimations}
        transition={{ duration: ANIMATION_DURATION }}
      >
        <Flex 
          direction="column" 
          mb={16}
          position="relative"
        >
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
              variants={iconAnimations}
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
                as={iconMap[icon]}
                color="white"
                fontSize="2xl"
                animation="pulse 2s infinite"
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

          <Box 
            position="relative" 
            px={isMobile ? 2 : 6}
            mx={isMobile ? -4 : 0}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
              },
              '& .swiper-slide-prev, & .swiper-slide-next': {
                filter: 'brightness(0.85) blur(0.5px)',
                transform: 'scale(0.98)',
              }
            }}
          >
            <Swiper
              {...swiperParams}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={debouncedSlideChange}
            >
              {content.map((item: CombinedContent) => (
                <SwiperSlide 
                  key={item.id}
                  data-swiper-parallax="-300"
                >
                   <Box
                      p={4}
                      transition={`all ${ANIMATION_DURATION}s cubic-bezier(0.4, 0, 0.2, 1)`}
                      _hover={{ transform: 'scale(1.02)' }}
                      position="relative"
                      overflow="hidden"
                      onClick={() => onCardClick?.(item)}
                      cursor="pointer"
                      role="group"
                    >
                      <ContentCard 
                        content={item}
                      />
                    </Box>
                </SwiperSlide>
              ))}
            </Swiper>
            
            <Portal>
              <NavButton direction="prev" />
              <NavButton direction="next" />
            </Portal>
          </Box>
        </Flex>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(ContentCarousel);