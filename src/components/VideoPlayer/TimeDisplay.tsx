
// TimeDisplay.tsx
import React from 'react';
import { Text } from "@chakra-ui/react";

interface TimeDisplayProps {
  currentTime: number;
  duration: number;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ currentTime, duration }) => {
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Text color="white" fontSize={["xs", "sm"]} ml={2}>
      {formatTime(currentTime)} / {formatTime(duration)}
    </Text>
  );
};
