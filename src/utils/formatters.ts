/**
 * Formatea un tamaño en bytes a una representación legible por humanos.
 * @param bytes El tamaño en bytes
 * @param decimals El número de decimales a mostrar (por defecto 2)
 * @returns Una cadena formateada con el tamaño y la unidad apropiada
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Formatea una duración en segundos a un formato legible (HH:MM:SS).
 * @param seconds La duración en segundos
 * @returns Una cadena formateada en el formato HH:MM:SS
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const parts = [];

  if (hours > 0) {
    parts.push(hours.toString().padStart(2, '0'));
  }

  parts.push(minutes.toString().padStart(2, '0'));
  parts.push(remainingSeconds.toString().padStart(2, '0'));

  return parts.join(':');
};

/**
 * Formatea una fecha a un formato legible.
 * @param date La fecha a formatear
 * @returns Una cadena con la fecha formateada
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('es', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

/**
 * Trunca una cadena si excede una longitud máxima.
 * @param str La cadena a truncar
 * @param maxLength La longitud máxima permitida
 * @returns La cadena truncada si excede maxLength, o la cadena original si no
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
};

/**
 * Formatea un número a una representación con separadores de miles.
 * @param number El número a formatear
 * @returns Una cadena con el número formateado
 */
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('es').format(number);
};

/**
 * Capitaliza la primera letra de cada palabra en una cadena.
 * @param str La cadena a capitalizar
 * @returns La cadena con la primera letra de cada palabra en mayúscula
 */
export const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, l => l.toUpperCase());
};

export default {
  formatFileSize,
  formatDuration,
  formatDate,
  truncateString,
  formatNumber,
  capitalizeWords
};