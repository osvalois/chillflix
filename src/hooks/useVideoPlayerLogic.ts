import { useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import { VideoQuality } from '../services/movieService';

export const useVideoPlayerLogic = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuality, setCurrentQuality] = useState<VideoQuality>('1080p');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCaptions, setShowCaptions] = useState(false);

  const toast = useToast();

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleDurationChange = useCallback((newDuration: number) => {
    setDuration(newDuration);
  }, []);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const handleToggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? 'Removed from Favorites' : 'Added to Favorites',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [isFavorite, toast]);

  const handleShare = useCallback(() => {
    navigator.share({
      title: 'Shared Movie',
      text: 'Check out this movie!',
      url: window.location.href,
    }).then(() => {
      toast({
        title: 'Shared Successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }).catch((error) => {
      console.error('Error sharing:', error);
      toast({
        title: 'Share Failed',
        description: 'Unable to share the movie at this time.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    });
  }, [toast]);

  const handleDownload = useCallback(() => {
    toast({
      title: 'Download Started',
      description: 'Your download will begin shortly.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  const handleToggleCaptions = useCallback(() => {
    setShowCaptions(!showCaptions);
  }, [showCaptions]);

  const handleQualityChange = useCallback((quality: VideoQuality) => {
    setCurrentQuality(quality);
    toast({
      title: 'Quality Changed',
      description: `Video quality set to ${quality}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  }, [toast]);

  const handleVideoError = useCallback((error: any) => {
    console.error('Video playback error:', error);
    toast({
      title: 'Playback Error',
      description: 'There was an error playing the video. Please try again.',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  }, [toast]);

  return {
    isPlaying,
    setIsPlaying,
    currentQuality,
    setCurrentQuality,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    isFullscreen,
    setIsFullscreen,
    isFavorite,
    setIsFavorite,
    showCaptions,
    setShowCaptions,
    handlePlayPause,
    handleTimeUpdate,
    handleDurationChange,
    handleVolumeChange,
    handleToggleMute,
    handleToggleFullscreen,
    handleToggleFavorite,
    handleShare,
    handleDownload,
    handleToggleCaptions,
    handleQualityChange,
    handleVideoError,
  };
};