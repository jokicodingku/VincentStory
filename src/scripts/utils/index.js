export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}
 
export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.log('Service Worker API unsupported');
    return;
  }

  // Cek apakah service worker sudah terdaftar
  const registrations = await navigator.serviceWorker.getRegistrations();
  if (registrations.length > 0) {
    console.log('Service worker sudah terdaftar sebelumnya');
    return;
  }
 
  try {
    const registration = await navigator.serviceWorker.register('/sw.workbox.bundle.js', {
      updateViaCache: 'none' // Mencegah cache otomatis
    });
    console.log('Service worker telah terpasang', registration);
  } catch (error) {
    console.log('Failed to install service worker:', error);
  }
}

