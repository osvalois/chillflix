import React, { useState, useCallback, useMemo } from "react";
import { Box, HStack, Link, Text, useColorModeValue, useTheme } from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from "@lottiefiles/react-lottie-player";
import { useSpring, animated } from 'react-spring';
import { rgba, lighten, darken } from 'polished';
import { useInView } from 'react-intersection-observer';
import { debounce } from 'lodash';

// Importa los archivos JSON de Lottie para los iconos
import playIcon from './lottie/videos.json';
import heartIcon from './lottie/love.json';

const MotionBox = motion(Box as any);
const AnimatedHStack = animated(HStack);

interface MenuItem {
  name: string;
  icon: any;
  path: string;
}

const menuItems: MenuItem[] = [
  { name: "Inicio", icon: playIcon, path: "/" },
  { name: "Mi Lista", icon: heartIcon, path: "/mi-lista" },
];

const Navigation: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.1)', 'rgba(0, 0, 0, 0.2)');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBgColor = useColorModeValue('whiteAlpha.300', 'whiteAlpha.200');
  const activeBgColor = useColorModeValue('whiteAlpha.400', 'whiteAlpha.300');
  const borderColor = useColorModeValue(
    rgba(theme.colors.gray[200], 0.3),
    rgba(theme.colors.whiteAlpha[300], 0.3)
  );

  const glassMorphismStyle = useMemo(() => ({
    background: bgColor,
    backdropFilter: 'blur(10px)',
    boxShadow: `0 8px 32px 0 ${rgba(theme.colors.gray[700], 0.37)}`,
    border: '1px solid',
    borderColor: borderColor,
  }), [bgColor, borderColor, theme.colors.gray]);

  const springProps = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0)' : 'translateY(20px)',
    config: { mass: 1, tension: 280, friction: 60 },
  });

  const handleHover = useCallback(
    debounce((name: string | null) => {
      setHoveredItem(name);
    }, 50),
    []
  );

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <AnimatedHStack
      ref={ref}
      spacing={2}
      p={3}
      borderRadius="full"
      {...glassMorphismStyle}
      style={springProps}
    >
      <AnimatePresence>
        {menuItems.map((item, index) => (
          <MotionBox
            key={item.name}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Link
              as={RouterLink}
              to={item.path}
              px={4}
              py={2}
              display="flex"
              alignItems="center"
              borderRadius="full"
              bg={location.pathname === item.path ? activeBgColor : 'transparent'}
              color={textColor}
              transition="all 0.3s"
              _hover={{ bg: hoverBgColor }}
              onMouseEnter={() => handleHover(item.name)}
              onMouseLeave={() => handleHover(null)}
            >
              <Box width="24px" height="24px" mr={2}>
                <Player
                  autoplay={hoveredItem === item.name || location.pathname === item.path}
                  loop={hoveredItem === item.name}
                  src={item.icon}
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
              <Text fontSize="sm" fontWeight="medium">
                {item.name}
              </Text>
            </Link>
          </MotionBox>
        ))}
      </AnimatePresence>
    </AnimatedHStack>
  );
};

export default Navigation;