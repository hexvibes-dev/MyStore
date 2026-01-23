import { initMenuPopup } from './menu.js';
import { initCarousel } from './carousel.js';

window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  const mainContent = document.getElementById('mainContent');

  setTimeout(() => {
    if (loader) {
      loader.classList.add('animate__animated', 'animate__fadeOut');
      loader.addEventListener('animationend', () => {
        loader.style.display = 'none';
        if (mainContent) mainContent.setAttribute('aria-hidden', 'false');

        document.querySelectorAll('.topbar, .section h3, .product, .bento-card, footer')
          .forEach(el => el.classList.add('animate__animated', 'animate__fadeInUp'));

        initCarousel();
        initMenuPopup();
      });
    } else {
      initCarousel();
      initMenuPopup();
    }
  }, 900);
});