-- =========================================================================
-- LUNA JEWEL MIGRATION SCRIPT - BẢNG REVIEWS (ĐÁNH GIÁ SẢN PHẨM)
-- Copy và chạy mã bên dưới trong Supabase SQL Editor để kích hoạt UC19 online!
-- =========================================================================

CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,                            -- ID đánh giá duy nhất
    product_slug TEXT NOT NULL,                     -- Slug liên kết sản phẩm
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE, -- Khóa ngoại liên kết tài khoản gửi đánh giá
    user_name TEXT NOT NULL,                        -- Tên người dùng hiển thị
    user_avatar TEXT,                               -- Ảnh đại diện người dùng
    rating INTEGER NOT NULL,                        -- Số sao đánh giá (1-5)
    comment TEXT NOT NULL,                          -- Nội dung bình luận đánh giá
    date_string TEXT NOT NULL,                      -- Chuỗi hiển thị ngày tháng dạng vi-VN
    is_hidden BOOLEAN DEFAULT FALSE,                -- Trạng thái ẩn đánh giá (UC29)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
