import { createClient } from "@supabase/supabase-js";

// Đọc thông số cấu hình từ môi trường Vite (.env)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

/**
 * Kiểm tra xem người dùng đã cấu hình Supabase thực tế chưa.
 * Trả về true nếu cấu hình hợp lệ, false nếu thiếu hoặc đang là placeholder.
 */
export const isSupabaseConfigured = (): boolean => {
  return (
    !!supabaseUrl &&
    !!supabaseAnonKey &&
    supabaseUrl !== "YOUR_SUPABASE_URL" &&
    supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY"
  );
};

// Khởi tạo Supabase client. Nếu thiếu cấu hình, nạp placeholder để tránh web bị crash khi khởi động.
export const supabase = createClient(
  supabaseUrl || "https://placeholder-url.supabase.co",
  supabaseAnonKey || "placeholder-anon-key"
);
