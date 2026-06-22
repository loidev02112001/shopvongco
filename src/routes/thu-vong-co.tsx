import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TopBar, NavBar, Footer } from "@/components/SiteChrome";
import { NecklaceTryOn } from "@/components/NecklaceTryOn";
import {
  Heart,
  Sun,
  Star,
  Moon,
  Leaf,
  PawPrint,
  Hand,
  Sparkles,
  Clover,
} from "lucide-react";
import { BenefitsStrip } from "@/components/BenefitsStrip";
import charms from "@/assets/tryon-charms.jpg";
import heart from "@/assets/tryon-heart.jpg";
import realProduct1 from "@/assets/real-product-1.jpg";
import realProduct2 from "@/assets/real-product-2.jpg";
import realProduct3 from "@/assets/real-product-3.jpg";
import arBanner from "@/assets/tryon-ar-banner.png";

type TryOnSearch = { slug?: string; img?: string };

export const Route = createFileRoute("/thu-vong-co")({
  validateSearch: (search: Record<string, unknown>): TryOnSearch => ({
    slug: typeof search.slug === "string" ? search.slug : undefined,
    img: typeof search.img === "string" ? search.img : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Thử vòng cổ Live AR — LUNA JEWEL" },
      {
        name: "description",
        content:
          "Trải nghiệm live camera thử vòng cổ trực tuyến cùng LUNA JEWEL. Công nghệ AR 2.5D chân thực.",
      },
      { property: "og:title", content: "Thử vòng cổ Live AR — LUNA JEWEL" },
      {
        property: "og:description",
        content:
          "Thử trực tuyến các mẫu vòng cổ bạc 925 LUNA JEWEL qua camera hoặc upload ảnh chân dung của bạn.",
      },
    ],
  }),
  component: ThuVongCoPage,
});

const symbols = [Heart, Heart, Sparkles, Sun, Star, Moon, Leaf, PawPrint, Hand, Clover];

function ThuVongCoPage() {
  const navigate = useNavigate();
  const { slug, img } = Route.useSearch();

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <NavBar />

      {/* Hero */}
      <section className="w-full">
        <img
          src={arBanner}
          alt="Trải nghiệm thử thật trên AR — LUNA JEWEL"
          width={1920}
          height={620}
          className="block w-full h-auto"
        />
      </section>

      <BenefitsStrip className="mt-8" />

      {/* Thử vòng cổ trực tuyến */}
      <NecklaceTryOn initSlug={slug} initImage={img} />

      {/* Khắc thông điệp */}
      <section className="max-w-5xl mx-auto px-6 mt-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-wide font-display">
          KHẮC THÔNG ĐIỆP CÁ NHÂN HOÁ
        </h2>

        {/* Bước 1 */}
        <div className="mt-10">
          <h3 className="text-xl md:text-2xl font-bold text-brand">BƯỚC 1</h3>
          <p className="mt-2 text-foreground/75 font-medium">Chọn sản phẩm chạm-khắc thông điệp</p>
          <img
            src={charms}
            alt="Các mẫu charm khắc thông điệp"
            loading="lazy"
            width={1600}
            height={512}
            className="mt-8 w-full object-contain"
          />
        </div>

        {/* Bước 2 */}
        <div className="mt-16">
          <h3 className="text-xl md:text-2xl font-bold text-brand">BƯỚC 2</h3>
          <p className="mt-2 text-foreground/75 font-medium">Sáng tạo thông điệp cá nhân hoá</p>
          <div className="mt-8 grid grid-cols-5 gap-6 max-w-md mx-auto text-brand">
            {symbols.map((Icon, i) => (
              <div key={i} className="flex items-center justify-center">
                <Icon className="w-8 h-8" strokeWidth={1.5} />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="mt-6 text-sm text-brand font-bold underline underline-offset-4 hover:opacity-85"
          >
            Xem thêm
          </button>
        </div>

        {/* Bước 3 */}
        <div className="mt-16">
          <h3 className="text-xl md:text-2xl font-bold text-brand">BƯỚC 3</h3>
          <p className="mt-2 text-foreground/75 font-medium">
            Chọn "Lưu và thêm vào giỏ", thanh toán đơn hàng và hoàn tất.
          </p>
          <img
            src={heart}
            alt="Mặt dây chuyền hình trái tim cá nhân hoá"
            loading="lazy"
            width={800}
            height={800}
            className="mt-8 mx-auto w-48 md:w-56 object-contain"
          />
          <button
            type="button"
            onClick={() => navigate({ to: "/bo-suu-tap" })}
            className="mt-10 bg-brand text-brand-foreground px-10 py-3 text-sm font-bold tracking-wider transition-all duration-200 hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5"
          >
            KHÁM PHÁ NGAY
          </button>
        </div>
      </section>

      {/* Sản phẩm thực tế */}
      <section className="max-w-7xl mx-auto px-6 mt-20">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center tracking-wide font-display">
          SẢN PHẨM THỰC TẾ
        </h2>
        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <img
            src={realProduct1}
            alt="Sản phẩm thực tế — Bộ trang sức vòng cổ & bông tai cỏ bốn lá Luna Jewel"
            loading="lazy"
            width={900}
            height={900}
            className="w-full h-72 md:h-96 object-cover rounded-lg"
          />
          <img
            src={realProduct2}
            alt="Sản phẩm thực tế — Vòng cổ cỏ bốn lá đeo trên cổ"
            loading="lazy"
            width={900}
            height={900}
            className="w-full h-72 md:h-96 object-cover rounded-lg"
          />
        </div>
        <img
          src={realProduct3}
          alt="Banner ưu đãi giảm giá Luna Jewel — Giảm giá lên đến 20%"
          loading="lazy"
          width={1600}
          height={600}
          className="mt-4 w-full h-72 md:h-96 object-cover rounded-lg"
        />
      </section>

      {/* CTA strip */}
      <section className="max-w-7xl mx-auto px-6 mt-10">
        <div className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-brand/20 py-8 px-7 rounded-xl bg-brand-soft/30 hover:shadow-md cursor-pointer transition-all duration-300">
          <div>
            <p className="text-lg md:text-xl font-bold text-brand tracking-wider">LUNA JEWEL CLUB</p>
            <p className="text-sm md:text-base text-foreground/70 mt-2 font-medium">
              Nhận ưu đãi 10% cho khách hàng mới đăng ký tài khoản thành viên Luna Jewel
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              navigate({ to: "/tai-khoan" });
            }}
            className="bg-brand text-brand-foreground px-10 py-3.5 text-sm font-bold tracking-wider transition-all duration-200 hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5 rounded"
          >
            ĐĂNG KÝ NGAY
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
