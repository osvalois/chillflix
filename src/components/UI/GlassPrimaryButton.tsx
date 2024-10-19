import React from 'react';
import { Button, Box, Text, ButtonProps } from '@chakra-ui/react';
import { motion, AnimatePresence, MotionProps } from 'framer-motion';

// Definir el tipo para MotionBox
const MotionBox = motion<Omit<ButtonProps, keyof MotionProps>>(Box as any);

interface GlassPrimaryButtonProps extends Omit<ButtonProps, 'onClick'> {
  icon?: React.ReactElement;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const GlassPrimaryButton: React.FC<GlassPrimaryButtonProps> = ({
  children,
  icon,
  onClick,
  isLoading,
  ...props
}) => {
  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (onClick && !isLoading) {
        onClick(event);
      }
    },
    [onClick, isLoading]
  );

  return (
    <Button
      as={MotionBox}
      leftIcon={icon}
      bg="rgba(0, 200, 255, 0.2)"
      color="white"
      backdropFilter="blur(10px)"
      border="1px solid rgba(255, 255, 255, 0.2)"
      borderRadius="full"
      py={6}
      px={8}
      fontSize="lg"
      fontWeight="bold"
      _hover={{
        bg: "rgba(0, 220, 255, 0.3)",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      }}
      _active={{
        bg: "rgba(0, 180, 255, 0.4)",
        transform: "scale(0.98)",
      }}
      transition="all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      overflow="hidden"
      position="relative"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      isLoading={isLoading}
      _disabled={{
        opacity: 0.6,
        cursor: "not-allowed",
      }}
      {...props}
    >
      <AnimatePresence>
        {!isLoading && (
          <MotionBox
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '120%',
              height: '120%',
              background: 'linear-gradient(225deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 60%)',
              transform: 'translate(-50%, -50%) rotate(25deg)',
              pointerEvents: 'none',
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>
      <Box
        as={motion.div}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%)',
          pointerEvents: 'none',
        }}
        animate={{
          x: ['-100%', '100%'],
        }}
      />
      <Text
        as="span"
        position="relative"
        zIndex={2}
        textShadow="0 2px 10px rgba(0, 0, 0, 0.3)"
      >
        {children}
      </Text>
    </Button>
  );
};