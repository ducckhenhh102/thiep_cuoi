/**
 * wedding-gallery.js — Album Ảnh Cưới Mỹ Thuật (Fine-Art & Editorial Magazine Style)
 *
 * Tính năng cao cấp học tập từ Biihappy, Joy, Zola & Minted:
 *  - Luôn đảm bảo đúng 2 ảnh mỗi hàng trên mọi thiết bị (chuẩn responsive cố định).
 *  - Khung ảnh Fine-Art Arch Frame: Viền kép ánh kim, bo góc hoàng gia quý phái.
 *  - Bộ lọc danh mục cảm xúc (Filter Tabs): "Tất Cả", "Hẹn Hò & Tình Yêu", "Ngày Chung Đôi".
 *  - Tương tác thả tim ❤️ (Heart Reaction): Khách có thể bấm tim cho từng bức ảnh yêu thích.
 *  - Hiệu ứng Scroll Zoom: Ảnh tự động nở ra uyển chuyển khi lướt tới trung tâm tầm nhìn.
 *  - Next-Gen Lightbox: Dải Filmstrip thu nhỏ ở đáy màn hình, vuốt chạm mobile, bàn phím điều hướng.
 */

export function initWeddingGallery(galleryItems) {
  const gridEl = document.getElementById('gallery-grid');
  const filterWrap = document.getElementById('gallery-filters');
  if (!gridEl || !galleryItems?.length) return;

  gridEl.innerHTML = '';

  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  // ── Quản lý Lượt Thích (Heart Likes) qua LocalStorage ───────────────
  function getLikes(index) {
    const saved = localStorage.getItem(`wedding_photo_likes_${index}`);
    if (saved !== null) return parseInt(saved, 10);
    return galleryItems[index]?.baseLikes || (20 + (index * 7) % 35);
  }

  function isLiked(index) {
    return localStorage.getItem(`wedding_photo_liked_${index}`) === 'true';
  }

  function toggleLike(index, btnEl, countEl) {
    const liked = isLiked(index);
    let count = getLikes(index);

    if (liked) {
      count = Math.max(0, count - 1);
      localStorage.setItem(`wedding_photo_liked_${index}`, 'false');
    } else {
      count += 1;
      localStorage.setItem(`wedding_photo_liked_${index}`, 'true');
      // Hiệu ứng nổ tim lấp lánh
      btnEl?.classList.add('heart-burst');
      setTimeout(() => btnEl?.classList.remove('heart-burst'), 600);
    }

    localStorage.setItem(`wedding_photo_likes_${index}`, count);
    if (countEl) countEl.textContent = count;
    if (btnEl) {
      btnEl.classList.toggle('is-liked', !liked);
      btnEl.setAttribute('aria-pressed', !liked ? 'true' : 'false');
    }

    // Đồng bộ nếu đang mở trong Lightbox
    const lbLikeBtn = document.getElementById('lightbox-like-btn');
    const lbLikeCount = document.getElementById('lightbox-like-count');
    if (lbLikeBtn && lbLikeCount && currentIndex === index) {
      lbLikeCount.textContent = count;
      lbLikeBtn.classList.toggle('is-liked', !liked);
    }
  }

  // ── 1. Render danh sách ảnh dạng Khung Tranh Mỹ Thuật ───────────────
  galleryItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'gallery-card wedding-gallery__item';
    li.setAttribute('role', 'listitem');
    li.dataset.index = index;
    li.dataset.category = item.category || 'all';

    const roman = romanNumerals[index] || (index + 1);
    const likes = getLikes(index);
    const liked = isLiked(index);

    li.innerHTML = `
      <div class="gallery-card__frame">
        <div class="gallery-card__media">
          <img
            src="${item.src}"
            alt="${item.alt || `Ảnh cưới ${index + 1}`}"
            class="gallery-card__img"
            loading="${index < 2 ? 'eager' : 'lazy'}"
            decoding="async"
          />
          <div class="gallery-card__overlay">
            <span class="gallery-card__zoom-badge" aria-hidden="true">
              <span class="gallery-card__zoom-icon">✦</span>
              <span class="gallery-card__zoom-text">Xem trọn vẹn</span>
            </span>
          </div>

          <!-- Huy hiệu số La Mã góc trái -->
          <span class="gallery-card__badge" aria-hidden="true">${roman}</span>

          <!-- Nút thả tim tương tác góc phải -->
          <button
            type="button"
            class="gallery-card__like-btn ${liked ? 'is-liked' : ''}"
            aria-label="Thích khoảnh khắc này"
            aria-pressed="${liked ? 'true' : 'false'}"
            data-like-index="${index}"
          >
            <span class="like-heart" aria-hidden="true">♥</span>
            <span class="like-count">${likes}</span>
          </button>
        </div>

        <div class="gallery-card__caption-wrap">
          <p class="gallery-card__caption">${item.alt || `Khoảnh khắc ${index + 1}`}</p>
          <span class="gallery-card__sparkle" aria-hidden="true">✦</span>
        </div>
      </div>
    `;

    // Nhấp nút tim: chỉ thả tim, không mở lightbox
    const likeBtn = li.querySelector('.gallery-card__like-btn');
    const likeCount = li.querySelector('.like-count');
    likeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLike(index, likeBtn, likeCount);
    });

    // Nhấp vào thẻ: mở Lightbox
    li.addEventListener('click', () => openLightbox(index));
    gridEl.appendChild(li);
  });

  // ── 2. Xử lý Bộ lọc phân loại khoảnh khắc (Filter Tabs) ─────────────
  if (filterWrap) {
    const filterBtns = filterWrap.querySelectorAll('.gallery-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');

        const filter = btn.dataset.filter || 'all';
        const cards = gridEl.querySelectorAll('.gallery-card');

        cards.forEach(card => {
          const category = card.dataset.category;
          if (filter === 'all' || category === filter) {
            card.style.display = 'block';
            requestAnimationFrame(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            });
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.92)';
            setTimeout(() => {
              if (btn.classList.contains('is-active') && filter !== 'all' && card.dataset.category !== filter) {
                card.style.display = 'none';
              }
            }, 250);
          }
        });

        // Kích hoạt lại scroll zoom sau khi lọc
        setTimeout(updateScrollZoom, 300);
      });
    });
  }

  // ── 3. Hiệu ứng Scroll Zoom to nhỏ dần khi cuộn trang ──────────────────
  let ticking = false;

  function updateScrollZoom() {
    const cards = gridEl.querySelectorAll('.gallery-card');
    if (!cards.length) return;

    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    const centerY = viewportH / 2;
    const maxDistance = viewportH * 0.65;

    cards.forEach(card => {
      if (card.style.display === 'none') return;
      const rect = card.getBoundingClientRect();
      const cardCenterY = rect.top + rect.height / 2;
      const dist = Math.abs(cardCenterY - centerY);

      const progress = Math.max(0, Math.min(1, 1 - dist / maxDistance));
      const scale = (0.92 + progress * 0.11).toFixed(3);
      const opacity = (0.85 + progress * 0.15).toFixed(3);

      card.style.setProperty('--scroll-scale', scale);
      card.style.setProperty('--scroll-opacity', opacity);
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollZoom);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  setTimeout(updateScrollZoom, 150);

  // ── 4. Next-Gen Lightbox — Trình Xem Ảnh Điện Ảnh Kèm Filmstrip ─────
  let currentIndex = 0;
  let lightboxEl = null;
  let imgEl = null;
  let captionEl = null;
  let counterEl = null;
  let filmstripEl = null;
  let lbLikeBtn = null;
  let lbLikeCount = null;

  function buildLightbox() {
    if (lightboxEl) return;

    lightboxEl = document.createElement('div');
    lightboxEl.className = 'lightbox';
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-modal', 'true');
    lightboxEl.setAttribute('aria-label', 'Xem ảnh cưới phóng to');
    lightboxEl.hidden = true;

    // Render dải thumbnail filmstrip
    const thumbsHtml = galleryItems.map((item, idx) => `
      <button type="button" class="lightbox-thumb" data-thumb-index="${idx}" aria-label="Xem ảnh ${idx + 1}">
        <img src="${item.src}" alt="" loading="lazy" />
      </button>
    `).join('');

    lightboxEl.innerHTML = `
      <div class="lightbox-backdrop"></div>
      <div class="lightbox-inner">
        <!-- Nút Đóng -->
        <button class="lightbox-btn lightbox-btn--close" type="button" aria-label="Đóng (Escape)">✕</button>
        
        <!-- Nút Chuyển Ảnh Trước -->
        <button class="lightbox-btn lightbox-btn--prev" type="button" aria-label="Ảnh trước">&#8249;</button>
        
        <!-- Khu vực hiển thị ảnh trung tâm -->
        <div class="lightbox-stage">
          <div class="lightbox-img-frame">
            <img class="lightbox-img" src="" alt="" draggable="false" />
          </div>

          <div class="lightbox-info">
            <div class="lightbox-info__main">
              <p class="lightbox-caption"></p>
              <p class="lightbox-counter"></p>
            </div>

            <!-- Nút Thả Tim trong Lightbox -->
            <button type="button" class="lightbox-like-btn" id="lightbox-like-btn" aria-label="Thả tim ảnh này">
              <span class="lb-heart">♥</span>
              <span class="lb-count" id="lightbox-like-count">0</span>
            </button>
          </div>

          <!-- Dải filmstrip thumbnails cuộn ngang ở đáy -->
          <div class="lightbox-filmstrip" id="lightbox-filmstrip">
            ${thumbsHtml}
          </div>
        </div>

        <!-- Nút Chuyển Ảnh Tiếp -->
        <button class="lightbox-btn lightbox-btn--next" type="button" aria-label="Ảnh tiếp">&#8250;</button>
      </div>
    `;

    document.body.appendChild(lightboxEl);

    imgEl         = lightboxEl.querySelector('.lightbox-img');
    captionEl     = lightboxEl.querySelector('.lightbox-caption');
    counterEl     = lightboxEl.querySelector('.lightbox-counter');
    filmstripEl   = lightboxEl.querySelector('#lightbox-filmstrip');
    lbLikeBtn     = lightboxEl.querySelector('#lightbox-like-btn');
    lbLikeCount   = lightboxEl.querySelector('#lightbox-like-count');

    // Thả tim từ Lightbox
    lbLikeBtn.addEventListener('click', () => {
      const card = gridEl.querySelector(`.gallery-card[data-index="${currentIndex}"]`);
      const cardLikeBtn = card?.querySelector('.gallery-card__like-btn');
      const cardLikeCount = card?.querySelector('.like-count');
      toggleLike(currentIndex, cardLikeBtn, cardLikeCount);
    });

    // Nhấp vào filmstrip thumbnail
    filmstripEl.querySelectorAll('.lightbox-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const idx = parseInt(thumb.dataset.thumbIndex, 10);
        if (!isNaN(idx)) {
          currentIndex = idx;
          loadImage(currentIndex);
        }
      });
    });

    lightboxEl.querySelector('.lightbox-backdrop').addEventListener('click', closeLightbox);
    lightboxEl.querySelector('.lightbox-btn--close').addEventListener('click', closeLightbox);
    lightboxEl.querySelector('.lightbox-btn--prev').addEventListener('click', (e) => {
      e.stopPropagation();
      navigate(-1);
    });
    lightboxEl.querySelector('.lightbox-btn--next').addEventListener('click', (e) => {
      e.stopPropagation();
      navigate(1);
    });

    document.addEventListener('keydown', onKeyDown);

    // Vuốt chạm trên thiết bị di động
    let touchStartX = 0;
    let touchStartY = 0;
    lightboxEl.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    lightboxEl.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        navigate(dx < 0 ? 1 : -1);
      }
      if (dy > 80 && Math.abs(dy) > Math.abs(dx)) {
        closeLightbox();
      }
    }, { passive: true });
  }

  function openLightbox(index) {
    buildLightbox();
    currentIndex = index;
    loadImage(index);

    lightboxEl.hidden = false;
    requestAnimationFrame(() => {
      lightboxEl.classList.add('is-open');
    });
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (lightboxEl) lightboxEl.hidden = true;
    }, 320);
  }

  function navigate(dir) {
    currentIndex = (currentIndex + dir + galleryItems.length) % galleryItems.length;
    loadImage(currentIndex);
  }

  function loadImage(index) {
    const item = galleryItems[index];
    if (!item) return;

    imgEl.style.opacity = '0';
    imgEl.style.transform = 'scale(0.96)';

    // Cập nhật lượt like trong Lightbox
    if (lbLikeCount) lbLikeCount.textContent = getLikes(index);
    if (lbLikeBtn) lbLikeBtn.classList.toggle('is-liked', isLiked(index));

    // Cập nhật active thumbnail
    if (filmstripEl) {
      filmstripEl.querySelectorAll('.lightbox-thumb').forEach((thumb, idx) => {
        const isActive = idx === index;
        thumb.classList.toggle('is-active', isActive);
        if (isActive) {
          thumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    }

    setTimeout(() => {
      imgEl.src = item.src;
      imgEl.alt = item.alt;
      if (captionEl) captionEl.textContent = item.alt;
      if (counterEl) counterEl.textContent = `Khoảnh khắc ${index + 1} / ${galleryItems.length}`;

      imgEl.onload = () => {
        imgEl.style.opacity = '1';
        imgEl.style.transform = 'scale(1)';
      };
    }, 120);
  }

  function onKeyDown(e) {
    if (!lightboxEl || lightboxEl.hidden) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  }
}
