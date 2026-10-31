/**
 * supabase.js — Khởi tạo Supabase client dùng chung toàn app
 *
 * Không dùng top-level await vì có thể gây lỗi trên một số môi trường serve.
 * Thay vào đó export hàm async getSupabase() để gọi khi cần.
 *
 * QUAN TRỌNG:
 *  - Chỉ dùng ANON KEY (public key) — an toàn để đưa vào frontend
 *  - TUYỆT ĐỐI không dùng SERVICE ROLE KEY trong frontend
 *  - Bảo mật thật sự đến từ Row Level Security (rls-policies.sql)
 */

import config from '../config/wedding.js';

const { url, anonKey } = config.supabase;

// Kiểm tra cấu hình cơ bản
const isConfigured =
  Boolean(url) && !url.includes('your-project') &&
  Boolean(anonKey) && !anonKey.includes('your-anon');

if (!isConfigured) {
  console.warn(
    '[Supabase] ⚠️ Chưa cấu hình!\n' +
    'Mở client/src/config/wedding.js → điền supabase.url và supabase.anonKey\n' +
    'Lấy thông tin tại: Supabase Dashboard → Settings → API'
  );
}

// Cache client sau lần đầu tạo thành công
let _client = null;
let _initialized = false;

/**
 * Lấy Supabase client (lazy init, không dùng top-level await)
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient|null>}
 */
export async function getSupabase() {
  if (_initialized) return _client;
  _initialized = true;

  if (!isConfigured) return null;

  try {
    const { createClient } = await import(
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'
    );
    _client = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    });
    console.log('[Supabase] ✅ Kết nối thành công');
  } catch (err) {
    console.warn('[Supabase] ⚠️ Không tải được CDN, chạy chế độ offline:', err.message);
    _client = null;
  }

  return _client;
}

// Export thêm để wishes.js kiểm tra cấu hình mà không cần init
export { isConfigured };
