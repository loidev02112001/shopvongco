-- =========================================================================
-- LUNA JEWEL MIGRATION SCRIPT - BẢNG COLLECTIONS (BỘ SƯU TẬP DYNAMIC - UC25)
-- Copy và chạy mã bên dưới trong Supabase SQL Editor để kích hoạt UC25 online!
-- =========================================================================

CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY,                            -- ID/Slug duy nhất của bộ sưu tập (ví dụ: graceful-muse)
    name TEXT NOT NULL,                             -- Tên bộ sưu tập hiển thị
    title TEXT NOT NULL,                            -- Tiêu đề chi tiết/lãng mạn
    intro TEXT NOT NULL,                            -- Mô tả/giới thiệu bộ sưu tập
    banner TEXT NOT NULL,                           -- URL hoặc Base64 ảnh banner lớn
    thumbnail TEXT NOT NULL,                        -- URL hoặc Base64 ảnh thumbnail nhỏ
    is_visible BOOLEAN DEFAULT TRUE,                -- Trạng thái hiển thị ngoài trang người dùng (A2)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
