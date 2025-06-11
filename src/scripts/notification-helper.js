
const NotificationHelper = {
    async getUserSubscription(vapidKey) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
      });
  
      const p256dh = subscription.getKey('p256dh');
      const auth = subscription.getKey('auth');
  
      const p256dhBase64 = btoa(String.fromCharCode(...new Uint8Array(p256dh)));
      const authBase64 = btoa(String.fromCharCode(...new Uint8Array(auth)));
  
      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: p256dhBase64,
          auth: authBase64
        }
      };
    },
  
    async getSubscription() {
      const registration = await navigator.serviceWorker.ready;
      return registration.pushManager.getSubscription();
    },
  
    async unsubscribeUser() {
      const subscription = await this.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
    },
  
    showStoryNotification(description) {
      if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification('Story berhasil dibuat', {
            body: `Anda telah membuat story baru dengan deskripsi: ${description}`,
          });
        });
      }
    }
  };
  
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64);
    return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
  }

  export default NotificationHelper;
  