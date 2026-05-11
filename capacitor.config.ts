import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.matush.biashnet',
  appName: 'BiashNet',
  webDir: 'build',
  server: {
    url: "https://golden-biashnet.web.app",
    cleartext: true
  }
};

export default config;
