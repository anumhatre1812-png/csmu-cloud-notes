import React, { createContext, useContext, useEffect, useState } from 'react';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { auth } from '../config/firebase';
import { isAdmin as checkAdmin } from '../config/admins';
import { initializePushNotifications, unregisterPushToken, isWebPlatform } from '../services/notificationService';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user && !user.email) {
        try {
          await user.reload();
        } catch {}
      }
      const currentUser = auth.currentUser;
      setUser(currentUser);
      setIsAdmin(checkAdmin(currentUser?.email));
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (loading) return;

    if (user && !isAdmin) {
      initializePushNotifications((payload: any) => {
        const title = payload.notification?.title || payload.title || 'New Update';
        const body = payload.notification?.body || payload.body || '';
        toast.success(`${title}${body ? `: ${body}` : ''}`, { duration: 6000 });
      });
    }

    if (!user) {
      unregisterPushToken(isWebPlatform() ? 'web' : undefined);
    }
  }, [user, loading, isAdmin]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
