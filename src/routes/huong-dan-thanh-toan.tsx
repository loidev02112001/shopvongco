import { createFileRoute } from "@tanstack/react-router";
import { TopBar, NavBar, Footer } from "@/components/SiteChrome";

export const Route = createFileRoute("/huong-dan-thanh-toan")({
  head: () => ({ meta: [{ title: "Hướng Dẫn Thanh Toán — Luna Jewel" }] }),
  component: HuongDanThanhToanPage,
});

function HuongDanThanhToanPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <NavBar />
      <main className="max-w-3xl mx-auto px-6 py-16 flex-1">
        <h1 className="text-3xl font-bold text-foreground mb-8">Hướng Dẫn Thanh Toán</h1>
        <div className="space-y-8 text-sm text-foreground/80">
          <section className="bg-white rounded-lg p-6 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-3">💵 Thanh toán khi nhận hàng (COD)</h2>
            <p>Chọn phương thức COD khi đặt hàng. Bạn sẽ thanh toán bằng tiền mặt trực tiếp cho nhân viên giao hàng khi nhận sản phẩm. Không cần thẻ hay tài khoản ngân hàng.</p>
          </section>
          <section className="bg-white rounded-lg p-6 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-3">🏦 Chuyển khoản ngân hàng</h2>
            <p className="mb-3">Thông tin tài khoản:</p>
            <ul className="space-y-1 font-mono text-xs bg-gray-50 p-4 rounded">
              <li><strong>Ngân hàng:</strong> Vietcombank</li>
              <li><strong>Số tài khoản:</strong> 1234567890</li>
              <li><strong>Chủ tài khoản:</strong> CONG TY TNHH LUNA JEWEL</li>
              <li><strong>Nội dung:</strong> [Mã đơn hàng] - [Họ tên]</li>
            </ul>
            <p className="mt-3 text-xs text-foreground/60">Đơn hàng sẽ được xác nhận trong vòng 30 phút sau khi nhận được chuyển khoản.</p>
          </section>
          <section className="bg-white rounded-lg p-6 shadow-sm border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-3">📱 Ví điện tử</h2>
            <p>Luna Jewel hỗ trợ thanh toán qua <strong>MoMo</strong>, <strong>ZaloPay</strong> và <strong>VNPay</strong>. Quét mã QR hoặc chuyển thủ công đến số điện thoại liên kết <strong>0901 234 567</strong>.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
