

// QualitySelector.tsx
import { Select } from "@chakra-ui/react";

interface QualitySelectorProps {
  selectedQuality: string;
  availableQualities: string[];
  onQualityChange: (quality: string) => void;
}

export const QualitySelector: React.FC<QualitySelectorProps> = ({ selectedQuality, availableQualities, onQualityChange }) => (
  <Select 
    value={selectedQuality} 
    onChange={(e) => onQualityChange(e.target.value)} 
    size="sm" 
    mr={2} 
    bg="transparent" 
    color="white" 
    borderColor="whiteAlpha.400"
    _hover={{ borderColor: "white" }}
  >
    {availableQualities.map((quality) => (
      <option key={quality} value={quality}>{quality}</option>
    ))}
  </Select>
);
