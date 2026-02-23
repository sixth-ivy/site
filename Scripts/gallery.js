(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.masonry-item'));
    var lightbox = document.querySelector('.gallery-lightbox');
    if (!galleryItems.length || !lightbox) {
      return;
    }

    var lightboxImage = lightbox.querySelector('.lightbox-image');
    var lightboxCaption = lightbox.querySelector('.lightbox-caption');
    var closeButton = lightbox.querySelector('.lightbox-close');
    var backdrop = lightbox.querySelector('.lightbox-backdrop');
    var prevButton = lightbox.querySelector('.lightbox-prev');
    var nextButton = lightbox.querySelector('.lightbox-next');
    var zoomInButton = lightbox.querySelector('.lightbox-zoom-in');
    var zoomOutButton = lightbox.querySelector('.lightbox-zoom-out');
    var body = document.body;
    var currentIndex = -1;
    var lastFocusedElement = null;
    var totalItems = galleryItems.length;

    if (!lightboxImage || !lightboxCaption || !closeButton || !prevButton || !nextButton || !zoomInButton || !zoomOutButton) {
      return;
    }

    var focusElement = function (element) {
      if (!element || typeof element.focus !== 'function') {
        return;
      }
      try {
        element.focus({ preventScroll: true });
      } catch (error) {
        element.focus();
      }
    };

    var MIN_ZOOM = 1;
    var MAX_ZOOM = 2.5;
    var ZOOM_STEP = 0.25;
    var currentZoom = MIN_ZOOM;

    var clampIndex = function (index) {
      if (index < 0) {
        return totalItems - 1;
      }
      if (index >= totalItems) {
        return 0;
      }
      return index;
    };

    var applyZoom = function (scale) {
      var clamped = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));
      currentZoom = clamped;
      if (Math.abs(clamped - 1) < 0.001) {
        lightboxImage.style.transform = '';
      } else {
        lightboxImage.style.transform = 'scale(' + clamped.toFixed(2) + ')';
      }
      zoomOutButton.disabled = clamped <= MIN_ZOOM;
      zoomInButton.disabled = clamped >= MAX_ZOOM;
    };

    var setImage = function (index) {
      var item = galleryItems[index];
      if (!item) {
        return;
      }

      var fullSrc = item.getAttribute('data-full');
      var altText = item.getAttribute('data-alt') || '';

      lightboxImage.src = fullSrc;
      lightboxImage.alt = altText;
      lightboxCaption.textContent = altText;
      currentIndex = index;
      applyZoom(MIN_ZOOM);
    };

    var openLightbox = function (index) {
      if (!lightboxImage) {
        return;
      }

      lastFocusedElement = document.activeElement;
      setImage(clampIndex(index));
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      body.classList.add('no-scroll');
      if (window.requestAnimationFrame) {
        requestAnimationFrame(function () {
          focusElement(closeButton);
        });
      } else {
        focusElement(closeButton);
      }
    };

    var closeLightbox = function () {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      body.classList.remove('no-scroll');
      applyZoom(MIN_ZOOM);
      lightboxImage.removeAttribute('src');
      lightboxImage.removeAttribute('alt');
      lightboxCaption.textContent = '';
      var target = lastFocusedElement && lastFocusedElement.focus ? lastFocusedElement : null;
      if (target) {
        if (window.requestAnimationFrame) {
          requestAnimationFrame(function () {
            focusElement(target);
          });
        } else {
          focusElement(target);
        }
      }
      currentIndex = -1;
    };

    var showRelativeImage = function (delta) {
      if (currentIndex === -1) {
        return;
      }
      var nextIndex = clampIndex(currentIndex + delta);
      setImage(nextIndex);
    };

    galleryItems.forEach(function (item, index) {
      item.addEventListener('click', function () {
        openLightbox(index);
      });
    });

    closeButton.addEventListener('click', closeLightbox);

    if (backdrop) {
      backdrop.addEventListener('click', closeLightbox);
    }

    prevButton.addEventListener('click', function () {
      showRelativeImage(-1);
    });

    nextButton.addEventListener('click', function () {
      showRelativeImage(1);
    });

    zoomInButton.addEventListener('click', function () {
      applyZoom(currentZoom + ZOOM_STEP);
    });

    zoomOutButton.addEventListener('click', function () {
      applyZoom(currentZoom - ZOOM_STEP);
    });

    document.addEventListener('keydown', function (event) {
      if (!lightbox.classList.contains('is-open')) {
        return;
      }

      if (event.key === 'Escape') {
        closeLightbox();
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showRelativeImage(-1);
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showRelativeImage(1);
      }

      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        applyZoom(currentZoom + ZOOM_STEP);
      }

      if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        applyZoom(currentZoom - ZOOM_STEP);
      }
    });
  });
})();
