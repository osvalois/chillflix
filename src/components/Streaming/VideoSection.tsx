import React, { Suspense, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Box, Text, VStack } from '@chakra-ui/react';
import { FiSearch } from 'react-icons/fi';
import { ErrorBoundary } from 'react-error-boundary';
import LoadingMessage from '../common/LoadingMessage';
import VideoPlayer from '../VideoPlayer/VideoPlayer';
import GlassmorphicButton from '../Button/GlassmorphicButton';
import ErrorFallback from '../UI/ErrorFallback';

interface VideoSectionProps {
  isVideoLoading: boolean;
  streamUrl: string | null;
  videoJsOptions: any;
  movie: {
    title: string;
    imdb_id?: string;
  };
  qualities: string[];
  languages: string[];
  handleQualityChange: (quality: string) => void;
  handleLanguageChange: (language: string) => void;
  posterUrl: string;
  hasTriedBackupApi: boolean;
  isBackupApiLoading: boolean;
  handleBackupApiCall: () => Promise<void>;
  currentQuality?: string;
  currentLanguage?: string;
  onError?: (error: Error) => void;
}

const glassmorphismStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow:
    "0 4px 30px rgba(0, 0, 0, 0.1), " +
    "inset 0 0 20px rgba(255, 255, 255, 0.05), " +
    "0 0 0 1px rgba(255, 255, 255, 0.1)",
  overflow: "hidden",
};

const containerVariants = {
  hidden: { 
    opacity: 0,
    y: 20 
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

export const VideoSection: React.FC<VideoSectionProps> = memo(({
  isVideoLoading,
  streamUrl,
  videoJsOptions,
  movie,
  qualities,
  languages,
  handleQualityChange,
  handleLanguageChange,
  posterUrl,
  hasTriedBackupApi,
  isBackupApiLoading,
  handleBackupApiCall,
  onError
}) => {
  const renderVideoPlayer = useMemo(() => {
    if (!streamUrl) return null;

    return (
      <Suspense fallback={<LoadingMessage />}>
        <VideoPlayer
          options={videoJsOptions}
          title={movie.title}
          onQualityChange={handleQualityChange}
          onLanguageChange={handleLanguageChange}
          availableQualities={qualities}
          availableLanguages={languages}
          imdbId={movie.imdb_id || ''}
          posterUrl={posterUrl}
        />
      </Suspense>
    );
  }, [
    streamUrl, videoJsOptions, movie.title, handleQualityChange, handleLanguageChange, 
    qualities, languages, movie.imdb_id, posterUrl
  ]);

  const renderLoadingState = useMemo(() => (
    <Box height="400px" width="100%" display="flex" justifyContent="center" alignItems="center">
      <LoadingMessage />
    </Box>
  ), []);

  const renderNoSourceState = useMemo(() => (
    <Box
      height="400px"
      width="100%"
      position="relative"
      overflow="hidden"
      borderRadius="xl"
    >
      {/* Fondo con efecto de desenfoque */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgImage={`url(${posterUrl})`}
        bgSize="cover"
        bgPosition="center"
        filter="blur(2px)"
        transform="scale(1.05)"
        opacity={0.7}
      />

      {/* Overlay gradiente */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8))"
      />

      {/* Contenido */}
      <VStack
        position="relative"
        height="100%"
        justify="center"
        align="center"
        spacing={6}
        px={4}
      >
        {!hasTriedBackupApi && (
          <>
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              fontWeight="bold"
              color="white"
              bg="rgba(0,0,0,0.5)"
              p={4}
              borderRadius="lg"
              backdropFilter="blur(8px)"
              maxW="md"
              textAlign="center"
              letterSpacing="wide"
            >
              No playback options available at this moment
            </Text>

            <GlassmorphicButton
              onClick={handleBackupApiCall}
              isLoading={isBackupApiLoading}
              loadingText="Searching sources..."
              icon={<FiSearch size={16} />}
              variant="info"
              glowIntensity="none"
              pulseEffect={false}
              size="md"
              animated={true}
              px={6}
              py={4}
              fontSize="md"
              fontWeight="semibold"
              backdropFilter="blur(8px)"
              bg="rgba(255,255,255,0.1)"
              color="white"
              _hover={{
                transform: 'translateY(-1px)',
                bg: 'rgba(255,255,255,0.15)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}
              _active={{
                transform: 'translateY(0)',
                boxShadow: 'none'
              }}
            >
              Try Alternative Source
            </GlassmorphicButton>
          </>
        )}

        {isBackupApiLoading && (
          <Text
            fontSize="sm"
            color="gray.300"
            mt={2}
            fontStyle="italic"
          >
            This may take a few moments...
          </Text>
        )}
      </VStack>
    </Box>
  ), [posterUrl, hasTriedBackupApi, isBackupApiLoading, handleBackupApiCall]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        console.error('Video section error:', error);
        onError?.(error);
      }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Box {...glassmorphismStyle}>
          {isVideoLoading && renderLoadingState}
          {!isVideoLoading && streamUrl && renderVideoPlayer}
          {!isVideoLoading && !streamUrl && renderNoSourceState}
        </Box>
      </motion.div>
    </ErrorBoundary>
  );
});

export default VideoSection;