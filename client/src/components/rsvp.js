/**
 * rsvp.js — Form xác nhận tham dự lễ cưới (RSVP)
 *
 * Tính năng:
 *  - Thu thập thông tin: Tên, tham dự (Có/Không), số lượng người, lời nhắn
 *  - Gửi thẳng vào bảng `rsvp` trên Supabase (được bảo vệ bởi RLS)
 *  - Khách chỉ INSERT được, không xem được danh sách của người khác (bảo mật riêng tư)
 *  - Chống bot bằng Honeypot
 */

import { supabase } from '../services/supabase.js';
import { validateRsvpForm, hasErrors } from '../services/validation.js';
import config from '../config/wedding.js';

export function initRsvp() {
  const form        = document.getElementById('rsvp-form');
  const nameInput   = document.getElementById('rsvp-name');
  const countSelect = document.getElementById('rsvp-guests');
  const attendRadios = document.getElementsByName('rsvp-attending');
  const msgInput    = document.getElementById('rsvp-message');
  const nameError   = document.getElementById('rsvp-name-error');
  const submitBtn   = document.getElementById('btn-submit-rsvp');
  const feedback    = document.getElementById('rsvp-form-feedback');

  if (!form) return;

  const isConfigured = Boolean(
    config.supabase?.url &&
    !config.supabase.url.includes('your-project-id') &&
    config.supabase?.anonKey &&
    !config.supabase.anonKey.includes('your-anon-key-here')
  );

  let isSubmitting = false;

  function showFeedback(text, type = 'success') {
    if (!feedback) return;
    feedback.hidden = false;
    feedback.textContent = text;
    feedback.className = `form-feedback form-feedback--${type}`;
  }

  function clearErrors() {
    if (nameError) nameError.textContent = '';
    if (feedback) feedback.hidden = true;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    clearErrors();

    // 1. Honeypot check
    const honeypot = form.elements['website_rsvp']?.value;
    if (honeypot) {
      showFeedback('Cảm ơn bạn đã phản hồi xác nhận tham dự! ✨', 'success');
      form.reset();
      return;
    }

    const nameVal = nameInput ? nameInput.value.trim() : '';
    const countVal = countSelect ? parseInt(countSelect.value, 10) : 1;
    let attendingVal = true;
    for (const radio of attendRadios) {
      if (radio.checked) {
        attendingVal = radio.value === 'yes';
        break;
      }
    }
    const msgVal = msgInput ? msgInput.value.trim() : '';

    // 2. Validation
    const errors = validateRsvpForm({ name: nameVal, guestsCount: countVal });
    if (hasErrors(errors)) {
      if (errors.name && nameError) nameError.textContent = errors.name;
      return;
    }

    // 3. Submit
    isSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      const textSpan = submitBtn.querySelector('.btn-text');
      const loadSpan = submitBtn.querySelector('.btn-loading');
      if (textSpan) textSpan.hidden = true;
      if (loadSpan) loadSpan.hidden = false;
    }

    if (!isConfigured) {
      setTimeout(() => {
        showFeedback('Phản hồi thành công (chế độ demo cục bộ)! Cảm ơn bạn rất nhiều! ✨', 'success');
        form.reset();
        resetButton();
      }, 500);
      return;
    }

    try {
      const { error } = await supabase
        .from('rsvp')
        .insert([{
          name: nameVal,
          attending: attendingVal,
          guests_count: attendingVal ? countVal : 0,
          message: msgVal || null
        }]);

      if (error) throw error;

      showFeedback(
        attendingVal
          ? 'Cảm ơn bạn đã xác nhận tham dự! Rất mong được đón tiếp bạn trong ngày vui! 🎊'
          : 'Cảm ơn bạn đã phản hồi! Dù bạn không đến được, tình cảm của bạn vẫn luôn là món quà trân quý! 💛',
        'success'
      );
      form.reset();
    } catch (err) {
      console.error('[RSVP] Gửi phản hồi lỗi:', err);
      showFeedback('Không thể gửi phản hồi lúc này. Vui lòng thử lại sau!', 'error');
    } finally {
      resetButton();
    }
  });

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
}
