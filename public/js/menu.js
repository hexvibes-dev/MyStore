export function initMenuPopup() {
  const hamburger = document.getElementById('hamburger');
  const popup = document.getElementById('menuPopup');

  if (!hamburger || !popup) return;

  let isOpen = false;

  function openPopup() {
    popup.classList.remove('hidden', 'animate__zoomOut');
    popup.classList.add('animate__zoomIn');
    popup.setAttribute('aria-hidden', 'false');
    isOpen = true;
  }

  function closePopup() {
    popup.classList.remove('animate__zoomIn');
    popup.classList.add('animate__zoomOut');
    popup.setAttribute('aria-hidden', 'true');

    // Listener fijo para evitar acumulación
    const handleAnimationEnd = () => {
      if (!isOpen) {
        popup.classList.add('hidden');
      }
      popup.removeEventListener('animationend', handleAnimationEnd);
    };

    popup.addEventListener('animationend', handleAnimationEnd);
    isOpen = false;
  }

  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen ? closePopup() : openPopup();
  });
}