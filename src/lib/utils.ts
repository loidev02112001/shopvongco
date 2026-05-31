import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatProductPrice(price: string | number | undefined | null): string {
  if (price === undefined || price === null) return "0 VNĐ";
  const strPrice = String(price).trim();
  
  // Kiểm tra xem đã có chữ VNĐ/VND/vnđ/vnd chưa
  const hasVnd = /vnđ|vnd/i.test(strPrice);
  if (hasVnd) {
    return strPrice;
  }
  
  // Nếu chưa có, tiến hành định dạng thêm dấu chấm và chữ VNĐ
  const cleanNumber = strPrice.replace(/\D/g, "");
  if (!cleanNumber) return "0 VNĐ";
  const formattedNumber = cleanNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${formattedNumber} VNĐ`;
}
