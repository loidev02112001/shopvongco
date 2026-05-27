import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Truck, RotateCcw, ShieldCheck, Gift, ChevronLeft, ChevronRight,
} from "lucide-react";
import { TopBar, NavBar, ProductCard, Footer } from "@/components/SiteChrome";
import brandMission from "@/assets/brand-mission.jpg";
import collection1 from "@/assets/collection-1.png";
import collection2 from "@/assets/collection-2.png";
import collection3 from "@/assets/collection-3.png";
import heroAr from "@/assets/hero-ar.png";
import { products } from "@/data/products";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Luna Jewel — Trang sức bạc 925 cao cấp" },
      { name: "description", content: "Luna Jewel — Bộ sưu tập trang sức bạc 925 tinh tế. Thử vòng AI, miễn phí vận chuyển, bảo hành trọn đời." },
    ],
  }),
  component: Index,
});


function Hero() {
  return (
    <section className="w-full">
      <img
        src={heroAr}
        alt="Trải nghiệm thử thật trên AR — All the love"
        className="block w-full h-auto"
      />
    </section>
  );
}


function Benefits() {
  const items = [
    { icon: Truck, title: "MIỄN PHÍ vận chuyển", sub: "Đơn Hàng từ 950.000 VNĐ" },
    { icon: RotateCcw, title: "Đổi trả MIỄN PHÍ", sub: "Trong vòng 30 NGÀY" },
    { icon: ShieldCheck, title: "Dịch vụ BẢO HÀNH", sub: "Làm mới TRỌN ĐỜI" },
    { icon: Gift, title: "Túi & hộp TRANG NHÃ", sub: "Sẵn sàng TRAO TẶNG" },
  ];
  return (
    <section className="max-w-7xl mx-auto px-6 mt-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(({ icon: Icon, title, sub }) => (
          <div key={title} className="flex items-center gap-3 rounded-full px-4 py-3 bg-brand text-brand-foreground">
            <Icon className="w-7 h-7 shrink-0" strokeWidth={1.5} />
            <div>
              <div className="text-xs font-semibold">{title}</div>
              <div className="text-[11px] opacity-90">{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function NewProducts() {
  const newProducts = [
    products.find((p) => p.slug === "thien-nga-graceful-swan")!,
    products.find((p) => p.slug === "twin-hearts-knot")!,
    products.find((p) => p.slug === "ngan-hoa-baguette-bloom")!,
    products.find((p) => p.slug === "pure-soul-pink-heart-halo")!,
  ];
  return (
    <section className="max-w-7xl mx-auto px-6 mt-12">
      <h2 className="t-h-main text-center text-brand tracking-wide">SẢN PHẨM MỚI</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
        {newProducts.map((p) => <ProductCard key={p.name} {...p} />)}
      </div>
      <div className="flex justify-center mt-8">
        <Link
          to="/bo-suu-tap"
          hash="graceful-muse"
          className="border border-brand text-brand px-8 py-2 rounded-sm text-sm font-semibold tracking-wide hover:bg-brand hover:text-brand-foreground transition"
        >
          XEM NGAY
        </Link>
      </div>

    </section>
  );
}

function Collection() {
  return (
    <section className="max-w-7xl mx-auto px-6 mt-14">
      <h2 className="t-h-main text-center text-brand tracking-wide">BỘ SƯU TẬP</h2>
      <div className="grid grid-cols-3 gap-5 mt-8">
        <div className="aspect-[4/3] bg-muted rounded-sm overflow-hidden">
          <img src={collection1} alt="Quà tặng ngày kỷ niệm tình yêu" loading="lazy" className="w-full h-full object-contain" />
        </div>
        <div className="aspect-[4/3] bg-muted rounded-sm overflow-hidden">
          <img src={collection2} alt="Trang sức cặp đôi" loading="lazy" className="w-full h-full object-contain" />
        </div>
        <div className="aspect-[4/3] bg-muted rounded-sm overflow-hidden">
          <img src={collection3} alt="Quà tặng sinh nhật bạn gái" loading="lazy" className="w-full h-full object-contain" />
        </div>
      </div>
    </section>
  );
}

function BrandMission() {
  const [idx, setIdx] = useState(0);
  const pageSize = 2;
  const totalPages = Math.ceil(products.length / pageSize);
  const safeIdx = ((idx % totalPages) + totalPages) % totalPages;
  const start = safeIdx * pageSize;
  const visible = products.slice(start, start + pageSize);
  return (
    <section className="max-w-7xl mx-auto px-6 mt-14">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="relative rounded-md overflow-hidden" style={{ minHeight: "520px" }}>
          <img src={brandMission} alt="Sứ mệnh thương hiệu" loading="lazy" width={1024} height={1280}
            className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <h3 className="t-mission">SỨ MỆNH<br />THƯƠNG HIỆU</h3>
            <p className="text-sm mt-3 text-white/90 max-w-xs">
              Luna Jewel mang đến những món trang sức tinh tế, phù hợp với bản thân thông qua trải nghiệm cá nhân hóa bằng AI.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-start">
          <h3 className="t-h-main text-brand">SỨ MỆNH THƯƠNG HIỆU</h3>
          <p className="text-sm text-brand mt-3 max-w-md">
            Giúp giới trẻ dễ dàng tìm được món trang sức phù hợp với bản thân thông qua trải nghiệm cá nhân hóa bằng AI, từ đó tự tin thể hiện phong cách riêng mỗi ngày.
          </p>
          <div className="mt-6 relative">
            <div className="grid grid-cols-2 gap-4">
              {visible.map((p) => <ProductCard key={p.name} {...p} />)}
            </div>
            <button onClick={() => setIdx((i) => i - 1)} aria-label="Sản phẩm trước"
              className="absolute -left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-brand">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => setIdx((i) => i + 1)} aria-label="Sản phẩm kế tiếp"
              className="absolute -right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow flex items-center justify-center text-brand">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Index() {
  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <NavBar />
      <Hero />
      <Benefits />
      <NewProducts />
      <Collection />
      <BrandMission />
      <Footer />
    </div>
  );
}
