/**
 * gallery.js — Bộ sưu tập ảnh cưới
 *
 * Tính năng:
 *  - Render grid ảnh từ config (wedding.js → images.gallery)
 *  - Lazy loading native (loading="lazy") cho ảnh bên dưới
 *  - Lightbox thuần JS: click ảnh → xem to, điều hướng prev/next, đóng
 *  - Hỗ trợ bàn phím: ArrowLeft, ArrowRight, Escape
 *  - Hỗ trợ swipe trên mobile (touchstart / touchend)
 *  - Không dùng thư viện ngoài
 *
 * @param {Array<{src: string, alt: string}>} galleryItems
 */

export function initGallery(galleryItems) {
  const gridEl = document.getElementById('gallery-grid');
  if (!gridEl || !galleryItems?.length) return;

  // ════════════════════════════════════════════════════════════════════════
  // 1. Render grid ảnh
  // ════════════════════════════════════════════════════════════════════════
  galleryItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.className  = 'gallery-item';
    li.setAttribute('role', 'listitem');

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'gallery-btn';
    btn.setAttribute('aria-label', `Xem ảnh: ${item.alt}`);
    btn.dataset.index = index;

    const img = document.createElement('img');
    img.src   = item.src;
    img.alt   = item.alt;
    // Ảnh đầu tiên eager (hiện ngay), các ảnh còn lại lazy
    img.loading = index < 2 ? 'eager' : 'lazy';
    img.decoding = 'async';
    // Tránh layout shift
    img.width  = 400;
    img.height = 300;

    // Xử lý ảnh lỗi → hiện placeholder
    img.addEventListener('error', () => {
      img.style.display = 'none';
      li.classList.add('gallery-item--placeholder');
      li.setAttribute('aria-label', `Ảnh không tải được: ${item.alt}`);
    });

    btn.appendChild(img);
    li.appendChild(btn);
    gridEl.appendChild(li);

    // Click mở lightbox
    btn.addEventListener('click', () => openLightbox(index));
  });

  // ════════════════════════════════════════════════════════════════════════
  // 2. Lightbox
  // ════════════════════════════════════════════════════════════════════════
  let currentIndex = 0;
  let lightboxEl   = null;
  let imgEl        = null;
  let captionEl    = null;

  // Lưu phần tử đang focus trước khi mở lightbox để restore lại
  let previouslyFocused = null;

  function buildLightbox() {
    if (lightboxEl) return; // đã build rồi

    lightboxEl = document.createElement('div');
    lightboxEl.id        = 'lightbox';
    lightboxEl.className = 'lightbox';
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-modal', 'true');
    lightboxEl.setAttribute('aria-label', 'Xem ảnh phóng to');
    lightboxEl.hidden = true;

    lightboxEl.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <div class="lightbox-inner">
        <button class="lightbox-btn lightbox-btn--close" type="button" aria-label="Đóng">✕</button>
        <button class="lightbox-btn lightbox-btn--prev"  type="button" aria-label="Ảnh trước">&#8249;</button>
        <div class="lightbox-img-wrap">
          <img class="lightbox-img" src="" alt="" draggable="false" />
          <div class="lightbox-loader" aria-hidden="true"></div>
        </div>
        <button class="lightbox-btn lightbox-btn--next"  type="button" aria-label="Ảnh tiếp">&#8250;</button>
        <p class="lightbox-caption"></p>
        <p class="lightbox-counter" aria-live="polite"></p>
      </div>
    `;

    document.body.appendChild(lightboxEl);

    imgEl     = lightboxEl.querySelector('.lightbox-img');
    captionEl = lightboxEl.querySelector('.lightbox-caption');

    // ── Sự kiện ───────────────────────────────────────────────────────
    lightboxEl.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
    lightboxEl.querySelector('.lightbox-btn--close').addEventListener('click', closeLightbox);
    lightboxEl.querySelector('.lightbox-btn--prev').addEventListener('click', () => navigate(-1));
    lightboxEl.querySelector('.lightbox-btn--next').addEventListener('click', () => navigate(1));

    // ── Bàn phím ──────────────────────────────────────────────────────
    document.addEventListener('keydown', onKeyDown);

    // ── Swipe mobile ──────────────────────────────────────────────────
    let touchStartX = 0;
    lightboxEl.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    lightboxEl.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  function openLightbox(index) {
    buildLightbox();
    previouslyFocused = document.activeElement;
    currentIndex = index;
    loadImage(index);

    lightboxEl.hidden = false;
    // Trigger CSS transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => lightboxEl.classList.add('is-open'));
    });

    // Ngăn scroll body
    document.body.style.overflow = 'hidden';

    // Focus vào nút đóng
    lightboxEl.querySelector('.lightbox-btn--close')?.focus();
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove('is-open');
    lightboxEl.addEventListener('transitionend', () => {
      lightboxEl.hidden = true;
    }, { once: true });
    setTimeout(() => { if (lightboxEl) lightboxEl.hidden = true; }, 400);

    // Khôi phục scroll body
    document.body.style.overflow = '';

    // Trả focus về nút ảnh vừa mở
    previouslyFocused?.focus();
  }

  function navigate(dir) {
    currentIndex = (currentIndex + dir + galleryItems.length) % galleryItems.length;
    loadImage(currentIndex);
  }

  function loadImage(index) {
    const item   = galleryItems[index];
    const loader = lightboxEl.querySelector('.lightbox-loader');
    const counter = lightboxEl.querySelector('.lightbox-counter');

    // Hiện loader
    imgEl.style.opacity = '0';
    if (loader) loader.style.display = 'block';

    // Cập nhật caption & counter
    if (captionEl) captionEl.textContent = item.alt;
    if (counter)   counter.textContent   = `${index + 1} / ${galleryItems.length}`;
    lightboxEl.setAttribute('aria-label', `Ảnh ${index + 1} trên ${galleryItems.length}: ${item.alt}`);

    // Cập nhật prev/next disabled state
    const prevBtn = lightboxEl.querySelector('.lightbox-btn--prev');
    const nextBtn = lightboxEl.querySelector('.lightbox-btn--next');
    if (prevBtn) prevBtn.disabled = galleryItems.length <= 1;
    if (nextBtn) nextBtn.disabled = galleryItems.length <= 1;

    // Load ảnh
    const tempImg = new Image();
    tempImg.onload = () => {
      imgEl.src = item.src;
      imgEl.alt = item.alt;
      imgEl.style.opacity = '1';
      if (loader) loader.style.display = 'none';
    };
    tempImg.onerror = () => {
      imgEl.src = '';
      imgEl.alt = 'Không tải được ảnh';
      if (loader) loader.style.display = 'none';
    };
    tempImg.src = item.src;
  }

  function onKeyDown(e) {
    if (!lightboxEl || lightboxEl.hidden) return;
    switch (e.key) {
      case 'Escape':     e.preventDefault(); closeLightbox();    break;
      case 'ArrowLeft':  e.preventDefault(); navigate(-1);       break;
      case 'ArrowRight': e.preventDefault(); navigate(1);        break;
    }
  }
}
