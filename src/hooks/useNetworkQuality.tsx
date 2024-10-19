import { useState, useCallback, useEffect } from 'react';

export const useNetworkQuality = () => {
  const [networkQuality, setNetworkQuality] = useState<number>(1);

  const updateNetworkQuality = useCallback((bufferEnd: number) => {
    // This is a simple heuristic. You might want to use a more sophisticated algorithm
    // based on your specific needs and the characteristics of your video streams.
    const newQuality = Math.min(bufferEnd, 1);
    setNetworkQuality(newQuality);
  }, []);

  useEffect(() => {
    const handleOnline = () => setNetworkQuality(1);
    const handleOffline = () => setNetworkQuality(0);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const connection = (navigator as any).connection;
    
    if (connection) {
      const updateConnectionQuality = () => {
        const { effectiveType, downlink } = connection;
        let quality = 1;

        switch (effectiveType) {
          case 'slow-2g':
            quality = 0.25;
            break;
          case '2g':
            quality = 0.5;
            break;
          case '3g':
            quality = 0.75;
            break;
          case '4g':
            quality = 1;
            break;
        }

        // Adjust quality based on downlink speed (Mbps)
        if (downlink) {
          quality *= Math.min(downlink / 10, 1); // Assuming 10 Mbps is "perfect"
        }

        setNetworkQuality(quality);
      };

      connection.addEventListener('change', updateConnectionQuality);
      updateConnectionQuality(); // Initial check

      return () => connection.removeEventListener('change', updateConnectionQuality);
    }
  }, []);

  return { networkQuality, updateNetworkQuality };
};