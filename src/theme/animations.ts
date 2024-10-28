import { DESIGN } from "./design";

export const ANIMATION_CONFIG = {
    normal: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    },
    fast: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
    }
  };
  
  export const containerVariants = {
    hidden: {
      opacity: 0,
      y: -20,
      filter: 'blur(8px)'
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: DESIGN.animation.duration.normal,
        ease: DESIGN.animation.easing.smooth,
        staggerChildren: 0.1
      }
    }
  };
  
  export const itemVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: 10,
      filter: 'blur(4px)'
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: DESIGN.animation.duration.normal,
        ease: DESIGN.animation.easing.smooth
      }
    },
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        duration: DESIGN.animation.duration.fast,
        ease: DESIGN.animation.easing.bounce
      }
    },
    tap: {
      scale: 0.95,
      transition: {
        duration: DESIGN.animation.duration.fast,
        ease: DESIGN.animation.easing.smooth
      }
    }
  };
  
  export const labelVariants = {
    hidden: {
      width: 0,
      opacity: 0,
      x: -10
    },
    visible: {
      width: 'auto',
      opacity: 1,
      x: 0,
      transition: {
        duration: ANIMATION_CONFIG.normal.duration,
        ease: ANIMATION_CONFIG.normal.ease
      }
    },
    exit: {
      width: 0,
      opacity: 0,
      x: -10,
      transition: {
        duration: ANIMATION_CONFIG.fast.duration,
        ease: ANIMATION_CONFIG.fast.ease
      }
    }
  };