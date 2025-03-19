# Gestión de Estado Global

ChillFlix utiliza Jotai para la gestión del estado global, proporcionando una solución atómica, ligera y eficiente. Esta sección documenta la arquitectura, patrones y mejores prácticas para la gestión de estado en la aplicación.

## Arquitectura de Estado

La gestión de estado en ChillFlix sigue una arquitectura basada en estos principios:

1. **Atomicidad**: Estado dividido en pequeñas unidades (átomos)
2. **Composición**: Átomos compuestos para crear estado derivado
3. **Localidad**: Estado mantenido lo más cerca posible de donde se utiliza
4. **Separación de Lectura/Escritura**: Separar la lectura de estado de las acciones que lo modifican
5. **Inmutabilidad**: Estado inmutable con actualizaciones explícitas

## Niveles de Estado

ChillFlix utiliza varios niveles de estado:

1. **Estado Local de Componente**: `useState`, `useReducer` para estado específico de componentes
2. **Estado de Contexto**: `useContext` para estado compartido en subárboles de componentes
3. **Estado Global Atómico**: Jotai para estado compartido global
4. **Estado de Datos Remotos**: React Query para datos de API con manejo de caché

## Jotai: Conceptos Básicos

Jotai ofrece un enfoque minimalista para gestión de estado:

### Átomos Primitivos

```typescript
// src/store/atoms/playerAtoms.ts
import { atom } from 'jotai';

// Átomos primitivos
export const isPlayingAtom = atom(false);
export const currentTimeAtom = atom(0);
export const volumeAtom = atom(1);
export const mutedAtom = atom(false);
```

### Átomos Derivados

```typescript
// Átomos derivados (solo lectura)
export const formattedTimeAtom = atom((get) => {
  const currentTime = get(currentTimeAtom);
  return formatTime(currentTime);
});

// Átomos derivados (lectura/escritura)
export const volumeControlAtom = atom(
  (get) => {
    const volume = get(volumeAtom);
    const muted = get(mutedAtom);
    return { volume, muted };
  },
  (get, set, newValue: { volume?: number; muted?: boolean }) => {
    if (newValue.volume !== undefined) {
      set(volumeAtom, newValue.volume);
    }
    if (newValue.muted !== undefined) {
      set(mutedAtom, newValue.muted);
    }
  }
);
```

### Uso en Componentes

```tsx
// src/components/VideoPlayer/VolumeControls.tsx
import { useAtom } from 'jotai';
import { volumeAtom, mutedAtom } from '../../store/atoms/playerAtoms';

export const VolumeControls = () => {
  const [volume, setVolume] = useAtom(volumeAtom);
  const [muted, setMuted] = useAtom(mutedAtom);
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };
  
  const toggleMute = () => {
    setMuted(!muted);
  };
  
  return (
    <div className="volume-controls">
      <button onClick={toggleMute}>
        {muted ? 'Unmute' : 'Mute'}
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
        disabled={muted}
      />
    </div>
  );
};
```

## Estructura del Store

ChillFlix organiza su estado global en módulos lógicos:

```
src/store/
├── atoms/               # Átomos básicos
│   ├── playerAtoms.ts   # Estado del reproductor
│   ├── uiAtoms.ts       # Estado de la interfaz
│   ├── userAtoms.ts     # Estado del usuario
│   └── contentAtoms.ts  # Estado de contenido
├── derived/             # Átomos derivados complejos
│   ├── playerDerived.ts
│   ├── recommendationDerived.ts
│   └── watchHistoryDerived.ts
├── actions/             # Funciones para modificar estado
│   ├── playerActions.ts
│   ├── contentActions.ts
│   └── userActions.ts
├── selectors/           # Selectores optimizados
│   ├── contentSelectors.ts
│   └── playerSelectors.ts
└── carouselStore.ts     # Ejemplo de store específico
```

## Patrones Implementados

### Átomos por Dominio

Los átomos se organizan por dominio funcional:

```typescript
// src/store/atoms/uiAtoms.ts
import { atom } from 'jotai';

// Tema
export const darkModeAtom = atom(false);
export const themeAccentColorAtom = atom('#FF5733');

// Navegación
export const isNavOpenAtom = atom(false);
export const currentSectionAtom = atom('home');

// Modales
export const activeModalAtom = atom<string | null>(null);
export const modalPropsAtom = atom<Record<string, any>>({});
```

### Átomos para Estado Persistente

ChillFlix utiliza átomos persistentes para ciertos estados:

```typescript
// src/store/atoms/userAtoms.ts
import { atomWithStorage } from 'jotai/utils';

// Estado persistente en localStorage
export const userPreferencesAtom = atomWithStorage('userPreferences', {
  subtitlesEnabled: false,
  preferredLanguage: 'en',
  preferredQuality: 'auto',
  volume: 0.8,
  playbackRate: 1
});

export const watchHistoryAtom = atomWithStorage('watchHistory', []);
export const favoriteMoviesAtom = atomWithStorage('favoriteMovies', []);
```

### Integración con Immer

Para actualizaciones complejas de estado, ChillFlix usa Jotai con Immer:

```typescript
// src/store/atoms/contentAtoms.ts
import { atom } from 'jotai';
import { atomWithImmer } from 'jotai-immer';

export interface ContentItem {
  id: string;
  title: string;
  type: 'movie' | 'tv';
  // ... otros campos
}

// Átomos con Immer para actualizaciones inmutables más sencillas
export const contentListAtom = atomWithImmer<ContentItem[]>([]);

// Acciones para actualizar contentListAtom
export const contentListActions = {
  add: atom(
    null,
    (get, set, newItem: ContentItem) => {
      set(contentListAtom, (draft) => {
        draft.push(newItem);
      });
    }
  ),
  remove: atom(
    null,
    (get, set, id: string) => {
      set(contentListAtom, (draft) => {
        const index = draft.findIndex(item => item.id === id);
        if (index !== -1) {
          draft.splice(index, 1);
        }
      });
    }
  ),
  update: atom(
    null,
    (get, set, updatedItem: ContentItem) => {
      set(contentListAtom, (draft) => {
        const index = draft.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          draft[index] = updatedItem;
        }
      });
    }
  )
};
```

### Acciones y Selectores

ChillFlix separa la lógica de acciones y selectores:

```typescript
// src/store/actions/playerActions.ts
import { atom } from 'jotai';
import { isPlayingAtom, currentTimeAtom, durationAtom } from '../atoms/playerAtoms';

export const playerActions = {
  play: atom(
    null,
    (get, set) => {
      set(isPlayingAtom, true);
    }
  ),
  pause: atom(
    null,
    (get, set) => {
      set(isPlayingAtom, false);
    }
  ),
  seekTo: atom(
    null,
    (get, set, time: number) => {
      const duration = get(durationAtom);
      // Asegurar que el tiempo esté dentro de límites
      const clampedTime = Math.max(0, Math.min(time, duration));
      set(currentTimeAtom, clampedTime);
    }
  ),
  // Más acciones...
};
```

```typescript
// src/store/selectors/playerSelectors.ts
import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { currentTimeAtom, durationAtom } from '../atoms/playerAtoms';

// Selector para calcular el progreso (0-100%)
export const progressPercentAtom = atom((get) => {
  const currentTime = get(currentTimeAtom);
  const duration = get(durationAtom);
  if (duration === 0) return 0;
  return (currentTime / duration) * 100;
});

// Selector para saber si el video ha terminado
export const isVideoEndedAtom = atom((get) => {
  const currentTime = get(currentTimeAtom);
  const duration = get(durationAtom);
  return duration > 0 && currentTime >= duration - 0.5;
});
```

## Ejemplo en un Componente Real

```tsx
// src/components/VideoPlayer/PlaybackControls.tsx
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { isPlayingAtom, playbackRateAtom } from '../../store/atoms/playerAtoms';
import { progressPercentAtom } from '../../store/selectors/playerSelectors';
import { playerActions } from '../../store/actions/playerActions';

export const PlaybackControls = () => {
  // Lectura de estado
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  const [playbackRate, setPlaybackRate] = useAtom(playbackRateAtom);
  const progressPercent = useAtomValue(progressPercentAtom);
  
  // Acciones
  const { seekTo } = playerActions;
  const seekToValue = useSetAtom(seekTo);
  
  // Handlers
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekToValue(parseFloat(e.target.value));
  };
  
  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
  };
  
  return (
    <div className="playback-controls">
      <button onClick={togglePlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      
      <input
        type="range"
        min="0"
        max="100"
        value={progressPercent}
        onChange={handleSeek}
      />
      
      <select
        value={playbackRate}
        onChange={(e) => handlePlaybackRateChange(parseFloat(e.target.value))}
      >
        <option value="0.5">0.5x</option>
        <option value="0.75">0.75x</option>
        <option value="1">1x</option>
        <option value="1.25">1.25x</option>
        <option value="1.5">1.5x</option>
        <option value="2">2x</option>
      </select>
    </div>
  );
};
```

## Caso de Estudio: Carrusel con Estado Global

ChillFlix implementa carruseles de contenido con estado global para permitir navegación coordinada:

```typescript
// src/store/carouselStore.ts
import { atom } from 'jotai';
import { atomWithImmer } from 'jotai-immer';

interface CarouselState {
  carousels: Record<string, {
    currentIndex: number;
    items: string[];
    itemsPerView: number;
  }>;
  activeCarouselId: string | null;
}

const initialState: CarouselState = {
  carousels: {},
  activeCarouselId: null
};

export const carouselStateAtom = atomWithImmer(initialState);

// Acciones
export const registerCarousel = atom(
  null,
  (get, set, payload: { id: string; items: string[]; itemsPerView: number }) => {
    set(carouselStateAtom, (draft) => {
      draft.carousels[payload.id] = {
        currentIndex: 0,
        items: payload.items,
        itemsPerView: payload.itemsPerView
      };
    });
  }
);

export const unregisterCarousel = atom(
  null,
  (get, set, id: string) => {
    set(carouselStateAtom, (draft) => {
      delete draft.carousels[id];
      if (draft.activeCarouselId === id) {
        draft.activeCarouselId = null;
      }
    });
  }
);

export const setActiveCarousel = atom(
  null,
  (get, set, id: string | null) => {
    set(carouselStateAtom, (draft) => {
      draft.activeCarouselId = id;
    });
  }
);

export const updateCarouselIndex = atom(
  null,
  (get, set, payload: { id: string; index: number }) => {
    set(carouselStateAtom, (draft) => {
      if (draft.carousels[payload.id]) {
        draft.carousels[payload.id].currentIndex = payload.index;
      }
    });
  }
);

// Selectores
export const carouselByIdSelector = (id: string) => 
  atom((get) => {
    const state = get(carouselStateAtom);
    return state.carousels[id];
  });

export const activeCarouselSelector = atom((get) => {
  const state = get(carouselStateAtom);
  if (!state.activeCarouselId) return null;
  return state.carousels[state.activeCarouselId];
});
```

## Integración con React Query

ChillFlix combina Jotai con React Query para gestión de datos:

```typescript
// src/hooks/useMovieData.ts
import { useQuery } from 'react-query';
import { useAtom } from 'jotai';
import { movieService } from '../services/movieService';
import { currentMovieIdAtom, selectedQualityAtom } from '../store/atoms/playerAtoms';

export const useMovieData = () => {
  const [movieId] = useAtom(currentMovieIdAtom);
  const [quality] = useAtom(selectedQualityAtom);
  
  // Consulta de detalles de película
  const movieQuery = useQuery(
    ['movie', movieId],
    () => movieService.getMovieDetails(movieId),
    {
      enabled: !!movieId,
      staleTime: 5 * 60 * 1000, // 5 minutos
    }
  );
  
  // Consulta de URL de streaming (dependiente de movieId y quality)
  const streamingQuery = useQuery(
    ['streaming', movieId, quality],
    () => movieService.getStreamingUrl(movieId, quality),
    {
      enabled: !!movieId,
      staleTime: 60 * 1000, // 1 minuto
    }
  );
  
  return {
    movie: movieQuery.data,
    streaming: streamingQuery.data,
    isLoading: movieQuery.isLoading || streamingQuery.isLoading,
    error: movieQuery.error || streamingQuery.error,
  };
};
```

## Optimizaciones de Rendimiento

ChillFlix implementa varias optimizaciones para el manejo eficiente del estado:

### 1. Atomicidad Granular

Dividir estado en átomos pequeños para evitar renderizados innecesarios:

```typescript
// Malo: Un solo átomo grande
const playerStateAtom = atom({
  isPlaying: false,
  currentTime: 0,
  volume: 1,
  muted: false,
  // ...muchas más propiedades
});

// Bueno: Átomos separados
const isPlayingAtom = atom(false);
const currentTimeAtom = atom(0);
const volumeAtom = atom(1);
const mutedAtom = atom(false);
```

### 2. useAtomValue vs useAtom

Usar la función más específica según necesidad:

```typescript
// Componente que solo lee
const ProgressBar = () => {
  // Solo lectura, no trigger re-renders cuando cambian otros átomos
  const currentTime = useAtomValue(currentTimeAtom);
  const duration = useAtomValue(durationAtom);
  // ...
};

// Componente que lee y escribe
const PlayButton = () => {
  // Lectura y escritura
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom);
  // ...
};
```

### 3. Memoización de Selectores

Uso de selectAtom para memoización:

```typescript
import { selectAtom } from 'jotai/utils';

// Selector memoizado que solo se recalcula cuando cambian las dependencias
const formattedProgressAtom = selectAtom(
  [currentTimeAtom, durationAtom],
  ([currentTime, duration]) => {
    return {
      percent: duration ? (currentTime / duration) * 100 : 0,
      time: formatTime(currentTime),
      remaining: formatTime(Math.max(0, duration - currentTime))
    };
  }
);
```

## Buenas Prácticas

1. **Granularidad Adecuada**: Dividir estado en átomos significativos, pero no excesivamente pequeños
2. **Evitar Dependencias Circulares**: Estructurar átomos para evitar ciclos de dependencia
3. **Documentar Átomos**: Incluir JSDoc con el propósito y estructura de cada átomo
4. **Organizar por Dominio**: Agrupar átomos relacionados funcionalmente
5. **Consistencia en Nomenclatura**: Seguir patrones como `nombreDelEstadoAtom`
6. **Separar Acciones y Estado**: Usar átomos de acción para encapsular lógica
7. **Validación de Estado**: Implementar validación al actualizar estado

## Ejemplo de Documentación de Átomo

```typescript
/**
 * Átomo que representa el estado actual de reproducción.
 *
 * @type {boolean} - true cuando el video está reproduciendo, false cuando está pausado
 * @listens videoElement - Se sincroniza con eventos 'play' y 'pause' del elemento video
 * @affects UI - Los controles de reproducción y visualización dependen de este estado
 * @default false - El video empieza pausado por defecto
 */
export const isPlayingAtom = atom(false);
```

## Depuración de Estado

ChillFlix facilita la depuración del estado con herramientas específicas:

```typescript
// src/utils/debug.ts
import { useAtomsDebugValue } from 'jotai/devtools';
import { useAtomValue } from 'jotai';
import * as playerAtoms from '../store/atoms/playerAtoms';
import * as uiAtoms from '../store/atoms/uiAtoms';

export const StateDebugger = () => {
  // Muestra los valores de los átomos en React DevTools
  useAtomsDebugValue();
  
  // En desarrollo, podemos renderizar un componente para mostrar estado
  if (process.env.NODE_ENV === 'development') {
    const isPlaying = useAtomValue(playerAtoms.isPlayingAtom);
    const currentTime = useAtomValue(playerAtoms.currentTimeAtom);
    // ... otros átomos importantes
    
    return (
      <div style={{ position: 'fixed', bottom: 0, right: 0, background: 'rgba(0,0,0,0.8)', color: 'white', padding: 10, zIndex: 9999 }}>
        <pre>
          {JSON.stringify({ isPlaying, currentTime }, null, 2)}
        </pre>
      </div>
    );
  }
  
  return null;
};
```

## Migración y Evolución del Estado

1. **Versionado de Estado**: Implementar versionado para migración de estado persistente
2. **Estrategia de Migración**: Código para migrar de versiones antiguas a nuevas
3. **Compatibilidad**: Mantener compatibilidad hacia atrás cuando sea posible
4. **Limpieza de Estado Obsoleto**: Eliminar estado persistente obsoleto

```typescript
// Ejemplo de migración de estado persistente
import { atomWithStorage } from 'jotai/utils';

// Función de migración
const migratePreferences = (oldData: any) => {
  // Estado v1: { volume: number, language: string }
  // Estado v2: { volume: number, audioSettings: { language: string } }
  
  if (!oldData || !('version' in oldData)) {
    // Migrar desde v1 a v2
    return {
      version: 2,
      volume: oldData?.volume ?? 0.8,
      audioSettings: {
        language: oldData?.language ?? 'en'
      }
    };
  }
  
  return oldData;
};

export const userPreferencesAtom = atomWithStorage(
  'userPreferences',
  { version: 2, volume: 0.8, audioSettings: { language: 'en' } },
  {
    getItem: (key) => {
      const storedData = localStorage.getItem(key);
      if (!storedData) return null;
      
      try {
        const data = JSON.parse(storedData);
        return migratePreferences(data);
      } catch (e) {
        console.error('Error parsing stored preferences', e);
        return null;
      }
    },
    setItem: (key, value) => {
      localStorage.setItem(key, JSON.stringify(value));
    },
    removeItem: (key) => {
      localStorage.removeItem(key);
    }
  }
);
```