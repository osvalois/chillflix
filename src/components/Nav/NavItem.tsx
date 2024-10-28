import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, HStack, Text, useColorModeValue, useBreakpointValue } from '@chakra-ui/react';
import { rgba } from 'polished';
import { itemVariants } from '../../theme/animations';
import { NavItem } from '../../types';
import { DESIGN } from '../../theme/design';

const MotionBox = motion(Box as any);
const MotionText = motion(Text as any);

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  isHovered: boolean;
  onClick: () => void;
  onHoverStart: () => void;
  onHoverEnd: () => void;
}

export const NavItemEnhanced = React.memo(({ 
  item, 
  isActive, 
  isHovered, 
  onClick, 
  onHoverStart, 
  onHoverEnd 
}: NavItemProps) => {
  const isHighlighted = isActive || isHovered;
  const textColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  
  // Usar useBreakpointValue solo para el tamaño del icono
  const iconSize = useBreakpointValue({
    base: 16,
    sm: 18,
    md: 20,
    lg: 24,
    xl: 28
  }) ?? 20; // Valor por defecto si es null
  
  // Configuración estática para otros valores responsive
  const responsiveConfig = {
    paddings: {
      base: '0.25rem',
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
      xl: '1rem'
    },
    spacings: {
      base: '0.25rem',
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.625rem',
      xl: '0.75rem'
    },
    fontSizes: {
      base: 'xs',
      sm: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'xl'
    },
    maxWidths: {
      base: '60px',
      sm: '80px',
      md: '100px',
      lg: '120px',
      xl: '150px'
    }
  };

  const backgroundStyle = {
    backdropFilter: 'blur(8px)',
    boxShadow: `
      0 4px 15px ${rgba(item.pulseColor, 0.3)},
      0 1px 3px ${rgba(item.pulseColor, 0.2)},
      inset 0 0 0 1px ${rgba(item.pulseColor, 0.1)}
    `
  };

  const iconStyle = {
    filter: isHighlighted 
      ? `drop-shadow(0 0 8px ${rgba(item.pulseColor, 0.6)})`
      : 'none',
    transition: 'filter 0.2s ease'
  };

  const textStyle = {
    textShadow: isHighlighted 
      ? `0 2px 4px ${rgba(item.pulseColor, 0.3)}`
      : 'none',
    transition: 'all 0.2s ease'
  };

  return (
    <MotionBox
      variants={itemVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      position="relative"
      px={{ 
        base: responsiveConfig.paddings.base,
        sm: responsiveConfig.paddings.sm,
        md: responsiveConfig.paddings.md,
        lg: responsiveConfig.paddings.lg,
        xl: responsiveConfig.paddings.xl
      }}
      py={{ base: '0.25rem', md: '0.5rem' }}
      role="button"
      aria-pressed={isActive}
      transition="all 0.2s ease"
      _hover={{ transform: 'translateY(-1px)' }}
    >
      <AnimatePresence>
        {isHighlighted && (
          <MotionBox
            position="absolute"
            inset={0}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              transition: { duration: 0.2 }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8,
              transition: { duration: 0.15 }
            }}
            borderRadius="full"
            bg={item.gradient}
            style={backgroundStyle}
          />
        )}
      </AnimatePresence>

      <HStack 
        spacing={{ 
          base: responsiveConfig.spacings.base,
          sm: responsiveConfig.spacings.sm,
          md: responsiveConfig.spacings.md,
          lg: responsiveConfig.spacings.lg,
          xl: responsiveConfig.spacings.xl
        }}
        position="relative" 
        zIndex={1}
        justify="center"
        align="center"
      >
        <MotionBox
          animate={{
            scale: isHighlighted ? 1.1 : 1,
            rotate: isHovered ? 360 : 0
          }}
          transition={{
            duration: DESIGN.animation.duration.normal,
            ease: DESIGN.animation.easing.smooth
          }}
        >
          <Box
            color={isHighlighted ? 'white' : textColor}
            style={iconStyle}
          >
            <item.icon size={iconSize} />
          </Box>
        </MotionBox>

        <AnimatePresence>
          <MotionText
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-white font-semibold tracking-wider whitespace-nowrap overflow-hidden"
            fontSize={{ 
              base: responsiveConfig.fontSizes.base,
              sm: responsiveConfig.fontSizes.sm,
              md: responsiveConfig.fontSizes.md,
              lg: responsiveConfig.fontSizes.lg,
              xl: responsiveConfig.fontSizes.xl
            }}
            style={textStyle}
            maxW={{ 
              base: responsiveConfig.maxWidths.base,
              sm: responsiveConfig.maxWidths.sm,
              md: responsiveConfig.maxWidths.md,
              lg: responsiveConfig.maxWidths.lg,
              xl: responsiveConfig.maxWidths.xl
            }}
            isTruncated
          >
            {item.label}
          </MotionText>
        </AnimatePresence>

        {isActive && (
          <Box
            position="absolute"
            bottom={{ base: '-8px', md: '-12px' }}
            left="50%"
            transform="translateX(-50%)"
            height={{ base: '2px', md: '3px' }}
            width={{ 
              base: '12px',
              sm: '14px',
              md: '16px',
              lg: '18px',
              xl: '20px'
            }}
            borderRadius="full"
            bg={`linear-gradient(to right, ${rgba(item.pulseColor, 0.8)}, ${rgba(item.pulseColor, 0.4)})`}
            boxShadow={`0 0 10px ${rgba(item.pulseColor, 0.4)}, 0 0 5px ${rgba(item.pulseColor, 0.2)}`}
          >
            <Box
              position="absolute"
              inset={0}
              borderRadius="full"
              bg={`linear-gradient(to right, ${rgba(item.pulseColor, 1)}, ${rgba(item.pulseColor, 0.6)})`}
              animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
              opacity={0.6}
            />
          </Box>
        )}
      </HStack>
    </MotionBox>
  );
});

NavItemEnhanced.displayName = 'NavItemEnhanced';