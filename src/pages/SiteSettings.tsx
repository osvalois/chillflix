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
  Badge,
  Skeleton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Progress,
  useDisclosure,
  useToast,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import {
  Edit2, Settings, Clock, Heart,
  Sun, Moon, Globe, Award, MessageCircle, Star, ChevronRight, Film, Share2,
} from 'lucide-react';
import { ParallaxProvider, Parallax } from 'react-scroll-parallax';
import { rgba } from 'polished';
import { useAuth } from '../hooks/useAuth';

// Types
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

const LANGUAGES = [
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

const MotionBox = motion(Box);
const MotionFlex = motion(Flex);

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

  const bgColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.100');

  return (
    <Tag size="md" variant="subtle" bg={bgColor}>
      <Box
        w="2"
        h="2"
        borderRadius="full"
        bg={statusColors[status]}
        mr="2"
        animation={status === 'watching' ? 'pulse 2s infinite' : undefined}
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
}> = ({ icon, label, value, isLoading = false, subtitle, trend }) => {
  const bgColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.100');
  const borderColor = useColorModeValue('whiteAlpha.300', 'whiteAlpha.100');

  return (
    <MotionBox
      p={6}
      borderRadius="2xl"
      bg={bgColor}
      backdropFilter="blur(20px)"
      border="1px solid"
      borderColor={borderColor}
      boxShadow={`0 8px 32px 0 ${rgba(0, 0, 0, 0.1)}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <VStack spacing={3}>
        <Box color="purple.400" transform="scale(1.2)">
          {icon}
        </Box>
        <Skeleton isLoaded={!isLoading}>
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
          <Text color="gray.500" fontSize="sm" fontWeight="medium">
            {label}
          </Text>
          {subtitle && (
            <Text color="gray.400" fontSize="xs">
              {subtitle}
            </Text>
          )}
        </VStack>
      </VStack>
    </MotionBox>
  );
};

const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const bgColor = useColorModeValue('whiteAlpha.200', 'whiteAlpha.100');

  return (
    <HStack
      spacing={3}
      p={3}
      bg={bgColor}
      borderRadius="lg"
      border="1px solid"
      borderColor={useColorModeValue('whiteAlpha.300', 'whiteAlpha.100')}
      _hover={{ transform: 'translateY(-2px)' }}
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
      <Badge
        colorScheme={achievement.rarity === 'legendary' ? 'orange' : 'gray'}
        variant="subtle"
        ml="auto"
      >
        {achievement.rarity}
      </Badge>
    </HStack>
  );
};

const SiteSettings: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(LANGUAGES[0]);
  const { colorMode, toggleColorMode } = useColorMode();
  const achievementsDisclosure = useDisclosure();
  const toast = useToast();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (user) {
      // Simular carga de datos del perfil
      setTimeout(() => {
        setProfileData({
          username: user.displayName || 'User',
          email: user.email || '',
          avatarUrl: user.photoURL || '',
          joinDate: 'January 2024',
          status: 'online',
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
            }
          ],
          recentActivity: [
            {
              id: '1',
              type: 'watch',
              content: 'Watched "Inception"',
              timestamp: '2h ago'
            }
          ],
          socialLinks: {
            github: "https://github.com",
            twitter: "https://twitter.com"
          }
        });
        setIsLoading(false);
      }, 1500);
    }
  }, [user]);

  if (!user) {
    return (
      <Flex minH="100vh" justify="center" align="center">
        <Box
          as={motion.div}
          animate={{ rotate: 360 }}
          w="50px"
          h="50px"
          borderWidth="3px"
          borderStyle="solid"
          borderColor="purple.500"
          borderTopColor="transparent"
          borderRadius="full"
        />
      </Flex>
    );
  }

  return (
    <ParallaxProvider>
      <Container maxW="7xl" pt={{ base: "4", md: "100px" }} px={{ base: "4", md: "6" }}>
        <Parallax translateY={[-20, 20]}>
          <MotionFlex
            direction="column"
            w="full"
            borderRadius="3xl"
            overflow="hidden"
            bg={useColorModeValue('whiteAlpha.100', 'blackAlpha.100')}
            backdropFilter="blur(20px)"
            border="1px solid"
            borderColor={useColorModeValue('whiteAlpha.300', 'whiteAlpha.100')}
            boxShadow={`0 8px 32px 0 ${rgba(0, 0, 0, 0.1)}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box p={{ base: 4, md: 8 }}>
              {/* Profile Header */}
              <Flex
                direction={{ base: "column", lg: "row" }}
                align={{ base: "center", lg: "start" }}
                gap={{ base: 6, md: 8, lg: 10 }}
                w="full"
                py={{ base: 4, md: 6, lg: 8 }}
              >
                {/* Avatar Section */}
                <Box
                  position="relative"
                  flex={{ base: "none", lg: "0 0 auto" }}
                  alignSelf={{ base: "center", lg: "flex-start" }}
                >
                  <MotionBox
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Avatar
                      size={{ base: "xl", md: "2xl" }}
                      src={profileData?.avatarUrl}
                      name={profileData?.username}
                      border="4px solid"
                      borderColor="purple.400"
                      boxShadow="lg"
                    />
                    {/* Status Indicator */}
                    <Box
                      position="absolute"
                      bottom="-2"
                      right="-2"
                      bg={profileData?.status === 'online' ? 'green.400' : 'gray.400'}
                      w={{ base: "3", md: "4" }}
                      h={{ base: "3", md: "4" }}
                      borderRadius="full"
                      border="3px solid"
                      borderColor={useColorModeValue('white', 'gray.800')}
                      boxShadow="md"
                    />
                  </MotionBox>
                </Box>

                {/* Profile Info Section */}
                <VStack
                  align={{ base: "center", lg: "start" }}
                  spacing={{ base: 4, md: 5, lg: 6 }}
                  flex="1"
                  w="full"
                  maxW={{ xl: "800px", "2xl": "1000px" }}
                >
                  {/* Name and Badges */}
                  <VStack
                    spacing={{ base: 2, md: 3 }}
                    align={{ base: "center", lg: "start" }}
                    w="full"
                  >
                    <HStack
                      spacing={{ base: 2, md: 4 }}
                      flexWrap="wrap"
                      justify={{ base: "center", lg: "start" }}
                    >
                      <Text
                        fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
                        fontWeight="bold"
                        textAlign={{ base: "center", lg: "left" }}
                      >
                        {profileData?.username}
                      </Text>
                      <HStack
                        spacing={{ base: 1, md: 2 }}
                        flexWrap="wrap"
                        justify={{ base: "center", lg: "start" }}
                      >
                        <Badge
                          colorScheme="purple"
                          variant="solid"
                          fontSize={{ base: "xs", md: "sm" }}
                          px={{ base: 2, md: 3 }}
                          py={{ base: 1, md: 1.5 }}
                        >
                          PRO
                        </Badge>
                        <Badge
                          colorScheme="yellow"
                          variant="subtle"
                          fontSize={{ base: "xs", md: "sm" }}
                          px={{ base: 2, md: 3 }}
                          py={{ base: 1, md: 1.5 }}
                        >
                          <HStack spacing={1}>
                            <Award size={12} />
                            <Text>Top Reviewer</Text>
                          </HStack>
                        </Badge>
                      </HStack>
                    </HStack>

                    {/* Bio */}
                    <Text
                      color="gray.500"
                      fontSize={{ base: "sm", md: "md" }}
                      textAlign={{ base: "center", lg: "left" }}
                      maxW={{ base: "100%", md: "600px", lg: "800px" }}
                      px={{ base: 4, lg: 0 }}
                    >
                      {profileData?.bio}
                    </Text>
                  </VStack>

                  {/* Stats */}
                  <HStack
                    spacing={{ base: 4, md: 8, lg: 12 }}
                    flexWrap="wrap"
                    justify={{ base: "center", lg: "start" }}
                    w="full"
                    py={{ base: 2, md: 3 }}
                  >
                    {[
                      { label: 'Followers', value: profileData?.stats.followers },
                      { label: 'Following', value: profileData?.stats.following },
                      { label: 'Reviews', value: profileData?.stats.reviews }
                    ].map((stat, index) => (
                      <VStack
                        key={index}
                        spacing={{ base: 0.5, md: 1 }}
                        align="center"
                        minW={{ base: "80px", md: "100px" }}
                      >
                        <Text
                          fontWeight="bold"
                          fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                        >
                          {stat.value}
                        </Text>
                        <Text
                          color="gray.500"
                          fontSize={{ base: "xs", md: "sm" }}
                        >
                          {stat.label}
                        </Text>
                      </VStack>
                    ))}
                  </HStack>

                  {/* Action Buttons */}
                  <VStack
                    spacing={{ base: 3, md: 4 }}
                    w="full"
                    align={{ base: "center", lg: "start" }}
                  >
                    {/* Primary Actions */}
                    <HStack
                      spacing={{ base: 2, md: 4 }}
                      flexWrap="wrap"
                      justify={{ base: "center", lg: "start" }}
                    >
                      <Button
                        leftIcon={<Edit2 size={16} />}
                        colorScheme="purple"
                        size={{ base: "sm", md: "md" }}
                        onClick={() => {
                          toast({
                            title: "Edit Profile",
                            description: "This feature will be available soon",
                            status: "info",
                            duration: 3000,
                            isClosable: true,
                          });
                        }}
                      >
                        Edit Profile
                      </Button>
                      <Button
                        leftIcon={<Share2 size={16} />}
                        variant="outline"
                        colorScheme="purple"
                        size={{ base: "sm", md: "md" }}
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: `${profileData?.username}'s Profile`,
                              text: 'Check out my profile on ChillFlix!',
                              url: window.location.href,
                            });
                          } else {
                            toast({
                              title: "Share Profile",
                              description: "URL copied to clipboard",
                              status: "success",
                              duration: 3000,
                              isClosable: true,
                            });
                          }
                        }}
                      >
                        Share Profile
                      </Button>
                      <IconButton
                        aria-label="Settings"
                        icon={<Settings size={16} />}
                        variant="ghost"
                        colorScheme="purple"
                        size={{ base: "sm", md: "md" }}
                      />
                    </HStack>
                  </VStack>
                </VStack>
              </Flex>
            {/* Header Controls */}
            <Flex
              bg={useColorModeValue('whiteAlpha.100', 'blackAlpha.100')}
              p={4}
              justifyContent="space-between"
              alignItems="center"
              borderBottom="1px solid"
              borderColor={useColorModeValue('whiteAlpha.200', 'whiteAlpha.100')}
            >
              <HStack spacing={4}>
                <StatusIndicator status={profileData?.status || 'offline'} />
                <Badge
                  variant="subtle"
                  colorScheme="purple"
                  p={2}
                  borderRadius="full"
                >
                  Level {profileData?.stats.level}
                </Badge>
              </HStack>

              <HStack spacing={2}>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={
                      <HStack spacing={1}>
                        <Globe size={16} />
                        <Text fontSize="sm">{currentLanguage.flag}</Text>
                      </HStack>
                    }
                    variant="ghost"
                    size="sm"
                  />
                  <MenuList>
                    {LANGUAGES.map((lang) => (
                      <MenuItem
                        key={lang.code}
                        onClick={() => setCurrentLanguage(lang)}
                      >
                        <HStack>
                          <Text>{lang.flag}</Text>
                          <Text>{lang.name}</Text>
                        </HStack>
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
                <IconButton
                  aria-label="Toggle color mode"
                  icon={colorMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                  onClick={toggleColorMode}
                  variant="ghost"
                  size="sm"
                />
              </HStack>
            </Flex>

              {/* Level Progress */}
              <Box mt={8} p={4} borderRadius="xl" bg={useColorModeValue('whiteAlpha.200', 'blackAlpha.200')}>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium">Level Progress</Text>
                  <Text fontSize="sm" color="gray.500">
                    {profileData?.stats.exp} / {profileData?.stats.nextLevelExp} XP
                  </Text>
                </HStack>
                <Progress
                  value={(profileData?.stats.exp || 0) / (profileData?.stats.nextLevelExp || 1) * 100}
                  colorScheme="purple"
                  borderRadius="full"
                  size="sm"
                  hasStripe
                  isAnimated
                />
              </Box>

              <Divider my={8} />

              {/* Stats Grid */}
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }}
                gap={6}
              >
                <GridItem>
                  <StatCard
                    icon={<Film size={24} />}
                    label="Watchlist"
                    value={profileData?.stats.watchlist || 0}
                    isLoading={isLoading}
                    subtitle="Movies to watch"
                    trend={5}
                  />
                </GridItem>
                <GridItem>
                  <StatCard
                    icon={<Heart size={24} />}
                    label="Favorites"
                    value={profileData?.stats.favorites || 0}
                    isLoading={isLoading}
                    subtitle="Loved movies"
                    trend={8}
                  />
                </GridItem>
                <GridItem>
                  <StatCard
                    icon={<Clock size={24} />}
                    label="Watch Time"
                    value={profileData?.stats.watchTime || '0h'}
                    isLoading={isLoading}
                    subtitle="Total hours"
                    trend={12}
                  />
                </GridItem>
                <GridItem>
                  <StatCard
                    icon={<MessageCircle size={24} />}
                    label="Reviews"
                    value={profileData?.stats.reviews || 0}
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
                  {profileData?.achievements.map((achievement) => (
                    <GridItem key={achievement.id}>
                      <AchievementBadge achievement={achievement} />
                    </GridItem>
                  ))}
                </Grid>
              </Box>

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
                      {profileData?.achievements.map((achievement) => (
                        <AchievementBadge key={achievement.id} achievement={achievement} />
                      ))}
                    </VStack>
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            </Box>
          </MotionFlex>
        </Parallax>
      </Container>
    </ParallaxProvider>
  );
};

export default SiteSettings;