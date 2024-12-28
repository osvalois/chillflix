import React from 'react';

interface SocialButtonProps {
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
}

export const GoogleSignInButton: React.FC<SocialButtonProps> = ({ 
  onClick, 
  className = '',
  disabled = false,
  loading = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        w-12 
        h-12 
        flex 
        items-center 
        justify-center 
        bg-white 
        rounded-full 
        border 
        border-gray-300 
        shadow-sm 
        transition-all 
        duration-200 
        hover:shadow-md 
        hover:bg-gray-50 
        active:scale-95 
        disabled:opacity-50 
        disabled:cursor-not-allowed
        ${className}
      `}
      aria-label="Sign in with Google"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      ) : (
        <img
          src="/google.svg"
          alt="Google Logo"
          className="w-6 h-6 object-contain"
          loading="eager"
          decoding="async"
          draggable={false}
        />
      )}
    </button>
  );
};

export default GoogleSignInButton;