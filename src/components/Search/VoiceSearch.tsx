import React from 'react';
import { IconButton, Tooltip, keyframes, Box } from '@chakra-ui/react';
import { Mic } from 'lucide-react';

interface VoiceSearchProps {
  isListening: boolean;
  onVoiceSearch: () => void;
  size?: string;
}

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(66, 153, 225, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(66, 153, 225, 0); }
  100% { box-shadow: 0 0 0 0 rgba(66, 153, 225, 0); }
`;

const VoiceSearch: React.FC<VoiceSearchProps> = ({ isListening, onVoiceSearch, size = 'md' }) => {
  return (
    <Tooltip label={isListening ? "Listening..." : "Voice Search"} hasArrow>
      <Box position="relative">
        <IconButton
          aria-label="Voice Search"
          icon={<Mic />}
          onClick={onVoiceSearch}
          size={size}
          variant="ghost"
          color={isListening ? 'blue.500' : undefined}
          _hover={{ bg: 'rgba(255, 255, 255, 0.2)' }}
          transition="all 0.3s ease-in-out"
        />
        {isListening && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            width="100%"
            height="100%"
            borderRadius="full"
            animation={`${pulse} 1.5s infinite`}
          />
        )}
      </Box>
    </Tooltip>
  );
};

export default VoiceSearch;