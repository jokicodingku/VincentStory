import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import createNavbar from '../template.js';
import NotificationPresenter from '../notification-presenter.js';
import NotificationView from '../notif-view.js';


class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    let page = routes[url];

    if (this.activePage && typeof this.activePage.destroy === 'function') {
      this.activePage.destroy();
    }

    if (typeof page === 'function') {
      page = page();
    }

    if (!page) return;

    this.#content.innerHTML = await page.render();
    await page.afterRender();

    const mainContent = document.querySelector('#main-content');
    const skipLink = document.querySelector('.skip-to-content');

    if (mainContent && skipLink) {
      skipLink.addEventListener('click', function (event) {
        event.preventDefault();
        skipLink.blur();
        mainContent.focus();
        mainContent.scrollIntoView();
      });
    }

    this.activePage = page;

    this._toggleLogoutButtonVisibility();
  }

  _toggleLogoutButtonVisibility() {
    const logoutButton = document.getElementById('logout-button');
    const currentHash = window.location.hash;

    if (!logoutButton) return;

    if (currentHash === '#/login' || currentHash === '#/register') {
      logoutButton.style.display = 'none';
    } else {
      logoutButton.style.padding = '10px 20px';
      logoutButton.style.backgroundColor = '#FF0000';
      logoutButton.style.color = '#FFFFFF';
      logoutButton.style.border = 'none';
      logoutButton.style.borderRadius = '4px';
      logoutButton.style.cursor = 'pointer';
      logoutButton.style.display = 'block';
    }
  } 
}
document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.hash = '/logout';
    });
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  document.querySelector('.main-header').innerHTML = createNavbar();

  const subscribeBtn = document.getElementById('subscribe-btn');
  const unsubscribeBtn = document.getElementById('unsubscribe-btn');
  const isSubscribed = localStorage.getItem('subscribed') === 'true';
  if (isSubscribed) {
    subscribeBtn.style.display = 'none';
    unsubscribeBtn.style.padding = '10px 20px';
    unsubscribeBtn.style.backgroundColor = '#808080';
    unsubscribeBtn.style.color = '#FFFFFF';
    unsubscribeBtn.style.border = 'none';
    unsubscribeBtn.style.borderRadius = '4px';
    unsubscribeBtn.style.cursor = 'pointer';
    unsubscribeBtn.style.display = 'inline';
  } else {
    subscribeBtn.style.display = 'inline';
    subscribeBtn.style.padding = '10px 20px';
    subscribeBtn.style.backgroundColor = '#FF0000';
    subscribeBtn.style.color = '#FFFFFF';
    subscribeBtn.style.border = 'none';
    subscribeBtn.style.borderRadius = '4px';
    subscribeBtn.style.cursor = 'pointer';
    unsubscribeBtn.style.display = 'none';
  }

subscribeBtn.addEventListener('click', async () => {
  const success = await NotificationPresenter.handleSubscribe(NotificationView);
  if (success) {
    subscribeBtn.style.display = 'none';
    unsubscribeBtn.style.display = 'inline';
  }
});

unsubscribeBtn.addEventListener('click', async () => {
  const success = await NotificationPresenter.handleUnsubscribe(NotificationView);
  if (success) {
    unsubscribeBtn.style.display = 'none';
    subscribeBtn.style.display = 'inline';
  }
});

});



export default App;
