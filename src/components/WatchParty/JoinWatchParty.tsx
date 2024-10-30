import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSpring, animated, config } from 'react-spring';
import { Player } from '@lottiefiles/react-lottie-player';
import { useMutation } from 'react-query';
import { useSound } from 'use-sound';
import { useHotkeys } from 'react-hotkeys-hook';
import { useInView } from 'react-intersection-observer';
import axios from 'axios';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  useToast,
  Container,
  useColorModeValue,
  Heading,
  Badge,
  IconButton,
  Tooltip,
  Flex,
  useDisclosure,
  Avatar,
  Progress,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  FormHelperText,
  Switch,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import {
  Users,
  PartyPopper,
  UserPlus,
  Clock,
  Film,
  Calendar,
  MessageCircle,
  Settings,
  Shield,
} from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const LOTTIE_JOIN_ANIMATION = {
  path: '/animations/join-party.json',
  autoplay: true,
  loop: true
};

interface JoinWatchPartyProps {
  partyId?: string;
  movieTitle?: string;
  hostName?: string;
  startTime?: Date;
  onJoin: () => void;
  onCancel?: () => void;
  maxParticipants?: number;
  currentParticipants?: number;
  movieDuration?: number;
  movieThumbnail?: string;
  isPrivate?: boolean;
  chatEnabled?: boolean;
}

interface JoinPartyRequest {
  partyId: string;
  userId: string;
  nickname?: string;
  preferences?: {
    notifications: boolean;
    autoSync: boolean;
  };
}

interface PartyPreferences {
  notifications: boolean;
  autoSync: boolean;
  quality: 'auto' | 'high' | 'medium' | 'low';
  volume: number;
}

const UserProfileInput = ({
  userId,
  nickname,
  onUserIdChange,
  onNicknameChange,
  avatar
}: {
  userId: string;
  nickname: string;
  onUserIdChange: (value: string) => void;
  onNicknameChange: (value: string) => void;
  avatar?: string;
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [isFocused, setIsFocused] = useState(false);

  const springProps = useSpring({
    scale: isFocused ? 1.02 : 1,
    borderColor: isFocused ? '#805AD5' : borderColor,
    config: config.gentle
  });

  return (
    <animated.div style={springProps}>
      <Box
        bg={bgColor}
        borderRadius="xl"
        p={6}
        boxShadow="sm"
        border="1px solid"
        borderColor={borderColor}
        transition="all 0.2s"
        _hover={{
          boxShadow: 'md',
          transform: 'translateY(-1px)'
        }}
      >
        <VStack spacing={4}>
          <Avatar
            size="lg"
            name={nickname || userId}
            src={avatar}
            bg="purple.500"
          />
          <VStack spacing={4} w="full">
            <FormControl isRequired>
              <FormLabel>Party ID</FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <Shield size={20} className="text-gray-400" />
                </InputLeftElement>
                <Input
                  value={userId}
                  onChange={(e) => onUserIdChange(e.target.value)}
                  placeholder="Enter your user ID"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel>Nickname (Optional)</FormLabel>
              <InputGroup>
                <InputLeftElement>
                  <UserPlus size={20} className="text-gray-400" />
                </InputLeftElement>
                <Input
                  value={nickname}
                  onChange={(e) => onNicknameChange(e.target.value)}
                  placeholder="How should we call you?"
                />
              </InputGroup>
              <FormHelperText>
                This will be displayed to other participants
              </FormHelperText>
            </FormControl>
          </VStack>
        </VStack>
      </Box>
    </animated.div>
  );
};

export const JoinWatchParty: React.FC<JoinWatchPartyProps> = ({
  partyId = '',
  movieTitle = 'Movie',
  hostName,
  startTime,
  onJoin,
  onCancel,
  maxParticipants = 10,
  currentParticipants = 0,
  movieDuration,
  isPrivate = true,
  chatEnabled = true
}) => {
  const [userId, setUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const [enteredPartyId] = useState(partyId);
  const [preferences, setPreferences] = useState<PartyPreferences>({
    notifications: true,
    autoSync: true,
    quality: 'auto',
    volume: 100
  });
  const settingsModal = useDisclosure();
  const toast = useToast();
  const [playSuccess] = useSound('/success.mp3', { volume: 0.5 });
  const [playError] = useSound('/error.mp3', { volume: 0.25 });
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  const bgGradient = useColorModeValue(
    'linear(to-br, purple.50, pink.50)',
    'linear(to-br, gray.900, purple.900)'
  );

  const cardBg = useColorModeValue('white', 'gray.800');

  const mutation = useMutation(
    async (request: JoinPartyRequest) => {
      const response = await axios.post(
        `http://127.0.0.1:9090/party/${request.partyId}/join`,
        {
          id: request.userId,
          nickname: request.nickname,
          preferences: request.preferences
        }
      );
      return response.data;
    },
    {
      onSuccess: () => {
        playSuccess();
        toast({
          title: 'Joined Successfully! 🎉',
          description: 'Welcome to the watch party!',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right',
        });
        onJoin();
      },
      onError: () => {
        playError();
        toast({
          title: 'Failed to Join',
          description: 'Please check your credentials and try again.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      }
    }
  );

  // Progress calculation
  const progress = useMemo(() => {
    const steps = [
      !!enteredPartyId,
      !!userId,
      !!preferences
    ];
    return (steps.filter(Boolean).length / steps.length) * 100;
  }, [enteredPartyId, userId, preferences]);

  const handleJoin = () => {
    if (!userId.trim() || !enteredPartyId.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    mutation.mutate({
      partyId: enteredPartyId,
      userId,
      nickname: nickname.trim() || undefined,
      preferences
    });
  };

  useHotkeys('ctrl+enter', handleJoin, { enabled: !mutation.isLoading });

  const springProps = useSpring({
    scale: mutation.isLoading ? 0.98 : 1,
    config: { tension: 300, friction: 10 }
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 }
    }
  };

  return (
    <Box
      minH="100vh"
      w="100%"
      bgGradient={bgGradient}
      py={8}
      px={4}
    >
      <Container maxW="2xl">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "exit"}
        >
          <animated.div style={springProps}>
            <Box
              bg={cardBg}
              borderRadius="2xl"
              boxShadow="xl"
              overflow="hidden"
            >
              <Progress
                value={progress}
                size="xs"
                colorScheme="purple"
                borderRadius="2xl 2xl 0 0"
              />

              <Box p={1}>
                <VStack spacing={6} align="stretch">
                  {/* Header Section */}
                  <Flex justify="space-between" align="center">
                    <HStack spacing={4}>
                      <Box position="relative">
                        <Player
                          src={LOTTIE_JOIN_ANIMATION}
                          style={{ width: '60px', height: '60px' }}
                        />
                      </Box>
                      <VStack align="start" spacing={1}>
                        <Heading size="lg" bgGradient="linear(to-r, purple.500, pink.500)" bgClip="text">
                          Join Watch Party
                        </Heading>
                        <Text color="gray.500">
                          Join "{movieTitle}" watch party
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack spacing={3}>
                      {startTime && (
                        <Tooltip label={dayjs(startTime).format('MMM D, YYYY h:mm A')}>
                          <Badge
                            colorScheme="blue"
                            p={2}
                            borderRadius="md"
                            display="flex"
                            alignItems="center"
                            gap={2}
                          >
                            <Calendar size={14} />
                            {dayjs(startTime).fromNow()}
                          </Badge>
                        </Tooltip>
                      )}

                      {movieDuration && (
                        <Tooltip label="Movie Duration">
                          <Badge
                            colorScheme="purple"
                            p={2}
                            borderRadius="md"
                            display="flex"
                            alignItems="center"
                            gap={2}
                          >
                            <Clock size={14} />
                            {Math.floor(movieDuration / 60)}min
                          </Badge>
                        </Tooltip>
                      )}

                      <Tooltip label={`${currentParticipants}/${maxParticipants} participants`}>
                        <Badge
                          colorScheme={currentParticipants >= maxParticipants ? 'red' : 'green'}
                          p={2}
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <Users size={14} />
                          {currentParticipants}/{maxParticipants}
                        </Badge>
                      </Tooltip>

                      <Tooltip label="Party Settings">
                        <IconButton
                          aria-label="Party Settings"
                          icon={<Settings size={20} />}
                          variant="ghost"
                          colorScheme="purple"
                          onClick={settingsModal.onOpen}
                        />
                      </Tooltip>
                    </HStack>
                  </Flex>

                  <Divider />

                  {/* Party Features */}
                  <HStack spacing={4} wrap="wrap">
                    <Badge
                      colorScheme={isPrivate ? 'red' : 'green'}
                      variant="subtle"
                      p={2}
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Shield size={14} />
                      {isPrivate ? 'Private' : 'Public'} Party
                    </Badge>
                    <Badge
                      colorScheme={chatEnabled ? 'green' : 'gray'}
                      variant="subtle"
                      p={2}
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <MessageCircle size={14} />
                      Chat {chatEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </HStack>

                  {/* User Profile Section */}
                  <UserProfileInput
                    userId={userId}
                    nickname={nickname}
                    onUserIdChange={setUserId}
                    onNicknameChange={setNickname}
                  />

                  {/* Host Info */}
                  {hostName && (
                    <HStack
                      spacing={3}
                      p={4}
                      bg={useColorModeValue('purple.50', 'purple.900')}
                      borderRadius="lg"
                    >
                      <Avatar size="sm" name={hostName} />
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">Hosted by {hostName}</Text>
                        <Text fontSize="sm" color="gray.500">
                          Party Creator
                        </Text>
                      </VStack>
                    </HStack>
                  )}

                  {/* Action Buttons */}
                  <VStack spacing={4}>
                    <HStack spacing={4} width="100%">
                      <Button
                        onClick={handleJoin}
                        isLoading={mutation.isLoading}
                        loadingText="Joining Party..."
                        colorScheme="purple"
                        size="lg"
                        flex={1}
                        leftIcon={<PartyPopper size={20} />}
                        isDisabled={currentParticipants >= maxParticipants}
                        _hover={{
                          transform: 'translateY(-2px)',
                          boxShadow: 'lg'
                        }}
                        _active={{
                          transform: 'translateY(0)',
                          boxShadow: 'md'
                        }}
                      >
                        Join
                      </Button>
                      {onCancel && (
                        <Button
                          onClick={onCancel}
                          variant="ghost"
                          size="lg"
                          isDisabled={mutation.isLoading}
                        >
                          Cancel
                        </Button>
                      )}
                    </HStack>

                    {/* Keyboard Shortcut Hint */}
                    <Text
                      fontSize="sm"
                      color="gray.500"
                      textAlign="center"
                    >
                      Pro tip: Press Ctrl + Enter to join
                    </Text>
                  </VStack>
                </VStack>
              </Box>
            </Box>
          </animated.div>
        </motion.div>
      </Container>

      {/* Settings Modal */}
      <Modal
        isOpen={settingsModal.isOpen}
        onClose={settingsModal.onClose}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Settings size={20} />
              <Text>Viewing Preferences</Text>
            </HStack>
          </ModalHeader>
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="notifications" mb="0" flex="1">
                  <HStack>
                    <MessageCircle size={16} />
                    <Text>Party Notifications</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    Receive notifications about party events
                  </Text>
                </FormLabel>
                <Switch
                  id="notifications"
                  colorScheme="purple"
                  isChecked={preferences.notifications}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    notifications: e.target.checked
                  }))}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="auto-sync" mb="0" flex="1">
                  <HStack>
                    <Clock size={16} />
                    <Text>Auto-Sync Playback</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    Keep video synchronized with other participants
                  </Text>
                </FormLabel>
                <Switch
                  id="auto-sync"
                  colorScheme="purple"
                  isChecked={preferences.autoSync}
                  onChange={(e) => setPreferences(prev => ({
                    ...prev,
                    autoSync: e.target.checked
                  }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>
                  <HStack>
                    <Film size={16} />
                    <Text>Video Quality</Text>
                  </HStack>
                </FormLabel>
                <HStack spacing={4}>
                  {['auto', 'high', 'medium', 'low'].map((quality) => (
                    <Button
                      key={quality}
                      size="sm"
                      variant={preferences.quality === quality ? 'solid' : 'outline'}
                      colorScheme="purple"
                      onClick={() => setPreferences(prev => ({
                        ...prev,
                        quality: quality as PartyPreferences['quality']
                      }))}
                    >
                      {quality.charAt(0).toUpperCase() + quality.slice(1)}
                    </Button>
                  ))}
                </HStack>
                <FormHelperText>
                  Select based on your internet connection
                </FormHelperText>
              </FormControl>

            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" onClick={settingsModal.onClose}>
              Save Preferences
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default JoinWatchParty;