// hooks/useAnimationConfig.ts
import { useMotionValue, useTransform, useSpring as useFramerSpring } from 'framer-motion';
import { config, useSpring } from 'react-spring';

export const useAnimationConfig = (isReducedMotion: boolean) => {
  const mouseY = useMotionValue(0);
  const brightness = useTransform(mouseY, [-100, 0, 100], [1.2, 1, 0.8]);
  const smoothBrightness = useFramerSpring(brightness, {
    stiffness: 300,
    damping: 30
  });

  const [spring, setSpring] = useSpring(() => ({
    scale: 1,
    rotate: 0,
    config: isReducedMotion ? config.gentle : { tension: 210, friction: 20 }
  }));

  return {
    mouseY,
    brightness,
    smoothBrightness,
    spring,
    setSpring
  };
};