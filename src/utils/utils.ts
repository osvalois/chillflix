// src/utils/timeUtils.ts

export const formatTime = (time: number): string => {
    if (isNaN(time) || time < 0) return '0:00.000';
  
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 1000);
  
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  };
  
  export const parseTime = (timeStr: string): number => {
    const [minutesStr, rest] = timeStr.split(':');
    const [secondsStr, millisecondsStr] = rest.split('.');
  
    const minutes = parseInt(minutesStr, 10);
    const seconds = parseInt(secondsStr, 10);
    const milliseconds = parseInt(millisecondsStr, 10);
  
    return minutes * 60 + seconds + milliseconds / 1000;
  };
  
  export const formatTimeWithoutMilliseconds = (time: number): string => {
    if (isNaN(time) || time < 0) return '0:00';
  
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
  
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };