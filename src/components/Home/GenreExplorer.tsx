import React from 'react';
import { Heading, Flex, Button } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import GlassmorphicBox from '../UI/GlassmorphicBox';
import { Genre } from '../../types';


const MotionFlex = motion(Flex as any);

interface GenreExplorerProps {
  genres: Genre[];
}

const GenreExplorer: React.FC<GenreExplorerProps> = ({ genres }) => {
  return (
    <GlassmorphicBox p={6} borderRadius="xl">
      <Heading size="lg" mb={4}>
        Explore by Genre
      </Heading>
      <MotionFlex
        flexWrap="wrap"
        gap={3}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        {genres.map((genre) => (
          <motion.div
            key={genre.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="sm"
              colorScheme="whiteAlpha"
              variant="outline"
              _hover={{ bg: 'whiteAlpha.200' }}
            >
              {genre.name}
            </Button>
          </motion.div>
        ))}
      </MotionFlex>
    </GlassmorphicBox>
  );
};

export default GenreExplorer;