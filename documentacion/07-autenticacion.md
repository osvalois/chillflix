# Sistema de Autenticación

ChillFlix implementa un sistema de autenticación completo utilizando Firebase Authentication. Esta sección documenta la arquitectura, componentes, flujos y mejores prácticas relacionadas con la autenticación en la aplicación.

## Arquitectura de Autenticación

El sistema de autenticación está implementado mediante Context API de React y Firebase, siguiendo estos principios:

1. **Centralización**: Toda la lógica de autenticación está centralizada en un proveedor de contexto
2. **Separación de Responsabilidades**: La UI está separada de la lógica de autenticación
3. **Persistencia**: Estado de autenticación persistente entre sesiones
4. **Seguridad**: Implementación de mejores prácticas de seguridad

## Componentes Principales

### AuthProvider

El `AuthProvider` es el componente central que gestiona el estado de autenticación y proporciona métodos relacionados a toda la aplicación.

**Archivo**: `/src/components/Auth/AuthProvider.tsx`

**Responsabilidades**:
- Inicializar Firebase Authentication
- Escuchar cambios en el estado de autenticación
- Proporcionar estado y métodos de autenticación a la aplicación
- Manejar errores de autenticación
- Persistir sesión de usuario

**Implementación**:

```tsx
import { createContext, useEffect, useState, ReactNode } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { firebaseApp } from '../../config/firebase';

// Contexto
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// Proveedor
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const auth = getAuth(firebaseApp);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    }, (error) => {
      setError(error);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [auth]);
  
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const signOut = async () => {
    try {
      setLoading(true);
      await firebaseSignOut(auth);
    } catch (error) {
      setError(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    user,
    loading,
    error,
    signIn,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### AuthContext

Contexto que proporciona acceso al estado y métodos de autenticación.

**Archivo**: `/src/components/Auth/AuthContext.tsx`

**Propósito**: Define la interfaz del contexto de autenticación.

### useAuth Hook

Hook personalizado para acceder fácilmente al contexto de autenticación.

**Archivo**: `/src/hooks/useAuth.ts`

**Implementación**:

```tsx
import { useContext } from 'react';
import { AuthContext, AuthContextType } from '../components/Auth/AuthContext';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
```

**Uso**:

```tsx
function ProfileButton() {
  const { user, signOut, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginButton />;
  }
  
  return (
    <div>
      <img src={user.photoURL || ''} alt="Profile" />
      <span>{user.displayName}</span>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

### RequireAuth

Componente HOC (Higher-Order Component) para proteger rutas que requieren autenticación.

**Archivo**: `/src/components/Auth/RequireAuth.tsx`

**Implementación**:

```tsx
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface RequireAuthProps {
  children: ReactNode;
  redirectTo?: string;
}

export const RequireAuth = ({ 
  children, 
  redirectTo = '/auth'
}: RequireAuthProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    // Guardar la ubicación actual para redirigir después del login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }
  
  return <>{children}</>;
};
```

**Uso**:

```tsx
// En el enrutador
<Route 
  path="/profile" 
  element={
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  } 
/>
```

### SocialButton

Componente para implementar botones de inicio de sesión social.

**Archivo**: `/src/components/Auth/SocialButton.tsx`

**Implementación**:

```tsx
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

interface SocialButtonProps {
  provider: 'google' | 'facebook' | 'twitter';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  label?: string;
}

export const SocialButton = ({
  provider,
  onSuccess,
  onError,
  label = `Sign in with ${provider}`
}: SocialButtonProps) => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    try {
      setLoading(true);
      
      switch (provider) {
        case 'google':
          await signInWithGoogle();
          break;
        // Implementar otros proveedores aquí
        default:
          throw new Error(`Provider ${provider} not implemented`);
      }
      
      onSuccess?.();
    } catch (error) {
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button 
      onClick={handleClick}
      disabled={loading}
      className="social-button"
    >
      {loading ? 'Loading...' : label}
    </button>
  );
};
```

## Flujos de Autenticación

### Inicio de Sesión

1. Usuario navega a la página de autenticación (`/auth`)
2. Usuario selecciona método de inicio de sesión (correo/contraseña o proveedor social)
3. Se muestra UI de carga mientras se procesa la autenticación
4. Firebase verifica credenciales
5. En caso de éxito, `AuthProvider` actualiza el estado de usuario
6. Usuario es redirigido a la página original o a la página de inicio

### Cierre de Sesión

1. Usuario hace clic en botón de cierre de sesión
2. Se llama a `signOut` desde `useAuth`
3. Firebase finaliza la sesión
4. `AuthProvider` actualiza el estado de usuario a `null`
5. Las rutas protegidas ya no son accesibles

### Persistencia de Sesión

1. Al cargar la aplicación, `AuthProvider` verifica si hay una sesión activa
2. Firebase mantiene el estado de autenticación utilizando el almacenamiento local
3. Si existe una sesión válida, usuario es autenticado automáticamente
4. El estado de carga evita redirecciones incorrectas durante la verificación

## Protección de Rutas

ChillFlix protege las rutas que requieren autenticación usando el componente `RequireAuth`:

1. El enrutador envuelve las rutas protegidas con `RequireAuth`
2. Al navegar a una ruta protegida, `RequireAuth` verifica el estado de autenticación
3. Si el usuario no está autenticado, es redirigido a la página de inicio de sesión
4. La ubicación original se guarda en el estado de navegación
5. Después de iniciar sesión, el usuario es redirigido a la ubicación original

## Configuración de Firebase

La configuración de Firebase se mantiene en un archivo separado:

**Archivo**: `/src/config/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const firebaseApp = initializeApp(firebaseConfig);
```

## Manejo de Errores

El sistema de autenticación implementa un manejo de errores robusto:

1. Errores capturados en cada operación de autenticación
2. Estado de error disponible a través del contexto
3. Mensajes de error específicos y acciones recomendadas
4. Capacidad para volver a intentar operaciones fallidas

## Seguridad

ChillFlix implementa varias medidas de seguridad:

1. Uso de HTTPS para todas las comunicaciones
2. No almacenamiento de credenciales en código o localStorage
3. Validación de estado de autenticación en el servidor
4. Tokens de sesión con tiempo de expiración
5. Políticas de contraseñas seguras

## Extensiones Futuras

El sistema está diseñado para facilitar la adición de nuevas características:

1. Autenticación con más proveedores sociales
2. Autenticación con número de teléfono
3. Autenticación de doble factor
4. Gestión de perfil de usuario
5. Recuperación de contraseña
6. Verificación de correo electrónico

## Buenas Prácticas

1. **Nunca almacenar credenciales** en código o repositorios
2. **Usar environment variables** para configuración sensible
3. **Validar estado de autenticación** en el cliente y servidor
4. **Separar la lógica de autenticación** de los componentes de UI
5. **Proporcionar mensajes de error claros** a los usuarios
6. **Implementar timeouts** para operaciones de autenticación
7. **Registrar intentos fallidos** para detectar ataques
8. **Ofrecer múltiples métodos** de autenticación
9. **Verificar permisos** además de autenticación para acciones sensibles