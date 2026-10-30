/**
 * wishes.js — Quản lý Form, Danh sách Lời chúc & Chế độ Quản trị viên (Admin Mode)
 *
 * Tính năng:
 *  - Tải danh sách lời chúc từ Supabase (hoặc chế độ Demo/Offline)
 *  - Lắng nghe sự kiện thêm mới & xóa Realtime (Realtime INSERT / DELETE)
 *  - Chống spam: Honeypot field + giới hạn tần suất gửi (Rate-limit client)
 *  - An toàn XSS: Luôn dùng textContent, không render innerHTML trực tiếp
 *  - NÚT QUẢN TRỊ VIÊN:
 *      + Nút nhỏ tinh tế ở Footer cho phép mở hộp thoại nhập PIN
 *      + Nhập đúng PIN (mặc định: '123456', đổi trong wedding.js): Bật Admin Mode
 *      + Xuất hiện nút "🗑️ Xóa" trên từng lời chúc kèm xác nhận an toàn
 *      + Xóa trực tiếp khỏi Supabase + hiệu ứng mờ dần trong DOM
 *      + Có thể bấm lại để thoát chế độ Quản trị viên bất cứ lúc nào
 */

import { getSupabase } from '../services/supabase.js';
import { validateWishForm, hasErrors } from '../services/validation.js';
import config from '../config/wedding.js';

export function initWishes() {
  const form        = document.getElementById('wish-form');
  const nameInput   = document.getElementById('wish-name');
  const msgInput    = document.getElementById('wish-message');
  const nameError   = document.getElementById('wish-name-error');
  const msgError    = document.getElementById('wish-message-error');
  const counter     = document.getElementById('wish-counter');
  const submitBtn   = document.getElementById('btn-submit-wish');
  const feedback    = document.getElementById('wish-form-feedback');
  const listEl      = document.getElementById('wishes-list');
  const loadingEl   = document.getElementById('wishes-loading');
  const emptyEl     = document.getElementById('wishes-empty');

  // Các phần tử quản trị viên (Admin)
  const adminToggleBtn    = document.getElementById('btn-admin-toggle');
  const adminBtnText      = document.getElementById('admin-btn-text');
  const adminModal        = document.getElementById('admin-modal');
  const adminPinForm      = document.getElementById('admin-pin-form');
  const adminPinInput     = document.getElementById('admin-pin-input');
  const adminPinError     = document.getElementById('admin-pin-error');
  const adminModalCancel  = document.getElementById('btn-admin-modal-cancel');
  const adminBackdrop     = document.getElementById('admin-modal-backdrop');

  if (!form || !listEl) return;

  // Kiểm tra xem Supabase đã được cấu hình chưa
  const isConfigured = Boolean(
    config.supabase?.url &&
    !config.supabase.url.includes('your-project') &&
    config.supabase?.anonKey &&
    !config.supabase.anonKey.includes('your-anon')
  );

  let localWishes = [];
  let isSubmitting = false;
  let lastSubmitTime = 0;
  let isAdmin = sessionStorage.getItem('admin_authenticated') === 'true';

  // ── Đếm ký tự textarea ─────────────────────────────────────────────
  if (msgInput && counter) {
    msgInput.addEventListener('input', () => {
      const len = msgInput.value.length;
      counter.textContent = `${len} / 500`;
      if (len > 500) {
        counter.style.color = 'var(--color-rose)';
      } else {
        counter.style.color = '';
      }
    });
  }

  // ── Format thời gian thân thiện ─────────────────────────────────────
  function formatDate(isoStr) {
    if (!isoStr) return '';
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  }

  // ── Gắn nút xóa quản trị viên vào thẻ lời chúc ───────────────────────
  function attachAdminAction(card, item) {
    if (!card) return;
    // Tránh gắn trùng lặp
    if (card.querySelector('.wish-card__admin-actions')) return;

    const wrap = document.createElement('div');
    wrap.className = 'wish-card__admin-actions';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-delete-wish';
    btn.setAttribute('aria-label', `Xóa lời chúc của ${item.name || 'khách'}`);
    btn.innerHTML = '<span>🗑️</span><span>Xóa</span>';

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const guestName = item.name || 'khách mời này';
      if (confirm(`Bạn có chắc chắn muốn xóa lời chúc của "${guestName}" không?`)) {
        deleteWish(item.id, card);
      }
    });

    wrap.appendChild(btn);
    card.appendChild(wrap);
  }

  // ── Thao tác xóa lời chúc (Admin: Xóa vĩnh viễn trong Database) ─────
  async function deleteWish(wishId, card) {
    const btn = card?.querySelector('.btn-delete-wish');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>⏳</span><span>Đang xóa trong DB...</span>';
    }

    // 1. Thực hiện xóa trực tiếp trong Supabase Database
    if (isConfigured && wishId && !String(wishId).startsWith('demo-') && !String(wishId).startsWith('local-')) {
      let success = false;
      let lastError = null;

      // Cách 1: Qua Supabase SDK
      try {
        const sb = await getSupabase();
        if (sb) {
          const { error } = await sb.from('wishes').delete().eq('id', wishId);
          if (error) {
            lastError = error;
          } else {
            success = true;
          }
        }
      } catch (err) {
        lastError = err;
      }

      // Cách 2: Nếu SDK gặp lỗi hoặc delay, fallback gọi thẳng Supabase REST API
      if (!success) {
        try {
          const restUrl = `${config.supabase.url}/rest/v1/wishes?id=eq.${wishId}`;
          const res = await fetch(restUrl, {
            method: 'DELETE',
            headers: {
              'apikey': config.supabase.anonKey,
              'Authorization': `Bearer ${config.supabase.anonKey}`,
              'Prefer': 'return=representation'
            }
          });
          if (res.ok) {
            success = true;
          } else {
            const errBody = await res.text();
            throw new Error(`HTTP ${res.status}: ${errBody}`);
          }
        } catch (fetchErr) {
          lastError = fetchErr;
        }
      }

      // Nếu cả 2 cách đều thất bại, báo lỗi rõ ràng và giữ nguyên card
      if (!success) {
        console.error('[Wishes] Không thể xóa trong Database Supabase:', lastError);
        showFeedback(`❌ Lỗi xóa Database: ${lastError?.message || 'Không thể xóa'}. Vui lòng thử lại!`, 'error');
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '<span>🗑️</span><span>Xóa</span>';
        }
        return;
      }
    }

    // 2. Khi xóa trong Database thành công -> Thực hiện animation gỡ khỏi giao diện
    if (card) {
      card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
    }

    localWishes = localWishes.filter(w => w.id !== wishId);

    setTimeout(() => {
      if (card) card.remove();
      if (listEl.children.length === 0 && emptyEl) {
        emptyEl.hidden = false;
      }
    }, 260);

    showFeedback('✅ Đã xóa vĩnh viễn lời chúc khỏi Database và giao diện! 🗑️', 'success');
  }

  // ── Cập nhật giao diện Quản trị viên ────────────────────────────────
  function updateAdminModeUI() {
    if (!adminToggleBtn || !adminBtnText) return;

    if (isAdmin) {
      adminToggleBtn.classList.add('is-active');
      adminBtnText.textContent = 'Thoát Quản trị';
      adminToggleBtn.setAttribute('title', 'Đang bật Quản trị viên (Nhấp để thoát)');

      // Gắn nút xóa cho tất cả thẻ lời chúc hiện có
      listEl.querySelectorAll('.wish-card').forEach(card => {
        const id = card.dataset.id;
        const name = card.querySelector('.wish-card-name')?.textContent || '';
        attachAdminAction(card, { id, name });
      });
    } else {
      adminToggleBtn.classList.remove('is-active');
      adminBtnText.textContent = 'Quản trị';
      adminToggleBtn.setAttribute('title', 'Nhấp để đăng nhập Quản trị viên');

      // Gỡ tất cả nút xóa
      listEl.querySelectorAll('.wish-card__admin-actions').forEach(el => el.remove());
    }
  }

  // ── Tạo thẻ lời chúc an toàn (No innerHTML for user inputs) ─────────
  function createWishCard(item) {
    const card = document.createElement('div');
    card.className = 'wish-card';
    card.setAttribute('role', 'listitem');
    if (item.id) card.dataset.id = item.id;

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'baseline';
    header.style.marginBottom = 'var(--space-2)';

    const nameEl = document.createElement('h3');
    nameEl.className = 'wish-card-name';
    nameEl.textContent = item.name || 'Khách mời ẩn danh';
    header.appendChild(nameEl);

    if (item.created_at) {
      const timeEl = document.createElement('span');
      timeEl.style.fontSize = 'var(--text-xs)';
      timeEl.style.color = 'var(--color-text-muted)';
      timeEl.textContent = formatDate(item.created_at);
      header.appendChild(timeEl);
    }

    const messageEl = document.createElement('p');
    messageEl.className = 'wish-card-message';
    messageEl.textContent = item.message;

    card.appendChild(header);
    card.appendChild(messageEl);

    // Nếu đang bật Admin Mode, gắn sẵn nút xóa
    if (isAdmin) {
      attachAdminAction(card, item);
    }

    return card;
  }

  // ── Render danh sách lời chúc ──────────────────────────────────────
  function renderWishes(wishes) {
    listEl.innerHTML = '';
    if (loadingEl) loadingEl.hidden = true;

    if (!wishes || wishes.length === 0) {
      if (emptyEl) emptyEl.hidden = false;
      return;
    }

    if (emptyEl) emptyEl.hidden = true;
    wishes.forEach(item => {
      const card = createWishCard(item);
      listEl.appendChild(card);
    });
  }

  // ── Thêm một lời chúc vào đầu danh sách (Realtime) ──────────────────
  function prependWish(item) {
    if (emptyEl) emptyEl.hidden = true;
    // Kiểm tra xem đã có chưa (tránh trùng do vừa gửi xong lại nhận realtime)
    if (item.id && listEl.querySelector(`[data-id="${item.id}"]`)) return;

    const card = createWishCard(item);
    listEl.prepend(card);
  }

  // ── Hiển thị thông báo phản hồi (Feedback) ───────────────────────────
  function showFeedback(text, type = 'success') {
    if (!feedback) return;
    feedback.hidden = false;
    feedback.textContent = text;
    feedback.className = `form-feedback form-feedback--${type}`;
  }

  function clearErrors() {
    if (nameError) nameError.textContent = '';
    if (msgError) msgError.textContent = '';
    if (feedback) feedback.hidden = true;
  }

  // ── Tải danh sách ban đầu ──────────────────────────────────────────
  async function loadWishes() {
    if (loadingEl) loadingEl.hidden = false;
    if (emptyEl) emptyEl.hidden = true;

    if (!isConfigured) {
      if (loadingEl) loadingEl.hidden = true;
      // Chế độ demo / offline
      localWishes = [
        {
          id: 'demo-1',
          name: 'Bạn thân từ nhỏ',
          message: 'Chúc hai bạn mãi mãi hạnh phúc, cùng nhau đi hết chặng đường đời thật ngọt ngào nhé! ❤️',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 'demo-2',
          name: 'Đồng nghiệp công ty',
          message: 'Trăm năm tình viên mãn, bạc đầu nghĩa phu thê. Chúc mừng đám cưới Minh & Lan!',
          created_at: new Date(Date.now() - 3600000 * 12).toISOString()
        }
      ];
      renderWishes(localWishes);
      return;
    }

    // Lấy Supabase client (lazy init)
    const sb = await getSupabase();
    if (!sb) {
      if (loadingEl) loadingEl.hidden = true;
      renderWishes([]);
      return;
    }

    try {
      const { data, error } = await sb
        .from('wishes')
        .select('id, name, message, created_at')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      renderWishes(data || []);
      listenRealtime(sb);
    } catch (err) {
      console.warn('[Wishes] Chưa tải được từ Supabase, hiển thị danh sách chào mừng:', err.message);
      if (loadingEl) loadingEl.hidden = true;
      localWishes = [
        {
          id: 'demo-1',
          name: 'Bạn thân từ nhỏ',
          message: 'Chúc hai bạn mãi mãi hạnh phúc, cùng nhau đi hết chặng đường đời thật ngọt ngào nhé! ❤️',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString()
        },
        {
          id: 'demo-2',
          name: 'Đồng nghiệp công ty',
          message: 'Trăm năm tình viên mãn, bạc đầu nghĩa phu thê. Chúc mừng đám cưới Minh & Lan! 🥂',
          created_at: new Date(Date.now() - 3600000 * 12).toISOString()
        }
      ];
      renderWishes(localWishes);
    }
  }

  // ── Lắng nghe Realtime INSERT & DELETE từ Supabase ───────────────────
  function listenRealtime(sb) {
    try {
      sb
        .channel('public:wishes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'wishes' },
          (payload) => {
            if (payload?.new) {
              prependWish(payload.new);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'wishes' },
          (payload) => {
            if (payload?.old?.id) {
              const card = listEl.querySelector(`[data-id="${payload.old.id}"]`);
              if (card) {
                card.style.transition = 'opacity 0.25s ease';
                card.style.opacity = '0';
                setTimeout(() => {
                  card.remove();
                  if (listEl.children.length === 0 && emptyEl) emptyEl.hidden = false;
                }, 260);
              }
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[Wishes] Không thể bật kênh realtime:', err);
    }
  }

  function resetButton() {
    isSubmitting = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      const textSpan = submitBtn.querySelector('.btn-text');
      const loadSpan = submitBtn.querySelector('.btn-loading');
      if (textSpan) textSpan.hidden = false;
      if (loadSpan) loadSpan.hidden = true;
    }
  }

  // ── Xử lý gửi Form ──────────────────────────────────────────────────
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    clearErrors();

    // 1. Kiểm tra Honeypot (bot spam)
    const honeypot = form.elements['website']?.value;
    if (honeypot) {
      showFeedback('Cảm ơn bạn đã gửi lời chúc! 🌸', 'success');
      form.reset();
      return;
    }

    // 2. Client-side Rate Limit (chống spam liên tục)
    const now = Date.now();
    if (now - lastSubmitTime < 8000) {
      showFeedback('Bạn vừa gửi lời chúc xong, vui lòng đợi vài giây nhé!', 'error');
      return;
    }

    const nameVal = nameInput ? nameInput.value.trim() : '';
    const msgVal  = msgInput ? msgInput.value.trim() : '';

    // 3. Validation
    const errors = validateWishForm({ name: nameVal, message: msgVal });
    if (hasErrors(errors)) {
      if (errors.name && nameError) nameError.textContent = errors.name;
      if (errors.message && msgError) msgError.textContent = errors.message;
      return;
    }

    // 4. Bắt đầu submit
    isSubmitting = true;
    lastSubmitTime = now;
    if (submitBtn) {
      submitBtn.disabled = true;
      const textSpan = submitBtn.querySelector('.btn-text');
      const loadSpan = submitBtn.querySelector('.btn-loading');
      if (textSpan) textSpan.hidden = true;
      if (loadSpan) loadSpan.hidden = false;
    }

    // Nếu chưa cấu hình Supabase → Lưu demo
    if (!isConfigured) {
      setTimeout(() => {
        const mockItem = {
          id: 'demo-' + Date.now(),
          name: nameVal,
          message: msgVal,
          created_at: new Date().toISOString()
        };
        prependWish(mockItem);
        showFeedback('Đã gửi thành công (lưu tạm demo cục bộ trên máy bạn)! 🌸', 'success');
        form.reset();
        if (counter) counter.textContent = '0 / 500';
        resetButton();
      }, 500);
      return;
    }

    // 5. Lấy Supabase client rồi gửi
    const sb = await getSupabase();
    if (!sb) {
      showFeedback('Không thể kết nối cơ sở dữ liệu. Vui lòng thử lại sau!', 'error');
      resetButton();
      return;
    }

    try {
      const { data, error } = await sb
        .from('wishes')
        .insert([{ name: nameVal, message: msgVal }])
        .select()
        .single();

      if (error) throw error;

      showFeedback('Cảm ơn lời chúc thân thương của bạn! 💌', 'success');
      form.reset();
      if (counter) counter.textContent = '0 / 500';

      if (data) prependWish(data);
    } catch (err) {
      console.warn('[Wishes] Không thể lưu vào Supabase, chuyển sang lưu giao diện:', err);
      const fallbackItem = {
        id: 'local-' + Date.now(),
        name: nameVal,
        message: msgVal,
        created_at: new Date().toISOString()
      };
      prependWish(fallbackItem);
      showFeedback('Cảm ơn lời chúc thân thương của bạn! 💌', 'success');
      form.reset();
      if (counter) counter.textContent = '0 / 500';
    } finally {
      resetButton();
    }
  });

  // ── Lắng nghe sự kiện Quản trị viên từ admin.js ────────────────────
  document.addEventListener('admin:login', () => {
    isAdmin = true;
    updateAdminModeUI();
  });

  document.addEventListener('admin:logout', () => {
    isAdmin = false;
    updateAdminModeUI();
  });

  // Khởi chạy
  loadWishes();
  updateAdminModeUI();
}
