-- =========================================================================
-- LUNA JEWEL MIGRATION SCRIPT - BẢNG ORDERS (ĐƠN HÀNG)
-- Copy và chạy mã bên dưới trong Supabase SQL Editor để kích hoạt UC15 & UC16!
-- =========================================================================

CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,                            -- Mã đơn hàng duy nhất (ví dụ: DH-847294)
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL, -- Liên kết tài khoản (NULL nếu không đăng nhập)
    recipient_name TEXT NOT NULL,                   -- Tên người nhận hàng
    phone TEXT NOT NULL,                            -- SĐT nhận hàng
    address TEXT NOT NULL,                          -- Địa chỉ chi tiết nhận hàng
    payment_method TEXT DEFAULT 'COD',              -- Phương thức thanh toán (mặc định COD)
    items JSONB NOT NULL,                           -- Mảng chứa các sản phẩm mua dạng JSON
    total_amount NUMERIC NOT NULL,                  -- Tổng tiền đơn hàng
    status TEXT DEFAULT 'PENDING',                  -- Trạng thái: PENDING (Chờ xử lý) | PROCESSING | SHIPPED | DELIVERED | CANCELLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
