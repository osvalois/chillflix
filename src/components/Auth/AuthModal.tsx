// src/components/Auth/AuthModal.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X, ArrowRight, Shield, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Player } from '@lottiefiles/react-lottie-player';
import { AuthProviderConfig } from '../../types/auth';

const providers: AuthProviderConfig[] = [
  {
    id: 'google',
    name: 'Google',
    icon: '/icons/google.svg',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    textColor: '#1a1a1a',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '/icons/facebook.svg',
    backgroundColor: 'rgba(24, 119, 242, 0.8)',
    textColor: '#ffffff',
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '/icons/twitter.svg',
    backgroundColor: 'rgba(29, 161, 242, 0.8)',
    textColor: '#ffffff',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: '/icons/github.svg',
    backgroundColor: 'rgba(36, 41, 46, 0.8)',
    textColor: '#ffffff',
  }
];

const features = [
  {
    icon: Shield,
    title: 'Secure Authentication',
    description: 'Your data is protected with industry-standard encryption'
  },
  {
    icon: Lock,
    title: 'Privacy First',
    description: 'We never share your personal information'
  },
  {
    icon: CheckCircle,
    title: 'Instant Access',
    description: 'Start streaming your favorite content immediately'
  }
];

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 400
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  }
};

// Styled components using template literals for better type safety
const StyledOverlay = React.forwardRef<
  HTMLDivElement,
  DialogPrimitive.DialogOverlayProps
>((props, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className="fixed inset-0 bg-black/40 backdrop-blur-md z-50"
    {...props}
  />
));
StyledOverlay.displayName = 'StyledOverlay';

const StyledContent = React.forwardRef<
  HTMLDivElement,
  DialogPrimitive.DialogContentProps
>((props, ref) => (
  <DialogPrimitive.Content
    ref={ref}
    className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg
               bg-white/20 dark:bg-gray-900/20 rounded-2xl shadow-2xl z-50
               backdrop-blur-xl backdrop-saturate-150 border border-white/20
               dark:border-gray-700/30"
    {...props}
  />
));
StyledContent.displayName = 'StyledContent';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { isLoading, error, signInWithProvider } = useAuth();
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleProviderClick = async (providerId: string) => {
    try {
      setActiveProvider(providerId);
      await signInWithProvider(providerId);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setActiveProvider(null);
    }
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <DialogPrimitive.Portal forceMount>
            <StyledOverlay asChild forceMount>
              <motion.div
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              />
            </StyledOverlay>

            <StyledContent asChild forceMount>
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Close Button */}
                <DialogPrimitive.Close className="absolute top-4 right-4 p-2 rounded-full
                                                hover:bg-white/10 dark:hover:bg-black/10
                                                transition-colors duration-200">
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </DialogPrimitive.Close>

                <div className="p-8">
                  {/* Logo Animation */}
                  <div className="mb-6 flex justify-center">
                    <Player
                      autoplay
                      loop
                      src="/animations/logo-animation.json"
                      style={{ height: '80px', width: '80px' }}
                    />
                  </div>

                  {/* Title and Subtitle */}
                  <div className="text-center mb-8">
                    <DialogPrimitive.Title className="text-3xl font-bold bg-gradient-to-r 
                                                    from-blue-400 to-purple-400 
                                                    bg-clip-text text-transparent">
                      Welcome to ChillFlix
                    </DialogPrimitive.Title>
                    <DialogPrimitive.Description className="mt-2 text-gray-600 dark:text-gray-400">
                      Continue with your preferred login method
                    </DialogPrimitive.Description>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 mb-6 text-sm text-red-500 bg-red-100/80 dark:bg-red-900/20 
                                 rounded-lg flex items-center gap-2 backdrop-blur-sm"
                      >
                        <Shield size={16} />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Success Message */}
                  <AnimatePresence>
                    {isSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 mb-6 text-sm text-green-500 bg-green-100/80 dark:bg-green-900/20 
                                 rounded-lg flex items-center gap-2 backdrop-blur-sm"
                      >
                        <CheckCircle size={16} />
                        <span>Successfully logged in! Redirecting...</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Provider Buttons */}
                  <div className="space-y-3">
                    {providers.map((provider) => (
                      <motion.button
                        key={provider.id}
                        onClick={() => handleProviderClick(provider.id)}
                        disabled={isLoading}
                        className="w-full p-4 rounded-lg flex items-center justify-between
                                 transition-all duration-200 backdrop-blur-sm
                                 hover:shadow-lg hover:scale-[1.02]
                                 active:scale-[0.98] disabled:opacity-50"
                        style={{
                          backgroundColor: provider.backgroundColor,
                          color: provider.textColor
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={provider.icon} 
                            alt={provider.name} 
                            className="w-5 h-5"
                          />
                          <span className="font-medium">
                            Continue with {provider.name}
                          </span>
                        </div>
                        {activeProvider === provider.id && isLoading ? (
                          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                               style={{ borderColor: `${provider.textColor} transparent transparent` }}
                          />
                        ) : (
                          <ArrowRight size={20} />
                        )}
                      </motion.button>
                    ))}
                  </div>

                  {/* Features Section */}
                  <div className="mt-8 pt-8 border-t border-white/10 dark:border-gray-700/30">
                    <div className="grid grid-cols-3 gap-4">
                      {features.map(({ icon: Icon, title, description }) => (
                        <div key={title} className="text-center p-4 rounded-lg
                                                  bg-white/5 dark:bg-black/5 backdrop-blur-sm">
                          <Icon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                          <h3 className="text-sm font-medium mb-1 text-gray-800 dark:text-gray-200">
                            {title}
                          </h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terms and Privacy */}
                  <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
                    By continuing, you agree to our{' '}
                    <button className="underline hover:text-gray-700 dark:hover:text-gray-300">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button className="underline hover:text-gray-700 dark:hover:text-gray-300">
                      Privacy Policy
                    </button>
                  </p>
                </div>
              </motion.div>
            </StyledContent>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
};

export default AuthModal;