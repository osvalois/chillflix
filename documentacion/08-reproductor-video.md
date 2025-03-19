# Reproductor de Video

El componente VideoPlayer es una pieza central de ChillFlix, permitiendo la reproducción de contenido multimedia con funcionalidades avanzadas. Esta sección documenta la arquitectura, componentes, características y personalización del reproductor de video.

## Arquitectura

El reproductor de video de ChillFlix está construido sobre VideoJS e integra soporte para HLS.js y DashJS. La arquitectura sigue estos principios:

1. **Componentes Modulares**: Cada funcionalidad en un componente separado
2. **Estado Centralizado**: Hooks personalizados para gestionar estado del reproductor
3. **Adaptabilidad**: Soporte para múltiples formatos y calidades
4. **Personalización**: UI completamente personalizable
5. **Accesibilidad**: Cumplimiento de estándares WCAG

## Estructura de Componentes

```
components/VideoPlayer/
├── VideoPlayer.tsx           # Componente principal
├── Controls.tsx              # Barra de controles
├── PlaybackControls.tsx      # Controles de reproducción
├── SeekBar.tsx               # Barra de progreso
├── TimeDisplay.tsx           # Visualización de tiempo
├── VolumeControls.tsx        # Controles de volumen
├── FullscreenButton.tsx      # Botón de pantalla completa
├── SubtitlesDisplay.tsx      # Visualización de subtítulos
├── SubtitleSelector.tsx      # Selector de subtítulos
├── QualitySelector.tsx       # Selector de calidad
├── BufferingOverlay.tsx      # Overlay durante buffering
├── ErrorOverlay.tsx          # Overlay para errores
├── LoadingOverlay.tsx        # Overlay de carga inicial
├── MobileMenu.tsx            # Menú específico para móviles
├── TitleDisplay.tsx          # Visualización de título
├── LanguageSelector.tsx      # Selector de idioma de audio
├── AudioSettingsMenu.tsx     # Menú de configuración de audio
├── QualityIndicator.tsx      # Indicador de calidad actual
├── LoadingSpinner.tsx        # Spinner durante carga
├── constants.ts              # Constantes y configuraciones
└── types.ts                  # Definiciones de tipos
```

## Componente Principal: VideoPlayer

**Archivo**: `/src/components/VideoPlayer/VideoPlayer.tsx`

**Propósito**: Componente principal que coordina todos los aspectos del reproductor.

**Propiedades**:
```typescript
interface VideoPlayerProps {
  src: string;
  type?: 'hls' | 'dash' | 'mp4';
  poster?: string;
  autoplay?: boolean;
  title?: string;
  subtitles?: SubtitleTrack[];
  audioTracks?: AudioTrack[];
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
  quality?: VideoQuality;
  initialTime?: number;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  className?: string;
  onError?: (error: Error) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onVolumeChange?: (volume: number) => void;
  onQualityChange?: (quality: string) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}
```

**Implementación Básica**:

```tsx
import { useRef, useEffect } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import Hls from 'hls.js';
import dashjs from 'dashjs';
import { useVideoPlayerState, useVideoPlayerLogic } from '../../hooks';
import Controls from './Controls';
import SubtitlesDisplay from './SubtitlesDisplay';
import BufferingOverlay from './BufferingOverlay';
import ErrorOverlay from './ErrorOverlay';
import LoadingOverlay from './LoadingOverlay';
import { isHLSSupported, isDASHSupported } from './utils';
import { VideoPlayerContainer } from './styles';

export const VideoPlayer = ({
  src,
  type = 'mp4',
  poster,
  autoplay = false,
  title,
  subtitles = [],
  audioTracks = [],
  onTimeUpdate,
  onEnded,
  quality = 'auto',
  initialTime = 0,
  muted = false,
  controls = true,
  loop = false,
  playsInline = true,
  className = '',
  onError,
  onPlay,
  onPause,
  onVolumeChange,
  onQualityChange,
  onFullscreenChange
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Usar hooks personalizados para gestionar estado y lógica
  const {
    isPlaying,
    currentTime,
    duration,
    buffered,
    volume,
    isMuted,
    isFullscreen,
    playbackRate,
    error,
    isLoading,
    isBuffering,
    selectedQuality,
    subtitlesEnabled,
    currentSubtitle,
    selectedAudioTrack
  } = useVideoPlayerState({
    initialTime,
    initialMuted: muted
  });
  
  const {
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    toggleFullscreen,
    selectQuality,
    toggleSubtitles,
    selectSubtitle,
    selectAudioTrack
  } = useVideoPlayerLogic({
    videoRef,
    containerRef,
    src,
    type,
    onError,
    onPlay,
    onPause,
    onTimeUpdate,
    onEnded,
    onVolumeChange,
    onQualityChange,
    onFullscreenChange,
    subtitles,
    audioTracks
  });
  
  // Inicializar reproductor
  useEffect(() => {
    if (!videoRef.current) return;
    
    // Configurar VideoJS
    const player = videojs(videoRef.current, {
      controls: false,
      autoplay,
      muted,
      loop,
      playsinline: playsInline,
      poster
    });
    
    // Configurar adaptadores según tipo
    if (type === 'hls' && !isHLSSupported() && Hls.isSupported()) {
      const hls = new Hls({ 
        maxBufferLength: 30,
        maxMaxBufferLength: 60
      });
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
    } else if (type === 'dash' && !isDASHSupported()) {
      const dashPlayer = dashjs.MediaPlayer().create();
      dashPlayer.initialize(videoRef.current, src, autoplay);
    }
    
    return () => {
      player.dispose();
    };
  }, [src, type, autoplay, muted, loop, playsInline, poster]);
  
  return (
    <VideoPlayerContainer 
      ref={containerRef}
      className={`video-player-container ${className}`}
    >
      <video 
        ref={videoRef}
        className="video-js"
        playsInline={playsInline}
      />
      
      {/* Overlays condicionales */}
      {isLoading && <LoadingOverlay />}
      {isBuffering && <BufferingOverlay />}
      {error && <ErrorOverlay error={error} />}
      
      {/* Subtítulos */}
      {subtitlesEnabled && (
        <SubtitlesDisplay 
          currentTime={currentTime}
          subtitle={currentSubtitle}
        />
      )}
      
      {/* Controles de reproducción */}
      {controls && (
        <Controls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          buffered={buffered}
          volume={volume}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          playbackRate={playbackRate}
          quality={selectedQuality}
          subtitlesEnabled={subtitlesEnabled}
          availableSubtitles={subtitles}
          currentSubtitle={currentSubtitle}
          availableAudioTracks={audioTracks}
          selectedAudioTrack={selectedAudioTrack}
          onPlayToggle={togglePlay}
          onSeek={seek}
          onVolumeChange={setVolume}
          onMuteToggle={toggleMute}
          onPlaybackRateChange={setPlaybackRate}
          onFullscreenToggle={toggleFullscreen}
          onQualityChange={selectQuality}
          onSubtitlesToggle={toggleSubtitles}
          onSubtitleSelect={selectSubtitle}
          onAudioTrackSelect={selectAudioTrack}
        />
      )}
    </VideoPlayerContainer>
  );
};
```

## Hooks de Gestión del Reproductor

### useVideoPlayerState

**Archivo**: `/src/hooks/useVideoPlayerState.ts`

**Propósito**: Gestiona el estado completo del reproductor de video.

**Implementación**:

```typescript
import { useState, useEffect, useCallback } from 'react';

interface UseVideoPlayerStateParams {
  initialTime?: number;
  initialVolume?: number;
  initialMuted?: boolean;
  initialPlaybackRate?: number;
}

export const useVideoPlayerState = ({
  initialTime = 0,
  initialVolume = 1,
  initialMuted = false,
  initialPlaybackRate = 1
}: UseVideoPlayerStateParams = {}) => {
  // Estados básicos
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(initialVolume);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [playbackRate, setPlaybackRate] = useState(initialPlaybackRate);
  
  // Estados adicionales
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  
  // Estados para características avanzadas
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState<string | null>(null);
  
  // Resetear estado cuando cambia la fuente de video
  const resetState = useCallback(() => {
    setCurrentTime(initialTime);
    setDuration(0);
    setBuffered(0);
    setError(null);
    setIsLoading(true);
    setIsBuffering(false);
  }, [initialTime]);
  
  return {
    // Estados básicos
    isPlaying,
    setIsPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    buffered,
    setBuffered,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    playbackRate,
    setPlaybackRate,
    
    // Estados adicionales
    isFullscreen,
    setIsFullscreen,
    error,
    setError,
    isLoading,
    setIsLoading,
    isBuffering,
    setIsBuffering,
    
    // Estados para características avanzadas
    selectedQuality,
    setSelectedQuality,
    subtitlesEnabled,
    setSubtitlesEnabled,
    currentSubtitle,
    setCurrentSubtitle,
    selectedAudioTrack,
    setSelectedAudioTrack,
    
    // Métodos
    resetState
  };
};
```

### useVideoPlayerLogic

**Archivo**: `/src/hooks/useVideoPlayerLogic.ts`

**Propósito**: Implementa la lógica de control del reproductor.

## Componentes de Control

### Controls

**Archivo**: `/src/components/VideoPlayer/Controls.tsx`

**Propósito**: Barra principal de controles para el reproductor.

**Características**:
- Muestra/oculta automáticamente
- Responsive para diferentes tamaños de pantalla
- Diferentes layouts para móvil/escritorio

### SeekBar

**Archivo**: `/src/components/VideoPlayer/SeekBar.tsx`

**Propósito**: Control deslizante para navegar el video.

**Características**:
- Visualización de buffer
- Vista previa al pasar el cursor
- Marcadores para capítulos o anuncios
- Soporte táctil optimizado

### SubtitlesDisplay

**Archivo**: `/src/components/VideoPlayer/SubtitlesDisplay.tsx`

**Propósito**: Muestra subtítulos sincronizados con el video.

**Características**:
- Soporte para formatos VTT, SRT, ASS
- Estilos personalizables
- Posicionamiento ajustable
- Sincronización precisa

## Soporte de Formatos

### HLS (HTTP Live Streaming)

La implementación incluye:
- Detección automática de soporte nativo
- Fallback a hls.js cuando es necesario
- Manejo de múltiples calidades
- ABR (Adaptive Bitrate) inteligente

### DASH (Dynamic Adaptive Streaming over HTTP)

La implementación incluye:
- Integración con dash.js
- Soporte para DRM en navegadores compatibles
- Streaming adaptativo
- Métricas de rendimiento

### MP4 y Otros Formatos

- Soporte para formatos de video tradicionales
- Detección automática de formato

## Características Avanzadas

### Calidad Adaptativa

El reproductor implementa una estrategia de selección de calidad adaptativa:

1. Comienza con selección automática (ABR)
2. Monitorea condiciones de red con `useNetworkQuality`
3. Ajusta la calidad basándose en:
   - Ancho de banda disponible
   - Tamaño de pantalla del dispositivo
   - Preferencias del usuario
4. Permite selección manual con `QualitySelector`

### Sistema de Subtítulos

Funcionalidades avanzadas de subtítulos:

1. Carga dinámica de múltiples idiomas
2. Conversión automática entre formatos (SRT → VTT)
3. Estilos personalizables (tamaño, color, fondo)
4. Sincronización manual con `SubtitleTimeController`

### Pistas de Audio Múltiples

Soporte para múltiples pistas de audio:

1. Selección de idioma/pista
2. Normalización de volumen entre pistas
3. Mezclado espacial para contenido inmersivo
4. Control independiente de volumen

## Interfaz de Usuario

### Temas y Personalización

El reproductor soporta temas y personalización:

1. Tema claro/oscuro siguiendo el tema de la aplicación
2. Personalización de colores primarios
3. Configuración de opacidad de controles
4. Modos especiales (cine, teatro, etc.)

### Responsive Design

Adaptación a diferentes tamaños de pantalla:

1. Layouts optimizados para móvil, tablet y escritorio
2. Controles táctiles para dispositivos móviles
3. Reordenación de elementos según tamaño disponible
4. Modo vertical para contenido móvil

## Monitoreo y Analíticas

El reproductor incorpora sistemas de monitoreo:

1. Seguimiento de eventos de reproducción
2. Métricas de buffering y calidad
3. Reportes de errores
4. Análisis de patrones de uso

### Sistema de Eventos

El reproductor emite eventos que pueden ser capturados:

```typescript
// Ejemplos de eventos
videoPlayer.on('play', handlePlay);
videoPlayer.on('pause', handlePause);
videoPlayer.on('seeked', handleSeek);
videoPlayer.on('ended', handleEnded);
videoPlayer.on('qualityChanged', handleQualityChange);
videoPlayer.on('error', handleError);
```

## Integración con Watch Party

El componente VideoPlayer se integra con la funcionalidad de Watch Party:

1. Sincronización de reproducción entre usuarios
2. Estado compartido (play/pause)
3. Control de sincronización para compensar latencia
4. Indicadores de participantes

## Accesibilidad

El reproductor implementa características de accesibilidad:

1. Control completo por teclado
2. Soporte para lectores de pantalla
3. Subtítulos según estándares WCAG
4. Alto contraste en controles
5. Descripciones de audio

## Rendimiento

Optimizaciones de rendimiento implementadas:

1. Lazy loading de componentes y plugins
2. Buffering inteligente
3. Precarga adaptativa
4. Uso eficiente de memoria

## Personalización del Reproductor

### Tema Personalizado

Los desarrolladores pueden personalizar el aspecto visual:

```typescript
// Ejemplo de personalización de tema
<VideoPlayer
  theme={{
    colors: {
      primary: '#FF5733',
      secondary: '#33FF57',
      background: 'rgba(0, 0, 0, 0.8)'
    },
    controls: {
      opacity: 0.8,
      borderRadius: '4px'
    }
  }}
  src={videoUrl}
/>
```

### Plugins Personalizados

El reproductor permite la extensión mediante plugins:

```typescript
// Ejemplo de plugin personalizado
const watermarkPlugin = {
  name: 'watermark',
  register: (player) => {
    const watermark = document.createElement('div');
    watermark.className = 'vjs-watermark';
    watermark.textContent = 'ChillFlix';
    player.el().appendChild(watermark);
  }
};

<VideoPlayer
  plugins={[watermarkPlugin]}
  src={videoUrl}
/>
```

## Ejemplos de Uso

### Reproductor Básico

```tsx
<VideoPlayer
  src="https://example.com/video.mp4"
  poster="https://example.com/poster.jpg"
  autoplay={false}
  controls={true}
/>
```

### Reproductor con Subtítulos

```tsx
<VideoPlayer
  src="https://example.com/video.mp4"
  subtitles={[
    { 
      language: 'en', 
      label: 'English', 
      src: 'https://example.com/subtitles-en.vtt' 
    },
    { 
      language: 'es', 
      label: 'Español', 
      src: 'https://example.com/subtitles-es.vtt' 
    }
  ]}
/>
```

### Reproductor HLS con Múltiples Calidades

```tsx
<VideoPlayer
  src="https://example.com/playlist.m3u8"
  type="hls"
  poster="https://example.com/poster.jpg"
  onQualityChange={(quality) => console.log(`Quality changed to ${quality}`)}
/>
```

## Buenas Prácticas

1. **Precarga Inteligente**: Precargar metadatos para reproducción rápida
2. **Autoplay Condicional**: Solo autoreproducir cuando es apropiado
3. **Control de Volumen**: Recordar preferencias de volumen del usuario
4. **Manejo de Errores**: Proporcionar mensajes claros cuando hay problemas
5. **Rendimiento Móvil**: Optimizar para dispositivos con recursos limitados
6. **Accesibilidad**: Asegurar que todos los controles sean accesibles por teclado
7. **Pruebas Multi-navegador**: Verificar compatibilidad en diferentes navegadores
8. **Analíticas Anónimas**: Respetar la privacidad al recopilar datos de uso