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

const MotionBox = motion(Box as any);

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

// Refined Animations
const glowKeyframes = keyframes`
  0% { opacity: 0.8; filter: saturate(0.8) brightness(1); }
  50% { opacity: 1; filter: saturate(1.2) brightness(1.2); }
  100% { opacity: 0.8; filter: saturate(0.8) brightness(1); }
`;

const shineKeyframes = keyframes`
  0% { transform: translateX(-200%) rotate(45deg); }
  100% { transform: translateX(200%) rotate(45deg); }
`;

const pulseKeyframes = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
`;

const rippleKeyframes = keyframes`
  0% { transform: scale(0); opacity: 0.35; }
  100% { transform: scale(2.5); opacity: 0; }
`;

// Refined Color Palettes
const variants = {
    primary: {
        gradient: 'linear-gradient(135deg, #3182CE 0%, #2B6CB0 100%)',
        glow: 'rgba(49, 130, 206, 0.35)',
        colors: ['#3182CE', '#2B6CB0'],
    },
    success: {
        gradient: 'linear-gradient(135deg, #38A169 0%, #276749 100%)',
        glow: 'rgba(56, 161, 105, 0.35)',
        colors: ['#38A169', '#276749'],
    },
    danger: {
        gradient: 'linear-gradient(135deg, #E53E3E 0%, #C53030 100%)',
        glow: 'rgba(229, 62, 62, 0.35)',
        colors: ['#E53E3E', '#C53030'],
    },
    warning: {
        gradient: 'linear-gradient(135deg, #D69E2E 0%, #B7791F 100%)',
        glow: 'rgba(214, 158, 46, 0.35)',
        colors: ['#D69E2E', '#B7791F'],
    },
    info: {
        gradient: 'linear-gradient(135deg, #319795 0%, #2C7A7B 100%)',
        glow: 'rgba(49, 151, 149, 0.35)',
        colors: ['#319795', '#2C7A7B'],
    },
    dark: {
        gradient: 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
        glow: 'rgba(45, 55, 72, 0.35)',
        colors: ['#2D3748', '#1A202C'],
    },
} as const;

// Refined Intensities
const glowIntensities = {
    none: { opacity: 0, blur: '0px' },
    low: { opacity: 0.2, blur: '6px' },
    medium: { opacity: 0.35, blur: '10px' },
    high: { opacity: 0.5, blur: '14px' },
    ultra: { opacity: 0.65, blur: '18px' },
} as const;

const frosts = {
    none: { blur: '0px', bg: 'rgba(255, 255, 255, 0)' },
    light: { blur: '4px', bg: 'rgba(255, 255, 255, 0.08)' },
    medium: { blur: '8px', bg: 'rgba(255, 255, 255, 0.12)' },
    heavy: { blur: '12px', bg: 'rgba(255, 255, 255, 0.16)' },
    ultra: { blur: '16px', bg: 'rgba(255, 255, 255, 0.2)' },
} as const;

// Refined Sizes
const sizes = {
    xs: { px: '3', py: '1.5', fontSize: 'xs', minW: '20' },
    sm: { px: '4', py: '2', fontSize: 'sm', minW: '24' },
    md: { px: '6', py: '2.5', fontSize: 'md', minW: '28' },
    lg: { px: '8', py: '3', fontSize: 'lg', minW: '32' },
    xl: { px: '10', py: '4', fontSize: 'xl', minW: '36' },
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

    const [playHover] = useSound('/hover.mp3', { volume: 0.3 });
    const [playClick] = useSound('/click.mp3', { volume: 0.3 });

    const variantStyle = variants[variant];
    const glowStyle = glowIntensities[glowIntensity];
    const frostStyle = frosts[glassFrost];
    const sizeStyle = sizes[size];

    const animationConfig = useMemo(() => ({
        rest: { scale: 1, y: 0 },
        hover: {
            scale: hoverLift ? 1.02 : 1,
            y: hoverLift ? -2 : 0,
            transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
        },
        press: { scale: pressEffect ? 0.98 : 1 },
    }), [hoverLift, pressEffect]);

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

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || isLoading) return;

        if (soundEnabled) playClick();
        if (hapticFeedback && navigator.vibrate) {
            navigator.vibrate(30);
        }

        createRipple(event);
        onClick?.();
    }, [disabled, isLoading, soundEnabled, hapticFeedback, onClick, playClick, createRipple]);

    const handleMouseEnter = useCallback(() => {
        if (soundEnabled && !disabled && !isLoading) playHover();
    }, [soundEnabled, disabled, isLoading, playHover]);

    const buttonStyles = useMemo(() => ({
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: `blur(${frostStyle.blur})`,
        backgroundColor: frostStyle.bg,
        borderRadius: 'xl',
        border: '1px solid',
        borderColor: borderGlow ? `rgba(255, 255, 255, ${glowStyle.opacity})` : 'whiteAlpha.200',
        color: 'white',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        width: fullWidth ? '100%' : 'auto',
        ...sizeStyle,

        _before: {
            content: '""',
            position: 'absolute',
            inset: '-1px',
            background: customGradient || variantStyle.gradient,
            opacity: glowStyle.opacity,
            filter: `blur(${glowStyle.blur})`,
            animation: animated ? `${glowKeyframes} 3s ease infinite` : 'none',
            zIndex: -1,
        },

        _after: animated ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-50%',
            width: '25%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
            transform: 'skewX(-25deg)',
            animation: `${shineKeyframes} 3s ease-in-out infinite`,
        } : {},

        _hover: !disabled && !isLoading ? {
            transform: hoverLift ? 'translateY(-2px)' : 'none',
            _before: {
                opacity: glowStyle.opacity + 0.1,
                filter: `blur(${parseInt(glowStyle.blur) + 2}px)`,
            },
        } : {},

        _active: !disabled && !isLoading ? {
            transform: 'translateY(1px)',
        } : {},

        ...(neonEffect && {
            boxShadow: `0 0 8px ${glowColor || variantStyle.colors[0]}, 
                       0 0 16px ${glowColor || variantStyle.colors[0]}`,
        }),

        animation: pulseEffect && !disabled ? `${pulseKeyframes} 2s infinite` : 'none',

        '& .ripple': {
            position: 'absolute',
            borderRadius: '50%',
            transform: 'scale(0)',
            animation: `${rippleKeyframes} 0.6s ease-out`,
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
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
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
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
                                w: '4',
                                h: '4',
                                borderRadius: 'full',
                                border: '2px solid',
                                borderColor: 'currentColor transparent currentColor currentColor',
                                animation: `${glowKeyframes} 0.75s linear infinite`,
                            }}
                        />
                        <Box as="span">{loadingText}</Box>
                    </MotionBox>
                ) : (
                    <MotionBox
                        key="content"
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
                                    transform: 'scale(1.1)',
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
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                                fontWeight: 'semibold',
                                letterSpacing: '0.01em',
                                transition: 'all 0.2s ease',
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
                                    transform: 'scale(1.1)',
                                    transition: 'transform 0.2s ease',
                                }}
                            >
                                {icon}
                            </Box>
                        )}
                    </MotionBox>
                )}
            </AnimatePresence>

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