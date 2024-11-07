import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Box, Text, VStack, Flex, Spacer, useBreakpointValue } from '@chakra-ui/react';
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

const GLASSMORPHISM_STYLE = {
  background: "rgba(255, 255, 255, 0.05)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow:
    "0 4px 30px rgba(0, 0, 0, 0.1), " +
    "inset 0 0 20px rgba(255, 255, 255, 0.05), " +
    "0 0 0 1px rgba(255, 255, 255, 0.1)",
  overflow: "hidden",
} as const;

const ANIMATION_VARIANTS = {
  container: {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  },
  item: {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  }
} as const;

const SCROLL_STYLES = {
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
} as const;

const CreateJoinSection = memo(({ 
  movieId, 
  movieTitle, 
  movieDuration, 
  movieThumbnail, 
  onWatchPartyCreated, 
  onJoinParty 
}: Pick<WatchPartySectionProps, 'movieId' | 'movieTitle' | 'movieDuration' | 'movieThumbnail' | 'onWatchPartyCreated' | 'onJoinParty'>) => (
  <VStack spacing={2} align="stretch">
    <Box
      p={1}
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
    <Box
      p={4}
      borderRadius="lg"
      bg="rgba(255,255,255,0.05)"
      _hover={{ bg: "rgba(255,255,255,0.08)" }}
      transition="background 0.3s ease"
    >
      <JoinWatchParty
        partyId="example-party-123"
        movieTitle={movieTitle}
        hostName="Host Name"
        startTime={new Date()}
        maxParticipants={10}
        currentParticipants={1}
        onJoin={onJoinParty}
        onCancel={() => {}}
      />
    </Box>
  </VStack>
));

const ActivePartySection = memo(({ 
  watchPartyId, 
  hasJoined, 
  userId 
}: { 
  watchPartyId: string; 
  hasJoined: boolean; 
  userId?: string;
}) => (
  <VStack spacing={4} align="stretch">
    <Box p={1} borderRadius="lg" bg="rgba(255,255,255,0.05)" backdropFilter="blur(10px)">
      <Flex align="center">
        <Text fontSize="lg" fontWeight="bold">Active Watch Party</Text>
        <Spacer />
        <Text fontSize="md" color="whiteAlpha.800">Party ID: {watchPartyId}</Text>
      </Flex>
    </Box>
    <Box p={1} borderRadius="lg" bg="rgba(255,255,255,0.05)" backdropFilter="blur(10px)">
      <InviteFriends partyId={watchPartyId} />
    </Box>
    {hasJoined && userId && (
      <Box
        p={1}
        borderRadius="lg"
        bg="rgba(0,0,0,0.3)"
        backdropFilter="blur(10px)"
        maxH={{ base: '300px', md: '400px' }}
        overflowY="auto"
        css={SCROLL_STYLES}
      >
        <ChatRoom partyId={watchPartyId} userId={userId} />
      </Box>
    )}
  </VStack>
));

const WatchPartySection: React.FC<WatchPartySectionProps> = ({
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
  const { data: userId, isLoading: isUserLoading } = useQuery('userId', () => 
    Promise.resolve("example-user-id")
  );

  const isMobile = useBreakpointValue({ base: true, md: false });

  if (isUserLoading) {
    return (
      <Box {...GLASSMORPHISM_STYLE} p={6}>
        <LoadingSpinner />
      </Box>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={ANIMATION_VARIANTS.container}
    >
      <Box
        {...GLASSMORPHISM_STYLE}
        p={2}
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
        <VStack spacing={2} align="stretch">
          <motion.div variants={ANIMATION_VARIANTS.item}>
            <ToggleWatchPartyButton
              isVisible={isVisible}
              onToggle={onToggleVisibility}
            />
          </motion.div>

          {isVisible && (
            <>
              {!watchPartyId && !hasJoined && (
                <motion.div variants={ANIMATION_VARIANTS.item}>
                  <CreateJoinSection
                    movieId={movieId}
                    movieTitle={movieTitle}
                    movieDuration={movieDuration}
                    movieThumbnail={movieThumbnail}
                    onWatchPartyCreated={onWatchPartyCreated}
                    onJoinParty={onJoinParty}
                  />
                </motion.div>
              )}

              {watchPartyId && (
                <motion.div variants={ANIMATION_VARIANTS.item}>
                  <ActivePartySection
                    watchPartyId={watchPartyId}
                    hasJoined={hasJoined}
                    userId={userId}
                  />
                </motion.div>
              )}

              {(isMobile || !watchPartyId) && (
                <motion.div variants={ANIMATION_VARIANTS.item}>
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
              )}
            </>
          )}
        </VStack>
      </Box>
    </motion.div>
  );
};

export default memo(WatchPartySection);