import { useState, useEffect, useRef, ReactNode, useMemo, useCallback } from 'react';
import { motion, MotionStyle, useAnimation } from 'framer-motion';

interface GlassmorphicBoxProps {
  children: ReactNode;
  isActive?: boolean;
  hoverEffect?: 'lift' | 'glow' | 'tilt' | 'none';
  glareEffect?: boolean;
  pulseEffect?: boolean;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  glassOpacity?: number;
  borderOpacity?: number;
  blurStrength?: number;
  glareIntensity?: number;
}

interface Dimensions {
  width: number;
  height: number;
}

interface MousePosition {
  x: number;
  y: number;
}

const DEFAULT_GLASS_OPACITY = 0.15;
const DEFAULT_BORDER_OPACITY = 0.1;
const DEFAULT_BLUR_STRENGTH = 12;
const DEFAULT_GLARE_INTENSITY = 0.12;

const GlassmorphicBox: React.FC<GlassmorphicBoxProps> = ({
  children,
  isActive = false,
  hoverEffect = 'lift',
  glareEffect = true,
  className = '',
  gradientFrom = 'from-blue-400',
  gradientTo = 'to-purple-400',
  glassOpacity = DEFAULT_GLASS_OPACITY,
  borderOpacity = DEFAULT_BORDER_OPACITY,
  blurStrength = DEFAULT_BLUR_STRENGTH,
  glareIntensity = DEFAULT_GLARE_INTENSITY,
}) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const boxRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const isHovering = useRef(false);

  // Memoized gradient classes to prevent unnecessary re-renders
  const gradientClasses = useMemo(() => {
    return `bg-gradient-to-br ${gradientFrom} ${gradientTo}`;
  }, [gradientFrom, gradientTo]);

  // Optimized resize observer
  useEffect(() => {
    if (!boxRef.current) return;

    const updateDimensions = () => {
      if (boxRef.current) {
        const rect = boxRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(boxRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Optimized mouse move handler with debounce
  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>): void => {
    if (!boxRef.current || !isHovering.current) return;

    const rect = boxRef.current.getBoundingClientRect();
    requestAnimationFrame(() => {
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    });
  }, []);

  // Memoized hover animations
  const getHoverAnimation = useMemo(() => {
    const animations: Record<string, any> = {
      lift: {
        y: -8,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      },
      glow: {
        boxShadow: `0 0 25px rgba(147, 197, 253, ${glassOpacity * 2})`,
        transition: { duration: 0.2 }
      },
      tilt: {
        transformPerspective: 1000,
        rotateX: mousePosition.y / dimensions.height * 20 - 10,
        rotateY: mousePosition.x / dimensions.width * 20 - 10,
        transition: { type: "spring", stiffness: 400, damping: 30 }
      },
      none: {}
    };
    return animations[hoverEffect] || {};
  }, [hoverEffect, dimensions, mousePosition, glassOpacity]);

  // Optimized glare effect
  const glareStyle: MotionStyle = useMemo(() => {
    if (!glareEffect) return {};
    
    return {
      background: `radial-gradient(
        circle at ${mousePosition.x}px ${mousePosition.y}px,
        rgba(255,255,255,${glareIntensity}) 0%,
        rgba(255,255,255,0) 80%
      )`,
      transition: 'background 0.1s linear'
    };
  }, [glareEffect, mousePosition, glareIntensity]);

  const handleMouseEnter = useCallback(() => {
    isHovering.current = true;
    controls.start(getHoverAnimation);
  }, [controls, getHoverAnimation]);

  const handleMouseLeave = useCallback(() => {
    isHovering.current = false;
    controls.start({ scale: 1, y: 0, rotateX: 0, rotateY: 0 });
  }, [controls]);

  return (
    <motion.div
      ref={boxRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={controls}
      initial={false}
      className={`
        relative overflow-hidden rounded-xl
        ${gradientClasses}
        backdrop-blur-[${blurStrength}px] backdrop-saturate-150
        border border-white/[${borderOpacity}]
        ${isActive ? 'shadow-lg shadow-blue-500/20' : 'shadow-md'}
        transform-gpu
        ${className}
      `}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        backfaceVisibility: 'hidden'
      }}
    >
      {/* Contenido principal con z-index optimizado */}
      <div className="relative z-[2] p-6">
        {children}
      </div>

      {/* Efecto de brillo optimizado */}
      {glareEffect && (
        <motion.div
          className="absolute inset-0 pointer-events-none z-[3]"
          style={glareStyle}
          initial={false}
        />
      )}

      {/* Elementos decorativos optimizados con opacidad personalizable */}
      <div 
        className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl z-[1]`}
        style={{
          background: `rgba(59, 130, 246, ${glassOpacity})`,
          willChange: 'transform',
        }}
      />
      <div 
        className={`absolute -bottom-24 -left-24 w-48 h-48 rounded-full blur-3xl z-[1]`}
        style={{
          background: `rgba(168, 85, 247, ${glassOpacity})`,
          willChange: 'transform',
        }}
      />
      
      {/* Resaltes de borde optimizados */}
      <div 
        className="absolute inset-px rounded-xl pointer-events-none z-[1]"
        style={{
          background: `linear-gradient(to bottom right, rgba(255,255,255,${borderOpacity * 0.5}), transparent)`
        }}
      />
      
      {/* Patrón de puntos optimizado */}
      <div 
        className="absolute inset-0 z-[1]"
        style={{
          opacity: glassOpacity * 0.3,
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
          willChange: 'transform',
        }}
      />
    </motion.div>
  );
};

export default GlassmorphicBox;