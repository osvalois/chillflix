// src/components/Auth/AuthProvider.tsx
import React, { useEffect, useState } from 'react';
import {   signOut as firebaseSignOut,GoogleAuthProvider, User, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { AuthContext } from './AuthContext';
import { auth } from '../../config/firebase';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (err) {
      setError('Error al iniciar sesión con Google. Por favor, intente de nuevo.');
      console.error('Error de inicio de sesión:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (err) {
      setError('Error al cerrar sesión. Por favor, intente de nuevo.');
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        error, 
        signInWithGoogle, 
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};