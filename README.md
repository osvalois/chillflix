# ChillFlix

ChillFlix es una aplicación web moderna de streaming de video desarrollada con React, TypeScript y un conjunto de tecnologías de vanguardia. La aplicación permite a los usuarios explorar, buscar y reproducir contenido multimedia con características avanzadas.

![ChillFlix Logo](/public/chillflix.svg)

## Características Principales

- **Reproductor de Video Avanzado**: Soporte para múltiples formatos (HLS, DASH, MP4), calidades y subtítulos
- **Exploración de Contenido**: Carruseles interactivos y categorías de géneros
- **Búsqueda Avanzada**: Búsqueda en tiempo real con sugerencias y filtros
- **Perfil de Usuario**: Preferencias personalizadas e historial de visualización
- **Watch Party**: Visualización sincronizada con otros usuarios
- **Recomendaciones Personalizadas**: Sugerencias basadas en historial de visualización
- **Diseño Responsive**: Experiencia optimizada para todos los dispositivos
- **Tematización Dinámica**: Interfaz que se adapta al contenido mostrado

## Tecnologías

- **Frontend**: React 18.3, TypeScript, Vite
- **UI**: Chakra UI, Framer Motion
- **Estado**: Jotai, React Query
- **Video**: VideoJS, HLS.js, DashJS
- **Autenticación**: Firebase
- **APIs**: TMDB, OpenSubtitles

## Requisitos

- Node.js v18.x o superior
- npm o yarn (recomendado)
- Cuenta de Firebase (para autenticación)
- API key de TMDB (para datos de películas)

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

3. Configurar variables de entorno (crear archivo `.env.local`):
```
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_TMDB_API_KEY=your_tmdb_api_key
```

4. Iniciar servidor de desarrollo:
```bash
yarn dev
```

5. Abrir navegador en `http://localhost:5173`

## Scripts Disponibles

- `yarn dev`: Inicia servidor de desarrollo
- `yarn build`: Compila la aplicación para producción
- `yarn lint`: Ejecuta linter para verificar código
- `yarn preview`: Vista previa de la build de producción

## Estructura del Proyecto

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
└── assets/           # Recursos estáticos
```

## Documentación

La documentación completa del proyecto está disponible en la carpeta [documentacion](/documentacion):

1. [Introducción](/documentacion/01-introduccion.md) - Visión general del proyecto
2. [Arquitectura](/documentacion/02-arquitectura.md) - Estructura y diseño del sistema
3. [Guía de Desarrollo](/documentacion/03-guia-desarrollo.md) - Instrucciones para desarrolladores
4. [Componentes](/documentacion/04-componentes.md) - Documentación de componentes principales
5. [Servicios](/documentacion/05-servicios.md) - Servicios y API
6. [Hooks](/documentacion/06-hooks.md) - Hooks personalizados
7. [Autenticación](/documentacion/07-autenticacion.md) - Sistema de autenticación
8. [Reproductor de Video](/documentacion/08-reproductor-video.md) - Componente VideoPlayer
9. [Estado Global](/documentacion/09-estado-global.md) - Gestión del estado con Jotai
10. [API Reference](/documentacion/10-api-reference.md) - Referencia de API

## Despliegue

La aplicación está configurada para desplegar en Fly.io. Para desplegar:

```bash
fly deploy
```

También puede ser desplegada en cualquier servicio que soporte aplicaciones estáticas (Vercel, Netlify, etc.)

## Contribuir

1. Fork del repositorio
2. Crear rama para nueva característica: `git checkout -b feature/nombre-caracteristica`
3. Commit de cambios: `git commit -m 'feat: agregar nueva característica'`
4. Push a la rama: `git push origin feature/nombre-caracteristica`
5. Crear Pull Request

Por favor, asegúrate de seguir las convenciones de código existentes y añadir pruebas para nuevas características.

## Licencia

Este proyecto está licenciado bajo los términos de la licencia MIT.

## Contacto

Para preguntas o sugerencias, por favor abrir un issue en el repositorio.