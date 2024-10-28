import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, HStack, Text, useColorModeValue } from '@chakra-ui/react';
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

export const NavItemEnhanced: React.FC<NavItemProps> = React.memo(({ 
  item, 
  isActive, 
  isHovered, 
  onClick, 
  onHoverStart, 
  onHoverEnd 
}) => {
  const isHighlighted = isActive || isHovered;
  const textColor = useColorModeValue('gray.700', 'whiteAlpha.900');
  
  return (
    <MotionBox
      variants={itemVariants}
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      onHoverStart={onHoverStart}
      onHoverEnd={onHoverEnd}
      position="relative"
      px={4}
      py={2}
    >
      <AnimatePresence>
        {isHighlighted && (
          <MotionBox
            position="absolute"
            inset={0}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            borderRadius="full"
            bg={item.gradient}
            style={{
              backdropFilter: 'blur(8px)',
              boxShadow: `
                0 4px 15px ${rgba(item.pulseColor, 0.3)},
                0 1px 3px ${rgba(item.pulseColor, 0.2)},
                inset 0 0 0 1px ${rgba(item.pulseColor, 0.1)}
              `
            }}
          />
        )}
      </AnimatePresence>

      <HStack spacing={3} position="relative" zIndex={1}>
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
            style={{
              filter: isHighlighted 
                ? `drop-shadow(0 0 8px ${rgba(item.pulseColor, 0.6)})`
                : 'none'
            }}
          >
            <item.icon size={24} />
          </Box>
        </MotionBox>

        <AnimatePresence>
          <MotionText
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-white text-center font-semibold text-sm tracking-wider whitespace-nowrap overflow-hidden"
            style={{
              textShadow: `0 2px 4px ${rgba(item.pulseColor, 0.3)}`
            }}
          >
            {item.label}
          </MotionText>
        </AnimatePresence>

        {isActive && (
          <Box
            position="absolute"
            bottom="-12px"
            left="50%"
            transform="translateX(-50%)"
            height="3px"
            width="20px"
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
