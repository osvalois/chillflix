import { SystemStyleObject } from '@chakra-ui/react';

export const glassStyle: SystemStyleObject = {
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: 'xl',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
};

export const iconButtonStyle: SystemStyleObject = {
  variant: 'ghost',
  size: 'lg',
  borderRadius: 'full',
  color: 'gray.500',
  _hover: { 
    bg: 'rgba(255, 255, 255, 0.1)', 
    color: 'blue.500',
    transform: 'scale(1.1)',
  },
  transition: 'all 0.3s ease',
};