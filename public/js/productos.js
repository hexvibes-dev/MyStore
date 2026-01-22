(function () {
  function init() {
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modal-img');
    const modalContent = document.getElementById('modalContent');
    const modalOverlay = document.getElementById('modalOverlay');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const imageZone = document.getElementById('imageZone');
    const footerZone = document.getElementById('footerZone');

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

    function centrarImagen() {
      if (!modalImg || !imageZone) return;
      const zoneHeight = imageZone.clientHeight;
      const zoneWidth = imageZone.clientWidth;
      const ih = modalImg.naturalHeight;
      const iw = modalImg.naturalWidth;
      if (!ih || !iw) return;

      const scale = Math.min(zoneWidth / iw, zoneHeight / ih) * 0.9;
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

      if (footerZone) {
        footerZone.style.paddingBottom = '20px';
      }

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

        if (footerZone) {
          footerZone.style.paddingBottom = '';
        }
      }, 250);
    }

    window.cerrarModal = cerrarModal;

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

    const PRODUCTS_JSON_PATH = '/productos/productos.json';
    function renderProductos(productos) {
      const contenedor = document.getElementById('contenedor-productos');
      if (!contenedor) return;
      contenedor.innerHTML = '';
      const fragment = document.createDocumentFragment();

      productos.forEach(producto => {
        const div = document.createElement('div');
        div.className = 'producto animate__aninated animate__reveal bg-white/80 rounded-lg shadow p-4 w-72 md:w-80 lg:w-96 flex flex-col items-start transform transition duration-300 hover:scale-105 hover:shadow-lg overflow-hidden';

        const galeriaHtml = (producto.imagenes || []).map((img, i) => {
          const src = normalizePath(img);
          return `<div class="imagen-wrapper flex-none min-w-[120px] h-[120px] max-h-[140px] bg-gray-100 rounded-md overflow-hidden cursor-pointer mr-2">
                    <img src="${src}" alt="${producto.nombre}" class="w-full h-full object-cover block" loading="lazy">
                  </div>`;
        }).join('');

        div.innerHTML = `
          <div class="galeria flex gap-2 overflow-x-auto pb-2 -mx-1">${galeriaHtml}</div>
          <h2 class="mt-2 text-deep-koamaru font-semibold break-words">${producto.nombre}</h2>
          <p class="text-gray-600 text-sm max-h-32 overflow-y-auto break-words whitespace-pre-wrap">${producto.descripcion || ''}</p>
          <p class="mt-2 font-bold text-emerald-600">$${Number(producto.precio || 0).toFixed(2)}</p>
          <div class="mt-3 w-full">
            <a class="comprar-btn inline-block bg-deep-koamaru transition-all hover-btn text-white px-4 py-2 rounded-l-full rounded-r-full font-semibold href="https://wa.me/53375206?text=Hola%2C%20quiero%20comprar%20el%20producto%20${encodeURIComponent(producto.nombre)}" target="_blank" rel="noopener noreferrer">Comprar</a>
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