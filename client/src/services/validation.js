/**
 * validation.js — Validate input phía client
 *
 * Quy tắc phải khớp với ràng buộc DB trong schema.sql
 * để lỗi được phát hiện sớm trước khi gửi lên Supabase.
 */

// ── Cấu hình giới hạn (đồng bộ với schema.sql) ─────────────────
export const LIMITS = {
  name:          { min: 1,  max: 80  },
  wishMessage:   { min: 1,  max: 500 },
  rsvpMessage:   { min: 0,  max: 300 },
  guestsCount:   { min: 1,  max: 10  },
};

// ── Hàm validate chung ───────────────────────────────────────────

/**
 * Validate một trường text.
 * @returns {string|null} Thông báo lỗi hoặc null nếu hợp lệ
 */
export function validateText(value, { min = 1, max = 500, fieldName = 'Trường này' } = {}) {
  const trimmed = (value ?? '').trim();

  if (trimmed.length < min) {
    return min === 1
      ? `${fieldName} không được để trống.`
      : `${fieldName} phải có ít nhất ${min} ký tự.`;
  }

  if (trimmed.length > max) {
    return `${fieldName} tối đa ${max} ký tự (hiện tại: ${trimmed.length}).`;
  }

  return null; // hợp lệ
}

/**
 * Validate form lời chúc.
 * @returns {{ name: string|null, message: string|null }} Object chứa lỗi
 */
export function validateWishForm({ name, message }) {
  return {
    name:    validateText(name,    { ...LIMITS.name,        fieldName: 'Tên' }),
    message: validateText(message, { ...LIMITS.wishMessage,  fieldName: 'Lời chúc' }),
  };
}

/**
 * Validate form RSVP.
 * @returns {{ name: string|null, guestsCount: string|null }} Object chứa lỗi
 */
export function validateRsvpForm({ name, guestsCount }) {
  const errors = {
    name:        validateText(name, { ...LIMITS.name, fieldName: 'Tên' }),
    guestsCount: null,
  };

  const count = Number(guestsCount);
  if (!Number.isInteger(count) || count < LIMITS.guestsCount.min || count > LIMITS.guestsCount.max) {
    errors.guestsCount = `Số người tham dự từ ${LIMITS.guestsCount.min} đến ${LIMITS.guestsCount.max}.`;
  }

  return errors;
}

/**
 * Kiểm tra có lỗi nào không.
 * @param {object} errors — kết quả từ validateWishForm / validateRsvpForm
 * @returns {boolean}
 */
export function hasErrors(errors) {
  return Object.values(errors).some(v => v !== null);
}
