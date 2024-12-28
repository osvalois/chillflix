// hooks/useCarouselState.ts
import { useAtom } from 'jotai';
import { useMemo } from 'react';
import { CarouselState, carouselStateAtom } from '../store/carouselStore';
import { WritableDraft } from 'immer';

export const useCarouselState = () => {
  const [state, setState] = useAtom(carouselStateAtom);

  const actions = useMemo(
    () => ({
      setActiveSlide: (slide: number) =>
        setState((draft: WritableDraft<CarouselState>) => {
          draft.activeSlide = slide;
        }),
      setInteracting: (isInteracting: boolean) =>
        setState((draft: WritableDraft<CarouselState>) => {
          draft.isInteracting = isInteracting;
        }),
      setTransitioning: (isTransitioning: boolean) =>
        setState((draft: WritableDraft<CarouselState>) => {
          draft.isTransitioning = isTransitioning;
        }),
      setError: (error: string | null) =>
        setState((draft: WritableDraft<CarouselState>) => {
          draft.error = error;
        }),
      setLoadingState: (id: number, loading: boolean) =>
        setState((draft: WritableDraft<CarouselState>) => {
          draft.loadingStates[id] = loading;
        }),
      resetLoadingStates: () =>
        setState((draft: WritableDraft<CarouselState>) => {
          draft.loadingStates = {};
        }),
      // Utility function to check loading state
      isSlideLoading: (id: number) => state.loadingStates[id] || false,
    }),
    [setState, state.loadingStates]
  );

  return [state, actions] as const;
};