// TitleDisplay.tsx
import React from 'react';
import { Text } from "@chakra-ui/react";

interface TitleDisplayProps {
  title: string;
}

export const TitleDisplay: React.FC<TitleDisplayProps> = ({ title }) => (
  <Text fontSize={["sm", "md", "lg"]} fontWeight="bold" mb={2} color="white" isTruncated>
    {title}
  </Text>
);
