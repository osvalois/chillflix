import React, { useState, useCallback, useMemo } from 'react';
import { useSpring, animated, config } from 'react-spring';
import { Player } from '@lottiefiles/react-lottie-player';
import { useMutation } from 'react-query';
import { useDebounce } from 'use-debounce';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  useToast,
  IconButton,
  Container,
  useColorModeValue,
  Heading,
  Badge,
  Flex,
  Tooltip,
  Progress,
  Divider,
  Avatar,
  AvatarGroup,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Switch,
} from '@chakra-ui/react';
import {
  AddIcon,
  CloseIcon,
} from '@chakra-ui/icons';
import {
  Users,
  PartyPopper,
  Eye,
  Calendar,
  Clock,
  Settings,
  MessageCircle,
  Lock,
  Globe,
} from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useSound } from 'use-sound';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface CreateWatchPartyProps {
  movieId: string;
  movieTitle?: string;
  movieDuration?: number;
  movieThumbnail?: string;
  onWatchPartyCreated: (partyId: string) => void;
  onCancel?: () => void;
  maxParticipants?: number;
  defaultStartTime?: Date;
}

interface PartyUser {
  id: string;
  name?: string;
  avatar?: string;
  role?: 'host' | 'guest';
  status?: 'pending' | 'accepted' | 'declined';
}

interface PartySettings {
  isPrivate: boolean;
  allowChat: boolean;
  autoStart: boolean;
  waitForAll: boolean;
  scheduledTime?: Date;
}

const LOTTIE_PARTY_ANIMATION = {
  path: '/animations/party.json',
  autoplay: true,
  loop: true
};

const PartyUserInput = ({ 
  user, 
  onChange, 
  onRemove, 
  isMain,
}: { 
  user: PartyUser; 
  onChange: (value: string) => void;
  onRemove: () => void;
  isMain: boolean;
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const [isFocused, setIsFocused] = useState(false);

  const springProps = useSpring({
    scale: isFocused ? 1.02 : 1,
    borderColor: isFocused ? '#805AD5' : borderColor,
    config: config.gentle
  });

  const statusColors = {
    pending: 'yellow',
    accepted: 'green',
    declined: 'red'
  };

  return (
    <animated.div style={springProps}>
      <Box
        bg={bgColor}
        borderRadius="xl"
        p={6}
        boxShadow="sm"
        border="1px solid"
        borderColor={borderColor}
        position="relative"
        transition="all 0.2s"
        _hover={{
          boxShadow: 'md',
          transform: 'translateY(-1px)'
        }}
      >
        <HStack spacing={4}>
          <Avatar
            size="sm"
            name={user.name || user.id}
            src={user.avatar}
            bg="purple.500"
          />
          <Box flex={1}>
            <Input
              value={user.id}
              onChange={(e) => onChange(e.target.value)}
              placeholder={isMain ? "Enter your user ID" : "Enter friend's user ID"}
              variant="filled"
              size="lg"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              _focus={{
                borderColor: 'purple.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)'
              }}
            />
            {user.name && (
              <Text fontSize="sm" color="gray.500" mt={1}>
                {user.name}
              </Text>
            )}
          </Box>
          
          {!isMain && (
            <HStack>
              {user.status && (
                <Badge colorScheme={statusColors[user.status]}>
                  {user.status}
                </Badge>
              )}
              <Tooltip label="Remove user">
                <IconButton
                  aria-label="Remove user"
                  icon={<CloseIcon />}
                  onClick={onRemove}
                  variant="ghost"
                  colorScheme="red"
                  size="sm"
                />
              </Tooltip>
            </HStack>
          )}
        </HStack>
      </Box>
    </animated.div>
  );
};

const SchedulePicker = ({
  value,
  onChange
}: {
  value?: Date;
  onChange: (date: Date) => void;
}) => {
  const now = new Date();
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 0; i < 48; i++) {
      const date = new Date(now);
      date.setMinutes(i * 30);
      slots.push(date);
    }
    return slots;
  }, [now]);

  return (
    <VStack align="stretch" spacing={3}>
      <Text fontWeight="medium">Select start time</Text>
      <Box maxH="300px" overflowY="auto">
        {timeSlots.map((slot) => (
          <Button
            key={slot.toISOString()}
            variant={value?.getTime() === slot.getTime() ? 'solid' : 'ghost'}
            colorScheme="purple"
            size="sm"
            width="100%"
            justifyContent="start"
            leftIcon={<Clock size={14} />}
            onClick={() => onChange(slot)}
            isDisabled={slot < now}
          >
            {dayjs(slot).format('h:mm A')}
            {slot < now && ' (Passed)'}
          </Button>
        ))}
      </Box>
    </VStack>
  );
};

export const CreateWatchParty: React.FC<CreateWatchPartyProps> = ({
  movieId,
  movieTitle = 'Movie',
  movieDuration,
  onWatchPartyCreated,
  onCancel,
  maxParticipants = 10,
  defaultStartTime
}) => {
  const [users, setUsers] = useState<PartyUser[]>([{ id: '', role: 'host' }]);
  const [debouncedUsers] = useDebounce(users, 300);
  const [playSuccess] = useSound('/success.mp3', { volume: 0.5 });
  const [playError] = useSound('/error.mp3', { volume: 0.25 });
  const [settings, setSettings] = useState<PartySettings>({
    isPrivate: true,
    allowChat: true,
    autoStart: false,
    waitForAll: true,
    scheduledTime: defaultStartTime
  });
  const settingsModal = useDisclosure();
  const toast = useToast();
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
    async (request: { 
      movie_id: string; 
      users: string[]; 
      settings: PartySettings;
    }) => {
      const response = await axios.post('http://127.0.0.1:9090/party/create', request);
      return response.data;
    },
    {
      onSuccess: (data) => {
        playSuccess();
        onWatchPartyCreated(data.id);
        toast({
          title: 'Watch Party Created!',
          description: 'Invites have been sent to all participants.',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      },
      onError: () => {
        playError();
        toast({
          title: 'Error Creating Watch Party',
          description: 'Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      }
    }
  );

  const handleAddUser = useCallback(() => {
    if (users.length < maxParticipants) {
      setUsers(prev => [...prev, { id: '', role: 'guest', status: 'pending' }]);
    }
  }, [users.length, maxParticipants]);

  const handleRemoveUser = useCallback((index: number) => {
    setUsers(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleUserChange = useCallback((index: number, value: string) => {
    setUsers(prev => prev.map((user, i) => 
      i === index ? { ...user, id: value } : user
    ));
  }, []);

  useHotkeys('ctrl+enter', () => {
    if (!mutation.isLoading) {
      handleCreateParty();
    }
  });

  const handleCreateParty = async () => {
    const validUsers = debouncedUsers.filter(user => user.id.trim());
    
    if (validUsers.length === 0) {
      toast({
        title: 'No Valid Users',
        description: 'Please enter at least one valid user ID.',
        status: 'warning',
        duration: 3000,
        isClosable: true
      });
      return;
    }

    mutation.mutate({
      movie_id: movieId,
      users: validUsers.map(u => u.id),
      settings
    });
  };

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

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  // Progress calculation
  const progress = useMemo(() => {
    const steps = [
      users.some(u => u.id.trim()), // At least one user
      settings.scheduledTime !== undefined, // Time selected
      settings.isPrivate !== undefined // Settings configured
    ];
    return (steps.filter(Boolean).length / steps.length) * 100;
  }, [users, settings]);

  return (
    <Box
      minH="100vh"
      w="100%"
      bgGradient={bgGradient}
      py={8}
      px={4}
    >
      <Container maxW="4xl">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
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
                        src={LOTTIE_PARTY_ANIMATION}
                        style={{ width: '60px', height: '60px' }}
                      />
                    </Box>
                    <VStack align="start" spacing={1}>
                      <Heading size="lg" bgGradient="linear(to-r, purple.500, pink.500)" bgClip="text">
                        Create Watch Party
                      </Heading>
                      <Text color="gray.500">
                        Watch "{movieTitle}" together with friends
                      </Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={3}>
                    {settings.scheduledTime && (
                      <Tooltip label={dayjs(settings.scheduledTime).format('MMM D, YYYY h:mm A')}>
                        <Badge 
                          colorScheme="blue" 
                          p={2} 
                          borderRadius="md"
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <Calendar size={14} />
                          {dayjs(settings.scheduledTime).fromNow()}
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
                          <Eye size={14} />
                          {Math.floor(movieDuration / 60)}min
                        </Badge>
                      </Tooltip>
                    )}

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

                {/* Party Settings Summary */}
                <HStack spacing={4} wrap="wrap">
                  <Badge
                    colorScheme={settings.isPrivate ? 'red' : 'green'}
                    variant="subtle"
                    p={2}
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    {settings.isPrivate ? <Lock size={14} /> : <Globe size={14} />}
                    {settings.isPrivate ? 'Private' : 'Public'} Party
                  </Badge>
                  <Badge
                    colorScheme={settings.allowChat ? 'green' : 'gray'}
                    variant="subtle"
                    p={2}
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <MessageCircle size={14} />
                    Chat {settings.allowChat ? 'Enabled' : 'Disabled'}
                  </Badge>
                  <Badge
                    colorScheme={settings.waitForAll ? 'orange' : 'blue'}
                    variant="subtle"
                    p={2}
                    borderRadius="md"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <Users size={14} />
                    {settings.waitForAll ? 'Wait for All' : 'Start Anytime'}
                  </Badge>
                </HStack>

                {/* Users Section */}
                <VStack spacing={4} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="medium" color="gray.600">
                      Party Participants ({users.length}/{maxParticipants})
                    </Text>
                    <AvatarGroup size="sm" max={3}>
                      {users.filter(u => u.id).map((user, idx) => (
                        <Avatar
                          key={idx}
                          name={user.name || user.id}
                          src={user.avatar}
                        />
                      ))}
                    </AvatarGroup>
                  </HStack>

                  <AnimatePresence>
                    {users.map((user, index) => (
                      <motion.div
                        key={index}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: 20 }}
                      >
                        <PartyUserInput
                          user={user}
                          onChange={(value) => handleUserChange(index, value)}
                          onRemove={() => handleRemoveUser(index)}
                          isMain={index === 0}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {users.length < maxParticipants && (
                    <Button
                      leftIcon={<AddIcon />}
                      variant="ghost"
                      colorScheme="purple"
                      onClick={handleAddUser}
                      w="full"
                      h={16}
                      border="2px dashed"
                      borderColor="purple.200"
                      _hover={{
                        bg: 'purple.50',
                        borderColor: 'purple.300'
                      }}
                      transition="all 0.2s"
                    >
                      Add Another Friend ({maxParticipants - users.length} spots left)
                    </Button>
                  )}
                </VStack>

                {/* Schedule Section */}
                <Box>
                  <SchedulePicker
                    value={settings.scheduledTime}
                    onChange={(date) => setSettings(prev => ({
                      ...prev,
                      scheduledTime: date
                    }))}
                  />
                </Box>

                {/* Action Buttons */}
                <VStack spacing={4}>
                  <HStack spacing={4} width="100%">
                    <Button
                      onClick={handleCreateParty}
                      isLoading={mutation.isLoading}
                      loadingText="Creating Party..."
                      colorScheme="purple"
                      size="lg"
                      flex={1}
                      leftIcon={<PartyPopper size={20} />}
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg'
                      }}
                      _active={{
                        transform: 'translateY(0)',
                        boxShadow: 'md'
                      }}
                    >
                      Create
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
                    Pro tip: Press Ctrl + Enter to create party
                  </Text>
                </VStack>
              </VStack>
            </Box>
          </Box>
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
              <Text>Party Settings</Text>
            </HStack>
          </ModalHeader>
          <ModalBody>
            <VStack spacing={6} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="private-party" mb="0" flex="1">
                  <HStack>
                    <Lock size={16} />
                    <Text>Private Party</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    Only invited users can join
                  </Text>
                </FormLabel>
                <Switch
                  id="private-party"
                  colorScheme="purple"
                  isChecked={settings.isPrivate}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    isPrivate: e.target.checked
                  }))}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="allow-chat" mb="0" flex="1">
                  <HStack>
                    <MessageCircle size={16} />
                    <Text>Enable Chat</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    Allow participants to chat during the movie
                  </Text>
                </FormLabel>
                <Switch
                  id="allow-chat"
                  colorScheme="purple"
                  isChecked={settings.allowChat}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    allowChat: e.target.checked
                  }))}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="wait-all" mb="0" flex="1">
                  <HStack>
                    <Users size={16} />
                    <Text>Wait for All</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    Wait for all participants before starting
                  </Text>
                </FormLabel>
                <Switch
                  id="wait-all"
                  colorScheme="purple"
                  isChecked={settings.waitForAll}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    waitForAll: e.target.checked
                  }))}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="auto-start" mb="0" flex="1">
                  <HStack>
                    <Clock size={16} />
                    <Text>Auto Start</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    Start automatically at scheduled time
                  </Text>
                </FormLabel>
                <Switch
                  id="auto-start"
                  colorScheme="purple"
                  isChecked={settings.autoStart}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    autoStart: e.target.checked
                  }))}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="purple" onClick={settingsModal.onClose}>
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
   
    </Box>
  );
};

export default CreateWatchParty;