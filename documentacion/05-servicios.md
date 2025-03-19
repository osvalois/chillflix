# Servicios

Los servicios en ChillFlix encapsulan la lógica de comunicación con APIs externas y el procesamiento de datos. Esta sección documenta los servicios principales, su propósito, métodos y tipos.

## Estructura General de Servicios

Todos los servicios siguen un patrón similar:

1. **Configuración**: Parámetros para endpoints, claves API, etc.
2. **Tipos**: Definiciones de tipos para parámetros y respuestas
3. **Helpers**: Funciones auxiliares internas
4. **Métodos Principales**: Funciones que realizan operaciones específicas
5. **Exportaciones**: API pública del servicio

## Servicios Principales

### movieService

**Propósito**: Gestiona la búsqueda y manejo de películas, incluyendo streaming y metadatos.

**Archivo**: `/src/services/movieService.ts`

**Métodos Principales**:

```typescript
// Obtener películas por criterios
async function getMovies(params: MovieSearchParams): Promise<MovieResult[]>

// Obtener detalles de una película específica
async function getMovieDetails(id: string): Promise<MovieDetail>

// Obtener URL de streaming para una película
async function getStreamingUrl(id: string, quality?: string): Promise<StreamingSource[]>

// Buscar películas por texto
async function searchMovies(query: string, page?: number): Promise<SearchResult>

// Obtener películas recomendadas basadas en ID
async function getRecommendations(movieId: string): Promise<MovieResult[]>

// Obtener películas populares o tendencia
async function getTrending(timeWindow: 'day' | 'week' = 'week'): Promise<MovieResult[]>

// Obtener películas por género
async function getMoviesByGenre(genreId: number, page?: number): Promise<MovieResult[]>

// Verificar disponibilidad de una película
async function checkAvailability(id: string): Promise<AvailabilityStatus>
```

**Características**:
- Caché de resultados para optimizar peticiones repetidas
- Transformación de datos para formato coherente
- Manejo de errores centralizado
- Interceptores para logging y monitoreo
- Peticiones paralelas para datos relacionados

### tmdbService

**Propósito**: Interfaz específica para la API de The Movie Database (TMDB).

**Archivo**: `/src/services/tmdbService.ts`

**Métodos Principales**:

```typescript
// Obtener películas populares
async function getPopular(page?: number): Promise<TMDBResponse<TMDBMovie[]>>

// Obtener películas mejor valoradas
async function getTopRated(page?: number): Promise<TMDBResponse<TMDBMovie[]>>

// Obtener próximos estrenos
async function getUpcoming(page?: number): Promise<TMDBResponse<TMDBMovie[]>>

// Obtener detalles de una película
async function getMovieDetails(id: number): Promise<TMDBMovieDetail>

// Obtener créditos (reparto, equipo)
async function getCredits(id: number): Promise<TMDBCredits>

// Buscar por término
async function search(query: string, page?: number): Promise<TMDBSearchResponse>

// Obtener imágenes de una película
async function getImages(id: number): Promise<TMDBImageResponse>

// Obtener detalles de persona/actor
async function getPerson(id: number): Promise<TMDBPerson>
```

**Configuración**:
```typescript
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
```

### openSubtitlesService

**Propósito**: Gestiona la búsqueda y descarga de subtítulos.

**Archivo**: `/src/services/openSubtitlesService.ts`

**Métodos Principales**:

```typescript
// Buscar subtítulos por IMDB ID
async function searchSubtitlesByImdbId(
  imdbId: string,
  language?: string
): Promise<SubtitleSearchResult[]>

// Buscar subtítulos por nombre de archivo
async function searchSubtitlesByFileName(
  fileName: string,
  language?: string
): Promise<SubtitleSearchResult[]>

// Descargar archivo de subtítulos
async function downloadSubtitle(fileId: string): Promise<SubtitleFile>

// Convertir subtítulos a formato compatible
async function convertSubtitleFormat(
  subtitleContent: string,
  fromFormat: SubtitleFormat,
  toFormat: SubtitleFormat
): Promise<string>
```

**Tipos de Datos**:
```typescript
type SubtitleFormat = 'srt' | 'vtt' | 'ass' | 'ssa';

interface SubtitleSearchResult {
  id: string;
  fileName: string;
  language: string;
  format: SubtitleFormat;
  rating: number;
  downloadCount: number;
  fileSize: number;
}

interface SubtitleFile {
  content: string;
  format: SubtitleFormat;
}
```

### movieStorageService

**Propósito**: Gestiona el almacenamiento local de datos de películas y preferencias.

**Archivo**: `/src/services/movieStorageService.ts`

**Métodos Principales**:

```typescript
// Guardar película en historial
function addToHistory(movieId: string): void

// Obtener historial de visualización
function getHistory(): string[]

// Guardar progreso de reproducción
function saveProgress(movieId: string, time: number, duration: number): void

// Obtener progreso guardado
function getProgress(movieId: string): { time: number, duration: number } | null

// Agregar a favoritos
function addToFavorites(movieId: string): void

// Eliminar de favoritos
function removeFromFavorites(movieId: string): void

// Verificar si está en favoritos
function isInFavorites(movieId: string): boolean

// Obtener lista de favoritos
function getFavorites(): string[]
```

**Características**:
- Persistencia entre sesiones mediante localStorage
- Sincronización con cuenta de usuario cuando está autenticado
- Limpieza automática de datos antiguos
- Límite configurable para el historial

## Adaptadores y Helpers

### subtitle-adapter

**Propósito**: Convierte y normaliza diferentes formatos de subtítulos.

**Archivo**: `/src/services/subtitle-adapter.ts`

**Métodos Principales**:

```typescript
// Convertir SRT a WebVTT
function srtToVtt(srtContent: string): string

// Convertir ASS/SSA a WebVTT
function assToVtt(assContent: string): string

// Analizar tiempo de subtítulos
function parseTime(timeString: string): number

// Formatear tiempo para VTT
function formatTime(seconds: number): string
```

### Utilitarios de Integración

Los servicios se apoyan en varios helpers comunes:

1. **API Client**: Configuración base para axios
2. **Cache Manager**: Gestión de caché para respuestas
3. **Error Handler**: Procesamiento unificado de errores
4. **Rate Limiter**: Control de frecuencia de solicitudes
5. **Response Transformer**: Normalización de respuestas

## Creación de Nuevos Servicios

Para crear un nuevo servicio:

1. Crear un archivo en `src/services/` con el nombre del servicio
2. Definir interfaces para parámetros y respuestas
3. Implementar funciones para operaciones específicas
4. Agregar manejo de errores y optimizaciones
5. Exportar la API pública

Ejemplo de estructura básica:

```typescript
// src/services/exampleService.ts
import axios from 'axios';
import { handleError } from '../utils/errorHandler';

// Tipos
export interface ExampleParams {
  id: string;
  filter?: string;
}

export interface ExampleResult {
  id: string;
  name: string;
  data: any;
}

// Configuración
const BASE_URL = 'https://api.example.com';

// Funciones privadas
const transformResponse = (data: any): ExampleResult => {
  // Transformación de datos
  return {
    id: data.id,
    name: data.title,
    data: data.attributes
  };
};

// API pública
export async function fetchExample(params: ExampleParams): Promise<ExampleResult> {
  try {
    const response = await axios.get(`${BASE_URL}/items/${params.id}`, {
      params: { filter: params.filter }
    });
    
    return transformResponse(response.data);
  } catch (error) {
    throw handleError(error, 'Failed to fetch example data');
  }
}

export async function createExample(data: Partial<ExampleResult>): Promise<ExampleResult> {
  try {
    const response = await axios.post(`${BASE_URL}/items`, data);
    
    return transformResponse(response.data);
  } catch (error) {
    throw handleError(error, 'Failed to create example');
  }
}
```

## Buenas Prácticas para Servicios

1. **Separación de Responsabilidades**: Cada servicio debe tener un propósito claro
2. **Manejo de Errores**: Utilizar try/catch e incluir mensajes descriptivos
3. **Typado**: Definir interfaces para todos los parámetros y respuestas
4. **Documentación**: Documentar parámetros, respuestas y comportamiento especial
5. **Caché**: Implementar estrategias de caché para datos que no cambian frecuentemente
6. **Timeout**: Configurar timeouts para evitar bloqueos indefinidos
7. **Retries**: Implementar reintentos para operaciones importantes
8. **Transformación**: Normalizar datos de respuesta a un formato coherente
9. **Testabilidad**: Diseñar para permitir pruebas unitarias