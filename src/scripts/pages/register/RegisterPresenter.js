import { register } from '../../data/api';

class RegisterPresenter {
  constructor(view) {
    this.view = view;
  }

  toggleSubmitButton(nameInput, emailInput, passwordInput, submitButton) {
    if (nameInput.validity.valid && emailInput.validity.valid && passwordInput.validity.valid) {
      submitButton.disabled = false;
      submitButton.setAttribute('aria-disabled', 'false');
    } else {
      submitButton.disabled = true;
      submitButton.setAttribute('aria-disabled', 'true');
    }
  }

  async handleRegister({ name, email, password }) {
    const response = await register({ name, email, password });
  
    if (!response.error) {
      return { success: true, message: 'Register Success! Please login.' };
    } else {
      return { success: false, message: `Register Failed: ${response.message}` };
    }
  }
  
}

export default RegisterPresenter;
