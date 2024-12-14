import React, { useRef, useCallback, useMemo } from 'react';
import {
    Button,
    Box,
    BoxProps,
    forwardRef,
    keyframes,
    ThemingProps,
} from '@chakra-ui/react';
import { motion, MotionProps, useAnimation, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';

// Refined Motion Components
const MotionBox = motion(Box as any);
// Extended Props Interface
interface GlassmorphicButtonProps extends Omit<BoxProps, keyof MotionProps>, ThemingProps {
    onClick?: () => void;
    isLoading?: boolean;
    loadingText?: string;
    children?: React.ReactNode;
    icon?: React.ReactNode;
    variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'dark';
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    glowIntensity?: 'none' | 'low' | 'medium' | 'high' | 'ultra';
    pulseEffect?: boolean;
    hoverLift?: boolean;
    glassFrost?: 'none' | 'light' | 'medium' | 'heavy' | 'ultra';
    customGradient?: string;
    animated?: boolean;
    disabled?: boolean;
    soundEnabled?: boolean;
    hapticFeedback?: boolean;
    pressEffect?: boolean;
    glowColor?: string;
    textGradient?: boolean;
    borderGlow?: boolean;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    rippleEffect?: boolean;
    neonEffect?: boolean;
}

// Enhanced Animations
const glowKeyframes = keyframes`
  0% { background-position: 0% 50%; background-size: 200% 200%; filter: brightness(1); }
  50% { background-position: 100% 50%; background-size: 250% 250%; filter: brightness(1.3); }
  100% { background-position: 0% 50%; background-size: 200% 200%; filter: brightness(1); }
`;

const shineKeyframes = keyframes`
  0% { transform: translateX(-100%) rotate(35deg); opacity: 0; }
  50% { opacity: 0.7; }
  100% { transform: translateX(200%) rotate(35deg); opacity: 0; }
`;

const pulseKeyframes = keyframes`
  0% { 
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.5),
                inset 0 0 0 0.5px rgba(255, 255, 255, 0.3);
  }
  70% { 
    box-shadow: 0 0 0 20px rgba(255, 255, 255, 0),
                inset 0 0 0 0.5px rgba(255, 255, 255, 0.6);
  }
  100% { 
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0),
                inset 0 0 0 0.5px rgba(255, 255, 255, 0.3);
  }
`;

const rippleKeyframes = keyframes`
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(4); opacity: 0; }
`;

// Enhanced Variants Configuration with Modern Color Palettes
const variants = {
    primary: {
        gradient: 'linear-gradient(45deg, #2B6CB0 0%, #4299E1 30%, #63B3ED 70%, #2B6CB0 100%)',
        glow: 'rgba(66, 153, 225, 0.6)',
        colors: ['#2B6CB0', '#4299E1', '#63B3ED'],
    },
    success: {
        gradient: 'linear-gradient(45deg, #276749 0%, #48BB78 30%, #68D391 70%, #276749 100%)',
        glow: 'rgba(56, 161, 105, 0.6)',
        colors: ['#276749', '#48BB78', '#68D391'],
    },
    danger: {
        gradient: 'linear-gradient(45deg, #C53030 0%, #F56565 30%, #FC8181 70%, #C53030 100%)',
        glow: 'rgba(229, 62, 62, 0.6)',
        colors: ['#C53030', '#F56565', '#FC8181'],
    },
    warning: {
        gradient: 'linear-gradient(45deg, #B7791F 0%, #ECC94B 30%, #F6E05E 70%, #B7791F 100%)',
        glow: 'rgba(214, 158, 46, 0.6)',
        colors: ['#B7791F', '#ECC94B', '#F6E05E'],
    },
    info: {
        gradient: 'linear-gradient(45deg, #0987A0 0%, #38B2AC 30%, #4FD1C5 70%, #0987A0 100%)',
        glow: 'rgba(9, 135, 160, 0.6)',
        colors: ['#0987A0', '#38B2AC', '#4FD1C5'],
    },
    dark: {
        gradient: 'linear-gradient(45deg, #171923 0%, #2D3748 30%, #4A5568 70%, #171923 100%)',
        glow: 'rgba(23, 25, 35, 0.6)',
        colors: ['#171923', '#2D3748', '#4A5568'],
    },
} as const;
// Enhanced Intensity Configurations
const glowIntensities = {
    none: { opacity: 0, blur: '0px' },
    low: { opacity: 0.3, blur: '8px' },
    medium: { opacity: 0.5, blur: '12px' },
    high: { opacity: 0.7, blur: '16px' },
    ultra: { opacity: 0.9, blur: '24px' },
} as const;

const frosts = {
    none: { blur: '0px', bg: 'rgba(255, 255, 255, 0)' },
    light: { blur: '5px', bg: 'rgba(255, 255, 255, 0.1)' },
    medium: { blur: '10px', bg: 'rgba(255, 255, 255, 0.15)' },
    heavy: { blur: '15px', bg: 'rgba(255, 255, 255, 0.2)' },
    ultra: { blur: '20px', bg: 'rgba(255, 255, 255, 0.25)' },
} as const;

const sizes = {
    xs: { padding: '0.5rem 1rem', fontSize: 'xs', minWidth: '80px' },
    sm: { padding: '0.75rem 1.5rem', fontSize: 'sm', minWidth: '100px' },
    md: { padding: '1rem 2rem', fontSize: 'md', minWidth: '120px' },
    lg: { padding: '1.25rem 2.5rem', fontSize: 'lg', minWidth: '140px' },
    xl: { padding: '1.5rem 3rem', fontSize: 'xl', minWidth: '160px' },
} as const;

export const GlassmorphicButton = forwardRef<GlassmorphicButtonProps, 'button'>((props, ref) => {
    const {
        onClick,
        isLoading = false,
        loadingText = "Loading...",
        children,
        icon,
        variant = 'primary',
        size = 'md',
        glowIntensity = 'medium',
        pulseEffect = true,
        hoverLift = true,
        glassFrost = 'medium',
        customGradient,
        animated = true,
        disabled = false,
        soundEnabled = false,
        hapticFeedback = false,
        pressEffect = true,
        glowColor,
        textGradient = true,
        borderGlow = true,
        iconPosition = 'left',
        fullWidth = false,
        rippleEffect = true,
        neonEffect = false,
        ...rest
    } = props;

    const controls = useAnimation();
    const rippleRef = useRef<HTMLSpanElement>(null);

    // Sound effect
    const [playHover] = useSound('/hover.mp3', { volume: 0.5 });
    const [playClick] = useSound('/click.mp3', { volume: 0.5 });

    const variantStyle = variants[variant];
    const glowStyle = glowIntensities[glowIntensity];
    const frostStyle = frosts[glassFrost];
    const sizeStyle = sizes[size];

    // Memoized Configurations
    const animationConfig = useMemo(() => ({
        rest: { scale: 1, y: 0 },
        hover: {
            scale: hoverLift ? 1.02 : 1,
            y: hoverLift ? -4 : 0,
            transition: { duration: 0.2, ease: 'easeOut' }
        },
        press: { scale: pressEffect ? 0.98 : 1 },
    }), [hoverLift, pressEffect]);

    // Handle Ripple Effect
    const createRipple = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        if (!rippleEffect || disabled || isLoading) return;

        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        const rect = button.getBoundingClientRect();
        ripple.style.width = ripple.style.height = `${diameter}px`;
        ripple.style.left = `${event.clientX - rect.left - radius}px`;
        ripple.style.top = `${event.clientY - rect.top - radius}px`;
        ripple.className = 'ripple';

        const existingRipple = button.getElementsByClassName('ripple')[0];
        if (existingRipple) {
            existingRipple.remove();
        }

        button.appendChild(ripple);
    }, [rippleEffect, disabled, isLoading]);

    // Enhanced Click Handler
    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || isLoading) return;

        if (soundEnabled) playClick();
        if (hapticFeedback && navigator.vibrate) {
            navigator.vibrate(50);
        }

        createRipple(event);
        onClick?.();
    }, [disabled, isLoading, soundEnabled, hapticFeedback, onClick, playClick, createRipple]);

    // Hover Sound Effect
    const handleMouseEnter = useCallback(() => {
        if (soundEnabled && !disabled && !isLoading) playHover();
    }, [soundEnabled, disabled, isLoading, playHover]);

    // Enhanced Button Styles
    const buttonStyles = useMemo(() => ({
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: `blur(${frostStyle.blur})`,
        backgroundColor: frostStyle.bg,
        borderRadius: 'xl',
        border: '1px solid',
        borderColor: borderGlow ? `rgba(255, 255, 255, ${glowStyle.opacity})` : 'whiteAlpha.200',
        color: 'white',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        ...sizeStyle,

        // Enhanced Glow Effect
        _before: {
            content: '""',
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            background: customGradient || variantStyle.gradient,
            opacity: glowStyle.opacity,
            filter: `blur(${glowStyle.blur})`,
            animation: animated ? `${glowKeyframes} 3s ease infinite` : 'none',
            zIndex: -1,
        },

        // Enhanced Shine Effect
        _after: {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-50%',
            width: '50%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
            transform: 'skewX(-25deg)',
            animation: animated ? `${shineKeyframes} 5s infinite` : 'none',
        },

        // Enhanced Hover States
        _hover: !disabled && !isLoading ? {
            transform: hoverLift ? 'translateY(-2px)' : 'none',
            _before: {
                opacity: glowStyle.opacity + 0.2,
                filter: `blur(${parseInt(glowStyle.blur) + 4}px)`,
            },
            '& .button-content': {
                transform: 'scale(1.02)',
            },
        } : {},

        // Enhanced Active States
        _active: !disabled && !isLoading ? {
            transform: 'scale(0.98)',
            '& .button-content': {
                transform: 'scale(0.98)',
            },
        } : {},

        // Neon Effect
        ...(neonEffect && {
            boxShadow: `0 0 10px ${glowColor || variantStyle.colors[0]}, 
                  0 0 20px ${glowColor || variantStyle.colors[0]}, 
                  0 0 30px ${glowColor || variantStyle.colors[0]}`,
        }),

        // Animation
        animation: pulseEffect && !disabled ? `${pulseKeyframes} 2s infinite` : 'none',

        // Ripple Effect Styles
        '& .ripple': {
            position: 'absolute',
            borderRadius: '50%',
            transform: 'scale(0)',
            animation: `${rippleKeyframes} 0.6s linear`,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
        },
    }), [
        frostStyle, variantStyle, glowStyle, customGradient, animated,
        disabled, isLoading, hoverLift, pulseEffect, borderGlow,
        fullWidth, sizeStyle, neonEffect, glowColor
    ]);

    return (
        <MotionBox
            as={Button}
            ref={ref}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            initial="rest"
            whileHover="hover"
            whileTap="press"
            animate={controls}
            variants={animationConfig}
            sx={buttonStyles}
            isLoading={isLoading}
            loadingText={loadingText}
            disabled={disabled}
            {...rest}
        >
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <MotionBox
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        display="flex"
                        alignItems="center"
                        gap={2}
                    >
                        <Box
                            as="span"
                            className="loading-spinner"
                            sx={{
                                display: 'inline-block',
                                width: '1em',
                                height: '1em',
                                borderRadius: '50%',
                                border: '2px solid',
                                borderColor: 'currentColor',
                                borderRightColor: 'transparent',
                                animation: 'spin 0.75s linear infinite',
                            }}
                        />
                        <Box as="span">{loadingText}</Box>
                    </MotionBox>
                ) : (
                    <MotionBox
                        key="content"
                        className="button-content"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={2}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {iconPosition === 'left' && icon && (
                            <Box
                                as="span"
                                className="button-icon"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    transform: 'scale(1.2)',
                                    transition: 'transform 0.2s ease',
                                }}
                            >
                                {icon}
                            </Box>
                        )}

                        <Box
                            as="span"
                            className="button-text"
                            sx={{
                                background: textGradient
                                    ? `linear-gradient(to right, ${variantStyle.colors.join(', ')})`
                                    : 'none',
                                backgroundClip: textGradient ? 'text' : 'none',
                                WebkitBackgroundClip: textGradient ? 'text' : 'none',
                                WebkitTextFillColor: textGradient ? 'transparent' : 'inherit',
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                                fontWeight: 'bold',
                                letterSpacing: '0.025em',
                                transition: 'all 0.3s ease',
                            }}
                        >
                            {children}
                        </Box>

                        {iconPosition === 'right' && icon && (
                            <Box
                                as="span"
                                className="button-icon"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    transform: 'scale(1.2)',
                                    transition: 'transform 0.2s ease',
                                }}
                            >
                                {icon}
                            </Box>
                        )}
                    </MotionBox>
                )}
            </AnimatePresence>

            {/* Ripple Container */}
            <Box
                ref={rippleRef}
                as="span"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    overflow: 'hidden',
                    borderRadius: 'inherit',
                    pointerEvents: 'none',
                }}
            />
        </MotionBox>
    );
});

GlassmorphicButton.displayName = 'GlassmorphicButton';

export default GlassmorphicButton;