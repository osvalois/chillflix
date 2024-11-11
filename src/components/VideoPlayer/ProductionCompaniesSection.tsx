import { memo, useState, useCallback } from 'react';
import { Box, Flex, Text, VStack, HStack, Skeleton, useBreakpointValue, useToken } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

import { useInView } from 'react-intersection-observer';
import { useSpring, animated, config } from 'react-spring';
import debounce from 'lodash/debounce';
import { DynamicIcon } from '../Movie/Icons';

// Types
interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

interface ProductionCompaniesSectionProps {
  companies: ProductionCompany[];
  isLoading?: boolean;
}

// Refined animations
const fadeInUp = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -15 },
  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// Enhanced Optimized Image component with better error handling and loading states
const OptimizedImage = memo(({ src, alt, ...props }: { src: string; alt: string; [key: string]: any }) => {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  
  const handleLoad = useCallback(
    debounce(() => setLoadState('loaded'), 100),
    []
  );

  const handleError = useCallback(() => {
    setLoadState('error');
  }, []);

  return (
    <Box position="relative" width="100%" height="100%">
      {loadState === 'loading' && (
        <Skeleton
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          startColor="rgba(255, 255, 255, 0.08)"
          endColor="rgba(255, 255, 255, 0.16)"
          borderRadius="md"
          speed={0.8}
        />
      )}
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: loadState === 'loaded' ? 1 : 0,
          filter: loadState === 'loaded' ? 'brightness(0.9) invert(1)' : 'none'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        loading="lazy"
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        {...props}
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: loadState === 'loaded' ? 1 : 0,
        }}
      />
    </Box>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Refined Company Logo Component with elegant animations and better responsiveness
const ProductionCompanyLogo = memo(({ company }: { company: ProductionCompany }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [gray300] = useToken('colors', ['gray.300']);
  
  const logoSize = useBreakpointValue({
    base: { height: "75px", width: "140px" },
    sm: { height: "85px", width: "160px" },
    md: { height: "95px", width: "180px" },
    lg: { height: "105px", width: "200px" }
  });

  const springProps = useSpring({
    transform: isHovered ? 'scale(1.03) translateY(-4px)' : 'scale(1) translateY(0px)',
    boxShadow: isHovered 
      ? '0 10px 30px -10px rgba(0, 0, 0, 0.3)' 
      : '0 4px 20px -4px rgba(0, 0, 0, 0.1)',
    config: { tension: 300, friction: 20 }
  });

  return (
      <animated.div style={springProps}>
        <Box
          bg="rgba(255, 255, 255, 0.07)"
          backdropFilter="blur(8px)"
          borderRadius="xl"
          p={4}
          height={logoSize?.height}
          width={logoSize?.width}
          display="flex"
          alignItems="center"
          justifyContent="center"
          position="relative"
          overflow="hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          transition="background 0.3s ease"
          _before={{
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: "xl",
            padding: "1px",
            background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {company.logo_path ? (
              <OptimizedImage
                src={`https://image.tmdb.org/t/p/original${company.logo_path}`}
                alt={company.name}
                style={{
                  maxWidth: '85%',
                  maxHeight: '85%',
                  transition: 'all 0.3s ease',
                }}
              />
            ) : (
              <Text 
                color={gray300}
                fontSize={{ base: "xs", sm: "sm", md: "md" }}
                textAlign="center" 
                fontWeight="medium"
                px={3}
                wordBreak="break-word"
                lineHeight="short"
                opacity={0.9}
              >
                {company.name}
              </Text>
            )}
          </motion.div>
        </Box>
      </animated.div>
  );
});

ProductionCompanyLogo.displayName = 'ProductionCompanyLogo';

// Refined Loading Skeleton with subtle animation
const LoadingSkeleton = () => {
  const logoSize = useBreakpointValue({
    base: { height: "75px", width: "140px" },
    sm: { height: "85px", width: "160px" },
    md: { height: "95px", width: "180px" },
    lg: { height: "105px", width: "200px" }
  });

  return (
    <Flex 
      flexWrap="wrap" 
      gap={{ base: 3, sm: 4, md: 5 }} 
      justify={{ base: "center", sm: "flex-start" }} 
      width="100%"
    >
      {[1, 2, 3, 4].map((index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Skeleton
            height={logoSize?.height}
            width={logoSize?.width}
            startColor="rgba(255, 255, 255, 0.08)"
            endColor="rgba(255, 255, 255, 0.16)"
            borderRadius="xl"
            speed={0.8}
          />
        </motion.div>
      ))}
    </Flex>
  );
};

// Main Component with refined animations and better performance
const ProductionCompaniesSection = memo(({ companies, isLoading = false }: ProductionCompaniesSectionProps) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
    rootMargin: '100px',
  });

  const containerAnimation = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(20px)',
    config: { ...config.gentle, tension: 220, friction: 24 }
  });

  if (!companies?.length && !isLoading) return null;

  return (
    <animated.div ref={ref} style={containerAnimation}>
      <VStack
        align="stretch"
        spacing={{ base: 4, md: 6 }}
        width="100%"
        bg="rgba(255, 255, 255, 0.04)"
        backdropFilter="blur(10px) saturate(180%)"
        borderRadius={{ base: "xl", md: "2xl" }}
        boxShadow="0 8px 32px -8px rgba(31, 38, 135, 0.37)"
        border="1px solid rgba(255, 255, 255, 0.1)"
        p={{ base: 4, sm: 5, md: 6, lg: 7 }}
        mx="auto"
        maxWidth="1400px"
        transition="all 0.3s ease"
      >
        <HStack 
          spacing={3}
          borderBottom="1px solid rgba(255, 255, 255, 0.1)"
          pb={3}
          px={1}
        >
          <DynamicIcon name="Building" color="black" size={16} />
          <Text
            bgGradient="linear(to-r, red.400, pink.500)"
            bgClip="text"
            fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
            fontWeight="bold"
            letterSpacing="tight"
          >
            Production Companies
          </Text>
        </HStack>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div {...fadeInUp}>
              <LoadingSkeleton />
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <Flex
                flexWrap="wrap"
                gap={{ base: 3, sm: 4, md: 5 }}
                justify={{ base: "center", sm: "flex-start" }}
                width="100%"
                py={2}
              >
                {companies.map((company) => (
                  <ProductionCompanyLogo 
                    key={company.id} 
                    company={company} 
                  />
                ))}
              </Flex>
            </motion.div>
          )}
        </AnimatePresence>
      </VStack>
    </animated.div>
  );
});

ProductionCompaniesSection.displayName = 'ProductionCompaniesSection';

export default ProductionCompaniesSection;