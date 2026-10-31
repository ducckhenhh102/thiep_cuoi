/**
 * music-player.js — Trình phát nhạc nền & Hộp thoại xác nhận phát nhạc (Chuẩn v3)
 *
 * Tính năng:
 *  - Tự động nạp file nhạc cưới từ wedding.js / wedding-song.mp3
 *  - Khi phong bì mở ra: hiển thị Hộp thoại Giai Điệu Tình Yêu hỏi khách có muốn bật nhạc không
 *  - Nhấp "Bật Nhạc Ngay": phát nhạc ngay lập tức (100% bypass chặn autoplay của trình duyệt)
 *  - Nhấp "Để Sau": đóng hộp thoại, khách có thể bật lại bất kỳ lúc nào bằng nút góc phải màn hình
 *  - Nút góc phải (#btn-music): hiệu ứng xoay đĩa than nhẹ nhàng khi đang phát nhạc, bấm để Tạm dừng / Phát tiếp
 *  - Phím tắt 'M' bật/tắt nhanh
 */

export function initMusicPlayer(musicSource) {
  const audio       = document.getElementById('bg-audio');
  const btn         = document.getElementById('btn-music');
  const promptModal = document.getElementById('music-prompt-modal');
  const btnAccept   = document.getElementById('btn-music-accept');
  const btnDecline  = document.getElementById('btn-music-decline');
  const backdrop    = document.getElementById('music-prompt-backdrop');

  if (!audio || !btn) {
    console.warn('[MusicPlayer] Không tìm thấy phần tử audio hoặc button!');
    return;
  }

  const src = typeof musicSource === 'string'
    ? musicSource
    : (musicSource?.src || musicSource?.musicUrl || 'src/assets/audio/wedding-song.mp3');

  // Cấu hình audio
  audio.src = src;
  audio.loop = true;
  audio.volume = 0.6;
  audio.preload = 'auto';

  let isPlaying = false;
  let isPromptShown = false;

  // ── Cập nhật giao diện nút nhạc ──────────────────────────────────────
  function updateUI(playing) {
    isPlaying = playing;
    btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    btn.setAttribute('aria-label', playing ? 'Tạm dừng nhạc nền' : 'Bật nhạc nền');

    if (playing) {
      btn.classList.add('is-playing');
    } else {
      btn.classList.remove('is-playing');
    }
  }

  // ── Phát nhạc ────────────────────────────────────────────────────────
  async function playMusic() {
    try {
      await audio.play();
      updateUI(true);
      console.log('[MusicPlayer] ♫ Nhạc nền đang phát');
    } catch (err) {
      console.warn('[MusicPlayer] Trình duyệt chưa cho phép phát âm thanh:', err.message);
      updateUI(false);
    }
  }

  // ── Tạm dừng nhạc ────────────────────────────────────────────────────
  function pauseMusic() {
    try {
      audio.pause();
      updateUI(false);
      console.log('[MusicPlayer] ⏸ Đã tạm dừng nhạc nền');
    } catch (err) {
      console.warn('[MusicPlayer] Lỗi khi pause:', err);
    }
  }

  // ── Đổi trạng thái (Toggle) ──────────────────────────────────────────
  function toggleMusic() {
    if (audio.paused) {
      playMusic();
    } else {
      pauseMusic();
    }
  }

  // Gắn sự kiện click cho nút cố định góc màn hình
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMusic();
  });

  // Đồng bộ trạng thái từ sự kiện native của thẻ audio
  audio.addEventListener('play',  () => updateUI(true));
  audio.addEventListener('pause', () => updateUI(false));
  audio.addEventListener('ended', () => updateUI(false));
  audio.addEventListener('error', (e) => {
    console.warn('[MusicPlayer] Lỗi nạp audio file:', src, e);
  });

  // Phím tắt M
  document.addEventListener('keydown', (e) => {
    const tag = document.activeElement?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'm' || e.key === 'M') {
      toggleMusic();
    }
  });

  // ── Hộp thoại hỏi phát nhạc khi mở phong bì ─────────────────────────
  function showMusicPrompt() {
    if (!promptModal || isPromptShown) return;
    isPromptShown = true;

    // Chờ màn hình phong bì mờ hẳn rồi hiện modal hỏi bật nhạc
    setTimeout(() => {
      promptModal.hidden = false;
      // Kích hoạt transition mượt
      requestAnimationFrame(() => {
        promptModal.classList.add('is-visible');
      });
    }, 400);
  }

  function closeMusicPrompt() {
    if (!promptModal) return;
    promptModal.classList.remove('is-visible');
    setTimeout(() => {
      promptModal.hidden = true;
    }, 300);
  }

  if (btnAccept) {
    btnAccept.addEventListener('click', () => {
      closeMusicPrompt();
      playMusic();
    });
  }

  if (btnDecline) {
    btnDecline.addEventListener('click', () => {
      closeMusicPrompt();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeMusicPrompt();
    });
  }

  // Nhấn ESC để đóng hộp thoại
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && promptModal && !promptModal.hidden) {
      closeMusicPrompt();
    }
  });

  // Khi phong bì mở ra -> kích hoạt hỏi bật nhạc!
  document.addEventListener('envelope:opened', () => {
    showMusicPrompt();
  }, { once: true });
}
