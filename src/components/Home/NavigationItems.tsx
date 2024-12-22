// components/Header/NavigationItems.tsx
import { Home, CompassIcon, Settings } from 'lucide-react';
import { NavItem } from '../../types';

export const useNavigationItems = (): NavItem[] => {
  return [
    {
      icon: Home,
      label: 'Home',
      path: '/',
      gradient: 'linear-gradient(135deg, #00F5A0 0%, #00D9F5 100%)',
      glassEffect: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      },
      pulseColor: '#00F5A0',
      shortcut: ''
    },
    {
      icon: CompassIcon,
      label: 'Discover',
      path: '/discover',
      gradient: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
      glassEffect: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      },
      pulseColor: '#FF0080',
      shortcut: ''
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings',
      gradient: 'linear-gradient(135deg, #00DFD8 0%, #007CF0 100%)',
      glassEffect: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      },
      pulseColor: '#00DFD8',
      shortcut: ''
    }
  ];
};