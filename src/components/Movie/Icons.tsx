import { memo } from 'react';

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

// Base Icon Component with enhanced types
const createIcon = (path: JSX.Element) => {
  const Icon = memo(({ size = 24, className = '', color = 'currentColor' }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {path}
    </svg>
  ));
  return Icon;
};
const Money = createIcon(
    <>
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </>
  );
  Money.displayName = 'MoneyIcon';
// Media and Player Icons
const Film = createIcon(
  <path d="M19.82 2H4.18A2.18 2.18 0 0 0 2 4.18v15.64A2.18 2.18 0 0 0 4.18 22h15.64A2.18 2.18 0 0 0 22 19.82V4.18A2.18 2.18 0 0 0 19.82 2zM7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5" />
);
Film.displayName = 'FilmIcon';

const Play = createIcon(
  <polygon points="5 3 19 12 5 21" fill="currentColor" stroke="none" />
);
Play.displayName = 'PlayIcon';

const Pause = createIcon(
  <>
    <rect x="6" y="4" width="4" height="16" fill="currentColor" stroke="none" />
    <rect x="14" y="4" width="4" height="16" fill="currentColor" stroke="none" />
  </>
);
Pause.displayName = 'PauseIcon';

const Tv = createIcon(
  <>
    <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
    <polyline points="17 2 12 7 7 2" />
  </>
);
Tv.displayName = 'TvIcon';

const Music = createIcon(
  <>
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </>
);
Music.displayName = 'MusicIcon';

const Volume = createIcon(
  <>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </>
);
Volume.displayName = 'VolumeIcon';

const VolumeMute = createIcon(
  <>
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </>
);
VolumeMute.displayName = 'VolumeMuteIcon';

// Navigation and UI Icons
const Home = createIcon(
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
);
Home.displayName = 'HomeIcon';

const Menu = createIcon(
  <>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </>
);
Menu.displayName = 'MenuIcon';

const ArrowLeft = createIcon(
  <>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </>
);
ArrowLeft.displayName = 'ArrowLeftIcon';

const ArrowRight = createIcon(
  <>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </>
);
ArrowRight.displayName = 'ArrowRightIcon';

// Status and Rating Icons
const Star = createIcon(
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" stroke="none" />
);
Star.displayName = 'StarIcon';

const StarOutline = createIcon(
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
);
StarOutline.displayName = 'StarOutlineIcon';

const Heart = createIcon(
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor" stroke="none" />
);
Heart.displayName = 'HeartIcon';

const HeartOutline = createIcon(
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
);
HeartOutline.displayName = 'HeartOutlineIcon';

// Time and Calendar Icons
const Clock = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>
);
Clock.displayName = 'ClockIcon';

const Calendar = createIcon(
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </>
);
Calendar.displayName = 'CalendarIcon';

// Action Icons
const Edit = createIcon(
  <>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </>
);
Edit.displayName = 'EditIcon';

const Trash = createIcon(
  <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </>
);
Trash.displayName = 'TrashIcon';

const Download = createIcon(
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </>
);
Download.displayName = 'DownloadIcon';

const Share = createIcon(
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </>
);
Share.displayName = 'ShareIcon';

// Navigation and Search
const Search = createIcon(
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </>
);
Search.displayName = 'SearchIcon';

const ChevronUp = createIcon(
  <polyline points="18 15 12 9 6 15" />
);
ChevronUp.displayName = 'ChevronUpIcon';

const ChevronDown = createIcon(
  <polyline points="6 9 12 15 18 9" />
);
ChevronDown.displayName = 'ChevronDownIcon';

const ChevronLeft = createIcon(
  <polyline points="15 18 9 12 15 6" />
);
ChevronLeft.displayName = 'ChevronLeftIcon';

const ChevronRight = createIcon(
  <polyline points="9 18 15 12 9 6" />
);
ChevronRight.displayName = 'ChevronRightIcon';

// Settings and Control Icons
const Settings = createIcon(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </>
);
Settings.displayName = 'SettingsIcon';

const Filter = createIcon(
  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
);
Filter.displayName = 'FilterIcon';

const Refresh = createIcon(
  <>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </>
);
Refresh.displayName = 'RefreshIcon';

// User Interface Icons
const User = createIcon(
  <>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>
);
User.displayName = 'UserIcon';

const Bell = createIcon(
  <>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </>
);
Bell.displayName = 'BellIcon';

const Close = createIcon(
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>
);
Close.displayName = 'CloseIcon';

// Alert and Status Icons
// Alert and Status Icons (continued)
const Warning = createIcon(
    <>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>
  );
  Warning.displayName = 'WarningIcon';
  
const Keyboard = createIcon(
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
      <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10" />
    </>
  );
  Keyboard.displayName = 'KeyboardIcon';
  
  const Error = createIcon(
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </>
  );
  Error.displayName = 'ErrorIcon';
  
  const Info = createIcon(
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  );
  Info.displayName = 'InfoIcon';
  
  const Success = createIcon(
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </>
  );
  Success.displayName = 'SuccessIcon';
  const Add = createIcon(
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  );
  Add.displayName = 'AddIcon';
  // Additional Media Icons
  const FastForward = createIcon(
    <>
      <polygon points="13 19 22 12 13 5 13 19" />
      <polygon points="2 19 11 12 2 5 2 19" />
    </>
  );
  FastForward.displayName = 'FastForwardIcon';
  
  const Rewind = createIcon(
    <>
      <polygon points="11 19 2 12 11 5 11 19" />
      <polygon points="22 19 13 12 22 5 22 19" />
    </>
  );
  Rewind.displayName = 'RewindIcon';
  
  const Shuffle = createIcon(
    <>
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </>
  );
  Shuffle.displayName = 'ShuffleIcon';
  
  const Repeat = createIcon(
    <>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </>
  );
  Repeat.displayName = 'RepeatIcon';
  const VolumeUp = createIcon(
    <>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <path d="M22.61 1.39a15 15 0 0 1 0 21.22" />
    </>
  );
  VolumeUp.displayName = 'VolumeUpIcon';
  
  const Mute = createIcon(
    <>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </>
  );
  Mute.displayName = 'MuteIcon'

  const Check = createIcon(
    <polyline points="20 6 9 17 4 12" />
  );
  Check.displayName = 'CheckIcon';
  
  // Define el icono Captions
  const Captions = createIcon(
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" />
      <path d="M8 10h8" />
      <path d="M6 14h12" />
    </>
  );
  Captions.displayName = 'CaptionsIcon';
  const Imdb = createIcon(
    <>
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2" fill="currentColor" stroke="none"/>
      <path d="M5 8v8h2V8H5zm3 0v8h2.5v-2l1 2h2l-1.3-2.5L13.5 11h-1.8l-1.2 2.3V8H8zm7.5 0c-.3 0-.5.2-.5.5v7c0 .3.2.5.5.5h2c1.4 0 2.5-1.1 2.5-2.5v-3c0-1.4-1.1-2.5-2.5-2.5h-2zm.5 2h1.5c.3 0 .5.2.5.5v3c0 .3-.2.5-.5.5H16v-4z" fill="white" stroke="none"/>
    </>
  );
  Imdb.displayName = 'ImdbIcon';
  
  // Logo de Instagram
  const Instagram = createIcon(
    <>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </>
  );
  Instagram.displayName = 'InstagramIcon';
  
  // Logo de Twitter
  const Twitter = createIcon(
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5 0-.278-.028-.556-.08-.83A7.72 7.72 0 0 0 23 3z" />
  );
  Twitter.displayName = 'TwitterIcon';
  
  // Logo de Facebook
  const Facebook = createIcon(
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  );
  Facebook.displayName = 'FacebookIcon';
  
  // Logo de Wikipedia
  const Wikipedia = createIcon(
    <>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M14.5 8l-2.5 8-2.5-8m-2 0l-2.5 8m12.5-8l-2.5 8" stroke="white" strokeWidth="1.5" />
    </>
  );
  Wikipedia.displayName = 'WikipediaIcon';
  
  // Círculo de información
  const InfoCircle = createIcon(
    <>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </>
  );
  InfoCircle.displayName = 'InfoCircleIcon';

  const Building = createIcon(
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22V6h6v16" />
      <path d="M8 6h8" />
      <path d="M8 10h8" />
      <path d="M8 14h8" />
      <path d="M8 18h8" />
    </>
  );
  Building.displayName = 'BuildingIcon';
  const Compress = createIcon(
    <>
      <path d="M4 14h6v6m10-10h-6V4M4 10v4h16v-4" />
    </>
  );
  Compress.displayName = 'CompressIcon';
  const Expand = createIcon(
    <>
      <path d="M4 14h6v6M4 10V4h16v16H14m-4-4h6" />
    </>
  );
  Expand.displayName = 'ExpandIcon';

  const Sort = createIcon(
  <>
    <path d="M10 3h4v16h-4z" />
    <path d="M4 8h16" />
    <path d="M4 16h16" />
  </>
);
Sort.displayName = 'SortIcon';

const ThumbsUp = createIcon(
  <>
    <path d="M7 12c0 4 3 5 5 5s5-1 5-5V4h4v8c0 4-3 8-9 8s-9-4-9-8v-4h4v4z" />
    <path d="M2 8h4v12H2z" />
  </>
);
ThumbsUp.displayName = 'ThumbsUpIcon';

const History = createIcon(
    <>
      <path d="M12 2v4" />
      <path d="M9 6l3-3 3 3" />
      <path d="M13 6H9a6 6 0 1 0 6 6" />
      <path d="M12 12v-3" />
    </>
  );
  History.displayName = 'HistoryIcon';
  
  const Times = createIcon(
    <>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </>
  );
  Times.displayName = 'TimesIcon';

  // Enhanced Icon Collection
  export const Icons = {
    // Media and Player Icons
    Add,
    InfoCircle,
    History, 
    Times,
    Expand,
    Compress,
    Sort, 
    ThumbsUp,
    Building,
    Instagram,
    Imdb,
    Check,
    Wikipedia,
    Facebook,
    Captions,
    Film,
    Mute,
    Twitter,
    VolumeUp,
    Money,
    Keyboard,
    Play,
    Pause,
    Tv,
    Music,
    Volume,
    VolumeMute,
    FastForward,
    Rewind,
    Shuffle,
    Repeat,
    
    // Navigation and UI Icons
    Home,
    Menu,
    ArrowLeft,
    ArrowRight,
    
    // Status and Rating Icons
    Star,
    StarOutline,
    Heart,
    HeartOutline,
    
    // Time and Calendar Icons
    Clock,
    Calendar,
    
    // Action Icons
    Edit,
    Trash,
    Download,
    Share,
    
    // Navigation and Search
    Search,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    
    // Settings and Control Icons
    Settings,
    Filter,
    Refresh,
    
    // User Interface Icons
    User,
    Bell,
    Close,
    
    // Alert and Status Icons
    Warning,
    Error,
    Info,
    Success,
  } as const;
  
  // Enhanced Type Helpers
  export type IconName = keyof typeof Icons;
  export type IconVariant = 'solid' | 'outline';
  export type IconStyle = 'default' | 'warning' | 'error' | 'info' | 'success' | 'primary' | 'secondary';
  
  // Enhanced Dynamic Icon Component
  export const DynamicIcon = memo(({ 
    name, 
    variant = 'solid',
    style = 'default',
    ...props 
  }: IconProps & { 
    name: IconName;
    variant?: IconVariant;
    style?: IconStyle;
  }) => {
    const getIconName = () => {
      if (variant === 'outline' && (name === 'Star' || name === 'Heart')) {
        return `${name}Outline` as IconName;
      }
      return name;
    };
  
    const getIconColor = () => {
      const colors = {
        default: props.color || 'currentColor',
        primary: 'blue.400',
        secondary: 'purple.400',
        warning: 'orange.400',
        error: 'red.400',
        info: 'blue.400',
        success: 'green.400'
      };
      return colors[style];
    };
  
    const IconComponent = Icons[getIconName()];
    return <IconComponent {...props} color={getIconColor()} />;
  });
  
  DynamicIcon.displayName = 'DynamicIcon';
  
  // Enhanced Icon Style Utility
  export const getIconStyle = (variant: IconStyle) => {
    const styles = {
      default: {
        color: 'gray.400',
        hoverColor: 'gray.500',
      },
      primary: {
        color: 'blue.400',
        hoverColor: 'blue.500',
      },
      secondary: {
        color: 'purple.400',
        hoverColor: 'purple.500',
      },
      warning: {
        color: 'orange.400',
        hoverColor: 'orange.500',
      },
      error: {
        color: 'red.400',
        hoverColor: 'red.500',
      },
      info: {
        color: 'blue.400',
        hoverColor: 'blue.500',
      },
      success: {
        color: 'green.400',
        hoverColor: 'green.500',
      },
    };
  
    return styles[variant];
  };
  
  export default Icons;