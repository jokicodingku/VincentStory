import { login } from '../../data/api';

class LoginPresenter {
  async handleLogin({ email, password }) {
    const response = await login({ email, password });

    if (!response.error) {
      localStorage.setItem('token', response.loginResult.token);
    }

    return response;
  }
}

export { LoginPresenter };
