import React, { useRef, useEffect } from 'react';
import { Box, Flex, Heading, Icon, useBreakpointValue, useColorModeValue, Button } from '@chakra-ui/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectCoverflow } from 'swiper/modules';
import { motion, useAnimation } from 'framer-motion';
import { FaFire, FaStar, FaHeart, FaCalendar, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ContentCard from './ContentCard';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import { CombinedContent } from '../../types';

const MotionBox = motion(Box as any);

interface ContentCarouselProps {
  title: string;
  content: CombinedContent[];
  icon: 'FaFire' | 'FaStar' | 'FaHeart' | 'FaCalendar';
}

const ContentCarousel: React.FC<ContentCarouselProps> = ({ title, content, icon }) => {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const swiperRef = useRef<any>(null);
  const controls = useAnimation();

  const bgGradient = useColorModeValue(
    'linear(to-r, purple.400, pink.400)',
    'linear(to-r, purple.600, pink.600)'
  );

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'FaFire': return FaFire;
      case 'FaStar': return FaStar;
      case 'FaHeart': return FaHeart;
      case 'FaCalendar': return FaCalendar;
      default: return FaFire;
    }
  };

  useEffect(() => {
    controls.start({ opacity: 1, y: 0 });
  }, [controls]);

  const CustomNavButton: React.FC<{ direction: 'prev' | 'next' }> = ({ direction }) => (
    <Button
      position="absolute"
      top="50%"
      transform="translateY(-50%)"
      zIndex={2}
      {...(direction === 'prev' ? { left: 0 } : { right: 0 })}
      w="50px"
      h="100px"
      borderRadius="md"
      bg="rgba(0, 0, 0, 0.5)"
      _hover={{ bg: "rgba(0, 0, 0, 0.7)" }}
      onClick={() => direction === 'prev' ? swiperRef.current?.slidePrev() : swiperRef.current?.slideNext()}
    >
      <Icon as={direction === 'prev' ? FaChevronLeft : FaChevronRight} color="white" boxSize={6} />
    </Button>
  );

  const handleContentSelect = (selectedContent: CombinedContent) => {
    console.log('Selected content:', selectedContent);
    // Implement your logic here for handling the selected content
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={controls}
      transition={{ duration: 0.5, ease: "easeOut" }}
      mb={16}
    >
      <Flex align="center" mb={6}>
        <Box
          bg={bgGradient}
          w="60px"
          h="60px"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mr={4}
        >
          <Icon as={getIcon(icon)} color="white" boxSize={8} />
        </Box>
        <Heading 
          size="2xl" 
          bgGradient={bgGradient} 
          bgClip="text"
          fontWeight="extrabold"
        >
          {title}
        </Heading>
      </Flex>
      <Box position="relative" px={4}>
        <Swiper
          modules={[Navigation, EffectCoverflow]}
          spaceBetween={30}
          slidesPerView={isMobile ? 1 : 1.5}
          centeredSlides={true}
          loop={true}
          effect="coverflow"
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          navigation={{
            prevEl: '.swiper-button-prev',
            nextEl: '.swiper-button-next',
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
        >
          {content.map((item) => (
            <SwiperSlide key={item.id}>
              <Box p={4}>
                <ContentCard content={item} onSelect={() => handleContentSelect(item)} />
              </Box>
            </SwiperSlide>
          ))}
        </Swiper>
        <CustomNavButton direction="prev" />
        <CustomNavButton direction="next" />
      </Box>
    </MotionBox>
  );
};

export default ContentCarousel;