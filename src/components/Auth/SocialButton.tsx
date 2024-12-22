// src/components/Auth/SocialButton.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { AuthProviderConfig } from '../../types/auth';

interface SocialButtonProps extends AuthProviderConfig {
  onClick: () => void;
  isLoading?: boolean;
}

export const SocialButton: React.FC<SocialButtonProps> = ({
  id,
  name,
  icon,
  backgroundColor,
  textColor,
  onClick,
  isLoading
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full px-6 py-3 mb-4 flex items-center justify-center gap-3 rounded-lg transition-all"
      style={{ backgroundColor, color: textColor }}
      onClick={onClick}
      disabled={isLoading}
    >
      <img src={icon} alt={name} className="w-5 h-5" />
      <span className="font-medium">
        {isLoading ? 'Connecting...' : `Continue with ${name}`}
      </span>
    </motion.button>
  );
};
