// src/components/Auth/AuthScreen.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '@lottiefiles/react-lottie-player';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/Auth/AuthProvider';

const googleProvider = {
  id: 'google',
  name: 'Google',
  icon: '/icons/google.svg',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  textColor: '#1a1a1a',
  hoverColor: 'rgba(248, 249, 250, 0.9)'
};

export const Auth: React.FC = () => {
  const { signInWithGoogle, isLoading, error } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    try {
      setIsAuthenticating(true);
      await signInWithGoogle();
      setIsSuccess(true);
      // Esperar un momento antes de redirigir para mostrar la animación de éxito
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setIsAuthenticating(false);
      // El error ya está manejado en el AuthProvider
      console.error('Auth error:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black"
    >
      <div className="w-full max-w-lg p-8 relative">
        {/* Background Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-gradient-x" />
        
        <div className="relative bg-white/10 dark:bg-gray-900/20 rounded-2xl p-8 backdrop-blur-xl shadow-2xl border border-white/20">
          {/* Logo Animation */}
          <div className="mb-8 flex justify-center">
            <Player
              autoplay
              loop
              src="/animations/logo-animation.json"
              style={{ height: '120px', width: '120px' }}
            />
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-12">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4"
            >
              Welcome to ChillFlix
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400"
            >
              Sign in to start streaming your favorite content
            </motion.p>
          </div>

          {/* Auth Button */}
          <AnimatePresence>
            <motion.button
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              onClick={handleGoogleSignIn}
              disabled={isLoading || isAuthenticating}
              className="w-full p-4 rounded-lg flex items-center justify-between
                       transition-all duration-200 backdrop-blur-sm
                       hover:shadow-lg disabled:opacity-50"
              style={{
                backgroundColor: googleProvider.backgroundColor,
                color: googleProvider.textColor
              }}
              whileHover={{ scale: 1.02, backgroundColor: googleProvider.hoverColor }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <img 
                  src={googleProvider.icon} 
                  alt={googleProvider.name} 
                  className="w-6 h-6"
                />
                <span className="font-medium">
                  Continue with {googleProvider.name}
                </span>
              </div>
              {isAuthenticating ? (
                <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight size={24} />
              )}
            </motion.button>
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400"
              >
                <p className="text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-sm">Successfully logged in! Redirecting...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <button className="text-blue-400 hover:text-blue-300 underline">
                Terms of Service
              </button>{' '}
              and{' '}
              <button className="text-blue-400 hover:text-blue-300 underline">
                Privacy Policy
              </button>
            </p>
            <p className="text-xs text-gray-500">
              We'll never post anything without your permission
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};