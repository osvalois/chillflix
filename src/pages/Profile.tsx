import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Avatar,
  Button,
  useColorMode,
  useColorModeValue,
  Container,
  Divider,
  Grid,
  GridItem,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Tooltip,
  Badge,
  Skeleton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Progress,
  keyframes,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { 
  Edit2, Settings, Clock, Heart,
  Sun, Moon, Globe, Github,
  Twitter, Award,
  MessageCircle, Share2,
  Star, ChevronRight, Film,
} from 'lucide-react';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import { rgba } from 'polished';

// Types and Interfaces
interface ProfileStats {
  watchlist: number;
  favorites: number;
  watchTime: string;
  following: number;
  followers: number;
  reviews: number;
  level: number;
  exp: number;
  nextLevelExp: number;
}

interface Achievement {
  id: string;
  icon: React.ReactNode;
  name: string;
  description: string;
  date: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserProfile {
  username: string;
  email: string;
  avatarUrl: string;
  joinDate: string;
  stats: ProfileStats;
  bio: string;
  status: 'online' | 'offline' | 'watching';
  achievements: Achievement[];
  recentActivity: Array<{
    id: string;
    type: 'watch' | 'review' | 'like' | 'list';
    content: string;
    timestamp: string;
  }>;
  socialLinks: {
    github?: string;
    twitter?: string;
  };
}

interface Language {
  code: string;
  name: string;
  flag: string;
}

const pulseKeyframe = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const MotionBox = motion(Box as any);
const MotionFlex = motion(Flex as any);

// Constants
const LANGUAGES: Language[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
];

const RARITY_COLORS = {
  common: 'gray.400',
  rare: 'blue.400',
  epic: 'purple.400',
  legendary: 'orange.400'
};

// Components
const StatusIndicator: React.FC<{ status: UserProfile['status'] }> = ({ status }) => {
  const statusColors = {
    online: 'green.400',
    offline: 'gray.400',
    watching: 'purple.400'
  };

  const statusText = {
    online: 'Online',
    offline: 'Offline',
    watching: 'Watching Now'
  };

  const bgColor = useColorModeValue('white', 'gray.800');

  return (
    <Tag size="sm" variant="subtle" bg={bgColor} boxShadow="sm">
      <Box
        w="2"
        h="2"
        borderRadius="full"
        bg={statusColors[status]}
        mr="2"
        animation={status === 'watching' ? `${pulseKeyframe} 2s infinite` : undefined}
      />
      <TagLabel>{statusText[status]}</TagLabel>
    </Tag>
  );
};

const StatCard: React.FC<{ 
  icon: React.ReactNode;
  label: string;
  value: string | number;
  isLoading?: boolean;
  subtitle?: string;
  trend?: number;
}> = ({
  icon,
  label,
  value,
  isLoading = false,
  subtitle,
  trend
}) => {
  const controls = useAnimation();
  const bgColor = useColorModeValue(
    'rgba(255, 255, 255, 0.08)',
    'rgba(0, 0, 0, 0.08)'
  );
  const borderColor = useColorModeValue(
    'rgba(255, 255, 255, 0.15)',
    'rgba(255, 255, 255, 0.05)'
  );
  const iconColor = useColorModeValue('purple.500', 'purple.300');

  const handleHover = async () => {
    await controls.start({
      scale: 1.05,
      transition: { duration: 0.2 }
    });
  };

  const handleHoverEnd = async () => {
    await controls.start({
      scale: 1,
      transition: { duration: 0.2 }
    });
  };

  return (
    <MotionBox
      borderRadius="2xl"
      bg={bgColor}
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor={borderColor}
      boxShadow={`0 8px 32px 0 ${rgba(0, 0, 0, 0.1)}`}
      animate={controls}
      onHoverStart={handleHover}
      onHoverEnd={handleHoverEnd}
      position="relative"
      overflow="hidden"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '2xl',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
        opacity: 0.5,
        pointerEvents: 'none'
      }}
    >
      <VStack spacing={3} position="relative">
        <Box
          color={iconColor}
          transform="scale(1.2)"
          transition="all 0.3s ease"
          _hover={{ transform: "scale(1.4) rotate(10deg)" }}
        >
          {icon}
        </Box>
        <Skeleton isLoaded={!isLoading} speed={2} borderRadius="md">
          <Text fontSize="3xl" fontWeight="bold" textAlign="center">
            {value}
            {trend && (
              <Text
                as="span"
                fontSize="sm"
                color={trend > 0 ? 'green.400' : 'red.400'}
                ml={2}
              >
                {trend > 0 ? '+' : ''}{trend}%
              </Text>
            )}
          </Text>
        </Skeleton>
        <VStack spacing={1}>
          <Skeleton isLoaded={!isLoading} speed={2}>
            <Text color="gray.500" fontSize="sm" fontWeight="medium">
              {label}
            </Text>
          </Skeleton>
          {subtitle && (
            <Skeleton isLoaded={!isLoading} speed={2}>
              <Text color="gray.400" fontSize="xs">
                {subtitle}
              </Text>
            </Skeleton>
          )}
        </VStack>
      </VStack>
    </MotionBox>
  );
};

const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <HStack
      spacing={3}
      p={3}
      bg={bgColor}
      borderRadius="lg"
      boxShadow="sm"
      border="1px solid"
      borderColor={useColorModeValue('gray.100', 'gray.700')}
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
      transition="all 0.2s"
    >
      <Box color={RARITY_COLORS[achievement.rarity]}>
        {achievement.icon}
      </Box>
      <VStack align="start" spacing={0}>
        <Text fontWeight="semibold" fontSize="sm">
          {achievement.name}
        </Text>
        <Text color="gray.500" fontSize="xs">
          {achievement.description}
        </Text>
      </VStack>
      <Tag
        size="sm"
        colorScheme={achievement.rarity === 'legendary' ? 'orange' : 'gray'}
        variant="subtle"
      >
        {achievement.rarity}
      </Tag>
    </HStack>
  );
};

const Profile: React.FC = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isLoading, setIsLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(LANGUAGES[0]);
  const achievementsDisclosure = useDisclosure();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Theme colors
  const glassBackground = useColorModeValue(
    'rgba(255, 255, 255, 0.03)',
    'rgba(0, 0, 0, 0.03)'
  );
  
  const borderColor = useColorModeValue(
    'rgba(255, 255, 255, 0.15)',
    'rgba(255, 255, 255, 0.05)'
  );

  const headerBg = useColorModeValue(
    'linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
    'linear-gradient(to right, rgba(0,0,0,0.05), rgba(0,0,0,0.02))'
  );

  // Mock user data
  const userProfile: UserProfile = {
    username: "MovieLover123",
    email: "user@example.com",
    avatarUrl: "/api/placeholder/150/150",
    joinDate: "January 2024",
    status: 'watching',
    bio: "Passionate about cinema and storytelling. Always exploring new genres and perspectives in film.",
    stats: {
      watchlist: 47,
      favorites: 123,
      watchTime: "320h",
      following: 234,
      followers: 567,
      reviews: 89,
      level: 42,
      exp: 8750,
      nextLevelExp: 10000
    },
    achievements: [
      {
        id: '1',
        icon: <Award size={20} />,
        name: 'Cinephile Elite',
        description: 'Watched 1000+ hours of content',
        date: '2024-01-15',
        rarity: 'legendary'
      },
      {
        id: '2',
        icon: <Star size={20} />,
        name: 'Review Master',
        description: 'Written 100 quality reviews',
        date: '2024-01-10',
        rarity: 'epic'
      },
      // Add more achievements...
    ],
    recentActivity: [
      {
        id: '1',
        type: 'watch',
        content: 'Watched "Inception"',
        timestamp: '2h ago'
      },
      {
        id: '2',
        type: 'review',
        content: 'Reviewed "The Dark Knight"',
        timestamp: '5h ago'
      },
      // Add more activity...
    ],
    socialLinks: {
      github: "https://github.com/movielover",
      twitter: "https://twitter.com/movielover"
    }
  };

  const profileControls = {
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

  return (
    <ParallaxProvider>
      <Container maxW="7xl" pt="100px">
        <Parallax translateY={[-20, 20]}>
          <MotionFlex
            w="full"
            borderRadius="3xl"
            overflow="hidden"
            bg={glassBackground}
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor={borderColor}
            boxShadow={`0 8px 32px 0 ${rgba(0, 0, 0, 0.1)}`}
            position="relative"
            initial="hidden"
            animate="visible"
            variants={profileControls}
          >
            {/* Header Controls */}
            <Flex
              bg={headerBg}
              p={4}
              justifyContent="space-between"
              alignItems="center"
              borderBottom="1px solid"
              borderColor={borderColor}
            >
              <HStack spacing={4}>
                <StatusIndicator status={userProfile.status} />
                <Badge
                  variant="subtle"
                  colorScheme="purple"
                  px={3}
                  py={1}
                  borderRadius="full"
                >
                  Level {userProfile.stats.level}
                </Badge>
              </HStack>
              
              <HStack spacing={2}>
              <Menu>
                  <Tooltip 
                    label={`${currentLanguage.name} (Click to change)`}
                    hasArrow 
                    placement="bottom"
                    openDelay={400}
                  >
                    <MenuButton
                      as={IconButton}
                      icon={
                        <HStack spacing={1}>
                          <Globe size={16} />
                          <Text fontSize="sm">{currentLanguage.flag}</Text>
                        </HStack>
                      }
                      variant="ghost"
                      colorScheme="purple"
                      size="sm"
                      _hover={{
                        bg: useColorModeValue('whiteAlpha.200', 'blackAlpha.200'),
                        transform: 'translateY(-1px)'
                      }}
                      _active={{
                        transform: 'translateY(0)'
                      }}
                      transition="all 0.2s"
                    />
                  </Tooltip>
                  <MenuList
                    bg={useColorModeValue('white', 'gray.800')}
                    borderColor={useColorModeValue('gray.200', 'gray.600')}
                    boxShadow="lg"
                    borderRadius="xl"
                    p={2}
                    minW="160px"
                  >
                    <Text
                      px={3}
                      py={2}
                      fontSize="xs"
                      fontWeight="medium"
                      color="gray.500"
                      textTransform="uppercase"
                    >
                      Select Language
                    </Text>
                    {LANGUAGES.map((lang) => (
                      <MenuItem
                        key={lang.code}
                        onClick={() => setCurrentLanguage(lang)}
                        icon={
                          <Text fontSize="xl" lineHeight="1">
                            {lang.flag}
                          </Text>
                        }
                        bg="transparent"
                        borderRadius="md"
                        mb={1}
                        _hover={{
                          bg: useColorModeValue('gray.50', 'gray.700')
                        }}
                        _focus={{
                          bg: useColorModeValue('gray.50', 'gray.700')
                        }}
                        position="relative"
                      >
                        <HStack justify="space-between" flex={1}>
                          <Text>{lang.name}</Text>
                          {currentLanguage.code === lang.code && (
                            <Box
                              w={2}
                              h={2}
                              borderRadius="full"
                              bg="purple.500"
                            />
                          )}
                        </HStack>
                      </MenuItem>
                    ))}
                    <Divider my={2} />
                  </MenuList>
                </Menu>
                <Tooltip label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`} hasArrow>
                  <IconButton
                    aria-label="Toggle color mode"
                    icon={colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    onClick={toggleColorMode}
                    variant="ghost"
                    colorScheme="purple"
                    size="sm"
                  />
                </Tooltip>
              </HStack>
            </Flex>

            <Box p={8}>
              {/* Profile Header */}
              <Flex 
                direction={{ base: "column", md: "row" }} 
                align="center" 
                gap={8} 
                position="relative"
              >
                <MotionBox
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Avatar
                    size="2xl"
                    src={userProfile.avatarUrl}
                    name={userProfile.username}
                    border="4px solid"
                    borderColor="purple.400"
                    boxShadow="xl"
                  />
                  <Box
                    position="absolute"
                    bottom="-2"
                    right="-2"
                    bg={userProfile.status === 'online' ? 'green.400' : 'gray.400'}
                    w="4"
                    h="4"
                    borderRadius="full"
                    border="3px solid"
                    borderColor={useColorModeValue('white', 'gray.800')}
                  />
                </MotionBox>
                
                <VStack align={{ base: "center", md: "start" }} spacing={4} flex={1}>
                  <HStack spacing={4} flexWrap="wrap" justify={{ base: "center", md: "start" }}>
                    <Text fontSize="3xl" fontWeight="bold">{userProfile.username}</Text>
                    <HStack spacing={2}>
                      <Badge colorScheme="purple" variant="solid" px={2} py={1}>
                        PRO
                      </Badge>
                      <Badge colorScheme="yellow" variant="subtle" px={2} py={1}>
                        <HStack spacing={1}>
                          <Award size={12} />
                          <Text>Top Reviewer</Text>
                        </HStack>
                      </Badge>
                    </HStack>
                  </HStack>

                  <Text
                    color="gray.500"
                    textAlign={{ base: "center", md: "left" }}
                    maxW="600px"
                  >
                    {userProfile.bio}
                  </Text>

                  <HStack spacing={6} flexWrap="wrap" justify={{ base: "center", md: "start" }}>
                    <VStack spacing={1} align="center">
                      <Text fontWeight="bold">{userProfile.stats.followers}</Text>
                      <Text color="gray.500" fontSize="sm">Followers</Text>
                    </VStack>
                    <VStack spacing={1} align="center">
                      <Text fontWeight="bold">{userProfile.stats.following}</Text>
                      <Text color="gray.500" fontSize="sm">Following</Text>
                    </VStack>
                    <VStack spacing={1} align="center">
                      <Text fontWeight="bold">{userProfile.stats.reviews}</Text>
                      <Text color="gray.500" fontSize="sm">Reviews</Text>
                    </VStack>
                  </HStack>

                  <HStack spacing={4}>
                    <Button
                      leftIcon={<Edit2 size={16} />}
                      colorScheme="purple"
                      variant="solid"
                      size="sm"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg',
                      }}
                    >
                      Edit Profile
                    </Button>
                    <Button
                      leftIcon={<Share2 size={16} />}
                      variant="outline"
                      colorScheme="purple"
                      size="sm"
                      _hover={{
                        transform: 'translateY(-2px)',
                        boxShadow: 'lg',
                      }}
                    >
                      Share Profile
                    </Button>
                    <IconButton
                      aria-label="More options"
                      icon={<Settings size={16} />}
                      variant="ghost"
                      colorScheme="purple"
                      size="sm"
                      _hover={{
                        transform: 'translateY(-2px)',
                      }}
                    />
                  </HStack>

                  <HStack spacing={4}>
                    {userProfile.socialLinks?.github && (
                      <IconButton
                        aria-label="GitHub Profile"
                        icon={<Github size={18} />}
                        variant="ghost"
                        colorScheme="purple"
                        size="sm"
                        onClick={() => window.open(userProfile.socialLinks?.github, '_blank')}
                      />
                    )}
                    {userProfile.socialLinks?.twitter && (
                      <IconButton
                        aria-label="Twitter Profile"
                        icon={<Twitter size={18} />}
                        variant="ghost"
                        colorScheme="purple"
                        size="sm"
                        onClick={() => window.open(userProfile.socialLinks?.twitter, '_blank')}
                      />
                    )}
                  </HStack>
                </VStack>
              </Flex>

              {/* Level Progress */}
              <Box mt={8} p={4} borderRadius="xl" bg={useColorModeValue('whiteAlpha.200', 'blackAlpha.200')}>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">Level Progress</Text>
                  <Text fontSize="sm" color="gray.500">
                    {userProfile.stats.exp} / {userProfile.stats.nextLevelExp} XP
                  </Text>
                </HStack>
                <Progress
                  value={(userProfile.stats.exp / userProfile.stats.nextLevelExp) * 100}
                  colorScheme="purple"
                  borderRadius="full"
                  size="sm"
                  hasStripe
                  isAnimated
                />
              </Box>

              <Divider my={8} opacity={0.2} />

              {/* Stats Grid */}
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }}
                gap={6}
                w="full"
                position="relative"
              >
                <GridItem>
                  <StatCard
                    icon={<Film size={24} />}
                    label="Watchlist"
                    value={userProfile.stats.watchlist}
                    isLoading={isLoading}
                    subtitle="Movies to watch"
                    trend={5}
                  />
                </GridItem>
                <GridItem>
                  <StatCard
                    icon={<Heart size={24} />}
                    label="Favorites"
                    value={userProfile.stats.favorites}
                    isLoading={isLoading}
                    subtitle="Loved movies"
                    trend={8}
                  />
                </GridItem>
                <GridItem>
                  <StatCard
                    icon={<Clock size={24} />}
                    label="Watch Time"
                    value={userProfile.stats.watchTime}
                    isLoading={isLoading}
                    subtitle="Total hours"
                    trend={12}
                  />
                </GridItem>
                <GridItem>
                  <StatCard
                    icon={<MessageCircle size={24} />}
                    label="Reviews"
                    value={userProfile.stats.reviews}
                    isLoading={isLoading}
                    subtitle="Written reviews"
                    trend={3}
                  />
                </GridItem>
              </Grid>

              {/* Recent Achievements */}
              <Box mt={8}>
                <HStack justify="space-between" mb={4}>
                  <Text fontSize="lg" fontWeight="bold">Recent Achievements</Text>
                  <Button
                    rightIcon={<ChevronRight size={16} />}
                    variant="ghost"
                    colorScheme="purple"
                    size="sm"
                    onClick={achievementsDisclosure.onOpen}
                  >
                    View All
                  </Button>
                </HStack>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                  {userProfile.achievements.map((achievement) => (
                    <GridItem key={achievement.id}>
                      <AchievementBadge achievement={achievement} />
                    </GridItem>
                  ))}
                </Grid>
              </Box>
            </Box>
          </MotionFlex>
        </Parallax>
      </Container>

      {/* Achievements Drawer */}
      <Drawer
        isOpen={achievementsDisclosure.isOpen}
        placement="right"
        onClose={achievementsDisclosure.onClose}
        size="md"
      >
        <DrawerOverlay backdropFilter="blur(10px)" />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">
            <HStack justify="space-between">
              <Text>Achievements</Text>
              <DrawerCloseButton />
            </HStack>
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4}>
              {userProfile.achievements.map((achievement) => (
                <AchievementBadge key={achievement.id} achievement={achievement} />
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </ParallaxProvider>
  );
};

export default React.memo(Profile);