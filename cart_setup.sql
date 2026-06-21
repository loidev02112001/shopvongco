-- =========================================================================
-- LUNA JEWEL MIGRATION SCRIPT - BẢNG CART (GIỎ HÀNG)
-- Copy và chạy mã bên dưới trong Supabase SQL Editor để lưu trữ giỏ hàng online!
-- =========================================================================

CREATE TABLE IF NOT EXISTS cart (
    id TEXT PRIMARY KEY,                            -- ID duy nhất của dòng giỏ hàng ({user_id}-{product_slug}-{size})
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE, -- Liên kết tài khoản khách hàng
    product_slug TEXT REFERENCES products(slug) ON DELETE CASCADE, -- Liên kết sản phẩm trong giỏ
    qty INTEGER DEFAULT 1,                          -- Số lượng sản phẩm
    size TEXT DEFAULT '40cm + 5cm',                 -- Kích thước biến thể sản phẩm
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_slug, size)             -- Đảm bảo mỗi biến thể sản phẩm chỉ xuất hiện 1 dòng trong giỏ hàng của user
);
