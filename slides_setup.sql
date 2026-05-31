-- =========================================================================
-- LUNA JEWEL MIGRATION SCRIPT - BẢNG SLIDES (QUẢN LÝ BANNER SLIDESHOW - UC26)
-- Copy và chạy mã bên dưới trong Supabase SQL Editor để kích hoạt UC26 online!
-- =========================================================================

CREATE TABLE IF NOT EXISTS slides (
    id TEXT PRIMARY KEY,                            -- ID duy nhất của slide banner (ví dụ: slide-1)
    title TEXT,                                     -- Tiêu đề lớn lộng lẫy
    subtitle TEXT,                                  -- Phụ đề bay bổng thời trang
    image TEXT NOT NULL,                            -- URL hoặc Base64 ảnh bìa chất lượng cao
    link TEXT,                                      -- Liên kết trỏ tới khi click banner (ví dụ: /bo-suu-tap?collection=graceful-muse)
    sort_order INT DEFAULT 0,                       -- Số thứ tự sắp xếp hiển thị
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
