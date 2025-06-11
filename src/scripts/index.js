import '../styles/styles.css';

import App from './pages/app';
import { registerServiceWorker } from './utils';

const app = new App({
  content: document.querySelector('#main-content'),
  drawerButton: document.querySelector('#drawer-button'),
  navigationDrawer: document.querySelector('#navigation-drawer'),
});

// Fungsi untuk inisialisasi aplikasi
const initializeApp = async () => {
  try {
    await app.renderPage();
    
    // Register service worker hanya jika belum terdaftar
    if ('serviceWorker' in navigator && !navigator.serviceWorker.controller) {
      await registerServiceWorker();
      console.log('Service worker berhasil didaftarkan');
    }
  } catch (error) {
    console.error('Terjadi kesalahan:', error);
  }
};

// Event listeners
window.addEventListener('DOMContentLoaded', initializeApp);
window.addEventListener('hashchange', async () => {
  await app.renderPage();
});