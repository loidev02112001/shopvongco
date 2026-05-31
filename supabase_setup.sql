-- =========================================================================
-- LUNA JEWEL DATABASE MIGRATION SCRIPT FOR SUPABASE / POSTGRESQL
-- Copy và chạy toàn bộ mã bên dưới trong Supabase SQL Editor của bạn!
-- =========================================================================

-- 1. Bảng users: Lưu thông tin tài khoản người dùng
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                          -- ID dạng chuỗi đồng bộ với Client
    email TEXT UNIQUE NOT NULL,                   -- Email định danh duy nhất
    password_hash TEXT,                           -- Mật khẩu đã băm (null nếu dùng Google OAuth)
    google_id TEXT UNIQUE,                        -- ID Google OAuth nếu có
    full_name TEXT NOT NULL,                      -- Họ và tên đầy đủ
    phone TEXT,                                   -- Số điện thoại
    avatar_url TEXT,                              -- Ảnh đại diện (DataURL hoặc link ảnh)
    role TEXT DEFAULT 'USER',                     -- Quyền hạn: 'USER' | 'MANAGER' | 'ADMIN'
    status TEXT DEFAULT 'ACTIVE',                 -- Trạng thái: 'ACTIVE' | 'LOCKED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng addresses: Sổ địa chỉ giao hàng nhận hàng của người dùng (UC11)
CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY,                          -- ID địa chỉ dạng chuỗi
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE, -- Liên kết khóa ngoại tới users
    recipient_name TEXT NOT NULL,                 -- Tên người nhận
    phone TEXT NOT NULL,                          -- SĐT liên hệ nhận hàng
    province TEXT NOT NULL,                       -- Tỉnh / Thành phố
    district TEXT NOT NULL,                       -- Quận / Huyện
    ward TEXT NOT NULL,                           -- Phường / Xã
    street TEXT NOT NULL,                         -- Số nhà, tên đường chi tiết
    is_default BOOLEAN DEFAULT FALSE              -- Có phải địa chỉ mặc định hay không
);

-- 3. Bảng products: Lưu thông tin chi tiết sản phẩm trang sức (Đồng bộ Cloud dynamic)
CREATE TABLE IF NOT EXISTS products (
    slug TEXT PRIMARY KEY,                        -- Slug định danh duy nhất cho sản phẩm
    img TEXT NOT NULL,                            -- URL hoặc Base64 hình ảnh sản phẩm
    name TEXT NOT NULL,                           -- Tên đầy đủ của sản phẩm
    short_name TEXT NOT NULL,                     -- Tên ngắn gọn hiển thị
    price TEXT NOT NULL,                          -- Giá sản phẩm (ví dụ: '500.000VNĐ')
    description TEXT NOT NULL,                    -- Mô tả sản phẩm chi tiết
    specs JSONB NOT NULL,                         -- Thông số kỹ thuật (Kiểu dáng, chất liệu, màu sắc...) dạng JSONB
    info TEXT NOT NULL,                           -- Tiêu đề thông tin sản phẩm
    collection_id TEXT,                           -- Liên kết bộ sưu tập nếu có
    images JSONB DEFAULT '[]'::jsonb,             -- Danh sách ảnh phụ/chi tiết sản phẩm (UC22)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hỗ trợ di cư tự động cho các database đã chạy trước đó
ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Bật tính năng Row Level Security (RLS) để bảo vệ dữ liệu (Tùy chọn, mặc định tắt để dễ demo)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
