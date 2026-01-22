// Exportamos las funciones tal cual
export function initCarousel() {
  const track = document.getElementById('carouselTrack');
  const btnNext = document.getElementById('btnNext');
  const btnPrev = document.getElementById('btnPrev');

  if (!track) return;

  const slides = Array.from(track.children);
  let index = 0;
  let slideWidth = window.innerWidth;

  function setWidths() {
    slideWidth = window.innerWidth;
    slides.forEach(s => s.style.minWidth = slideWidth + 'px');
    track.style.width = (slides.length * slideWidth) + 'px';
    goToSlide(index, false);
  }
  setWidths();
  window.addEventListener('resize', setWidths);

  function goToSlide(i, animate = true) {
    track.style.transition = animate ? 'transform 0.8s ease-in-out' : 'none';
    track.style.transform = `translateX(-${i * slideWidth}px)`;
  }

  function nextSlide() {
    index++;
    if (index >= slides.length) {
      index = 0;
      goToSlide(index, false);
    } else {
      goToSlide(index);
    }
  }

  function prevSlide() {
    index--;
    if (index < 0) {
      index = slides.length - 1;
      goToSlide(index, false);
    } else {
      goToSlide(index);
    }
  }

  // autoplay
  let timer = setInterval(nextSlide, 3000);
  function pauseAutoplay() {
    clearInterval(timer);
    timer = setTimeout(() => {
      timer = setInterval(nextSlide, 3000);
    }, 2500);
  }

  // Botones
  if (btnNext) btnNext.addEventListener('click', () => { pauseAutoplay(); nextSlide(); });
  if (btnPrev) btnPrev.addEventListener('click', () => { pauseAutoplay(); prevSlide(); });

  // Swipe
  let startX = 0;
  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    pauseAutoplay();
  }, { passive: true });
  track.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) {
      if (dx < 0) nextSlide();
      else prevSlide();
    }
  });

  // Drag con mouse
  let isDown = false, pointerStartX = 0;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') {
      isDown = true;
      pointerStartX = e.clientX;
      pauseAutoplay();
      track.setPointerCapture(e.pointerId);
    }
  });
  track.addEventListener('pointerup', (e) => {
    if (!isDown) return;
    isDown = false;
    const dx = e.clientX - pointerStartX;
    if (Math.abs(dx) > 60) {
      if (dx < 0) nextSlide();
      else prevSlide();
    }
  });
}