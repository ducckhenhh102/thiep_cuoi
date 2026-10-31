/**
 * admin.js — Bảng Quản Trị Viên (Tạo Link Mời Cá Nhân Hóa & Quản Lý Lời Chúc)
 *
 * Tính năng chính:
 *  - Xác thực mã PIN (mặc định: '123456', cấu hình tại wedding.js).
 *  - TAB 1: 💌 Công cụ tạo link thiệp cưới cá nhân hóa cho từng khách mời:
 *      + Nhập tên khách (VD: "Anh Tuấn", "Gia đình Bác Hùng") hoặc bấm gợi ý nhanh.
 *      + Xem trước hình ảnh tấm bưu thiếp trên thiệp mời.
 *      + 1-click sao chép đường link đầy đủ.
 *      + 1-click sao chép tin nhắn mời trang trọng sẵn sàng gửi qua Zalo, Messenger, SMS...
 *      + Nút mở xem thử ngay trong tab mới.
 *      + Lưu lịch sử các khách mời vừa tạo link để dễ dàng sao chép lại.
 *  - TAB 2: 💬 Quản lý & Xóa bình luận lời chúc (Xóa trực tiếp trong Database & Giao diện).
 */

import config from '../config/wedding.js';
import { getSupabase } from '../services/supabase.js';

export function initAdmin() {
  // Modal & Views
  const modal          = document.getElementById('admin-modal');
  const viewAuth       = document.getElementById('admin-view-auth');
  const viewDash       = document.getElementById('admin-view-dashboard');
  const btnClose       = document.getElementById('btn-admin-modal-close');
  const btnCancel      = document.getElementById('btn-admin-modal-cancel');
  const backdrop       = document.getElementById('admin-modal-backdrop');
  const btnToggle      = document.getElementById('btn-admin-toggle');
  const btnAdminText   = document.getElementById('admin-btn-text');
  const btnLogout      = document.getElementById('btn-admin-logout');

  // Auth Form
  const pinForm        = document.getElementById('admin-pin-form');
  const pinInput       = document.getElementById('admin-pin-input');
  const pinError       = document.getElementById('admin-pin-error');

  // Tabs
  const tabBtnLink     = document.getElementById('tab-btn-link-gen');
  const tabBtnWishes   = document.getElementById('tab-btn-wishes-mod');
  const paneLink       = document.getElementById('pane-link-gen');
  const paneWishes     = document.getElementById('pane-wishes-mod');

  // Link Generator Elements
  const guestInput     = document.getElementById('admin-guest-input');
  const btnGenLink     = document.getElementById('btn-generate-guest-link');
  const quickTags      = document.querySelectorAll('.admin-quick-tags .tag-pill');
  const resultBox      = document.getElementById('admin-link-result-box');
  const previewGuest   = document.getElementById('admin-preview-guest-name');
  const urlInput       = document.getElementById('admin-generated-url');
  const btnCopyUrl     = document.getElementById('btn-copy-generated-url');
  const btnCopyMsg     = document.getElementById('btn-copy-share-msg');
  const btnTestUrl     = document.getElementById('btn-test-generated-url');
  const recentWrap     = document.getElementById('admin-recent-links');
  const recentList     = document.getElementById('recent-links-list');

  // Wishes Mod Element
  const adminWishesList = document.getElementById('admin-wishes-list');

  if (!modal) return;

  let isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true';

  // ── Kiểm tra trạng thái đăng nhập ban đầu ──────────────────────────
  function updateAuthState() {
    if (isAuthenticated) {
      if (viewAuth) viewAuth.hidden = true;
      if (viewDash) viewDash.hidden = false;
      if (btnToggle) btnToggle.classList.add('is-active');
      if (btnAdminText) btnAdminText.textContent = 'Quản trị (Đang bật)';
    } else {
      if (viewAuth) viewAuth.hidden = false;
      if (viewDash) viewDash.hidden = true;
      if (btnToggle) btnToggle.classList.remove('is-active');
      if (btnAdminText) btnAdminText.textContent = 'Quản trị';
    }
  }

  // ── Mở / Đóng Modal ────────────────────────────────────────────────
  function openModal() {
    modal.hidden = false;
    updateAuthState();
    requestAnimationFrame(() => {
      modal.classList.add('is-open');
      if (!isAuthenticated && pinInput) {
        pinInput.value = '';
        pinError.textContent = '';
        pinInput.focus();
      } else if (isAuthenticated && guestInput) {
        guestInput.focus();
        loadRecentLinks();
      }
    });
  }

  function closeModal() {
    modal.classList.remove('is-open');
    setTimeout(() => {
      modal.hidden = true;
    }, 280);
  }

  // Gắn sự kiện mở modal từ nút footer
  btnToggle?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });

  btnClose?.addEventListener('click', closeModal);
  btnCancel?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);

  // ── Xử lý Form Đăng Nhập PIN ──────────────────────────────────────
  pinForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const entered = (pinInput?.value || '').trim();
    const correct = String(config.adminPin || '123456').trim();

    if (entered === correct) {
      isAuthenticated = true;
      sessionStorage.setItem('admin_authenticated', 'true');
      updateAuthState();
      loadRecentLinks();
      renderAdminWishes();
      // Kích hoạt nút xóa trên các thẻ ngoài trang chính nếu có
      document.dispatchEvent(new CustomEvent('admin:login'));
    } else {
      if (pinError) {
        pinError.textContent = 'Mã PIN chưa chính xác. Vui lòng thử lại!';
      }
      if (pinInput) {
        pinInput.focus();
        pinInput.select();
      }
    }
  });

  // Đăng xuất
  btnLogout?.addEventListener('click', () => {
    isAuthenticated = false;
    sessionStorage.removeItem('admin_authenticated');
    updateAuthState();
    document.dispatchEvent(new CustomEvent('admin:logout'));
    closeModal();
  });

  // ── Chuyển đổi Tabs ────────────────────────────────────────────────
  tabBtnLink?.addEventListener('click', () => {
    tabBtnLink.classList.add('is-active');
    tabBtnWishes.classList.remove('is-active');
    paneLink.hidden = false;
    paneWishes.hidden = true;
  });

  tabBtnWishes?.addEventListener('click', () => {
    tabBtnWishes.classList.add('is-active');
    tabBtnLink.classList.remove('is-active');
    paneWishes.hidden = false;
    paneLink.hidden = true;
    renderAdminWishes();
  });

  // ── Gợi ý danh xưng nhanh (Quick Tags) ─────────────────────────────
  quickTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const prefix = tag.dataset.prefix || '';
      if (guestInput) {
        guestInput.value = prefix;
        guestInput.focus();
      }
    });
  });

  // ── Tạo Đường Link Mời Khách Mời (Link Generator) ──────────────────
  function generateLink() {
    const rawName = (guestInput?.value || '').trim();
    if (!rawName) {
      if (guestInput) {
        guestInput.focus();
        guestInput.placeholder = '⚠️ Vui lòng nhập tên khách mời trước!';
      }
      return;
    }

    // Lấy URL trang web hiện tại (Tự động nhận diện khi deploy lên Vercel, Netlify, tên miền riêng...)
    const origin = window.location.origin;
    let cleanPath = window.location.pathname;
    if (cleanPath.endsWith('index.html')) {
      cleanPath = cleanPath.slice(0, -10);
    }
    if (!cleanPath.endsWith('/')) {
      cleanPath += '/';
    }
    const fullBase = `${origin}${cleanPath}`;
    const generatedUrl = `${fullBase}?to=${encodeURIComponent(rawName)}`;

    // Hiển thị kết quả
    if (resultBox) resultBox.hidden = false;
    if (previewGuest) previewGuest.textContent = rawName;
    if (urlInput) urlInput.value = generatedUrl;
    if (btnTestUrl) btnTestUrl.href = generatedUrl;

    // Lưu vào lịch sử gần đây
    saveRecentLink(rawName, generatedUrl);
  }

  btnGenLink?.addEventListener('click', generateLink);
  guestInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      generateLink();
    }
  });

  // ── Sao chép URL vào Clipboard ──────────────────────────────────────
  btnCopyUrl?.addEventListener('click', () => {
    const url = urlInput?.value;
    if (!url) return;

    copyToClipboard(url, () => {
      const textSpan = document.getElementById('btn-copy-url-text');
      if (textSpan) {
        textSpan.textContent = 'Đã chép link ✓';
        btnCopyUrl.classList.add('is-copied');
        setTimeout(() => {
          textSpan.textContent = '📋 Sao Chép Link';
          btnCopyUrl.classList.remove('is-copied');
        }, 2200);
      }
    });
  });

  // ── Sao chép Tin Nhắn Mời Khách Kèm Link ───────────────────────────
  btnCopyMsg?.addEventListener('click', () => {
    const guestName = (previewGuest?.textContent || '').trim();
    const url = urlInput?.value;
    if (!url) return;

    const messageTemplate =
`Trân trọng kính mời ${guestName} đến chung vui trong ngày lễ thành hôn của chúng tôi:
👰 Nguyễn Thị Lan & 🤵 Trần Văn Minh

🗓 Thời gian: ${config.dateDisplay || '15/01/2027'}
📍 Địa điểm: ${config.ceremony?.venue || 'Trung tâm tiệc cưới'} (${config.ceremony?.address || ''})

💌 Mời ${guestName} xem thiệp cưới và gửi lời chúc phúc online tại:
${url}

Sự hiện diện của bạn là niềm vinh hạnh lớn nhất của gia đình chúng tôi! 🌸`;

    copyToClipboard(messageTemplate, () => {
      const origText = btnCopyMsg.textContent;
      btnCopyMsg.textContent = 'Đã chép tin nhắn mẫu ✓';
      btnCopyMsg.classList.add('is-copied');
      setTimeout(() => {
        btnCopyMsg.textContent = origText;
        btnCopyMsg.classList.remove('is-copied');
      }, 2200);
    });
  });

  // ── Quản lý Lịch Sử Khách Mời Đã Tạo Link (Local Storage) ───────────
  function loadRecentLinks() {
    if (!recentList || !recentWrap) return;
    try {
      const data = JSON.parse(localStorage.getItem('wedding_recent_guest_links') || '[]');
      if (!data || data.length === 0) {
        recentWrap.hidden = true;
        return;
      }

      recentWrap.hidden = false;
      recentList.innerHTML = '';

      data.slice(0, 15).forEach(item => {
        const li = document.createElement('li');
        li.className = 'recent-link-item';
        li.innerHTML = `
          <span class="recent-link-name">💌 ${item.name}</span>
          <div class="recent-link-actions">
            <button type="button" class="btn-mini-copy btn-mini-copy-link" title="Chép link">Chép link</button>
            <a class="btn-mini-copy" href="${item.url}" target="_blank" rel="noopener noreferrer">Mở</a>
          </div>
        `;

        li.querySelector('.btn-mini-copy-link')?.addEventListener('click', (e) => {
          copyToClipboard(item.url, () => {
            e.target.textContent = 'Đã chép ✓';
            setTimeout(() => { e.target.textContent = 'Chép link'; }, 1800);
          });
        });

        recentList.appendChild(li);
      });
    } catch {
      recentWrap.hidden = true;
    }
  }

  function saveRecentLink(name, url) {
    try {
      let list = JSON.parse(localStorage.getItem('wedding_recent_guest_links') || '[]');
      list = list.filter(item => item.name !== name);
      list.unshift({ name, url, time: Date.now() });
      localStorage.setItem('wedding_recent_guest_links', JSON.stringify(list.slice(0, 30)));
      loadRecentLinks();
    } catch (err) {
      console.warn('[Admin] Lỗi lưu lịch sử link:', err);
    }
  }

  // ── Tab 2: Quản Lý & Xóa Lời Chúc Trong Database ────────────────────
  async function renderAdminWishes() {
    if (!adminWishesList) return;
    adminWishesList.innerHTML = '<p style="text-align:center; padding: 20px; color: var(--color-text-muted);">Đang tải danh sách lời chúc từ Database...</p>';

    // Đọc danh sách thẻ từ DOM ngoài hoặc Supabase
    const wishCards = document.querySelectorAll('#wishes-list .wish-card');
    adminWishesList.innerHTML = '';

    if (wishCards.length === 0) {
      adminWishesList.innerHTML = '<p style="text-align:center; padding: 20px; color: var(--color-text-muted);">Hiện chưa có bình luận nào.</p>';
      return;
    }

    wishCards.forEach(card => {
      const id = card.dataset.id;
      const name = card.querySelector('.wish-card-name')?.textContent || 'Khách mời';
      const text = card.querySelector('.wish-card-message')?.textContent || '';
      const time = card.querySelector('span[style*="font-size"]')?.textContent || '';

      const row = document.createElement('div');
      row.className = 'admin-wish-card';
      row.innerHTML = `
        <div class="admin-wish-content">
          <div class="admin-wish-author">
            ${name} <span class="admin-wish-date">${time}</span>
          </div>
          <p class="admin-wish-text">${text}</p>
        </div>
        <button type="button" class="btn-delete-wish" data-id="${id}">
          <span>🗑️ Xóa</span>
        </button>
      `;

      row.querySelector('.btn-delete-wish')?.addEventListener('click', async () => {
        if (confirm(`Bạn có chắc muốn xóa vĩnh viễn lời chúc của "${name}" khỏi Database không?`)) {
          // Kích hoạt nút xóa trên thẻ gốc ở DOM chính
          const origDelBtn = card.querySelector('.btn-delete-wish');
          if (origDelBtn) {
            origDelBtn.click();
          } else {
            // Xóa trực tiếp qua Supabase
            try {
              const sb = await getSupabase();
              if (sb && id && !id.startsWith('demo-') && !id.startsWith('local-')) {
                await sb.from('wishes').delete().eq('id', id);
              }
              card.remove();
            } catch (err) {
              console.warn('[Admin] Lỗi xóa:', err);
            }
          }
          row.style.opacity = '0';
          setTimeout(() => row.remove(), 250);
        }
      });

      adminWishesList.appendChild(row);
    });
  }

  // ── Helper copy clipboard an toàn ──────────────────────────────────
  function copyToClipboard(text, onSuccess) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(() => {
        fallbackCopy(text, onSuccess);
      });
    } else {
      fallbackCopy(text, onSuccess);
    }
  }

  function fallbackCopy(text, onSuccess) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      if (onSuccess) onSuccess();
    } catch (e) {
      console.warn('Copy fallback failed:', e);
    }
    document.body.removeChild(ta);
  }

  // Khởi tạo
  updateAuthState();
}
