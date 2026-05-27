import { createFileRoute } from "@tanstack/react-router";
import { PolicyLayout } from "@/components/PolicyLayout";

export const Route = createFileRoute("/chinh-sach-bao-hanh")({
  head: () => ({ meta: [{ title: "Chính Sách Bảo Hành — Luna Jewel" }] }),
  component: ChinhSachBaoHanhPage,
});

function ChinhSachBaoHanhPage() {
  return (
    <PolicyLayout active="/chinh-sach-bao-hanh" title="Chính Sách Bảo Hành">
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">1. Thời gian bảo hành</h2>
        <p>Tất cả sản phẩm trang sức của Luna Jewel được bảo hành <strong>12 tháng</strong> kể từ ngày mua hàng đối với các lỗi kỹ thuật từ nhà sản xuất.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">2. Phạm vi bảo hành</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Lỗi hàn, kết nối bị hỏng do sản xuất</li>
          <li>Bạc/vàng bị đổi màu bất thường trong điều kiện sử dụng bình thường</li>
          <li>Đá bị rơi do lỗi khung đính</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">3. Không áp dụng bảo hành</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Sản phẩm bị hư hỏng do va đập, rơi vỡ</li>
          <li>Tiếp xúc với hóa chất, nước biển, nước chlorine</li>
          <li>Tự ý sửa chữa tại nơi khác ngoài Luna Jewel</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">4. Quy trình bảo hành</h2>
        <p>Mang sản phẩm kèm hóa đơn mua hàng đến cửa hàng hoặc liên hệ hotline <strong>0901 234 567</strong> để được hỗ trợ gửi bảo hành qua bưu điện.</p>
      </section>
    </PolicyLayout>
  );
}
