import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { router } from './router';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import BootScreen from './components/common/BootScreen';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

function App() {
  const [booting, setBooting] = useState(true);
  const [deepLinkPath, setDeepLinkPath] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 950);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SplashScreen.hide().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      const handler = CapacitorApp.addListener('appUrlOpen', (data: any) => {
        const url = new URL(data.url);
        setDeepLinkPath(url.pathname + url.search);
      });
      return () => {
        handler.then((h: any) => h.remove());
      };
    }
  }, []);

  useEffect(() => {
    if (deepLinkPath) {
      import('./router').then(({ router }) => {
        router.navigate(deepLinkPath);
      });
    }
  }, [deepLinkPath]);

  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        {booting ? <BootScreen key="boot" /> : <RouterProvider router={router} />}
      </AnimatePresence>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
