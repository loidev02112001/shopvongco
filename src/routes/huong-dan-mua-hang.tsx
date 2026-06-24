import { createFileRoute } from "@tanstack/react-router";
import { TopBar, NavBar, Footer } from "@/components/SiteChrome";

export const Route = createFileRoute("/huong-dan-mua-hang")({
  head: () => ({ meta: [{ title: "Hướng Dẫn Mua Hàng — Luna Jewel" }] }),
  component: HuongDanMuaHangPage,
});

function HuongDanMuaHangPage() {
  const steps = [
    { num: "01", title: "Chọn sản phẩm", desc: "Duyệt qua bộ sưu tập của chúng tôi, sử dụng tính năng tìm kiếm hoặc bộ lọc để tìm sản phẩm ưng ý. Nhấn vào sản phẩm để xem chi tiết và thử vòng AI." },
    { num: "02", title: "Thêm vào giỏ hàng", desc: "Nhấn nút \"Thêm vào giỏ hàng\". Bạn có thể tiếp tục mua sắm hoặc vào giỏ hàng để xem lại đơn hàng." },
    { num: "03", title: "Kiểm tra giỏ hàng", desc: "Xem lại các sản phẩm, điều chỉnh số lượng nếu cần, nhập mã giảm giá (nếu có) rồi nhấn \"Đặt Hàng\"." },
    { num: "04", title: "Điền thông tin giao hàng", desc: "Nhập họ tên, số điện thoại và địa chỉ giao hàng đầy đủ, chính xác." },
    { num: "05", title: "Chọn phương thức thanh toán", desc: "Luna Jewel hỗ trợ thanh toán COD (tiền mặt khi nhận hàng), chuyển khoản ngân hàng và ví điện tử." },
    { num: "06", title: "Xác nhận đơn hàng", desc: "Sau khi đặt hàng thành công, bạn sẽ nhận email xác nhận. Chúng tôi sẽ liên hệ xác nhận và thông báo thời gian giao hàng." },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-10 flex-1 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold text-foreground mb-8">Hướng Dẫn Mua Hàng</h1>
        <div className="space-y-8">
          {steps.map((s) => (
            <div key={s.num} className="flex gap-5">
              <div className="shrink-0 w-12 h-12 rounded-full bg-brand text-brand-foreground flex items-center justify-center font-bold text-sm">{s.num}</div>
              <div>
                <h3 className="font-semibold text-foreground text-base mb-1">{s.title}</h3>
                <p className="text-sm text-foreground/75">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
