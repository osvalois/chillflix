import React from 'react';
import { Box, Flex, useMediaQuery, Fade, IconButton } from "@chakra-ui/react";
import { ControlsProps } from './types';
import { PlaybackControls } from './PlaybackControls';
import { VolumeControls } from './VolumeControls';
import { TimeDisplay } from './TimeDisplay';
import { SeekBar } from './SeekBar';
import { LanguageSelector } from './LanguageSelector';
import { AudioSettingsMenu } from './AudioSettingsMenu';
import { FullscreenButton } from './FullscreenButton';
import { MobileMenu } from './MobileMenu';
import { LoadingSpinner } from './LoadingSpinner';
import { TitleDisplay } from './TitleDisplay';
import { QualitySelector } from './QualitySelector';
import { FaClosedCaptioning } from "react-icons/fa";

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
    subtitles,
    selectedSubtitle,
    selectedQuality,
    selectedLanguage,
    controlsVisible,
    availableQualities,
    availableLanguages,
    title,
    onQualityChange,
    onLanguageChange,
    onToggleSubtitlesSelector
}) => {
    const [isLargerThan768] = useMediaQuery("(min-width: 768px)");

    const glassmorphismStyle = {
        background: "rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(10px)",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
    };

    return (
        <>
            <LoadingSpinner isLoading={isLoading} />
            <Fade in={controlsVisible} unmountOnExit>
                <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    width="100%"
                    p={2}
                >
                    <Flex flexDirection="column" {...glassmorphismStyle} p={3}>
                        <TitleDisplay title={title} />
                        <SeekBar currentTime={currentTime} duration={duration} onSeek={(time) => player?.currentTime(time)} />
                        <Flex alignItems="center" justifyContent="space-between" flexWrap={["wrap", "nowrap"]}>
                            <Flex alignItems="center" width={["100%", "auto"]}>
                                <PlaybackControls isPaused={isPaused} onPlayPause={() => player?.paused() ? player.play() : player.pause()} />
                                <VolumeControls
                                    isMuted={isMuted}
                                    volume={volume}
                                    onMute={() => player?.muted(!player.muted())}
                                    onVolumeChange={(vol) => player?.volume(vol)}
                                    isLargerThan768={isLargerThan768}
                                />
                                <TimeDisplay currentTime={currentTime} duration={duration} />
                            </Flex>
                            <Flex alignItems="center" mt={[2, 0]} width={["100%", "auto"]} justifyContent={["space-between", "flex-end"]}>
                                {isLargerThan768 ? (
                                    <>
                                        <QualitySelector selectedQuality={selectedQuality} availableQualities={availableQualities} onQualityChange={onQualityChange} />
                                        <LanguageSelector
                                            selectedLanguage={selectedLanguage}
                                            availableLanguages={availableLanguages}
                                            onLanguageChange={onLanguageChange}
                                        />
                                        <AudioSettingsMenu audioTracks={audioTracks} selectedAudioTrack={selectedAudioTrack} onAudioTrackChange={(track) => {
                                            const audioTracks = player?.audioTracks();
                                            if (audioTracks) {
                                                for (let i = 0; i < audioTracks.length; i++) {
                                                    audioTracks[i].enabled = audioTracks[i].id === track.id;
                                                }
                                            }
                                        }} />
                                        <IconButton
                                            aria-label="Toggle Subtitles"
                                            icon={<FaClosedCaptioning />}
                                            onClick={onToggleSubtitlesSelector}
                                            variant="ghost"
                                            color="white"
                                            _hover={{ bg: "whiteAlpha.300" }}
                                        />
                                    </>
                                ) : (
                                    <MobileMenu
                                        selectedQuality={selectedQuality}
                                        availableQualities={availableQualities}
                                        onQualityChange={onQualityChange}
                                        selectedLanguage={selectedLanguage}
                                        availableLanguages={availableLanguages}
                                        onLanguageChange={onLanguageChange}
                                        audioTracks={audioTracks}
                                        selectedAudioTrack={selectedAudioTrack}
                                        onAudioTrackChange={(track) => {
                                            const audioTracks = player?.audioTracks();
                                            if (audioTracks) {
                                                for (let i = 0; i < audioTracks.length; i++) {
                                                    audioTracks[i].enabled = audioTracks[i].id === track.id;
                                                }
                                            }
                                        }}
                                        subtitles={subtitles}
                                        selectedSubtitle={selectedSubtitle}
                                        onToggleSubtitlesSelector={onToggleSubtitlesSelector}
                                    />
                                )}
                                <FullscreenButton
                                    isFullscreen={isFullscreen}
                                    onFullscreenToggle={() => player?.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen()}
                                />
                            </Flex>
                        </Flex>
                    </Flex>
                </Box>
            </Fade>
        </>
    );
};

export default Controls;