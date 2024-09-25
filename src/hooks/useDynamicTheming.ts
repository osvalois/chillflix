// hooks/useDynamicTheming.ts

import { useState, useEffect } from 'react';

export const useDynamicTheming = () => {
  const [primaryColor, setPrimaryColor] = useState('#000000');

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', primaryColor);
  }, [primaryColor]);

  const setThemeColor = (color: string) => {
    setPrimaryColor(color);
  };

  return { primaryColor, setThemeColor };
};