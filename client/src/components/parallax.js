/**
 * parallax.js — Hiệu ứng parallax nhẹ cho hero background
 *
 * Dùng requestAnimationFrame + scroll event để di chuyển ảnh hero
 * chậm hơn tốc độ cuộn → tạo chiều sâu.
 *
 * Tự động tắt khi:
 *  - prefers-reduced-motion = reduce
 *  - Màn hình nhỏ (mobile) để tránh giật lag
 */
export function initParallax() {
  const heroBg = document.getElementById('hero-bg');
  if (!heroBg) return;

  // Không chạy khi người dùng giảm chuyển động
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Không chạy trên mobile (tránh lag và hiệu ứng không đẹp)
  if (window.innerWidth < 768) return;

  let ticking = false;
  let lastScrollY = window.scrollY;

  function updateParallax() {
    const scrollY = window.scrollY;
    const heroHeight = heroBg.parentElement?.offsetHeight ?? window.innerHeight;

    // Chỉ áp dụng khi hero còn trong vùng nhìn
    if (scrollY <= heroHeight) {
      // Di chuyển ảnh 40% tốc độ cuộn → depth effect
      const offset = scrollY * 0.4;
      heroBg.style.transform = `translateY(${offset}px)`;
    }

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}
