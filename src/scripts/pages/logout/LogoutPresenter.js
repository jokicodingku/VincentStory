class LogoutPresenter {
  constructor(view) {
    this.view = view;
  }

  handleLogout() {
    localStorage.removeItem('token');

    setTimeout(() => {
      this.view.navigateToLogin();
    }, 1000);
  }
}

export default LogoutPresenter;
