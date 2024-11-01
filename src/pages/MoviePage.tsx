import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import { Box, Container, VStack, useToast, Button, Skeleton, Text } from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronLeft } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';
import { ErrorBoundary } from 'react-error-boundary';
import { useInView } from 'react-intersection-observer';

import { getTMDBMovieDetails, getMovieCredits, getSimilarMovies } from '../services/tmdbService';
import movieService, { Mirror, MovieInfo } from '../services/movieService';
import { CombinedContent, MovieCredits } from '../types';

import VideoPlayer from '../components/VideoPlayer/VideoPlayer';
import MovieHeader from '../components/Movie/MovieHeader';
import CastSection from '../components/Movie/CastSection';
import SimilarMoviesSection from '../components/Movie/SimilarMoviesSection';
import ErrorFallback from '../components/UI/ErrorFallback';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ReviewSection from '../components/ReviewSection/ReviewSection';

import { useVideoPlayerLogic } from '../hooks/useVideoPlayerLogic';
import { useMirrorLogic } from '../hooks/useMirrorLogic';

import { CreateWatchParty } from '../components/WatchParty/CreateWatchParty';
import { InviteFriends } from '../components/WatchParty/InviteFriends';
import { JoinWatchParty } from '../components/WatchParty/JoinWatchParty';
import { ChatRoom } from '../components/WatchParty/ChatRoom';
import LoadingMessage from '../components/common/LoadingMessage';
import ToggleWatchPartyButton from '../components/WatchParty/ToggleWatchPartyButton';
import { GlassmorphicButton } from '../components/Button/GlassmorphicButton';
import { FiSearch } from 'react-icons/fi';

const MotionBox = motion(Box as any);

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

interface GroupedMirrors {
  [key: string]: {
    [key: string]: Mirror[];
  };
}

const MoviePage: React.FC = () => {
  const { tmdbId } = useParams<{ tmdbId: string }>();
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [watchPartyId, setWatchPartyId] = useState<string | null>(null);
  const [hasJoined, setHasJoined] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [isVisible, setIsVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedQuality, setSelectedQuality] = useState('');
  const [isBackupApiLoading, setIsBackupApiLoading] = useState(false);
  const [hasTriedBackupApi, setHasTriedBackupApi] = useState(false);
  const queryClient = useQueryClient();

  const {
    currentMirrorIndex,
    isChangingMirror,
    handleChangeMirror,
  } = useMirrorLogic();

  const {
    isPlaying,
    currentQuality,
    handleQualityChange,
  } = useVideoPlayerLogic();
  useEffect(() => {
    // Invalidar todas las queries relacionadas cuando cambia el tmdbId
    queryClient.invalidateQueries(['movie', tmdbId]);
    queryClient.invalidateQueries(['mirrors', tmdbId]);
    queryClient.invalidateQueries(['movieInfo']);
    queryClient.invalidateQueries(['backupMovieInfo']);
    
    // Reset estados locales
    setSelectedLanguage('');
    setSelectedQuality('');
  }, [tmdbId, queryClient]);
  // Fetch current user ID (you'll need to implement this based on your auth system)
  const { data: userId } = useQuery('userId', () => "movieService.getCurrentUserId()");

  const fetchMovieDetails = async (id: string): Promise<CombinedContent> => {
    try {
      console.log("fetchMovieDetails")
      console.log(id)
      const tmdbData = await getTMDBMovieDetails(parseInt(id, 10));
      console.log("tmdbData")
      console.log(tmdbData)
      if (tmdbData && Object.keys(tmdbData).length > 0) {
        return tmdbData;
      } else {
        throw new Error('No TMDB data available or empty result');
      }
    } catch (error) {
      console.error('Error fetching movie details from TMDB:', error);
      throw error;
    }
  };
  console.log("tmdbId")
  console.log(tmdbId)
  const { data: movie, isLoading: isMovieLoading, error: movieError } = useQuery<CombinedContent, Error>(
    ['movie', tmdbId],
    () =>  fetchMovieDetails(tmdbId!),
    {
      enabled: !!tmdbId,
      onError: (error) => {
        console.error('Error fetching movie details:', error);
        toast({
          title: "Error",
          description: "We're having trouble loading the movie details. Please try again later.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );

  const { data: credits, isLoading: isCreditsLoading } = useQuery<MovieCredits, Error>(
    ['credits', tmdbId],
    () => getMovieCredits(parseInt(tmdbId!, 10)),
    {
      enabled: !!tmdbId,
      onError: (error) => {
        console.error('Error fetching movie credits:', error);
      }
    }
  );

  const { data: similarMovies, isLoading: isSimilarMoviesLoading } = useQuery<CombinedContent[], Error>(
    ['similarMovies', tmdbId],
    () => getSimilarMovies(parseInt(tmdbId!, 10)),
    {
      enabled: !!tmdbId,
      onError: (error) => {
        console.error('Error fetching similar movies:', error);
      }
    }
  );

  const { data: mirrors, isLoading: isMirrorsLoading } = useQuery<Mirror[], Error>(
    ['mirrors', tmdbId],
    () => movieService.searchMirrors(tmdbId ?? ''),
    {
      enabled: !!movie,
      staleTime: 0, // Forzar revalidación
      cacheTime: 0, // No mantener en caché
      retry: 2,     // Intentar 2 veces si falla
      onError: (error) => {
        console.error('Error fetching mirrors:', error);
        toast({
          title: "Playback Options Unavailable",
          description: "We couldn't load the playback options. Please try again later.",
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );

  const groupedMirrors = useMemo<GroupedMirrors>(() => {
    if (!mirrors) return {};
    
    return mirrors.reduce((acc, mirror) => {
      // Usamos valores por defecto para language y quality si no existen
      const language = mirror.language || 'unknown';
      const quality = mirror.quality || 'unknown';
      const seeds = mirror.seeds || 0; // Aseguramos que seeds tenga un valor por defecto
      
      // Inicializamos las estructuras si no existen
      if (!acc[language]) {
        acc[language] = {};
      }
      if (!acc[language][quality]) {
        acc[language][quality] = [];
      }
      
      // Añadimos el mirror al array correspondiente
      acc[language][quality].push({
        ...mirror,
        language,
        quality,
        seeds
      });
      
      // Ordenamos el array por seeds de mayor a menor
      acc[language][quality].sort((a, b) => (b.seeds || 0) - (a.seeds || 0));
      
      return acc;
    }, {} as GroupedMirrors);
   
  }, [mirrors]);

  const languages = useMemo(() => {
    return Object.keys(groupedMirrors);
  }, [groupedMirrors]);
  
  const qualities = useMemo(() => {
    // Si hay un lenguaje seleccionado, retornamos las calidades de ese lenguaje
    if (selectedLanguage && groupedMirrors[selectedLanguage]) {
      return Object.keys(groupedMirrors[selectedLanguage]);
    }
  
    // Si no hay lenguaje seleccionado, obtenemos todas las calidades únicas
    const allQualities = new Set<string>();
    
    Object.values(groupedMirrors).forEach(languageGroup => {
      Object.keys(languageGroup).forEach(quality => {
        allQualities.add(quality);
      });
    });
  
    return Array.from(allQualities);
  }, [groupedMirrors, selectedLanguage]);
  
  const selectedMirror = useMemo(() => {
    // Si no hay mirrors agrupados, retornamos null
    if (Object.keys(groupedMirrors).length === 0) return null;
  
    // Si no hay lenguaje seleccionado, tomamos el primer lenguaje disponible
    const language = selectedLanguage || Object.keys(groupedMirrors)[0];
    
    // Si no hay calidad seleccionada, tomamos la primera calidad disponible
    const quality = selectedQuality || qualities[0];
  
    // Si tenemos lenguaje y calidad, intentamos obtener el primer mirror
    if (language && quality && groupedMirrors[language]?.[quality]?.length > 0) {
      return groupedMirrors[language][quality][0];
    }
  
    // Si no encontramos un mirror con la combinación específica,
    // buscamos el primer mirror disponible en cualquier combinación
    for (const lang of Object.keys(groupedMirrors)) {
      for (const qual of qualities) {
        if (groupedMirrors[lang][qual]?.length > 0) {
          return groupedMirrors[lang][qual][0];
        }
      }
    }
  
    return null;
  }, [groupedMirrors, selectedLanguage, selectedQuality, qualities]);
  console.log(selectedMirror)
  console.log("selectedMirror")
  const { data: movieInfo, isLoading: isMovieInfoLoading } = useQuery<MovieInfo, Error>(
    ['movieInfo', selectedMirror?.infoHash],
    () => movieService.getMovieInfo(selectedMirror!.infoHash),
    {
      enabled: !!selectedMirror,
      staleTime: 0,
      cacheTime: 0,
      retry: 2,
      onSettled: () => {
        // Actualizar el estado cuando la query se complete (éxito o error)
        setIsVideoLoading(false);
      }
    }
  );
    // Agregar un efecto para manejar la selección automática de language/quality
    useEffect(() => {
      if (mirrors && mirrors.length > 0 && !selectedLanguage) {
        const firstMirror = mirrors[0];
        setSelectedLanguage(firstMirror.language);
        setSelectedQuality(firstMirror.quality);
      }
    }, [mirrors, selectedLanguage]);

  const { data: backupMovieInfo, isLoading: isBackupMovieInfoLoading } = useQuery<MovieInfo, Error>(
    ['backupMovieInfo', tmdbId],
    () => axios.get(`https://chillflix-movie-importer.fly.dev/api/movie/${tmdbId}`).then(res => res.data),
    {
      enabled: !!movieError || (!!movieInfo && (!movieInfo.Files || movieInfo.Files.length === 0)),
      retry: false,
      onError: (error) => {
        console.error('Error fetching backup movie info:', error);
        toast({
          title: 'Playback Error',
          description: 'We encountered an issue preparing your video. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  );

  const finalMovieInfo = useMemo(() => {
    return backupMovieInfo || movieInfo;
  }, [backupMovieInfo, movieInfo]);

  const videoFile = useMemo(() => {
    if (finalMovieInfo) {
      return movieService.findVideoFile(finalMovieInfo);
    }
    return null;
  }, [finalMovieInfo]);

  const streamUrl = useMemo(() => {
    if (!finalMovieInfo || !videoFile) {
      return null;
    }
    
    try {
      return movieService.getStreamUrl(videoFile.infoHash, videoFile.index);
    } catch (error) {
      console.error('Error generating stream URL:', error);
      return null;
    }
  }, [finalMovieInfo, videoFile]);

  console.log("streamUrl")
  console.log(streamUrl)

  const posterUrl = useMemo(() => {
    return movie ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '';
  }, [movie]);

  const videoJsOptions = useMemo(() => ({
    sources: [{ src: streamUrl ?? "", type: "video/mp4" }],
  }), [streamUrl]);

  useEffect(() => {
    setIsVideoLoading(isMirrorsLoading || isMovieInfoLoading || isBackupMovieInfoLoading);
  }, [isMirrorsLoading, isMovieInfoLoading, isBackupMovieInfoLoading]);

  useEffect(() => {
    if (languages.length > 0 && !selectedLanguage) {
      setSelectedLanguage(languages[0]);
    }
  }, [languages, selectedLanguage]);

  useEffect(() => {
    if (qualities.length > 0 && !selectedQuality) {
      setSelectedQuality(qualities[0]);
    }
  }, [qualities, selectedQuality]);

  const [headerRef, headerInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [castRef, castInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [similarRef, similarInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [reviewRef, reviewInView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const handleLanguageChange = (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    setSelectedQuality('');
  };

  const handleQualityChangeWrapper = (newQuality: any) => {
    setSelectedQuality(newQuality);
    handleQualityChange(newQuality);
  };

  const handleCreateWatchParty = (newPartyId: string) => {
    setWatchPartyId(newPartyId);
    setHasJoined(true);
    toast({
      title: "Watch Party Created",
      description: `Your Watch Party ID is: ${newPartyId}`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  const handleJoinWatchParty = () => {
    setHasJoined(true);
    toast({
      title: "Joined Watch Party",
      description: "You've successfully joined the Watch Party!",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  if (isMovieLoading) {
    return <LoadingSkeleton />;
  }

  if (movieError) {
    return <ErrorFallback error={movieError} resetErrorBoundary={() => navigate('/')} />;
  }

  if (!movie) {
    return <ErrorFallback error={new Error("Movie not found")} resetErrorBoundary={() => navigate('/')} />;
  }
  // Separate function to handle backup API call
  const handleBackupApiCall = async () => {
    if (!tmdbId || isBackupApiLoading) return;
  
    const MAX_RETRIES = 2;
    let currentTry = 0;
    let lastError: any = null;
  
    setIsBackupApiLoading(true);
  
    const attemptCall = async (): Promise<any> => {
      try {
        const response = await axios.get(
          `https://chillflix-movie-importer.fly.dev/api/movie/${tmdbId}`,
          { timeout: 60000 } // 10 segundos de timeout
        );
  
        if (response.data) {
          setHasTriedBackupApi(true);
          const backupData = response.data;
          // Handle the backup data here
          toast({
            title: "Success",
            description: "Alternative source found!",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          return backupData;
        }
        throw new Error('Empty response data');
      } catch (error: any) {
        lastError = error;
        throw error;
      }
    };
  
    while (currentTry <= MAX_RETRIES) {
      try {
        const data = await attemptCall();
        setIsBackupApiLoading(false);
        return data;
      } catch (error: any) {
        currentTry++;
        
        // Si no es el último intento, mostrar mensaje de reintento
        if (currentTry <= MAX_RETRIES) {
          toast({
            title: "Retrying...",
            description: `Attempt ${currentTry} of ${MAX_RETRIES}`,
            status: "info",
            duration: 3000,
            isClosable: true,
          });
          
          // Esperar antes de reintentar (tiempo exponencial)
          await new Promise(resolve => setTimeout(resolve, 1000 * currentTry));
        } else {
          // Si es el último intento fallido, mostrar error final
          console.error('Error fetching from backup API:', lastError);
          
          const errorMessage = lastError?.response?.status === 404
            ? "No alternative source available for this content"
            : lastError?.code === 'ECONNABORTED'
              ? "Connection timed out. Please try again"
              : "Could not find alternative source";
  
          toast({
            title: "Error",
            description: errorMessage,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    }
  
    setIsBackupApiLoading(false);
  };

  // Modify the video player section to include the backup API button
  const renderVideoSection = () => {
    if (isVideoLoading) {
      return (
        <Box height="400px" width="100%" display="flex" justifyContent="center" alignItems="center">
          <LoadingMessage />
        </Box>
      );
    }

    if (streamUrl) {
      return (
        <Suspense fallback={<Skeleton height="400px" width="100%" />}>
          <VideoPlayer
            options={videoJsOptions}
            title={movie.title}
            onQualityChange={handleQualityChangeWrapper}
            onLanguageChange={handleLanguageChange}
            availableQualities={qualities}
            availableLanguages={languages}
            imdbId={movie.imdb_id || ''}
            posterUrl={posterUrl}
          />
        </Suspense>
      );
    }

    return (
<Box
  height="400px"
  width="100%"
  position="relative"
  overflow="hidden"
  borderRadius="xl"
>
  {/* Capa de imagen de fondo con efecto de desenfoque */}
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

  {/* Contenedor de contenido */}
  <Box
    position="relative"
    height="100%"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    gap={6}
    px={4}
    textAlign="center"
  >
    {/* Mensaje principal */}
    <Text
      fontSize={{ base: "lg", md: "xl" }}
      fontWeight="bold"
      color="white"
      bg="rgba(0,0,0,0.5)"
      p={4}
      borderRadius="lg"
      backdropFilter="blur(8px)"
      maxW="md"
      letterSpacing="wide"
    >
      No playback options available at this moment
    </Text>

    {/* Botón de búsqueda alternativa */}
    {!hasTriedBackupApi && (
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
  
    )}

    {/* Mensaje de carga */}
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
  </Box>
</Box>
    );
  };

  return (
    <Box
      minHeight="100vh"
      bgImage={`linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`}
      bgSize="cover"
      bgPosition="center"
      bgAttachment="fixed"
      color="white"
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Container maxW="container.xl" py={8}>
            <VStack spacing={8} align="stretch">
              <Button
                leftIcon={<FaChevronLeft />}
                onClick={() => navigate(-1)}
                position="fixed"
                top={12}
                left={4}
                zIndex={10}
                bg="rgba(255, 255, 255, 0.1)"
                backdropFilter="blur(5px)"
                _hover={{
                  bg: "rgba(255, 255, 255, 0.2)",
                  transform: "scale(1.05)"
                }}
                transition="all 0.3s ease"
              >
                Back
              </Button>

              {/* Video Player */}
              <MotionBox
                {...glassmorphismStyle}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {isVideoLoading ? (
                  <Box height="400px" width="100%" display="flex" justifyContent="center" alignItems="center">
                    <LoadingMessage />
                  </Box>
                ) : streamUrl ? (
                  <Suspense fallback={<Skeleton height="400px" width="100%" />}>
                    <VideoPlayer
                      options={videoJsOptions}
                      title={movie.title}
                      onQualityChange={handleQualityChangeWrapper}
                      onLanguageChange={handleLanguageChange}
                      availableQualities={qualities}
                      availableLanguages={languages}
                      imdbId={movie.imdb_id || ''} posterUrl={''} />
                  </Suspense>
                ) : (
                  <Box
                    height="400px"
                    width="100%"
                    bgImage={`url(${posterUrl})`}
                    bgSize="cover"
                    bgPosition="center"
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    {renderVideoSection()}
                  </Box>
                )}
              </MotionBox>

              {/* Watch Party Section */}
              <MotionBox
                {...glassmorphismStyle}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                p={4}
              >
                <div className="w-full space-y-4">
                  <ToggleWatchPartyButton
                    isVisible={isVisible}
                    onToggle={() => setIsVisible(!isVisible)}
                  />
                  {isVisible && (
                    <div className="space-y-4">
                      {!watchPartyId && !hasJoined && (
                        <div className="flex justify-between items-center space-x-4">
                          <CreateWatchParty
                            movieId={movie.imdb_id ?? ""}
                            movieTitle={movie.title ?? ""}
                            movieDuration={movie.runtime}
                            movieThumbnail={movie.backdrop_path ?? ""}
                            onWatchPartyCreated={handleCreateWatchParty}
                            onCancel={() => {
                              console.log('Cancelled');
                            }}
                          />
                        </div>
                      )}

                      {!watchPartyId && !hasJoined && (
                        <div className="flex justify-between items-center space-x-4">
                          <JoinWatchParty
                            partyId="party-123"
                            movieTitle={movie.title ?? ""}
                            hostName="John Doe"
                            startTime={new Date('2024-10-29T20:00:00')}
                            maxParticipants={10}
                            currentParticipants={5}
                            onJoin={handleJoinWatchParty}
                            onCancel={() => {
                              console.log('Cancelled');
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {watchPartyId && (
                  <VStack spacing={4} align="stretch">
                    <Text>Watch Party ID: {watchPartyId}</Text>
                    <InviteFriends partyId={watchPartyId} />
                  </VStack>
                )}
                {hasJoined && userId && (
                  <Box mt={4}>
                    <ChatRoom partyId={watchPartyId || ''} userId={userId} />
                  </Box>
                )}
              </MotionBox>

              {/* Movie Header */}
              <motion.div
                ref={headerRef}
                initial={{ opacity: 0, y: 20 }}
                animate={headerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
              >
                <Suspense fallback={<Skeleton height="200px" />}>
                  <MovieHeader
                    movie={movie}
                    onTrailerPlay={() => { }}
                    isMobile={isMobile}
                    isLoading={false}
                    onChangeMirror={handleChangeMirror}
                    isChangingMirror={isChangingMirror}
                    currentMirrorIndex={currentMirrorIndex}
                    totalMirrors={mirrors?.length ?? 0}
                    onOpenQualitySelector={() => { }}
                    isPlaying={isPlaying}
                    currentQuality={currentQuality}
                  />
                </Suspense>
              </motion.div>
              {/* Similar Movies Section */}
              <motion.div
                ref={similarRef}
                initial={{ opacity: 0, y: 20 }}
                animate={similarInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
              >        <Text fontSize="2xl" fontWeight="bold" mb={6} bgGradient="linear(to-r, cyan.400, blue.500, purple.600)" bgClip="text">
                  Similar Movies
                </Text>
                {similarMovies && (
                  <Suspense fallback={<Skeleton height="200px" />}>
                    <SimilarMoviesSection movies={similarMovies} isLoading={isSimilarMoviesLoading} />
                  </Suspense>
                )}
              </motion.div>
              {/* Cast Section */}
              <motion.div
                ref={castRef}
                initial={{ opacity: 0, y: 20 }}
                animate={castInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
              >
                {credits && (
                  <Suspense fallback={<Skeleton height="200px" />}>
                    <CastSection cast={credits.cast} isLoading={isCreditsLoading} />
                  </Suspense>
                )}
              </motion.div>
              {/* Review Section */}
              <motion.div
                ref={reviewRef}
                initial={{ opacity: 0, y: 20 }}
                animate={reviewInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
              >
                <Suspense fallback={<Skeleton height="200px" />}>
                  <ReviewSection movieId={tmdbId ?? ''} />
                </Suspense>
              </motion.div>
            </VStack>
          </Container>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

const MoviePageWrapper: React.FC = () => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <MoviePage />
    </ErrorBoundary>
  );
};

export default MoviePageWrapper;