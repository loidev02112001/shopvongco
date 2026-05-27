import { createFileRoute } from "@tanstack/react-router";
import { PolicyLayout } from "@/components/PolicyLayout";

export const Route = createFileRoute("/chinh-sach-van-chuyen")({
  head: () => ({ meta: [{ title: "Chính Sách Vận Chuyển — Luna Jewel" }] }),
  component: ChinhSachVanChuyenPage,
});

function ChinhSachVanChuyenPage() {
  return (
    <PolicyLayout active="/chinh-sach-van-chuyen" title="Chính Sách Vận Chuyển">
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">1. Thời gian giao hàng</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Nội thành Hà Nội & TP.HCM:</strong> 1–2 ngày làm việc</li>
          <li><strong>Các tỉnh thành khác:</strong> 3–5 ngày làm việc</li>
          <li><strong>Vùng sâu, vùng xa:</strong> 5–7 ngày làm việc</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">2. Phí vận chuyển</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Miễn phí vận chuyển cho đơn hàng từ <strong>500.000đ</strong></li>
          <li>Đơn dưới 500.000đ: phí vận chuyển 25.000đ – 40.000đ tùy khu vực</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">3. Đơn vị vận chuyển</h2>
        <p>Luna Jewel hợp tác với GHN, GHTK và ViettelPost để đảm bảo đơn hàng được giao nhanh chóng và an toàn.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">4. Theo dõi đơn hàng</h2>
        <p>Sau khi đơn hàng được xác nhận vận chuyển, bạn sẽ nhận mã vận đơn qua email và có thể tra cứu trạng thái giao hàng trực tiếp trên website của đơn vị vận chuyển.</p>
      </section>
    </PolicyLayout>
  );
}
