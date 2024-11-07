// src/pages/MoviePage/components/WatchPartySection/WatchPartySection.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Box, Text, VStack } from '@chakra-ui/react';
import { useQuery } from 'react-query';
import LoadingSpinner from '../UI/LoadingSpinner';
import ToggleWatchPartyButton from '../WatchParty/ToggleWatchPartyButton';
import CreateWatchParty from '../WatchParty/CreateWatchParty';
import JoinWatchParty from '../WatchParty/JoinWatchParty';
import { InviteFriends } from '../WatchParty/InviteFriends';
import { ChatRoom } from '../WatchParty/ChatRoom';
import GlassmorphicButton from '../Button/GlassmorphicButton';


interface WatchPartySectionProps {
  isVisible: boolean;
  watchPartyId: string | null;
  hasJoined: boolean;
  movieId: string;
  movieTitle: string;
  movieDuration?: number;
  movieThumbnail?: string;
  onToggleVisibility: () => void;
  onWatchPartyCreated: (partyId: string) => void;
  onJoinParty: () => void;
}

const glassmorphismStyle = {
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow:
    "0 4px 30px rgba(0, 0, 0, 0.1), " +
    "inset 0 0 20px rgba(255, 255, 255, 0.05), " +
    "0 0 0 1px rgba(255, 255, 255, 0.1)",
  overflow: "hidden",
};

export const WatchPartySection: React.FC<WatchPartySectionProps> = ({
  isVisible,
  watchPartyId,
  hasJoined,
  movieId,
  movieTitle,
  movieDuration,
  movieThumbnail,
  onToggleVisibility,
  onWatchPartyCreated,
  onJoinParty,
}) => {
  // Query para obtener el ID del usuario actual
  const { data: userId, isLoading: isUserLoading } = useQuery('userId', () => 
    // Aquí deberías implementar la lógica real para obtener el userId
    Promise.resolve("example-user-id")
  );

  // Animación para el contenedor
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  // Animación para los elementos hijos
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  if (isUserLoading) {
    return (
      <Box {...glassmorphismStyle} p={6}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Box
        {...glassmorphismStyle}
        p={6}
        position="relative"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)",
          pointerEvents: "none",
        }}
      >
        <VStack spacing={6} align="stretch">
          {/* Toggle Button */}
          <motion.div variants={itemVariants}>
            <ToggleWatchPartyButton
              isVisible={isVisible}
              onToggle={onToggleVisibility}
            />
          </motion.div>

          {isVisible && (
            <>
              {/* Create or Join Section */}
              {!watchPartyId && !hasJoined && (
                <motion.div variants={itemVariants}>
                  <VStack spacing={4} align="stretch">
                    {/* Create Watch Party */}
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg="rgba(255,255,255,0.05)"
                      _hover={{ bg: "rgba(255,255,255,0.08)" }}
                      transition="background 0.3s ease"
                    >
                      <CreateWatchParty
                        movieId={movieId}
                        movieTitle={movieTitle}
                        movieDuration={movieDuration}
                        movieThumbnail={movieThumbnail}
                        onWatchPartyCreated={onWatchPartyCreated}
                        onCancel={() => {}}
                      />
                    </Box>

                    {/* Join Watch Party */}
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg="rgba(255,255,255,0.05)"
                      _hover={{ bg: "rgba(255,255,255,0.08)" }}
                      transition="background 0.3s ease"
                    >
                      <JoinWatchParty
                        partyId="example-party-123" // Este valor debería ser dinámico
                        movieTitle={movieTitle}
                        hostName="Host Name" // Este valor debería ser dinámico
                        startTime={new Date()}
                        maxParticipants={10}
                        currentParticipants={1}
                        onJoin={onJoinParty}
                        onCancel={() => {}}
                      />
                    </Box>
                  </VStack>
                </motion.div>
              )}

              {/* Active Watch Party Section */}
              {watchPartyId && (
                <motion.div variants={itemVariants}>
                  <VStack spacing={4} align="stretch">
                    {/* Party Info */}
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg="rgba(255,255,255,0.05)"
                      backdropFilter="blur(10px)"
                    >
                      <Text fontSize="lg" fontWeight="bold" mb={2}>
                        Active Watch Party
                      </Text>
                      <Text fontSize="md" color="whiteAlpha.800">
                        Party ID: {watchPartyId}
                      </Text>
                    </Box>

                    {/* Invite Friends */}
                    <Box
                      p={4}
                      borderRadius="lg"
                      bg="rgba(255,255,255,0.05)"
                      backdropFilter="blur(10px)"
                    >
                      <InviteFriends partyId={watchPartyId} />
                    </Box>

                    {/* Chat Room */}
                    {hasJoined && userId && (
                      <Box
                        p={4}
                        borderRadius="lg"
                        bg="rgba(0,0,0,0.3)"
                        backdropFilter="blur(10px)"
                        maxH="400px"
                        overflowY="auto"
                        css={{
                          '&::-webkit-scrollbar': {
                            width: '4px',
                          },
                          '&::-webkit-scrollbar-track': {
                            background: 'rgba(255,255,255,0.1)',
                          },
                          '&::-webkit-scrollbar-thumb': {
                            background: 'rgba(255,255,255,0.3)',
                            borderRadius: '2px',
                          },
                        }}
                      >
                        <ChatRoom
                          partyId={watchPartyId}
                          userId={userId}
                        />
                      </Box>
                    )}
                  </VStack>
                </motion.div>
              )}

              {/* Additional Features */}
              <motion.div variants={itemVariants}>
                <Box
                  mt={4}
                  p={4}
                  borderRadius="lg"
                  bg="rgba(255,255,255,0.05)"
                  backdropFilter="blur(10px)"
                >
                  <GlassmorphicButton
                    onClick={() => {}}
                    variant="primary"
                    size="sm"
                    width="full"
                  >
                    Additional Features Coming Soon
                  </GlassmorphicButton>
                </Box>
              </motion.div>
            </>
          )}
        </VStack>
      </Box>
    </motion.div>
  );
};