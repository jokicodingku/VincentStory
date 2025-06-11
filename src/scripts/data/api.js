import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
};

const API = {
  async subscribeNotification(subscription) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
    return response.json();
  },

async unsubscribeNotification(subscription) {
  const token = localStorage.getItem('token');
  const endpoint = subscription?.endpoint;

  if (!endpoint) {
    throw new Error('Subscription endpoint tidak ditemukan');
  }

  const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ endpoint })
  });

  return response.json();
}

};

export default API;

export async function register(userData) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  return await response.json();
}

export async function login(credentials) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  return await response.json();
}

export async function getData() {
  const fetchResponse = await fetch(ENDPOINTS.STORIES);
  return await fetchResponse.json();
}
