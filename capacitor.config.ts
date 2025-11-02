import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'test',
  webDir: 'dist',

  server: {
    // Ganti 192.168.x.x dengan IP lokal komputer Anda yang sebenarnya
    url: 'http://192.168.1.7:8100', 
    cleartext: true, // Untuk koneksi HTTP di Android versi baru
  }
};

export default config;
