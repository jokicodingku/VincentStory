import RegisterPresenter from './RegisterPresenter';

class RegisterPage {
  async render() {
    const registerFormHTML = this._buildFormMarkup();
    return registerFormHTML;
  }

  _buildFormMarkup() {
    return `
      <section class="register-page">
        <h2 id="register-form-label">Daftar</h2>
        <form id="register-form" aria-labelledby="register-form-label"> 
          <label for="name">Name</label>
          <input type="text" id="name" name="name" required aria-required="true" autocomplete="name" aria-describedby="name-error" />
          <small id="name-error" class="error-message"></small>

          <label for="email">Email</label>
          <input type="email" id="email" name="email" required aria-required="true" autocomplete="email" aria-describedby="email-error" />
          <small id="email-error" class="error-message"></small>

          <label for="password">Password</label>
          <input type="password" id="password" name="password" required minlength="8" aria-required="true" autocomplete="new-password" aria-describedby="password-error" />
          <small id="password-error" class="error-message">Password must be at least 8 characters.</small>

          <button type="submit" disabled aria-disabled="true">Register</button>
          <div id="register-message" role="alert" aria-live="polite" class="visually-hidden"></div>
        </form>

        <p id="login-prompt">
          <span>Sudah Punya Akun?</span> 
          <a href="#/login" aria-label="Already have an account? login here!">Masuk</a>
        </p>
      </section>
    `;
  }

  async afterRender() {
    this._initializeFormElements();
    this._setupFormAnimation();
    this._configurePasswordToggle();
    this._initializePresenter();
    this._attachEventHandlers();
  }

  _initializeFormElements() {
    this.formElement = document.getElementById('register-form');
    this.formInputs = {
      name: this.formElement.name,
      email: this.formElement.email,
      password: this.formElement.password
    };
    this.submitBtn = this.formElement.querySelector('button');
    this.errorElements = {
      name: document.getElementById('name-error'),
      email: document.getElementById('email-error'),
      password: document.getElementById('password-error')
    };
    this.messageContainer = document.getElementById('register-message');
  }

  _setupFormAnimation() {
    const animationConfig = {
      duration: 800,
      easing: 'ease-out',
      fill: 'forwards'
    };
    
    this.formElement.animate([
      { transform: 'translateY(20px)', opacity: 0 },
      { transform: 'translateY(0)', opacity: 1 }
    ], animationConfig);
  }

  _configurePasswordToggle() {
    const passwordField = this.formInputs.password;
    
    passwordField.addEventListener('focus', () => {
      passwordField.type = 'text';
    });

    passwordField.addEventListener('blur', () => {
      passwordField.type = 'password';
    });
  }

  _initializePresenter() {
    this.presenter = new RegisterPresenter(this);
  }

  _attachEventHandlers() {
    this._setupNameValidation();
    this._setupEmailValidation();
    this._setupPasswordValidation();
    this._setupFormSubmission();
  }

  _setupNameValidation() {
    this.formInputs.name.addEventListener('input', () => {
      this._validateNameField();
      this._updateSubmitButtonState();
    });
  }

  _setupEmailValidation() {
    this.formInputs.email.addEventListener('input', () => {
      this._validateEmailField();
      this._updateSubmitButtonState();
    });
  }

  _setupPasswordValidation() {
    this.formInputs.password.addEventListener('input', () => {
      this._validatePasswordField();
      this._updateSubmitButtonState();
    });
  }

  _validateNameField() {
    const nameInput = this.formInputs.name;
    const nameErrorElement = this.errorElements.name;
    
    if (nameInput.validity.valid) {
      nameErrorElement.textContent = ''; 
    } else {
      nameErrorElement.textContent = 'Name is required';
    }
  }

  _validateEmailField() {
    const emailInput = this.formInputs.email;
    const emailErrorElement = this.errorElements.email;
    
    if (emailInput.validity.valid) {
      emailErrorElement.textContent = '';
    } else {
      emailErrorElement.textContent = 'Please enter a valid email address';
    }
  }

  _validatePasswordField() {
    const passwordInput = this.formInputs.password;
    const passwordErrorElement = this.errorElements.password;
    
    if (passwordInput.validity.valid) {
      passwordErrorElement.textContent = ''; 
    } else {
      passwordErrorElement.textContent = 'Password must be at least 8 characters';
    }
  }

  _updateSubmitButtonState() {
    this.presenter.toggleSubmitButton(
      this.formInputs.name, 
      this.formInputs.email, 
      this.formInputs.password, 
      this.submitBtn
    );
  }

  _setupFormSubmission() {
    this.formElement.addEventListener('submit', async (event) => {
      event.preventDefault();
      await this._processRegistration();
    });
  }

  async _processRegistration() {
    const registrationData = this._collectFormData();
    const result = await this.presenter.handleRegister(registrationData);
    
    this._displayRegistrationResult(result);
    
    if (result.success) {
      this._handleSuccessfulRegistration();
    }
  }

  _collectFormData() {
    return {
      name: this.formInputs.name.value,
      email: this.formInputs.email.value,
      password: this.formInputs.password.value
    };
  }

  _displayRegistrationResult(result) {
    this.messageContainer.classList.remove('visually-hidden');
    this.messageContainer.textContent = result.message;
    this.messageContainer.style.color = result.success ? 'green' : 'red';

    this._animateMessage();
  }

  _animateMessage() {
    const messageAnimation = {
      duration: 500,
      easing: 'ease-in-out',
      fill: 'forwards'
    };

    this.messageContainer.animate([
      { opacity: 0, transform: 'translateY(20px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], messageAnimation);
  }

  _handleSuccessfulRegistration() {
    setTimeout(() => {
      window.location.hash = '/login';
    }, 1000);
  }
}

export default RegisterPage;