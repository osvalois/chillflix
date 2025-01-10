import React, { useMemo } from 'react';
import {
    Button,
    Box,
    useColorModeValue,
    keyframes,
    chakra,
    SystemStyleObject,
    ChakraProps,
} from '@chakra-ui/react';
import { motion, AnimatePresence, MotionProps } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// Tipos refinados
interface FloatingButtonProps extends Omit<ChakraProps & MotionProps, 'onClick' | 'position'> {
    onClick: () => void;
    text?: string;
    buttonVariant?: 'default' | 'minimal' | 'glass';
    buttonSize?: 'sm' | 'md' | 'lg';
    buttonPlacement?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    contentAlignment?: 'left' | 'center' | 'right';
    showIcon?: boolean;
    iconType?: 'arrow' | 'chevron';
    iconPosition?: 'left' | 'right';
    showGlow?: boolean;
    zIndex?: number;
}

// Animación de brillo
const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
  50% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.5); }
  100% { box-shadow: 0 0 5px rgba(255, 255, 255, 0.3); }
`;

// Variantes de estilo
const VARIANTS: Record<string, SystemStyleObject> = {
    default: {
        bg: "blue.500",
        color: "white",
        _hover: {
            bg: "blue.600",
            transform: "scale(1.05)"
        },
        _active: {
            bg: "blue.700",
            transform: "scale(0.95)"
        }
    },
    minimal: {
        bg: "transparent",
        color: "gray.700",
        _hover: {
            bg: "gray.100"
        },
        _active: {
            bg: "gray.200"
        }
    },
    glass: {
        bg: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        color: "white",
        _hover: {
            bg: "rgba(255, 255, 255, 0.15)",
            transform: "translateY(-2px)"
        },
        _active: {
            transform: "translateY(0)"
        }
    }
};

// Estilos por tamaño
const SIZE_STYLES = {
    sm: {
        padding: "0.5rem",
        fontSize: "sm",
        iconSize: 16
    },
    md: {
        padding: "0.75rem",
        fontSize: "md",
        iconSize: 20
    },
    lg: {
        padding: "1rem",
        fontSize: "lg",
        iconSize: 24
    }
} as const;

// Mapeo de posiciones
const PLACEMENT_STYLES = {
    'top-left': {
        top: 4,
        left: 4
    },
    'top-right': {
        top: 4,
        right: 4
    },
    'bottom-left': {
        bottom: 4,
        left: 4
    },
    'bottom-right': {
        bottom: 4,
        right: 4
    },
    'center': {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    }
} as const;

// Componentes animados con tipos corregidos
const AnimatedBox = chakra(motion(Box));
const AnimatedButton = chakra(motion(Button), {
    shouldForwardProp: (prop) => !['variants', 'initial', 'animate', 'exit', 'whileHover', 'whileTap'].includes(prop),
});

// Custom Hook para estilos
const useFloatingButtonStyles = (
    variant: keyof typeof VARIANTS,
    size: keyof typeof SIZE_STYLES,
    showGlow: boolean
) => {
    const textColor = useColorModeValue('gray.800', 'white');

    return useMemo(() => ({
        variant: VARIANTS[variant],
        size: SIZE_STYLES[size],
        animation: showGlow ? `${glowAnimation} 2s infinite` : undefined,
        color: textColor,
    }), [variant, size, showGlow, textColor]);
};

// Componente principal con tipos corregidos
export const FloatingButton: React.FC<FloatingButtonProps> = React.memo(({
    onClick,
    text = "Button",
    buttonVariant = "default",
    buttonSize = "md",
    buttonPlacement = "bottom-right",
    contentAlignment = "center",
    showIcon = true,
    iconType = "arrow",
    iconPosition = "left",
    showGlow = false,
    zIndex = 1000,
    ...props
}) => {
    const styles = useFloatingButtonStyles(buttonVariant, buttonSize, showGlow);

    const Icon = iconType === 'arrow'
        ? (iconPosition === 'left' ? ArrowLeft : ArrowRight)
        : (iconPosition === 'left' ? ChevronLeft : ChevronRight);

    const buttonMotion = {
        initial: { opacity: 0, scale: 0.9 },
        animate: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.3 }
        },
        hover: {
            scale: buttonVariant === 'minimal' ? 1 : 1.05,
            transition: { duration: 0.2 }
        },
        tap: {
            scale: 0.95,
            transition: { duration: 0.1 }
        }
    };

    return (
        <AnimatePresence>
            <AnimatedBox
                position="fixed"
                {...PLACEMENT_STYLES[buttonPlacement]}
                zIndex={zIndex}
                initial="initial"
                animate="animate"
                exit={{ opacity: 0, scale: 0.9 }}
            >
                <AnimatedButton
                    onClick={onClick}
                    sx={{
                        transition: "all 0.3s ease",
                        animation: styles.animation,
                        ...styles.variant
                    }}
                    whileHover="hover"
                    whileTap="tap"
                    variants={buttonMotion}
                    {...props}
                >
                    {showIcon && iconPosition === 'left' && (
                        <Icon size={styles.size.iconSize} />
                    )}
                    {text}
                    {showIcon && iconPosition === 'right' && (
                        <Icon size={styles.size.iconSize} />
                    )}
                </AnimatedButton>
            </AnimatedBox>
        </AnimatePresence>
    );
});

FloatingButton.displayName = 'FloatingButton';

// Componente con manejo de errores
export const FloatingButtonWithErrorHandling: React.FC<FloatingButtonProps> = React.memo((props) => {
    const handleClick = () => {
        try {
            props.onClick();
        } catch (error) {
            console.error('Error en el click:', error);
        }
    };

    return <FloatingButton {...props} onClick={handleClick} />;
});

FloatingButtonWithErrorHandling.displayName = 'FloatingButtonWithErrorHandling';

export default FloatingButtonWithErrorHandling;