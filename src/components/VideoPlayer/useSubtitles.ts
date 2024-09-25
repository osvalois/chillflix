import { useState, useCallback } from 'react';
import OpenSubtitlesService, { Subtitle } from '../../services/OpenSubtitlesService';

export const useSubtitles = (imdbId: string) => {
  const [downloadedSubtitles, setDownloadedSubtitles] = useState<Subtitle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubtitles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const subtitles = await OpenSubtitlesService.searchSubtitles(imdbId);
      const downloadPromises = subtitles.map(async (subtitle) => {
        const downloadLink = await OpenSubtitlesService.downloadSubtitle(subtitle.SubDownloadLink);
        return { ...subtitle, SubtitlesLink: downloadLink };
      });
      const downloadedSubs = await Promise.all(downloadPromises);
      setDownloadedSubtitles(downloadedSubs);
    } catch (error) {
      console.error('Error loading subtitles:', error);
      setError('Failed to load subtitles. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [imdbId]);

  return { loadSubtitles, downloadedSubtitles, isLoading, error };
};