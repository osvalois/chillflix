// store/carouselStore.ts
import { atom } from 'jotai';
import { atomWithImmer } from 'jotai-immer';

export interface CarouselState {
  activeSlide: number;
  isInteracting: boolean;
  autoplayEnabled: boolean;
  isTransitioning: boolean;
  error: string | null;
  loadingStates: Record<number, boolean>;
}

export const initialCarouselState: CarouselState = {
  activeSlide: 0,
  isInteracting: false,
  autoplayEnabled: false,
  isTransitioning: false,
  error: null,
  loadingStates: {},
};

export const carouselStateAtom = atomWithImmer<CarouselState>(initialCarouselState);

export const activeSlideAtom = atom(
  (get) => get(carouselStateAtom).activeSlide,
  (get, set, newValue: number) => {
    set(carouselStateAtom, (draft) => {
      draft.activeSlide = newValue;
    });
  }
);