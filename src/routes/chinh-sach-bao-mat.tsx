import { createFileRoute } from "@tanstack/react-router";
import { PolicyLayout } from "@/components/PolicyLayout";

export const Route = createFileRoute("/chinh-sach-bao-mat")({
  head: () => ({ meta: [{ title: "Chính Sách Bảo Mật — Luna Jewel" }] }),
  component: ChinhSachBaoMatPage,
});

function ChinhSachBaoMatPage() {
  return (
    <PolicyLayout active="/chinh-sach-bao-mat" title="Chính Sách Bảo Mật">
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">1. Thu thập thông tin</h2>
        <p>Luna Jewel thu thập thông tin cá nhân của bạn khi bạn đặt hàng, đăng ký tài khoản hoặc liên hệ với chúng tôi. Các thông tin này bao gồm họ tên, địa chỉ email, số điện thoại và địa chỉ giao hàng.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">2. Sử dụng thông tin</h2>
        <p>Thông tin của bạn được sử dụng để xử lý đơn hàng, gửi thông báo giao hàng, cải thiện dịch vụ và gửi thông tin khuyến mãi (nếu bạn đồng ý nhận).</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">3. Bảo vệ thông tin</h2>
        <p>Chúng tôi áp dụng các biện pháp bảo mật tiêu chuẩn ngành để bảo vệ thông tin cá nhân của bạn khỏi truy cập trái phép, thay đổi, tiết lộ hoặc phá hủy.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">4. Chia sẻ thông tin</h2>
        <p>Luna Jewel không bán, trao đổi hoặc chuyển nhượng thông tin cá nhân của bạn cho bên thứ ba mà không có sự đồng ý của bạn, ngoại trừ các đối tác vận chuyển cần thiết để hoàn thành đơn hàng.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">5. Liên hệ</h2>
        <p>Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật, vui lòng liên hệ: <strong>contact@lunajewel.vn</strong></p>
      </section>
    </PolicyLayout>
  );
}
