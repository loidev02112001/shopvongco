import { createFileRoute } from "@tanstack/react-router";
import { PolicyLayout } from "@/components/PolicyLayout";

export const Route = createFileRoute("/chinh-sach-doi-tra")({
  head: () => ({ meta: [{ title: "Chính Sách Đổi Trả — Luna Jewel" }] }),
  component: ChinhSachDoiTraPage,
});

function ChinhSachDoiTraPage() {
  return (
    <PolicyLayout active="/chinh-sach-doi-tra" title="Chính Sách Đổi Trả">
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">1. Điều kiện đổi trả</h2>
        <p>Luna Jewel chấp nhận đổi/trả hàng trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng với điều kiện:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Sản phẩm còn nguyên tem, nhãn mác chưa qua sử dụng</li>
          <li>Sản phẩm còn nguyên hộp và phụ kiện đi kèm</li>
          <li>Có hóa đơn mua hàng hợp lệ</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">2. Các trường hợp được đổi trả</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Sản phẩm bị lỗi kỹ thuật từ nhà sản xuất</li>
          <li>Giao sai sản phẩm so với đơn hàng</li>
          <li>Sản phẩm bị hư hỏng trong quá trình vận chuyển</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-foreground mb-3">3. Quy trình đổi trả</h2>
        <p>Liên hệ hotline <strong>0901 234 567</strong> hoặc email <strong>contact@lunajewel.vn</strong>, cung cấp mã đơn hàng và hình ảnh sản phẩm lỗi. Chúng tôi sẽ xác nhận và hướng dẫn bước tiếp theo trong vòng 24 giờ.</p>
      </section>
    </PolicyLayout>
  );
}
