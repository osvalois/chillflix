import React, { useState, useCallback } from 'react';
import { useMediaQuery } from 'react-responsive';

interface QualitySelectorProps {
  selectedQuality: string;
  availableQualities: string[];
  onQualityChange: (quality: string) => void;
}

export const QualitySelector: React.FC<QualitySelectorProps> = ({
  selectedQuality,
  availableQualities,
  onQualityChange,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isTablet = useMediaQuery({ maxWidth: 1024 });
  const [isHovered, setIsHovered] = useState(false);

  // Enhanced glass effect styles with deeper sophistication
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

  // Refined size adjustments
  const getSize = () => {
    if (isMobile) return { width: '44px', height: '32px' };
    if (isTablet) return { width: '130px', height: '32px' };
    return { width: '150px', height: '34px' };
  };

  // Mobile Menu Component with enhanced interactions
  const MobileMenu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [touchStart, setTouchStart] = useState(0);

    const handleTouchStart = (e: React.TouchEvent) => {
      setTouchStart(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      const deltaY = touchStart - e.touches[0].clientY;
      if (Math.abs(deltaY) > 10) {
        setIsOpen(false);
      }
    };

    return (
      <div
        className="relative"
        style={{
          ...glassStyles,
          ...getSize(),
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.95)',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.3px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0 8px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {selectedQuality}
        </button>

        {isOpen && (
          <ul
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
              minWidth: '100px',
              ...dropdownGlassStyles,
              borderRadius: '10px',
              padding: '6px 4px',
              listStyle: 'none',
              zIndex: 10,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {availableQualities.map((quality) => (
              <li
                key={quality}
                onClick={() => {
                  onQualityChange(quality);
                  setIsOpen(false);
                }}
                style={{
                  padding: '8px 14px',
                  color: quality === selectedQuality ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.85)',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: quality === selectedQuality ? '600' : '500',
                  letterSpacing: '0.3px',
                  transition: 'all 0.2s ease',
                  margin: '2px 0',
                  textAlign: 'center',
                  background: quality === selectedQuality ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  position: 'relative',
                  backdropFilter: 'blur(4px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = quality === selectedQuality ? 'rgba(255, 255, 255, 0.08)' : 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {quality}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // Desktop Select Component with enhanced visuals
  const DesktopSelect = () => {
    const handleMouseEnter = useCallback(() => setIsHovered(true), []);
    const handleMouseLeave = useCallback(() => setIsHovered(false), []);

    return (
      <div
        className="relative select-wrapper"
        style={{
          ...getSize(),
          position: 'relative'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <select
          value={selectedQuality}
          onChange={(e) => onQualityChange(e.target.value)}
          style={{
            ...glassStyles,
            width: '100%',
            height: '100%',
            borderRadius: '8px',
            padding: '0 28px 0 14px',
            color: 'rgba(255, 255, 255, 0.95)',
            appearance: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.3px',
            outline: 'none',
          }}
        >
          {availableQualities.map((quality) => (
            <option
              key={quality}
              value={quality}
              style={{
                background: 'rgba(18, 18, 18, 0.98)',
                color: 'rgba(255, 255, 255, 0.9)',
                padding: '10px',
                fontSize: '12px',
                fontWeight: '500',
              }}
            >
              {quality}
            </option>
          ))}
        </select>
        <div
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: isHovered ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.7)',
            fontSize: '8px',
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, 
              rgba(255, 255, 255, ${isHovered ? '0.15' : '0.1'}), 
              rgba(255, 255, 255, ${isHovered ? '0.1' : '0.05'})
            )`,
            borderRadius: '4px',
            transition: 'all 0.3s ease'
          }}
        >
          ▾
        </div>
      </div>
    );
  };

  return (
    <div 
      role="combobox" 
      aria-label="Select video quality"
      style={{
        position: 'relative',
        isolation: 'isolate'
      }}
    >
      {isMobile ? <MobileMenu /> : <DesktopSelect />}
    </div>
  );
};

export default QualitySelector;