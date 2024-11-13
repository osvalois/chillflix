import { useRef, useState, useEffect, useCallback } from 'react';
import {
  Box, Text, Flex, Image, VStack, useColorModeValue,
  Tooltip, useBreakpointValue, IconButton, Skeleton,
  Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton,
  SimpleGrid, Badge, useDisclosure, HStack,
  Drawer, DrawerBody, DrawerOverlay, DrawerContent, DrawerCloseButton,
  useMediaQuery, Tabs, TabList, TabPanels, Tab, TabPanel, Collapse,
  Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverBody, PopoverArrow, PopoverCloseButton
} from '@chakra-ui/react';
import { motion, AnimatePresence, useViewportScroll, useTransform } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSpring, animated, config } from 'react-spring';
import { Blurhash } from 'react-blurhash';
import axios from 'axios';
import { format, parseISO, differenceInYears } from 'date-fns';
import { ActorDetailsContentProps, CastCardProps, CastMember, CastSectionProps, FilmographyTimelineProps, MovieCredit } from '../../types';
import GlassmorphicButton from '../Button/GlassmorphicButton';
import { DynamicIcon } from './Icons';

const TMDB_API_KEY = '466fcb69c820905983bdd53d3a80a842';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const MotionBox = motion(Box as any);
const AnimatedBox = animated(MotionBox);
interface AwardsSectionProps {
  actorName: string;
}
const CastSection: React.FC<CastSectionProps> = ({ cast, isLoading }) => {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const { scrollYProgress } = useViewportScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);

  const slideInAnimation = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateY(0px)' : 'translateY(50px)',
    scale: inView ? 1 : 0.9,
    config: config.molasses,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);

  const itemsPerView = useBreakpointValue({ base: 2, sm: 3, md: 4, lg: 5, xl: 6 }) || 4;
  const glassBg = useColorModeValue('rgba(255, 255, 255, 0.7)', 'rgba(26, 32, 44, 0.7)');
  const handleNext = useCallback(() => {
    if (cast) {
      setCurrentIndex((prevIndex) =>
        Math.min(prevIndex + itemsPerView, cast.length - itemsPerView)
      );
    }
  }, [cast, itemsPerView]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - itemsPerView, 0));
  }, [itemsPerView]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [cast]);

  const glassmorphicStyle = {
    background: glassBg,
    backdropFilter: 'blur(10px)',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    padding: '24px',
    overflow: 'hidden',
  };

  if (isLoading || !cast) {
    return (
      <AnimatedBox ref={ref} style={slideInAnimation} {...glassmorphicStyle} my={8}>
        <Text fontSize="2xl" fontWeight="bold" mb={6} bgGradient="linear(to-r, cyan.400, blue.500, purple.600)" bgClip="text">
          Featured Cast
        </Text>
        <Flex>
          {Array.from({ length: itemsPerView }).map((_, index) => (
            <SkeletonCastCard key={index} />
          ))}
        </Flex>
      </AnimatedBox>
    );
  }

  if (cast.length === 0) {
    return null;
  }

  return (
    <AnimatedBox ref={ref} style={{ ...slideInAnimation, scale }} {...glassmorphicStyle} my={8}>
      <Text fontSize="2xl" fontWeight="bold" mb={6} bgGradient="linear(to-r, cyan.400, blue.500, purple.600)" bgClip="text">
        Featured Cast
      </Text>
      <Flex position="relative" alignItems="center">
        <IconButton
          icon={  <DynamicIcon name="ChevronLeft" color="black" size={16} />}
          aria-label="Previous cast members"
          onClick={handlePrev}
          isDisabled={currentIndex === 0}
          position="absolute"
          left="-20px"
          zIndex={2}
          bg="rgba(0, 0, 0, 0.5)"
          color="white"
          _hover={{ bg: 'rgba(0, 0, 0, 0.7)' }}
          _active={{ bg: 'rgba(0, 0, 0, 0.9)' }}
          size="lg"
          borderRadius="full"
        />
        <Flex
          ref={containerRef}
          overflowX="hidden"
          width="100%"
          px={4}
        >
          <AnimatePresence initial={false}>
            <Flex>
              {cast.slice(currentIndex, currentIndex + itemsPerView).map((member: CastMember) => (
                <MotionBox
                  key={member.id}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  flex={`0 0 ${100 / itemsPerView}%`}
                  px={2}
                >
                  <CastCard member={member} />
                </MotionBox>
              ))}
            </Flex>
          </AnimatePresence>
        </Flex>
        <IconButton
          icon={<DynamicIcon name="ChevronRight" color="black" size={16} />}
          aria-label="Next cast members"
          onClick={handleNext}
          isDisabled={currentIndex + itemsPerView >= cast.length}
          position="absolute"
          right="-20px"
          zIndex={2}
          bg="rgba(0, 0, 0, 0.5)"
          color="white"
          _hover={{ bg: 'rgba(0, 0, 0, 0.7)' }}
          _active={{ bg: 'rgba(0, 0, 0, 0.9)' }}
          size="lg"
          borderRadius="full"
        />
      </Flex>
    </AnimatedBox>
  );
};

const CastCard: React.FC<CastCardProps> = ({ member }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const textColor = useColorModeValue('gray.800', 'white');
  const placeholderColor = useColorModeValue('gray.300', 'gray.600');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [actorDetails, setActorDetails] = useState(null);
  const [actorCredits, setActorCredits] = useState([]);
  const [isLargerThan1280] = useMediaQuery("(min-width: 1280px)");

  const fetchActorDetails = useCallback(async () => {
    try {
      const [detailsResponse, creditsResponse] = await Promise.all([
        axios.get(`${TMDB_BASE_URL}/person/${member.id}`, {
          params: { api_key: TMDB_API_KEY }
        }),
        axios.get(`${TMDB_BASE_URL}/person/${member.id}/combined_credits`, {
          params: { api_key: TMDB_API_KEY }
        })
      ]);
      setActorDetails(detailsResponse.data);
      setActorCredits(creditsResponse.data.cast.sort((a: { popularity: number; }, b: { popularity: number; }) => b.popularity - a.popularity).slice(0, 20));
    } catch (error) {
      console.error('Error fetching actor details:', error);
    }
  }, [member.id]);

  const handleCardClick = useCallback(() => {
    fetchActorDetails();
    onOpen();
  }, [fetchActorDetails, onOpen]);

  const cardAnimation = useSpring({
    from: { transform: 'scale(0.9)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
    config: config.wobbly,
  });

  return (
    <>
      <AnimatedBox
        style={cardAnimation}
        onClick={handleCardClick}
        cursor="pointer"
        transition="all 0.3s"
        _hover={{ transform: 'scale(1.05)' }}
      >
        <VStack spacing={2} align="center">
          <Tooltip label={`${member.name} as ${member.character}`} placement="top">
            <Box
              position="relative"
              width="100%"
              paddingBottom="100%"
              borderRadius="full"
              overflow="hidden"
              boxShadow="0 4px 20px rgba(0, 0, 0, 0.15)"
            >
              <Blurhash
                hash="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
                width="100%"
                height="100%"
                resolutionX={32}
                resolutionY={32}
                punch={1}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />
              <Image
                src={member.profile_path ? `https://image.tmdb.org/t/p/w185${member.profile_path}` : '/placeholder-actor.jpg'}
                alt={member.name}
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="100%"
                objectFit="cover"
                opacity={imageLoaded ? 1 : 0}
                transition="opacity 0.3s ease-in-out"
                onLoad={() => setImageLoaded(true)}
              />
            </Box>
          </Tooltip>
          <Text fontWeight="bold" fontSize="sm" textAlign="center" color={textColor} noOfLines={1}>
            {member.name}
          </Text>
          <Text fontSize="xs" textAlign="center" color={placeholderColor} noOfLines={1}>
            {member.character}
          </Text>
        </VStack>
      </AnimatedBox>

      {isLargerThan1280 ? (
        <Modal isOpen={isOpen} onClose={onClose} size="6xl">
          <ModalOverlay backdropFilter="blur(10px)" />
          <ModalContent
            bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(26, 32, 44, 0.8)')}
            backdropFilter="blur(10px)"
            borderRadius="xl"
            boxShadow="xl"
          >
            <ModalCloseButton />
            <ModalBody>
              <ActorDetailsContent actorDetails={actorDetails} actorCredits={actorCredits} />
            </ModalBody>
          </ModalContent>
        </Modal>
      ) : (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="full">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerBody>
              <ActorDetailsContent actorDetails={actorDetails} actorCredits={actorCredits} />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

const ActorDetailsContent: React.FC<ActorDetailsContentProps> = ({ actorDetails, actorCredits }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const [showFullBio, setShowFullBio] = useState(false);

  if (!actorDetails) {
    return <Skeleton height="400px" />;
  }

  const age = actorDetails.birthday
    ? differenceInYears(actorDetails.deathday ? parseISO(actorDetails.deathday) : new Date(), parseISO(actorDetails.birthday))
    : null;

  return (
    <Flex direction={{ base: 'column', lg: 'row' }} gap={6}>
      <VStack align="start" spacing={4} flex={1}>
        <Box position="relative" width="100%" paddingBottom="150%" borderRadius="xl" overflow="hidden" boxShadow="xl">
          <Image
            src={actorDetails.profile_path ? `https://image.tmdb.org/t/p/w300${actorDetails.profile_path}` : '/placeholder-actor.jpg'}
            alt={actorDetails.name}
            position="absolute"
            top={0}
            left={0}
            width="100%"
            height="100%"
            objectFit="cover"
          />
        </Box>
        <Box width="100%">
          <Text fontWeight="bold">Born: {actorDetails.birthday ? format(parseISO(actorDetails.birthday), 'MMMM d, yyyy') : 'Unknown'}</Text>
          {actorDetails.deathday && <Text fontWeight="bold">Died: {format(parseISO(actorDetails.deathday), 'MMMM d, yyyy')}</Text>}
          {age !== null && <Text>Age: {age}</Text>}
          <Text>Place of Birth: {actorDetails.place_of_birth || 'Unknown'}</Text>
        </Box>
        <HStack spacing={4} width="100%" justifyContent="center">
          {actorDetails.imdb_id && (
            <IconButton as="a" href={`https://www.imdb.com/name/${actorDetails.imdb_id}`} target="_blank" icon={<DynamicIcon name="Imdb" color="black" size={16} />} colorScheme="yellow" aria-label="IMDb" />)}
          {actorDetails.instagram_id && (
            <IconButton as="a" href={`https://www.instagram.com/${actorDetails.instagram_id}`} target="_blank" icon={<DynamicIcon name="Instagram" color="black" size={16} />} colorScheme="pink" aria-label="Instagram" />
          )}
          {actorDetails.twitter_id && (
            <IconButton as="a" href={`https://twitter.com/${actorDetails.twitter_id}`} target="_blank" icon={<DynamicIcon name="Twitter" color="black" size={16} />} colorScheme="twitter" aria-label="Twitter" />
          )}
          {actorDetails.facebook_id && (
            <IconButton as="a" href={`https://www.facebook.com/${actorDetails.facebook_id}`} target="_blank" icon={<DynamicIcon name="Facebook" color="black" size={16} />} colorScheme="facebook" aria-label="Facebook" />
          )}
          <IconButton as="a" href={`https://en.wikipedia.org/wiki/${encodeURIComponent(actorDetails.name)}`} target="_blank" icon={<DynamicIcon name="Wikipedia" color="black" size={16} />} colorScheme="gray" aria-label="Wikipedia" />
        </HStack>
      </VStack>
      <VStack align="start" spacing={4} flex={2}>
        <Collapse startingHeight={100} in={showFullBio}>
          <Text>{actorDetails.biography}</Text>
        </Collapse>
        <GlassmorphicButton
          onClick={() => setShowFullBio(!showFullBio)}
          loadingText="Searching sources..."
          variant="info"
          glowIntensity="none"
          pulseEffect={false}
          size="md"
          animated={true}
          px={6}
          py={4}
          fontSize="md"
          fontWeight="semibold"
          backdropFilter="blur(8px)"
          bg="rgba(255,255,255,0.1)"
          color="white"
          _hover={{
            transform: 'translateY(-1px)',
            bg: 'rgba(255,255,255,0.15)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
          }}
          _active={{
            transform: 'translateY(0)',
            boxShadow: 'none'
          }}
        >
          {showFullBio ? 'Show Less' : 'Read More'}
        </GlassmorphicButton>

        <Tabs isFitted variant="enclosed" mt={6} width="100%">
          <TabList mb="1em">
            <Tab>Notable Performances</Tab>
            <Tab>Filmography</Tab>
            <Tab>Awards</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4}>
                {actorCredits.map((credit: MovieCredit) => (
                  <VStack
                    key={credit.id}
                    align="start"
                    p={3}
                    borderWidth={1}
                    borderRadius="xl"
                    bg={bgColor}
                    boxShadow="md"
                    transition="all 0.3s"
                    _hover={{ transform: 'translateY(-5px)', boxShadow: 'xl' }}
                  >
                    <Box position="relative" width="100%" paddingBottom="150%" borderRadius="md" overflow="hidden">
                      <Image
                        src={credit.poster_path ? `https://image.tmdb.org/t/p/w185${credit.poster_path}` : '/placeholder-movie.jpg'}
                        alt={credit.title || credit.name}
                        position="absolute"
                        top={0}
                        left={0}
                        width="100%"
                        height="100%"
                        objectFit="cover"
                      />
                    </Box>
                    <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
                      {credit.title || credit.name}
                    </Text>
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {credit.character}
                    </Text>
                    <Flex align="center" width="100%" justifyContent="space-between">
                      <Flex align="center">
                      <DynamicIcon name="Star" color="black" size={16} />
                        <Text ml={1} fontSize="xs">{credit.vote_average.toFixed(1)}</Text>
                      </Flex>
                      <Badge colorScheme={credit.media_type === 'movie' ? 'blue' : 'green'}>
                        {credit.media_type === 'movie' ? 'Movie' : 'TV'}
                      </Badge>
                    </Flex>
                    <Popover>
                      <PopoverTrigger>
                        <IconButton icon={<DynamicIcon name="Info" color="black" size={16} />} size="sm" aria-label="More info" variant="ghost" />
                      </PopoverTrigger>
                      <PopoverContent>
                        <PopoverArrow />
                        <PopoverCloseButton />
                        <PopoverHeader>Details</PopoverHeader>
                        <PopoverBody>
                          <Text fontSize="sm">{credit.overview}</Text>
                          <Text fontSize="xs" mt={2}>Release Date: {credit.release_date || credit.first_air_date || 'Unknown'}</Text>
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </VStack>
                ))}
              </SimpleGrid>
            </TabPanel>
            <TabPanel>
              <FilmographyTimeline credits={actorCredits} />
            </TabPanel>
            <TabPanel>
              <AwardsSection actorName={actorDetails.name} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Flex>
  );
};

const FilmographyTimeline: React.FC<FilmographyTimelineProps> = ({ credits }) => {
  const lineColor = useColorModeValue('gray.200', 'gray.700');
  const dotColor = useColorModeValue('blue.500', 'blue.300');

  const sortedCredits = [...credits].sort((a: MovieCredit, b: MovieCredit) => {
    const dateA = a.release_date || a.first_air_date || '0000';
    const dateB = b.release_date || b.first_air_date || '0000';
    return dateB.localeCompare(dateA);
  });

  return (
    <VStack align="stretch" spacing={4}>
      {sortedCredits.map((credit: MovieCredit) => (
        <Flex key={credit.id} align="center">
          <Box width="100px" textAlign="right" fontSize="sm" fontWeight="bold">
            {credit.release_date || credit.first_air_date || 'Unknown'}
          </Box>
          <Flex ml={4} mr={4} direction="column" align="center">
            <Box width="2px" height="20px" bg={lineColor} />
            <Box width="10px" height="10px" borderRadius="full" bg={dotColor} />
            <Box width="2px" height="20px" bg={lineColor} />
          </Flex>
          <Box flex={1}>
            <Text fontWeight="bold">{credit.title || credit.name}</Text>
            <Text fontSize="sm" color="gray.500">{credit.character}</Text>
          </Box>
        </Flex>
      ))}
    </VStack>
  );
};

const AwardsSection: React.FC<AwardsSectionProps> = ({ actorName }) => {
  const awards = [
    { name: 'Academy Award', year: 2020, category: 'Best Actor' },
    { name: 'Golden Globe', year: 2019, category: 'Best Actor in a Drama' },
    { name: 'BAFTA', year: 2018, category: 'Best Supporting Actor' },
  ];

  return (
    <VStack align="stretch" spacing={4}>
      <Text fontSize="xl" fontWeight="bold">Awards and Nominations for {actorName}</Text>
      {awards.map((award, index) => (
        <Box key={index} p={4} borderWidth={1} borderRadius="md" boxShadow="sm">
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">{award.name}</Text>
              <Text fontSize="sm">{award.category}</Text>
            </VStack>
            <Badge colorScheme="green">{award.year}</Badge>
          </Flex>
        </Box>
      ))}
      <Text fontSize="sm" color="gray.500" mt={4}>
        Note: This is a partial list of awards. For a complete list, please check official sources.
      </Text>
    </VStack>
  );
};
const SkeletonCastCard = () => (
  <VStack spacing={2} align="center" width={`${100 / 6}%`} px={2}>
    <Skeleton
      height="0"
      paddingBottom="100%"
      borderRadius="full"
      startColor="gray.100"
      endColor="gray.300"
    />
    <Skeleton height="12px" width="80%" />
    <Skeleton height="8px" width="60%" />
  </VStack>
);

export default CastSection;