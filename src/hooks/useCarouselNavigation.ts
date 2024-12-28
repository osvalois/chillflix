

// hooks/useCarouselNavigation.ts
import { useCallback } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import useSound from 'use-sound';

export const useCarouselNavigation = (
  swiperRef: React.RefObject<SwiperType>,
  isTransitioning: boolean
) => {
  const [playClick] = useSound('/assets/sounds/click.mp3', {
    volume: 0.4,
    sprite: { click: [0, 300] }
  });

  const navigate = useCallback(
    (direction: 'prev' | 'next') => {
      if (!swiperRef.current || isTransitioning) return;

      try {
        direction === 'prev'
          ? swiperRef.current.slidePrev()
          : swiperRef.current.slideNext();
        playClick();
      } catch (error) {
        console.error(`Navigation error: ${error}`);
      }
    },
    [swiperRef, isTransitioning, playClick]
  );

  return navigate;
};
