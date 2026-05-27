import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { TopBar, NavBar, Footer } from "@/components/SiteChrome";

type SectionKey = "bao-hanh" | "van-chuyen" | "doi-tra" | "bao-mat";
const VALID_KEYS: SectionKey[] = ["bao-hanh", "van-chuyen", "doi-tra", "bao-mat"];

export const Route = createFileRoute("/dich-vu")({
  validateSearch: (search: Record<string, unknown>): { muc?: SectionKey } => {
    const m = search.muc;
    return typeof m === "string" && (VALID_KEYS as string[]).includes(m)
      ? { muc: m as SectionKey }
      : {};
  },
  head: () => ({
    meta: [
      { title: "Dịch vụ — LUNA JEWEL" },
      {
        name: "description",
        content:
          "Các chính sách bảo hành, vận chuyển, đổi trả và bảo mật của LUNA JEWEL.",
      },
      { property: "og:title", content: "Dịch vụ — LUNA JEWEL" },
      {
        property: "og:description",
        content:
          "Tìm hiểu chính sách bảo hành, vận chuyển, đổi trả và bảo mật khi mua trang sức tại LUNA JEWEL.",
      },
    ],
  }),
  component: DichVuPage,
});

const menu: { key: SectionKey; label: string }[] = [
  { key: "bao-hanh", label: "Chính sách bảo hành" },
  { key: "van-chuyen", label: "Chính sách vận chuyển" },
  { key: "doi-tra", label: "Chính sách đổi trả" },
  { key: "bao-mat", label: "Chính sách bảo mật" },
];

function H1({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl md:text-3xl font-bold text-brand mb-4">
      {children}
    </h1>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base md:text-lg font-semibold text-brand uppercase tracking-wide mt-8 mb-3">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-foreground/80 leading-relaxed mb-3">{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc pl-6 mb-3 space-y-1.5 text-foreground/80">
      {children}
    </ul>
  );
}

function BaoHanh() {
  return (
    <>
      <H1>Chính sách bảo hành</H1>
      <P>
        Để đảm bảo quyền lợi cho quý khách và tạo sự thuận tiện cho việc bảo
        hành, quý khách vui lòng giữ hóa đơn bán hàng và giấy kiểm định sản
        phẩm để phục vụ cho việc bảo hành sản phẩm.
      </P>
      <P>
        Nếu thông tin sản phẩm truy xuất không đúng với thông tin khách hàng
        đăng ký bảo hành, LUNA JEWEL sẽ xem xét từng trường hợp cụ thể để đưa
        ra phương án tối ưu nhất cho khách hàng.
      </P>

      <H2>Các loại hình bảo hành miễn phí và thời hạn bảo hành</H2>
      <P>Trường hợp loại trừ, không áp dụng bảo hành miễn phí:</P>
      <UL>
        <li>Khách hàng cung cấp thông tin truy lục hóa đơn không chính xác</li>
        <li>Sản phẩm bị biến dạng hoặc hư hỏng nặng do lỗi người dùng</li>
        <li>
          Sản phẩm đã bị mất các linh kiện chính như charm, mặt đá chuyển, ổ
          đá quý và không có khả năng thay thế
        </li>
        <li>Có các động sửa chữa không đến từ LUNA JEWEL</li>
      </UL>

      <H2>Các loại hình bảo hành có tính phí và sửa chữa khác</H2>
      <P>
        ▼ Đối với sản phẩm của LUNA JEWEL: Giảm 50% chi phí bảo hành và sửa
        chữa đối với sản phẩm LUNA JEWEL cho các trường hợp:
      </P>
      <UL>
        <li>Các dịch vụ bảo hành miễn phí có thời hạn đã hết hạn</li>
        <li>
          Sửa chữa hư hỏng sản phẩm do lỗi sử dụng và bảo quản sản phẩm không
          phù hợp
        </li>
        <li>Chỉnh sửa cỡ nhẫn, lắc tay, dây chuyền sau khi đã mua</li>
        <li>Hàn nối dây, lắc bị đứt gãy</li>
        <li>Đánh bóng lại sản phẩm (sau thời gian bảo hành)</li>
        <li>Các lỗi do thông tin khách hàng cung cấp không chính xác, ví dụ như sai kích cỡ</li>
      </UL>
      <P>
        ▼ Đối với sản phẩm bạc không phải của LUNA JEWEL: Giảm 30% giá trên hóa
        đơn sửa chữa cho khách từng mua hàng của Cara Luna.
      </P>
      <P>
        ***Chế độ bảo hành có thể thay đổi theo chính sách của cửa hàng tại
        từng thời điểm
      </P>
    </>
  );
}

function VanChuyen() {
  return (
    <>
      <H1>Chính sách vận chuyển</H1>
      <P>
        LUNA JEWEL giao hàng tận nơi trên toàn quốc cho tất cả các đơn hàng,
        trong đó:
      </P>
      <UL>
        <li>
          MIỄN PHÍ giao hàng tiêu chuẩn đối với đơn hàng có giá trị từ
          950.000 VNĐ trở lên.
        </li>
        <li>
          Thu phí giao hàng tiêu chuẩn đối với các đơn hàng có giá trị thấp
          hơn 950.000 VNĐ như sau:
          <ul className="list-[circle] pl-6 mt-1.5 space-y-1">
            <li>Đơn hàng trong nội thành Hà Nội: 20.000 VNĐ.</li>
            <li>Đơn hàng ngoại thành/tỉnh: 30.000 VNĐ</li>
          </ul>
        </li>
      </UL>
      <P>
        Trong trường hợp khách hàng muốn dùng các dịch vụ giao hàng hỏa tốc nội
        thành Hà Nội, khách vui lòng thanh toán bộ phí giao hàng hỏa tốc.
      </P>
      <P>
        Dịch vụ thanh toán với shipper khi nhận hàng (COD) trên Toàn Quốc
      </P>

      <H2>Dịch vụ Bảo hiểm hàng hóa và giao hàng bảo đảm 100%</H2>
      <UL>
        <li>
          Để bảo vệ quyền lợi của Khách hàng khi mua sản phẩm tại LUNA JEWEL,
          toàn bộ sản phẩm của LUNA JEWEL thông qua đối tác vận chuyển đều
          được LUNA JEWEL mua bảo hiểm hàng hoá.
        </li>
        <li>Luôn cam kết đền bù 100% giá trị hàng hóa trong trường hợp thất lạc.</li>
      </UL>

      <H2>Quy cách đóng gói hàng hóa tại LUNA JEWEL</H2>
      <UL>
        <li>
          Toàn bộ sản phẩm LUNA JEWEL đã được kiểm tra chất lượng trước khi
          đóng gói.
        </li>
        <li>
          Lớp 1: Sản phẩm của quý khách được đặt vào hộp trang sức LUNA JEWEL.
        </li>
        <li>Lớp 2: Hộp trang sức được bọc chống sốc và đóng gói kín.</li>
      </UL>
      <P>
        LƯU Ý: Khi kiểm tra hàng , quý khách nên quay lại video để những vấn
        đề phát sinh được dễ dàng xử lý.
      </P>

      <H2>Thời gian giao hàng:</H2>
      <P>
        Thời gian giao hàng được bắt đầu tính từ lúc tư vấn viên LUNA JEWEL
        liên hệ xác nhận đơn hàng thành công và được tính như sau:
      </P>
      <P>
        Thời gian giao hàng = Thời gian chế tác/đóng gói hàng + Thời gian
        chuyển phát
      </P>
      <P>
        Ước tính thời gian giao hàng cho các sản phẩm của Cara Luna là như
        sau:
      </P>
      <UL>
        <li>Đối với khu vực nội thành Hà Nội: 1-3 ngày</li>
        <li>Đối với khu vực ngoại thành Hà Nội: 2-3 ngày</li>
        <li>Đối với các Tỉnh, TP khác: 3-5 ngày</li>
      </UL>
      <P>
        Thời gian giao hàng trên chỉ mang tính chất tham khảo, thực tế có thể
        giao động sớm hoặc muộn hơn tùy theo tình trạng tồn kho sản phẩm, địa
        chỉ giao hàng và một số điều kiện khách quan mà LUNA JEWEL không thể
        kiểm soát được (Ví dụ: dịch bệnh, thiên tai, lũ lụt, hỏng hóc phương
        tiện, quy định mới của nhà nước…).
      </P>

      <H2>Chính sách xem và kiểm tra hàng hóa trước khi nhận hàng:</H2>
      <P>
        Nhằm đáp ứng nhu cầu và bảo vệ tối đa quyền lợi khách hàng khi sử dụng
        dịch vụ của LUNA JEWEL, LUNA JEWEL đã triển khai chính sách hỗ trợ
        việc xem và kiểm tra hàng hóa khi giao hàng trước khi nhận và thanh
        toán.
      </P>
      <ol className="list-decimal pl-6 mb-3 space-y-2 text-foreground/80">
        <li>
          Khách hàng khi nhận hàng từ nhân viên vận chuyển: vui lòng kiểm tra
          hộp hàng còn nguyên vẹn, khách hàng có thể mở hàng để kiểm tra hàng
          hóa bên trong hộp hàng. Khuyến khích khách hàng quay lại Video trong
          suốt quá trình kiểm tra hàng để những vấn đề phát sinh được dễ dàng
          xử lý.
        </li>
        <li>
          LUNA JEWEL đảm bảo sản phẩm gửi đến khách hàng đã được kiểm tra chất
          lượng. Trong trường hợp hiếm hoi sản phẩm khách hàng nhận được có
          khiếm khuyết, hư hỏng hoặc không như mô tả, LUNA JEWEL cam kết bảo
          vệ khách hàng bằng chính sách đổi trả và bảo hành tại: Chính sách
          bảo hành và Chính sách đổi trả.
        </li>
      </ol>
    </>
  );
}

function DoiTra() {
  return (
    <>
      <H1>Chính sách đổi trả</H1>
      <P>
        Chúng tôi luôn đặt sự hài lòng của khách hàng lên hàng đầu. Để đảm bảo
        cho khách hàng có một trải nghiệm tuyệt vời nhất, quý khách vui lòng
        kiểm tra lại sản phẩm, hóa đơn, thông tin đơn hàng và giấy kiểm định
        (nếu có) khi mua hàng/sau khi bảo hành sản phẩm.
      </P>
      <P>
        Sau khi giao dịch hoàn thành (hóa đơn chính thức đã xuất, khách đã
        kiểm tra và nhận hàng), Cara Luna sẽ không chịu trách nhiệm giải
        quyết khiếu nại sai thiếu sót sản phẩm liên hàng.
      </P>

      <H2>Đối với các yêu cầu đổi trả khác đến từ khách hàng</H2>
      <UL>
        <li>
          Đối với trường hợp đổi size, cỡ, mẫu, LUNA JEWEL hỗ trợ miễn phí
          đổi size, mẫu cùng loại sản phẩm cùng giá trị trong vòng 30 ngày
        </li>
        <li>
          Nếu như trong vòng 30 ngày sau khi nhận được hàng, khách hàng mong
          muốn đổi trả thì LUNA JEWEL hỗ trợ mua mới có giá trị cao hoặc bằng
          đơn cũ
        </li>
        <li>
          Điều kiện áp dụng đổi/trả hàng:
          <ul className="list-[circle] pl-6 mt-1.5 space-y-1">
            <li>
              Sản phẩm và hóa đơn, giấy kiểm định, kèm tem và chủng chất
              lượng phải còn nguyên vẹn như nguyên trạng ban đầu
            </li>
            <li>Khách hàng chỉ được đổi sản phẩm 01 lần duy nhất</li>
            <li>
              Khách hàng sẽ chịu chi phí phát sinh liên quan tới quá trình
              đổi trả
            </li>
          </ul>
        </li>
      </UL>

      <H2>Đối với các mặt hàng có lỗi từ nhà sản xuất - LUNA JEWEL</H2>
      <P>
        Trong trường hợp hiếm hoi sản phẩm khách hàng nhận được có khiếm
        khuyết, hư hỏng hoặc không như mô tả, LUNA JEWEL cam kết bảo vệ khách
        hàng bằng việc đổi sản phẩm đúng như mô tả các mặt hàng được chính
        sửa theo như chính sách bảo hành:
      </P>
      <UL>
        <li>
          Khi khách hàng nhận hàng có lỗi, vui lòng liên hệ ngay với bộ phận
          CSKH ngay trong vòng 24h kể từ khi nhận hàng để LUNA JEWEL hỗ trợ
          xử lý giải quyết đổi trả. Mọi yêu cầu sau 24h sẽ được xem xét giải
          quyết bằng chính sách bảo hành.
        </li>
        <li>
          Mọi chi phí liên quan đến việc vận chuyển hàng để đổi trả/bảo hành
          lỗi của nhà sản xuất sẽ được Cara Luna LUNA JEWEL hỗ trợ miễn phí.
        </li>
      </UL>
    </>
  );
}

function BaoMat() {
  return (
    <>
      <H1>Chính sách thu đổi sản phẩm</H1>

      <H2>1. Thu đổi đối với sản phẩm còn nguyên vẹn</H2>
      <p className="font-semibold text-foreground/90 mb-2">a. Trong vòng 72H</p>
      <P>
        Điều kiện áp dụng: sản phẩm còn nguyên vẹn, đủ hoá đơn và chứng thư
        kiểm định (nếu có) thu đổi trong vòng 72h kể từ khi xuất hóa đơn. Mỗi
        sản phẩm chỉ được áp dụng đổi 72h 1 lần.
      </P>
      <p className="font-semibold text-foreground/90 mt-3 mb-2">b. Sau 72H</p>
      <P>
        Điều kiện áp dụng: sản phẩm còn nguyên vẹn, đủ hoá đơn và chứng thư
        kiểm định thu đổi sau 72h kể từ khi xuất hóa đơn. Mỗi sản phẩm chỉ
        được áp dụng đổi 1 lần.
      </P>

      <p className="font-semibold text-foreground/90 mt-4 mb-2">Ghi chú:</p>
      <UL>
        <li>
          Đối với sản phẩm mới có giá trị thấp hơn sản phẩm cũ, sẽ không được
          hoàn tiền phần chênh lệch.
        </li>
        <li>
          Sản phẩm không còn nguyên vẹn được định nghĩa là:
          <ul className="list-[circle] pl-6 mt-1.5 space-y-1">
            <li>
              Về hình dạng: đứt dây, gãy, cong, móp méo, lõm, mẻ, gãy ổ chấu,
              hỏng, biến dạng, mòn
            </li>
            <li>
              Về màu sắc: ố, xỉn màu sản phẩm/đá, mặt lốp xỉ, mất độ phay do
              sử dụng trong thời gian dài, sản phẩm tiếp xúc với hoá chất,
              chất tẩy rửa, mỹ phẩm
            </li>
            <li>
              Về đá/ngọc trai gắn kèm: Đá/ngọc trai đã mất hoặc biến dạng,
              trầy xước, mất độ bóng
            </li>
            <li>Sản phẩm đã qua sửa chữa/ bảo hành</li>
            <li>Các sản phẩm đặt/chỉnh sửa theo yêu cầu của khách hàng</li>
          </ul>
        </li>
      </UL>

      <H2>2. Đối với sản phẩm không còn nguyên vẹn</H2>
      <P>
        Điều kiện áp dụng: sản phẩm không còn nguyên vẹn hoặc không đủ hoá
        đơn và chứng thư kiểm định: Mua lại theo trọng lượng vàng x giá vàng
        thời điểm (giá mua vào) theo tuổi vàng sản phẩm.
      </P>
      <P>Sản phẩm không còn nguyên vẹn được định nghĩa là:</P>
      <UL>
        <li>
          Về hình dạng: đứt dây, gãy, cong, móp méo, lõm, mẻ, gãy ổ chấu,
          hỏng, biến dạng, mòn
        </li>
        <li>
          Về màu sắc: ố, xỉn màu sản phẩm/đá, mặt lốp xỉ, mất độ phay do sử
          dụng trong thời gian dài, sản phẩm tiếp xúc với hoá chất, chất tẩy
          rửa, mỹ phẩm
        </li>
        <li>
          Về đá/ngọc trai gắn kèm: Đá/ngọc trai đã mất hoặc biến dạng, trầy
          xước, mất độ bóng
        </li>
        <li>Sản phẩm đã qua sửa chữa/ bảo hành</li>
        <li>Các sản phẩm đặt/chỉnh sửa theo yêu cầu của khách hàng</li>
      </UL>

      <p className="font-semibold text-foreground/90 mt-4 mb-2">
        Đối với các sản phẩm gắn đá:
      </p>
      <UL>
        <li>Kim cương viên: Mua lại theo bảng giá nguyên liệu cho kim cương viên</li>
        <li>Đá Moissanite: Không mua lại</li>
        <li>Đá màu: Không mua lại</li>
      </UL>

      <p className="font-semibold text-foreground/90 mt-4 mb-2">
        Đối với các sản phẩm do lỗi của nhà sản xuất (Thu đổi trong 1 tháng
        từ ngày xuất hóa đơn):
      </p>
      <P>Bao gồm các trường hợp:</P>
      <ol className="list-decimal pl-6 mb-3 space-y-2 text-foreground/80">
        <li>
          Rơi/rụng đá, ổ chấu không có dấu hiệu do tác động từ bên ngoài, bề
          mặt sản phẩm còn nguyên vẹn
        </li>
        <li>Đứt dây (trọng lượng vàng còn nguyên)</li>
      </ol>
      <P>Sẽ áp dụng chính sách thu đổi như trong bảng 2</P>
    </>
  );
}

function DichVuPage() {
  const { muc } = Route.useSearch();
  const [active, setActive] = useState<SectionKey>(muc ?? "bao-hanh");
  useEffect(() => {
    if (muc) {
      setActive(muc);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [muc]);

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <NavBar />

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">
        <aside>
          <h3 className="text-sm font-bold uppercase tracking-wide text-brand mb-4">
            Danh mục trang
          </h3>
          <ul className="space-y-3">
            {menu.map((m) => (
              <li key={m.key}>
                <button
                  onClick={() => setActive(m.key)}
                  className={`text-left text-sm transition ${
                    active === m.key
                      ? "text-brand font-semibold"
                      : "text-foreground/70 hover:text-brand"
                  }`}
                >
                  • {m.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <article className="min-w-0">
          {active === "bao-hanh" && <BaoHanh />}
          {active === "van-chuyen" && <VanChuyen />}
          {active === "doi-tra" && <DoiTra />}
          {active === "bao-mat" && <BaoMat />}
        </article>
      </main>

      <Footer />
    </div>
  );
}
