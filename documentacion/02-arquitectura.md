# Arquitectura de ChillFlix

## Arquitectura General

ChillFlix sigue una arquitectura de aplicación de una sola página (SPA) basada en componentes. El proyecto está organizado para favorecer la mantenibilidad, escalabilidad y reutilización de código.

```
├── src/
│   ├── components/       # Componentes de UI reutilizables
│   ├── pages/            # Componentes de página completa
│   ├── hooks/            # Hooks personalizados
│   ├── services/         # Servicios para API y lógica de negocio
│   ├── store/            # Estado global
│   ├── config/           # Configuración
│   ├── utils/            # Utilidades y funciones helper
│   ├── types/            # Definiciones TypeScript
│   └── theme/            # Configuración de tema
```

## Principios de Diseño

La arquitectura de ChillFlix se basa en los siguientes principios:

1. **Separación de Responsabilidades**: Cada componente, hook o servicio tiene una función específica y bien definida.
2. **Composición sobre Herencia**: Favorecer la composición de componentes pequeños para crear interfaces complejas.
3. **Estado Local vs. Global**: Mantener el estado lo más local posible, usando estado global solo cuando es necesario.
4. **Código Tipado**: Usar TypeScript para mejorar la robustez y documentación del código.
5. **Renderizado Condicional**: Implementar manejo de estados de carga, error y éxito en todos los componentes.

## Componentes

El proyecto organiza los componentes en base a su función:

```
components/
├── Auth/                # Componentes relacionados con autenticación
├── Button/              # Variantes de botones
├── Home/                # Componentes específicos de la página de inicio
├── Layout/              # Componentes de estructura (Header, Footer, etc.)
├── Movie/               # Componentes relacionados con películas
├── Search/              # Sistema de búsqueda
├── UI/                  # Componentes de UI genéricos
├── VideoPlayer/         # Reproductor de video y controles
└── WatchParty/          # Funcionalidad de watch party
```

Cada componente sigue un patrón similar:
- Props tipadas con interfaces
- Estado local con hooks de React
- Lógica de negocio extraída a hooks personalizados
- Estilos encapsulados

## Gestión de Estado

La aplicación utiliza múltiples estrategias para la gestión de estado:

1. **Estado Local**: `useState` y `useReducer` para estado específico de componentes
2. **Estado Global**: Jotai para estado compartido entre componentes no relacionados
3. **Estado de Datos**: React Query para estado de datos remotos con caché y revalidación
4. **Estado de Contexto**: React Context para estado compartido en subárboles de componentes

El uso de Jotai con Immer permite la actualización inmutable del estado global con una sintaxis más legible.

## Manejo de Datos

ChillFlix utiliza un enfoque por capas para el manejo de datos:

1. **Servicios API**: Encapsulan la comunicación con APIs externas
2. **Hooks de Datos**: Abstraen la lógica de obtención y transformación de datos
3. **Componentes**: Consumen los datos y se encargan únicamente de la presentación

Los servicios implementan caché y estrategias de reintento para optimizar la experiencia del usuario.

## Enrutamiento

React Router se utiliza para el sistema de enrutamiento, con las siguientes características:

- Carga diferida de componentes para páginas
- Protección de rutas mediante RequireAuth
- Parámetros y consultas para navegación con estado
- Manejo de errores a nivel de ruta
- Redirecciones y navegación programática

## Sistema de Autenticación

La autenticación se implementa usando Firebase Authentication con las siguientes características:

1. **AuthProvider**: Gestiona el estado de autenticación global
2. **useAuth Hook**: Proporciona métodos de autenticación a componentes
3. **RequireAuth**: Protege rutas que requieren autenticación
4. **Persistencia**: Mantiene la sesión entre recargas de página

## Arquitectura del Reproductor de Video

El componente VideoPlayer es una solución compleja con:

- Integración de múltiples bibliotecas (VideoJS, HLS.js, DashJS)
- Control de reproducción adaptativa
- Sistema de subtítulos
- Controles personalizados
- Gestión de calidad de reproducción
- Sincronización para modo Watch Party

## Optimización de Rendimiento

La aplicación incorpora varias técnicas de optimización:

1. **Code Splitting**: Carga diferida de código usando import dinámicos
2. **Memoización**: Uso de React.memo, useMemo y useCallback para evitar renderizados innecesarios
3. **Virtualización**: Para listas largas con react-virtuoso
4. **Lazy Loading**: Para imágenes y componentes pesados
5. **Precargar**: Datos y recursos críticos

## Manejo de Errores

El manejo de errores es centralizado mediante:

1. **ErrorBoundary**: Captura errores en el árbol de componentes
2. **Hooks de Error**: Para manejo coherente de errores en llamadas API
3. **Fallback UI**: Interfaces alternativas cuando ocurren errores

## Herramientas de Construcción y Despliegue

- **Vite**: Herramienta de construcción y desarrollo
- **TypeScript**: Compilador para verificación de tipos
- **ESLint**: Linting de código
- **Docker**: Contenedorización para despliegue
- **Fly.io**: Plataforma de despliegue