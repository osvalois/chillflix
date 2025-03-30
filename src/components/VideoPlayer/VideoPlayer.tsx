import React, { useEffect, useRef, useCallback, useState, useMemo } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import {
  Box,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import "video.js/dist/video-js.css";
import { AudioTrack, VideoPlayerProps } from "./types";
import Controls from "./Controls";
import { ErrorOverlay } from "./ErrorOverlay";
import { useHotkeys } from "react-hotkeys-hook";
import { motion, AnimatePresence } from "framer-motion";
import { SubtitlesDisplay } from "./SubtitlesDisplay";
import { useAnalytics } from "../../hooks/useAnalytics";
import OpenSubtitlesService from "../../services/openSubtitlesService";
import { useVideoPlayerState } from "../../hooks/useVideoPlayerState";
import { AudioTrackCustom } from "./AudioSettingsMenu";
import { debounce } from 'lodash';
import { CONSTANTS, initialOptions, mobileOptions, lowPowerOptions } from "./constants";
import { useTimeout } from "../../hooks/useTimeout";
import { Subtitle } from "../../services/subtitle-types";

const VideoPlayer: React.FC<VideoPlayerProps> = React.memo(
  ({
    options,
    title,
    onQualityChange,
    onLanguageChange,
    availableQualities,
    availableLanguages,
    imdbId,
    posterUrl,
  }) => {
    // Refs
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const playerRef = useRef<Player | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const previousSourceRef = useRef<string | null>(null);

    // State
    const [retryCount, setRetryCount] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isMouseMoving, setIsMouseMoving] = useState(false);
    const [lastClickTime, setLastClickTime] = useState(0);
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
    const [selectedSubtitle, setSelectedSubtitle] = useState<Subtitle | null>(null);
    const [isSourceChanging, setIsSourceChanging] = useState(false);

    // Hooks
    const bgColor = useColorModeValue("gray.100", "gray.900");
    const toast = useToast();
    const { trackEvent } = useAnalytics();
    const { setCustomTimeout, clearCustomTimeout, clearAllTimeouts } = useTimeout();

    const {
      isLoading,
      isPaused,
      isFullscreen,
      isMuted,
      currentTime,
      duration,
      volume,
      audioTracks,
      selectedAudioTrack,
      selectedQuality,
      selectedLanguage,
      controlsVisible,
      setIsLoading,
      setIsPaused,
      setIsFullscreen,
      setIsMuted,
      setCurrentTime,
      setDuration,
      setVolume,
      setAudioTracks,
      setSelectedAudioTrack,
      setSelectedQuality,
      setSelectedLanguage,
      setControlsVisible,
      loadSavedState,
      saveCurrentState,
    } = useVideoPlayerState('USER-ID');

    // Detección avanzada y dinámica de capacidades del dispositivo
    const deviceCapabilities = useMemo(() => {
      // Detección de dispositivo
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const isTablet = /iPad|tablet|Tablet/i.test(navigator.userAgent) || (window.innerWidth >= 600 && window.innerWidth <= 1024);
      const isTV = /TV|SmartTV|SMART-TV|Apple TV|GoogleTV|HbbTV|webOS.+TV/i.test(navigator.userAgent);
      
      // Detección de capacidades de hardware
      const isLowPower = (() => {
        // Usar hardwareConcurrency si está disponible
        if (navigator.hardwareConcurrency) {
          return navigator.hardwareConcurrency <= 4;
        }
        
        // Heurística basada en dispositivo y memoria
        if (navigator.deviceMemory) {
          return navigator.deviceMemory < 4;
        }
        
        // Heurística basada en agente de usuario para dispositivos conocidos de baja potencia
        return /low|lite|mini/i.test(navigator.userAgent);
      })();
      
      // Detección de capacidades de pantalla
      const isHighDensityDisplay = window.devicePixelRatio > 1.5;
      const isSmallScreen = window.innerWidth < 768;
      const isLandscape = window.innerWidth > window.innerHeight;
      
      // Detección de capacidades de entrada
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const hasPointer = matchMedia('(pointer: fine)').matches;
      
      // Preferencias de usuario y red
      const preferReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Capacidades de red
      const connection = navigator.connection;
      const isSaveData = connection ? connection.saveData : false;
      const effectiveConnectionType = connection ? connection.effectiveType : '4g';
      const isSlowConnection = effectiveConnectionType === '2g' || effectiveConnectionType === 'slow-2g';
      const isMediumConnection = effectiveConnectionType === '3g';
      const estimatedBandwidth = connection?.downlink ? connection.downlink * 1000 : 5000; // kbps
      
      // Detección de capacidades del navegador
      const supportsMSE = 'MediaSource' in window;
      const supportsHLSNatively = (() => {
        const video = document.createElement('video');
        return video.canPlayType('application/vnd.apple.mpegurl') !== '';
      })();
      
      // Factores combinados para decisiones de rendimiento
      const shouldUseMinimalUI = isLowPower || isSaveData || isSlowConnection;
      const shouldReduceAnimations = preferReducedMotion || isLowPower || isSaveData || isSlowConnection;
      const shouldUseHDVideo = !shouldUseMinimalUI && !isSlowConnection && !isMediumConnection && !isSmallScreen;
      const shouldPreload = !isSaveData && !isSlowConnection;
      const shouldUseLowQualityImages = isSlowConnection || isSaveData || isLowPower;
      
      // Seleccionar configuración óptima basada en el dispositivo
      let optimizedPlayerOptions;
      if (isLowPower || isSlowConnection) {
        optimizedPlayerOptions = lowPowerOptions;
      } else if (isMobile || isTablet) {
        optimizedPlayerOptions = mobileOptions;
      } else {
        optimizedPlayerOptions = initialOptions;
      }
      
      // Ajustes adicionales basados en la orientación (especialmente para móviles)
      if (isMobile && isLandscape) {
        // En móviles con orientación horizontal, maximizar el área de visualización
        optimizedPlayerOptions = {
          ...optimizedPlayerOptions,
          controlBar: {
            ...optimizedPlayerOptions.controlBar,
            children: ['playToggle', 'progressControl', 'fullscreenToggle'] // Controles mínimos
          }
        };
      }
      
      return {
        // Dispositivo
        isMobile,
        isTablet,
        isTV,
        isLowPower,
        
        // Pantalla
        isHighDensityDisplay,
        isSmallScreen,
        isLandscape,
        
        // Entrada
        hasTouch,
        hasPointer,
        
        // Preferencias
        preferReducedMotion,
        prefersDarkMode,
        
        // Red
        isSaveData,
        effectiveConnectionType,
        isSlowConnection,
        isMediumConnection,
        estimatedBandwidth,
        
        // Navegador
        supportsMSE,
        supportsHLSNatively,
        
        // Factores combinados
        shouldUseMinimalUI,
        shouldReduceAnimations, 
        shouldUseHDVideo,
        shouldPreload,
        shouldUseLowQualityImages,
        
        // Opciones preconfiguradas
        optimizedPlayerOptions
      };
    }, []);
    
    // Memoized styles con optimizaciones para rendimiento
    const containerStyles = useMemo(() => {
      // Adaptación del estilo basado en capacidades del dispositivo
      const baseStyles = {
        '&:fullscreen, &:-webkit-full-screen, &:-moz-full-screen, &:-ms-fullscreen': {
          width: '100vw',
          height: '100vh',
          borderRadius: 0,
        },
        cursor: isFullscreen && !isMouseMoving ? 'none' : 'auto',
        '.video-js': {
          width: '100%',
          height: '100%',
          minHeight: deviceCapabilities?.isMobile ? '250px' : { base: '300px', md: '360px' },
          maxHeight: deviceCapabilities?.isMobile ? '65vh' : { base: '70vh', md: '80vh' },
          '@media (orientation: landscape) and (max-width: 768px)': {
            minHeight: '85vh',
          }
        },
        '.video-js video': {
          objectFit: 'contain',
          width: '100%',
          height: '100%'
        },
        '.vjs-control-bar': {
          display: 'none'
        },
        '.vjs-big-play-button': {
          display: 'none'
        }
      };
      
      // Optimizaciones de rendimiento para dispositivos de bajo rendimiento
      if (deviceCapabilities?.isLowPower || deviceCapabilities?.isSaveData) {
        return {
          ...baseStyles,
          // Reducir calidad de sombras y efectos
          '.video-js': {
            ...baseStyles['.video-js'],
            boxShadow: 'none',
            // Desactivar animaciones complejas
            transition: 'none',
          },
          // Optimizar renderizado de video
          '.video-js video': {
            ...baseStyles['.video-js video'],
            // Priorizar rendimiento sobre calidad visual en dispositivos de baja potencia
            imageRendering: deviceCapabilities.isLowPower ? 'optimizeSpeed' : 'auto',
          },
          // Aplicar transformaciones de hardware donde sea posible para mejorar rendimiento
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          willChange: 'transform' // Sugerencia para el navegador para optimizar cambios
        };
      }
      
      return baseStyles;
    }, [isFullscreen, isMouseMoving, deviceCapabilities]);

    // Memoized error handler
    const handleError = useCallback((player: any, error: any) => {
      console.error("Video player error:", error);
      trackEvent('video_error', { 
        code: error?.code,
        message: error?.message,
        type: error?.type,
        retryCount
      });

      if (retryCount < CONSTANTS.MAX_RETRIES) {
        setCustomTimeout('retry', () => {
          setRetryCount(prev => prev + 1);
          if (player && !isSourceChanging) {
            player.load();
            player.play()?.catch((e: { message: any; }) => {
              console.error("Play error after retry:", e);
              trackEvent('play_error_after_retry', { error: e.message });
            });
          }
        }, CONSTANTS.RETRY_DELAY);
      } else {
        console.error("Maximum retry attempts reached. Playback failed.");
        toast({
          title: "Playback Error",
          description: "We're having trouble playing this video. Please check your connection and try again later.",
          status: "error",
          duration: CONSTANTS.ERROR_TOAST_DURATION,
          isClosable: true,
        });
      }
    }, [retryCount, isSourceChanging, setCustomTimeout, toast, trackEvent]);

    // Audio tracks handler
    const checkAudioTracks = useCallback((player: any) => {
      try {
        const tracks = player.audioTracks();
        const trackList: AudioTrack[] = [];

        if (tracks?.length) {
          for (let i = 0; i < tracks.length; i++) {
            trackList.push(tracks[i]);
          }
          setAudioTracks(trackList);

          const defaultTrack = trackList.find(track => track.enabled) || trackList[0];
          if (defaultTrack) {
            setSelectedAudioTrack((defaultTrack as unknown as AudioTrackCustom).label);
            defaultTrack.enabled = true;
          }
        }
      } catch (error) {
        console.error('Error handling audio tracks:', error);
        trackEvent('audio_tracks_error', { error: (error as Error).message });
      }
    }, [setAudioTracks, setSelectedAudioTrack, trackEvent]);

    // Player event handlers
    const handlePlayerReady = useCallback((player: Player) => {
      playerRef.current = player;

      const eventHandlers = {
        waiting: () => {
          setIsLoading(true);
          setIsBuffering(true);
          setCustomTimeout('buffer', () => {
            if (isBuffering) {
              trackEvent('long_buffering', { 
                duration: CONSTANTS.BUFFER_THRESHOLD,
                currentTime: player.currentTime()
              });
            }
          }, CONSTANTS.BUFFER_THRESHOLD);
        },
        canplay: () => {
          setIsLoading(false);
          setIsBuffering(false);
          clearCustomTimeout('buffer');
        },
        play: () => {
          setIsPaused(false);
          trackEvent('video_play', { 
            title, 
            currentTime: player.currentTime(),
            quality: selectedQuality,
            language: selectedLanguage
          });
        },
        pause: () => {
          setIsPaused(true);
          trackEvent('video_pause', { 
            title, 
            currentTime: player.currentTime() 
          });
        },
        error: () => handleError(player, player.error()),
        timeupdate: () => {
          const time = player.currentTime();
          if (typeof time === 'number') {
            setCurrentTime(time);
            saveCurrentState(player);
          }
        },
        loadedmetadata: () => {
          const dur = player.duration();
          if (typeof dur === 'number') {
            setDuration(dur);
            checkAudioTracks(player);
            trackEvent('video_loaded', { 
              title, 
              duration: dur,
              quality: selectedQuality,
              language: selectedLanguage
            });
          }
        },
        ended: () => {
          trackEvent('video_ended', { 
            title, 
            duration: player.duration() 
          });
        },
        volumechange: () => {
          const newVolume = player.volume();
          if (typeof newVolume === 'number') {
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
            saveCurrentState(player);
          }
        },
        fullscreenchange: () => {
          const isFullscreen = player.isFullscreen();
          setIsFullscreen(isFullscreen ?? false);
          
          // Siempre mostrar controles al cambiar a pantalla completa
          setControlsVisible(true);
          setIsMouseMoving(true);
          
          // Cancelar cualquier timeout existente
          clearCustomTimeout('controls');
          
          // Solo configurar auto-ocultar si está en fullscreen, reproduciéndose y no estamos en móvil
          if (isFullscreen && !player.paused() && !deviceCapabilities?.isMobile) {
            setCustomTimeout('controls', () => {
              setControlsVisible(false);
              setIsMouseMoving(false);
            }, CONSTANTS.CONTROLS_HIDE_DELAY * 1.5); // Dar más tiempo para que el usuario interactúe
          }
        }
      };

      // Attach event listeners
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        player.on(event, handler);
      });

      // Load saved state
      loadSavedState(player);

      return () => {
        // Remove event listeners
        Object.entries(eventHandlers).forEach(([event, handler]) => {
          player.off(event, handler);
        });
      };
    }, [
      setIsLoading, setIsBuffering, setIsPaused, setCurrentTime, 
      setDuration, setVolume, setIsMuted, setIsFullscreen, 
      setControlsVisible, loadSavedState, saveCurrentState, 
      handleError, checkAudioTracks, trackEvent, title, 
      selectedQuality, selectedLanguage, setCustomTimeout, 
      clearCustomTimeout
    ]);

    // Inicialización avanzada del reproductor con optimizaciones específicas para el dispositivo
    useEffect(() => {
      if (!playerRef.current && videoRef.current) {
        const videoElement = videoRef.current;
        
        // Elegir la configuración óptima según el dispositivo detectado
        const baseOptions = deviceCapabilities.optimizedPlayerOptions || initialOptions;
        
        // Fusionar opciones basadas en capacidades del dispositivo
        const enhancedOptions = {
          ...baseOptions,
          ...options,
          poster: options.poster || posterUrl || '',
          
          // Optimizaciones para mejorar rendimiento inicial en todos los dispositivos
          html5: {
            ...baseOptions.html5,
            vhs: {
              ...baseOptions.html5.vhs,
              // Ajustar ancho de banda según la conexión detectada
              bandwidth: deviceCapabilities.estimatedBandwidth || baseOptions.html5.vhs.bandwidth,
              // Usar la API de Network Information si está disponible
              useNetworkInformationApi: 'connection' in navigator,
              // Guardar información de rendimiento para futuras cargas
              useBandwidthFromLocalStorage: !deviceCapabilities.isSlowConnection
            }
          },
          
          // Ajustar precarga según la red
          preload: deviceCapabilities.shouldPreload ? 'auto' : 'metadata',
          
          // Evitar autoplay para compatibilidad con políticas de navegador
          autoplay: false,
          
          // Optimizaciones específicas por dispositivo
          userActions: {
            ...baseOptions.userActions,
            // Deshabilitar atajos en dispositivos táctiles sin teclado
            hotkeys: deviceCapabilities.hasPointer
          },
          
          // Optimizaciones para diferentes tipos de pantalla
          responsive: true,
          fluid: true,
          aspectRatio: deviceCapabilities.isTV ? '16:9' : undefined,
          
          // Optimizaciones de UI
          controlBar: {
            ...baseOptions.controlBar,
            // Ajustar visibilidad de controles según tipo de dispositivo
            fadeTime: deviceCapabilities.shouldReduceAnimations ? 0 : 300
          }
        };
        
        // Log de configuración para depuración (solo en desarrollo)
        if (process.env.NODE_ENV === 'development') {
          console.debug('[VideoPlayer] Inicializando con opciones optimizadas:', {
            deviceType: deviceCapabilities.isMobile ? 'mobile' : deviceCapabilities.isTablet ? 'tablet' : 'desktop',
            connection: deviceCapabilities.effectiveConnectionType,
            options: enhancedOptions
          });
        }
        
        // Crear instancia del reproductor con opciones optimizadas
        const player = videojs(videoElement, enhancedOptions, () => {
          handlePlayerReady(player);
        });
        
        // Preparación inicial para mejorar el tiempo de primera reproducción
        if (options.sources?.length) {
          try {
            // Aplicar la fuente con protección contra errores
            player.src(options.sources);
            previousSourceRef.current = options.sources[0]?.src || null;
            
            // Estrategia de precarga adaptativa
            if (deviceCapabilities.shouldPreload) {
              // Precarga agresiva para conexiones rápidas
              player.one('loadedmetadata', () => {
                // Técnica avanzada: precarga incremental para minimizar buffering inicial
                const preloadStrategy = async () => {
                  try {
                    // Precargar un segmento para iniciar el buffer en segundo plano
                    player.currentTime(0.1);
                    
                    // Esperar a que se cargue el primer segmento
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // Volver al inicio para la reproducción
                    player.currentTime(0);
                    
                    // Preparar cache de segmentos adicionales si la conexión es buena
                    if (deviceCapabilities.estimatedBandwidth > 5000) { // > 5Mbps
                      // Precargar más adelante para tener buffer adicional
                      player.currentTime(5);
                      await new Promise(resolve => setTimeout(resolve, 50));
                      player.currentTime(0);
                    }
                  } catch (e) {
                    // Ignorar errores de precarga - no son críticos
                    player.currentTime(0);
                  }
                };
                
                // Ejecutar estrategia de precarga
                preloadStrategy().catch(() => {}); // No bloquear por fallos de precarga
              });
            } else {
              // Para conexiones lentas, solo cargar lo mínimo necesario
              player.currentTime(0);
            }
          } catch (error) {
            console.error("[VideoPlayer] Error al establecer fuente inicial:", error);
            setRetryCount(prev => prev + 1);
          }
        }
        
        // Monitoreo de recursos y rendimiento
        let memoryCheckInterval: number;
        if (performance && 'memory' in performance) {
          // Monitorear uso de memoria para identificar fugas
          memoryCheckInterval = window.setInterval(() => {
            const memory = (performance as any).memory;
            if (memory && memory.usedJSHeapSize > 300000000) { // 300MB
              console.warn('[VideoPlayer] Alto consumo de memoria detectado', memory);
              // Considerar acciones para liberar recursos
            }
          }, 30000); // Verificar cada 30s
        }
        
        // Optimizar uso de batería cuando el video no está visible
        let visibilityObserver: IntersectionObserver;
        if ('IntersectionObserver' in window) {
          visibilityObserver = new IntersectionObserver((entries) => {
            const [entry] = entries;
            if (!entry.isIntersecting && !player.paused()) {
              // Pausar automáticamente cuando el video no está visible
              player.pause();
            }
          }, { threshold: 0.1 });
          
          visibilityObserver.observe(videoElement);
        }
        
        // Limpieza mejorada para prevenir fugas de memoria
        return () => {
          // Limpiar timers
          clearAllTimeouts();
          if (memoryCheckInterval) clearInterval(memoryCheckInterval);
          if (visibilityObserver) visibilityObserver.disconnect();
          
          // Limpiar recursos del reproductor
          if (playerRef.current) {
            try {
              // Detener reproducción y descargar recursos
              playerRef.current.pause();
              playerRef.current.src('');
              
              // Liberar referencias a objetos grandes
              playerRef.current.off();
              
              // Eliminación retrasada para permitir limpieza interna
              setTimeout(() => {
                try {
                  if (playerRef.current) {
                    playerRef.current.dispose();
                    playerRef.current = null;
                  }
                } catch (e) {
                  console.error("[VideoPlayer] Error durante la limpieza:", e);
                }
              }, 100);
            } catch (e) {
              console.error("[VideoPlayer] Error al liberar recursos:", e);
            }
          }
        };
      }
    }, [options, handlePlayerReady, clearAllTimeouts, deviceCapabilities, posterUrl, setRetryCount]);

    // Cambio de fuente optimizado con precargas inteligentes
    useEffect(() => {
      const handleSourceChange = async () => {
        if (!playerRef.current || !options.sources?.length) return;
        
        const newSource = options.sources[0]?.src;
        if (newSource === previousSourceRef.current) return;
        
        try {
          setIsSourceChanging(true);
          const player = playerRef.current;
          const currentTime = player.currentTime();
          const wasPlaying = !player.paused();
    
          // Store playback state before source change
          const playbackState = {
            time: currentTime,
            volume: player.volume(),
            muted: player.muted(),
            playbackRate: player.playbackRate()
          };
    
          // Optimización: descargar metadatos previamente para acelerar el cambio
          const preloadSource = () => {
            return new Promise<void>((resolve) => {
              // Técnica de precarga con timeout de seguridad
              let preloadTimeout: number;
              const preloadVideo = document.createElement('video');
              
              const cleanupPreload = () => {
                if (preloadTimeout) clearTimeout(preloadTimeout);
                preloadVideo.removeAttribute('src');
                preloadVideo.load();
              };
              
              // Timeout de seguridad para evitar esperas indefinidas
              preloadTimeout = window.setTimeout(() => {
                cleanupPreload();
                resolve(); // Continuar aunque la precarga no se complete
              }, 2000);
              
              // Tratar de precargar los metadatos para acelerar el cambio
              preloadVideo.preload = 'metadata';
              preloadVideo.muted = true;
              preloadVideo.src = newSource || '';
              preloadVideo.addEventListener('loadedmetadata', () => {
                cleanupPreload();
                resolve();
              }, { once: true });
              
              preloadVideo.addEventListener('error', () => {
                cleanupPreload();
                resolve(); // Continuar aunque la precarga falle
              }, { once: true });
            });
          };
          
          // Usar precarga solo en conexiones rápidas y dispositivos no móviles
          const shouldPreload = !deviceCapabilities?.isSaveData && 
                              !deviceCapabilities?.isLowPower;
          
          if (shouldPreload) {
            await preloadSource().catch(() => {}); // Ignorar errores de precarga
          }
    
          // Change source con heurística de recuperación
          let sourceChangeTimer: number;
          const sourceChangePromise = new Promise<void>((resolve) => {
            // Establecer un tiempo máximo para el cambio de fuente
            sourceChangeTimer = window.setTimeout(() => resolve(), 5000);
            
            // Realizar el cambio de fuente
            player.src(options.sources);
            
            // Restaurar estado tras cargar metadatos
            player.one('loadedmetadata', () => {
              clearTimeout(sourceChangeTimer);
              resolve();
            });
          });
          
          await sourceChangePromise;
          
          // Restaurar estado de reproducción
          if (typeof playbackState.time === 'number') {
            player.currentTime(playbackState.time);
          }
          player.volume(playbackState.volume);
          player.muted(playbackState.muted);
          player.playbackRate(playbackState.playbackRate);
    
          // Reanudar reproducción solo si estaba reproduciendo
          if (wasPlaying) {
            player.play().catch(e => {
              console.error("Play error after source change:", e);
              trackEvent('play_error_source_change', { error: e.message });
            });
          }
    
          previousSourceRef.current = newSource;
        } catch (error) {
          console.error('Error changing source:', error);
          trackEvent('source_change_error', { error: (error as Error).message });
        } finally {
          setIsSourceChanging(false);
        }
      };
    
      handleSourceChange();
    }, [options.sources, deviceCapabilities, trackEvent]);
    
    // Control de movimiento optimizado con detección de actividad
    useEffect(() => {
      // Variables para optimizar el rendimiento de eventos frecuentes
      let lastMovePosition = { x: 0, y: 0 }; // Para detectar movimientos significativos
      let lastHideAttempt = 0; // Evitar varios intentos de ocultar en períodos cortos
      let controlsHideTimer: number | null = null;
      let userIsInteracting = false; // Flag para detectar interacción activa
      let allowTransition = true; // Flag para manejar transiciones suaves
      
      // Determinar el tiempo de ocultamiento basado en el dispositivo y contexto
      const getHideDelay = () => {
        // Si el usuario está pausando o interactuando con los controles, darle más tiempo
        const baseDelay = isPaused ? 1.5 : 1.0; // Multiplicador para estado pausado
        
        if (deviceCapabilities?.isMobile) {
          return CONSTANTS.CONTROLS_HIDE_DELAY_MOBILE * baseDelay;
        } else if (isFullscreen) {
          return CONSTANTS.CONTROLS_HIDE_DELAY * baseDelay;
        } else {
          return CONSTANTS.CONTROLS_HIDE_DELAY_DESKTOP * baseDelay;
        }
      };
      
      // Función que realmente oculta los controles cuando es apropiado
      const hideControls = (immediate = false) => {
        const now = Date.now();
        
        // Evitar ocultar controles en circunstancias específicas:
        if (
          isPaused || // No ocultar si el video está pausado
          userIsInteracting || // No ocultar si el usuario está interactuando
          (now - lastHideAttempt < CONSTANTS.VISIBILITY_CHANGE_GRACE) // Evitar ocultar demasiado frecuentemente
        ) {
          return false; // Indicar que no se ocultaron los controles
        }
        
        // Registrar intento de ocultamiento
        lastHideAttempt = now;
        
        // Aplicar ocultamiento con o sin transición
        if (immediate) {
          setControlsVisible(false);
          setIsMouseMoving(false);
          allowTransition = true; // Restaurar transiciones
        } else if (allowTransition) {
          // Secuencia de ocultamiento con transición
          setIsMouseMoving(false); // Primero ocultar el cursor
          
          // Después ocultar los controles con un pequeño retraso para mejor UX
          setTimeout(() => {
            if (!userIsInteracting) { // Verificar de nuevo por si cambió
              setControlsVisible(false);
            }
          }, CONSTANTS.CONTROLS_FADE_DURATION / 2);
        }
        
        return true; // Indicar que se intentó ocultar los controles
      };
      
      // Cancelar cualquier ocultamiento programado y asegurar visibilidad
      const cancelHideAndShow = () => {
        if (controlsHideTimer) {
          clearTimeout(controlsHideTimer);
          controlsHideTimer = null;
        }
        
        clearCustomTimeout('controls');
        
        // Solo mostrar si no son ya visibles (evitar re-renderizados)
        if (!controlsVisible || !isMouseMoving) {
          allowTransition = true;
          setControlsVisible(true);
          setIsMouseMoving(true);
        }
      };
      
      // Programar ocultamiento automático después de cierto tiempo
      const scheduleHideControls = () => {
        if (controlsHideTimer) {
          clearTimeout(controlsHideTimer);
        }
        
        clearCustomTimeout('controls');
        
        // Solo programar ocultamiento en casos apropiados:
        // - En pantalla completa (siempre)
        // - En móviles 
        // - No durante pausa
        if ((isFullscreen || deviceCapabilities?.isMobile) && !isPaused) {
          controlsHideTimer = window.setTimeout(() => {
            setCustomTimeout('controls', () => {
              hideControls();
            }, getHideDelay());
          }, CONSTANTS.CONTROLS_UPDATE_DEBOUNCE);
        }
      };
      
      // Función mejorada para manejar movimiento de mouse con detección avanzada
      // Usa debounce para rendimiento pero con pre-procesamiento para mejor precisión
      const handleUserActivity = debounce((event: MouseEvent | TouchEvent) => {
        let x = 0;
        let y = 0;
        
        // Extraer coordenadas según tipo de evento
        if ('clientX' in event) {
          x = event.clientX;
          y = event.clientY;
        } else if (event.touches && event.touches.length > 0) {
          x = event.touches[0].clientX;
          y = event.touches[0].clientY;
        }
        
        // Detectar si el movimiento es significativo para evitar micro-movimientos
        const dx = Math.abs(x - lastMovePosition.x);
        const dy = Math.abs(y - lastMovePosition.y);
        const isSignificantMove = dx > CONSTANTS.MOUSE_MOVE_THRESHOLD || 
                                 dy > CONSTANTS.MOUSE_MOVE_THRESHOLD;
        
        // Actualizar posición guardada solo si el movimiento es significativo
        if (isSignificantMove) {
          lastMovePosition = { x, y };
          
          // Indicar que el usuario está activo
          userIsInteracting = true;
          
          // Reset timeout para considerar fin de interacción
          setTimeout(() => {
            userIsInteracting = false;
          }, 500); // 500ms sin movimiento = fin de interacción
          
          // Mostrar controles y programar ocultamiento
          cancelHideAndShow();
          scheduleHideControls();
        } else if (!controlsVisible) {
          // Si los controles no son visibles, mostrarlos incluso con movimientos pequeños
          cancelHideAndShow();
          scheduleHideControls();
        }
      }, CONSTANTS.CONTROLS_UPDATE_DEBOUNCE, { 
        leading: true,   // Ejecutar en el primer evento para respuesta inmediata
        trailing: true,  // También ejecutar al final para eventos rápidos
        maxWait: 150     // Tiempo máximo de espera para garantizar respuesta
      });
      
      // Manejador tactil optimizado para diferentes situaciones
      const handleTouchStart = () => {
        // En dispositivos táctiles alternar visibilidad con toque
        if (controlsVisible) {
          // Si ya son visibles, sólo reestablecer el timer de ocultamiento
          cancelHideAndShow();
          scheduleHideControls();
        } else {
          // Si están ocultos, mostrarlos
          cancelHideAndShow();
          scheduleHideControls();
        }
        
        // Marcar interacción del usuario
        userIsInteracting = true;
        setTimeout(() => {
          userIsInteracting = false;
        }, 1000); // Mayor tiempo para dispositivos táctiles
      };
     
      // Función mejorada de salida del mouse
      const handleMouseLeave = () => {
        // Anular flag de interacción al salir
        userIsInteracting = false;
        
        // En escritorio, escondemos controles al salir, excepto en fullscreen
        if (!isFullscreen && !deviceCapabilities?.isMobile) {
          // Retraso para evitar parpadeos
          setTimeout(() => {
            if (!userIsInteracting) { // Verificar de nuevo
              hideControls(false); // No ocultar inmediatamente
            }
          }, CONSTANTS.VISIBILITY_CHANGE_GRACE);
        }
      };
      
      // Función para detectar foco en controles (evita ocultarlos mientras se usan)
      const handleFocusIn = () => {
        userIsInteracting = true;
        cancelHideAndShow();
      };
      
      const handleFocusOut = () => {
        userIsInteracting = false;
        scheduleHideControls();
      };
     
      const container = containerRef.current;
      if (container) {
        // Eventos principales con optimizaciones
        container.addEventListener("mousemove", handleUserActivity, { passive: true });
        container.addEventListener("mouseleave", handleMouseLeave);
        container.addEventListener("mouseenter", cancelHideAndShow);
        container.addEventListener("focusin", handleFocusIn);
        container.addEventListener("focusout", handleFocusOut);
        
        // Prevenir ocultamiento durante interacción de mouse
        container.addEventListener("mousedown", () => { userIsInteracting = true; });
        container.addEventListener("mouseup", () => { 
          setTimeout(() => { userIsInteracting = false; }, 200); 
        });
        
        // Soporte para dispositivos táctiles
        if (deviceCapabilities?.hasTouch) {
          container.addEventListener("touchstart", handleTouchStart, { passive: true });
          container.addEventListener("touchmove", handleUserActivity, { passive: true });
          container.addEventListener("touchend", () => {
            setTimeout(() => { userIsInteracting = false; }, 500);
          });
        }
     
        return () => {
          // Limpiar todos los event listeners
          container.removeEventListener("mousemove", handleUserActivity);
          container.removeEventListener("mouseleave", handleMouseLeave);
          container.removeEventListener("mouseenter", cancelHideAndShow);
          container.removeEventListener("focusin", handleFocusIn);
          container.removeEventListener("focusout", handleFocusOut);
          container.removeEventListener("mousedown", () => { userIsInteracting = true; });
          container.removeEventListener("mouseup", () => { userIsInteracting = false; });
          
          if (deviceCapabilities?.hasTouch) {
            container.removeEventListener("touchstart", handleTouchStart);
            container.removeEventListener("touchmove", handleUserActivity);
            container.removeEventListener("touchend", () => { userIsInteracting = false; });
          }
          
          // Limpiar funciones de gestión de tiempos
          handleUserActivity.cancel();
          if (controlsHideTimer) {
            clearTimeout(controlsHideTimer);
          }
          clearCustomTimeout('controls');
        };
      }
     }, [isFullscreen, isPaused, deviceCapabilities, setControlsVisible, setIsMouseMoving, controlsVisible, isMouseMoving, clearCustomTimeout, setCustomTimeout]);
 
    // Subtitles loading optimizado con lazy loading
    useEffect(() => {
      // Carga diferida de subtítulos solo cuando el usuario interactúa o después de un tiempo
      const loadSubtitles = async () => {
        if (!imdbId || !playerRef.current) return;
        
        // Normalizar el ID para evitar problemas con caracteres especiales
        const safeImdbId = imdbId.replace(/[^a-zA-Z0-9]/g, '_');
        
        // Verificar si ya hay subtítulos en caché
        const cachedSubtitles = sessionStorage.getItem(`subtitles_${safeImdbId}`);
        if (cachedSubtitles) {
          try {
            const parsed = JSON.parse(cachedSubtitles);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSubtitles(parsed);
              trackEvent('subtitle_fetch_from_cache', { imdbId });
              return;
            }
          } catch (e) {
            // Error en cache, continuar con fetch normal
            console.warn('Subtitle cache parse error:', e);
          }
        }
        
        try {
          const fetchedSubtitles = await OpenSubtitlesService.searchSubtitles(imdbId);
          if (fetchedSubtitles && fetchedSubtitles.length > 0) {
            trackEvent('subtitle_fetch_success', { 
              imdbId, 
              count: fetchedSubtitles.length
            });
            setSubtitles(fetchedSubtitles);
            
            // Guardar en caché para futuras visitas (24h)
            try {
              const safeImdbId = imdbId.replace(/[^a-zA-Z0-9]/g, '_');
              sessionStorage.setItem(`subtitles_${safeImdbId}`, JSON.stringify(fetchedSubtitles));
              
              // Implementar limpieza de caché basada en LRU
              const MAX_CACHE_ITEMS = CONSTANTS.MAX_CACHED_SUBTITLES; 
              
              // Mantener un índice de las claves en caché
              let subtitleIndex: string[] = [];
              try {
                const indexStr = sessionStorage.getItem('subtitleCacheIndex');
                subtitleIndex = indexStr ? JSON.parse(indexStr) : [];
              } catch (e) {
                subtitleIndex = [];
              }
              
              // Actualizar el índice LRU
              const cacheKey = `subtitles_${safeImdbId}`;
              subtitleIndex = subtitleIndex.filter(k => k !== cacheKey);
              subtitleIndex.unshift(cacheKey); // Poner al frente de la lista
              
              // Limpiar entradas antiguas si superamos el límite
              if (subtitleIndex.length > MAX_CACHE_ITEMS) {
                const toRemove = subtitleIndex.splice(MAX_CACHE_ITEMS);
                toRemove.forEach(key => sessionStorage.removeItem(key));
              }
              
              // Guardar índice actualizado
              sessionStorage.setItem('subtitleCacheIndex', JSON.stringify(subtitleIndex));
            } catch (cacheError) {
              // Ignorar errores de almacenamiento (posible cuota excedida)
              console.warn('Failed to cache subtitles:', cacheError);
            }
          }
        } catch (error) {
          console.error('Error fetching subtitles:', error);
          trackEvent('subtitle_fetch_error', { 
            imdbId, 
            error: (error as Error).message 
          });
        }
      };

      // Cargar subtítulos de forma diferida para mejorar rendimiento inicial
      const userInteracted = !isPaused || controlsVisible;
      
      if (userInteracted) {
        // Cargar inmediatamente si el usuario ya está interactuando
        loadSubtitles();
      } else {
        // Cargar después de un retraso si el usuario no interactúa
        const timeoutId = setTimeout(loadSubtitles, 2500);
        return () => clearTimeout(timeoutId);
      }
    }, [imdbId, trackEvent, isPaused, controlsVisible]);

    // Handlers
    const handleVideoClick = useCallback((e: React.MouseEvent) => {
      e.preventDefault();
      
      // Si el evento sucedió en un control, evitar propagación para prevenir doble acción
      if ((e.target as HTMLElement).closest('[data-testid="video-controls"]')) {
        return;
      }
      
      const currentTime = Date.now();
      const timeSinceLastClick = currentTime - lastClickTime;
      let actionTaken = false; // Para prevenir acciones múltiples en un solo clic
      
      // Detección precisa de doble clic
      if (timeSinceLastClick < CONSTANTS.DOUBLE_CLICK_THRESHOLD) {
        // Double click - toggle fullscreen
        actionTaken = true;
        if (playerRef.current?.isFullscreen()) {
          playerRef.current.exitFullscreen();
        } else {
          playerRef.current?.requestFullscreen();
        }
        trackEvent('double_click_fullscreen_toggle');
      } else {
        // Comportamiento según el contexto - diferente para pantalla completa o normal
        if (isFullscreen) {
          actionTaken = true;
          // En pantalla completa, alternar visibilidad de controles sin cambiar reproducción
          setControlsVisible(!controlsVisible);
          setIsMouseMoving(true); // Siempre mantener el cursor visible inicialmente
          
          // Si mostramos los controles, programar ocultamiento si el video está en reproducción
          if (!controlsVisible && !isPaused) {
            // Limpiar cualquier timeout pendiente para evitar conflictos
            clearCustomTimeout('controls');
            
            // Programar nuevo ocultamiento
            setCustomTimeout('controls', () => {
              // Verificación adicional - solo ocultar si sigue en reproducción
              if (!isPaused && isFullscreen) {
                setControlsVisible(false);
                setIsMouseMoving(false);
              }
            }, CONSTANTS.CONTROLS_HIDE_DELAY);
          } else if (controlsVisible) {
            // Si estamos ocultando los controles, cancelar cualquier timeout y ocultar inmediatamente
            clearCustomTimeout('controls');
            setControlsVisible(false);
            // Mantener el cursor visible brevemente para evitar desorientación
            setTimeout(() => {
              if (!controlsVisible && isFullscreen && !isPaused) {
                setIsMouseMoving(false);
              }
            }, 200);
          }
        } else if (!actionTaken && playerRef.current) {
          // Fuera de pantalla completa, comportamiento estándar: alternar reproducción/pausa
          actionTaken = true;
          
          if (playerRef.current.paused()) {
            // Intentar reproducir con mejor manejo de estado
            setControlsVisible(true); // Mostrar controles mientras se inicia reproducción
            
            const playPromise = playerRef.current.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => {
                  // Reproducción iniciada exitosamente
                  // Programar ocultamiento de controles si el sitio lo requiere
                  if (deviceCapabilities?.isMobile) {
                    clearCustomTimeout('controls');
                    setCustomTimeout('controls', () => {
                      setControlsVisible(false);
                      setIsMouseMoving(false);
                    }, CONSTANTS.CONTROLS_HIDE_DELAY_MOBILE);
                  }
                })
                .catch(e => {
                  console.error("Play error on click:", e);
                  trackEvent('play_error_click', { error: e.message });
                  
                  // Mantener controles visibles en caso de error para permitir interacción
                  setControlsVisible(true);
                  setIsMouseMoving(true);
                });
            }
          } else {
            // Pausar es inmediato y seguro
            playerRef.current.pause();
            
            // Siempre mantener controles visibles en pausa
            setControlsVisible(true);
            setIsMouseMoving(true);
            clearCustomTimeout('controls');
          }
        }
        
        // Registrar evento solo si se tomó alguna acción
        if (actionTaken) {
          trackEvent('single_click_interaction', { 
            action: isFullscreen ? 'toggle_controls' : 'toggle_playback',
            currentTime: playerRef.current?.currentTime(),
            controlsVisible: controlsVisible
          });
        }
      }
      
      // Actualizar tiempo del último clic
      setLastClickTime(currentTime);
    }, [
      lastClickTime, 
      isFullscreen, 
      controlsVisible, 
      isPaused, 
      setControlsVisible, 
      setIsMouseMoving,
      setCustomTimeout, 
      clearCustomTimeout, 
      trackEvent,
      deviceCapabilities
    ]);

    const handleSubtitleChange = useCallback(async (subtitle: Subtitle | null) => {
      setSelectedSubtitle(subtitle);

      if (playerRef.current) {
        const player = playerRef.current;
        
        try {
          // Remove existing text tracks
          const existingTracks = (player as any).textTracks();

          for (let i = existingTracks.length - 1; i >= 0; i--) {
            player.removeRemoteTextTrack(existingTracks[i]);
          }
      
          if (subtitle) {
            const subtitleUrl = await OpenSubtitlesService.downloadSubtitle(subtitle.SubDownloadLink);
            const track = player.addRemoteTextTrack({
              kind: 'subtitles',
              label: subtitle.LanguageName,
              srclang: subtitle.ISO639,
              src: subtitleUrl,
              default: true
            }, false) as unknown as TextTrack;
            
            if (track) {
              track.mode = 'showing';
              trackEvent('subtitle_changed', { 
                language: subtitle.LanguageName,
                currentTime: player.currentTime()
              });
            }
          } else {
            trackEvent('subtitles_disabled', {
              currentTime: player.currentTime()
            });
          }
        } catch (error) {
          console.error('Error handling subtitles:', error);
          trackEvent('subtitle_error', { error: (error as Error).message });
          toast({
            title: "Subtitle Error",
            description: "Failed to load subtitles. Please try again.",
            status: "error",
            duration: CONSTANTS.ERROR_TOAST_DURATION,
            isClosable: true,
          });
        }
      }
    }, [trackEvent, toast]);

    const handleVolumeChange = useCallback((newVolume: number) => {
      if (playerRef.current) {
        const clampedVolume = Math.max(CONSTANTS.MIN_VOLUME, Math.min(CONSTANTS.MAX_VOLUME, newVolume));
        playerRef.current.volume(clampedVolume);
        setVolume(clampedVolume);
        setIsMuted(clampedVolume === 0);
        saveCurrentState(playerRef.current);
        trackEvent('volume_change', { 
          newVolume: clampedVolume,
          isMuted: clampedVolume === 0
        });
      }
    }, [setVolume, setIsMuted, saveCurrentState, trackEvent]);

    const handleQualityChange = useCallback((newQuality: string) => {
      setSelectedQuality(newQuality);
      onQualityChange(newQuality);
      trackEvent('quality_change', { 
        newQuality,
        previousQuality: selectedQuality,
        currentTime: playerRef.current?.currentTime()
      });
    }, [setSelectedQuality, onQualityChange, selectedQuality, trackEvent]);

    const handleLanguageChange = useCallback((newLanguage: string) => {
      setSelectedLanguage(newLanguage);
      onLanguageChange(newLanguage);
      trackEvent('language_change', { 
        newLanguage,
        previousLanguage: selectedLanguage,
        currentTime: playerRef.current?.currentTime()
      });
    }, [setSelectedLanguage, onLanguageChange, selectedLanguage, trackEvent]);

    // Hotkeys setup
    useHotkeys("space", (e) => {
      e.preventDefault();
      if (playerRef.current) {
        playerRef.current.paused() ? 
        (playerRef.current as any).play().catch((err: any) => console.error(err)) : 
          playerRef.current.pause();
        trackEvent('hotkey_play_pause');
      }
    }, [trackEvent]);

    useHotkeys("m", () => {
      setIsMuted(!isMuted);
      if (playerRef.current) {
        playerRef.current.muted(!playerRef.current.muted());
      }
      trackEvent('hotkey_mute_toggle', { newState: !isMuted });
    }, [isMuted, trackEvent]);

    useHotkeys("f", () => {
      if (playerRef.current) {
        playerRef.current.isFullscreen() ? 
          playerRef.current.exitFullscreen() : 
          playerRef.current.requestFullscreen();
        trackEvent('hotkey_fullscreen_toggle');
      }
    }, [trackEvent]);

    useHotkeys("arrowleft", () => {
      if (playerRef.current) {
        const currentTime = playerRef.current.currentTime() || 0;
        const newTime = Math.max(0, currentTime - CONSTANTS.SEEK_SECONDS);
        playerRef.current.currentTime(newTime);
        trackEvent('hotkey_rewind', { 
          amount: CONSTANTS.SEEK_SECONDS,
          fromTime: currentTime,
          toTime: newTime
        });
      }
    }, [trackEvent]);

    useHotkeys("arrowright", () => {
      if (playerRef.current) {
        const currentTime = playerRef.current.currentTime() || 0;
        const duration = playerRef.current.duration() || 0;
        const newTime = Math.min(duration, currentTime + CONSTANTS.SEEK_SECONDS);
        playerRef.current.currentTime(newTime);
        trackEvent('hotkey_fast_forward', { 
          amount: CONSTANTS.SEEK_SECONDS,
          fromTime: currentTime,
          toTime: newTime
        });
      }
    }, [trackEvent]);

    return (
      <Box
        position="relative"
        ref={containerRef}
        borderRadius={{ base: deviceCapabilities.isMobile ? "none" : "md", md: "xl" }}
        overflow="hidden"
        boxShadow={deviceCapabilities.shouldReduceAnimations ? "md" : "xl"}
        bg={bgColor}
        width="100%"
        height="100%"
        minHeight={{ base: deviceCapabilities.isMobile ? "calc(50vh)" : "calc(55vh)", md: "auto" }}
        maxHeight={{ base: deviceCapabilities.isMobile ? "calc(70vh)" : "calc(65vh)", md: "80vh" }}
        margin={{ base: 0, md: "auto" }}
        _before={deviceCapabilities.shouldUseMinimalUI ? undefined : {
          content: '""',
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backdropFilter: "blur(10px)",
          zIndex: -1,
        }}
        sx={containerStyles}
        // Atributos de rendimiento
        data-video-container
        data-low-power={deviceCapabilities.isLowPower}
        data-mobile={deviceCapabilities.isMobile}
        data-touch={deviceCapabilities.hasTouch}
      >
        <div data-vjs-player>
          <video 
            ref={videoRef}
            className="video-js vjs-big-play-centered"
            playsInline
            onClick={handleVideoClick}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        <SubtitlesDisplay 
          player={playerRef.current} 
          parsedCues={null} 
        />

        <ErrorOverlay 
          isVisible={retryCount >= CONSTANTS.MAX_RETRIES} 
        />


        <Controls
          movieId={imdbId}
          player={playerRef.current}
          isLoading={isLoading}
          isPaused={isPaused}
          isFullscreen={isFullscreen}
          isMuted={isMuted}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          audioTracks={audioTracks}
          selectedAudioTrack={selectedAudioTrack}
          selectedQuality={selectedQuality}
          selectedLanguage={selectedLanguage}
          controlsVisible={controlsVisible}
          availableQualities={availableQualities}
          availableLanguages={availableLanguages}
          title={title}
          onQualityChange={handleQualityChange}
          onLanguageChange={handleLanguageChange}
          onVolumeChange={handleVolumeChange}
          subtitles={subtitles}
          selectedSubtitle={selectedSubtitle ? selectedSubtitle.toString() : null}
          onSubtitleChange={handleSubtitleChange}
        />
      </Box>
    );
  }
);

export default VideoPlayer;