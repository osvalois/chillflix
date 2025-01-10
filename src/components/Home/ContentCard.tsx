import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Portal,
  Tooltip,
  keyframes
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { useParallax } from 'react-scroll-parallax';
import { rgba } from 'polished';
import { DynamicIcon } from '../Movie/Icons';
import GlassmorphicButton from '../Button/GlassmorphicButton';

const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

interface Genre {
  id: number;
  name: string;
}

interface ContentBase {
  id: number;
  title?: string;
  name?: string;
  backdrop_path: string | null;  // Actualizado para aceptar null
  poster_path: string | null;    // Actualizado para aceptar null
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  popularity?: number;
  overview?: string;
  media_type?: 'movie' | 'tv';   // Especificado los tipos literales
  type?: string;
  genres?: Genre[];
  runtime?: number;
  vote_count?: number;
}

interface ContentCardProps {
  content: ContentBase;
  isFavorited?: boolean;
  isActive?: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({
  content,
  isFavorited = false
}) => {
  // Hooks and state
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Parallax configuration
  const { ref: parallaxRef } = useParallax<HTMLDivElement>({
    speed: -10,
    translateY: [-20, 20],
    rotateZ: [-2, 2],
    scale: [0.98, 1.02],
  });

  // Glassmorphic styles
  const glassStyle = useMemo(() => ({
    background: isHovered 
      ? `linear-gradient(135deg, 
          ${rgba(255, 255, 255, 0.15)} 0%, 
          ${rgba(255, 255, 255, 0.08)} 50%,
          ${rgba(255, 255, 255, 0.15)} 100%)`
      : `linear-gradient(135deg, 
          ${rgba(255, 255, 255, 0.1)} 0%, 
          ${rgba(255, 255, 255, 0.05)} 100%)`,
    backdropFilter: `blur(${isHovered ? '12px' : '8px'})`,
    borderRadius: '30px',
    border: `1px solid ${rgba(255, 255, 255, isHovered ? 0.2 : 0.1)}`,
    boxShadow: `
      0 4px 6px ${rgba(0, 0, 0, 0.1)},
      0 1px 3px ${rgba(0, 0, 0, 0.08)},
      inset 0 0 0 1px ${rgba(255, 255, 255, 0.1)},
      ${isHovered ? `
        0 10px 30px ${rgba(0, 0, 0, 0.25)},
        inset 0 0 20px ${rgba(255, 255, 255, 0.05)}
      ` : ''}
    `,
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  }), [isHovered]);

  // Event handlers
  const handleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement favorite functionality
    console.log('Favorite clicked');
  }, []);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement share functionality
    console.log('Share clicked');
  }, []);

  const handlePlay = useCallback(() => {
    const mediaType = content.media_type || content.type || 'movie';
    navigate(`/${mediaType}/${content.id}`);
  }, [content.id, content.media_type, content.type, navigate]);

  // Función auxiliar para manejar las imágenes
  const getImageUrl = (path: string | null) => {
    if (!path) return '/placeholder-image.jpg'; // Asegúrate de tener una imagen por defecto
    return `https://image.tmdb.org/t/p/original${path}`;
  };

  return (
    <motion.div
      ref={cardRef}
      style={glassStyle}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={false}
      animate={{
        scale: isHovered ? 1.03 : 1,
        transition: { duration: 0.3 }
      }}
    >
      <Box
        height="700px"
        position="relative"
        overflow="hidden"
        borderRadius="30px"
      >
        {/* Background with parallax effect */}
        <Box ref={parallaxRef} position="absolute" inset={0}>
          <Box
            position="absolute"
            inset={0}
            bg={`linear-gradient(135deg, 
              ${rgba(0, 0, 0, 0.8)} 0%,
              ${rgba(0, 0, 0, 0.4)} 50%,
              ${rgba(0, 0, 0, 0.8)} 100%)`}
            opacity={0.7}
            style={{ mixBlendMode: 'overlay' }}
          />
          
          {/* Main image */}
          <img
            src={getImageUrl(content.backdrop_path || content.poster_path)}
            alt={content.title || content.name || 'Content'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isHovered ? 'scale(1.1)' : 'scale(1.05)',
              filter: `brightness(${isHovered ? 1.1 : 0.9})
                      contrast(${isHovered ? 1.1 : 1})
                      saturate(${isHovered ? 1.2 : 1})`,
            }}
          />

          {/* Overlay with lighting effects */}
          <Box
            position="absolute"
            inset={0}
            bg={`linear-gradient(
              to bottom,
              transparent 0%,
              ${rgba(0, 0, 0, 0.4)} 50%,
              ${rgba(0, 0, 0, 0.8)} 100%
            )`}
            style={{
              opacity: isHovered ? 0.9 : 0.7,
              transition: 'opacity 0.5s ease-in-out',
            }}
          />
        </Box>

        {/* Main content */}
        <Flex
          position="absolute"
          direction="column"
          justify="flex-end"
          p={8}
          inset={0}
          style={{
            transform: isHovered ? 'translateY(-10px)' : 'translateY(0)',
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Badges and metadata */}
          <Flex justify="space-between" align="center" mb={4}>
            <Flex gap={2}>
              {content.media_type && (
                <Box
                  px={3}
                  py={2}
                  borderRadius="full"
                  bg={rgba(content.media_type === 'movie' ? '#9F7AEA' : '#4FD1C5', 0.9)}
                  color="white"
                  fontSize="sm"
                  fontWeight="bold"
                  style={{
                    backdropFilter: 'blur(4px)',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.3s ease-in-out',
                  }}
                >
                  {content.media_type === 'movie' ? 'Movie' : 'TV Series'}
                </Box>
              )}

              {content.vote_average && (
                <Flex
                  align="center"
                  px={3}
                  py={2}
                  borderRadius="full"
                  bg={rgba(255, 255, 255, 0.1)}
                  style={{
                    backdropFilter: 'blur(4px)',
                  }}
                >
                   <DynamicIcon name="Star" color="#FFD700" size={16} />
                  <Text color="white" fontWeight="bold">
                    {content.vote_average.toFixed(1)}
                  </Text>
                </Flex>
              )}
            </Flex>

            {/* Action buttons */}
            <Flex gap={2}>
              <IconButton
                aria-label="Favorite"
                icon={  <DynamicIcon name="Heart" color="#FFD700" size={16} />}
                variant="ghost"
                colorScheme={isFavorited ? 'red' : 'gray'}
                onClick={handleFavorite}
                style={{
                  background: rgba(255, 255, 255, 0.1),
                  backdropFilter: 'blur(4px)',
                  animation: isFavorited ? `${pulse} 2s infinite` : 'none',
                }}
              />
              <IconButton
                aria-label="Share"
                icon={<DynamicIcon name="Share" color="#FFD700" size={16} />}
                variant="ghost"
                onClick={handleShare}
                style={{
                  background: rgba(255, 255, 255, 0.1),
                  backdropFilter: 'blur(4px)',
                }}
              />
            </Flex>
          </Flex>

          {/* Title and description */}
          <Box mb={6}>
            <Text
              fontSize="3xl"
              fontWeight="bold"
              color="white"
              mb={2}
              style={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {content.title || content.name}
            </Text>
            <Text
              color="gray.200"
              noOfLines={3}
              style={{
                opacity: isHovered ? 1 : 0.8,
                transition: 'all 0.5s ease-in-out',
              }}
            >
              {content.overview}
            </Text>
          </Box>

          {/* Play button */}
          <Flex justify="center">
          <GlassmorphicButton
                          onClick={handlePlay}
              variant="dark"
              size="sm"
              glowIntensity="low"
              glassFrost="light"
              iconPosition="left"
              animated={false}
              soundEnabled={false}
              hoverLift={false}
              pulseEffect={false}
              textGradient={false}
              sx={{
                fontWeight: 'normal',
                fontSize: '14px',
                py: '6px',
                px: '12px',
                minHeight: '32px',
                borderColor: 'rgba(86, 204, 242, 0.2)',
                color: '#56CCF2',
                bg: 'rgba(47, 128, 237, 0.05)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bg: 'rgba(47, 128, 237, 0.15)',
                  borderColor: 'rgba(86, 204, 242, 0.3)',
                },
                '&:active': {
                  bg: 'rgba(47, 128, 237, 0.2)',
                  transform: 'translateY(1px)',
                }
              }}
            >
 Watch Now            </GlassmorphicButton>
           
          </Flex>

          {/* Additional details on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Flex 
                  mt={6} 
                  gap={4} 
                  justify="center"
                  style={{
                    background: rgba(0, 0, 0, 0.3),
                    backdropFilter: 'blur(4px)',
                    borderRadius: '15px',
                    padding: '1rem',
                  }}
                >
                  {/* Date */}
                  {(content.release_date || content.first_air_date) && (
                    <Flex 
                      align="center" 
                      gap={2}
                      style={{
                        background: rgba(255, 255, 255, 0.1),
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                      }}
                    >
                     <DynamicIcon name="Calendar" color="#FFD700" size={16} />
                      <Text color="white">
                        {new Date(content.release_date || content.first_air_date || '').getFullYear()}
                      </Text>
                    </Flex>
                  )}

                  {/* Popularity */}
                  {content.popularity && (
                    <Flex 
                      align="center" 
                      gap={2}
                      style={{
                        background: rgba(255, 255, 255, 0.1),
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                      }}
                    >
                      <DynamicIcon name="User" color="#FFFFFF" size={16} />
                      <Text color="white">
                        {Math.round(content.popularity).toLocaleString()} views
                      </Text>
                    </Flex>
                  )}

                  {/* Genres */}
                  {content.genres && content.genres.length > 0 && (
                    <Flex gap={2} flexWrap="wrap">
                      {content.genres.slice(0, 2).map((genre) => (
                        <Text
                          key={genre.id}
                          color="white"
                          style={{
                            background: rgba(255, 255, 255, 0.15),
                            padding: '0.5rem 1rem',
                            borderRadius: '9999px',
                            fontSize: '0.9rem',
                          }}
                        >
                          {genre.name}
                        </Text>
                      ))}
                    </Flex>
                  )}
                </Flex>
              </motion.div>
            )}
          </AnimatePresence>
        </Flex>

        {/* Tooltip */}
        {isHovered && (
          <Portal>
            <Tooltip
              label={`${content.title || content.name} ${content.vote_average ? `(${content.vote_average.toFixed(1)} ⭐)` : ''}`}
              placement="top"
              bg={rgba(0, 0, 0, 0.8)}
              color="white"
              px={4}
              py={2}
              borderRadius="md"
              fontSize="sm"
              hasArrow
            >
              <Box position="absolute" top={-10} left="50%" transform="translateX(-50%)" />
            </Tooltip>
          </Portal>
        )}
      </Box>
    </motion.div>
  );
};

export default React.memo(ContentCard);