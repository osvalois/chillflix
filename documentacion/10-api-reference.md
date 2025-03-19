# API Reference

Esta sección proporciona documentación detallada sobre las APIs internas y externas utilizadas en ChillFlix.

## APIs Externas

### TMDB API

The Movie Database (TMDB) es la principal fuente de datos para información de películas y series.

**Base URL**: `https://api.themoviedb.org/3`

**Autenticación**: API Key en header o parámetro de consulta

#### Endpoints Principales:

##### Obtener Películas Populares
```
GET /movie/popular
```

**Parámetros**:
- `api_key` (requerido): Clave API
- `language` (opcional): Código de idioma en formato ISO 639-1 (default: 'en-US')
- `page` (opcional): Número de página (default: 1)
- `region` (opcional): Filtrar por región ISO 3166-1

**Respuesta**:
```json
{
  "page": 1,
  "results": [
    {
      "id": 123,
      "title": "Movie Title",
      "poster_path": "/poster.jpg",
      "backdrop_path": "/backdrop.jpg",
      "overview": "Movie description...",
      "release_date": "2023-05-15",
      "vote_average": 7.5,
      "genre_ids": [28, 12, 878]
    }
    // ...más películas
  ],
  "total_pages": 500,
  "total_results": 10000
}
```

##### Detalles de Película
```
GET /movie/{movie_id}
```

**Parámetros**:
- `api_key` (requerido): Clave API
- `language` (opcional): Código de idioma (default: 'en-US')
- `append_to_response` (opcional): Datos adicionales a incluir (ej. "credits,videos,images")

**Respuesta**:
```json
{
  "id": 123,
  "title": "Movie Title",
  "tagline": "Movie tagline",
  "overview": "Detailed description...",
  "poster_path": "/poster.jpg",
  "backdrop_path": "/backdrop.jpg",
  "genres": [
    { "id": 28, "name": "Action" },
    { "id": 12, "name": "Adventure" }
  ],
  "release_date": "2023-05-15",
  "runtime": 120,
  "vote_average": 7.5,
  "vote_count": 1000,
  "budget": 150000000,
  "revenue": 500000000,
  "production_companies": [
    {
      "id": 420,
      "name": "Studio Name",
      "logo_path": "/logo.png"
    }
  ]
}
```

##### Búsqueda Multi
```
GET /search/multi
```

**Parámetros**:
- `api_key` (requerido): Clave API
- `query` (requerido): Texto de búsqueda
- `language` (opcional): Código de idioma (default: 'en-US')
- `page` (opcional): Número de página (default: 1)
- `include_adult` (opcional): Incluir contenido adulto (default: false)

**Respuesta**:
```json
{
  "page": 1,
  "results": [
    {
      "id": 123,
      "media_type": "movie",
      "title": "Movie Title",
      "poster_path": "/poster.jpg",
      "overview": "Description..."
    },
    {
      "id": 456,
      "media_type": "tv",
      "name": "TV Show Name",
      "poster_path": "/poster.jpg",
      "overview": "Description..."
    },
    {
      "id": 789,
      "media_type": "person",
      "name": "Actor Name",
      "profile_path": "/profile.jpg",
      "known_for": [...]
    }
  ],
  "total_pages": 10,
  "total_results": 200
}
```

### OpenSubtitles API

API para obtener subtítulos de películas y series.

**Base URL**: `https://api.opensubtitles.com/api/v1`

**Autenticación**: API Key en header

#### Endpoints Principales:

##### Búsqueda por IMDB ID
```
GET /subtitles
```

**Parámetros**:
- `imdb_id` (opcional): ID de IMDB
- `languages` (opcional): Códigos de idioma separados por coma (ej. "en,es,fr")
- `limit` (opcional): Número máximo de resultados (default: 30)

**Headers**:
- `Api-Key`: Clave API
- `Content-Type`: application/json

**Respuesta**:
```json
{
  "data": [
    {
      "id": "12345",
      "attributes": {
        "language": "en",
        "download_count": 4250,
        "hearing_impaired": false,
        "file_name": "Movie.Title.2023.1080p.WEB-DL.srt",
        "format": "srt"
      }
    }
    // ...más subtítulos
  ],
  "total_count": 15
}
```

##### Descargar Subtítulo
```
POST /download
```

**Body**:
```json
{
  "file_id": "12345"
}
```

**Headers**:
- `Api-Key`: Clave API
- `Content-Type`: application/json

**Respuesta**:
```json
{
  "link": "https://download.opensubtitles.com/...",
  "file_name": "Movie.Title.2023.1080p.WEB-DL.srt",
  "remaining": 100
}
```

## APIs Internas

### movieService

Servicio para obtener datos de películas y gestionar la reproducción.

#### Métodos

##### getMovies
```typescript
async function getMovies(params: MovieSearchParams): Promise<MovieResult[]>
```

**Parámetros**:
```typescript
interface MovieSearchParams {
  type?: 'popular' | 'topRated' | 'upcoming' | 'trending';
  genre?: number;
  page?: number;
  query?: string;
  year?: number;
  language?: string;
}
```

**Retorno**: Array de objetos MovieResult:
```typescript
interface MovieResult {
  id: string;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
  mediaType: 'movie' | 'tv';
}
```

##### getMovieDetails
```typescript
async function getMovieDetails(id: string): Promise<MovieDetail>
```

**Parámetros**:
- `id`: ID de la película

**Retorno**: Objeto MovieDetail:
```typescript
interface MovieDetail {
  id: string;
  title: string;
  originalTitle: string;
  tagline: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  genres: Genre[];
  releaseDate: string;
  runtime: number;
  voteAverage: number;
  voteCount: number;
  status: string;
  budget: number;
  revenue: number;
  productionCompanies: ProductionCompany[];
  videos: Video[];
  imdbId: string | null;
}
```

##### getStreamingUrl
```typescript
async function getStreamingUrl(
  id: string, 
  quality?: string
): Promise<StreamingSource[]>
```

**Parámetros**:
- `id`: ID de la película
- `quality` (opcional): Calidad deseada (ej. '1080p', '720p', 'auto')

**Retorno**: Array de objetos StreamingSource:
```typescript
interface StreamingSource {
  url: string;
  quality: string;
  format: 'hls' | 'dash' | 'mp4';
  size?: number;
  label: string;
  default?: boolean;
}
```

##### searchMovies
```typescript
async function searchMovies(
  query: string, 
  page?: number
): Promise<SearchResult>
```

**Parámetros**:
- `query`: Texto de búsqueda
- `page` (opcional): Número de página

**Retorno**: Objeto SearchResult:
```typescript
interface SearchResult {
  results: MovieResult[];
  page: number;
  totalPages: number;
  totalResults: number;
}
```

### tmdbService

Interfaz específica para la API de The Movie Database (TMDB).

#### Métodos

##### getPopular
```typescript
async function getPopular(page?: number): Promise<TMDBResponse<TMDBMovie[]>>
```

**Parámetros**:
- `page` (opcional): Número de página (default: 1)

**Retorno**: Respuesta con array de películas

##### getTopRated
```typescript
async function getTopRated(page?: number): Promise<TMDBResponse<TMDBMovie[]>>
```

**Parámetros**:
- `page` (opcional): Número de página (default: 1)

**Retorno**: Respuesta con array de películas

##### getMovieDetails
```typescript
async function getMovieDetails(id: number): Promise<TMDBMovieDetail>
```

**Parámetros**:
- `id`: ID de la película

**Retorno**: Detalles completos de película

##### search
```typescript
async function search(
  query: string, 
  page?: number
): Promise<TMDBSearchResponse>
```

**Parámetros**:
- `query`: Texto de búsqueda
- `page` (opcional): Número de página (default: 1)

**Retorno**: Resultados de búsqueda multi-tipo

### openSubtitlesService

Servicio para buscar y descargar subtítulos.

#### Métodos

##### searchSubtitlesByImdbId
```typescript
async function searchSubtitlesByImdbId(
  imdbId: string,
  language?: string
): Promise<SubtitleSearchResult[]>
```

**Parámetros**:
- `imdbId`: ID de IMDB
- `language` (opcional): Código de idioma preferido

**Retorno**: Array de resultados de subtítulos:
```typescript
interface SubtitleSearchResult {
  id: string;
  fileName: string;
  language: string;
  format: 'srt' | 'vtt' | 'ass' | 'ssa';
  rating: number;
  downloadCount: number;
  fileSize: number;
}
```

##### downloadSubtitle
```typescript
async function downloadSubtitle(fileId: string): Promise<SubtitleFile>
```

**Parámetros**:
- `fileId`: ID del archivo de subtítulos

**Retorno**: Contenido del subtítulo:
```typescript
interface SubtitleFile {
  content: string;
  format: 'srt' | 'vtt' | 'ass' | 'ssa';
}
```

## Hooks API

### useMovieData

Hook para obtener datos de películas.

```typescript
function useMovieData(params: UseMovieDataParams): UseMovieDataResult
```

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

### useVideoPlayerLogic

Hook para implementar la lógica del reproductor de video.

```typescript
function useVideoPlayerLogic(
  params: UseVideoPlayerLogicParams
): UseVideoPlayerLogicResult
```

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
  // Estado
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

### useAuth

Hook para acceder al contexto de autenticación.

```typescript
function useAuth(): AuthContextType
```

**Retorno**:
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}
```

## Components API

### VideoPlayer

Componente principal del reproductor de video.

```typescript
<VideoPlayer
  src="https://example.com/video.mp4"
  type="hls"
  poster="https://example.com/poster.jpg"
  autoplay={false}
  title="Movie Title"
  subtitles={[
    { language: 'en', src: 'https://example.com/en.vtt', label: 'English' }
  ]}
  onTimeUpdate={(time) => console.log(time)}
  onEnded={() => console.log('Video ended')}
/>
```

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

### ContentCarousel

Componente para mostrar un carrusel de contenido.

```typescript
<ContentCarousel
  title="Popular Movies"
  items={popularMovies}
  type="movie"
  loading={loading}
  error={error}
  onItemClick={(id, type) => navigate(`/${type}/${id}`)}
/>
```

**Propiedades**:
```typescript
interface ContentCarouselProps {
  title: string;
  items: ContentItem[];
  type: 'movie' | 'tv' | 'mixed';
  loading?: boolean;
  error?: Error | null;
  onItemClick?: (id: string, type: string) => void;
}
```

### FeaturedContent

Componente para mostrar contenido destacado.

```typescript
<FeaturedContent
  item={featuredMovie}
  onPlay={(id) => navigate(`/movie/${id}/watch`)}
  onDetails={(id) => navigate(`/movie/${id}`)}
/>
```

**Propiedades**:
```typescript
interface FeaturedContentProps {
  item: FeaturedItem;
  onPlay?: (id: string) => void;
  onDetails?: (id: string) => void;
}
```

### RequireAuth

HOC para proteger rutas que requieren autenticación.

```typescript
<RequireAuth redirectTo="/auth">
  <ProfilePage />
</RequireAuth>
```

**Propiedades**:
```typescript
interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}
```

## Store API (Jotai)

### playerAtoms

Átomos relacionados con el reproductor de video.

```typescript
// Átomos primitivos
export const isPlayingAtom = atom(false);
export const currentTimeAtom = atom(0);
export const durationAtom = atom(0);
export const volumeAtom = atom(1);
export const mutedAtom = atom(false);
export const playbackRateAtom = atom(1);
export const fullscreenAtom = atom(false);
export const selectedQualityAtom = atom('auto');
export const subtitlesEnabledAtom = atom(false);
export const selectedSubtitleAtom = atom<string | null>(null);
export const selectedAudioTrackAtom = atom<string | null>(null);

// Átomos derivados
export const progressPercentAtom = atom((get) => {
  const currentTime = get(currentTimeAtom);
  const duration = get(durationAtom);
  return duration > 0 ? (currentTime / duration) * 100 : 0;
});

export const formattedTimeAtom = atom((get) => {
  const currentTime = get(currentTimeAtom);
  const duration = get(durationAtom);
  return {
    current: formatTime(currentTime),
    total: formatTime(duration),
    remaining: formatTime(Math.max(0, duration - currentTime))
  };
});
```

### userAtoms

Átomos relacionados con el usuario y preferencias.

```typescript
export const userPreferencesAtom = atomWithStorage('userPreferences', {
  subtitlesEnabled: false,
  preferredLanguage: 'en',
  preferredQuality: 'auto',
  volume: 0.8,
  playbackRate: 1
});

export const watchHistoryAtom = atomWithStorage('watchHistory', []);
export const favoriteMoviesAtom = atomWithStorage('favoriteMovies', []);

export const lastWatchedAtom = atom((get) => {
  const history = get(watchHistoryAtom);
  return history.length > 0 ? history[0] : null;
});
```

## Constantes

### API Endpoints

```typescript
// src/config/constants.ts
export const API = {
  TMDB: {
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
    POSTER_SIZES: {
      SMALL: 'w185',
      MEDIUM: 'w342',
      LARGE: 'w500',
      ORIGINAL: 'original'
    },
    BACKDROP_SIZES: {
      SMALL: 'w300',
      MEDIUM: 'w780',
      LARGE: 'w1280',
      ORIGINAL: 'original'
    }
  },
  OPEN_SUBTITLES: {
    BASE_URL: 'https://api.opensubtitles.com/api/v1'
  }
};
```

### Géneros de Película

```typescript
// src/constants.tsx
export const MOVIE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];
```

### Calidades de Video

```typescript
// src/components/VideoPlayer/constants.ts
export const VIDEO_QUALITIES = [
  { value: '240p', label: '240p', bitrate: 400000 },
  { value: '360p', label: '360p', bitrate: 800000 },
  { value: '480p', label: '480p', bitrate: 1200000 },
  { value: '720p', label: '720p', bitrate: 2500000 },
  { value: '1080p', label: '1080p', bitrate: 5000000 },
  { value: '1440p', label: '1440p', bitrate: 8000000 },
  { value: '2160p', label: '4K', bitrate: 16000000 },
  { value: 'auto', label: 'Auto', bitrate: 0 }
];
```

## Utilidades

### Formateadores

```typescript
// src/utils/formatters.ts

// Formatear tiempo en segundos a "HH:MM:SS" o "MM:SS"
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Formatear fecha a formato local
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

// Formatear número con punto como separador de miles
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// Formatear duración en minutos a horas y minutos
export function formatRuntime(minutes: number): string {
  if (!minutes) return '';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  
  return `${mins}m`;
}
```

### Utilidades de Subtítulos

```typescript
// src/services/subtitle-adapter.ts

// Convertir SRT a WebVTT
export function srtToVtt(srtContent: string): string {
  if (!srtContent) return '';
  
  // Añadir encabezado WEBVTT
  let vttContent = 'WEBVTT\n\n';
  
  // Procesar contenido SRT
  const srtLines = srtContent.trim().split('\n\n');
  
  for (const subtitle of srtLines) {
    const lines = subtitle.split('\n');
    if (lines.length < 3) continue;
    
    // Ignorar número de subtítulo
    
    // Convertir tiempos (00:00:00,000 --> 00:00:00,000 a 00:00:00.000 --> 00:00:00.000)
    const timeLineMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timeLineMatch) continue;
    
    const startTime = timeLineMatch[1].replace(',', '.');
    const endTime = timeLineMatch[2].replace(',', '.');
    const timeLine = `${startTime} --> ${endTime}`;
    
    // Texto del subtítulo (pueden ser varias líneas)
    const subtitleText = lines.slice(2).join('\n');
    
    // Añadir al resultado
    vttContent += `${timeLine}\n${subtitleText}\n\n`;
  }
  
  return vttContent;
}
```

## Tipos Comunes

### Movie Types

```typescript
// src/types/movie.types.ts

export interface Movie {
  id: string;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  overview: string;
  releaseDate: string;
  voteAverage: number;
  genreIds: number[];
  mediaType: 'movie' | 'tv';
}

export interface MovieDetail extends Movie {
  originalTitle: string;
  tagline: string;
  genres: Genre[];
  runtime: number;
  voteCount: number;
  status: string;
  budget: number;
  revenue: number;
  productionCompanies: ProductionCompany[];
  videos: Video[];
  imdbId: string | null;
}

export interface Genre {
  id: number;
  name: string;
}

export interface ProductionCompany {
  id: number;
  name: string;
  logoPath: string | null;
  originCountry: string;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profilePath: string | null;
}
```

### Video Player Types

```typescript
// src/components/VideoPlayer/types.ts

export interface VideoQuality {
  value: string;
  label: string;
  bitrate: number;
}

export interface SubtitleTrack {
  language: string;
  src: string;
  label: string;
  default?: boolean;
}

export interface AudioTrack {
  id: string;
  language: string;
  label: string;
  default?: boolean;
}

export interface StreamingSource {
  url: string;
  quality: string;
  format: 'hls' | 'dash' | 'mp4';
  size?: number;
  label: string;
  default?: boolean;
}
```