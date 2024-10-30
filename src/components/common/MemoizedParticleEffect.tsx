import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';

interface ParticleEffectProps {
  color: string;
  count: number;
  size: number;
  speed: number;
  spread: number;
  enabled?: boolean;
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay';
  shapes?: Array<'circle' | 'square' | 'triangle'>;
  interaction?: boolean;
  direction?: 'vertical' | 'horizontal' | 'radial';
  gravity?: number;
  turbulence?: number;
  fadeDistance?: number;
  onComplete?: () => void;
  className?: string;
}

interface Particle {
  id: number;
  initialX: number;
  initialY: number;
  velocity: {
    x: number;
    y: number;
  };
  delay: number;
  duration: number;
  shape: 'circle' | 'square' | 'triangle';
  scale: number;
  rotation: number;
}

const rgba = (color: string, alpha: number): string => {
  if (color.startsWith('#')) {
    const hex = color.substring(1);
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (color.startsWith('rgb')) {
    const values = color.match(/\d+/g);
    if (values && values.length >= 3) {
      return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${alpha})`;
    }
  }
  return color;
};

const getShapeStyles = (shape: 'circle' | 'square' | 'triangle', size: number) => {
  switch (shape) {
    case 'square':
      return {
        width: `${size}px`,
        height: `${size}px`,
      };
    case 'triangle':
      return {
        width: '0',
        height: '0',
        borderLeft: `${size/2}px solid transparent`,
        borderRight: `${size/2}px solid transparent`,
        borderBottom: `${size}px solid currentColor`,
        background: 'none',
      };
    default:
      return {
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
      };
  }
};

const getDirectionalMovement = (
  direction: 'vertical' | 'horizontal' | 'radial',
  spread: number,
  turbulence: number
) => {
  const baseVelocity = Math.random() * turbulence;
  
  switch (direction) {
    case 'horizontal':
      return {
        x: spread * (Math.random() * 2 - 1),
        y: baseVelocity * (Math.random() * 2 - 1) * 0.2,
      };
    case 'vertical':
      return {
        x: baseVelocity * (Math.random() * 2 - 1) * 0.2,
        y: spread * (Math.random() * 2 - 1),
      };
    case 'radial':
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * spread;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    default:
      return {
        x: spread * (Math.random() * 2 - 1),
        y: spread * (Math.random() * 2 - 1),
      };
  }
};

const ParticleEffect: React.FC<ParticleEffectProps> = ({
  color = '#000000',
  count = 50,
  size = 8,
  speed = 2,
  spread = 100,
  enabled = true,
  blendMode = 'normal',
  shapes = ['circle'],
  interaction = false,
  direction = 'radial',
  gravity = 0,
  turbulence = 1,
  fadeDistance = 0.8,
  onComplete,
  className = '',
}) => {
  const controls = useAnimationControls();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const particles = useMemo(() => 
    Array.from({ length: count }, (_, i): Particle => {
      const movement = getDirectionalMovement(direction, spread, turbulence);
      return {
        id: i,
        initialX: movement.x,
        initialY: movement.y,
        velocity: {
          x: movement.x * 0.1,
          y: movement.y * 0.1,
        },
        delay: Math.random() * 0.2,
        duration: speed * (0.8 + Math.random() * 0.4),
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        scale: 0.5 + Math.random() * 0.5,
        rotation: Math.random() * 360,
      };
    }),
    [count, spread, speed, shapes, direction, turbulence]
  );

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    if (interaction) {
      const rect = event.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left - rect.width / 2,
        y: event.clientY - rect.top - rect.height / 2,
      });
    }
  }, [interaction]);

  useEffect(() => {
    if (!enabled) {
      controls.stop();
    } else {
      controls.start('animate');
    }
  }, [enabled, controls]);

  const particleVariants = {
    initial: {
      x: 0,
      y: 0,
      opacity: 0,
      scale: 0,
      rotate: 0,
    },
    animate: (particle: Particle) => {
      const distance = Math.sqrt(
        Math.pow(particle.initialX, 2) + 
        Math.pow(particle.initialY, 2)
      );
      const normalizedDistance = Math.min(distance / (spread * fadeDistance), 1);
      const fadeOpacity = 1 - normalizedDistance;

      return {
        x: isHovered && interaction 
          ? mousePosition.x + particle.initialX * 0.5 
          : particle.initialX + particle.velocity.x * turbulence,
        y: isHovered && interaction 
          ? mousePosition.y + particle.initialY * 0.5 
          : particle.initialY + particle.velocity.y * turbulence + (gravity * particle.duration),
        opacity: [0, fadeOpacity, 0],
        scale: [0, particle.scale, 0],
        rotate: [0, particle.rotation, particle.rotation * 2],
        transition: {
          duration: particle.duration,
          delay: particle.delay,
          repeat: Infinity,
          repeatType: "loop" as const,
          ease: "easeInOut",
        },
      };
    },
  };

  return (
    <div 
      className={`relative w-full h-full overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {enabled && particles.map(particle => (
        <motion.div
          key={particle.id}
          className="absolute top-1/2 left-1/2 pointer-events-none"
          style={{
            ...getShapeStyles(particle.shape, size),
            background: particle.shape !== 'triangle' ? color : 'none',
            color: particle.shape === 'triangle' ? color : 'none',
            boxShadow: `0 0 ${size * 2}px ${rgba(color, 0.4)}`,
            mixBlendMode: blendMode,
          }}
          variants={particleVariants}
          initial="initial"
          animate={controls}
          custom={particle}
          onAnimationComplete={() => {
            if (particle.id === particles.length - 1) {
              onComplete?.();
            }
          }}
        />
      ))}
    </div>
  );
};

const MemoizedParticleEffect = React.memo(ParticleEffect, (prev, next) => {
  return (
    prev.color === next.color &&
    prev.count === next.count &&
    prev.size === next.size &&
    prev.speed === next.speed &&
    prev.spread === next.spread &&
    prev.enabled === next.enabled &&
    prev.blendMode === next.blendMode &&
    prev.interaction === next.interaction &&
    prev.direction === next.direction &&
    prev.gravity === next.gravity &&
    prev.turbulence === next.turbulence &&
    prev.fadeDistance === next.fadeDistance &&
    JSON.stringify(prev.shapes) === JSON.stringify(next.shapes)
  );
});

export default MemoizedParticleEffect;