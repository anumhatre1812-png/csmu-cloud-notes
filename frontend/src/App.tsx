import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { router } from './router';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import BootScreen from './components/common/BootScreen';

function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 950);
    return () => window.clearTimeout(timer);
  }, []);

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
