# Introducción a ChillFlix

## Visión General

ChillFlix es una aplicación web moderna de streaming de video desarrollada con React, TypeScript y un conjunto de tecnologías de vanguardia. La aplicación permite a los usuarios explorar, buscar y reproducir contenido multimedia, con características avanzadas como recomendaciones personalizadas, modo watch party y múltiples opciones de reproducción.

## Objetivos del Proyecto

- Proporcionar una experiencia de usuario fluida y atractiva para el streaming de video
- Implementar un diseño responsivo que funcione en diversos dispositivos
- Ofrecer reproductor de video con capacidades avanzadas (HLS, DASH, subtítulos)
- Proporcionar sistema de búsqueda y recomendaciones inteligentes
- Soportar autenticación segura y funciones sociales

## Tecnologías Principales

ChillFlix está construido con las siguientes tecnologías clave:

### Frontend
- **React 18.3.1**: Biblioteca de UI con el nuevo modelo de concurrencia
- **TypeScript**: Tipado estático para mejorar la calidad del código
- **Vite**: Herramienta de compilación rápida y ligera
- **Chakra UI**: Sistema de diseño con componentes accesibles
- **Framer Motion**: Biblioteca de animaciones declarativas

### Herramientas de Video
- **VideoJS**: Framework para reproductor de video personalizado
- **HLS.js**: Soporte para streaming HTTP Live Streaming
- **DashJS**: Soporte para streaming DASH

### Estado y Datos
- **Jotai**: Gestión atómica de estado global
- **React Query**: Obtención, caché y actualización de datos
- **Immer**: Manejo de estado inmutable

### Autenticación
- **Firebase**: Autenticación de usuarios y servicios
- **Google Auth Provider**: Login con Google

## Características Principales

- **Reproductor de Video Avanzado**: Soporte para múltiples formatos, calidades y subtítulos
- **Sistema de Búsqueda**: Búsqueda en tiempo real con sugerencias
- **Carruseles de Contenido**: Exploración visual del catálogo
- **Perfil de Usuario**: Preferencias y historial personalizados
- **Mode Watch Party**: Visualización sincronizada con otros usuarios
- **Tematización Dinámica**: Adaptación visual basada en el contenido
- **Soporte Multilenguaje**: Interfaz y subtítulos en varios idiomas

## Arquitectura de Alto Nivel

La aplicación sigue una arquitectura basada en componentes con separación clara de responsabilidades:

- **Componentes**: Piezas de UI reutilizables y componibles
- **Hooks**: Lógica de negocio encapsulada
- **Servicios**: Comunicación con APIs y procesamiento de datos
- **Contexto**: Estado compartido para árboles de componentes
- **Utilidades**: Funciones helper reutilizables

## Estado Actual del Proyecto

El proyecto se encuentra en desarrollo activo, con la mayoría de funcionalidades principales implementadas. El equipo trabaja continuamente en mejorar la experiencia del usuario, optimizar el rendimiento y añadir nuevas características.

---

Para una comprensión más profunda del proyecto, recomendamos revisar la [Arquitectura](./02-arquitectura.md) y la [Guía de Desarrollo](./03-guia-desarrollo.md).