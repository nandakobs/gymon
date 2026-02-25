import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase/config';

type UserRole = 'student' | 'coach' | 'manager' | 'admin';

interface AuthContextValue {
  user: User | null;
  role: UserRole | null;
  gymId: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [gymId, setGymId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        setRole((userDoc.data()?.role as UserRole) ?? null);
        setGymId(userDoc.data()?.gymId ?? null);
      } else {
        setUser(null);
        setRole(null);
        setGymId(null);
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  async function handleSignIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function handleSignOut() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        gymId,
        isLoading,
        signIn: handleSignIn,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
