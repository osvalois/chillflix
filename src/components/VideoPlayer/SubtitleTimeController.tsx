import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box,
  Flex,
  Text,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  VStack,
  HStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Progress
} from '@chakra-ui/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Save,
  Clock,
  Wand2,
  Brain,
} from 'lucide-react';
import { formatTime } from '../../utils/utils';

interface SubtitleTimeControllerProps {
  currentTime: number;
  duration: number;
  offsetSeconds: number;
  onOffsetChange: (offset: number) => void;
  onSaveOffset: (offset: number) => void;
  isPlaying?: boolean;
  subtitleData?: Array<{
    start: number;
    end: number;
    text: string;
  }>;
}

const SubtitleTimeController: React.FC<SubtitleTimeControllerProps> = ({
  currentTime,
  duration,
  offsetSeconds,
  onOffsetChange,
  isPlaying = false,
  subtitleData = []
}) => {
  const [localOffset] = useState(offsetSeconds);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const analyzeTimeoutRef = useRef<NodeJS.Timeout>();

  // Estilos para glasmorfismo
  const glassStyles = {
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
    borderRadius: "20px",
  };

  // Simular análisis de IA
  const analyzeSubtitleSync = useCallback(async () => {
    if (!subtitleData.length) {
      toast({
        title: "No hay datos de subtítulos",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalyzingProgress(0);
    onOpen();

    try {
      // Simular análisis de audio y subtítulos
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => {
          analyzeTimeoutRef.current = setTimeout(resolve, 300);
        });
        setAnalyzingProgress(i);
      }

      // Calcular offset "óptimo" basado en los datos de subtítulos
      const sampleSize = Math.min(5, subtitleData.length);
      let suggestedOffset = 0;

      for (let i = 0; i < sampleSize; i++) {
        const subtitle = subtitleData[i];
        // Simular detección de diálogo en el audio
        const simulatedAudioTime = subtitle.start + (Math.random() * 0.3 - 0.15);
        suggestedOffset += (simulatedAudioTime - subtitle.start);
      }

      suggestedOffset = Number((suggestedOffset / sampleSize).toFixed(3));

      // Aplicar el offset sugerido
      onOffsetChange(suggestedOffset);
      
      toast({
        title: "Análisis completado",
        description: `Offset sugerido: ${suggestedOffset}s`,
        status: "success",
        duration: 4000,
      });
    } catch (error) {
      toast({
        title: "Error en el análisis",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsAnalyzing(false);
      onClose();
    }
  }, [subtitleData, toast, onOpen, onClose]);

  useEffect(() => {
    return () => {
      if (analyzeTimeoutRef.current) {
        clearTimeout(analyzeTimeoutRef.current);
      }
    };
  }, []);

    function handleResetOffset(): void {
        throw new Error('Function not implemented.');
    }

  // ... (resto de funciones existentes)

  return (
    <>
      <Box p={6} {...glassStyles}>
        <VStack spacing={6} align="stretch">
          {/* Encabezado con tiempo y botón de IA */}
          <Flex justify="space-between" align="center">
            <VStack align="start" spacing={1}>
              <Text fontSize="sm" fontWeight="medium">
                Tiempo actual: {formatTime(currentTime)}
              </Text>
              <Text fontSize="xs" color="whiteAlpha.700">
                Duración total: {formatTime(duration)}
              </Text>
            </VStack>
            <Button
              leftIcon={<Wand2 size={16} />}
              size="sm"
              onClick={analyzeSubtitleSync}
              isLoading={isAnalyzing}
              loadingText="Analizando"
              colorScheme="purple"
              variant="ghost"
              _hover={{ bg: "whiteAlpha.200" }}
            >
              Auto-Sync
            </Button>
          </Flex>

          {/* Control principal mejorado */}
          <Box>
            <Flex align="center" gap={4} mb={4}>
              <IconButton
                aria-label="Reducir offset"
                icon={<ChevronLeft />}
                variant="ghost"
                _hover={{ bg: "whiteAlpha.200" }}
    
                isDisabled={isPlaying}
              />

              <Slider
                min={-10}
                max={10}
                step={0.001}
                value={localOffset}
                onChange={onOffsetChange}
                onChangeStart={() => setIsAdjusting(true)}
                onChangeEnd={() => setIsAdjusting(false)}
                isDisabled={isPlaying}
                flex={1}
              >
                <SliderTrack bg="whiteAlpha.200">
                  <SliderFilledTrack bg="purple.400" />
                </SliderTrack>
                <Tooltip
                  hasArrow
                  label={`${localOffset.toFixed(3)}s`}
                  placement="top"
                  isOpen={isAdjusting}
                  bg="purple.500"
                >
                  <SliderThumb boxSize={6} borderWidth={2} borderColor="purple.400">
                    <Box color="purple.400" as={Clock} size={10} />
                  </SliderThumb>
                </Tooltip>
              </Slider>

              <IconButton
                aria-label="Aumentar offset"
                icon={<ChevronRight />}
                variant="ghost"
                _hover={{ bg: "whiteAlpha.200" }}

                isDisabled={isPlaying}
              />
            </Flex>

            {/* Controles numéricos y botones */}
            <Flex justify="space-between" align="center">
              <NumberInput
                value={localOffset}
                onChange={(_, value) => onOffsetChange(value)}
                step={0.1}
                min={-10}
                max={10}
                size="sm"
                w="120px"
                isDisabled={isPlaying}
                borderColor="whiteAlpha.300"
              >
                <NumberInputField bg="whiteAlpha.50" />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>

              <HStack spacing={2}>
                <Button
                  size="sm"
                  leftIcon={<RotateCcw size={14} />}
                  onClick={handleResetOffset}
                  variant="ghost"
                  _hover={{ bg: "whiteAlpha.200" }}
                >
                  Restablecer
                </Button>
                <Button
                  size="sm"
                  leftIcon={<Save size={14} />}
              
                  colorScheme="purple"
                >
                  Guardar
                </Button>
              </HStack>
            </Flex>
          </Box>

          {isPlaying && (
            <Text fontSize="xs" color="yellow.300" textAlign="center">
              ⚠️ Pausa el video para ajustar los subtítulos
            </Text>
          )}
        </VStack>
      </Box>

      {/* Modal de análisis */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent bg="rgba(20, 20, 20, 0.95)" {...glassStyles}>
          <ModalHeader>
            <Flex align="center" gap={2}>
              <Brain size={20} />
              <Text>Analizando subtítulos</Text>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Box w="full">
                <Progress
                  value={analyzingProgress}
                  size="sm"
                  colorScheme="purple"
                  borderRadius="full"
                  isAnimated
                  hasStripe
                />
              </Box>
              <Text fontSize="sm" color="whiteAlpha.700">
                Procesando audio y sincronización...
              </Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default React.memo(SubtitleTimeController);