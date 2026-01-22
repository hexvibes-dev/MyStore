// public/js/productos.js
// Script cliente para renderizar productos y controlar modal full-screen.
// Incluye centrado de la imagen, animaciones y swipe.

(function () {
  function init() {
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const modalContent = document.getElementById('modalContent');
    const modalOverlay = document.getElementById('modalOverlay');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const imageZone = document.getElementById('imageZone');

    let currentImages = [];
    let currentIndex = 0;

    function normalizePath(src) {
      if (!src || typeof src !== 'string') return src;
      src = src.trim();
      if (/^(https?:\/\/|\/)/i.test(src)) return src;
      src = src.replace(/^\.\/+/, '');
      src = src.replace(/^\.\.\//, '');
      return '/' + src;
    }

    // Centrar y escalar imagen dentro de la zona
    function centrarImagen() {
      if (!modalImg || !imageZone) return;
      const zoneHeight = imageZone.clientHeight;
      const zoneWidth = imageZone.clientWidth;
      const ih = modalImg.naturalHeight;
      const iw = modalImg.naturalWidth;
      if (!ih || !iw) return;

      const scale = Math.min(zoneWidth / iw, zoneHeight / ih) * 0.9; // 90% del espacio
      const finalW = iw * scale;
      const finalH = ih * scale;

      modalImg.style.position = 'absolute';
      modalImg.style.top = `${(zoneHeight - finalH) / 2}px`;
      modalImg.style.left = `${(zoneWidth - finalW) / 2}px`;
      modalImg.style.width = `${finalW}px`;
      modalImg.style.height = `${finalH}px`;
      modalImg.style.objectFit = 'contain';
    }

    function abrirModal(index) {
      currentIndex = index;
      modalImg.src = normalizePath(currentImages[currentIndex]);
      modal.classList.remove('hidden');
      modal.setAttribute('open', '');
      document.body.style.overflow = 'hidden';

      modalImg.addEventListener('load', centrarImagen, { once: true });
      window.addEventListener('resize', centrarImagen);

      modalContent.style.animation = 'scaleIn 0.3s ease forwards';
    }

    function cerrarModal() {
      modalContent.style.animation = 'scaleOut 0.25s ease forwards';
      setTimeout(() => {
        modal.classList.add('hidden');
        modal.removeAttribute('open');
        document.body.style.overflow = '';
        modalImg.src = '';
        modalImg.removeAttribute('style');
        window.removeEventListener('resize', centrarImagen);
      }, 250);
    }

    window.cerrarModal = cerrarModal;

    // Animación al cambiar imagen
    function cambiarImagen(index) {
      currentIndex = (index + currentImages.length) % currentImages.length;
      modalImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      modalImg.style.opacity = '0';
      modalImg.style.transform = 'scale(0.95)';

      setTimeout(() => {
        modalImg.src = normalizePath(currentImages[currentIndex]);
        modalImg.style.opacity = '1';
        modalImg.style.transform = 'scale(1)';
      }, 300);
    }

    prevBtn?.addEventListener('click', () => cambiarImagen(currentIndex - 1));
    nextBtn?.addEventListener('click', () => cambiarImagen(currentIndex + 1));

    // Swipe en móviles (sobre la zona de imagen)
    if (imageZone) {
      let startX = 0;
      imageZone.addEventListener('touchstart', (e) => {
        startX = e.changedTouches[0].screenX;
      }, { passive: true });

      imageZone.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].screenX;
        const delta = endX - startX;
        if (Math.abs(delta) > 50) {
          if (delta > 0) cambiarImagen(currentIndex - 1);
          else cambiarImagen(currentIndex + 1);
        }
      }, { passive: true });
    }

    // Render productos
    const PRODUCTS_JSON_PATH = '/productos/productos.json';
    function renderProductos(productos) {
      const contenedor = document.getElementById('contenedor-productos');
      if (!contenedor) return;
      contenedor.innerHTML = '';
      const fragment = document.createDocumentFragment();

      productos.forEach(producto => {
        const div = document.createElement('div');
        div.className = 'producto bg-white rounded-lg shadow p-3 w-56 flex flex-col items-start';

        const galeriaHtml = (producto.imagenes || []).map((img, i) => {
          const src = normalizePath(img);
          return `<div class="imagen-wrapper flex-none min-w-[100px] h-[100px] bg-gray-100 rounded-md overflow-hidden cursor-pointer mr-2">
                    <img src="${src}" alt="${producto.nombre}" class="w-full h-full object-cover block" loading="lazy">
                  </div>`;
        }).join('');

        div.innerHTML = `
          <div class="galeria flex gap-2 overflow-x-auto pb-2 -mx-1">${galeriaHtml}</div>
          <h2 class="mt-2 text-sm font-semibold">${producto.nombre}</h2>
          <p class="text-gray-700 text-sm">${producto.descripcion || ''}</p>
          <p class="mt-2 font-medium text-emerald-600">$${Number(producto.precio || 0).toFixed(2)}</p>
          <div class="mt-3 w-full">
            <a class="comprar-btn inline-block bg-emerald-500 text-white px-3 py-1 rounded-md font-semibold" href="https://wa.me/5353375206?text=Hola%2C%20quiero%20comprar%20el%20producto%20${encodeURIComponent(producto.nombre)}" target="_blank" rel="noopener noreferrer">Comprar</a>
          </div>
        `;

        fragment.appendChild(div);

        const wrappers = div.querySelectorAll('.imagen-wrapper');
        wrappers.forEach((wrapper, i) => {
          wrapper.addEventListener('click', () => {
            currentImages = (producto.imagenes || []).map(normalizePath);
            abrirModal(i);
          });
        });
      });

      contenedor.appendChild(fragment);
    }

    fetch(PRODUCTS_JSON_PATH)
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(renderProductos)
      .catch(err => console.error('Error al cargar productos:', err));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();