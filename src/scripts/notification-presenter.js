import CONFIG from './config';
import NotificationHelper from './notification-helper';
import API from './data/api';

const NotificationPresenter = {
  async handleSubscribe(view) {
    try {
      if (!navigator.onLine) {
        view.showAlert('Gagal subscribe: Anda sedang offline!');
        return false;
      }

      const subscription = await NotificationHelper.getUserSubscription(CONFIG.VAPID_PUBLIC_KEY);
      const response = await API.subscribeNotification(subscription);

      if (!response.error) {
        localStorage.setItem('subscribed', 'true');
        view.showAlert(response.message);
        return true;
      } else {
        view.showAlert('Gagal subscribe: ' + response.message);
        return false;
      }
    } catch (error) {
      view.showAlert('Gagal subscribe: Anda sedang offline atau terjadi kesalahan!');
      console.error(error);
      return false;
    }
  },

  async handleUnsubscribe(view) {
    try {
      if (!navigator.onLine) {
        view.showAlert('Gagal unsubscribe: Anda sedang offline!');
        return false;
      }

      const subscription = await NotificationHelper.getSubscription();
      if (subscription) {
        const response = await API.unsubscribeNotification(subscription);
        await NotificationHelper.unsubscribeUser();

        if (!response.error) {
          localStorage.removeItem('subscribed');
          view.showAlert(response.message);
          return true;
        } else {
          view.showAlert('Gagal unsubscribe: ' + response.message);
          return false;
        }
      }
      return false;
    } catch (error) {
      view.showAlert('Gagal unsubscribe: Anda sedang offline atau terjadi kesalahan!');
      console.error(error);
      return false;
    }
  }
};

export default NotificationPresenter;
