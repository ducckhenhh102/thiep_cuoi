-- ════════════════════════════════════════════════════════════════
-- rls-policies.sql — Row Level Security cho Supabase
-- Chạy SAU schema.sql trong SQL Editor
--
-- Nguyên tắc:
--   wishes : khách đọc được + gửi được (công khai)
--   rsvp   : khách chỉ gửi được, không đọc được (bảo mật)
-- ════════════════════════════════════════════════════════════════

-- ── Bật RLS cho cả hai bảng ───────────────────────────────────────
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvp   ENABLE ROW LEVEL SECURITY;

-- ════════════════════════════════════════════════════════════════
-- WISHES — Lời chúc
-- ════════════════════════════════════════════════════════════════

-- Ai cũng có thể ĐỌC lời chúc
CREATE POLICY "wishes_public_select"
  ON wishes FOR SELECT
  USING (true);

-- Ai cũng có thể GỬI lời chúc (anon key)
CREATE POLICY "wishes_public_insert"
  ON wishes FOR INSERT
  WITH CHECK (
    -- Kiểm tra lại một lần nữa ở policy (defense in depth)
    char_length(name)    BETWEEN 1 AND 80  AND
    char_length(message) BETWEEN 1 AND 500
  );

-- KHÔNG ai có thể SỬA hoặc XÓA (chỉ admin qua dashboard)
-- (Không tạo UPDATE / DELETE policy → mặc định bị chặn)

-- ════════════════════════════════════════════════════════════════
-- RSVP — Xác nhận tham dự
-- ════════════════════════════════════════════════════════════════

-- Chỉ GỬI được, không ĐỌC được từ frontend (bảo vệ thông tin khách)
CREATE POLICY "rsvp_public_insert"
  ON rsvp FOR INSERT
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 80 AND
    guests_count      BETWEEN 1 AND 10
  );

-- Admin xem qua Supabase Dashboard (authenticated role)
CREATE POLICY "rsvp_admin_select"
  ON rsvp FOR SELECT
  USING (auth.role() = 'authenticated');

-- ════════════════════════════════════════════════════════════════
-- GHI CHÚ BẢO MẬT
-- ════════════════════════════════════════════════════════════════
-- Anon key trong frontend chỉ có thể:
--   ✅ SELECT wishes
--   ✅ INSERT wishes (với check ràng buộc)
--   ✅ INSERT rsvp   (với check ràng buộc)
--   ❌ UPDATE / DELETE bất kỳ bảng nào
--   ❌ SELECT rsvp
--   ❌ Truy cập auth.users hay bảng khác
--
-- Service role key (KHÔNG BAO GIỜ đưa vào frontend):
--   → Chỉ dùng trong Supabase Dashboard hoặc server-side
