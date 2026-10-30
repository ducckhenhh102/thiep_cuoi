/**
 * petals.js — Hiệu ứng Cánh Hoa Hồng Rơi Tinh Khôi (Romantic Petal Rain)
 *
 * Tính năng:
 *  - Canvas GPU-accelerated 60fps mượt mà, tối ưu pin & CPU.
 *  - Cánh hoa xoay lượn 3D tự nhiên với độ đung đưa theo làn gió.
 *  - Tự động điều chỉnh số lượng theo kích thước màn hình (mobile: 14 cánh, desktop: 28 cánh).
 *  - Tạm dừng khi chuyển tab (Page Visibility API) để tiết kiệm tài nguyên.
 *  - Không cản trở bất kỳ tương tác nhấp hay chạm nào (pointer-events: none).
 */

export function initPetals() {
  const canvas = document.getElementById('petals-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const isMobile = width < 768;
  const PETAL_COUNT = isMobile ? 14 : 26;

  // Bảng màu cánh hoa hồng pastel
  const colors = [
    { start: 'rgba(255, 218, 228, 0.85)', end: 'rgba(248, 180, 198, 0.7)' },
    { start: 'rgba(255, 232, 240, 0.9)',  end: 'rgba(244, 168, 188, 0.75)' },
    { start: 'rgba(250, 200, 215, 0.85)', end: 'rgba(232, 137, 154, 0.65)' },
    { start: 'rgba(255, 240, 245, 0.95)', end: 'rgba(250, 192, 210, 0.75)' },
  ];

  class Petal {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : -20;
      this.size = Math.random() * 8 + 9; // 9px - 17px
      this.speedY = Math.random() * 0.9 + 0.7; // Tốc độ rơi êm dịu
      this.speedX = Math.random() * 0.6 - 0.3; // Độ trôi ngang
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.02;
      this.flip = Math.random() * Math.PI;
      this.flipSpeed = Math.random() * 0.025 + 0.015; // Hiệu ứng xoay 3D
      this.swayAngle = Math.random() * Math.PI * 2;
      this.swaySpeed = Math.random() * 0.02 + 0.01;
      this.swayWidth = Math.random() * 1.5 + 0.8;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.opacity = Math.random() * 0.35 + 0.65;
    }

    update() {
      this.y += this.speedY;
      this.swayAngle += this.swaySpeed;
      this.x += Math.sin(this.swayAngle) * this.swayWidth + this.speedX;
      this.rotation += this.rotationSpeed;
      this.flip += this.flipSpeed;

      // Khi rơi chạm đáy hoặc bay quá mép phải/trái
      if (this.y > height + 20 || this.x < -30 || this.x > width + 30) {
        this.reset();
      }
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      // Hiệu ứng lật cánh hoa 3D trong không gian
      ctx.scale(Math.cos(this.flip), 1);
      ctx.globalAlpha = this.opacity;

      // Vẽ hình dạng cánh hoa bằng đường cong Bezier
      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.bezierCurveTo(
        this.size * 0.8, -this.size * 0.6,
        this.size * 0.9, this.size * 0.5,
        0, this.size
      );
      ctx.bezierCurveTo(
        -this.size * 0.9, this.size * 0.5,
        -this.size * 0.8, -this.size * 0.6,
        0, -this.size
      );
      ctx.closePath();

      // Tô màu gradient mềm mại
      const grad = ctx.createLinearGradient(0, -this.size, 0, this.size);
      grad.addColorStop(0, this.color.start);
      grad.addColorStop(1, this.color.end);
      ctx.fillStyle = grad;
      ctx.fill();

      // Gân cánh hoa mờ tinh tế
      ctx.beginPath();
      ctx.moveTo(0, -this.size * 0.7);
      ctx.quadraticCurveTo(this.size * 0.1, 0, 0, this.size * 0.7);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    }
  }

  const petals = Array.from({ length: PETAL_COUNT }, () => new Petal());

  let animationId = null;
  let isRunning = true;

  function render() {
    if (!isRunning) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < petals.length; i++) {
      petals[i].update();
      petals[i].draw();
    }

    animationId = requestAnimationFrame(render);
  }

  // Khởi động vòng lặp render
  render();

  // Xử lý thay đổi kích thước cửa sổ
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, 150);
  });

  // Tạm dừng khi người dùng chuyển sang tab khác
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isRunning = false;
      if (animationId) cancelAnimationFrame(animationId);
    } else {
      isRunning = true;
      render();
    }
  });
}
