import React from 'react';
import { Flex, HStack, Select, Text, Button, Box } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { rgba } from 'polished';

const MotionButton = motion(Button);
const MotionBox = motion(Box);

interface PaginationProps {
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
  currentPage: number;
  setCurrentPage: (value: number) => void;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
  startIndex,
  endIndex,
  totalItems
}) => {
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  const glassEffect = {
    background: rgba(255, 255, 255, 0.03),
    backdropFilter: 'blur(10px)',
    border: `1px solid ${rgba(255, 255, 255, 0.05)}`,
    boxShadow: `0 4px 12px ${rgba(0, 0, 0, 0.1)}, inset 0 1px 0 ${rgba(255, 255, 255, 0.06)}`
  };

  const buttonVariants = {
    initial: { y: 0, opacity: 0.95 },
    hover: { 
      y: -2,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15
      }
    },
    tap: { 
      scale: 0.98,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const containerVariants = {
    initial: { opacity: 0, y: 10 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  return (
    <MotionBox
      initial="initial"
      animate="animate"
      variants={containerVariants}
    >
      <Flex
        justify="space-between"
        align="center"
        mt={6}
        px={5}
        py={5}
        flexWrap="wrap"
        gap={5}
        sx={glassEffect}
        borderRadius="2xl"
      >
        <HStack spacing={5}>
          <Box position="relative">
            <Select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              size="md"
              width="auto"
              pl={4}
              pr={10}
              py={2}
              bg={rgba(255, 255, 255, 0.04)}
              border="1px solid"
              borderColor={rgba(255, 255, 255, 0.08)}
              _hover={{ borderColor: rgba(255, 255, 255, 0.15) }}
              _focus={{ 
                borderColor: rgba(255, 255, 255, 0.2),
                boxShadow: `0 0 0 1px ${rgba(255, 255, 255, 0.2)}`
              }}
              borderRadius="xl"
              color="whiteAlpha.800"
              fontSize="sm"
              fontWeight="medium"
              sx={{
                backdropFilter: 'blur(8px)',
                '& option': {
                  bg: 'gray.800',
                  color: 'whiteAlpha.900'
                }
              }}
            >
              {[5, 10, 15, 20].map(num => (
                <option key={num} value={num}>{num} per page</option>
              ))}
            </Select>
          </Box>
          <Text 
            fontSize="sm" 
            color="whiteAlpha.700"
            fontWeight="medium"
            letterSpacing="0.2px"
          >
            Showing {startIndex + 1}-{endIndex} of {totalItems}
          </Text>
        </HStack>

        <HStack spacing={3}>
          <MotionButton
            size="md"
            onClick={() => setCurrentPage(currentPage - 1)}
            isDisabled={currentPage === 1}
            leftIcon={<ChevronLeft size={18} />}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            bg={rgba(255, 255, 255, 0.04)}
            _hover={{ bg: rgba(255, 255, 255, 0.08) }}
            _active={{ bg: rgba(255, 255, 255, 0.06) }}
            border="1px solid"
            borderColor={rgba(255, 255, 255, 0.08)}
            color="whiteAlpha.900"
            fontWeight="medium"
            px={5}
            borderRadius="xl"
            sx={glassEffect}
          >
            Previous
          </MotionButton>

          <HStack spacing={2}>
            {pageNumbers.map((pageNumber) => (
              <MotionButton
                key={pageNumber}
                size="md"
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={() => setCurrentPage(pageNumber)}
                bg={currentPage === pageNumber ? 
                  'linear-gradient(135deg, rgba(66, 153, 225, 0.25), rgba(49, 130, 206, 0.15))' : 
                  rgba(255, 255, 255, 0.04)
                }
                _hover={{
                  bg: currentPage === pageNumber ?
                    'linear-gradient(135deg, rgba(66, 153, 225, 0.3), rgba(49, 130, 206, 0.2))' :
                    rgba(255, 255, 255, 0.08)
                }}
                _active={{
                  bg: currentPage === pageNumber ?
                    'linear-gradient(135deg, rgba(66, 153, 225, 0.35), rgba(49, 130, 206, 0.25))' :
                    rgba(255, 255, 255, 0.06)
                }}
                border="1px solid"
                borderColor={currentPage === pageNumber ?
                  rgba(66, 153, 225, 0.3) :
                  rgba(255, 255, 255, 0.08)
                }
                color="whiteAlpha.900"
                fontWeight="medium"
                minW="40px"
                h="40px"
                borderRadius="xl"
                sx={{
                  ...glassEffect,
                  boxShadow: currentPage === pageNumber ?
                    `0 4px 12px ${rgba(66, 153, 225, 0.2)}, inset 0 1px 0 ${rgba(255, 255, 255, 0.1)}` :
                    glassEffect.boxShadow
                }}
              >
                {pageNumber}
              </MotionButton>
            ))}
          </HStack>

          <MotionButton
            size="md"
            onClick={() => setCurrentPage(currentPage + 1)}
            isDisabled={currentPage === totalPages}
            rightIcon={<ChevronRight size={18} />}
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            bg={rgba(255, 255, 255, 0.04)}
            _hover={{ bg: rgba(255, 255, 255, 0.08) }}
            _active={{ bg: rgba(255, 255, 255, 0.06) }}
            border="1px solid"
            borderColor={rgba(255, 255, 255, 0.08)}
            color="whiteAlpha.900"
            fontWeight="medium"
            px={5}
            borderRadius="xl"
            sx={glassEffect}
          >
            Next
          </MotionButton>
        </HStack>
      </Flex>
    </MotionBox>
  );
};