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
export const CONTROLS_HIDE_DELAY = 3000; // 3 segundos

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
    MAX_RETRIES: 5,
    RETRY_DELAY: 5000,
    BUFFER_THRESHOLD: 500,
    CONTROLS_HIDE_DELAY: 12000,
    DOUBLE_CLICK_THRESHOLD: 800,
    SEEK_SECONDS: 10,
    ERROR_TOAST_DURATION: 5000,
    MIN_VOLUME: 0,
    MAX_VOLUME: 1,
    STATE_SAVE_INTERVAL: 5000,
    DEFAULT_VOLUME: 0.5,
    VOLUME_STEP: 0.1,
    MIN_PLAYBACK_RATE: 0.25,
    MAX_PLAYBACK_RATE: 2,
    PLAYBACK_RATE_STEP: 0.25
} as const;

export const initialOptions: PlayerOptions = {
    responsive: true,
    fluid: true,
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
    html5: {
        nativeAudioTracks: true,
        nativeVideoTracks: true,
        nativeTextTracks: true,
        vhs: {
            overrideNative: true,
            cacheEncryptionKeys: true,
        }
    },
    preload: "auto",
    sources: [],
};

