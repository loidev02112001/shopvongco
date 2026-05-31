import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Truck, RotateCcw, ShieldCheck, Gift, ChevronLeft, ChevronRight,
} from "lucide-react";
import { TopBar, NavBar, ProductCard, ProductCardSkeleton, Footer } from "@/components/SiteChrome";
import brandMission from "@/assets/brand-mission.jpg";
import collection1 from "@/assets/collection-1.png";
import collection2 from "@/assets/collection-2.png";
import collection3 from "@/assets/collection-3.png";
import heroAr from "@/assets/hero-ar.png";
import { products } from "@/data/products";
import { useStore } from "@/lib/store";


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
  const { slides = [] } = useStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-play slides every 5 seconds
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length, isHovered]);

  if (slides.length === 0) {
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

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIdx((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIdx((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section 
      className="relative w-full overflow-hidden aspect-[21/9] sm:aspect-[3/1] bg-[#07090e]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides container */}
      <div className="w-full h-full relative">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIdx;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {/* Slide Image */}
              <img
                src={slide.image}
                alt={slide.title || "Luna Jewel slide banner"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = heroAr;
                }}
              />
              
              {/* Editorial Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center px-8 md:px-20">
                <div className="max-w-xl text-left text-white space-y-3 md:space-y-4">
                  {slide.title && (
                    <span 
                      className={`inline-block text-[9px] md:text-xs font-extrabold uppercase tracking-[0.25em] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full transform transition-all duration-700 delay-100 ${
                        isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                      }`}
                    >
                      {slide.title}
                    </span>
                  )}
                  
                  {slide.subtitle && (
                    <h2 
                      className={`text-xl sm:text-2xl md:text-4xl lg:text-5xl font-light tracking-wide leading-tight text-white transform transition-all duration-700 delay-300 ${
                        isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                      }`}
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {slide.subtitle}
                    </h2>
                  )}

                  {slide.link && (
                    <div 
                      className={`pt-2 md:pt-4 transform transition-all duration-700 delay-500 ${
                        isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                      }`}
                    >
                      <Link
                        to={slide.link}
                        className="inline-block border border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black px-6 py-2.5 rounded-sm text-xs font-bold tracking-widest transition duration-300 uppercase shadow-lg shadow-amber-500/5 hover:shadow-amber-500/20"
                      >
                        XEM NGAY
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Slide trước"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 border border-white/10 hover:border-amber-500 hover:bg-amber-500 hover:text-black flex items-center justify-center text-white transition duration-300 cursor-pointer shadow-lg hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Slide tiếp theo"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 border border-white/10 hover:border-amber-500 hover:bg-amber-500 hover:text-black flex items-center justify-center text-white transition duration-300 cursor-pointer shadow-lg hover:scale-105"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              aria-label={`Đi tới slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                idx === currentIdx 
                  ? "w-8 bg-amber-500" 
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
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
  const { isProductsLoaded } = useStore();
  const newProducts = products.slice(0, 4);
  return (
    <section className="max-w-7xl mx-auto px-6 mt-12">
      <h2 className="t-h-main text-center text-brand tracking-wide">SẢN PHẨM MỚI</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
        {!isProductsLoaded
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : newProducts.map((p) => p && <ProductCard key={p.slug} {...p} />)}
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
  const { isProductsLoaded } = useStore();
  const [idx, setIdx] = useState(0);
  const pageSize = 2;
  const totalPages = Math.ceil(products.length / pageSize) || 1;
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
              {!isProductsLoaded
                ? Array.from({ length: 2 }).map((_, i) => <ProductCardSkeleton key={i} />)
                : visible.map((p) => <ProductCard key={p.name} {...p} />)}
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
