/**
 * reveal.js — IntersectionObserver cho hiệu ứng xuất hiện khi cuộn
 *
 * Tất cả phần tử có class `.reveal` sẽ tự động fade + slide-up
 * khi vào vùng nhìn của người dùng.
 *
 * Không dùng scroll listener nặng — hoàn toàn dựa vào IntersectionObserver.
 */

export function initReveal() {
  // Tôn trọng prefers-reduced-motion: nếu người dùng giảm chuyển động
  // thì không cần observer, để CSS đã set opacity: 1 ngay từ đầu
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    // Đánh dấu tất cả là visible ngay lập tức
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }

  // Kiểm tra browser hỗ trợ IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    // Fallback: hiện tất cả ngay
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Sau khi đã hiện → ngừng observe để tiết kiệm tài nguyên
          observer.unobserve(entry.target);
        }
      });
    },
    {
      // Kích hoạt khi phần tử vào 10% vùng nhìn
      threshold: 0.1,
      // Kích hoạt sớm hơn 60px trước khi vào màn hình
      rootMargin: '0px 0px -60px 0px',
    }
  );

  // Observe tất cả phần tử .reveal hiện có trong DOM
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // Trả về hàm để observe thêm phần tử mới (ví dụ wish card mới thêm vào)
  return {
    observe: (el) => observer.observe(el),
    disconnect: () => observer.disconnect(),
  };
}
