-- ════════════════════════════════════════════════════════════════
-- schema.sql — Chạy file này trong Supabase SQL Editor
-- Vào: https://supabase.com → Project → SQL Editor → New query
-- ════════════════════════════════════════════════════════════════

-- ── Bảng lời chúc ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishes (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT        NOT NULL,
  message     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),

  -- Ràng buộc độ dài ngay ở DB (lớp bảo vệ thứ 2 sau frontend)
  CONSTRAINT wishes_name_length    CHECK (char_length(name)    BETWEEN 1 AND 80),
  CONSTRAINT wishes_message_length CHECK (char_length(message) BETWEEN 1 AND 500)
);

-- ── Bảng RSVP (xác nhận tham dự) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS rsvp (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT        NOT NULL,
  attending     BOOLEAN     NOT NULL DEFAULT true,
  guests_count  SMALLINT    NOT NULL DEFAULT 1,
  message       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT rsvp_name_length    CHECK (char_length(name)     BETWEEN 1 AND 80),
  CONSTRAINT rsvp_guests_count   CHECK (guests_count          BETWEEN 1 AND 10),
  CONSTRAINT rsvp_message_length CHECK (char_length(message)  <= 300)
);

-- ── Index để query nhanh theo thời gian ───────────────────────────
CREATE INDEX IF NOT EXISTS wishes_created_at_idx ON wishes (created_at DESC);
CREATE INDEX IF NOT EXISTS rsvp_created_at_idx   ON rsvp   (created_at DESC);
