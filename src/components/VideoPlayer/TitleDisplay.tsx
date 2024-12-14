import React, { useState, useEffect } from 'react';
import { Box, Text, Flex } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";
import { rgba } from 'polished';
import { useInView } from 'react-intersection-observer';

interface TitleDisplayProps {
  title: string;
  highlight?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'featured' | 'minimal';
  withGlow?: boolean;
  className?: string;
}

const MotionBox = motion(Box as any);
const MotionText = motion(Text as any);

const sizeConfig = {
  sm: {
    fontSize: ['xs', 'sm'],
    glowSize: '10px',
    letterSpacing: '0.5px'
  },
  md: {
    fontSize: ['sm', 'md'],
    glowSize: '15px',
    letterSpacing: '0.7px'
  },
  lg: {
    fontSize: ['md', 'lg', 'xl'],
    glowSize: '20px',
    letterSpacing: '1px'
  },
  xl: {
    fontSize: ['lg', 'xl', '2xl', '3xl'],
    glowSize: '25px',
    letterSpacing: '1.2px'
  }
};

export const TitleDisplay: React.FC<TitleDisplayProps> = ({
  title,
  highlight = false,
  size = 'md',
  variant = 'default',
  withGlow = true,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const [words, setWords] = useState<string[]>([]);

  useEffect(() => {
    setWords(title.split(' '));
  }, [title]);

  const getGradientConfig = (variant: string) => {
    switch (variant) {
      case 'featured':
        return {
          from: rgba('#FF0080', 0.8),
          via: rgba('#FF0080', 0.4),
          to: rgba('#7928CA', 0.8)
        };
      case 'minimal':
        return {
          from: rgba('#FFFFFF', 0.9),
          via: rgba('#FFFFFF', 0.5),
          to: rgba('#FFFFFF', 0.9)
        };
      default:
        return {
          from: rgba('#FFFFFF', 0.95),
          via: rgba('#E2E8F0', 0.8),
          to: rgba('#FFFFFF', 0.95)
        };
    }
  };

  const gradientConfig = getGradientConfig(variant);
  const { fontSize, glowSize, letterSpacing } = sizeConfig[size];

  return (
    <MotionBox
      ref={ref}
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Flex
        direction="row"
        flexWrap="wrap"
        gap={1}
        position="relative"
        zIndex={2}
      >
        <AnimatePresence mode="wait">
          {words.map((word, index) => (
            <MotionText
              key={`${word}-${index}`}
              fontSize={fontSize}
              fontWeight="bold"
              letterSpacing={letterSpacing}
              style={{
                backgroundImage: `linear-gradient(135deg, ${gradientConfig.from} 0%, ${gradientConfig.via} 50%, ${gradientConfig.to} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: withGlow 
                  ? `0 0 ${glowSize} ${rgba(gradientConfig.from, 0.3)}`
                  : 'none',
                whiteSpace: 'nowrap'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              _hover={{
                textShadow: withGlow 
                  ? `0 0 ${glowSize} ${rgba(gradientConfig.from, 0.5)}`
                  : 'none',
              }}
            >
              {word}
            </MotionText>
          ))}
        </AnimatePresence>
      </Flex>

      {/* Backdrop blur effect */}
      {highlight && (
        <MotionBox
          position="absolute"
          top="50%"
          left="50%"
          width="100%"
          height="100%"
          style={{
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle at center, ${rgba(gradientConfig.from, 0.15)} 0%, transparent 70%)`,
            filter: 'blur(20px)',
            zIndex: 1
          }}
          animate={{
            scale: isHovered ? 1.2 : 1,
            opacity: isHovered ? 0.8 : 0.4
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Bottom gradient line */}
      {variant === 'featured' && (
        <MotionBox
          bottom="-2px"
          left="0"
          right="0"
          height="2px"
          background={`linear-gradient(to right, transparent, ${rgba(gradientConfig.from, 0.5)}, transparent)`}
          animate={{
            scaleX: isHovered ? 1.2 : 1,
            opacity: isHovered ? 0.8 : 0.4
          }}
          transition={{ duration: 0.3 }}
        />
      )}
    </MotionBox>
  );
};