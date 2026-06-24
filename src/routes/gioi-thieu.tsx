import { createFileRoute } from "@tanstack/react-router";
import { TopBar, NavBar, Footer } from "@/components/SiteChrome";

export const Route = createFileRoute("/gioi-thieu")({
  head: () => ({
    meta: [
      { title: "Giới thiệu — LUNA JEWEL" },
      {
        name: "description",
        content:
          "LUNA JEWEL — thương hiệu trang sức bạc Ý 925 dành cho thế hệ trẻ tự định nghĩa phong cách.",
      },
      { property: "og:title", content: "Giới thiệu — LUNA JEWEL" },
      {
        property: "og:description",
        content:
          "Khám phá câu chuyện, giá trị khác biệt, cam kết chất liệu và quy trình sản xuất của LUNA JEWEL.",
      },
    ],
  }),
  component: GioiThieuPage,
});

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl md:text-3xl font-bold text-brand tracking-wide mt-12 mb-4">
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg md:text-xl font-semibold text-brand uppercase tracking-wide mt-8 mb-3">
      {children}
    </h3>
  );
}

function GioiThieuPage() {
  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <NavBar />

      <main className="max-w-5xl mx-auto px-4 pb-12 sm:px-6 sm:pb-16">
        <SectionTitle>LUNA JEWEL – ÁNH TRĂNG HUYỀN DIỆU</SectionTitle>
        <p className="text-foreground/80 leading-relaxed">
          Lấy cảm hứng từ ánh trăng – biểu tượng của vẻ đẹp dịu dàng nhưng đầy
          sức hút, Luna Jewel tin rằng mỗi người phụ nữ đều mang trong mình một
          “vầng trăng” riêng: có lúc nhẹ nhàng, e ấp, có khi lại rực rỡ và kiêu
          hãnh.
        </p>
        <p className="text-foreground/80 leading-relaxed mt-3">
          Chúng tôi tạo nên những món trang sức bạc như những “mảnh ghép ánh
          trăng”, giúp tôn vinh nét đẹp và cá tính độc bản của mỗi người.
        </p>
        <p className="text-foreground/80 leading-relaxed mt-3">
          Không chỉ dừng lại ở trang sức, Luna Jewel còn kết hợp công nghệ AR
          hiện đại để khách hàng có thể thử sản phẩm trực tiếp ngay trên website.
          Chỉ với một chạm, bạn có thể nhìn thấy món trang sức hòa hợp với bản
          thân mình chân thực nhất trước khi sở hữu nó.
        </p>
        <p className="text-foreground/80 leading-relaxed mt-3 italic">
          Luna Jewel – nơi vẻ đẹp của nghệ thuật và công nghệ cùng giao thoa để
          ánh trăng chạm đến bạn gần hơn bao giờ hết.
        </p>

        <SubTitle>LUNA JEWEL – Trang sức dành cho thế hệ trẻ tự định nghĩa phong cách</SubTitle>
        <p className="text-foreground/80 leading-relaxed">
          Luna Jewel là thương hiệu trang sức bạc chính hãng dành cho giới trẻ,
          được chế tác từ bạc Ý 925 chuẩn định lượng với kỹ thuật đánh bóng
          gương tạo hiệu ứng óng ả, mẫu mã đa dạng và thời thượng — giúp bạn
          hoàn thiện và biến hóa phong cách bản thân.
        </p>
        <p className="text-foreground/80 leading-relaxed mt-3">
          Mỗi thiết kế của LUNA JEWEL không đơn thuần là một món trang sức, mà
          là:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground/80">
          <li>Một điểm nhấn cho outfit</li>
          <li>Một tuyên ngôn cá nhân</li>
          <li>Một “signature style” riêng biệt</li>
        </ul>

        <SectionTitle>5 GIÁ TRỊ KHÁC BIỆT CỦA LUNA JEWEL</SectionTitle>

        <ol className="space-y-6 text-foreground/80">
          <li>
            <p className="font-semibold text-foreground">
              1. Thiết kế chuẩn gu giới trẻ – cập nhật xu hướng liên tục
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Drop mẫu mới liên tục theo trend (Hàn, Âu Mỹ)</li>
              <li>Không đi theo lối thiết kế “truyền thống – an toàn”</li>
            </ul>
          </li>
          <li>
            <p className="font-semibold text-foreground">
              2. Chất lượng xuất khẩu – giá nội địa
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Sản xuất theo tiêu chuẩn xuất khẩu Mỹ, Singapore</li>
              <li>Những tối ưu chi phí để phù hợp với khách hàng trẻ Việt Nam</li>
            </ul>
          </li>
          <li>
            <p className="font-semibold text-foreground">
              3. Bạc 925 cao cấp – xử lý chống xỉn vượt trội
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Không chỉ “bạc Ý 925”</li>
              <li>
                Mà còn xử lý bề mặt giúp:
                <ul className="list-disc pl-6 mt-1 space-y-1">
                  <li>Chậm oxy hóa</li>
                  <li>Giữ màu lâu hơn thị trường phổ thông</li>
                </ul>
              </li>
            </ul>
          </li>
          <li>
            <p className="font-semibold text-foreground">
              4. Trải nghiệm mua trang sức như mua thời trang
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Tư vấn mix &amp; match theo outfit</li>
              <li>Không bán sản phẩm → bán “style”</li>
              <li>Thử vòng cổ bằng AI</li>
            </ul>
          </li>
          <li>
            <p className="font-semibold text-foreground">5. Cá nhân hóa quà tặng</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Viết thiệp tay</li>
              <li>Đóng gói premium</li>
              <li>Biến sản phẩm thành “trải nghiệm cảm xúc”</li>
            </ul>
          </li>
        </ol>

        <SectionTitle>CAM KẾT VỀ CHẤT LIỆU SẢN PHẨM</SectionTitle>
        <p className="text-foreground/80 leading-relaxed">
          Một trong những điều làm LUNA JEWEL khác biệt với các thương hiệu khác
          trên thị trường nằm ở chất lượng sản phẩm. Chúng tôi cam kết 100% đem
          đến cho khách hàng sản phẩm bạc Ý 925 đạt chuẩn chất lượng quốc tế,
          không pha tạp chất Niken, đảm bảo an toàn cho làn da.
        </p>
        <p className="text-foreground/80 leading-relaxed mt-3">
          Ngoài tiêu chuẩn bạc Ý 925 LUNA JEWEL còn chú trọng:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground/80">
          <li>Kiểm định định lượng chuẩn quốc tế</li>
          <li>
            Bề mặt xử lý đa lớp giúp:
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li>Hạn chế xỉn màu</li>
              <li>Tăng độ bền khi sử dụng hàng ngày</li>
            </ul>
          </li>
          <li>
            Thiết kế tối ưu để:
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li>Đeo lâu không gây khó chịu</li>
              <li>Phù hợp nhiều phong cách (basic → cá tính)</li>
            </ul>
          </li>
        </ul>

        <h3 className="text-lg md:text-xl font-semibold text-brand uppercase tracking-wide mt-10 mb-3">
          Tầm nhìn của LUNA JEWEL
        </h3>
        <p className="text-foreground/80 leading-relaxed">
          LUNA JEWEL hướng đến trở thành:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-1 text-foreground/80">
          <li>Top thương hiệu trang sức dành cho giới trẻ tại Việt Nam</li>
          <li>
            Thương hiệu dẫn đầu về:
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li>Thiết kế trend</li>
              <li>Trải nghiệm mua sắm</li>
              <li>Cá nhân hóa sản phẩm</li>
            </ul>
          </li>
        </ul>

        <SectionTitle>QUY TRÌNH SẢN XUẤT</SectionTitle>

        <SubTitle>Đội ngũ phát triển sản phẩm</SubTitle>
        <p className="text-foreground/80 leading-relaxed">
          Các sản phẩm trang sức vàng bạc của Cara Luna được thiết kế và phát
          triển bởi đội phát triển sản phẩm với gu thẩm mỹ luôn đi cùng xu
          hướng cùng các nhãn sự trẻ trung, năng động luôn linh hoạt để đổi mới.
        </p>
        <p className="text-foreground/80 leading-relaxed mt-3">
          Đồng hành với các chuyên viên thiết kế, Cara Luna có đội ngũ thợ lành
          nghề với tâm thế cầu thị, chú trọng trong từng tạo tác nhỏ nhất, đảm
          bảo đến cho khách hàng những sản phẩm có chất lượng tinh tế và thẩm
          mỹ cao.
        </p>

        <SubTitle>Công nghệ chế tác</SubTitle>
        <p className="text-foreground/80 leading-relaxed">
          Để sản phẩm có độ hoàn thiện cao nhất, bên cạnh đội ngũ thợ lành nghề,
          Cara Luna cũng chú trọng đầu tư vào máy móc và công nghệ hiện đại
          cùng quy trình sản xuất khép kín để đảm bảo chất liệu đầu vào và
          thực hiện các công đoạn chế tác đảm bảo chất lượng cao nhất.
        </p>
        <p className="text-foreground/80 leading-relaxed mt-3">
          Với công nghệ mạ vàng 18K hiện đại cùng kỹ thuật đánh bóng gương cho
          ra các sản phẩm bạc bóng đẹp, bền màu.
        </p>
      </main>

      <Footer />
    </div>
  );
}
