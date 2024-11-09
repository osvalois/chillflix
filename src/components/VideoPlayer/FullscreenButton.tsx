import React, { useEffect, useState } from 'react';
import { IconButton, useColorModeValue, Box } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { FaExpand, FaCompress } from "react-icons/fa";

interface FullscreenButtonProps {
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
  disabled?: boolean;
  className?: string;
}

const MotionBox = motion(Box as any);

export const FullscreenButton: React.FC<FullscreenButtonProps> = ({
  isFullscreen,
  onFullscreenToggle,
  size = 'sm',
  disabled = false,
  className
}) => {
  // State for handling hover feedback
  const [isHovered, setIsHovered] = useState(false);
  
  // State for handling button press feedback
  const [isPressed, setIsPressed] = useState(false);
  
  // Handle fullscreen browser support
  const [isFullscreenSupported, setIsFullscreenSupported] = useState(true);

  // Dynamic colors based on color mode
  const bgColor = useColorModeValue('whiteAlpha.200', 'blackAlpha.200');
  const hoverBgColor = useColorModeValue('whiteAlpha.300', 'blackAlpha.300');
  const iconColor = useColorModeValue('white', 'gray.200');

  // Check fullscreen support on mount
  useEffect(() => {
    const checkFullscreenSupport = () => {
      const doc = document.documentElement;
      setIsFullscreenSupported(
        !!(doc.requestFullscreen ||
          (doc as any).mozRequestFullScreen ||
          (doc as any).webkitRequestFullscreen ||
          (doc as any).msRequestFullscreen)
      );
    };

    checkFullscreenSupport();
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'f' || event.key === 'F') {
        onFullscreenToggle();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onFullscreenToggle]);

  // Animation variants
  const iconVariants = {
    normal: { scale: 1 },
    hover: { scale: 1.1 },
    pressed: { scale: 0.95 }
  };

  // If fullscreen is not supported, don't render the button
  if (!isFullscreenSupported) return null;

  return (
      <MotionBox
        initial="normal"
        animate={isPressed ? "pressed" : isHovered ? "hover" : "normal"}
        variants={iconVariants}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={className}
      >
        <IconButton
          aria-label={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
          icon={
            <AnimatePresence mode="wait">
              <motion.div
                key={isFullscreen ? "compress" : "expand"}
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
              >
                {isFullscreen ? <FaCompress /> : <FaExpand />}
              </motion.div>
            </AnimatePresence>
          }
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onFullscreenToggle();
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsPressed(false);
          }}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          size={size}
          variant="ghost"
          color={iconColor}
          bg={bgColor}
          _hover={{ bg: hoverBgColor }}
          _active={{ bg: hoverBgColor, transform: 'scale(0.95)' }}
          _focus={{
            boxShadow: 'outline',
            bg: hoverBgColor,
          }}
          disabled={disabled}
          sx={{
            '@media (hover: none)': {
              _hover: {
                bg: bgColor
              }
            }
          }}
        />
      </MotionBox>

  );
};

// Utilidad para manejar el estado de fullscreen en un componente padre
export const useFullscreen = (elementRef: React.RefObject<HTMLElement>) => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === element);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [elementRef]);

  const toggleFullscreen = async () => {
    const element = elementRef.current;
    if (!element) return;

    try {
      if (!isFullscreen) {
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen();
        } else if ((element as any).mozRequestFullScreen) {
          await (element as any).mozRequestFullScreen();
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  return { isFullscreen, toggleFullscreen };
};