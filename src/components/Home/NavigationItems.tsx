// components/Header/NavigationItems.tsx
import { Home, Film, Tv2, Music, User } from 'lucide-react';
import { NavItem } from '../../header.types';

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
    },
    {
      icon: Film,
      label: 'Movies',
      path: '/movies',
      gradient: 'linear-gradient(135deg, #FF0080 0%, #7928CA 100%)',
      glassEffect: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      },
      pulseColor: '#FF0080',
    },
    {
      icon: Tv2,
      label: 'TV Shows',
      path: '/tv-shows',
      gradient: 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
      glassEffect: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      },
      pulseColor: '#7928CA',
      
    },
    {
      icon: Music,
      label: 'Soundtracks',
      path: '/soundtracks',
      gradient: 'linear-gradient(135deg, #FF4D4D 0%, #F9CB28 100%)',
      glassEffect: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      },
      pulseColor: '#FF4D4D',
      
    },
    {
      icon: User,
      label: 'Profile',
      path: '/profile',
      gradient: 'linear-gradient(135deg, #00DFD8 0%, #007CF0 100%)',
      glassEffect: {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.18)'
      },
      pulseColor: '#00DFD8',
      
    }
  ];
};