import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.csmu.cloudnotes',
  appName: 'CSMU Cloud Notes',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: ['accounts.google.com', '*.firebaseapp.com', '*.google.com', 'csmu-cloud-notes.vercel.app']
  },
  plugins: {
    FirebaseAuthentication: {
      providers: ['google.com']
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#FFF8F5',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
