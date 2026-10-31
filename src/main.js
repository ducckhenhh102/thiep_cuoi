/**
 * main.js — Điểm khởi chạy chính của Website Thiệp Cưới Online (Chuẩn v3)
 *
 * Trình tự thực thi:
 *  01. Khởi tạo dữ liệu từ wedding.js vào các phân đoạn DOM.
 *  02. Khởi tạo phong bì thiệp mời 3D (envelope.js).
 *  03. Khi khách mở thiệp (sự kiện 'envelope:opened'):
 *      - Kích hoạt trình phát nhạc (music-player.js).
 *      - Khởi động đồng hồ đếm ngược (countdown.js).
 *      - Khởi động album ảnh cưới 2 cột & lightbox (wedding-gallery.js).
 *      - Khởi động form & danh sách lời chúc Supabase Realtime (wishes.js).
 *      - Khởi động modal gửi quà mừng QR (gift-qr.js).
 *      - Bật hiệu ứng cuộn mượt mà (reveal.js).
 */

import wedding from './config/wedding.js';
import { initEnvelope }      from './components/envelope.js';
import { initMusicPlayer }   from './components/music-player.js';
import { initCountdown }     from './components/countdown.js';
import { initWeddingGallery } from './components/wedding-gallery.js';
import { initGiftQr }        from './components/gift-qr.js';
import { initReveal }        from './components/reveal.js';
import { initPetals }        from './components/petals.js';
import { initAdmin }         from './components/admin.js';
// wishes.js phụ thuộc CDN Supabase → dùng dynamic import để không block app

// ── Helper hàm gán text an toàn ──────────────────────────────────────
const setText = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text ?? '';
};

// ── 1. Cập nhật Metadata SEO & Title ─────────────────────────────────
document.title = wedding.meta?.title || `Thiệp Cưới — ${wedding.groomName} & ${wedding.brideName}`;
document.querySelector('meta[name="description"]')?.setAttribute('content', wedding.meta?.description || '');
document.querySelector('meta[property="og:title"]')?.setAttribute('content', wedding.meta?.title || '');
document.querySelector('meta[property="og:description"]')?.setAttribute('content', wedding.meta?.description || '');

// ── 2. Phong bì thiệp mời (01. Envelope) ─────────────────────────────
setText('env-groom-name',   wedding.groomName);
setText('env-bride-name',   wedding.brideName);
setText('env-fullnames',    `${wedding.groomFullName} • ${wedding.brideFullName}`);
setText('env-date-display', wedding.dateDisplay);
setText('envelope-names',   `${wedding.groomName} & ${wedding.brideName}`);
setText('envelope-date',    wedding.dateDisplay);

// ── 3. Giới thiệu cô dâu chú rể (02. Hero) ───────────────────────────
setText('hero-groom-name', wedding.groomName);
setText('hero-bride-name', wedding.brideName);
setText('hero-fullnames',  `${wedding.groomFullName} • ${wedding.brideFullName}`);
setText('hero-date',       wedding.dateDisplay);

const heroBg = document.getElementById('hero-bg');
if (heroBg && wedding.coverImage) {
  heroBg.style.backgroundImage = `url('${wedding.coverImage}')`;
}

// ── 4. Câu chuyện tình yêu (Story) ───────────────────────────────────
const storyEl = document.getElementById('story-text');
if (storyEl && wedding.invitationStory) {
  storyEl.innerHTML = '';
  wedding.invitationStory.split('\n').forEach(para => {
    const trimmed = para.trim();
    if (!trimmed) return;
    const p = document.createElement('p');
    p.textContent = trimmed;
    storyEl.appendChild(p);
  });
}

// ── 5. Đại diện hai gia đình (03. Family Representatives) ─────────────
// Nhà Trai
setText('groom-family-title',   wedding.groomFamily.title);
setText('groom-family-address', wedding.groomFamily.address);
const groomRepsList = document.getElementById('groom-family-reps');
if (groomRepsList) {
  groomRepsList.innerHTML = '';
  wedding.groomFamily.representatives.forEach(rep => {
    const li = document.createElement('li');
    li.textContent = rep;
    groomRepsList.appendChild(li);
  });
}
const groomMapBtn = document.getElementById('groom-family-map');
if (groomMapBtn && wedding.groomFamily.mapUrl) {
  groomMapBtn.href = wedding.groomFamily.mapUrl;
}

// Nhà Gái
setText('bride-family-title',   wedding.brideFamily.title);
setText('bride-family-address', wedding.brideFamily.address);
const brideRepsList = document.getElementById('bride-family-reps');
if (brideRepsList) {
  brideRepsList.innerHTML = '';
  wedding.brideFamily.representatives.forEach(rep => {
    const li = document.createElement('li');
    li.textContent = rep;
    brideRepsList.appendChild(li);
  });
}
const brideMapBtn = document.getElementById('bride-family-map');
if (brideMapBtn && wedding.brideFamily.mapUrl) {
  brideMapBtn.href = wedding.brideFamily.mapUrl;
}

// ── 6. Lễ Thành Hôn & Bữa Cơm Thân Mật (04 & 05. Events) ──────────────
// Lễ Thành Hôn
setText('ceremony-title',   wedding.ceremony.title);
setText('ceremony-time',    wedding.ceremony.timeDisplay);
setText('ceremony-venue',   wedding.ceremony.venue);
setText('ceremony-address', wedding.ceremony.address);
const ceremonyMapBtn = document.getElementById('ceremony-map-btn');
if (ceremonyMapBtn && wedding.ceremony.mapUrl) {
  ceremonyMapBtn.href = wedding.ceremony.mapUrl;
}

// Bữa Cơm Thân Mật
setText('family-meal-title',   wedding.familyMeal.title);
setText('family-meal-time',    wedding.familyMeal.timeDisplay);
setText('family-meal-venue',   wedding.familyMeal.venue);
setText('family-meal-address', wedding.familyMeal.address);
const mealMapBtn = document.getElementById('family-meal-map-btn');
if (mealMapBtn && wedding.familyMeal.mapUrl) {
  mealMapBtn.href = wedding.familyMeal.mapUrl;
}

// ── 7. Footer ─────────────────────────────────────────────────────────
setText('footer-names', `${wedding.groomName} & ${wedding.brideName}`);
setText('footer-date',  wedding.dateDisplay);

// ── Cá nhân hóa tên khách mời từ URL (?to=... hoặc ?guest=...) ───────
const urlParams = new URLSearchParams(window.location.search);
const guestParam = urlParams.get('to') || urlParams.get('guest') || urlParams.get('k');
if (guestParam) {
  const cleanGuest = decodeURIComponent(guestParam.replace(/\+/g, ' ')).trim();
  if (cleanGuest) {
    const envGuestWrap = document.getElementById('env-guest-wrap');
    const envGuestName = document.getElementById('env-guest-name');
    if (envGuestWrap && envGuestName) {
      envGuestName.textContent = cleanGuest;
      envGuestWrap.hidden = false;
    }
    const heroGuestWrap = document.getElementById('hero-guest-wrap');
    const heroGuestName = document.getElementById('hero-guest-name');
    if (heroGuestWrap && heroGuestName) {
      heroGuestName.textContent = cleanGuest;
      heroGuestWrap.hidden = false;
    }
  }
}

// ── Nút Thêm vào Google Calendar ─────────────────────────────────────
const btnCalendar = document.getElementById('btn-add-calendar');
if (btnCalendar && wedding.weddingDate) {
  try {
    const d = new Date(wedding.weddingDate);
    const startIso = d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(d.getTime() + 4 * 3600 * 1000);
    const endIso = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const title = encodeURIComponent(`Lễ Thành Hôn — ${wedding.groomName} & ${wedding.brideName}`);
    const details = encodeURIComponent(`Trân trọng kính mời bạn đến chung vui trong ngày hạnh phúc của chúng tôi!\nĐịa điểm: ${wedding.ceremony?.venue || ''} (${wedding.ceremony?.address || ''})`);
    const location = encodeURIComponent(`${wedding.ceremony?.venue || ''}, ${wedding.ceremony?.address || ''}`);
    btnCalendar.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
  } catch (err) {
    console.warn('[Calendar] Không tạo được link lịch:', err);
  }
}

// ── 8. Khởi tạo tất cả thành phần giao diện & sự kiện ngay từ đầu ─────
// Đảm bảo tất cả nút bấm, form, modal đều sẵn sàng nhận tương tác
initMusicPlayer(wedding.musicUrl);
initCountdown(wedding.weddingDate);
initWeddingGallery(wedding.gallery);
initGiftQr(wedding.gifts);
initPetals();
initAdmin();

// Nạp module lời chúc ngay khi trang sẵn sàng
import('./components/wishes.js')
  .then(({ initWishes }) => initWishes())
  .catch(err => console.warn('[Wishes] Không tải được module:', err));

// Khởi chạy màn hình phong bì 3D
initEnvelope();

// ── 9. Sau khi phong bì mở: kích hoạt hiệu ứng cuộn mượt ──────────────
document.addEventListener('envelope:opened', () => {
  initReveal();
}, { once: true });
