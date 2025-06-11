import HomePage from '../pages/home/home-page';
import RegisterPage from '../pages/register/index';
import LoginPage from '../pages/login/index';
import LogoutPage from '../pages/logout/LogoutPage';
import HomeForm from '../pages/home/home-form';
import SavedStoriesPage from '../pages/home/SavedStoriesPage.js';


const routes = {
  '/': () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.hash = '/register';
      return null;
    }
    return new HomePage();
  },
'/home': () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.hash = '/login';
    return null;
  }

  const page = new HomePage();

  const renderPage = () => page.render();

  if (document.startViewTransition) {
    document.startViewTransition(renderPage);
  } else {
    renderPage();
  }

  return page;
},

  '/register': new RegisterPage(),
  '/login': new LoginPage(),
  '/logout': new LogoutPage(),
  '/home-form': new HomeForm(),
  '/saved': new SavedStoriesPage(),
};



export default routes;
