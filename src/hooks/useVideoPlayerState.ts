// useVideoPlayerState.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import Player from "video.js/dist/types/player";
import { AudioTrack } from '../components/VideoPlayer/types';

interface VideoState {
  time: number;
  volume: number;
  muted: boolean;
  quality: string;
  language: string;
  audioTrack: string;
  subtitle: string;
  playbackRate: number;
}

export const useVideoPlayerState = (movieId: string) => {
  // Función auxiliar para crear IDs de almacenamiento únicos por película
  const getStorageKey = useCallback((id: string) => {
    // Usar prefijo constante + ID limpio de la película
    // Eliminar caracteres especiales y espacios para evitar problemas
    const cleanId = id.replace(/[^a-zA-Z0-9]/g, '_');
    return `videoState_${cleanId}`;
  }, []);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState("");
  const [subtitles, setSubtitles] = useState<TextTrack[]>([]);
  const [selectedSubtitle, setSelectedSubtitle] = useState("");
  const [selectedQuality, setSelectedQuality] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [controlsVisible, setControlsVisible] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [buffered, setBuffered] = useState<TimeRanges | null>(null);

  const playerRef = useRef<Player | null>(null);

  const loadSavedState = useCallback((player: Player) => {
    try {
      // Usar el ID único para esta película
      const storageKey = getStorageKey(movieId);
      const savedState = localStorage.getItem(storageKey);
      
      if (savedState) {
        const state: VideoState = JSON.parse(savedState);
        
        // Validar datos antes de aplicarlos
        if (state && typeof state === 'object') {
          // Establecer tiempo solo si es un valor válido y menor que la duración
          if (typeof state.time === 'number' && state.time > 0 && state.time < player.duration()) {
            player.currentTime(state.time);
          } else {
            player.currentTime(0); // Resetear a inicio si es inválido
          }
          
          // Configurar volumen con validación
          if (typeof state.volume === 'number' && state.volume >= 0 && state.volume <= 1) {
            player.volume(state.volume);
            setVolume(state.volume);
          }
          
          // Configurar mute state
          if (typeof state.muted === 'boolean') {
            player.muted(state.muted);
            setIsMuted(state.muted);
          }
          
          // Configurar otras propiedades solo si existen
          if (state.quality) setSelectedQuality(state.quality);
          if (state.language) setSelectedLanguage(state.language);
          if (state.audioTrack) setSelectedAudioTrack(state.audioTrack);
          if (state.subtitle) setSelectedSubtitle(state.subtitle);
          
          // Configurar playback rate con validación
          if (typeof state.playbackRate === 'number' && state.playbackRate > 0) {
            player.playbackRate(state.playbackRate);
            setPlaybackRate(state.playbackRate);
          }
        }
      }
    } catch (error) {
      console.error('Error loading video state:', error);
      // En caso de error, resetear estado a valores predeterminados
      player.currentTime(0);
      player.volume(1);
      player.muted(false);
      setIsMuted(false);
      setVolume(1);
    }
  }, [movieId, getStorageKey, setSelectedQuality, setSelectedLanguage, setSelectedAudioTrack, setSelectedSubtitle, setPlaybackRate, setIsMuted, setVolume]);

  const saveCurrentState = useCallback((player: Player) => {
    try {
      // Solo guardar estado si el reproductor está inicializado y tiene duración
      if (!player || typeof player.duration() !== 'number' || player.duration() <= 0) {
        return; // Salir si no hay un video válido
      }
      
      // Preparar datos a guardar con validaciones
      const currentTime = player.currentTime();
      const volume = player.volume();
      const muted = player.muted();
      const playbackRate = player.playbackRate();
      
      // Crear objeto de estado validado
      const state: VideoState = {
        // Validar cada valor antes de guardarlo
        time: typeof currentTime === 'number' && !isNaN(currentTime) ? currentTime : 0,
        volume: typeof volume === 'number' && !isNaN(volume) && volume >= 0 && volume <= 1 ? volume : 1,
        muted: typeof muted === 'boolean' ? muted : false,
        quality: selectedQuality || '',
        language: selectedLanguage || '',
        audioTrack: selectedAudioTrack || '',
        subtitle: selectedSubtitle || '',
        playbackRate: typeof playbackRate === 'number' && !isNaN(playbackRate) && playbackRate > 0 ? playbackRate : 1
      };
      
      // Usar clave específica para la película actual
      const storageKey = getStorageKey(movieId);
      localStorage.setItem(storageKey, JSON.stringify(state));
      
      // Implementar límite de almacenamiento con política LRU
      try {
        // Mantener un índice para ayudar a la política LRU
        const videoStateIndex = localStorage.getItem('videoStateIndex');
        let stateIndex: string[] = videoStateIndex ? JSON.parse(videoStateIndex) : [];
        
        // Actualizar el índice - mover la clave actual al frente
        stateIndex = stateIndex.filter(key => key !== storageKey);
        stateIndex.unshift(storageKey);
        
        // Limitar a 10 estados guardados como máximo para ahorrar almacenamiento
        const MAX_STATES = 10;
        if (stateIndex.length > MAX_STATES) {
          const keysToRemove = stateIndex.splice(MAX_STATES);
          keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        
        // Guardar índice actualizado
        localStorage.setItem('videoStateIndex', JSON.stringify(stateIndex));
      } catch (indexError) {
        // Si falla el manejo del índice, simplemente guardar el estado actual
        console.warn('Failed to update video state index:', indexError);
      }
    } catch (error) {
      console.error('Error saving video state:', error);
    }
  }, [movieId, selectedQuality, selectedLanguage, selectedAudioTrack, selectedSubtitle, getStorageKey]);

  const handleTimeUpdate = useCallback((player: Player) => {
    setCurrentTime(player.currentTime() ?? 0);
    saveCurrentState(player);
  }, [saveCurrentState]);

  const handleVolumeChange = useCallback((player: Player) => {
    setVolume(player.volume() ?? 0);
    setIsMuted(player.muted() ?? false);
    saveCurrentState(player);
  }, [saveCurrentState]);

  const handlePlaybackRateChange = useCallback((player: Player) => {
    setPlaybackRate(player.playbackRate() ?? 0);
    saveCurrentState(player);
  }, [saveCurrentState]);

  const handleBufferUpdate = useCallback((player: Player) => {
    setBuffered(player.buffered());
  }, []);

  const handleQualityChange = useCallback((quality: string) => {
    setSelectedQuality(quality);
    if (playerRef.current) {
      saveCurrentState(playerRef.current);
    }
  }, [saveCurrentState]);

  const handleLanguageChange = useCallback((language: string) => {
    setSelectedLanguage(language);
    if (playerRef.current) {
      saveCurrentState(playerRef.current);
    }
  }, [saveCurrentState]);

  const handleAudioTrackChange = useCallback((track: string) => {
    setSelectedAudioTrack(track);
    if (playerRef.current) {
      saveCurrentState(playerRef.current);
    }
  }, [saveCurrentState]);

  const handleSubtitleChange = useCallback((subtitle: string) => {
    setSelectedSubtitle(subtitle);
    if (playerRef.current) {
      saveCurrentState(playerRef.current);
    }
  }, [saveCurrentState]);

  useEffect(() => {
    let timeoutId: number;
    let lastSaveTime = 0;
    
    // Función para guardar estado con protección contra guardados frecuentes
    const smartSaveState = () => {
      const now = Date.now();
      if (playerRef.current && (now - lastSaveTime > 5000 || !lastSaveTime)) { 
        // Solo guardar si han pasado 5 segundos desde el último guardado o es la primera vez
        saveCurrentState(playerRef.current);
        lastSaveTime = now;
      }
      
      // Programar próximo guardado basado en si el usuario está activo y el estado de reproducción
      const isUserActive = controlsVisible;
      const isPaused = playerRef.current?.paused?.() || false;
      
      // Estrategia de guardado:
      // - Si el video está pausado: guardar menos frecuentemente (menos cambios)
      // - Si el usuario está activo: guardar más frecuentemente (más probabilidad de cambios)
      // - Si está reproduciéndose sin interacción: guardado intermedio
      let nextSaveDelay;
      if (isPaused) {
        nextSaveDelay = 20000; // 20s para video pausado
      } else if (isUserActive) {
        nextSaveDelay = 5000; // 5s si usuario activo
      } else {
        nextSaveDelay = 10000; // 10s en reproducción normal
      }
      
      timeoutId = window.setTimeout(smartSaveState, nextSaveDelay);
    };
    
    // Iniciar el proceso de guardado inteligente
    smartSaveState();
    
    // Guardar en eventos críticos que podrían cerrar la página o cambiar el contexto
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && playerRef.current) {
        saveCurrentState(playerRef.current);
        lastSaveTime = Date.now();
      }
    };
    
    const handleBeforeUnload = () => {
      if (playerRef.current) {
        saveCurrentState(playerRef.current);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // Guardar estado final al desmontar componente
      if (playerRef.current) {
        saveCurrentState(playerRef.current);
      }
    };
  }, [saveCurrentState, controlsVisible]);

  return {
    isLoading,
    isPaused,
    isFullscreen,
    isMuted,
    currentTime,
    duration,
    volume,
    audioTracks,
    selectedAudioTrack,
    subtitles,
    selectedSubtitle,
    selectedQuality,
    selectedLanguage,
    controlsVisible,
    playbackRate,
    buffered,
    setIsLoading,
    setIsPaused,
    setIsFullscreen,
    setIsMuted,
    setCurrentTime,
    setDuration,
    setVolume,
    setAudioTracks,
    setSelectedAudioTrack,
    setSubtitles,
    setSelectedSubtitle,
    setSelectedQuality,
    setSelectedLanguage,
    setControlsVisible,
    setPlaybackRate,
    loadSavedState,
    saveCurrentState,
    handleTimeUpdate,
    handleVolumeChange,
    handlePlaybackRateChange,
    handleBufferUpdate,
    handleQualityChange,
    handleLanguageChange,
    handleAudioTrackChange,
    handleSubtitleChange,
    playerRef
  };
};