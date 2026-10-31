/**
 * gift-qr.js — Quản lý Popup/Modal Gửi Quà Mừng & Sao chép STK tiện lợi (Chuẩn v4)
 *
 * Tính năng:
 *  - Nút “Gửi quà mừng” mở popup/modal chứa 2 QR riêng: Nhà Gái & Nhà Trai.
 *  - Nút "Sao chép" 1-click cho từng số tài khoản với phản hồi trực quan.
 *  - Không gửi form lời chúc khi bấm nút này.
 *  - Đóng được bằng nút ✕, nhấp backdrop mờ hoặc phím Escape.
 *  - Không đóng popup khi bấm vào bên trong nội dung QR.
 *  - Khi đóng, trả focus về lại nút “Gửi quà mừng”.
 */

export function initGiftQr(giftsConfig) {
  const modal       = document.getElementById('gift-modal');
  const backdrop    = document.getElementById('gift-modal-backdrop');
  const btnOpen     = document.getElementById('btn-open-gift-modal');
  const btnClose    = document.getElementById('btn-close-gift-modal');

  // Thông tin Nhà Gái
  const brideQrImg  = document.getElementById('bride-qr-img');
  const brideName   = document.getElementById('bride-recipient-name');
  const brideBank   = document.getElementById('bride-bank-name');
  const brideAcc    = document.getElementById('bride-account-number');
  const btnCopyBride = document.getElementById('btn-copy-bride-acc');

  // Thông tin Nhà Trai
  const groomQrImg  = document.getElementById('groom-qr-img');
  const groomName   = document.getElementById('groom-recipient-name');
  const groomBank   = document.getElementById('groom-bank-name');
  const groomAcc    = document.getElementById('groom-account-number');
  const btnCopyGroom = document.getElementById('btn-copy-groom-acc');

  if (!modal || !btnOpen) return;

  // ── Điền thông tin cấu hình vào modal ──────────────────────────────
  if (giftsConfig?.brideFamily) {
    const bg = giftsConfig.brideFamily;
    if (brideQrImg && bg.qrImage)     brideQrImg.src = bg.qrImage;
    if (brideName  && bg.recipientName) brideName.textContent = `Chủ TK: ${bg.recipientName}`;
    if (brideBank  && bg.bankName)      brideBank.textContent = bg.bankName;
    if (brideAcc   && bg.accountNumber) brideAcc.textContent = `STK: ${bg.accountNumber}`;
  }

  if (giftsConfig?.groomFamily) {
    const gg = giftsConfig.groomFamily;
    if (groomQrImg && gg.qrImage)     groomQrImg.src = gg.qrImage;
    if (groomName  && gg.recipientName) groomName.textContent = `Chủ TK: ${gg.recipientName}`;
    if (groomBank  && gg.bankName)      groomBank.textContent = gg.bankName;
    if (groomAcc   && gg.accountNumber) groomAcc.textContent = `STK: ${gg.accountNumber}`;
  }

  // ── Tiện ích sao chép số tài khoản vào clipboard ────────────────────
  function copyText(text, buttonEl) {
    if (!text) return;
    const cleanNumber = text.replace(/\D/g, ''); // chỉ lấy chữ số

    const handleSuccess = () => {
      if (!buttonEl) return;
      const label = buttonEl.querySelector('.copy-label') || buttonEl;
      const originalText = label.textContent;
      label.textContent = 'Đã chép ✓';
      buttonEl.classList.add('is-copied');

      setTimeout(() => {
        label.textContent = originalText;
        buttonEl.classList.remove('is-copied');
      }, 2000);
    };

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(cleanNumber || text).then(handleSuccess).catch(() => {
        fallbackCopy(cleanNumber || text, handleSuccess);
      });
    } else {
      fallbackCopy(cleanNumber || text, handleSuccess);
    }
  }

  function fallbackCopy(str, onSuccess) {
    const textarea = document.createElement('textarea');
    textarea.value = str;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.warn('[GiftQR] Không thể copy:', err);
    }
    document.body.removeChild(textarea);
  }

  if (btnCopyBride) {
    btnCopyBride.addEventListener('click', () => {
      copyText(giftsConfig?.brideFamily?.accountNumber, btnCopyBride);
    });
  }

  if (btnCopyGroom) {
    btnCopyGroom.addEventListener('click', () => {
      copyText(giftsConfig?.groomFamily?.accountNumber, btnCopyGroom);
    });
  }

  // ── Mở modal ───────────────────────────────────────────────────────
  function openModal() {
    modal.hidden = false;
    requestAnimationFrame(() => {
      modal.classList.add('is-open');
    });
    document.body.style.overflow = 'hidden';
    btnClose?.focus();
    document.addEventListener('keydown', onKeyDown);
  }

  // ── Đóng modal ──────────────────────────────────────────────────────
  function closeModal() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKeyDown);

    modal.addEventListener('transitionend', () => {
      modal.hidden = true;
    }, { once: true });
    setTimeout(() => { modal.hidden = true; }, 350);

    // Trả focus về nút mở
    btnOpen.focus();
  }

  function onKeyDown(e) {
    if (e.key === 'Escape' && !modal.hidden) {
      e.preventDefault();
      closeModal();
    }
  }

  // ── Lắng nghe sự kiện ──────────────────────────────────────────────
  btnOpen.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });

  btnClose?.addEventListener('click', closeModal);
  backdrop?.addEventListener('click', closeModal);

  // Ngăn chặn đóng khi bấm vào nội dung dialog bên trong
  const dialog = modal.querySelector('.gift-modal__dialog');
  dialog?.addEventListener('click', (e) => {
    e.stopPropagation();
  });
}
