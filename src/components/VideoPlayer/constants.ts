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
    CONFIG_LOADED: 'config_loaded'
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
    SUBTITLE_CACHE_TTL: 604800000    // TTL de caché de subtítulos (7 días en ms)
} as const;

export const initialOptions: PlayerOptions = {
    responsive: true,
    fluid: true,
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
    html5: {
        nativeAudioTracks: false,  // Usar implementación JavaScript para mayor compatibilidad
        nativeVideoTracks: false,  // Usar implementación JavaScript para mayor compatibilidad
        nativeTextTracks: false,   // Usar implementación JavaScript para mayor control de subtítulos
        vhs: {
            overrideNative: true,  // Usar el motor de HLS de video.js en lugar del nativo
            cacheEncryptionKeys: true,
            bandwidth: 5500000,     // Sugerencia de ancho de banda inicial (5.5Mbps)
            smoothQualityChange: true,
            maxPlaylistRetries: 5,  // Reintentos para manifiestos
            limitRenditionByPlayerDimensions: true,
            useDevicePixelRatio: true,
            useDtsForTimestampOffset: false,  // Mejora precisión en algunos streams
            experimentalBufferBasedABR: true,  // ABR basado en buffer para mejor adaptación
            fastQualityChange: true,           // Cambio inmediato de calidad
            allowSeeksWithinUnsafeLiveWindow: true  // Permite mayor flexibilidad en streams en vivo
        }
    },
    liveui: true,             // Mejor soporte para contenido en vivo
    inactivityTimeout: 2000,  // 2 segundos sin actividad para ocultar controles
    preload: "auto",
    sources: [],
    controlBar: {
        children: [           // Configurar sólo los controles necesarios
            'playToggle',
            'volumePanel',
            'progressControl',
            'remainingTimeDisplay',
            'fullscreenToggle'
        ]
    },
    poster: "",               // Se establece dinámicamente
    techOrder: [
        'html5'               // Priorizar HTML5 para mejor compatibilidad
    ],
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
    userActions: {
        hotkeys: true          // Habilitar soporte para teclas por defecto
    },
    enableSourceset: true,    // Mejora el manejo de cambio de fuentes
    loadingSpinner: true,     // Mostrar spinner durante la carga
    suppressNotSupportedError: true // Manejar errores de compatibilidad de manera elegante
};

// Configuración avanzada para dispositivos móviles
export const mobileOptions = {
    ...initialOptions,
    html5: {
        ...initialOptions.html5,
        vhs: {
            ...initialOptions.html5.vhs,
            bandwidth: 2500000,          // Menor ancho de banda inicial para móviles (2.5Mbps)
            enableLowInitialPlaylist: true,  // Iniciar con calidad baja para reproducción más rápida
            limitRenditionByPlayerDimensions: true, // Limitar calidad basado en tamaño de pantalla
            maxPlaylistRetries: 8,       // Más reintentos para redes móviles menos estables
        }
    },
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5], // Menos opciones para simplificar la interfaz
    inactivityTimeout: 3000,            // Tiempo mayor en móviles antes de ocultar controles
    controlBar: {
        children: [                      // Controles simplificados para móviles
            'playToggle',
            'progressControl',
            'fullscreenToggle'
        ]
    },
    responsive: true
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

