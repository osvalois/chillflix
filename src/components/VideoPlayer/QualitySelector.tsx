import React from 'react';
import { ChevronDownIcon } from 'lucide-react';

interface QualitySelectorProps {
  selectedQuality: string;
  availableQualities: string[];
  onQualityChange: (quality: string) => void;
}

export const QualitySelector: React.FC<QualitySelectorProps> = ({
  selectedQuality,
  availableQualities,
  onQualityChange,
}) => {
  return (
    <div className="relative">
      <select
        value={selectedQuality}
        onChange={(e) => onQualityChange(e.target.value)}
        className="appearance-none w-full py-2 px-4 pr-8 rounded-lg text-sm font-medium text-white bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg border border-white border-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-300 ease-in-out hover:bg-opacity-20"
      >
        {availableQualities.map((quality) => (
          <option key={quality} value={quality} className="bg-gray-800 text-white">
            {quality}
          </option>
        ))}
      </select>
    </div>
  );
};

export default QualitySelector;