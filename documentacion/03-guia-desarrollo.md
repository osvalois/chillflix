# Guía de Desarrollo

## Requisitos del Sistema

Para desarrollar en ChillFlix, necesitas:

- **Node.js**: v18.x o superior
- **npm** o **yarn**: Preferiblemente yarn
- **Git**: Para control de versiones

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/usuario/chillflix.git
cd chillflix
```

2. Instalar dependencias:
```bash
yarn install
```

3. Copiar la configuración de ejemplo (si aplica):
```bash
cp .env.example .env.local
```

4. Configurar variables de entorno:
   - Obtener credenciales de Firebase
   - Configurar claves API para servicios externos (TMDB, etc.)

## Comandos de Desarrollo

- **Iniciar servidor de desarrollo**:
```bash
yarn dev
```

- **Construir para producción**:
```bash
yarn build
```

- **Verificar tipos**:
```bash
tsc -b
```

- **Ejecutar linter**:
```bash
yarn lint
```

- **Vista previa de construcción**:
```bash
yarn preview
```

## Estructura de Carpetas

```
src/
├── components/       # Componentes reutilizables
├── pages/            # Páginas completas 
├── hooks/            # Hooks personalizados
├── services/         # Servicios para APIs
├── store/            # Estado global
├── utils/            # Utilidades
├── types/            # Tipos TypeScript
├── theme/            # Configuración de tema
├── assets/           # Recursos estáticos
├── config/           # Configuración
├── constants.tsx     # Constantes compartidas
├── App.tsx           # Componente raíz
└── main.tsx          # Punto de entrada
```

## Flujo de Trabajo

1. **Crear Rama**: Para cada nueva función o corrección de error, crea una rama nueva
2. **Desarrollo**: Implementa cambios siguiendo las convenciones del proyecto
3. **Pruebas**: Verifica que tu código funcione según lo esperado
4. **Pull Request**: Crea un PR con una descripción clara de los cambios
5. **Revisión**: Responde a la retroalimentación y realiza cambios si es necesario
6. **Fusión**: Una vez aprobado, tu código será fusionado a la rama principal

## Convenciones de Código

### Nombrado

- **Componentes**: PascalCase (ej. `MovieCard.tsx`)
- **Hooks**: camelCase con prefijo "use" (ej. `useMovieData.ts`)
- **Utilidades**: camelCase (ej. `formatters.ts`)
- **Constantes**: SNAKE_CASE para constantes globales
- **Tipos/Interfaces**: PascalCase (ej. `MovieType.ts`)

### Estructura de Componentes

```tsx
// Imports
import { useState, useEffect } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useMovieData } from '../hooks/useMovieData';

// Tipos
interface MovieCardProps {
  id: string;
  showDetails?: boolean;
}

// Componente
export const MovieCard = ({ id, showDetails = false }: MovieCardProps) => {
  // Hooks y estado
  const { data, loading, error } = useMovieData(id);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Efectos
  useEffect(() => {
    // Lógica
  }, [id]);
  
  // Handlers
  const handleClick = () => {
    setIsExpanded(prev => !prev);
  };
  
  // Renderizado condicional
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data) return null;
  
  // JSX
  return (
    <Box onClick={handleClick}>
      <Text>{data.title}</Text>
      {isExpanded && showDetails && (
        <Text>{data.description}</Text>
      )}
    </Box>
  );
};
```

### Estilos

- Utilizar componentes de Chakra UI con preferencia
- Para estilos personalizados, usar la API de estilos de Chakra UI
- Evitar CSS en archivos separados cuando sea posible

### TypeScript

- Usar tipos específicos en lugar de `any`
- Preferir `interface` para objetos públicos
- Documentar tipos complejos
- Usar genéricos cuando sea apropiado
- Establecer nullability explícitamente

## Servicios API y Datos

### Creando un Nuevo Servicio

1. Crear archivo en `src/services/`
2. Definir tipos para parámetros y respuestas
3. Implementar funciones para cada endpoint
4. Exportar funciones públicas
5. Documentar parámetros y comportamiento

### Creando un Nuevo Hook de Datos

1. Crear archivo en `src/hooks/`
2. Utilizar servicios existentes
3. Implementar manejo de estado (loading, error, data)
4. Proporcionar funciones para actualizar/manipular datos
5. Documentar la API pública del hook

## Contribuyendo al Proyecto

### Pull Requests

- Mantener los PR pequeños y enfocados
- Incluir una descripción clara del cambio
- Referenciar issues relacionados
- Asegurarse de que todas las verificaciones pasen

### Commits

- Usar mensajes descriptivos
- Seguir el formato: `tipo: descripción corta`
- Tipos comunes: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`

### Reporte de Bugs

Incluir:
1. Descripción del problema
2. Pasos para reproducir
3. Comportamiento esperado vs actual
4. Capturas de pantalla si aplica
5. Contexto adicional

## Despliegue

El proyecto se despliega automáticamente en Fly.io cuando se fusiona código en la rama main. El proceso de despliegue incluye:

1. Construcción de la aplicación
2. Construcción de la imagen Docker
3. Despliegue en la plataforma

Para despliegues manuales:

```bash
# Instalar CLI de Fly.io si es necesario
# curl -L https://fly.io/install.sh | sh

# Desplegar cambios
fly deploy
```

## Recursos Adicionales

- [Documentación de React](https://reactjs.org/docs/getting-started.html)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [Documentación de Chakra UI](https://chakra-ui.com/docs/getting-started)
- [Documentación de Jotai](https://jotai.org/docs/introduction)
- [Documentación de VideoJS](https://docs.videojs.com/)
- [Documentación de Firebase](https://firebase.google.com/docs)