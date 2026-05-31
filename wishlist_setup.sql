-- =========================================================================
-- LUNA JEWEL MIGRATION SCRIPT - BẢNG WISHLIST (SẢN PHẨM YÊU THÍCH)
-- Copy và chạy mã bên dưới trong Supabase SQL Editor để kích hoạt UC20 online!
-- =========================================================================

CREATE TABLE IF NOT EXISTS wishlist (
    id TEXT PRIMARY KEY,                            -- ID duy nhất của dòng yêu thích
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE, -- Liên kết tài khoản khách hàng
    product_slug TEXT REFERENCES products(slug) ON DELETE CASCADE, -- Liên kết sản phẩm yêu thích
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_slug)                   -- Đảm bảo một sản phẩm chỉ được yêu thích 1 lần bởi 1 user
);
