import LogoutPresenter from './LogoutPresenter';

class LogoutPage {
  async render() {
    return `
      <section class="logout-page">
        <p>Logging out...</p>
      </section>
    `;
  }

  async afterRender() {
    const logoutMessage = document.querySelector('.logout-page p');
    logoutMessage.animate([
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], {
      duration: 500,
      easing: 'ease-out',
      fill: 'forwards'
    });

    const logoutPresenter = new LogoutPresenter(this);
    logoutPresenter.handleLogout();
  }

  navigateToLogin() {
    const pageContent = document.querySelector('#page-content');
    if (pageContent && document.startViewTransition) {
      document.startViewTransition(() => {
        window.location.hash = '/login';
      });
    } else {
      window.location.hash = '/login';
    }
  }
}

export default LogoutPage;
