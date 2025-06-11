import { LoginPresenter } from './login-presenter';
import { showLoading, hideLoading } from '../../utils/loading';

class LoginPage {
  async render() {
    const loginTemplate = `
      <section class="login-page">
        <h2 id="login-form-label">Login</h2>
        <form id="login-form" aria-labelledby="login-form-label">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required aria-required="true" autocomplete="email" aria-describedby="email-error" />
          <small id="email-error" class="error-message"></small>

          <label for="password">Password</label>
          <input type="password" id="password" name="password" required minlength="8" aria-required="true" autocomplete="current-password" aria-describedby="password-error" />
          <small id="password-error" class="error-message"></small>

          <button type="submit">Masuk</button>
          <div id="login-message" role="alert" aria-live="polite" class="visually-hidden login-success-message"></div>
        </form>

        <p id="register-prompt">
          <span>Belum punya akun?</span>
          <a href="#/register" aria-label="Don't have an account? register here!">Daftar</a>
        </p>
      </section>
    `;
    return loginTemplate;
  }

  async afterRender() {
    this.initializeFormElements();
    this.setupFormAnimation();
    this.configureInputValidation();
    this.setupLoginHandler();
  }

  initializeFormElements() {
    this.formElement = document.getElementById('login-form');
    this.userEmailField = this.formElement.email;
    this.userPasswordField = this.formElement.password;
    this.emailErrorDisplay = document.getElementById('email-error');
    this.passwordErrorDisplay = document.getElementById('password-error');
    this.statusMessageContainer = document.getElementById('login-message');
    this.authPresenter = new LoginPresenter();
  }

  setupFormAnimation() {
    const animateFormEntry = () => {
      this.formElement.animate([
        { transform: 'translateY(20px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
      ], {
        duration: 800,
        easing: 'ease-out',
        fill: 'forwards'
      });
    };

    if (document.startViewTransition) {
      document.startViewTransition(animateFormEntry);
    } else {
      animateFormEntry();
    }
  }

  configureInputValidation() {
    this.setupEmailValidation();
    this.setupPasswordValidation();
  }

  setupEmailValidation() {
    this.userEmailField.addEventListener('input', () => {
      const isEmailValid = this.userEmailField.validity.valid;
      
      if (isEmailValid) {
        this.clearFieldError(this.userEmailField, this.emailErrorDisplay);
      } else {
        this.displayFieldError(
          this.userEmailField, 
          this.emailErrorDisplay, 
          'Please enter a valid email address'
        );
      }
    });
  }

  setupPasswordValidation() {
    this.userPasswordField.addEventListener('input', () => {
      const isPasswordValid = this.userPasswordField.validity.valid;
      
      if (isPasswordValid) {
        this.clearFieldError(this.userPasswordField, this.passwordErrorDisplay);
      } else {
        this.displayFieldError(
          this.userPasswordField, 
          this.passwordErrorDisplay, 
          'Password must be at least 8 characters'
        );
      }
    });
  }

  clearFieldError(inputField, errorContainer) {
    errorContainer.textContent = '';
    inputField.classList.remove('input-error');
  }

  displayFieldError(inputField, errorContainer, errorMessage) {
    errorContainer.textContent = errorMessage;
    inputField.classList.add('input-error');
  }

  setupLoginHandler() {
    this.formElement.addEventListener('submit', async (submitEvent) => {
      submitEvent.preventDefault();
      await this.processLoginAttempt();
    });
  }

  async processLoginAttempt() {
    showLoading();

    const loginCredentials = this.extractFormData();
    const authResponse = await this.authPresenter.handleLogin(loginCredentials);

    hideLoading();
    this.handleAuthenticationResponse(authResponse);
  }

  extractFormData() {
    return {
      email: this.userEmailField.value,
      password: this.userPasswordField.value
    };
  }

  handleAuthenticationResponse(response) {
    this.displayStatusMessage();
    
    if (this.isLoginSuccessful(response)) {
      this.handleSuccessfulLogin();
    } else {
      this.handleFailedLogin(response);
    }
  }

  displayStatusMessage() {
    this.statusMessageContainer.classList.remove('visually-hidden');
    
    const messageAnimation = [
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ];

    const animationConfig = {
      duration: 500,
      easing: 'ease-in-out',
      fill: 'forwards'
    };

    this.statusMessageContainer.animate(messageAnimation, animationConfig);
  }

  isLoginSuccessful(response) {
    return !response.error;
  }

  handleSuccessfulLogin() {
    this.statusMessageContainer.textContent = 'Login Success! Redirecting to home...';
    this.statusMessageContainer.style.color = '#30f200';
    
    setTimeout(() => {
      window.location.hash = '/home';
    }, 1000);
  }

  handleFailedLogin(response) {
    this.statusMessageContainer.textContent = `Login Failed: ${response.message}`;
    this.statusMessageContainer.style.color = 'red';
  }
}

export default LoginPage;