import { Home, Settings } from 'lucide-react';
import { NavItem } from '../../types';
import Live from '../../icons/Live';

export const useNavigationItems = (): NavItem[] => {
  return [
    {
      icon: Home,
      label: 'Home',
      path: '/',
      gradient: 'linear-gradient(135deg, #6EE7B7 0%, #3B82F6 100%)',
      glassEffect: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      },
      pulseColor: '#6EE7B7',
      shortcut: ''
    },
    {
      icon: Live,
      label: 'Now Playing',
      path: '/now-playing',
      gradient: 'linear-gradient(135deg, #F87171 0%, #9333EA 100%)',
      glassEffect: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      },
      pulseColor: '#F87171',
      shortcut: ''
    },
    {
      icon: Settings,
      label: 'Settings',
      path: '/settings',
      gradient: 'linear-gradient(135deg, #60A5FA 0%, #4F46E5 100%)',
      glassEffect: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      },
      pulseColor: '#60A5FA',
      shortcut: ''
    }
  ];
};