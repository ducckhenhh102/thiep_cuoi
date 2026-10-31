/**
 * countdown.js — Đồng hồ đếm ngược ngày cưới (Chuẩn v3)
 *
 * Tính năng:
 *  - Đếm ngược chính xác theo ngày giờ và múi giờ.
 *  - Cập nhật số mượt mà, không nhấp nháy.
 *  - Hiển thị thông điệp ngày vui khi đến hoặc qua ngày cưới.
 */

export function initCountdown(weddingDateStr) {
  const grid      = document.getElementById('countdown-grid');
  const daysEl    = document.getElementById('cd-days');
  const hoursEl   = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');
  const section   = document.getElementById('countdown');

  if (!grid || !daysEl || !weddingDateStr) return;

  const targetDate = new Date(weddingDateStr);
  if (isNaN(targetDate.getTime())) return;

  const pad = (n) => String(Math.max(0, n)).padStart(2, '0');

  function updateNumber(el, val) {
    if (el.textContent !== val) {
      el.textContent = val;
    }
  }

  function tick() {
    const diff = targetDate - new Date();

    if (diff <= 0) {
      clearInterval(timer);
      grid.hidden = true;
      const msg = document.createElement('p');
      msg.className = 'countdown-celebration';
      msg.textContent = '🎉 Hôm nay là ngày hạnh phúc của chúng tôi! 🎉';
      section?.querySelector('.container')?.appendChild(msg);
      return;
    }

    const totalSec = Math.floor(diff / 1000);
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;

    updateNumber(daysEl,    pad(d));
    updateNumber(hoursEl,   pad(h));
    updateNumber(minutesEl, pad(m));
    updateNumber(secondsEl, pad(s));
  }

  tick();
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
}
