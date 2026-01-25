(function () {
  const PRODUCTS_JSON_PATH = '/productos/productos.json';

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

    function safeText(text) {
      return String(text ?? '');
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

      if (modalContent) modalContent.style.animation = 'scaleIn 0.3s ease forwards';
    }

    function cerrarModal() {
      if (modalContent) modalContent.style.animation = 'scaleOut 0.25s ease forwards';
      setTimeout(() => {
        if (modal) modal.classList.add('hidden');
        if (modal) modal.removeAttribute('open');
        document.body.style.overflow = '';
        if (modalImg) {
          modalImg.src = '';
          modalImg.removeAttribute('style');
        }
        window.removeEventListener('resize', centrarImagen);

        if (footerZone) {
          footerZone.style.paddingBottom = '';
        }
      }, 250);
    }

    window.cerrarModal = cerrarModal;

    function cambiarImagen(index) {
      if (!modalImg) return;
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

    if (modalOverlay) {
      modalOverlay.addEventListener('click', cerrarModal);
    }

    function getScrollbarClassFromContainer(container) {
      if (!container) return 'scrollbar-default';
      for (let i = 0; i < container.classList.length; i++) {
        const cls = container.classList[i];
        if (cls && cls.startsWith('scrollbar-')) return cls;
      }
      return 'scrollbar-default';
    }

    function renderProductos(productos) {
      const contenedor = document.getElementById('contenedor-productos');
      if (!contenedor) return;
      contenedor.innerHTML = '';
      const fragment = document.createDocumentFragment();
      const scrollbarClass = getScrollbarClassFromContainer(contenedor);

      productos.forEach(producto => {
        const div = document.createElement('div');
        let clases = 'producto bg-white/90 rounded-lg shadow p-4 w-full md:w-80 lg:w-96 flex flex-col items-start transform transition duration-300 hover:scale-105 hover:shadow-lg overflow-hidden';
        if (producto.categoria) {
          const cats = Array.isArray(producto.categoria) ? producto.categoria : [producto.categoria];
          cats.forEach(cat => {
            if (cat && typeof cat === 'string') {
              const safeCat = cat.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-_]/g, '');
              if (safeCat) clases += ' categoria-' + safeCat;
            }
          });
        }
        div.className = clases;

        const galeriaHtml = (producto.imagenes || []).map((img, i) => {
          const src = normalizePath(img);
          return `<div class="imagen-wrapper flex-none w-[45%] sm:min-w-[120px] h-[120px] max-h-[140px] rounded-md overflow-hidden cursor-pointer mr-2">
                    <img src="${src}" alt="${safeText(producto.nombre)}" class="w-auto h-full object-cover block" loading="lazy">
                  </div>`;
        }).join('');
        const waText = encodeURIComponent(`Hola, quiero comprar el producto ${safeText(producto.nombre)}`);
        const waHref = `https://wa.me/53375206?text=${waText}`;

        div.innerHTML = `
          <div class="galeria flex gap-2 overflow-x-auto pb-4 px-2 w-full ${scrollbarClass}">${galeriaHtml}</div>
          <h2 class="mt-2 text-watermeleon bg-watermeleon-shadow rounded-l-full rounded-r-full px-3 font-semibold break-words">${safeText(producto.nombre)}</h2>
          <p class="text-gray-600 text-sm max-h-32 overflow-y-auto break-words whitespace-pre-wrap bg-trasparent border-l border-l-watermeleon px-3">${safeText(producto.descripcion || '')}</p>
          <span class="mt-2 font-bold text-emerald-600">$${Number(producto.precio || 0).toFixed(2)}</span>
          <div class="mt-3 w-full">
            <a class="comprar-btn inline-block bg-watermeleon transition-all hover-btn text-white px-4 py-2 rounded-l-full rounded-r-full font-semibold" href="${waHref}" target="_blank" rel="noopener noreferrer">Comprar</a>
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

    function getCategoriaFromPage() {
      const contenedor = document.getElementById('contenedor-productos');
      if (contenedor && contenedor.dataset && contenedor.dataset.categoria) {
        return contenedor.dataset.categoria;
      }

      try {
        const params = new URLSearchParams(window.location.search);
        const q = params.get('categoria');
        if (q) return q;
      } catch (e) {}

      const path = window.location.pathname || '';
      const parts = path.split('/').filter(Boolean);
      if (parts.length) {
        const last = parts[parts.length - 1];
        const clean = last.replace(/\.html$/i, '');
        if (clean && !/^(index|\/)$/.test(clean)) return clean;
      }

      return 'all';
    }

    fetch(PRODUCTS_JSON_PATH)
      .then(res => {
        if (!res.ok) return Promise.reject(new Error('HTTP ' + res.status));
        return res.json();
      })
      .then(data => {
        const categoria = getCategoriaFromPage();
        let filtrados = data;

        if (categoria && categoria !== 'all') {
          filtrados = data.filter(p => {
            const cat = p.categoria;
            if (!cat) return false;
            if (Array.isArray(cat)) return cat.includes(categoria);
            return String(cat).toLowerCase() === String(categoria).toLowerCase();
          });
        }

        renderProductos(filtrados);
      })
      .catch(err => {
        console.error('Error al cargar productos:', err);
        const contenedor = document.getElementById('contenedor-productos');
        if (contenedor) contenedor.innerHTML = '<p class="text-red-500">No se pudieron cargar los productos.</p>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();