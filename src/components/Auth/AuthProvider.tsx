// src/providers/AuthProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { auth } from '../../config/firebase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // Verificar que el proveedor es Google
          if (result.providerId === GoogleAuthProvider.PROVIDER_ID) {
            // Verificar el token ID para seguridad adicional
            const idToken = await result.user.getIdToken();
            if (idToken) {
              setUser(result.user);
            } else {
              throw new Error('Invalid ID token');
            }
          }
        }
      } catch (err) {
        setError('Error de autenticación. Por favor, intente de nuevo.');
        console.error('Error en redirección:', err);
      }
    };

    // Verificar resultado de redirección al cargar
    handleRedirectResult();

    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Verificar que el usuario está autenticado con Google
        const isGoogleUser = currentUser.providerData.some(
          provider => provider.providerId === GoogleAuthProvider.PROVIDER_ID
        );
        
        if (isGoogleUser) {
          setUser(currentUser);
        } else {
          // Si no es un usuario de Google, cerrar sesión
          signOut(auth);
          setError('Solo se permite autenticación con Google');
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const provider = new GoogleAuthProvider();
      // Configurar el alcance para acceder solo a la información necesaria
      provider.addScope('profile');
      provider.addScope('email');
      
      // Forzar selección de cuenta
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      await signInWithRedirect(auth, provider);
    } catch (err) {
      setError('Error al iniciar sesión. Por favor, intente de nuevo.');
      console.error('Error de inicio de sesión:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      setUser(null);
    } catch (err) {
      setError('Error al cerrar sesión. Por favor, intente de nuevo.');
      console.error('Error de cierre de sesión:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isLoading,
    error,
    signInWithGoogle,
    signOut: handleSignOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};