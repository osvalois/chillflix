import { useMemo, useState } from 'react';
import { useQuery } from 'react-query';
import { MovieInfo } from '../types';

// Mantenemos un índice del mirror actual para cada combinación
const useMirrorSelection = (
  groupedMirrors: any,
  selectedLanguage: string | null,
  selectedQuality: string,
  qualities: string[],
  movieService: any
) => {
  // Estado para trackear el índice del mirror actual para cada combinación
  const [mirrorIndices, setMirrorIndices] = useState<Record<string, Record<string, number>>>({});
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const selectedMirrorWithIndex = useMemo(() => {
    if (Object.keys(groupedMirrors).length === 0) return null;

    const language = selectedLanguage || Object.keys(groupedMirrors)[0];
    const quality = selectedQuality || qualities[0];

    // Intentar obtener el mirror actual para esta combinación
    if (language && quality && groupedMirrors[language]?.[quality]?.length > 0) {
      const currentIndex = mirrorIndices[language]?.[quality] || 0;
      if (currentIndex < groupedMirrors[language][quality].length) {
        return {
          mirror: groupedMirrors[language][quality][currentIndex],
          language,
          quality,
          currentIndex
        };
      }
    }

    // Fallback: buscar en otras combinaciones
    for (const lang of Object.keys(groupedMirrors)) {
      for (const qual of qualities) {
        if (groupedMirrors[lang][qual]?.length > 0) {
          const currentIndex = mirrorIndices[lang]?.[qual] || 0;
          if (currentIndex < groupedMirrors[lang][qual].length) {
            return {
              mirror: groupedMirrors[lang][qual][currentIndex],
              language: lang,
              quality: qual,
              currentIndex
            };
          }
        }
      }
    }

    return null;
  }, [groupedMirrors, selectedLanguage, selectedQuality, qualities, mirrorIndices]);

  const { data: movieInfo, isLoading: isMovieInfoLoading } = useQuery<MovieInfo, Error>(
    ['movieInfo', selectedMirrorWithIndex?.mirror?.infoHash],
    () => movieService.getMovieInfo(selectedMirrorWithIndex!.mirror.infoHash),
    {
      enabled: !!selectedMirrorWithIndex,
      staleTime: 0,
      cacheTime: 0,
      retry: 2,
      onSettled: () => {
        setIsVideoLoading(false);
      },
      onError: () => {
        // Cuando hay un error, intentamos con el siguiente mirror
        if (selectedMirrorWithIndex) {
          const { language, quality, currentIndex } = selectedMirrorWithIndex;
          setMirrorIndices(prev => ({
            ...prev,
            [language]: {
              ...prev[language],
              [quality]: currentIndex + 1
            }
          }));
        }
      }
    }
  );

  return {
    selectedMirror: selectedMirrorWithIndex?.mirror || null,
    movieInfo,
    isMovieInfoLoading,
    isVideoLoading,
    setIsVideoLoading
  };
};

export default useMirrorSelection;