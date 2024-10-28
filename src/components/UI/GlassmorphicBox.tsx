import { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, MotionStyle } from 'framer-motion';

interface GlassmorphicBoxProps {
  children: ReactNode;
  isActive?: boolean;
  hoverEffect?: 'lift' | 'glow' | 'tilt' | 'none';
  glareEffect?: boolean;
  pulseEffect?: boolean;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

interface Dimensions {
  width: number;
  height: number;
}

interface MousePosition {
  x: number;
  y: number;
}

const GlassmorphicBox: React.FC<GlassmorphicBoxProps> = ({
  children,
  isActive = false,
  hoverEffect = 'lift',
  glareEffect = true,
  pulseEffect = false,
  className = '',
  gradientFrom = 'from-blue-400/30',
  gradientTo = 'to-purple-400/30',
}) => {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    }
  }, []);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (boxRef.current) {
      const rect = boxRef.current.getBoundingClientRect();
      setMousePosition({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  };

  const getHoverAnimation = (): Record<string, any> => {
    switch (hoverEffect) {
      case 'lift':
        return { y: -8, transition: { duration: 0.2 } };
      case 'glow':
        return { 
          boxShadow: '0 0 25px rgba(147, 197, 253, 0.6)',
          transition: { duration: 0.2 }
        };
      case 'tilt':
        return {
          rotateX: mousePosition.y / dimensions.height * 20 - 10,
          rotateY: mousePosition.x / dimensions.width * 20 - 10,
          transition: { duration: 0.1 }
        };
      default:
        return {};
    }
  };

  const glareStyle: MotionStyle = glareEffect ? {
    background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 80%)`,
  } : {};

  const pulseAnimation = pulseEffect ? {
    scale: [1, 1.02, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  } : {};

  return (
    <motion.div
      ref={boxRef}
      onMouseMove={handleMouseMove}
      whileHover={getHoverAnimation()}
      animate={pulseEffect ? pulseAnimation : {}}
      className={`
        relative overflow-hidden rounded-xl
        bg-gradient-to-br ${gradientFrom} ${gradientTo}
        backdrop-blur-xl backdrop-saturate-150
        border border-white/10
        ${isActive ? 'shadow-lg shadow-blue-500/20' : 'shadow-md'}
        ${className}
      `}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Main content */}
      <div className="relative z-10 p-6">
        {children}
      </div>

      {/* Glare effect */}
      {glareEffect && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={glareStyle}
        />
      )}

      {/* Decorative elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />
      
      {/* Border highlights */}
      <div className="absolute inset-px rounded-xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Dot pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" 
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />
      </div>
    </motion.div>
  );
};

export default GlassmorphicBox;