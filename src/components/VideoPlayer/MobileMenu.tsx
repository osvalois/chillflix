import React, { useState, useCallback } from 'react';
import {
  Box,
  Portal,
  Text,
  IconButton,
  Flex,
  useColorModeValue,
  useDisclosure,
  SlideFade,
  Collapse,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Settings, Volume2, Subtitles, Languages, Video, ChevronLeft } from "lucide-react";
import { rgba } from 'polished';
import { useSpring, animated } from 'react-spring';

import { QualitySelector } from './QualitySelector';
import { LanguageSelector } from './LanguageSelector';
import { AudioSettingsMenu } from './AudioSettingsMenu';
import { SubtitleSelector } from './SubtitleSelector';
import type { AudioTrack } from './types';
import { Subtitle } from '../../types';

const MotionBox = motion(Box as any);
const AnimatedFlex = animated(Flex);

interface MobileMenuProps {
  selectedQuality: string;
  availableQualities: string[];
  onQualityChange: (quality: string) => void;
  selectedLanguage: string;
  availableLanguages: string[];
  onLanguageChange: (language: string) => void;
  audioTracks: AudioTrack[];
  selectedAudioTrack: string;
  onAudioTrackChange: (track: AudioTrack) => void;
  subtitles: Subtitle[];
  selectedSubtitle: Subtitle | null;
  onSubtitleChange: (subtitle: Subtitle | null) => void;
}

interface MenuSection {
  id: string;
  icon: JSX.Element;
  title: string;
  shortcut: string;
  component: JSX.Element;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  selectedQuality,
  availableQualities,
  onQualityChange,
  selectedLanguage,
  availableLanguages,
  onLanguageChange,
  audioTracks,
  selectedAudioTrack,
  onAudioTrackChange,
  subtitles,
  selectedSubtitle,
  onSubtitleChange
}) => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Theme colors
  const bgColor = useColorModeValue('gray.900', 'gray.800');
  const overlayColor = useColorModeValue(
    rgba('#000', 0.75),
    rgba('#000', 0.85)
  );
  const accentColor = useColorModeValue('#FF0080', '#7928CA');
  const textColor = useColorModeValue('white', 'gray.100');

  // Animation springs
  const menuSpring = useSpring({
    transform: isOpen ? 'translateY(0%)' : 'translateY(100%)',
    opacity: isOpen ? 1 : 0,
    config: { tension: 300, friction: 30 }
  });

  const getSections = useCallback((): MenuSection[] => [
    {
      id: 'quality',
      icon: <Video size={20} />,
      title: 'Quality',
      shortcut: 'Q',
      component: (
        <QualitySelector
          selectedQuality={selectedQuality}
          availableQualities={availableQualities}
          onQualityChange={onQualityChange}
        />
      )
    },
    {
      id: 'language',
      icon: <Languages size={20} />,
      title: 'Language',
      shortcut: 'L',
      component: (
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          availableLanguages={availableLanguages}
          onLanguageChange={onLanguageChange}
        />
      )
    },
    {
      id: 'subtitles',
      icon: <Subtitles size={20} />,
      title: 'Subtitles',
      shortcut: 'C',
      component: (
        <SubtitleSelector
          subtitles={subtitles}
          selectedSubtitle={selectedSubtitle}
          onSubtitleChange={onSubtitleChange}
        />
      )
    },
    {
      id: 'audio',
      icon: <Volume2 size={20} />,
      title: 'Audio',
      shortcut: 'A',
      component: (
        <AudioSettingsMenu
          audioTracks={audioTracks}
          selectedAudioTrack={selectedAudioTrack}
          onAudioTrackChange={onAudioTrackChange}
        />
      )
    }
  ], [selectedQuality, availableQualities, onQualityChange, selectedLanguage, 
      availableLanguages, onLanguageChange, subtitles, selectedSubtitle, 
      onSubtitleChange, audioTracks, selectedAudioTrack, onAudioTrackChange]);

  const sections = getSections();

  const handleSectionClick = (sectionId: string) => {
    setActiveSection(activeSection === sectionId ? null : sectionId);
  };

  return (
    <>
      <IconButton
        aria-label="Settings"
        icon={<Settings size={20} />}
        size="sm"
        variant="ghost"
        color="white"
        onClick={onToggle}
        _hover={{
          bg: rgba(accentColor, 0.2),
          transform: 'scale(1.05)'
        }}
        _active={{
          transform: 'scale(0.95)'
        }}
        transition="all 0.2s"
      />

      <Portal>
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <MotionBox
                position="fixed"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg={overlayColor}
                zIndex={1000}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
              />

              {/* Menu Container */}
              <AnimatedFlex
                position="fixed"
                bottom={0}
                left={0}
                right={0}
                maxHeight="80vh"
                borderTopRadius="2xl"
                bg={bgColor}
                flexDirection="column"
                zIndex={1001}
                style={menuSpring}
                overflow="hidden"
              >
                {/* Header */}
                <Flex
                  px={4}
                  py={3}
                  alignItems="center"
                  borderBottom="1px solid"
                  borderColor="whiteAlpha.200"
                >
                  <IconButton
                    aria-label="Close menu"
                    icon={<ChevronLeft size={20} />}
                    variant="ghost"
                    color={textColor}
                    onClick={onClose}
                    size="sm"
                  />
                  <Text
                    ml={3}
                    fontWeight="semibold"
                    color={textColor}
                    fontSize="lg"
                  >
                    Settings
                  </Text>
                </Flex>

                {/* Menu Sections */}
                <Box overflowY="auto" py={2}>
                  {sections.map((section) => (
                    <Box key={section.id}>
                      <Flex
                        px={4}
                        py={3}
                        alignItems="center"
                        cursor="pointer"
                        onClick={() => handleSectionClick(section.id)}
                        _hover={{
                          bg: rgba(accentColor, 0.1)
                        }}
                        transition="all 0.2s"
                      >
                        <Box color={activeSection === section.id ? accentColor : textColor}>
                          {section.icon}
                        </Box>
                        <Box flex={1} ml={3}>
                          <Text
                            fontWeight="medium"
                            color={activeSection === section.id ? accentColor : textColor}
                          >
                            {section.title}
                          </Text>
                        </Box>
                        <Text
                          fontSize="xs"
                          color="gray.500"
                          px={2}
                          py={1}
                          borderRadius="md"
                          bg="whiteAlpha.100"
                        >
                          {section.shortcut}
                        </Text>
                      </Flex>

                      <Collapse in={activeSection === section.id}>
                        <Box
                          px={4}
                          py={3}
                          bg={rgba(accentColor, 0.05)}
                          borderY="1px solid"
                          borderColor="whiteAlpha.100"
                        >
                          <SlideFade in={activeSection === section.id}>
                            {section.component}
                          </SlideFade>
                        </Box>
                      </Collapse>
                    </Box>
                  ))}
                </Box>
              </AnimatedFlex>
            </>
          )}
        </AnimatePresence>
      </Portal>
    </>
  );
};