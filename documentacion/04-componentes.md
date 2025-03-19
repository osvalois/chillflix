# Componentes Principales

Esta sección documenta los componentes clave de ChillFlix, su propósito, propiedades y uso.

## Jerarquía de Componentes

```
App
├── AuthProvider
│   └── Layout
│       ├── Header
│       │   ├── DesktopNav
│       │   └── MobileMenu
│       ├── [Pages]
│       │   ├── Home
│       │   │   ├── FeaturedContent
│       │   │   ├── ContentCarousel(s)
│       │   │   ├── GenreExplorer
│       │   │   └── RecommendationList
│       │   ├── MoviePage
│       │   │   ├── MovieHeader
│       │   │   ├── VideoPlayer
│       │   │   ├── CastSection
│       │   │   ├── SimilarMoviesSection
│       │   │   └── ReviewSection
│       │   ├── Auth
│       │   ├── TvPage
│       │   ├── NowPlayingPage
│       │   ├── SiteSettings
│       │   └── NotFound
│       └── Footer
└── ErrorBoundary
```

## Componentes Core

### Layout

**Propósito**: Estructura base de la aplicación con header, contenido principal y footer.

**Propiedades**:
```typescript
interface LayoutProps {
  children: React.ReactNode;
}
```

**Uso**:
```tsx
<Layout>
  <HomePage />
</Layout>
```

### Header

**Propósito**: Barra de navegación superior con logo, enlaces y controles de usuario.

**Componentes Relacionados**:
- `DesktopNav`: Navegación para pantallas grandes
- `MobileMenu`: Menú desplegable para dispositivos móviles
- `SearchBar`: Control de búsqueda
- `NotificationBadge`: Indicador de notificaciones

**Características**:
- Cambio de estilos según scroll
- Adaptable a diferentes tamaños de pantalla
- Integración con sistema de autenticación

### VideoPlayer

**Propósito**: Reproductor de video personalizado con soporte para múltiples formatos y características avanzadas.

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
}
```

**Componentes Internos**:
- `Controls`: Barra de controles de reproducción
- `SeekBar`: Barra de progreso
- `SubtitlesDisplay`: Visualización de subtítulos
- `QualitySelector`: Selector de calidad
- `BufferingOverlay`: Indicador de buffer
- `ErrorOverlay`: Mensaje de error

**Hooks Relacionados**:
- `useVideoPlayerState`: Gestiona el estado del reproductor
- `useVideoPlayerLogic`: Implementa la lógica de control

### ContentCarousel

**Propósito**: Carrusel de tarjetas de contenido con navegación.

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

**Características**:
- Desplazamiento suave
- Navegación con teclado
- Carga perezosa de imágenes
- Adaptable a diferentes tamaños de pantalla

### ContentCard

**Propósito**: Tarjeta individual para mostrar una película o serie.

**Propiedades**:
```typescript
interface ContentCardProps {
  id: string;
  title: string;
  posterPath: string;
  rating?: number;
  year?: string;
  mediaType: 'movie' | 'tv';
  onClick?: (id: string, type: string) => void;
}
```

**Características**:
- Animaciones al pasar el ratón
- Indicador de calificación
- Optimización de carga de imagen
- Efecto glassmorphic

### FeaturedContent

**Propósito**: Sección destacada en la página principal.

**Propiedades**:
```typescript
interface FeaturedContentProps {
  item: FeaturedItem;
  onPlay?: (id: string) => void;
  onDetails?: (id: string) => void;
}
```

**Características**:
- Fondo dinámico
- Resumen de contenido
- Botones de acción
- Animaciones de entrada

### SearchModal

**Propósito**: Modal de búsqueda avanzada.

**Propiedades**:
```typescript
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}
```

**Componentes Internos**:
- `SearchInput`: Campo de entrada
- `SearchSuggestions`: Sugerencias en tiempo real
- `SearchHistory`: Historial de búsquedas
- `KeyboardShortcuts`: Ayuda de atajos de teclado
- `VirtualKeyboard`: Teclado virtual (para dispositivos táctiles)

**Hooks Relacionados**:
- `useSearchLogic`: Implementa la lógica de búsqueda
- `useDebounce`: Debounce para la entrada de búsqueda

### ContentInfoModal

**Propósito**: Modal con información detallada de contenido.

**Propiedades**:
```typescript
interface ContentInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'movie' | 'tv';
}
```

**Características**:
- Detalles completos
- Trailer embebido
- Información de reparto
- Opciones para agregar a listas
- Enlaces a contenido relacionado

### AnimatedInput

**Propósito**: Campo de entrada con animaciones.

**Propiedades**:
```typescript
interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  animation?: 'slide' | 'fade' | 'scale';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}
```

**Características**:
- Animación de etiqueta
- Manejo de estados de error
- Personalización visual
- Soporte para iconos

## Componentes de Autenticación

### AuthProvider

**Propósito**: Proveedor de contexto de autenticación.

**Propiedades**:
```typescript
interface AuthProviderProps {
  children: React.ReactNode;
}
```

**Contexto Expuesto**:
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}
```

### RequireAuth

**Propósito**: HOC para proteger rutas que requieren autenticación.

**Propiedades**:
```typescript
interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}
```

**Uso**:
```tsx
<RequireAuth>
  <ProfilePage />
</RequireAuth>
```

### SocialButton

**Propósito**: Botón para autenticación mediante proveedores sociales.

**Propiedades**:
```typescript
interface SocialButtonProps {
  provider: 'google' | 'facebook' | 'twitter';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  label?: string;
}
```

## Componentes de UI Comunes

### LoadingSpinner

**Propósito**: Indicador de carga animado.

**Propiedades**:
```typescript
interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: string;
  thickness?: number;
  text?: string;
}
```

### ErrorFallback

**Propósito**: Componente para mostrar errores de forma amigable.

**Propiedades**:
```typescript
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  message?: string;
}
```

### GlassmorphicBox

**Propósito**: Contenedor con efecto glassmorphic.

**Propiedades**:
```typescript
interface GlassmorphicBoxProps {
  children: React.ReactNode;
  blur?: number;
  opacity?: number;
  borderRadius?: string | number;
  border?: boolean;
  [x: string]: any; // Otras propiedades de estilo
}
```

### OptimizedImage

**Propósito**: Componente de imagen con optimizaciones.

**Propiedades**:
```typescript
interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  placeholderColor?: string;
  blurHash?: string;
  loadingBehavior?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}
```

**Características**:
- Carga progresiva
- Soporte para blurhash
- Placeholder durante la carga
- Manejo de errores con fallback

## Buenas Prácticas al Crear Componentes

1. **Componentes Pequeños**: Crea componentes enfocados en una sola responsabilidad
2. **Propiedades Tipadas**: Define interfaces para las props
3. **Valores por Defecto**: Proporciona valores predeterminados para props opcionales
4. **Manejo de Estados**: Considera todos los estados posibles (carga, éxito, error, vacío)
5. **Composición**: Diseña componentes que se puedan componer fácilmente
6. **Documentación**: Documenta props no obvias y comportamiento especial
7. **Accesibilidad**: Asegúrate de que los componentes sean accesibles
8. **Pruebas**: Considera cómo se probarán los componentes al diseñarlos