import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Player } from '@lottiefiles/react-lottie-player';
import { useDebounce } from 'use-debounce';
import { RefreshCw, Home, Send, Bug } from 'lucide-react';
import axios from 'axios';
import dayjs from 'dayjs';

// Error animation JSON
const ERROR_ANIMATION = {
  // Add your Lottie animation JSON here
};

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<any>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    this.props.onError?.(error, errorInfo);
    
    // Log error to your error tracking service
    this.logError(error, errorInfo);
  }

  private async logError(error: Error, errorInfo: ErrorInfo) {
    try {
      await axios.post('/api/error-logging', {
        error: error.toString(),
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: dayjs().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  public componentDidUpdate(prevProps: Props) {
    if (this.props.resetKeys && 
        this.state.hasError && 
        this.props.resetKeys !== prevProps.resetKeys) {
      this.reset();
    }
  }

  private reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.reset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  errorInfo,
  onReset 
}) => {
  const navigate = useNavigate();
  const [feedbackText, setFeedbackText] = useState('');
  const [debouncedFeedback] = useDebounce(feedbackText, 500);
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Track error occurrence
    if (error) {
      // Add your analytics tracking here
    }
  }, [error]);

  const handleSendFeedback = async () => {
    if (!debouncedFeedback) return;
    
    setIsSendingFeedback(true);
    try {
      await axios.post('/api/error-feedback', {
        error: error?.toString(),
        feedback: debouncedFeedback,
        timestamp: dayjs().toISOString()
      });
      setFeedbackText('');
    } catch (e) {
      console.error('Failed to send feedback:', e);
    } finally {
      setIsSendingFeedback(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4"
      >
        <motion.div 
          className="w-full max-w-2xl backdrop-blur-xl bg-white/10 rounded-xl shadow-2xl border border-white/20 overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="p-8 flex flex-col items-center space-y-6">
            {/* Error Animation */}
            <Player
              autoplay
              loop
              src={ERROR_ANIMATION}
              style={{ height: '200px', width: '200px' }}
            />

            <div className="text-center space-y-3">
              <motion.h1 
                className="text-4xl font-bold text-white"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Oops! Something went wrong
              </motion.h1>
              <p className="text-gray-300 text-lg">
                We're sorry for the inconvenience. Our team has been notified.
              </p>
            </div>

            {error && (
              <motion.div 
                className="w-full"
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
              >
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-2"
                >
                  <Bug size={16} />
                  {showDetails ? 'Hide' : 'Show'} technical details
                </button>
                
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-4 rounded-lg bg-black/30 font-mono text-sm text-red-400 overflow-auto max-h-[200px]"
                  >
                    <p>{error.message}</p>
                    {errorInfo && <pre className="mt-2">{errorInfo.componentStack}</pre>}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Feedback Section */}
            <motion.div 
              className="w-full space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="What were you trying to do when this happened? (optional)"
                className="w-full p-3 rounded-lg bg-black/20 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                rows={3}
              />
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                  onClick={() => navigate('/')}
                >
                  <Home size={20} />
                  Return Home
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                  onClick={onReset}
                >
                  <RefreshCw size={20} />
                  Try Again
                </motion.button>

                {feedbackText && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    onClick={handleSendFeedback}
                    disabled={isSendingFeedback}
                  >
                    <Send size={20} />
                    Send Feedback
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ErrorBoundary;