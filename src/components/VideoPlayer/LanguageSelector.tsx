
// LanguageSelector.tsx
import { Select } from "@chakra-ui/react";

interface LanguageSelectorProps {
  selectedLanguage: string;
  availableLanguages: string[];
  onLanguageChange: (language: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, availableLanguages, onLanguageChange }) => (
  <Select 
    value={selectedLanguage} 
    onChange={(e) => onLanguageChange(e.target.value)} 
    size="sm" 
    mr={2} 
    bg="transparent" 
    color="white" 
    borderColor="whiteAlpha.400"
    _hover={{ borderColor: "white" }}
  >
    {availableLanguages.map((language) => (
      <option key={language} value={language}>{language}</option>
    ))}
  </Select>
);
