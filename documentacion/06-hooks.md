# Hooks Personalizados

Los hooks personalizados en ChillFlix encapsulan lógica reutilizable, permitiendo separar la lógica de negocio de los componentes UI. Esta sección documenta los hooks principales, su propósito, parámetros y valores retornados.

## Hooks de Datos

### useMovieData

**Propósito**: Obtiene y gestiona datos de películas.

**Archivo**: `/src/hooks/useMovieData.ts`

**Parámetros**:
```typescript
interface UseMovieDataParams {
  id?: string;
  includeDetails?: boolean;
  includeCast?: boolean;
  includeSimilar?: boolean;
}
```

**Retorno**:
```typescript
interface UseMovieDataResult {
  movie: MovieDetail | null;
  cast: CastMember[] | null;
  similar: MovieResult[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

**Uso**:
```tsx
const { movie, cast, loading, error } = useMovieData({
  id: '12345',
  includeDetails: true,
  includeCast: true
});

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!movie) return null;

return (
  <div>
    <h1>{movie.title}</h1>
    <p>{movie.overview}</p>
    {/* Resto del componente */}
  </div>
);
```

### useContentData

**Propósito**: Hook más general para obtener diferentes tipos de contenido.

**Archivo**: `/src/hooks/useContentData.ts`

**Parámetros**:
```typescript
interface UseContentDataParams {
  type: 'popular' | 'topRated' | 'trending' | 'upcoming' | 'byGenre';
  genreId?: number; // Requerido si type es 'byGenre'
  page?: number;
  timeWindow?: 'day' | 'week'; // Para 'trending'
}
```

**Retorno**:
```typescript
interface UseContentDataResult {
  data: ContentItem[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}
```

### useActorDetails

**Propósito**: Obtiene información detallada de actores/personas.

**Archivo**: `/src/hooks/useActorDetails.ts`

**Parámetros**:
```typescript
interface UseActorDetailsParams {
  id: string;
  includeCredits?: boolean;
  includeImages?: boolean;
}
```

**Retorno**:
```typescript
interface UseActorDetailsResult {
  actor: ActorDetail | null;
  credits: ActorCredit[] | null;
  images: ActorImage[] | null;
  loading: boolean;
  error: Error | null;
}
```

## Hooks de UI

### useCarouselState

**Propósito**: Gestiona el estado y la lógica de un carrusel.

**Archivo**: `/src/hooks/useCarouselState.ts`

**Parámetros**:
```typescript
interface UseCarouselStateParams {
  itemsCount: number;
  itemsPerView?: number;
  initialIndex?: number;
  loop?: boolean;
}
```

**Retorno**:
```typescript
interface UseCarouselStateResult {
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
  next: () => void;
  prev: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  goToItem: (index: number) => void;
  visibleIndices: number[];
}
```

### useCarouselNavigation

**Propósito**: Proporciona navegación con teclado para carruseles.

**Archivo**: `/src/hooks/useCarouselNavigation.ts`

**Parámetros**:
```typescript
interface UseCarouselNavigationParams {
  carouselId: string;
  next: () => void;
  prev: () => void;
  enabled?: boolean;
}
```

**Retorno**:
```typescript
// No retorna valores, configura los event listeners
```

### useDynamicBackground

**Propósito**: Gestiona fondos dinámicos basados en el contenido.

**Archivo**: `/src/hooks/useDynamicBackground.ts`

**Parámetros**:
```typescript
interface UseDynamicBackgroundParams {
  imageUrl?: string;
  dominantColor?: string;
  blur?: number;
  opacity?: number;
  animationDuration?: number;
}
```

**Retorno**:
```typescript
interface UseDynamicBackgroundResult {
  backgroundStyles: React.CSSProperties;
  isLoading: boolean;
  error: Error | null;
}
```

### useNavStyles

**Propósito**: Calcula estilos para navegación basados en scroll.

**Archivo**: `/src/hooks/useNavStyles.ts`

**Parámetros**:
```typescript
interface UseNavStylesParams {
  transparentThreshold?: number;
  colorChangeThreshold?: number;
}
```

**Retorno**:
```typescript
interface UseNavStylesResult {
  styles: React.CSSProperties;
  isTransparent: boolean;
  hasScrolled: boolean;
  scrollPosition: number;
}
```

## Hooks de Video

### useVideoPlayerState

**Propósito**: Gestiona el estado complejo del reproductor de video.

**Archivo**: `/src/hooks/useVideoPlayerState.ts`

**Retorno**:
```typescript
interface UseVideoPlayerStateResult {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  quality: string;
  subtitlesEnabled: boolean;
  currentSubtitle: string | null;
  selectedAudioTrack: string | null;
  error: Error | null;
  isLoading: boolean;
  isBuffering: boolean;
}
```

### useVideoPlayerLogic

**Propósito**: Implementa la lógica de control del reproductor.

**Archivo**: `/src/hooks/useVideoPlayerLogic.ts`

**Parámetros**:
```typescript
interface UseVideoPlayerLogicParams {
  videoRef: React.RefObject<HTMLVideoElement>;
  src: string;
  type?: 'hls' | 'dash' | 'mp4';
  onTimeUpdate?: (time: number) => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  initialTime?: number;
  initialVolume?: number;
  initialPlaybackRate?: number;
  subtitles?: SubtitleTrack[];
  audioTracks?: AudioTrack[];
  autoQualityAdjustment?: boolean;
}
```

**Retorno**:
```typescript
interface UseVideoPlayerLogicResult {
  play: () => Promise<void>;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  toggleFullscreen: () => void;
  selectQuality: (quality: string) => void;
  toggleSubtitles: () => void;
  selectSubtitle: (language: string | null) => void;
  selectAudioTrack: (trackId: string) => void;
  // Incluye todas las propiedades de UseVideoPlayerStateResult
  isPlaying: boolean;
  currentTime: number;
  // etc.
}
```

### useNetworkQuality

**Propósito**: Monitorea la calidad de la conexión para ajustar el streaming.

**Archivo**: `/src/hooks/useNetworkQuality.tsx`

**Retorno**:
```typescript
interface UseNetworkQualityResult {
  networkQuality: 'high' | 'medium' | 'low' | 'offline';
  bandwidthEstimate: number | null;
  rtt: number | null;
  isOnline: boolean;
}
```

## Hooks de Utilidad

### useDebounce

**Propósito**: Implementa debouncing para valores que cambian rápidamente.

**Archivo**: `/src/hooks/useDebounce.ts`

**Parámetros**:
```typescript
function useDebounce<T>(value: T, delay: number): T
```

**Uso**:
```tsx
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 300);

useEffect(() => {
  // Este efecto se ejecuta 300ms después del último cambio
  searchAPI(debouncedSearchTerm);
}, [debouncedSearchTerm]);
```

### useOutsideClick

**Propósito**: Detecta clics fuera de un elemento específico.

**Archivo**: `/src/hooks/useOutsideClick.ts`

**Parámetros**:
```typescript
interface UseOutsideClickParams {
  ref: React.RefObject<HTMLElement>;
  callback: () => void;
  enabled?: boolean;
}
```

**Uso**:
```tsx
const modalRef = useRef(null);
const { isOpen, setIsOpen } = useState(false);

useOutsideClick({
  ref: modalRef,
  callback: () => setIsOpen(false),
  enabled: isOpen
});

return (
  <div ref={modalRef}>
    Modal content
  </div>
);
```

### useTimeout

**Propósito**: Versión hook de setTimeout con limpieza automática.

**Archivo**: `/src/hooks/useTimeout.ts`

**Parámetros**:
```typescript
function useTimeout(callback: () => void, delay: number | null): {
  reset: () => void;
  clear: () => void;
}
```

### useWindowSize

**Propósito**: Detecta y reacciona a cambios en el tamaño de ventana.

**Archivo**: `/src/hooks/useWindowSize.ts`

**Retorno**:
```typescript
interface WindowSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}
```

## Hooks de Funcionalidad Específica

### useSearchLogic

**Propósito**: Implementa lógica completa para búsqueda.

**Archivo**: `/src/hooks/useSearchLogic.ts`

**Parámetros**:
```typescript
interface UseSearchLogicParams {
  initialQuery?: string;
  debounceDelay?: number;
  maxResults?: number;
  searchTypes?: ('movie' | 'tv' | 'person')[];
}
```

**Retorno**:
```typescript
interface UseSearchLogicResult {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  loading: boolean;
  error: Error | null;
  suggestions: string[];
  recentSearches: string[];
  clearRecentSearches: () => void;
  addToRecentSearches: (query: string) => void;
  executeSearch: () => Promise<void>;
}
```

### useMirrorSelection

**Propósito**: Gestiona la selección de múltiples fuentes/espejos.

**Archivo**: `/src/hooks/useMirrorSelection.ts`

**Parámetros**:
```typescript
interface UseMirrorSelectionParams {
  movieId: string;
  preferredQuality?: string;
  testMirrors?: boolean;
}
```

**Retorno**:
```typescript
interface UseMirrorSelectionResult {
  mirrors: Mirror[];
  selectedMirror: Mirror | null;
  selectMirror: (mirrorId: string) => void;
  loading: boolean;
  error: Error | null;
  availableQualities: string[];
  selectQuality: (quality: string) => void;
  selectedQuality: string;
  testResults: Record<string, MirrorTestResult>;
}
```

### useRecommendationEngine

**Propósito**: Implementa motor de recomendación personalizado.

**Archivo**: `/src/hooks/useRecommendationEngine.ts`

**Parámetros**:
```typescript
interface UseRecommendationEngineParams {
  userId?: string;
  watchHistory?: string[];
  preferences?: UserPreferences;
  limit?: number;
}
```

**Retorno**:
```typescript
interface UseRecommendationEngineResult {
  recommendations: ContentItem[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  explanations: Record<string, string>; // Razones para cada recomendación
}
```

## Creando Hooks Personalizados

Para crear un nuevo hook personalizado:

1. Crear un archivo en `src/hooks/` con el nombre del hook
2. Implementar el hook siguiendo las convenciones de React Hooks
3. Definir tipos para parámetros y valores de retorno
4. Documentar el propósito y uso del hook

Ejemplo básico:

```typescript
// src/hooks/useToggle.ts
import { useState, useCallback } from 'react';

/**
 * Hook simple para alternar un valor booleano
 * @param initialValue Valor inicial (opcional, por defecto: false)
 * @returns Un array con el valor actual y una función para alternarlo
 */
export function useToggle(initialValue = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue);
  
  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);
  
  return [value, toggle];
}
```

Uso:

```tsx
function MyComponent() {
  const [isOpen, toggleOpen] = useToggle(false);
  
  return (
    <div>
      <button onClick={toggleOpen}>
        {isOpen ? 'Cerrar' : 'Abrir'}
      </button>
      
      {isOpen && <div>Contenido</div>}
    </div>
  );
}
```

## Buenas Prácticas para Hooks

1. **Nombres**: Comenzar con "use" para seguir las convenciones de React
2. **Responsabilidad Única**: Cada hook debe tener un propósito claro
3. **Composición**: Componer hooks más complejos a partir de hooks más simples
4. **Limpieza**: Implementar limpieza adecuada en `useEffect`
5. **Memoización**: Usar `useMemo` y `useCallback` para optimizar rendimiento
6. **Tipado**: Definir interfaces claras para parámetros y retornos
7. **Documentación**: Documentar propósito, parámetros y valores retornados
8. **Manejo de Errores**: Implementar manejo adecuado de errores
9. **Testing**: Diseñar hooks para facilitar pruebas unitarias