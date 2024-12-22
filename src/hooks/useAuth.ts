// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { 
  GoogleAuthProvider, 
  FacebookAuthProvider,
  TwitterAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { AuthState } from '../types/auth';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    user: null,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({
        isLoading: false,
        user,
        error: null
      });
    });

    return () => unsubscribe();
  }, []);

  const signInWithProvider = async (providerId: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const provider = getProvider(providerId);
      const result = await signInWithPopup(auth, provider);
      
      setAuthState({
        isLoading: false,
        user: result.user,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Authentication failed. Please try again.'
      }));
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: 'Sign out failed. Please try again.'
      }));
    }
  };

  const getProvider = (providerId: string) => {
    switch (providerId) {
      case 'google':
        return new GoogleAuthProvider();
      case 'facebook':
        return new FacebookAuthProvider();
      case 'twitter':
        return new TwitterAuthProvider();
      case 'github':
        return new GithubAuthProvider();
      default:
        throw new Error('Invalid provider');
    }
  };

  return {
    ...authState,
    signInWithProvider,
    signOut
  };
};