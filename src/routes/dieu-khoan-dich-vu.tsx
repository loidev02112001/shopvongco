import { createFileRoute } from "@tanstack/react-router";
import { TopBar, NavBar, Footer } from "@/components/SiteChrome";

export const Route = createFileRoute("/dieu-khoan-dich-vu")({
  head: () => ({ meta: [{ title: "Điều Khoản Dịch Vụ — Luna Jewel" }] }),
  component: DieuKhoanDichVuPage,
});

function DieuKhoanDichVuPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <NavBar />
      <main className="max-w-3xl mx-auto px-4 py-10 flex-1 sm:px-6 sm:py-16">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-6 sm:mb-8" style={{ color: "#60caca" }}>Điều Khoản Dịch Vụ</h1>
        <div className="prose prose-sm text-foreground/80 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">1. Chấp nhận điều khoản</h2>
            <p>Bằng cách truy cập và sử dụng website Luna Jewel, bạn đồng ý tuân thủ các điều khoản và điều kiện sử dụng này.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">2. Sử dụng dịch vụ</h2>
            <p>Bạn cam kết sử dụng dịch vụ chỉ cho mục đích hợp pháp và không vi phạm quyền của bên thứ ba. Nghiêm cấm mọi hành vi gian lận, giả mạo thông tin đặt hàng.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">3. Quyền sở hữu trí tuệ</h2>
            <p>Toàn bộ nội dung trên website bao gồm hình ảnh, văn bản, logo và thiết kế thuộc sở hữu của Luna Jewel. Nghiêm cấm sao chép, phân phối mà không có sự cho phép bằng văn bản.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">4. Giới hạn trách nhiệm</h2>
            <p>Luna Jewel không chịu trách nhiệm về các thiệt hại gián tiếp phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ của chúng tôi.</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">5. Thay đổi điều khoản</h2>
            <p>Luna Jewel có quyền thay đổi điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
