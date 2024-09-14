import React from "react";
import {
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { motion } from 'framer-motion';

const MotionInputGroup = motion(InputGroup);

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onQueryChange,
  onSearch,
  isLoading,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQueryChange(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      onSearch();
    }
  };

  const inputBg = useColorModeValue("white", "gray.800");
  const inputBorderColor = useColorModeValue("gray.300", "gray.600");
  const inputHoverBorderColor = useColorModeValue("gray.400", "gray.500");
  const iconColor = useColorModeValue("gray.500", "gray.400");

  return (
    <MotionInputGroup
      size="lg"
      maxW="600px"
      mx="auto"
      mb={8}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Input
        value={query}
        onChange={handleInputChange}
        placeholder="Buscar películas..."
        borderRadius="full"
        onKeyPress={handleKeyPress}
        disabled={isLoading}
        bg={inputBg}
        borderColor={inputBorderColor}
        _hover={{ borderColor: inputHoverBorderColor }}
        _focus={{ borderColor: "purple.500", boxShadow: "0 0 0 1px purple.500" }}
      />
      <InputRightElement>
        {isLoading ? (
          <Spinner size="sm" color="purple.500" />
        ) : (
          <IconButton
            aria-label="Buscar"
            icon={<SearchIcon />}
            onClick={onSearch}
            variant="ghost"
            borderRadius="full"
            isDisabled={isLoading || query.trim().length <= 2}
            color={iconColor}
            _hover={{ bg: "purple.100" }}
          />
        )}
      </InputRightElement>
    </MotionInputGroup>
  );
};

export default SearchBar;