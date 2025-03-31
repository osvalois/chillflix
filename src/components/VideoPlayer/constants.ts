import { PlayerOptions } from "../../types";

// constants.ts

export const PLAYER_READY_STATE = {
    HAVE_NOTHING: 0,
    HAVE_METADATA: 1,
    HAVE_CURRENT_DATA: 2,
    HAVE_FUTURE_DATA: 3,
    HAVE_ENOUGH_DATA: 4
} as const;

export const SAVE_CONFIG_DELAY = 1000; // 1 segundo
export const LOCAL_STORAGE_PREFIX = 'videoPlayer';
export const VOLUME_STEP = 0.1;
export const SEEK_STEP = 5; // segundos
export const CONTROLS_HIDE_DELAY = 5000; // 5 segundos

export const ERROR_MESSAGES = {
    PLAYBACK: "Error al reproducir el video",
    VOLUME: "Error al ajustar el volumen",
    SEEK: "Error al buscar en el video",
    FULLSCREEN: "Error al cambiar el modo de pantalla completa",
    CONFIG_LOAD: "Error al cargar la configuración",
    CONFIG_SAVE: "Error al guardar la configuración"
} as const;

export const ANALYTICS_EVENTS = {
    PLAY_TOGGLE: 'playback_toggled',
    VOLUME_CHANGE: 'volume_changed',
    SEEK: 'seek_performed',
    QUALITY_CHANGE: 'quality_changed',
    LANGUAGE_CHANGE: 'language_changed',
    SUBTITLE_CHANGE: 'subtitle_changed',
    AUDIO_TRACK_CHANGE: 'audio_track_changed',
    FULLSCREEN_TOGGLE: 'fullscreen_toggled',
    ERROR: 'player_error',
    CONFIG_SAVED: 'config_saved',
    CONFIG_LOADED: 'config_loaded',
    STREAM_QUALITY: 'stream_quality_changed',
    BUFFER_HEALTH: 'buffer_health_update',
    PLAYBACK_RECOVERY: 'playback_recovery_attempt',
    NETWORK_ADAPTATION: 'network_adaptation',
    PERFORMANCE_METRICS: 'performance_metrics_update'
} as const;
// Constants
export const CONSTANTS = {
    // Configuración de reproducción
    MAX_RETRIES: 5,                  // Reintentos máximos para cargar video
    RETRY_DELAY: 5000,               // Tiempo entre reintentos (ms)
    BUFFER_THRESHOLD: 500,           // Tiempo para detección de buffering (ms)
    CONTROLS_HIDE_DELAY: 6000,       // Tiempo para ocultar controles en fullscreen (ms)
    CONTROLS_HIDE_DELAY_DESKTOP: 10000, // Tiempo para ocultar controles en desktop (ms)
    CONTROLS_HIDE_DELAY_MOBILE: 6000,  // Tiempo para ocultar controles en móvil (ms)
    DOUBLE_CLICK_THRESHOLD: 300,     // Tiempo umbral para detectar doble clic (ms)
    SEEK_SECONDS: 10,                // Segundos de avance/retroceso
    CONTROLS_FADE_DURATION: 300,     // Duración de la animación al mostrar/ocultar controles
    
    // Mensajes y notificaciones
    ERROR_TOAST_DURATION: 5000,      // Duración de mensajes de error (ms)
    INFO_TOAST_DURATION: 3000,       // Duración de mensajes informativos (ms)
    
    // Controles de volumen
    MIN_VOLUME: 0,                   // Volumen mínimo
    MAX_VOLUME: 1,                   // Volumen máximo
    DEFAULT_VOLUME: 0.5,             // Volumen predeterminado
    VOLUME_STEP: 0.05,               // Incremento de volumen (más fino)
    
    // Velocidad de reproducción
    MIN_PLAYBACK_RATE: 0.25,         // Velocidad mínima
    MAX_PLAYBACK_RATE: 2,            // Velocidad máxima
    PLAYBACK_RATE_STEP: 0.25,        // Incremento de velocidad
    
    // Guardado de estado
    STATE_SAVE_INTERVAL: 10000,      // Intervalo de guardado automático (ms)
    STATE_SAVE_THRESHOLD: 5,         // Diferencia mínima de segundos para guardar tiempo
    
    // Optimizaciones de rendimiento
    MEMORY_CHECK_INTERVAL: 30000,    // Intervalo para verificar uso de memoria (ms)
    MEMORY_THRESHOLD_MB: 300,        // Umbral de advertencia de uso de memoria (MB)
    MOUSE_MOVE_THRESHOLD: 20,        // Distancia mínima para considerar un movimiento de mouse significativo
    CONTROLS_UPDATE_DEBOUNCE: 100,   // Tiempo para agrupar actualizaciones de estado de controles (ms)
    VISIBILITY_CHANGE_GRACE: 300,    // Período de gracia para cambios de visibilidad (ms)
    
    // Caché y almacenamiento
    MAX_CACHED_STATES: 10,           // Máximo de estados de vídeo en caché
    MAX_CACHED_SUBTITLES: 15,        // Máximo de subtítulos en caché
    SUBTITLE_CACHE_TTL: 604800000,    // TTL de caché de subtítulos (7 días en ms)
    
    // Optimizaciones adaptativas
    BANDWIDTH_MEASUREMENT_INTERVAL: 5000,  // Intervalo para medición de ancho de banda (ms)
    MINIMUM_BANDWIDTH_FOR_HD: 2500000,    // Ancho de banda mínimo para HD (2.5Mbps)
    MINIMUM_BANDWIDTH_FOR_4K: 15000000,   // Ancho de banda mínimo para 4K (15Mbps)
    BUFFER_GOAL_LOW_BW: 15,               // Objetivo de buffer para conexiones lentas (s)
    BUFFER_GOAL_MID_BW: 30,               // Objetivo de buffer para conexiones medias (s)
    BUFFER_GOAL_HIGH_BW: 60,              // Objetivo de buffer para conexiones rápidas (s)
    QUALITY_SWITCH_UP_THRESHOLD: 0.7,     // Umbral para aumentar calidad (buffer %)
    QUALITY_SWITCH_DOWN_THRESHOLD: 0.3,   // Umbral para reducir calidad (buffer %)
    
    // Métricas de rendimiento
    STALL_THRESHOLD: 250,                 // Umbral para detectar micro-paradas (ms)
    FRAME_DROP_THRESHOLD: 0.05,           // Umbral para detectar caída de frames (%)
    RENDER_TIME_THRESHOLD: 16.67,         // Umbral para detectar bajo rendimiento (ms para 60fps)
    
    // Optimización de precarga
    PRELOAD_SEGMENTS_COUNT: 3,            // Número de segmentos a precargar
    PRELOAD_AHEAD_TIME: 20,               // Tiempo a precargar por adelantado (s)
    PRELOAD_PRIORITY_DECAY: 0.8,          // Decaimiento de prioridad con distancia
    
    // Adaptación a condiciones de red
    NETWORK_AUTO_QUALITY_ENABLED: true,   // Habilitar selección automática de calidad
    NETWORK_MONITOR_INTERVAL: 2000,       // Intervalo para monitoreo de red (ms)
    NETWORK_RECOVERY_BACKOFF: 1.5,        // Factor de retroceso para recuperación
    NETWORK_MIN_STABLE_DURATION: 10000,   // Duración mínima para considerar red estable (ms)
    
    // Detección de problemas y recuperación automática
    AUTO_RECOVERY_ENABLED: true,          // Habilitar recuperación automática
    MAX_AUTO_RECOVERY_ATTEMPTS: 3,        // Máximo de intentos automáticos
    RECOVERY_STRATEGIES: ['reload', 'source_switch', 'quality_reduction', 'restart_player'],
    PLAYBACK_STALL_THRESHOLD: 3000,       // Umbral para detectar reproducción estancada (ms)
    
    // Optimizaciones de dispositivo
    LOW_POWER_MODE_THRESHOLD: 0.2,        // Nivel de batería para activar modo bajo consumo
    BATTERY_CHECK_INTERVAL: 60000,        // Intervalo para verificar batería (ms)
    
    // Optimización de experiencia
    AUTO_QUALITY_SWITCH_DURATION: 500,    // Duración mínima entre cambios automáticos (ms)
    USER_QUALITY_PRIORITY_DURATION: 300000 // Tiempo de prioridad para selección manual (5min)
} as const;

// Detección avanzada de navegadores para optimizaciones específicas
const browserDetection = () => {
    const ua = navigator.userAgent.toLowerCase();
    
    // Detección de Safari (incluyendo iOS Safari)
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua) || 
                    (/iphone|ipod|ipad/i.test(ua) && /webkit/i.test(ua) && !/crios|chrome|fxios|firefox/i.test(ua));
    
    // Detección de iOS (iPhone, iPad, iPod)
    const isIOS = /iphone|ipad|ipod/i.test(ua);
    
    // Detección de iPad específicamente (importante para optimizaciones)
    const isIPad = /ipad/i.test(ua) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    // Detección de Chrome
    const isChrome = /chrome/i.test(ua) && !/edge|edg/i.test(ua);
    
    // Detección de Firefox
    const isFirefox = /firefox/i.test(ua);
    
    // Detección de Edge
    const isEdge = /edge|edg/i.test(ua);
    
    // Detección de versión de iOS para problemas específicos
    const iOSVersion = isIOS ? parseFloat(
        ('' + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(ua) || [0,''])[1])
        .replace('undefined', '3_2').replace('_', '.').replace('_', '')
    ) || null : null;
    
    // Detección de versión de Safari (escritorio) para optimizaciones específicas
    const safariVersion = isSafari && !isIOS ? parseFloat(
        ('' + (/Version\/([0-9.]+).*Safari/i.exec(ua) || [0,''])[1])
    ) || null : null;
    
    // Detección de versión de Chrome
    const chromeVersion = isChrome ? parseInt((ua.match(/chrome\/([0-9]+)/) || [])[1], 10) || null : null;
    
    // Detección de navegadores basados en Webkit
    const isWebkit = /webkit/i.test(ua) && !isChrome;
    
    // Capacidades de pantalla
    const isHighDensityDisplay = window.devicePixelRatio > 1.5;
    const isUltraHighDensityDisplay = window.devicePixelRatio > 2.5;
    
    // Conexión de red con capacidades avanzadas
    let isSlowConnection = false;
    let isMediumConnection = false;
    let fastConnection = false;
    let estimatedBandwidth = 5000; // valor por defecto en kbps
    
    if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        if (conn) {
            isSlowConnection = conn.saveData || 
                              conn.effectiveType === '2g' || 
                              conn.effectiveType === 'slow-2g' ||
                              (conn.downlink && conn.downlink < 1.5);
                              
            isMediumConnection = !isSlowConnection && conn.effectiveType === '3g';
            fastConnection = conn.effectiveType === '4g';
            
            // Estimar ancho de banda más precisamente
            if (conn.downlink) {
                estimatedBandwidth = conn.downlink * 1000; // convertir a kbps
            }
        }
    } else {
        // Si no hay Network Info API, hacemos estimación basada en dispositivo
        isSlowConnection = isIOS && iOSVersion ? iOSVersion < 11 : false;
    }
    
    // Detectar problemas de reproducción específicos para diferentes navegadores
    const hasPlaybackIssues = isIOS && iOSVersion && iOSVersion < 12;
    const requiresUserInteractionForPlay = isIOS || isSafari;
    const hasStableHLSImplementation = isSafari || isIOS; // Safari tiene la mejor implementación nativa
    
    // Detección de posibilidades técnicas
    const hasMediaSourceExtension = 'MediaSource' in window;
    
    // Detección avanzada de capacidades de video
    const videoElement = document.createElement('video');
    
    const hasNativeHLSSupport = videoElement.canPlayType('application/vnd.apple.mpegurl') !== '';
    const supportsMP4 = videoElement.canPlayType('video/mp4') !== '';
    const supportsWebM = videoElement.canPlayType('video/webm; codecs="vp8, vorbis"') !== '';
    const supportsHEVC = isSafari && ((iOSVersion && iOSVersion >= 11) || (safariVersion && safariVersion >= 11));
    const supportsDolbyVision = isSafari && ((iOSVersion && iOSVersion >= 14) || (safariVersion && safariVersion >= 14.5));
    const supports4K = (isChrome && chromeVersion && chromeVersion >= 64) || 
                     (isSafari && safariVersion && safariVersion >= 13) || 
                     (isIOS && iOSVersion && iOSVersion >= 14);
                     
    const supportsMediaSession = 'mediaSession' in navigator;
    const supportsWakeLock = 'wakeLock' in navigator;
    const supportsEMESupport = 'requestMediaKeySystemAccess' in navigator || 'WebKitMediaKeys' in window;
    
    // Detección de hardware y capacidades del dispositivo
    const isLowPoweredDevice = (() => {
        if ('hardwareConcurrency' in navigator) {
          return navigator.hardwareConcurrency <= 4;
        }
        
        if ('deviceMemory' in navigator) {
          return (navigator as any).deviceMemory < 4;
        }
        
        return isIOS && iOSVersion && iOSVersion < 12;
    })();
    
    // Capacidades de audio avanzadas
    const supportsAudioWorklets = 'AudioWorklet' in (window.AudioContext || (window as any).webkitAudioContext || {});
    const supportsSpatialAudio = isSafari && ((safariVersion && safariVersion >= 15) || (iOSVersion && iOSVersion >= 15));
    
    return {
        // Navegadores
        isSafari,
        isIOS,
        isIPad,
        isChrome,
        isFirefox,
        isEdge,
        isWebkit,
        
        // Versiones específicas
        iOSVersion,
        safariVersion,
        chromeVersion,
        
        // Pantalla
        isHighDensityDisplay,
        isUltraHighDensityDisplay,
        
        // Red
        isSlowConnection,
        isMediumConnection,
        fastConnection,
        estimatedBandwidth,
        
        // Problemas conocidos
        hasPlaybackIssues,
        requiresUserInteractionForPlay,
        hasStableHLSImplementation,
        isLowPoweredDevice,
        
        // Capacidades técnicas
        hasMediaSourceExtension,
        hasNativeHLSSupport,
        supportsMP4,
        supportsWebM,
        supportsHEVC,
        supportsDolbyVision,
        supports4K,
        supportsMediaSession,
        supportsWakeLock,
        supportsEMESupport,
        
        // Audio
        supportsAudioWorklets,
        supportsSpatialAudio
    };
};

// Obtener información del navegador para optimizaciones
const browser = browserDetection();

export const initialOptions: PlayerOptions = {
    responsive: true,
    fluid: true,
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
    html5: {
        // Optimizaciones cruciales para Safari/iOS
        nativeAudioTracks: browser.isSafari || browser.isIOS,   // Usar pistas de audio nativas en Safari/iOS para calidad óptima
        nativeVideoTracks: browser.isSafari || browser.isIOS,   // Usar pistas de video nativas en Safari/iOS para mejor compatibilidad
        nativeTextTracks: browser.isSafari || browser.isIOS,    // Usar subtítulos nativos en Safari/iOS para mejor compatibilidad
        
        // Configuración de HLS avanzada con optimizaciones específicas por navegador
        vhs: {
            // Configuraciones básicas
            withCredentials: false,
            cacheEncryptionKeys: true,
            
            // Crucial: usar implementación nativa HLS en Safari para óptimo rendimiento
            overrideNative: !(browser.isSafari || browser.isIOS),
            preferNativeHls: browser.isSafari || browser.isIOS,
            
            // Optimizaciones de calidad adaptativa
            limitRenditionByPlayerDimensions: true,
            useDevicePixelRatio: browser.isHighDensityDisplay || browser.isUltraHighDensityDisplay,
            
            // Mejoras específicas para dispositivos basadas en capacidades detectadas
            enableLowInitialPlaylist: browser.isIOS || browser.isLowPoweredDevice || browser.hasPlaybackIssues, 
            bandwidth: browser.isSlowConnection ? 1500000 : 
                      browser.isMediumConnection ? 4000000 : 
                      browser.fastConnection ? 8000000 : 
                      browser.estimatedBandwidth || 5500000,
                      
            // Ajustes de calidad adaptativa según dispositivo
            smoothQualityChange: !browser.hasPlaybackIssues && !browser.isLowPoweredDevice,
            fastQualityChange: !browser.isLowPoweredDevice,
            
            // Configuración de reintentos 
            maxPlaylistRetries: browser.isIOS ? 8 : 
                              browser.isSafari ? 6 : 
                              browser.isSlowConnection ? 7 : 5,
            
            // Optimización de buffer según dispositivo específico
            backBufferLength: browser.isIOS ? (browser.iOSVersion && browser.iOSVersion >= 15 ? 20 : 15) : 
                           browser.isSafari ? 25 : 
                           browser.isLowPoweredDevice ? 15 : 30,
                           
            // Parámetros para transmisiones en vivo
            liveSyncDuration: browser.isIOS ? 4 : browser.isSafari ? 3.5 : 3,
            liveMaxLatencyDuration: browser.isIOS ? 12 : 10,
            liveSyncDurationCount: browser.isIOS ? 4 : browser.isSafari ? 3.5 : 3,
            
            // Optimización profunda de buffer según plataforma y capacidades
            maxBufferLength: browser.isIOS ? (browser.iOSVersion && browser.iOSVersion >= 14 ? 40 : 30) : 
                          browser.isSafari ? (browser.safariVersion && browser.safariVersion >= 15 ? 60 : 45) : 
                          browser.isLowPoweredDevice ? 30 : 
                          browser.isSlowConnection ? 40 : 60,
                          
            maxMaxBufferLength: browser.isIOS ? (browser.iOSVersion && browser.iOSVersion >= 14 ? 400 : 300) : 
                             browser.isLowPoweredDevice ? 300 : 600,
            
            // Parámetros técnicos optimizados
            useDtsForTimestampOffset: false,
            
            // Estrategias ABR optimizadas por dispositivo
            experimentalBufferBasedABR: !browser.hasPlaybackIssues && !browser.isLowPoweredDevice,
            allowSeeksWithinUnsafeLiveWindow: !browser.hasPlaybackIssues,
            
            // Compatibilidad avanzada con formatos HLS en Safari
            forcePlaylist: browser.isSafari,
            
            // Configuraciones específicas para iOS
            iosLiveMaxLatencyDuration: browser.isIOS ? 10 : undefined,
            
            // Minimizar retrasos en streams en vivo - crucial para experiencia del usuario
            liveRangeSafeTimeDelta: browser.isIOS ? 7 : browser.isSafari ? 5 : 3
        },
        
        // Soporte mejorado para MPEG-DASH
        dash: {
            limitRenditionByPlayerDimensions: true,
            useDtsForTimestampOffset: false,
            fastSwitchEnabled: true  // Cambio rápido entre representaciones
        }
    },
    // Tecnologías de reproducción prioritarias
    // techOrder: ['html5'] as string[],
    // Para transmisiones DASH se aconseja configurar buffer más largo
    // liveui: true,             // Mejor soporte para contenido en vivo
    // inactivityTimeout: 2000,  // 2 segundos sin actividad para ocultar controles
    preload: "auto",
    sources: [],
    // Optimizaciones de buffering avanzadas
    // buffer: {
    //     fastSeek: true,                 // Habilitar seek rápido cuando sea posible
    //     bufferWhilePaused: true,        // Permitir buffering durante pausa para evitar esperas
    // },
    // Optimizaciones de calidad de imagen
    // videoQuality: {
    //     defaultQuality: 'auto',          // Calidad inicial automática
    //     maintainPitchOnSeek: true,       // Mantener tono durante seek rápido
    //     restoreBitratePriority: 'max',   // Al recuperar conexión, priorizar calidad
    // },
    // Optimizaciones de inicio rápido
    // playbackOptimization: {
    //     fastStart: true,                 // Priorizar inicio rápido
    //     aggressiveBuffering: false,      // No sobrecargar buffer inicialmente
    //     prioritizePlaybackRate: true,    // Priorizar mantener velocidad vs calidad
    // },
    // Controles personalizados
    // controlBar: {
    //     children: [
    //         'playToggle',
    //         'volumePanel',
    //         'currentTimeDisplay',
    //         'timeDivider',
    //         'durationDisplay',
    //         'progressControl',
    //         'liveDisplay',
    //         'customControlSpacer',
    //         'playbackRateMenuButton',
    //         'chaptersButton',
    //         'descriptionsButton',
    //         'pictureInPictureToggle',
    //         'fullscreenToggle'
    //     ],
    //     volumePanel: {
    //         inline: false,    // Panel emergente para ahorro de espacio
    //         vertical: true    // Orientación vertical para control más preciso
    //     }
    // },
    poster: "",               // Se establece dinámicamente
    // userActions: {
    //     hotkeys: {
    //         enableNumbers: true,       // Habilitar números para saltar porcentajes
    //         enableVolumeScroll: true,  // Permitir rueda de ratón para volumen
    //         enableModifiersForNumbers: true, // Permitir Ctrl+# para funciones avanzadas
    //     },
    //     doubleClick: true,    // Habilitar doble clic para pantalla completa
    // },
    // Optimizaciones visuales
    // disablePictureInPicture: false,    // Habilitar PiP en navegadores que lo soportan
    // enableSourceset: true,             // Mejora el manejo de cambio de fuentes
    // loadingSpinner: true,              // Mostrar spinner durante la carga
    // suppressNotSupportedError: true,   // Manejar errores de compatibilidad de manera elegante
    // Accesibilidad y subtítulos
    // textTrackSettings: {
    //     enabled: true,
    //     persistTextTrackSettings: true,  // Recordar configuración de subtítulos
    // },
    // Métricas de rendimiento
    // enablePerformanceLogging: process.env.NODE_ENV === 'development',
    // Interoperabilidad mejorada
    // experimentalWebCodecsSupport: true,    // Usar WebCodecs donde esté disponible (Chrome)
    // experimentalNativeFullscreen: true,    // Mejorar soporte de pantalla completa nativa
    // Soporta forzar la salida a HDR donde esté disponible
    // colorSpace: 'bt709'                    // Espacio de color estándar (bt709, bt2020, etc.)
};

// Configuración avanzada para dispositivos móviles
export const mobileOptions = {
    ...initialOptions,
    html5: {
        ...initialOptions.html5,
        hls: {
            ...initialOptions.html5.hls,
            bandwidth: 2500000,          // Menor ancho de banda inicial para móviles (2.5Mbps)
            enableLowInitialPlaylist: true,  // Iniciar con calidad baja para reproducción más rápida
            limitRenditionByPlayerDimensions: true, // Limitar calidad basado en tamaño de pantalla
            maxPlaylistRetries: 8,       // Más reintentos para redes móviles menos estables
            // Parámetros específicos para móviles con mejor uso de batería/datos
            maxBufferLength: 30,         // Buffer más pequeño (30s) para ahorrar memoria
            liveSyncDuration: 4,         // Pequeño incremento para más estabilidad en conexiones móviles
            preferNativeHls: true,       // Usar HLS nativo en iOS para mejor rendimiento
            // Optimizar para conexiones LTE/4G/5G variables
            adaptiveBitrateSwitching: true, // Cambiar bitrate según conexión
            dynamicBitrateAdaptation: true  // Adaptación dinámica de bitrate
        }
    },
    // Optimizaciones para ahorro de batería
    playbackOptimization: {
        fastStart: true,
        aggressiveBuffering: false,
        batteryOptimized: true,         // Optimizar para batería
        prioritizePlaybackRate: false    // En móviles priorizar calidad sobre velocidad
    },
    
    // Configuraciones directas de audio
    audioSettings: {
        defaultVolume: 0.8,             // Volumen predeterminado un poco más bajo para móviles
    },
    // Controles adaptados a pantallas táctiles
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5], // Menos opciones para simplificar la interfaz
    inactivityTimeout: 3000,            // Tiempo mayor en móviles antes de ocultar controles
    // Gestos táctiles optimizados
    touchControls: {
        enabled: true,
        seekThreshold: 20,              // Distancia mínima para seek (píxeles)
        tapTimeout: 300,                // Tiempo máximo para considerar un tap (ms)
        doubleTapEnabled: true          // Permitir doble tap para fullscreen
    },
    // UI simplificada para mejor experiencia táctil
    controlBar: {
        children: [                      // Controles esenciales para móviles
            'playToggle',
            'volumePanel',
            'progressControl',
            'pictureInPictureToggle',
            'fullscreenToggle'
        ],
        volumePanel: {
            inline: true,              // Panel horizontal para móviles
            vertical: false            // Mejor para interacción táctil
        }
    },
    // Optimizaciones avanzadas para dispositivos móviles
    responsive: true,
    fluid: true,
    fill: false,                       // No llenar toda la pantalla para mantener ratio
    disablePictureInPicture: false,    // Mantener PiP en móviles compatibles
    // APIs específicas para móviles
    experimentalWakeLock: true,        // Usar Wake Lock API donde esté disponible
    experimentalMediaSession: true,    // Integración con Media Session API para notificaciones/controles
};

// Configuración para dispositivos de bajo rendimiento
export const lowPowerOptions = {
    ...initialOptions,
    html5: {
        ...initialOptions.html5,
        vhs: {
            ...initialOptions.html5.vhs,
            bandwidth: 1000000,          // Ancho de banda muy bajo (1Mbps)
            enableLowInitialPlaylist: true,
            experimentalBufferBasedABR: false, // Desactivar ABR experimental para ahorrar CPU
            maxPlaylistRetries: 10,      // Más reintentos para conexiones lentas
            levelLoadingRetryDelay: 1000, // Esperar más entre reintentos
        }
    },
    preload: "metadata",                 // Solo precargar metadatos para ahorrar datos
    loadingSpinner: false,              // Spinner simple o ninguno para reducir animaciones
    playbackRates: [0.75, 1, 1.25],     // Opciones mínimas de velocidad
    inactivityTimeout: 2000,            // Ocultar controles rápidamente para ahorrar recursos
    controlBar: {
        children: [                      // Controles mínimos
            'playToggle',
            'progressControl',
            'fullscreenToggle'
        ]
    },
    responsive: true
};

