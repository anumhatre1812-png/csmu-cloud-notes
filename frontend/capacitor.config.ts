import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.csmu.cloudnotes',
  appName: 'CSMU Cloud Notes',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: ['accounts.google.com', '*.firebaseapp.com', '*.google.com']
  },
  plugins: {
    FirebaseAuthentication: {
      providers: ['google.com']
    }
  }
};

export default config;
