import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Home, Send, Bug } from 'lucide-react';
import dayjs from 'dayjs';

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
    console.error('Error caught by boundary:', error, errorInfo);
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
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (error) {
      // Log error to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error details:', error);
      }
    }
  }, [error]);

  const handleSendFeedback = async () => {
    if (!feedbackText) return;
    
    setIsSendingFeedback(true);
    try {
      // Enviar feedback a tu servicio de gestión de errores
      console.log('Sending feedback:', {
        error: error?.toString(),
        feedback: feedbackText,
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-8 flex flex-col items-center space-y-6">
          <div className="text-center space-y-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              We're sorry for the inconvenience. The error has been logged.
            </p>
          </div>

          {error && (
            <div className="w-full">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-2"
              >
                <Bug className="h-4 w-4" />
                {showDetails ? 'Hide' : 'Show'} technical details
              </button>
              
              {showDetails && (
                <div className="mt-4 p-4 rounded-lg bg-gray-100 dark:bg-gray-900 font-mono text-sm text-red-600 dark:text-red-400 overflow-auto max-h-[200px]">
                  <p>{error.message}</p>
                  {errorInfo && <pre className="mt-2">{errorInfo.componentStack}</pre>}
                </div>
              )}
            </div>
          )}

          <div className="w-full space-y-4">
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="What were you trying to do when this happened? (optional)"
              className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={3}
            />
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                onClick={() => navigate('/')}
              >
                <Home className="h-5 w-5" />
                Return Home
              </button>

              <button
                className="flex-1 px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium flex items-center justify-center gap-2 transition-colors"
                onClick={onReset}
              >
                <RefreshCw className="h-5 w-5" />
                Try Again
              </button>

              {feedbackText && (
                <button
                  className="flex-1 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  onClick={handleSendFeedback}
                  disabled={isSendingFeedback}
                >
                  <Send className="h-5 w-5" />
                  Send Feedback
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;