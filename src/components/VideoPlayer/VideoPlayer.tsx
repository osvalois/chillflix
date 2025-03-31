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
import { useNetworkQuality } from "../../hooks/useNetworkQuality";

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
      networkQuality, 
      updateNetworkQuality, 
      isOffline,
      isLowBandwidth,
      recommendedQuality,
      registerBufferingEvent,
      registerPlaybackStall
    } = useNetworkQuality();

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
      
      // Detección de navegadores específicos
      const ua = navigator.userAgent.toLowerCase();
      const isSafari = /^((?!chrome|android).)*safari/i.test(ua) || 
                     (/iphone|ipod|ipad/i.test(ua) && /webkit/i.test(ua) && !/crios|chrome|fxios|firefox/i.test(ua));
      const isIOS = /iphone|ipad|ipod/i.test(ua);
      const isChrome = /chrome/i.test(ua) && !/edge|edg/i.test(ua);
      const isFirefox = /firefox/i.test(ua);
      const isEdge = /edge|edg/i.test(ua);
      
      // Detección de versión de iOS para problemas específicos
      const iOSVersion = isIOS ? parseFloat(
        ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(ua) || [0,''])[1])
        .replace('undefined', '3_2').replace('_', '.').replace('_', '')
      ) || null : null;
      
      // Safari versión
      const safariVersion = isSafari && !isIOS ? parseFloat(
        ('' + (/Version\/([0-9.]+).*Safari/i.exec(ua) || [0,''])[1])
      ) || null : null;
      
      // Detección de capacidades de hardware
      const isLowPower = (() => {
        // Usar hardwareConcurrency si está disponible
        if (navigator.hardwareConcurrency) {
          return navigator.hardwareConcurrency <= 4;
        }
        
        // Heurística basada en dispositivo y memoria
        if ('deviceMemory' in navigator) {
          return (navigator as any).deviceMemory < 4;
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
      const connection = 'connection' in navigator ? (navigator as any).connection : null;
      const isSaveData = connection ? connection.saveData : false;
      const effectiveConnectionType = connection ? connection.effectiveType : '4g';
      const isSlowConnection = effectiveConnectionType === '2g' || effectiveConnectionType === 'slow-2g';
      const isMediumConnection = effectiveConnectionType === '3g';
      const estimatedBandwidth = connection?.downlink ? connection.downlink * 1000 : 5000; // kbps
      
      // Detección de capacidades del navegador para video
      const supportsMSE = 'MediaSource' in window;
      const videoElement = document.createElement('video');
      const supportsHLSNatively = videoElement.canPlayType('application/vnd.apple.mpegurl') !== '';
      const supportsMP4 = videoElement.canPlayType('video/mp4') !== '';
      const supportsWebM = videoElement.canPlayType('video/webm') !== '';
      
      // Soporte de codecs específicos para Safari
      const supportsHEVC = isSafari && ((iOSVersion && iOSVersion >= 11) || 
                                      (safariVersion && safariVersion >= 11));
      const supportsDolbyVision = isSafari && ((iOSVersion && iOSVersion >= 14) || 
                                             (safariVersion && safariVersion >= 14));
      
      // Soporte de tecnologías avanzadas
      const supportsMediaSession = 'mediaSession' in navigator;
      const supportsWakeLock = 'wakeLock' in navigator;
      const supportsEME = 'requestMediaKeySystemAccess' in navigator || 'WebKitMediaKeys' in window;
      
      // Problemas conocidos específicos
      const hasStableHLSImplementation = isSafari || isIOS; // Safari tiene la mejor implementación nativa de HLS
      const requiresUserInteractionForPlay = isIOS || (isSafari && !isIOS); // Safari y iOS requieren interacción del usuario
      const hasAutoplayRestrictions = isIOS || isSafari || isChrome;
      const hasPlaybackIssues = isIOS && iOSVersion && iOSVersion < 12;
      
      // Factores combinados para decisiones de rendimiento
      const shouldUseMinimalUI = isLowPower || isSaveData || isSlowConnection;
      const shouldReduceAnimations = preferReducedMotion || isLowPower || isSaveData || isSlowConnection;
      const shouldUseHDVideo = !shouldUseMinimalUI && !isSlowConnection && !isMediumConnection && !isSmallScreen;
      const shouldPreload = !isSaveData && !isSlowConnection && (!isIOS || (iOSVersion && iOSVersion >= 13));
      const shouldUseLowQualityImages = isSlowConnection || isSaveData || isLowPower;
      
      // Seleccionar configuración óptima basada en el dispositivo y navegador
      let optimizedPlayerOptions;
      
      if (isSafari || isIOS) {
        // Configuración optimizada para Safari/iOS
        optimizedPlayerOptions = {
          ...initialOptions,
          html5: {
            ...initialOptions.html5,
            vhs: {
              ...initialOptions.html5.vhs,
              overrideNative: false, // NUNCA sobreescribir la implementación nativa en Safari/iOS
              enableLowInitialPlaylist: true, // Comenzar con baja calidad para inicio rápido
              cacheEncryptionKeys: true,
              limitRenditionByPlayerDimensions: true,
              useDevicePixelRatio: true, // Considerar pantallas retina para calidad
            }
          },
          // Configuraciones específicas para Safari
          techOrder: ['html5'], // Utilizar solo HTML5 en Safari
          preload: isIOS ? 'metadata' : 'auto', // En iOS precargar solo metadatos
          allowedEvents: ['loadstart', 'loadedmetadata', 'canplay'], // Eventos clave para monitoreo
          // Reproducción optimizada
          playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
          // Usar volumen nativo
          volumePanel: {
            inline: false,
            vertical: true
          }
        };
      } else if (isLowPower || isSlowConnection) {
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
        
        // Navegador
        isSafari,
        isIOS,
        isChrome,
        isFirefox,
        isEdge,
        iOSVersion,
        safariVersion,
        
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
        
        // Capacidades de vídeo y multimedia
        supportsMSE,
        supportsHLSNatively,
        supportsMP4,
        supportsWebM,
        supportsHEVC,
        supportsDolbyVision,
        supportsMediaSession,
        supportsWakeLock,
        supportsEME,
        
        // Problemas conocidos
        hasStableHLSImplementation,
        requiresUserInteractionForPlay,
        hasAutoplayRestrictions,
        hasPlaybackIssues,
        
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
      
      // Optimizaciones especiales para Safari/iOS
      const isSafari = deviceCapabilities.isSafari || deviceCapabilities.isIOS;
      
      // Optimizaciones para Safari/iOS después de que el reproductor esté listo
      if (deviceCapabilities.isSafari || deviceCapabilities.isIOS) {
        try {
          // Forzar precargar imagen del poster para mejor experiencia
          if (player.poster() && typeof player.preload === 'function') {
            const img = new Image();
            img.src = player.poster();
          }
          
          // Optimizar la reproducción HLS nativa en Safari
          if (player.tech_ && player.tech_.hls) {
            // Aplicar configuraciones HLS avanzadas específicas de Safari
            const hlsObj = player.tech_.hls;
            if (hlsObj && typeof hlsObj.bandwidth === 'number') {
              // Ajustar bitrate inicial para mejorar arranque en Safari
              hlsObj.bandwidth = deviceCapabilities.isSlowConnection ? 1000000 : 3000000;
              
              // Desactivar ABR agresivo en iOS para evitar cambios de calidad frecuentes
              if (deviceCapabilities.isIOS && hlsObj.representations) {
                hlsObj.representations().sort((a: any, b: any) => b.bandwidth - a.bandwidth);
              }
            }
          }
          
          // Optimizaciones específicas de audio para Safari
          const videoElement = player.el().querySelector('video');
          if (videoElement) {
            // Mejorar manejo de audio en Safari/iOS
            videoElement.setAttribute('x-webkit-airplay', 'allow');
            
            // Mejoras de audio para iOS
            if (deviceCapabilities.isIOS) {
              // Configuración explícita del audio para iOS
              videoElement.playsInline = true;
              videoElement.controls = false; // Usar controles personalizados
              
              // Mejorar sincronización entre audio y video en iOS
              if (player.audioTracks && player.audioTracks()) {
                const audioTracks = player.audioTracks();
                for (let i = 0; i < audioTracks.length; i++) {
                  // Asegurar que las pistas de audio estén correctamente configuradas
                  audioTracks[i].enabled = i === 0; // Activar primera pista por defecto
                }
              }
              
              // Reparar problemas conocidos de audio en iOS
              if (deviceCapabilities.iOSVersion && deviceCapabilities.iOSVersion < 15) {
                // Solución para problemas de audio en iOS antiguos
                const fixAudioContext = () => {
                  try {
                    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                    if (AudioContext) {
                      const audioCtx = new AudioContext();
                      // Crear un nodo ficticio para forzar la activación del contexto de audio
                      const oscillator = audioCtx.createOscillator();
                      oscillator.frequency.value = 0; // Silencio
                      oscillator.connect(audioCtx.destination);
                      oscillator.start(0);
                      oscillator.stop(0.1);
                    }
                  } catch (e) {
                    console.warn('[VideoPlayer] Error al inicializar AudioContext:', e);
                  }
                };
                
                // Aplicar fix de audio al primer gesto del usuario
                const userInteractionHandler = () => {
                  fixAudioContext();
                  document.removeEventListener('touchstart', userInteractionHandler);
                  document.removeEventListener('mousedown', userInteractionHandler);
                };
                
                document.addEventListener('touchstart', userInteractionHandler, { once: true });
                document.addEventListener('mousedown', userInteractionHandler, { once: true });
              }
            }
            
            // Optimizaciones de audio para Safari de escritorio
            if (deviceCapabilities.isSafari && !deviceCapabilities.isIOS) {
              // Mejorar compatibilidad de audio en Safari de escritorio
              if (deviceCapabilities.safariVersion && deviceCapabilities.safariVersion >= 15) {
                // Safari moderno tiene mejor soporte para audio espacial
                videoElement.setAttribute('x-webkit-airplay', 'allow');
                
                // Habilitar gestión avanzada de audio para Safari 15+
                if (player.audioTracks && player.audioTracks()) {
                  player.on('audiochange', () => {
                    // Forzar actualización del contexto de audio al cambiar pistas
                    player.trigger('audioupdate');
                  });
                }
              }
            }
          }
        } catch (e) {
          // Ignorar errores de optimización - no son críticos
          console.warn("[VideoPlayer] Error al aplicar optimizaciones Safari:", e);
        }
      }

      const eventHandlers = {
        // Detección de buffering mejorada específica por navegador
        waiting: () => {
          setIsLoading(true);
          setIsBuffering(true);
          
          // Registrar evento de buffering para análisis de calidad de red
          registerBufferingEvent();
          
          // Tiempo de espera adaptativo basado en el navegador y la conexión
          let bufferThreshold = CONSTANTS.BUFFER_THRESHOLD;
          
          // Ajustes especiales para diferentes navegadores
          if (deviceCapabilities.isSafari) {
            bufferThreshold *= 1.5; // Safari necesita más tiempo
          } else if (deviceCapabilities.isIOS) {
            bufferThreshold *= 2.0; // iOS necesita aún más tiempo
          }
          
          // Ajustes basados en red
          if (deviceCapabilities.isSlowConnection) {
            bufferThreshold *= 2.0; // Conexiones lentas necesitan más tiempo
          } else if (deviceCapabilities.isMediumConnection) {
            bufferThreshold *= 1.5; // Conexiones medias
          }
          
          // Controlar el buffering prolongado
          setCustomTimeout('buffer', () => {
            if (isBuffering) {
              // Registrar eventos de buffering prolongado
              trackEvent('long_buffering', { 
                duration: bufferThreshold,
                currentTime: player.currentTime(),
                networkQuality: networkQuality,
                isLowBandwidth: isLowBandwidth,
                recommendedQuality: recommendedQuality,
                browser: deviceCapabilities.isSafari ? 'safari' : 
                        deviceCapabilities.isIOS ? 'ios' :
                        deviceCapabilities.isChrome ? 'chrome' : 
                        deviceCapabilities.isFirefox ? 'firefox' : 'other'
              });
              
              // Registrar como stall si es muy largo
              if (bufferThreshold > 1000) {
                registerPlaybackStall(bufferThreshold);
                
                // Estrategias de recuperación específicas por navegador
                if ((deviceCapabilities.isSafari || deviceCapabilities.isIOS) && player && !player.paused()) {
                  try {
                    // Técnica de recuperación específica para Safari/iOS
                    const currentTime = player.currentTime();
                    const duration = player.duration() || 0;
                    
                    // Verificar si el video tiene información de buffer
                    const buffered = player.buffered();
                    if (buffered && buffered.length > 0) {
                      // Recuperación inteligente basada en buffer disponible
                      const bufferEnd = buffered.end(buffered.length - 1);
                      const bufferStart = buffered.start(0);
                      
                      if (currentTime < bufferEnd - 2) {
                        // Si hay suficiente buffer por delante, avanzar a una posición con buffer
                        const newTime = Math.min(currentTime + 1.5, bufferEnd - 0.5);
                        console.log(`[VideoPlayer] Recuperación: Avanzando de ${currentTime} a ${newTime}`);
                        player.currentTime(newTime);
                      } else if (currentTime > bufferStart + 10) {
                        // Si estamos cerca del final del buffer, retroceder para rebuffering
                        const newTime = Math.max(currentTime - 3, bufferStart + 1);
                        console.log(`[VideoPlayer] Recuperación: Retrocediendo de ${currentTime} a ${newTime}`);
                        player.currentTime(newTime);
                      } else {
                        // Caso extremo: alternar entre pausa y reproducción puede ayudar
                        console.log(`[VideoPlayer] Recuperación: Alternando pausa/reproducción`);
                        player.pause();
                        setTimeout(() => {
                          if (player && !player.isDisposed()) {
                            player.play().catch(() => {});
                          }
                        }, 250);
                      }
                    } else {
                      // Fallback: retroceder un poco si no hay información de buffer
                      if (currentTime > 0.5) {
                        const newTime = Math.max(0, currentTime - 0.5);
                        console.log(`[VideoPlayer] Recuperación fallback: Retrocediendo a ${newTime}`);
                        player.currentTime(newTime);
                      }
                    }
                    
                    // Forzar actualización del elemento de video (técnica específica para Safari)
                    const videoElem = player.el().querySelector('video');
                    if (videoElem) {
                      videoElem.style.display = 'none';
                      // Forzar reflow
                      void videoElem.offsetHeight;
                      setTimeout(() => { videoElem.style.display = 'block'; }, 10);
                    }
                  } catch (e) {
                    console.warn("[VideoPlayer] Error en recuperación de buffering:", e);
                  }
                } else if (deviceCapabilities.isChrome && player && !player.paused()) {
                  // Recuperación específica para Chrome
                  try {
                    // En Chrome, a veces ayuda alternar la tasa de reproducción
                    const currentRate = player.playbackRate();
                    player.playbackRate(0.5); // Reducir velocidad temporalmente
                    setTimeout(() => {
                      if (player && !player.isDisposed()) {
                        player.playbackRate(currentRate); // Restaurar
                      }
                    }, 200);
                  } catch (e) {
                    // Ignorar errores de recuperación
                  }
                }
              }
            }
          }, bufferThreshold);
        },
        // Evento canplay mejorado con optimizaciones por navegador
        canplay: () => {
          setIsLoading(false);
          setIsBuffering(false);
          clearCustomTimeout('buffer');
          
          // Optimizaciones específicas por navegador cuando el contenido está listo para reproducir
          if (deviceCapabilities.isSafari && player) {
            try {
              // Aplicar hack de forzado de visualización en Safari
              const videoElem = player.el().querySelector('video');
              if (videoElem) {
                // Forzar repintado para resolver problemas de visualización en Safari
                const currentDisplay = videoElem.style.display;
                videoElem.style.display = 'none';
                // Forzar reflow
                void videoElem.offsetHeight;
                setTimeout(() => { videoElem.style.display = currentDisplay || 'block'; }, 0);
              }
              
              // En Safari, verificar si realmente podemos reproducir (prevenir falsos positivos)
              if (player.readyState() < 3) { // HAVE_FUTURE_DATA
                // Establecer un timeout de seguridad para volver a verificar
                setTimeout(() => {
                  if (player && !player.isDisposed() && player.readyState() >= 3) {
                    // Ahora sí podemos reproducir con confianza
                    setIsLoading(false);
                  }
                }, 50);
              }
              
              // Optimizar reproducción de audio
              if (deviceCapabilities.isIOS) {
                // En iOS, intentar restaurar contexto de audio si está suspendido
                try {
                  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                  if (AudioContext && (window as any).audioContext && 
                      (window as any).audioContext.state === 'suspended') {
                    (window as any).audioContext.resume().catch(() => {});
                  }
                } catch (e) {
                  // Ignorar errores de audio
                }
              }
            } catch (e) {
              console.warn("[VideoPlayer] Error en optimizaciones canplay:", e);
            }
          }
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
            
            // Actualizar métricas de calidad de red usando el buffer actual
            try {
              const buffered = player.buffered();
              if (buffered && buffered.length > 0) {
                const bufferEnd = buffered.end(buffered.length - 1);
                updateNetworkQuality(bufferEnd, time, player.duration());
              }
            } catch (e) {
              // Ignorar errores en la detección de buffer
            }
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
      clearCustomTimeout, registerBufferingEvent, registerPlaybackStall,
      networkQuality, isLowBandwidth, recommendedQuality, updateNetworkQuality
    ]);

    // Inicialización avanzada del reproductor con optimizaciones específicas para el dispositivo
    useEffect(() => {
      if (!playerRef.current && videoRef.current) {
        const videoElement = videoRef.current;
        
        // Asegurarse de que videojs está disponible
        if (typeof videojs === 'undefined') {
          console.error('[VideoPlayer] Error: videojs no está disponible');
          return;
        }
        
        try {
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
          
          // Aplicar optimizaciones especiales para Safari/iOS
          if (deviceCapabilities.isSafari || deviceCapabilities.isIOS) {
            // Optimizaciones de video específicas para Safari
            if (videoElement) {
              // Atributos críticos para reproducción en Safari
              videoElement.setAttribute('playsinline', 'true');
              videoElement.setAttribute('webkit-playsinline', 'true');
              videoElement.setAttribute('x-webkit-airplay', 'allow');
              
              // Requerido para streaming adaptativo en iOS
              videoElement.setAttribute('autoplaysinline', 'true');
              
              // Habilitar Picture-in-Picture en Safari
              videoElement.setAttribute('autopictureinpicture', 'true');
              
              // Mejorar la reproducción de audio en Safari
              videoElement.setAttribute('preload', deviceCapabilities.isIOS ? 'metadata' : 'auto');
              
              // Configurar crossorigin para recursos externos (crucial para audio)
              if (options.sources?.some(src => 
                  src.src && !src.src.startsWith(window.location.origin) && 
                  !src.src.startsWith('blob:') && !src.src.startsWith('data:'))) {
                videoElement.setAttribute('crossorigin', 'anonymous');
              }
              
              // Optimizaciones de rendimiento para iOS
              if (deviceCapabilities.isIOS) {
                // Mejoras de rendimiento específicas para iOS
                videoElement.setAttribute('autoplay-policy', 'user-gesture-required');
                
                // Ajustes específicos para iPads
                if (deviceCapabilities.isTablet && deviceCapabilities.isIOS) {
                  videoElement.setAttribute('disablePictureInPicture', 'false');
                  videoElement.setAttribute('disableRemotePlayback', 'false');
                }
                
                // Optimizaciones para versiones específicas de iOS
                if (deviceCapabilities.iOSVersion) {
                  if (deviceCapabilities.iOSVersion >= 14) {
                    // En iOS 14+ podemos usar funciones avanzadas de audio
                    videoElement.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture');
                    
                  } else if (deviceCapabilities.iOSVersion < 13) {
                    // Para iOS antiguo, forzar repintado para prevenir pantalla en negro
                    videoElement.onloadeddata = () => {
                      videoElement.style.display = 'none';
                      setTimeout(() => { videoElement.style.display = 'block'; }, 0);
                    };
                  }
                }
                
                // Forzar actualización del layout para prevenir problemas en cualquier versión
                videoElement.addEventListener('canplay', () => {
                  const currentDisplay = videoElement.style.display;
                  videoElement.style.display = 'none';
                  // Forzar reflow
                  void videoElement.offsetHeight;
                  setTimeout(() => { videoElement.style.display = currentDisplay || 'block'; }, 0);
                }, { once: true });
              }
              
              // Optimizaciones para Safari de escritorio
              if (deviceCapabilities.isSafari && !deviceCapabilities.isIOS) {
                // Habilitar funciones avanzadas en Safari moderno
                if (deviceCapabilities.safariVersion && deviceCapabilities.safariVersion >= 15) {
                  videoElement.setAttribute('controlslist', 'nodownload');
                  
                  // Habilitar soporte de color HDR si está disponible
                  if (deviceCapabilities.supportsHEVC) {
                    try {
                      // @ts-ignore - La propiedad puede no estar en todas las definiciones de TS
                      videoElement.colorSpace = 'rec2020';
                    } catch (e) {
                      // Ignorar errores - funcionalidad experimental
                    }
                  }
                } else {
                  // Para Safari antiguo, evitar algunas características problemáticas
                  videoElement.setAttribute('disableRemotePlayback', 'true');
                }
              }
            }
            
            // Configurar opciones específicas para tipos de reproducción en Safari
            enhancedOptions.html5 = {
              ...enhancedOptions.html5,
              // Optimización principal: usar audio y video nativos en Safari
              nativeAudioTracks: true,
              nativeVideoTracks: true,
              nativeTextTracks: true,
              // Habilitar opciones específicas de Safari y iOS
              vhs: {
                ...(enhancedOptions.html5?.vhs || {}),
                overrideNative: false, // NUNCA sobreescribir la implementación nativa en Safari/iOS
                enableLowInitialPlaylist: true, // Comenzar con baja calidad para inicio rápido
                cacheEncryptionKeys: true,
                // Ajustes específicos para versiones de Safari/iOS
                backBufferLength: deviceCapabilities.isIOS ? 10 : 20,
                // Configuración de rendimiento para streaming adaptativo
                bandwidth: deviceCapabilities.isSlowConnection ? 1000000 : 
                           deviceCapabilities.isMobile ? 2500000 : 5500000,
                // Mejorar estabilidad en Safari
                useForcedSubtitles: true,
                // Ajustes de calidad adaptativa específicos para Safari
                limitRenditionByPlayerDimensions: deviceCapabilities.isHighDensityDisplay,
                useDevicePixelRatio: deviceCapabilities.isHighDensityDisplay,
                // Parámetros específicos para Safari
                fastQualityChange: true,
                maxPlaylistRetries: deviceCapabilities.isIOS ? 8 : 5,
              }
            };
            
            // Garantizar uso del reproductor nativo de HLS en Safari (crucial)
            enhancedOptions.techOrder = ['html5'];
            
            // Ajustes de audio para Safari
            // Configuración directa del audio sin usar plugins
            enhancedOptions.audioSettings = {
              defaultVolume: 1.0
            };
            
            // Configuración específica del panel de volumen
            enhancedOptions.controlBar = {
              ...enhancedOptions.controlBar,
              volumePanel: {
                inline: deviceCapabilities.isIOS, // Panel horizontal en iOS
                vertical: !deviceCapabilities.isIOS // Vertical en otros
              }
            };
          }
          
          // Log de configuración para depuración (solo en desarrollo)
          if (process.env.NODE_ENV === 'development') {
            console.debug('[VideoPlayer] Inicializando con opciones optimizadas:', {
              deviceType: deviceCapabilities.isMobile ? 'mobile' : deviceCapabilities.isTablet ? 'tablet' : 'desktop',
              browser: deviceCapabilities.isSafari ? 'Safari/iOS' : 
                       deviceCapabilities.isChrome ? 'Chrome' : 
                       deviceCapabilities.isFirefox ? 'Firefox' : 'Other',
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
              // Optimizar tipo de fuente para diferentes navegadores
              if (options.sources?.length) {
                let sourcesToUse = [...options.sources]; // Copiar para no modificar las originales
                
                // Asegurarse de que todas las fuentes tengan tipo explícito
                sourcesToUse = sourcesToUse.map(source => ({
                  ...source,
                  // Asegurar que tenga tipo definido para mejor compatibilidad
                  type: source.type || (
                    source.src?.includes('.m3u8') ? 'application/vnd.apple.mpegurl' :
                    source.src?.includes('.mp4') ? 'video/mp4' :
                    source.src?.includes('.webm') ? 'video/webm' :
                    source.src?.includes('.mkv') ? 'video/x-matroska' :
                    source.src?.includes('.mpd') ? 'application/dash+xml' :
                    'video/mp4' // Por defecto
                  )
                }));
                
                // Optimizaciones específicas por navegador
                if (deviceCapabilities.isSafari || deviceCapabilities.isIOS) {
                  // Para Safari/iOS, priorizar fuentes HLS nativas
                  const hlsSources = sourcesToUse.filter(s => 
                    s.type === 'application/x-mpegURL' || 
                    s.type === 'application/vnd.apple.mpegurl' ||
                    (s.src && (s.src.includes('.m3u8') || s.src.includes('hls')))
                  );
                  
                  if (hlsSources.length > 0) {
                    console.log("[VideoPlayer] Usando fuentes HLS nativas para Safari/iOS");
                    player.src(hlsSources);
                    previousSourceRef.current = hlsSources[0]?.src || null;
                  } else {
                    // Si no hay HLS, preferir MP4 para Safari
                    const mp4Sources = sourcesToUse.filter(s => 
                      s.type === 'video/mp4' || (s.src && s.src.includes('.mp4'))
                    );
                    
                    if (mp4Sources.length > 0) {
                      console.log("[VideoPlayer] Usando fuentes MP4 para Safari/iOS");
                      player.src(mp4Sources);
                      previousSourceRef.current = mp4Sources[0]?.src || null;
                    } else {
                      // Si no hay MP4, usar lo que haya disponible
                      console.log("[VideoPlayer] Usando fuentes genéricas para Safari/iOS");
                      player.src(sourcesToUse);
                      previousSourceRef.current = sourcesToUse[0]?.src || null;
                    }
                  }
                } else if (deviceCapabilities.isChrome || deviceCapabilities.isFirefox) {
                  // Chrome y Firefox tienen excelente soporte para diferentes formatos
                  // Priorizar fuentes según el navegador
                  if (deviceCapabilities.isChrome) {
                    // Chrome: Priorizar DASH > HLS > WebM > MP4
                    const dashSources = sourcesToUse.filter(s => s.type === 'application/dash+xml');
                    const hlsSources = sourcesToUse.filter(s => 
                      s.type?.includes('mpegurl') || (s.src && s.src.includes('.m3u8'))
                    );
                    const webmSources = sourcesToUse.filter(s => s.type === 'video/webm');
                    
                    if (dashSources.length) {
                      console.log("[VideoPlayer] Usando fuentes DASH para Chrome");
                      player.src(dashSources);
                      previousSourceRef.current = dashSources[0]?.src || null;
                    } else if (hlsSources.length) {
                      console.log("[VideoPlayer] Usando fuentes HLS para Chrome");
                      player.src(hlsSources);
                      previousSourceRef.current = hlsSources[0]?.src || null;
                    } else if (webmSources.length && !deviceCapabilities.isLowPower) {
                      console.log("[VideoPlayer] Usando fuentes WebM para Chrome");
                      player.src(webmSources);
                      previousSourceRef.current = webmSources[0]?.src || null;
                    } else {
                      console.log("[VideoPlayer] Usando fuentes genéricas para Chrome");
                      player.src(sourcesToUse);
                      previousSourceRef.current = sourcesToUse[0]?.src || null;
                    }
                  } else {
                    // Firefox: similar a Chrome pero diferente prioridad
                    // Priorizar HLS > DASH > MP4 > WebM
                    const hlsSources = sourcesToUse.filter(s => 
                      s.type?.includes('mpegurl') || (s.src && s.src.includes('.m3u8'))
                    );
                    const dashSources = sourcesToUse.filter(s => s.type === 'application/dash+xml');
                    const mp4Sources = sourcesToUse.filter(s => s.type === 'video/mp4');
                    
                    if (hlsSources.length) {
                      console.log("[VideoPlayer] Usando fuentes HLS para Firefox");
                      player.src(hlsSources);
                      previousSourceRef.current = hlsSources[0]?.src || null;
                    } else if (dashSources.length) {
                      console.log("[VideoPlayer] Usando fuentes DASH para Firefox");
                      player.src(dashSources);
                      previousSourceRef.current = dashSources[0]?.src || null;
                    } else if (mp4Sources.length) {
                      console.log("[VideoPlayer] Usando fuentes MP4 para Firefox");
                      player.src(mp4Sources);
                      previousSourceRef.current = mp4Sources[0]?.src || null;
                    } else {
                      console.log("[VideoPlayer] Usando fuentes genéricas para Firefox");
                      player.src(sourcesToUse);
                      previousSourceRef.current = sourcesToUse[0]?.src || null;
                    }
                  }
                } else {
                  // Para otros navegadores, usar configuración estándar
                  console.log("[VideoPlayer] Usando fuentes estándar para navegador genérico");
                  player.src(sourcesToUse);
                  previousSourceRef.current = sourcesToUse[0]?.src || null;
                }
                
                // Mejorar calidad de audio para todos los navegadores
                if (player.audioTracks && player.audioTracks()) {
                  try {
                    const tracks = player.audioTracks();
                    if (tracks.length > 0) {
                      // Seleccionar pista de audio de mejor calidad por defecto
                      // Generalmente la que tiene 'high', 'hd', 'main' o mayor número de canales
                      let bestTrackIndex = 0;
                      let bestScore = -1;
                      
                      for (let i = 0; i < tracks.length; i++) {
                        const track = tracks[i];
                        let score = 0;
                        
                        // Preferir pistas con más canales (generalmente indica mejor calidad)
                        if (track.channelCount) score += track.channelCount * 10;
                        
                        // Preferir pistas con indicadores de calidad en el nombre
                        const label = track.label?.toLowerCase() || '';
                        if (label.includes('high') || label.includes('hd')) score += 50;
                        if (label.includes('main')) score += 30;
                        if (label.includes('stereo')) score += 20;
                        if (label.includes('surround') || label.includes('5.1') || label.includes('7.1')) score += 40;
                        
                        if (score > bestScore) {
                          bestScore = score;
                          bestTrackIndex = i;
                        }
                      }
                      
                      // Activar la mejor pista de audio
                      for (let i = 0; i < tracks.length; i++) {
                        tracks[i].enabled = (i === bestTrackIndex);
                      }
                    }
                  } catch (e) {
                    console.warn("[VideoPlayer] Error al optimizar pistas de audio:", e);
                  }
                }
              } else {
                console.warn("[VideoPlayer] No se proporcionaron fuentes de video");
              }
              
              // Estrategia de precarga adaptativa según navegador
              if (deviceCapabilities.shouldPreload && !deviceCapabilities.isIOS) {
                // Precarga optimizada para navegadores no iOS
                player.one('loadedmetadata', () => {
                  const preloadStrategy = async () => {
                    try {
                      // Estrategia modificada para Safari (evitar cambios rápidos de currentTime)
                      if (deviceCapabilities.isSafari) {
                        // En Safari, hacer precarga más suave
                        player.currentTime(0);
                        
                        // Solo precargar si hay buena conexión
                        if (!deviceCapabilities.isSlowConnection) {
                          // Precargar sutilmente
                          setTimeout(() => {
                            player.currentTime(0.5);
                            setTimeout(() => player.currentTime(0), 200);
                          }, 300);
                        }
                      } else {
                        // Para otros navegadores, precarga más agresiva
                        player.currentTime(0.1);
                        await new Promise(resolve => setTimeout(resolve, 100));
                        player.currentTime(0);
                        
                        if (deviceCapabilities.estimatedBandwidth > 5000) {
                          player.currentTime(5);
                          await new Promise(resolve => setTimeout(resolve, 50));
                          player.currentTime(0);
                        }
                      }
                    } catch (e) {
                      // Ignorar errores de precarga - no son críticos
                      player.currentTime(0);
                    }
                  };
                  
                  preloadStrategy().catch(() => {});
                });
              } else {
                // Para iOS o conexiones lentas, solo lo mínimo necesario
                player.currentTime(0);
              }
            } catch (error) {
              console.error("[VideoPlayer] Error al establecer fuente inicial:", error);
              setRetryCount(prev => prev + 1);
            }
          }
        } catch (error) {
          console.error("[VideoPlayer] Error al inicializar el reproductor:", error);
          setRetryCount(prev => prev + 1);
          return; // Salir si hay error en la inicialización
        }
        
        // Referencia al player para usar en la configuración de observadores
        const player = playerRef.current;
        if (!player) return;
        
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
            if (!entry.isIntersecting && player && !player.paused()) {
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
            // Manejo especial para Safari/iOS
            if (deviceCapabilities.isSafari || deviceCapabilities.isIOS) {
              try {
                // Obtener el elemento de video nativo
                const videoElem = player.el()?.querySelector('video');
                if (videoElem) {
                  // Aplicar optimizaciones para Safari/iOS
                  videoElem.setAttribute('playsinline', 'true');
                  videoElem.setAttribute('webkit-playsinline', 'true');
                  videoElem.setAttribute('x-webkit-airplay', 'allow');
                  
                  // Intentar reproducción nativa
                  console.log("[VideoPlayer] Reanudando reproducción nativa en Safari/iOS");
                  videoElem.play().catch(nativeErr => {
                    console.warn("[VideoPlayer] Error al reanudar reproducción nativa:", nativeErr);
                    // Si falla la reproducción nativa, intentamos con el reproductor
                    if (player && !player.isDisposed()) {
                      player.play().catch(e => {
                        console.error("Play error after source change:", e);
                        trackEvent('play_error_source_change', { error: e.message });
                      });
                    }
                  });
                } else {
                  // Fallback al método normal
                  player.play().catch(e => {
                    console.error("Play error after source change:", e);
                    trackEvent('play_error_source_change', { error: e.message });
                  });
                }
              } catch (safariErr) {
                console.error("[VideoPlayer] Error al reanudar en Safari:", safariErr);
                // Intentar con el método estándar
                player.play().catch(e => {
                  console.error("Play error after source change:", e);
                  trackEvent('play_error_source_change', { error: e.message });
                });
              }
            } else {
              // Navegadores no Safari - manejo normal
              player.play().catch(e => {
                console.error("Play error after source change:", e);
                trackEvent('play_error_source_change', { error: e.message });
              });
            }
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
            
            // Manejo especial para Safari/iOS para evitar NotSupportedError
            if (deviceCapabilities.isSafari || deviceCapabilities.isIOS) {
              try {
                // En Safari, necesitamos manejar la reproducción de manera diferente
                // debido a las políticas de interacción de usuario
                const videoElem = playerRef.current.el()?.querySelector('video');
                if (videoElem) {
                  // Paso 1: Activar contexto de audio si existe
                  try {
                    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
                    if (AudioContext && !(window as any).___audioContext) {
                      (window as any).___audioContext = new AudioContext();
                    }
                    
                    if ((window as any).___audioContext?.state === 'suspended') {
                      (window as any).___audioContext.resume().catch(() => {});
                    }
                  } catch (audioErr) {
                    console.warn("[VideoPlayer] Error al inicializar AudioContext:", audioErr);
                  }
                  
                  // Paso 2: Forzar atributos críticos antes de reproducir
                  videoElem.setAttribute('playsinline', 'true');
                  videoElem.setAttribute('webkit-playsinline', 'true');
                  videoElem.setAttribute('x-webkit-airplay', 'allow');
                  videoElem.muted = false; // Asegurar que no esté silenciado
                  
                  // Paso 3: Usar play() directo en el elemento de video nativo
                  console.log("[VideoPlayer] Intentando reproducción nativa en Safari/iOS");
                  videoElem.play()
                    .then(() => {
                      console.log("[VideoPlayer] Reproducción nativa exitosa en Safari/iOS");
                      // Programar ocultamiento de controles si corresponde
                      if (deviceCapabilities.isMobile) {
                        clearCustomTimeout('controls');
                        setCustomTimeout('controls', () => {
                          setControlsVisible(false);
                          setIsMouseMoving(false);
                        }, CONSTANTS.CONTROLS_HIDE_DELAY_MOBILE);
                      }
                    })
                    .catch(err => {
                      console.warn("[VideoPlayer] Error en reproducción nativa:", err);
                      // Mostrar controles si falla la reproducción
                      setControlsVisible(true);
                      setIsMouseMoving(true);
                      
                      // Si es un error de interacción, mostrar mensaje en consola
                      if (err.name === 'NotAllowedError') {
                        console.info("[VideoPlayer] Safari requiere interacción del usuario para reproducir audio");
                      }
                    });
                } else {
                  // Si no podemos acceder al elemento de video nativo, intentar con playerRef
                  console.log("[VideoPlayer] Fallback a reproducción vía VideoJS");
                  playerRef.current.play().catch(e => {
                    console.error("[VideoPlayer] Error de reproducción fallback:", e);
                    // Mantener controles visibles en caso de error
                    setControlsVisible(true);
                    setIsMouseMoving(true);
                  });
                }
              } catch (safariErr) {
                console.error("[VideoPlayer] Error completo en Safari:", safariErr);
                // Mantener controles visibles
                setControlsVisible(true);
                setIsMouseMoving(true);
              }
            } else {
              // Navegadores no Safari - manejo normal
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
        if (playerRef.current.paused()) {
          // Si está pausado, intentar reproducir
          if (deviceCapabilities.isSafari || deviceCapabilities.isIOS) {
            // Manejo específico para Safari/iOS
            try {
              const videoElem = playerRef.current.el()?.querySelector('video');
              if (videoElem) {
                // Asegurar atributos clave para Safari
                videoElem.setAttribute('playsinline', 'true');
                videoElem.setAttribute('webkit-playsinline', 'true');
                
                // Intentar reproducción nativa
                videoElem.play().catch(nativeErr => {
                  console.warn("[VideoPlayer] Error en hotkey para Safari:", nativeErr);
                  // Si falla, intentar a través del player
                  playerRef.current?.play().catch(err => console.error("[VideoPlayer] Hotkey play error:", err));
                });
              } else {
                // Fallback al método estándar
                playerRef.current.play().catch(err => console.error("[VideoPlayer] Hotkey play error:", err));
              }
            } catch (safariErr) {
              console.error("[VideoPlayer] Error de Safari en hotkey:", safariErr);
              playerRef.current.play().catch(err => console.error("[VideoPlayer] Hotkey play error:", err));
            }
          } else {
            // Otros navegadores - método estándar
            (playerRef.current as any).play().catch((err: any) => console.error("[VideoPlayer] Hotkey play error:", err));
          }
        } else {
          // Pausar es siempre seguro
          playerRef.current.pause();
        }
        trackEvent('hotkey_play_pause');
      }
    }, [trackEvent, deviceCapabilities]);

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