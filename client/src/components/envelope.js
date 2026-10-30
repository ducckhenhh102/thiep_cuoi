/**
 * envelope.js — Màn hình Phong bì Thiệp mời mở đầu (Chuẩn v3 nâng cấp)
 *
 * Tính năng:
 *  - Phong bì thiết kế trang nhã với con dấu niêm phong mạ vàng sáp 3D
 *  - Khi khách chạm/nhấp vào phong bì hoặc con dấu:
 *    + Con dấu vỡ tan / mờ dần
 *    + Nắp phong bì mở 3D nhẹ nhàng
 *    + Toàn bộ màn hình chuyển cảnh cinematic fade-out (400ms) chuyển thẳng vào trang chính
 *    + Phát sự kiện 'envelope:opened' để kích hoạt nhạc nền & hiệu ứng cuộn
 */

export function initEnvelope() {
  const screen      = document.getElementById('envelope-screen');
  const card        = document.querySelector('.envelope-card');
  const btnSeal     = document.getElementById('btn-open-envelope');
  const mainContent = document.getElementById('main-content');

  if (!screen || !mainContent) return;

  let isOpening = false;

  function openEnvelope() {
    if (isOpening) return;
    if (screen.style.display === 'none') return;
    isOpening = true;

    // 1. Hiệu ứng mở con dấu & nắp phong bì
    if (btnSeal) {
      btnSeal.disabled = true;
      btnSeal.classList.add('is-hidden');
    }

    if (card) {
      card.classList.add('is-open');
    }

    // 2. Chuyển cảnh ngay vào trang sau (fade-out mượt trong 420ms)
    screen.classList.add('is-closing');
    mainContent.hidden = false;

    setTimeout(() => {
      screen.style.display = 'none';
      screen.setAttribute('aria-hidden', 'true');
      document.dispatchEvent(new CustomEvent('envelope:opened'));
    }, 420);
  }

  // Bắt sự kiện nhấp vào nút con dấu hoặc toàn bộ màn hình phong bì
  if (btnSeal) {
    btnSeal.addEventListener('click', (e) => {
      e.stopPropagation();
      openEnvelope();
    });
  }

  screen.addEventListener('click', openEnvelope);

  // Phím Enter hoặc Space
  if (btnSeal) {
    btnSeal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openEnvelope();
      }
    });
  }
}
