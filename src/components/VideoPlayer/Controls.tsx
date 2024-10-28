import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Flex, useMediaQuery, Fade } from "@chakra-ui/react";
import { AudioTrack } from './types';
import { PlaybackControls } from './PlaybackControls';
import { VolumeControls } from './VolumeControls';
import { TimeDisplay } from './TimeDisplay';
import { SeekBar } from './SeekBar';
import { LanguageSelector } from './LanguageSelector';
import { AudioSettingsMenu, AudioTrackCustom } from './AudioSettingsMenu';
import { FullscreenButton } from './FullscreenButton';
import { MobileMenu } from './MobileMenu';
import { LoadingSpinner } from './LoadingSpinner';
import { TitleDisplay } from './TitleDisplay';
import { QualitySelector } from './QualitySelector';
import { SubtitleSelector } from './SubtitleSelector';
import { ControlsProps, Subtitle } from '../../types';

interface ParsedSubtitleCue {
    start: number;
    end: number;
    text: string;
}

interface SavedConfig {
    currentTime: number;
    volume: number;
    selectedQuality: string;
    selectedLanguage: string;
    selectedSubtitle: string | null;
    selectedAudioTrack: string;
}

interface SubtitleState {
    subtitle: Subtitle | null;
    cues: ParsedSubtitleCue[] | null;
}

const Controls: React.FC<ControlsProps> = ({
    player,
    isLoading,
    isPaused,
    isFullscreen,
    isMuted,
    currentTime,
    duration,
    volume,
    audioTracks,
    selectedAudioTrack,
    selectedSubtitle,
    selectedQuality,
    selectedLanguage,
    controlsVisible,
    availableQualities,
    availableLanguages,
    subtitles,
    title,
    movieId,
    onQualityChange,
    onLanguageChange,
    onSubtitleChange,
}) => {
    const [isLargerThan768] = useMediaQuery("(min-width: 768px)");
    const [localControlsVisible, setLocalControlsVisible] = useState(controlsVisible);
    const [localQuality, setLocalQuality] = useState(selectedQuality);
    const [localLanguage, setLocalLanguage] = useState(selectedLanguage);
    const [localSubtitle, setLocalSubtitle] = useState<SubtitleState>({
        subtitle: selectedSubtitle as Subtitle | null,
        cues: null
    });
    const [localAudioTrack, setLocalAudioTrack] = useState(selectedAudioTrack);
    const [isConfigChanged, setIsConfigChanged] = useState(false);
    
    const lastSavedRef = useRef<SavedConfig | null>(null);

    const glassmorphismStyle = {
        background: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(10px)",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
    };

    const saveConfig = useCallback(() => {
        const config: SavedConfig = {
            currentTime,
            volume,
            selectedQuality: localQuality,
            selectedLanguage: localLanguage,
            selectedSubtitle: localSubtitle.subtitle?.ISO639 ?? null,
            selectedAudioTrack: localAudioTrack,
        };

        if (JSON.stringify(config) !== JSON.stringify(lastSavedRef.current)) {
            localStorage.setItem(`movieConfig_${movieId}`, JSON.stringify(config));
            lastSavedRef.current = config;
            setIsConfigChanged(false);
        }
    }, [currentTime, volume, localQuality, localLanguage, localSubtitle, localAudioTrack, movieId]);

    const loadSavedConfig = useCallback(() => {
        const savedConfig = localStorage.getItem(`movieConfig_${movieId}`);
        if (savedConfig) {
            return JSON.parse(savedConfig) as SavedConfig;
        }
        return null;
    }, [movieId]);

    const handleAudioTrackChange = useCallback((track: string) => {
        setLocalAudioTrack(track);
        setIsConfigChanged(true);
    }, []);

    const handlePlayPause = useCallback(() => {
        if (player) {
            player.paused() ? player.play() : player.pause();
        }
    }, [player]);

    const handleMute = useCallback(() => {
        if (player) {
            player.muted(!player.muted());
            setIsConfigChanged(true);
        }
    }, [player]);

    const handleVolumeChange = useCallback((vol: number) => {
        if (player) {
            player.volume(vol);
            setIsConfigChanged(true);
        }
    }, [player]);

    const handleSeek = useCallback((time: number) => {
        if (player) {
            player.currentTime(time);
            setIsConfigChanged(true);
        }
    }, [player]);

    const handleFullscreenToggle = useCallback(() => {
        if (player) {
            player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen();
        }
    }, [player]);

    const handleQualityChange = useCallback((quality: string) => {
        setLocalQuality(quality);
        setIsConfigChanged(true);
    }, []);

    const handleLanguageChange = useCallback((language: string) => {
        setLocalLanguage(language);
        setIsConfigChanged(true);
    }, []);

    const handleSubtitleChange = useCallback((subtitle: Subtitle | null, parsedCues: ParsedSubtitleCue[] | null) => {
        setLocalSubtitle({ subtitle, cues: parsedCues });
        setIsConfigChanged(true);
    }, []);

    useEffect(() => {
        const savedConfig = loadSavedConfig();
        if (savedConfig && player) {
            player.currentTime(savedConfig.currentTime);
            player.volume(savedConfig.volume);
            setLocalQuality(savedConfig.selectedQuality);
            setLocalLanguage(savedConfig.selectedLanguage);
            
            // Find the matching subtitle from saved ISO639
            if (savedConfig.selectedSubtitle && Array.isArray(subtitles)) {
                const savedSubtitle = (subtitles as unknown as Subtitle[]).find(
                    sub => sub.ISO639 === savedConfig.selectedSubtitle
                );
                if (savedSubtitle) {
                    setLocalSubtitle({ subtitle: savedSubtitle, cues: null });
                }
            }
            
            setLocalAudioTrack(savedConfig.selectedAudioTrack);
        }
    }, [player, loadSavedConfig, subtitles]);

    useEffect(() => {
        const timer = setTimeout(() => {
            saveConfig();
        }, 1000);

        return () => clearTimeout(timer);
    }, [isConfigChanged, saveConfig]);

    useEffect(() => {
        setLocalControlsVisible(controlsVisible);
    }, [controlsVisible]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setLocalControlsVisible(true);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    // Apply changes to global state
    useEffect(() => {
        if (localQuality !== selectedQuality) onQualityChange(localQuality);
        if (localLanguage !== selectedLanguage) onLanguageChange(localLanguage);
        if (localSubtitle.subtitle !== selectedSubtitle) onSubtitleChange(localSubtitle.subtitle);
        if (localAudioTrack !== selectedAudioTrack) {
            const audioTracks = (player as any).audioTracks();
            if (audioTracks) {
                for (let i = 0; i < audioTracks.length; i++) {
                    audioTracks[i].enabled = audioTracks[i].id === localAudioTrack;
                }
            }
        }
    }, [localQuality, localLanguage, localSubtitle.subtitle, localAudioTrack, player, onQualityChange, onLanguageChange, onSubtitleChange, selectedQuality, selectedLanguage, selectedSubtitle, selectedAudioTrack]);

    return (
        <>
            <LoadingSpinner isLoading={isLoading} />
            <Fade in={localControlsVisible} unmountOnExit>
                <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    width="100%"
                    p={2}
                    zIndex={1000}
                >
                    <Flex flexDirection="column" {...glassmorphismStyle} p={3}>
                        <TitleDisplay title={title} />
                        <SeekBar currentTime={currentTime} duration={duration} onSeek={handleSeek} />
                        <Flex alignItems="center" justifyContent="space-between" flexWrap={["wrap", "nowrap"]}>
                            <Flex alignItems="center" width={["100%", "auto"]}>
                                <PlaybackControls 
                                    isPaused={isPaused} 
                                    onPlayPause={handlePlayPause} 
                                />
                                <VolumeControls
                                    isMuted={isMuted}
                                    volume={volume}
                                    onMute={handleMute}
                                    onVolumeChange={handleVolumeChange}
                                    isLargerThan768={isLargerThan768}
                                />
                                <TimeDisplay currentTime={currentTime} duration={duration} />
                            </Flex>
                            <Flex alignItems="center" mt={[2, 0]} width={["100%", "auto"]} justifyContent={["space-between", "flex-end"]}>
                                {isLargerThan768 ? (
                                    <>
                                        <QualitySelector 
                                            selectedQuality={localQuality} 
                                            availableQualities={availableQualities} 
                                            onQualityChange={handleQualityChange} 
                                        />
                                        <LanguageSelector
                                            selectedLanguage={localLanguage}
                                            availableLanguages={availableLanguages}
                                            onLanguageChange={handleLanguageChange}
                                        />
                                        <AudioSettingsMenu 
                                            audioTracks={audioTracks} 
                                            selectedAudioTrack={localAudioTrack} 
                                            onAudioTrackChange={(track: AudioTrackCustom) => handleAudioTrackChange(track.id)} 
                                        />
                                        <SubtitleSelector
                                            subtitles={subtitles as unknown as Subtitle[]}
                                            selectedSubtitle={localSubtitle.subtitle}
                                            onSubtitleChange={handleSubtitleChange}
                                        />
                                    </>
                                ) : (
                                    <MobileMenu
                                            selectedQuality={localQuality}
                                            availableQualities={availableQualities}
                                            onQualityChange={handleQualityChange}
                                            selectedLanguage={localLanguage}
                                            availableLanguages={availableLanguages}
                                            onLanguageChange={handleLanguageChange}
                                            audioTracks={audioTracks}
                                            selectedAudioTrack={localAudioTrack}
                                            onAudioTrackChange={(track: AudioTrack) => handleAudioTrackChange(track.id)}
                                            subtitles={subtitles as unknown as Subtitle[]}
                                            selectedSubtitle={localSubtitle.subtitle} 
                                            onSubtitleChange={function (subtitle: Subtitle | null): void {
                                                console.log(subtitle)
                                                throw new Error('Function not implemented.');
                                            } }                                    />
                                )}
                                <FullscreenButton
                                    isFullscreen={isFullscreen}
                                    onFullscreenToggle={handleFullscreenToggle}
                                />
                            </Flex>
                        </Flex>
                    </Flex>
                </Box>
            </Fade>
        </>
    );
};

export default React.memo(Controls);