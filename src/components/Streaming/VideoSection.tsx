import React, { Suspense, useMemo, memo, useState, useCallback, lazy } from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { ErrorBoundary } from 'react-error-boundary';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';
import { FloatingButton } from '../Button/CustomButton';

// Dynamic imports optimizados con prioridad de carga
const VideoPlayer = dynamic(() => import('../VideoPlayer/VideoPlayer'), {
  ssr: false,
  loading: () => <LoadingMessage />,
  // Precargar para reducir tiempo de espera
  suspense: true
});

const LoadingMessage = dynamic(() => import('../common/LoadingMessage'), { ssr: true });
const ErrorFallback = dynamic(() => import('../UI/ErrorFallback'), { ssr: true });

// Types
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

// Styles extraídos para evitar re-renderizados
const glassmorphismStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1), inset 0 0 20px rgba(255, 255, 255, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.1)",
  overflow: "hidden",
} as const;

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 }
  }
} as const;

// Componentes Memoizados
const PosterBackground = memo(({ url }: { url: string }) => (
  <>
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bgImage={`url(${url})`}
      bgSize="cover"
      bgPosition="center"
      filter="blur(2px)"
      transform="scale(1.05)"
      opacity={0.7}
    />
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      bg="linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.8))"
    />
  </>
));

PosterBackground.displayName = 'PosterBackground';

const NoSourceMessage = memo(({ 
  hasTriedBackupApi,
  isBackupApiLoading,
  handleBackupApiCall
}: { 
  hasTriedBackupApi: boolean;
  isBackupApiLoading: boolean;
  handleBackupApiCall: () => Promise<void>;
}) => (
  <VStack position="relative" height="100%" justify="center" align="center" spacing={6} px={4}>
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
        <FloatingButton
          onClick={handleBackupApiCall}
          text="Find more options"
          buttonPlacement="top-right"
          buttonVariant="glass"
          buttonSize="sm"
          showIcon={false}
          showGlow={true}
          zIndex={1000}     
        />
      </>
    )}

    {isBackupApiLoading && (
      <Text fontSize="sm" color="gray.300" mt={2} fontStyle="italic">
        This may take a few moments...
      </Text>
    )}
  </VStack>
));

NoSourceMessage.displayName = 'NoSourceMessage';

// Componente Principal
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
  // Intersection Observer optimizado para lazy loading con carga anticipada
  const [ref, inView] = useInView({
    threshold: 0.05, // Reducir threshold para cargar antes
    triggerOnce: true,
    rootMargin: '200px' // Precargar cuando el componente está cerca del viewport
  });

  // Error tracking
  const [hasError, setHasError] = useState(false);
  const handleError = useCallback((error: Error) => {
    setHasError(true);
    console.error('Video section error:', error);
    onError?.(error);
  }, [onError]);

  // Memoized components
  const renderVideoPlayer = useMemo(() => {
    if (!streamUrl || !inView) return null;

    return (
      <Suspense fallback={<LoadingMessage />}>
        <FloatingButton
          onClick={handleBackupApiCall}
          text="Find more options"
          buttonPlacement="top-right"
          buttonVariant="glass"
          buttonSize="sm"
          showIcon={false}
          showGlow={true}
          zIndex={1000}     
        />
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
    streamUrl,
    inView,
    videoJsOptions,
    movie.title,
    handleQualityChange,
    handleLanguageChange,
    qualities,
    languages,
    movie.imdb_id,
    posterUrl,
    handleBackupApiCall
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
      <PosterBackground url={posterUrl} />
      <NoSourceMessage
        hasTriedBackupApi={hasTriedBackupApi}
        isBackupApiLoading={isBackupApiLoading}
        handleBackupApiCall={handleBackupApiCall}
      />
    </Box>
  ), [posterUrl, hasTriedBackupApi, isBackupApiLoading, handleBackupApiCall]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
      resetKeys={[streamUrl]}
    >
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={containerVariants}
      >
        <AnimatePresence mode="wait">
          <Box {...glassmorphismStyle}>
            {isVideoLoading && renderLoadingState}
            {!isVideoLoading && streamUrl && !hasError && renderVideoPlayer}
            {!isVideoLoading && !streamUrl && !hasError && renderNoSourceState}
          </Box>
        </AnimatePresence>
      </motion.div>
    </ErrorBoundary>
  );
});

VideoSection.displayName = 'VideoSection';

export default VideoSection;