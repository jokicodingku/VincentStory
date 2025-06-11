export function showLoading() {
    const loader = document.getElementById('loading-indicator');
    loader.classList.remove('hidden');
    loader.setAttribute('aria-hidden', 'false');
  }
  
  export function hideLoading() {
    const loader = document.getElementById('loading-indicator');
    loader.classList.add('hidden');
    loader.setAttribute('aria-hidden', 'true');
  }
  