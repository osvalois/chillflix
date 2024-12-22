import { useState } from 'react';
import { Play } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EnhancedPlayButtonProps {
    contentType: string;
    contentId: string;
  }
  
  const EnhancedPlayButton = ({ contentType, contentId }: EnhancedPlayButtonProps) => {
  
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      to={`/${contentType}/${contentId}`}
      className={`
        inline-flex items-center gap-2
        px-6 py-3
        rounded-full
        bg-white/20
        text-white font-medium
        transform transition-all duration-300 ease-in-out
        hover:bg-white/30 
        active:bg-white/40
        ${isHovered ? 'translate-y-[-4px] shadow-lg' : 'translate-y-0 shadow-md'}
        group
        relative
        overflow-hidden
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={`
        absolute inset-0 
        bg-gradient-to-r from-white/0 via-white/25 to-white/0
        transform transition-transform duration-1000
        ${isHovered ? 'translate-x-full' : '-translate-x-full'}
      `}/>
      
      <span className={`
        relative
        flex items-center gap-2
        transform transition-transform duration-300
        ${isHovered ? 'scale-105' : 'scale-100'}
      `}>
        <Play 
          className={`
            transform transition-all duration-300
            ${isHovered ? 'translate-x-1' : 'translate-x-0'}
          `}
          size={20}
        />
        <span className="relative z-10">Play</span>
      </span>

      <span className={`
        absolute -inset-[100%]
        bg-white/5
        animate-pulse
        rounded-full
        transition-opacity duration-300
        ${isHovered ? 'opacity-100' : 'opacity-0'}
      `}/>
    </Link>
  );
};

export default EnhancedPlayButton;