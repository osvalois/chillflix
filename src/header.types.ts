// types/header.types.ts
export interface GlassEffect {
    background: string;
    backdropFilter: string;
    border: string;
}

export interface NavItemBadge {
    show: boolean;
    content?: string | number;
    color?: string;
}

export interface NavItemAnimation {
    hoverScale?: number;
    transition?: string;
    pulseEffect?: boolean;
}

export interface NavItem {
    icon: React.ElementType;
    label: string;
    path: string;
    gradient: string;
    pulseColor?: string;
    // Nuevas propiedades
    isActive?: boolean;
    glassEffect?: GlassEffect;
    badge?: NavItemBadge;
    animation?: NavItemAnimation;
    submenu?: NavItem[];
    onClick?: () => void;
    permission?: string[];
}

// Valores por defecto para las propiedades de glassmorfismo
export const DEFAULT_GLASS_EFFECT: GlassEffect = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)'
};

// Valores por defecto para las animaciones
export const DEFAULT_ANIMATION: NavItemAnimation = {
    hoverScale: 1.05,
    transition: 'all 0.3s ease',
    pulseEffect: true
};
export interface NotificationBadgeProps {
    count: number;
    color?: string;
}

export interface ThemeColors {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    border: string;
}

export interface HeaderGradients {
    primary: string;
    accent: string;
    glass: string;
}

