import React, { useState, useMemo, useCallback } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Box, useToast, Text, Spinner } from "@chakra-ui/react";
import { AnimatePresence, motion } from 'framer-motion';
import pako from 'pako';
import { DynamicIcon } from '../Movie/Icons';
import { Subtitle } from '../../services/subtitle-types';

interface SubtitleSelectorProps {
  subtitles: Subtitle[] | undefined;
  selectedSubtitle: Subtitle | null;
  onSubtitleChange: (subtitle: Subtitle | null, parsedCues: any[] | null) => void;
}

export const SubtitleSelector: React.FC<SubtitleSelectorProps> = ({
  subtitles,
  selectedSubtitle,
  onSubtitleChange
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });
  const toast = useToast();

  const glassStyles = {
    background: `linear-gradient(
      135deg, 
      ${isHovered ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)'}, 
      ${isHovered ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.03)'}
    )`,
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.14)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.14)',
    borderRight: '1px solid rgba(255, 255, 255, 0.07)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
    boxShadow: `
      0 2px 4px rgba(0, 0, 0, 0.12),
      0 1px 2px rgba(0, 0, 0, 0.08),
      inset 0 1px 1px rgba(255, 255, 255, 0.06),
      inset 0 -1px 1px rgba(0, 0, 0, 0.1)
    `,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const dropdownGlassStyles = {
    background: 'linear-gradient(180deg, rgba(28, 28, 28, 0.97), rgba(20, 20, 20, 0.99))',
    backdropFilter: 'blur(12px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.2)',
    boxShadow: `
      0 8px 20px rgba(0, 0, 0, 0.25),
      0 4px 8px rgba(0, 0, 0, 0.15),
      inset 0 1px 1px rgba(255, 255, 255, 0.05)
    `,
  };

  const getSize = useCallback(() => {
    if (isMobile) return { width: '44px', height: '32px' };
    if (isTablet) return { width: '130px', height: '32px' };
    return { width: '150px', height: '34px' };
  }, [isMobile, isTablet]);

  // Procesamiento de subtítulos mejorado
  const filteredSubtitles = useMemo(() => {
    // Log inicial de subtítulos recibidos
    console.log("Subtítulos recibidos:", subtitles);

    if (!Array.isArray(subtitles)) {
        console.warn("⚠️ Subtítulos no es un array:", typeof subtitles);
        return [];
    }

    console.log(`Procesando ${subtitles.length} subtítulos...`);

    // Validación de subtítulos
    const validSubtitles = subtitles.filter(subtitle => {
        const validation = {
            hasSubtitle: Boolean(subtitle),
            isObject: typeof subtitle === 'object',
            hasDownloadLink: Boolean(subtitle?.SubDownloadLink),
            isStringLink: typeof subtitle?.SubDownloadLink === 'string',
            endsWithGz: true
        };
        console.log('🔍 Validación de subtítulo:', {
          subtítulo: {
              id: subtitle?.IDSubtitle,
              idioma: subtitle?.LanguageName,
              link: subtitle?.SubDownloadLink
          },
          resultados: {
              ...validation,
              resumen: {
                  validacionesPasadas: Object.values(validation).filter(v => v).length,
                  validacionesTotales: Object.values(validation).length,
                  todasPasaron: Object.values(validation).every(v => v)
              }
          }
      });

        const isValid = Object.values(validation).every(v => v);

        if (!isValid) {
            console.warn("Subtítulo inválido:", {
                subtitle,
                validationResults: validation
            });
        }

        return isValid;
    });

    console.log(`Subtítulos válidos encontrados: ${validSubtitles.length}`, validSubtitles);

    // Agrupación por idioma
    const groupedSubtitles = validSubtitles.reduce((acc, subtitle) => {
        const key = `${subtitle.ISO639}-${subtitle.SubFormat}-${subtitle.SubHash}`;
        
        console.log(`Procesando subtítulo para idioma ${subtitle.ISO639}:`, {
            currentRating: subtitle.SubRating,
            existingRating: acc[subtitle.ISO639]?.subtitle.SubRating || 'ninguno'
        });

        if (!acc[subtitle.ISO639] || subtitle.SubRating > acc[subtitle.ISO639].subtitle.SubRating) {
            acc[subtitle.ISO639] = {
                subtitle,
                key
            };
            console.log(`✓ Seleccionado para ${subtitle.ISO639} con rating ${subtitle.SubRating}`);
        }
        return acc;
    }, {} as Record<string, { subtitle: Subtitle; key: string }>);

    console.log("Subtítulos agrupados:", groupedSubtitles);

    // Ordenamiento final
    const sortedSubtitles = Object.values(groupedSubtitles)
        .map(({ subtitle }) => subtitle)
        .sort((a, b) => {
            const result = a.LanguageName?.localeCompare(b.LanguageName || '') || 0;
            console.log(`Ordenando: ${a.LanguageName} vs ${b.LanguageName} = ${result}`);
            return result;
        });

    console.log("Resultado final de subtítulos filtrados y ordenados:", sortedSubtitles);

    return sortedSubtitles;
}, [subtitles]);

  // Funciones de parsing mejoradas
  const parseSrtFormat = useCallback((content: string) => {
    const subtitles = [];
    const blocks = content.trim().split(/\r?\n\r?\n/);
    
    for (const block of blocks) {
      const lines = block.split(/\r?\n/);
      if (lines.length >= 3) {
        const [, timecodes, ...textLines] = lines;
        const [start, end] = timecodes.split(' --> ').map(timeToSeconds);
        subtitles.push({
          start,
          end,
          text: textLines.join(' ')
        });
      }
    }
    
    return subtitles;
  }, []);

  const parseSubFormat = useCallback((content: string) => {
    const lines = content.split('\n');
    return lines.map(line => {
      const [timeCode, text] = line.split('}');
      const startTime = parseInt(timeCode.slice(1));
      return {
        start: startTime / 1000,
        end: (startTime + 5000) / 1000,
        text: text.trim()
      };
    });
  }, []);

  const timeToSeconds = (timeString: string) => {
    const [hours, minutes, seconds] = timeString.split(':').map(parseFloat);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const fetchAndParseSubtitle = async (subtitle: Subtitle) => {
    setIsLoading(true);
    try {
      const response = await fetch(subtitle.SubDownloadLink);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const arrayBuffer = await response.arrayBuffer();
      const inflated = pako.inflate(new Uint8Array(arrayBuffer));
      const text = new TextDecoder().decode(inflated);

      let parsedCues;
      if (subtitle.SubFormat === 'srt') {
        parsedCues = parseSrtFormat(text);
      } else if (subtitle.SubFormat === 'sub') {
        parsedCues = parseSubFormat(text);
      } else {
        throw new Error('Unsupported subtitle format');
      }

      onSubtitleChange(subtitle, parsedCues);
      toast({
        title: "Subtitles loaded",
        description: `${subtitle.LanguageName} subtitles enabled`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
        variant: "subtle",
      });
    } catch (error) {
      console.error("Error loading subtitle:", error);
      toast({
        title: "Error loading subtitles",
        description: "Please try another option or check your connection",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
        variant: "subtle",
      });
      onSubtitleChange(null, null);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const handleSubtitleChange = (subtitle: Subtitle | null) => {
    if (!subtitle) {
      onSubtitleChange(null, null);
      toast({
        title: "Subtitles disabled",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top-right",
        variant: "subtle",
      });
    } else {
      fetchAndParseSubtitle(subtitle);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = touchStart - e.touches[0].clientY;
    if (Math.abs(deltaY) > 10) {
      setIsOpen(false);
    }
  };

  // En SubtitleSelector.tsx
  if (!Array.isArray(subtitles) || filteredSubtitles.length === 0) {
    console.log("No se renderiza el selector:", {
        isArray: Array.isArray(subtitles),
        subtitlesLength: subtitles,
        filteredLength: filteredSubtitles
    });
    return null;
  }

  const SubtitleButton = () => (
    <motion.div
      initial={false}
      animate={{
        scale: isLoading ? 0.98 : 1,
      }}
      style={{
        ...glassStyles,
        ...getSize(),
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isLoading ? 'wait' : 'pointer',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !isLoading && setIsOpen(!isOpen)}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap="6px"
        color="rgba(255, 255, 255, 0.95)"
        fontSize="11px"
        fontWeight="600"
        letterSpacing="0.4px"
        px={2}
      >
        {isLoading ? (
          <Spinner size="sm" color="white" speed="0.8s" />
        ) : (
          <>
             <DynamicIcon name="Captions" color="#FFFFFF" size={16} />
            {!isMobile && (
              <Text as="span">
                {selectedSubtitle ? selectedSubtitle.LanguageName : 'Subtitles'}
              </Text>
            )}
          </>
        )}
      </Box>
    </motion.div>
  );

  const SubtitleDropdown = () => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 4, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.95 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'relative',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: isMobile ? '140px' : '180px',
            zIndex: 1000,
            ...dropdownGlassStyles,
            borderRadius: '10px',
            padding: '6px 4px',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          <motion.ul
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
            initial="hidden"
            animate="show"
            style={{ listStyle: 'none', padding: 0, margin: 0 }}
          >
            <motion.li
              variants={{
                hidden: { opacity: 0, y: 5 },
                show: { opacity: 1, y: 0 }
              }}
              onClick={() => handleSubtitleChange(null)}
              style={{
                padding: '8px 14px',
                color: !selectedSubtitle ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.85)',
                cursor: 'pointer',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: !selectedSubtitle ? '600' : '500',
                letterSpacing: '0.4px',
                margin: '2px 0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: !selectedSubtitle ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e: any) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e: any) => {
                e.currentTarget.style.backgroundColor = !selectedSubtitle ? 'rgba(255, 255, 255, 0.08)' : 'transparent';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Off</span>
              {!selectedSubtitle &&  <DynamicIcon name="Check" color="back" size={16} />}
            </motion.li>

            {filteredSubtitles.map((subtitle) => (
              <motion.li
                key={`${subtitle.ISO639}-${subtitle.SubFormat}-${subtitle.SubHash}`}
                variants={{
                  hidden: { opacity: 0, y: 5 },
                  show: { opacity: 1, y: 0 }
                }}
                onClick={() => handleSubtitleChange(subtitle)}
                style={{
                  padding: '8px 14px',
                  color: selectedSubtitle?.ISO639 === subtitle.ISO639 ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.85)',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: selectedSubtitle?.ISO639 === subtitle.ISO639 ? '600' : '500',
                  letterSpacing: '0.4px',
                  margin: '2px 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: selectedSubtitle?.ISO639 === subtitle.ISO639 ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.backgroundColor = selectedSubtitle?.ISO639 === subtitle.ISO639 ? 'rgba(255, 255, 255, 0.08)' : 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>{subtitle.LanguageName}</span>
                {selectedSubtitle?.ISO639 === subtitle.ISO639 && (
                   <DynamicIcon name="Check" color="black" size={16} />
                )}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <Box
      position="relative"
      role="combobox"
      aria-label="Select subtitles"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
        }
        if (e.key === 'Enter' || e.key === ' ') {
          setIsOpen(!isOpen);
        }
      }}
      tabIndex={0}
      _focus={{
        outline: 'none',
        boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
      }}
    >
      <motion.div
        initial={false}
        animate={{
          scale: isOpen ? 0.98 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <SubtitleButton />
      </motion.div>

      <SubtitleDropdown />

      {/* Overlay para cerrar el dropdown al hacer click fuera */}
      {isOpen && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={999}
          onClick={() => setIsOpen(false)}
        />
      )}
    </Box>
  );
};

export default React.memo(SubtitleSelector);