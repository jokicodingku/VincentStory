const createNavbar = () => {
    return `
      <a class="brand-name" href="#/">CeritaVincent</a>
      <button id="drawer-button" class="drawer-button">☰</button>
      <nav id="navigation-drawer" class="navigation-drawer">
        <ul id="nav-list" class="nav-list">
          <li><a href="#main-content" class="skip-to-content" tabindex="0">Skip to content</a></li>
          <li><a href="#/">Beranda</a></li>
          <li><button id="subscribe-btn">Subscribe</button></li>
          <li><button id="unsubscribe-btn" style="display: none;">Unsubscribe</button></li>
          <li><button id="logout-button" style="display: none;">Logout</button></li>
        </ul>
      </nav>
    `;
  };
  
  export default createNavbar;
  