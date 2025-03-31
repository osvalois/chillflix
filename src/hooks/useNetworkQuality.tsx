import { useState, useCallback, useEffect, useRef } from 'react';
import { CONSTANTS } from '../components/VideoPlayer/constants';

interface NetworkStats {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
  lastUpdate: number;
  bandwidthEstimate: number;
  history: Array<{
    timestamp: number;
    bandwidth: number;
    rtt: number;
    effectiveType: string;
  }>;
  stability: number;
  bufferHealth: number;
  availableThroughput: number;
  playbackStability: number;
}

export const useNetworkQuality = () => {
  const [networkQuality, setNetworkQuality] = useState<number>(1);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [isLowBandwidth, setIsLowBandwidth] = useState<boolean>(false);
  const [isUnstable, setIsUnstable] = useState<boolean>(false);
  const [recommendedQuality, setRecommendedQuality] = useState<string>('auto');
  const [currentBandwidth, setCurrentBandwidth] = useState<number>(5000000); // 5 Mbps default
  const [bufferHealth, setBufferHealth] = useState<number>(1);
  
  // Stats storage for analysis
  const networkStatsRef = useRef<NetworkStats>({
    effectiveType: '4g',
    downlink: 5,
    rtt: 50,
    saveData: false,
    lastUpdate: Date.now(),
    bandwidthEstimate: 5000000,
    history: [],
    stability: 1,
    bufferHealth: 1,
    availableThroughput: 1,
    playbackStability: 1
  });

  // Performance measurements
  const performanceDataRef = useRef<{
    lastBufferingEvent: number;
    bufferingFrequency: number;
    playbackEvents: Array<{eventType: string; timestamp: number}>;
    stallCount: number;
    averageStallDuration: number;
  }>({
    lastBufferingEvent: 0,
    bufferingFrequency: 0,
    playbackEvents: [],
    stallCount: 0,
    averageStallDuration: 0
  });

  // Update buffer health and adjust network quality accordingly
  const updateNetworkQuality = useCallback((bufferEnd: number, currentTime: number, duration: number) => {
    // Calculate buffer health as a ratio of buffer to expected buffer
    let expectedBuffer;
    
    // Adjust expected buffer based on network quality
    if (networkStatsRef.current.bandwidthEstimate < CONSTANTS.MINIMUM_BANDWIDTH_FOR_HD) {
      // Low bandwidth - expect smaller buffer
      expectedBuffer = CONSTANTS.BUFFER_GOAL_LOW_BW;
    } else if (networkStatsRef.current.bandwidthEstimate < CONSTANTS.MINIMUM_BANDWIDTH_FOR_4K) {
      // Medium bandwidth
      expectedBuffer = CONSTANTS.BUFFER_GOAL_MID_BW;
    } else {
      // High bandwidth
      expectedBuffer = CONSTANTS.BUFFER_GOAL_HIGH_BW;
    }
    
    // Calculate actual buffer in seconds
    const actualBuffer = bufferEnd - currentTime;
    
    // Calculate health ratio (capped at 1.0)
    const health = Math.min(actualBuffer / expectedBuffer, 1.0);
    
    // Update buffer health
    setBufferHealth(health);
    networkStatsRef.current.bufferHealth = health;

    // Update playback stability based on buffer health history
    // Lower values indicate instability which should reduce quality
    const currentPlaybackStability = networkStatsRef.current.playbackStability;
    
    // Playback stability should respond quickly to drops but recover slowly
    let newPlaybackStability;
    if (health < currentPlaybackStability) {
      // Buffer health dropped - reduce stability quickly
      newPlaybackStability = 0.7 * currentPlaybackStability + 0.3 * health;
    } else {
      // Buffer health improved - increase stability slowly
      newPlaybackStability = 0.95 * currentPlaybackStability + 0.05 * health;
    }
    
    networkStatsRef.current.playbackStability = newPlaybackStability;
    
    // Combined network quality calculation
    // Weighted average of multiple factors
    const newQuality = calculateNetworkQuality(
      networkStatsRef.current.bandwidthEstimate, 
      networkStatsRef.current.stability,
      health,
      newPlaybackStability,
      isOffline,
      networkStatsRef.current.saveData
    );
    
    setNetworkQuality(newQuality);
    
    // Update recommended quality based on combined metrics
    updateRecommendedQuality(newQuality, networkStatsRef.current.bandwidthEstimate);
    
    return newQuality;
  }, [isOffline]);

  // Calculate the network quality based on multiple factors
  const calculateNetworkQuality = useCallback((
    bandwidth: number, 
    stability: number,
    bufferHealth: number,
    playbackStability: number,
    offline: boolean,
    saveData: boolean
  ): number => {
    if (offline) return 0;
    if (saveData) return 0.4; // 'Data saver' mode should cap quality
    
    // Base quality on bandwidth
    let quality;
    
    if (bandwidth < 1000000) { // Less than 1Mbps
      quality = bandwidth / 1000000 * 0.4; // Scale from 0 to 0.4
    } else if (bandwidth < CONSTANTS.MINIMUM_BANDWIDTH_FOR_HD) { // 1-2.5 Mbps
      quality = 0.4 + (bandwidth - 1000000) / (CONSTANTS.MINIMUM_BANDWIDTH_FOR_HD - 1000000) * 0.2; // Scale from 0.4 to 0.6
    } else if (bandwidth < CONSTANTS.MINIMUM_BANDWIDTH_FOR_4K) { // 2.5-15 Mbps
      quality = 0.6 + (bandwidth - CONSTANTS.MINIMUM_BANDWIDTH_FOR_HD) / (CONSTANTS.MINIMUM_BANDWIDTH_FOR_4K - CONSTANTS.MINIMUM_BANDWIDTH_FOR_HD) * 0.3; // Scale from 0.6 to 0.9
    } else { // 15+ Mbps
      quality = 0.9 + Math.min((bandwidth - CONSTANTS.MINIMUM_BANDWIDTH_FOR_4K) / 15000000, 0.1); // Cap at 1.0
    }
    
    // Apply stability factor (weighted 20%)
    quality = quality * 0.8 + stability * 0.2;
    
    // Apply buffer health factor (weighted 30%)
    quality = quality * 0.7 + bufferHealth * 0.3;
    
    // Apply playback stability factor as a cap
    // If playback is unstable, cap quality to prevent further problems
    quality = Math.min(quality, playbackStability * 1.2); // Allow slight increase over stability
    
    // Final clamping
    return Math.max(0, Math.min(1, quality));
  }, []);

  // Determine recommended quality based on network quality
  const updateRecommendedQuality = useCallback((quality: number, bandwidth: number) => {
    let recommendedQuality;
    
    if (quality < 0.1 || bandwidth < 300000) { // Extremely poor
      recommendedQuality = 'lowest';
    } else if (quality < 0.4 || bandwidth < 1000000) { // Poor
      recommendedQuality = 'low';
    } else if (quality < 0.65 || bandwidth < CONSTANTS.MINIMUM_BANDWIDTH_FOR_HD) { // Medium
      recommendedQuality = 'sd';
    } else if (quality < 0.85 || bandwidth < CONSTANTS.MINIMUM_BANDWIDTH_FOR_4K) { // Good
      recommendedQuality = 'hd';
    } else { // Excellent
      recommendedQuality = 'full';
    }
    
    setRecommendedQuality(recommendedQuality);
    setIsLowBandwidth(bandwidth < CONSTANTS.MINIMUM_BANDWIDTH_FOR_HD);
    
    return recommendedQuality;
  }, []);

  // Register a buffering event for analysis
  const registerBufferingEvent = useCallback(() => {
    const now = Date.now();
    const perfData = performanceDataRef.current;
    
    // Calculate buffering frequency
    if (perfData.lastBufferingEvent > 0) {
      const timeSinceLastBuffer = now - perfData.lastBufferingEvent;
      
      // Use exponential moving average for buffering frequency
      perfData.bufferingFrequency = perfData.bufferingFrequency * 0.7 + 
                                  (1 / (timeSinceLastBuffer / 60000)) * 0.3; // Events per minute
    }
    
    perfData.lastBufferingEvent = now;
    perfData.playbackEvents.push({eventType: 'buffering', timestamp: now});
    
    // Limit history size
    if (perfData.playbackEvents.length > 50) {
      perfData.playbackEvents.shift();
    }
    
    // Update stability based on buffering frequency
    networkStatsRef.current.stability = Math.max(0, 1 - perfData.bufferingFrequency / 5);
    setIsUnstable(networkStatsRef.current.stability < 0.6);
  }, []);

  // Register a stall in playback
  const registerPlaybackStall = useCallback((duration: number) => {
    if (duration < CONSTANTS.STALL_THRESHOLD) return; // Ignore micro-stalls
    
    const perfData = performanceDataRef.current;
    const now = Date.now();
    
    perfData.stallCount++;
    
    // Update average stall duration with new stall
    perfData.averageStallDuration = 
      (perfData.averageStallDuration * (perfData.stallCount - 1) + duration) / perfData.stallCount;
    
    perfData.playbackEvents.push({eventType: 'stall', timestamp: now});
    
    // Reduce stability more aggressively for stalls (worse than buffering)
    networkStatsRef.current.stability *= 0.85;
    setIsUnstable(networkStatsRef.current.stability < 0.6);
  }, []);

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // When returning online, we should measure bandwidth again
      measureCurrentBandwidth();
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setNetworkQuality(0); // No quality when offline
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Active bandwidth measurement
  const measureCurrentBandwidth = useCallback(() => {
    // Use the Network Information API if available
    const connection = (navigator as any).connection;
    
    if (connection) {
      const { effectiveType, downlink, rtt, saveData } = connection;
      
      // Store values in our stat tracking
      networkStatsRef.current.effectiveType = effectiveType;
      networkStatsRef.current.downlink = downlink || 0;
      networkStatsRef.current.rtt = rtt || 0;
      networkStatsRef.current.saveData = saveData || false;
      
      // Use downlink as a base for our bandwidth estimate
      if (downlink) {
        // Convert Mbps to bps
        const bandwidthEstimate = downlink * 1000000;
        
        // Update bandwidth with some smoothing to prevent frequent changes
        networkStatsRef.current.bandwidthEstimate = 
          networkStatsRef.current.bandwidthEstimate * 0.7 + bandwidthEstimate * 0.3;
          
        setCurrentBandwidth(networkStatsRef.current.bandwidthEstimate);
      }
      
      // Update history for tracking stability
      networkStatsRef.current.history.push({
        timestamp: Date.now(),
        bandwidth: networkStatsRef.current.bandwidthEstimate,
        rtt: networkStatsRef.current.rtt,
        effectiveType: networkStatsRef.current.effectiveType
      });
      
      // Keep history limited to useful size
      if (networkStatsRef.current.history.length > 20) {
        networkStatsRef.current.history.shift();
      }
      
      // Calculate stability based on variation in bandwidth
      if (networkStatsRef.current.history.length > 5) {
        // Calculate standard deviation of bandwidth
        const bandwidths = networkStatsRef.current.history.map(h => h.bandwidth);
        const avg = bandwidths.reduce((a, b) => a + b, 0) / bandwidths.length;
        const squareDiffs = bandwidths.map(bw => (bw - avg) ** 2);
        const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
        const stdDev = Math.sqrt(avgSquareDiff);
        
        // Normalize stdDev as percentage of average
        const variationCoefficient = avg > 0 ? stdDev / avg : 1;
        
        // Convert to stability score (1 = perfect stability, 0 = completely unstable)
        // Lower variationCoefficient means higher stability
        networkStatsRef.current.stability = Math.max(0, 1 - variationCoefficient);
        
        // Update unstable status
        setIsUnstable(networkStatsRef.current.stability < 0.6);
      }
      
      // Update lastUpdate timestamp
      networkStatsRef.current.lastUpdate = Date.now();
    }
  }, []);

  // Setup regular bandwidth measurement
  useEffect(() => {
    const connection = (navigator as any).connection;
    
    if (connection) {
      const updateConnectionQuality = () => {
        measureCurrentBandwidth();
      };

      connection.addEventListener('change', updateConnectionQuality);
      updateConnectionQuality(); // Initial check
      
      // Set up periodic measurements
      const measurementInterval = setInterval(measureCurrentBandwidth, CONSTANTS.BANDWIDTH_MEASUREMENT_INTERVAL);

      return () => {
        connection.removeEventListener('change', updateConnectionQuality);
        clearInterval(measurementInterval);
      };
    } else {
      // Fallback for browsers without Network Information API
      const fallbackMeasurementInterval = setInterval(() => {
        // Use a simple heuristic when Network Information API is not available
        // This would ideally be replaced with a proper bandwidth estimation technique
        networkStatsRef.current.bandwidthEstimate = 5000000; // Assume 5 Mbps as default
        setCurrentBandwidth(networkStatsRef.current.bandwidthEstimate);
      }, CONSTANTS.BANDWIDTH_MEASUREMENT_INTERVAL);
      
      return () => clearInterval(fallbackMeasurementInterval);
    }
  }, [measureCurrentBandwidth]);

  return { 
    networkQuality, 
    updateNetworkQuality, 
    isOffline, 
    isLowBandwidth, 
    isUnstable,
    recommendedQuality,
    currentBandwidth,
    bufferHealth,
    registerBufferingEvent,
    registerPlaybackStall,
    measureCurrentBandwidth
  };
};