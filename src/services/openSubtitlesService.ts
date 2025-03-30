import axios, { AxiosInstance } from 'axios';
import pako from 'pako';
import { Subtitle, SearchResponseV1, DownloadRequestV1, DownloadResponseV1 } from './subtitle-types';
import { SubtitleAdapter } from './subtitle-adapter';

class OpenSubtitlesService {
  private axiosInstance: AxiosInstance;
  private apiKey: string;
  private subtitleCache: Map<string, Subtitle[]> = new Map();
  private downloadCache: Map<string, string> = new Map();
  private pendingRequests: Map<string, Promise<Subtitle[]>> = new Map();
  private lastRequestTime: number = 0;
  private readonly REQUEST_DELAY = 1000;

  constructor() {
    this.apiKey = 'cnDJOg4tBN1Ir7VDsPmGFLSLkGVk4P8z';
    this.axiosInstance = axios.create({
      baseURL: 'https://chillflix-subtitles-service-production.up.railway.app/api/v1',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': this.apiKey,
        'User-Agent': 'TemporaryUserAgent v1.0'
      }
    });
  }

  private async throttleRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      await new Promise(resolve => 
        setTimeout(resolve, this.REQUEST_DELAY - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Busca subtítulos para un contenido dado por su IMDB ID
   * Implementa sistema avanzado de caché y priorización de idiomas
   * 
   * @param imdbId - ID de IMDB del contenido
   * @param preferredLanguages - Idiomas preferidos (opcional, por defecto inglés y español)
   * @returns Lista de subtítulos disponibles, ordenados por relevancia
   */
  async searchSubtitles(
    imdbId: string, 
    preferredLanguages: string[] = navigator.languages || ['en', 'es']
  ): Promise<Subtitle[]> {
    // Verificar caché de sesión (memoria)
    const cachedSubtitles = this.subtitleCache.get(imdbId);
    if (cachedSubtitles) {
      return this.prioritizeSubtitlesByLanguage(cachedSubtitles, preferredLanguages);
    }

    // Verificar caché persistente (localStorage)
    try {
      const localStorageKey = `subtitles_${imdbId}`;
      const storedSubtitles = localStorage.getItem(localStorageKey);
      
      if (storedSubtitles) {
        const parsedSubtitles = JSON.parse(storedSubtitles);
        const cacheTimestamp = parsedSubtitles.timestamp || 0;
        
        // Usar caché si tiene menos de 7 días
        const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días en ms
        if (Date.now() - cacheTimestamp < CACHE_TTL) {
          const subtitles = parsedSubtitles.data || [];
          this.subtitleCache.set(imdbId, subtitles);
          return this.prioritizeSubtitlesByLanguage(subtitles, preferredLanguages);
        }
      }
    } catch (e) {
      // Error al acceder a localStorage (modo incógnito, etc) - ignorar y continuar
      console.warn('Error al acceder a caché de subtítulos:', e);
    }

    // Evitar solicitudes duplicadas
    const pendingRequest = this.pendingRequests.get(imdbId);
    if (pendingRequest) {
      return pendingRequest.then(subtitles => 
        this.prioritizeSubtitlesByLanguage(subtitles, preferredLanguages)
      );
    }

    // Realizar petición a la API
    const request = this.fetchSubtitles(imdbId, preferredLanguages);
    this.pendingRequests.set(imdbId, request);

    try {
      const subtitles = await request;
      
      // Guardar en caché de memoria
      this.subtitleCache.set(imdbId, subtitles);
      
      // Guardar en localStorage con timestamp
      try {
        const cacheData = {
          data: subtitles,
          timestamp: Date.now()
        };
        localStorage.setItem(`subtitles_${imdbId}`, JSON.stringify(cacheData));
      } catch (e) {
        // Error al guardar en localStorage - ignorar
      }
      
      return this.prioritizeSubtitlesByLanguage(subtitles, preferredLanguages);
    } catch (error) {
      console.error('Error al buscar subtítulos:', error);
      return [];
    } finally {
      this.pendingRequests.delete(imdbId);
    }
  }
  
  /**
   * Ordena los subtítulos dando prioridad a idiomas preferidos
   * y a características de calidad como HD, confiabilidad, etc.
   */
  private prioritizeSubtitlesByLanguage(subtitles: Subtitle[], preferredLanguages: string[]): Subtitle[] {
    // Convertir preferredLanguages a códigos ISO639 en minúsculas para comparación
    const preferredLangCodes = preferredLanguages.map(lang => {
      // Manejar formatos como 'es-ES', 'en-US'
      const baseLang = lang.split('-')[0].toLowerCase();
      return baseLang;
    });
    
    // Crear copia para no modificar el original en caché
    return [...subtitles].sort((a, b) => {
      // Prioridad 1: Idioma del usuario
      const aLangIndex = preferredLangCodes.indexOf(a.ISO639.toLowerCase());
      const bLangIndex = preferredLangCodes.indexOf(b.ISO639.toLowerCase());
      
      // Si ambos están o no están en los idiomas preferidos
      if ((aLangIndex !== -1) === (bLangIndex !== -1)) {
        // Si ambos están, ordenar por posición en la lista de preferencias
        if (aLangIndex !== -1 && bLangIndex !== -1) {
          return aLangIndex - bLangIndex;
        }
        
        // Prioridad 2: Subtítulos HD
        if (a.SubHD !== b.SubHD) {
          return a.SubHD === "1" ? -1 : 1;
        }
        
        // Prioridad 3: Puntuación
        if (a.Score !== b.Score) {
          return b.Score - a.Score;
        }
        
        // Prioridad 4: Valoración
        const aRating = parseFloat(a.SubRating);
        const bRating = parseFloat(b.SubRating);
        if (!isNaN(aRating) && !isNaN(bRating) && aRating !== bRating) {
          return bRating - aRating;
        }
        
        // Prioridad 5: Número de descargas
        const aDownloads = parseInt(a.SubDownloadsCnt);
        const bDownloads = parseInt(b.SubDownloadsCnt);
        if (!isNaN(aDownloads) && !isNaN(bDownloads)) {
          return bDownloads - aDownloads;
        }
        
        // Si todo es igual, no modificar el orden original
        return 0;
      }
      
      // Priorizar el que está en los idiomas preferidos
      return aLangIndex !== -1 ? -1 : 1;
    });
  }

  /**
   * Realiza la petición a la API de subtítulos con soporte para reintentos y optimizaciones
   * 
   * @param imdbId - ID de IMDB del contenido
   * @param preferredLanguages - Lista de idiomas preferidos por el usuario
   * @returns Lista de subtítulos encontrados
   */
  private async fetchSubtitles(imdbId: string, preferredLanguages: string[] = []): Promise<Subtitle[]> {
    // Número máximo de reintentos
    const MAX_RETRIES = 3;
    let retryCount = 0;
    let lastError: any = null;
    
    // Extraer códigos de idioma de 2 letras para la API
    const languageCodes = this.extractLanguageCodes(preferredLanguages);
    // Limitar a 5 idiomas para no sobrecargar la API
    const topLanguages = languageCodes.slice(0, 5); 
    // Asegurar que inglés y español estén incluidos como respaldo
    if (!topLanguages.includes('en')) topLanguages.push('en');
    if (!topLanguages.includes('es')) topLanguages.push('es');
    // Formato de idiomas para la API: 'en,es,fr'
    const languagesParam = [...new Set(topLanguages)].join(',');
    
    // Algoritmo de reintento con backoff exponencial
    while (retryCount < MAX_RETRIES) {
      try {
        // Regular el tráfico hacia la API
        await this.throttleRequest();
        
        // Limpiar ID para el formato esperado por la API
        const cleanImdbId = imdbId.replace('tt', '');
        
        // Parámetros optimizados para la API
        const response = await this.axiosInstance.get<SearchResponseV1>('/subtitles', {
          params: {
            imdb_id: cleanImdbId,
            languages: languagesParam,
            // Otros parámetros útiles:
            // order_by: 'download_count', // Ordenar por popularidad
            // order_direction: 'desc',
            // Petición optimizada para minimizar datos
            // limit: 20 // Limitar resultados para mejorar rendimiento
          },
          // Timeout para evitar bloqueos
          timeout: 5000,
          // Optimización de cabeceras
          headers: {
            // Asegurar que la respuesta sea comprimida
            'Accept-Encoding': 'gzip, deflate, br'
          }
        });

        // Convertir resultados al formato legacy usado por la aplicación
        return response.data.data.map(subtitle => 
          SubtitleAdapter.toLegacySubtitle(subtitle)
        );
      } catch (error) {
        lastError = error;
        retryCount++;
        
        // Si no es el último intento, esperar antes de reintentar
        if (retryCount < MAX_RETRIES) {
          // Backoff exponencial: esperar más tiempo en cada reintento
          const delayMs = Math.min(1000 * Math.pow(2, retryCount), 8000);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    // Si llegamos aquí, todos los reintentos han fallado
    console.error('Error buscando subtítulos después de reintentos:', lastError);
    return [];
  }
  
  /**
   * Extrae códigos de idioma de 2 letras de las preferencias del navegador
   */
  private extractLanguageCodes(languages: string[]): string[] {
    return languages.map(lang => {
      // Extraer código base del idioma (por ejemplo, 'es' de 'es-ES')
      return lang.split('-')[0].toLowerCase();
    });
  }

  /**
   * Descarga y prepara un archivo de subtítulos para su uso en el reproductor
   * Implementa caché en memoria, sessionStorage y gestión avanzada de errores
   * 
   * @param fileId - ID del archivo de subtítulos
   * @returns URL del blob con el contenido del subtítulo procesado
   */
  async downloadSubtitle(fileId: string): Promise<string> {
    // Verificar caché en memoria (más rápida)
    const cachedDownload = this.downloadCache.get(fileId);
    if (cachedDownload) {
      return cachedDownload;
    }
    
    // Verificar caché en sessionStorage (persistente durante la sesión)
    try {
      const storageKey = `subtitle_content_${fileId}`;
      const cachedContent = sessionStorage.getItem(storageKey);
      if (cachedContent) {
        const parsedData = JSON.parse(cachedContent);
        if (parsedData && parsedData.blobUrl) {
          // Validar que el blob aún existe y es accesible
          try {
            // Intento de "ping" al blob (fetch de 1 byte)
            await fetch(parsedData.blobUrl, { 
              method: 'HEAD',
              cache: 'force-cache'
            });
            
            // Si llega aquí, el blob es válido
            this.downloadCache.set(fileId, parsedData.blobUrl);
            return parsedData.blobUrl;
          } catch (e) {
            // El blob ya no es válido (probablemente fue liberado)
            sessionStorage.removeItem(storageKey);
          }
        }
      }
    } catch (e) {
      // Error al acceder a sessionStorage - ignorar y continuar
    }
    
    // Implementación de recuperación tolerante a fallos
    const MAX_RETRIES = 3;
    let retryCount = 0;
    let lastError: Error | null = null;
    
    while (retryCount < MAX_RETRIES) {
      try {
        // Regular peticiones a la API
        await this.throttleRequest();
        
        // Extraer el ID numérico del fileId (eliminar el prefijo 'file_')
        const numericFileId = parseInt(fileId.replace('file_', ''));
        
        // Preparar la solicitud de descarga con múltiples formatos
        // para mayor compatibilidad
        const downloadRequest: DownloadRequestV1 = {
          file_id: numericFileId,
          sub_format: 'srt'  // SRT es más compatible y ligero que VTT
        };

        // Obtener el enlace de descarga con timeout
        const downloadResponse = await this.axiosInstance.post<DownloadResponseV1>(
          '/subtitles/download',
          downloadRequest,
          { timeout: 8000 }
        );

        // Verificar que el enlace es válido
        if (!downloadResponse.data.link) {
          throw new Error('Enlace de descarga no válido');
        }

        // Descargar y procesar el subtítulo
        const subtitleContent = await this.downloadAndProcessSubtitle(downloadResponse.data.link);
        
        // Guardar en caché de memoria
        this.downloadCache.set(fileId, subtitleContent);
        
        // Guardar en sessionStorage para persistencia
        try {
          sessionStorage.setItem(`subtitle_content_${fileId}`, JSON.stringify({
            blobUrl: subtitleContent,
            timestamp: Date.now()
          }));
        } catch (e) {
          // Error al guardar en sessionStorage (cuota excedida, etc) - ignorar
        }
        
        return subtitleContent;
      } catch (error) {
        lastError = error as Error;
        retryCount++;
        
        // Si no es el último intento, aplicar retraso exponencial
        if (retryCount < MAX_RETRIES) {
          // Backoff exponencial: 1s, 2s, 4s... con límite de 10s
          const backoffDelay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      }
    }
    
    // Todos los reintentos fallaron
    console.error('Error al descargar subtítulos después de reintentos:', lastError);
    
    // Si hay un error persistente, intentar formatear un subtítulo vacío como fallback
    try {
      const emptySubtitle = this.createEmptySubtitle();
      return emptySubtitle;
    } catch (e) {
      // Sin opciones, reenviar el error original
      throw lastError || new Error('Error desconocido al descargar subtítulo');
    }
  }
  
  /**
   * Crea un archivo de subtítulos vacío como fallback en caso de error
   * para evitar fallos en el reproductor
   */
  private createEmptySubtitle(): string {
    const vttContent = 'WEBVTT\n\n'; // Subtítulo vacío válido
    const blob = new Blob([vttContent], { type: 'text/vtt' });
    return URL.createObjectURL(blob);
  }

  /**
   * Descarga y procesa archivos de subtítulos a formato VTT para su uso en el reproductor
   * Maneja diferentes formatos de compresión y codificación con optimizaciones
   * 
   * @param url - URL del archivo de subtítulos
   * @returns URL del blob con el subtítulo procesado en formato VTT
   */
  private async downloadAndProcessSubtitle(url: string): Promise<string> {
    try {
      // Descargar con timeout y optimizaciones de red
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: {
          // Optimizaciones para conexiones lentas
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'max-age=3600' // Permitir caché HTTP
        }
      });

      // Procesar diferentes formatos con detección automática
      let subtitleContent: string;
      
      // Primero comprobar si está comprimido
      if (url.endsWith('.gz') || 
          this.hasGzipHeader(response.data) || 
          response.headers['content-encoding'] === 'gzip') {
        try {
          // Intentar decomprimir con pako (gzip)
          const decompressed = pako.inflate(new Uint8Array(response.data), { to: 'string' });
          subtitleContent = decompressed;
        } catch (e) {
          console.warn('Error al decomprimir subtítulos, intentando como texto plano:', e);
          // Falló la descompresión, intentar como texto normal
          subtitleContent = new TextDecoder().decode(response.data);
        }
      } else {
        // Detectar codificación
        subtitleContent = this.decodeWithBestGuess(response.data);
      }

      // Validar y normalizar el contenido
      if (!subtitleContent || subtitleContent.trim().length === 0) {
        throw new Error('Contenido de subtítulos vacío o inválido');
      }
      
      // Determinar formato y convertir a VTT si es necesario
      let processedContent: string;
      if (subtitleContent.startsWith('WEBVTT')) {
        // Ya es VTT, normalizar formato
        processedContent = this.normalizeVTT(subtitleContent);
      } else if (subtitleContent.includes(' --> ')) {
        // Parece ser SRT, convertir a VTT
        processedContent = this.convertToVTT(subtitleContent);
      } else if (subtitleContent.includes('{') && subtitleContent.includes('}')) {
        // Posible formato SSA/ASS
        processedContent = this.convertSSAtoVTT(subtitleContent);
      } else {
        // Intento genérico de convertir a VTT
        processedContent = 'WEBVTT\n\n' + subtitleContent;
      }

      // Crear y optimizar el blob
      const subtitleBlob = new Blob([processedContent], { 
        type: 'text/vtt'
      });
      
      // Crear URL optimizada
      return URL.createObjectURL(subtitleBlob);
    } catch (error) {
      console.error('Error procesando subtítulos:', error);
      
      // Crear subtítulo vacío como fallback para no romper el reproductor
      return this.createEmptySubtitle();
    }
  }

  /**
   * Detecta si un ArrayBuffer contiene datos comprimidos con gzip
   * (útil cuando la extensión o cabeceras no son fiables)
   */
  private hasGzipHeader(buffer: ArrayBuffer): boolean {
    if (buffer.byteLength < 2) return false;
    
    // Verificar la firma de gzip (0x1F 0x8B)
    const header = new Uint8Array(buffer, 0, 2);
    return header[0] === 0x1F && header[1] === 0x8B;
  }
  
  /**
   * Intenta decodificar un buffer con la mejor codificación disponible
   */
  private decodeWithBestGuess(buffer: ArrayBuffer): string {
    // Intento con UTF-8 (más común)
    try {
      return new TextDecoder('utf-8').decode(buffer);
    } catch (e) {
      // Fallback a ISO-8859-1 (Latin1)
      try {
        return new TextDecoder('iso-8859-1').decode(buffer);
      } catch (e2) {
        // Último recurso: ASCII
        return new TextDecoder('ascii').decode(buffer);
      }
    }
  }

  /**
   * Normaliza un archivo VTT para asegurar formato correcto
   */
  private normalizeVTT(vttContent: string): string {
    // Asegurar que comienza con WEBVTT
    if (!vttContent.startsWith('WEBVTT')) {
      vttContent = 'WEBVTT\n\n' + vttContent;
    }
    
    // Normalizar saltos de línea
    vttContent = vttContent.replace(/\r\n/g, '\n');
    
    // Asegurar que las marcas de tiempo tienen el formato correcto
    vttContent = vttContent.replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4');
    
    return vttContent;
  }

  /**
   * Convierte subtítulos SRT a formato VTT
   */
  private convertToVTT(srtContent: string): string {
    // Normalizar saltos de línea
    let content = srtContent.replace(/\r\n/g, '\n');
    
    // Agregar encabezado WebVTT
    let vtt = 'WEBVTT\n\n';
    
    // Convertir formato de tiempo (coma a punto)
    content = content.replace(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/g, '$1:$2:$3.$4');
    
    // Eliminar números de secuencia (no necesarios en VTT)
    content = content.replace(/^\d+\s*$/gm, '');
    
    // Asegurar espaciado correcto entre entradas
    content = content.replace(/\n\n\n+/g, '\n\n');
    
    return vtt + content;
  }
  
  /**
   * Convierte formato SSA/ASS (usado en anime) a VTT
   */
  private convertSSAtoVTT(assContent: string): string {
    let vtt = 'WEBVTT\n\n';
    
    // Extraer líneas de diálogo (ignorando encabezados y estilos)
    const dialogLines = assContent.split('\n')
      .filter(line => line.startsWith('Dialogue:'));
    
    // Procesar cada línea de diálogo
    for (const line of dialogLines) {
      try {
        // Formato típico: Dialogue: Marked=0,0:01:15.20,0:01:18.53,Default,,0,0,0,,Texto del subtítulo
        const parts = line.split(',');
        if (parts.length < 10) continue;
        
        // Extraer tiempos (índices 1 y 2 normalmente)
        let startTime = this.formatSSATime(parts[1]);
        let endTime = this.formatSSATime(parts[2]);
        
        // Extraer texto (todo después del noveno campo)
        let text = parts.slice(9).join(',').trim();
        
        // Eliminar códigos de formato SSA
        text = text.replace(/{[^}]+}/g, '');
        
        // Agregar entrada VTT
        vtt += `${startTime} --> ${endTime}\n${text}\n\n`;
      } catch (e) {
        // Ignorar líneas con formato incorrecto
        continue;
      }
    }
    
    return vtt;
  }
  
  /**
   * Formatea tiempo de SSA/ASS al formato VTT
   */
  private formatSSATime(ssaTime: string): string {
    // Formato SSA: H:MM:SS.ss
    return ssaTime.trim();
  }

  /**
   * Libera recursos del servicio y limpia todas las cachés
   */
  clearCache(): void {
    // Limpiar caché en memoria
    this.subtitleCache.clear();
    
    // Revocar URLs de blobs para liberar memoria
    for (const blobUrl of this.downloadCache.values()) {
      try {
        URL.revokeObjectURL(blobUrl);
      } catch (e) {
        // Ignorar errores al revocar URLs
      }
    }
    this.downloadCache.clear();
    
    // Limpiar caché persistente más antigua de 1 semana
    try {
      const now = Date.now();
      const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
      
      // Buscar claves de subtítulos en localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('subtitles_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.timestamp && (now - data.timestamp > WEEK_MS)) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Ignorar errores en elementos específicos
          }
        }
      }
    } catch (e) {
      // Ignorar errores de acceso a localStorage
    }
  }
}

export default new OpenSubtitlesService();