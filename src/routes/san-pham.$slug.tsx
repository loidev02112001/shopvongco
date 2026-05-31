import { createFileRoute, notFound, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { 
  Heart, Plus, Minus, MessageCircle, Truck, 
  RotateCcw, ShieldCheck, Gift, Camera, Star, User as UserIcon
} from "lucide-react";
import { TopBar, NavBar, ProductCard, Footer } from "@/components/SiteChrome";
import { getProduct, products } from "@/data/products";
import { storeActions, useStore } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import brandMission from "@/assets/brand-mission.jpg";
import { toast } from "sonner";
import { formatProductPrice } from "@/lib/utils";

export const Route = createFileRoute("/san-pham/$slug")({
  loader: async ({ params }) => {
    let product = getProduct(params.slug);
    
    // Nếu chưa có sản phẩm cục bộ (đang load chậm), hãy truy vấn trực tiếp từ database online
    if (!product && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("slug", params.slug)
          .maybeSingle();
        
        if (data && !error) {
          let specsObj = data.specs;
          if (typeof specsObj === "string") {
            try {
              specsObj = JSON.parse(specsObj);
            } catch (e) {
              console.error("Failed to parse specs JSON string:", e);
            }
          }
          product = {
            slug: data.slug,
            img: data.img,
            name: data.name,
            shortName: data.short_name,
            price: data.price !== null && data.price !== undefined ? String(data.price) : "",
            description: data.description,
            specs: specsObj,
            info: data.info,
            collectionId: data.collection_id || undefined,
            images: Array.isArray(data.images) ? data.images : [],
          };
          
          // Lưu vào mảng cục bộ
          if (!products.some(p => p.slug === product!.slug)) {
            products.push(product);
          }
        }
      } catch (err) {
        console.error("Lỗi khi load sản phẩm trực tiếp từ database online:", err);
      }
    }
    
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product.name ?? "Sản phẩm"} — Luna Jewel` },
      { name: "description", content: loaderData?.product.description ?? "" },
    ],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-3xl text-brand">Không tìm thấy sản phẩm</h1>
        <Link to="/bo-suu-tap" className="mt-4 inline-block text-brand underline">← Quay lại Bộ Sưu Tập</Link>
      </div>
    </div>
  ),
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const sizeSpecs = product.specs?.["Độ dài dây"] || product.specs?.["Kích thước"] || "40cm + 5cm";
  const sizeOptions = useMemo(() => {
    return typeof sizeSpecs === "string" 
      ? sizeSpecs.split(/[,|;]/).map(s => s.trim()).filter(Boolean)
      : ["40cm + 5cm"];
  }, [sizeSpecs]);

  const [selectedSize, setSelectedSize] = useState(() => sizeOptions[0] || "40cm + 5cm");

  useEffect(() => {
    if (sizeOptions.length > 0) {
      setSelectedSize(sizeOptions[0]);
    }
  }, [sizeOptions]);
  
  // Custom Product Gallery cho từng sản phẩm
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    setActiveImgIndex(0);
  }, [product.slug]);

  const productImages = useMemo(() => {
    const list = [product.img];
    
    // Nạp các hình ảnh phụ tùy chỉnh được thiết lập bởi Admin
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((imgUrl) => {
        if (imgUrl && !list.includes(imgUrl)) {
          list.push(imgUrl);
        }
      });
    }
    
    return list;
  }, [product]);

  const activeImg = productImages[activeImgIndex] || product.img;

  // Store & Reviews integration
  const { reviews, currentUser, wishlist } = useStore();
  const isLiked = wishlist.includes(product.slug);

  useEffect(() => {
    storeActions.fetchReviews();
  }, [product.slug]);

  const productReviews = useMemo(() => {
    return reviews.filter((r) => r.productSlug === product.slug && !r.isHidden);
  }, [reviews, product.slug]);

  const avgRating = useMemo(() => {
    if (productReviews.length === 0) return 5.0;
    const sum = productReviews.reduce((s, r) => s + r.rating, 0);
    return parseFloat((sum / productReviews.length).toFixed(1));
  }, [productReviews]);

  // Review Form States
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để viết đánh giá!");
      return;
    }
    if (!userComment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    storeActions.addReview(product.slug, userRating, userComment);
    toast.success("Cảm ơn bạn đã gửi đánh giá thành công!");
    setUserComment("");
    setUserRating(5);
  };

  const featured = products.filter(p => p.slug !== product.slug).slice(0, 4);

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <NavBar />

      {/* Top: details */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
          
          {/* Left: Info details */}
          <div className="order-2 md:order-1 flex flex-col justify-between">
            <div>
              <h1 className="text-foreground font-bold leading-tight font-display tracking-wide" style={{fontSize: "clamp(22px, 3vw, 32px)", lineHeight: "1.25"}}>
                {product.shortName}
              </h1>

              {/* Rating Summary */}
              <div className="flex items-center gap-2 mt-3.5 pb-4 border-b border-brand/5">
                <div className="flex text-amber-400">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-brand">{avgRating} / 5.0</span>
                <span className="text-xs text-muted-foreground">({productReviews.length} đánh giá)</span>
                <span className="mx-2 text-brand/20">|</span>
                <span className="text-xs text-brand bg-brand-soft/50 px-2 py-0.5 rounded font-semibold">Bạc 925 Chuẩn</span>
              </div>

              {/* Price */}
              <p className="mt-5 font-extrabold text-price font-sans" style={{fontSize: "clamp(26px, 3.5vw, 38px)"}}>{formatProductPrice(product.price)}</p>

              {/* Variant Selector (Độ dài dây) */}
              {sizeOptions.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Độ dài dây (Biến thể):</span>
                    <span className="text-xs text-brand font-bold bg-brand-soft/75 px-2.5 py-0.5 rounded border border-brand/10">
                      {selectedSize}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedSize(opt)}
                        className={`px-4.5 py-2.5 rounded-xl text-xs font-bold border transition-all duration-300 cursor-pointer active:scale-95 flex items-center justify-center ${
                          selectedSize === opt
                            ? "bg-brand text-brand-foreground border-brand shadow-md shadow-brand/10 ring-2 ring-brand-soft/80"
                            : "bg-white text-gray-700 border-gray-200 hover:border-brand/40 hover:text-brand hover:bg-brand-soft/10"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-6 border border-gray-200 rounded bg-white px-4 py-3 flex items-center w-full max-w-lg shadow-xs">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider whitespace-nowrap">Số Lượng:</span>
                <div className="flex items-center gap-5 flex-1 justify-center">
                  <button 
                    onClick={() => setQty(Math.max(1, qty - 1))} 
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-500 hover:text-brand hover:border-brand/40 transition-colors"
                  >
                    −
                  </button>
                  <span className="min-w-[32px] text-center font-bold text-base text-foreground">{qty}</span>
                  <button 
                    onClick={() => setQty(qty + 1)} 
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-lg font-bold text-gray-500 hover:text-brand hover:border-brand/40 transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-brand font-bold uppercase tracking-wider">Còn Hàng</span>
              </div>
            </div>

            {/* Buy and Add to Cart Buttons */}
            <div className="mt-6">
              <div className="flex items-stretch gap-3 max-w-lg">
                <button
                  onClick={() => {
                    storeActions.addToCart(product.slug, qty, selectedSize);
                    navigate({ to: "/gio-hang" });
                  }}
                  className="flex-1 bg-price text-white rounded-xl py-4.5 px-4 hover:opacity-95 shadow-md active:scale-[0.99] transition-all text-center flex flex-col justify-center items-center"
                >
                  <div className="font-bold tracking-widest text-lg md:text-xl">MUA NGAY</div>
                  <div className="text-[10px] opacity-90 mt-1 uppercase tracking-wider font-semibold">Giao nhanh tận nơi hoặc nhận tại cửa hàng</div>
                </button>
                <button
                  onClick={() => {
                    storeActions.addToCart(product.slug, qty, selectedSize);
                    toast.success("Đã thêm sản phẩm vào giỏ hàng!", {
                      description: `${product.name} - Size: ${selectedSize}`,
                      action: {
                        label: "Xem giỏ hàng",
                        onClick: () => navigate({ to: "/gio-hang" })
                      }
                    });
                  }}
                  className="border border-brand/50 rounded-xl px-4.5 flex flex-col items-center justify-center text-brand text-[10px] font-bold hover:bg-brand-soft/70 hover:border-brand transition min-w-[75px]"
                >
                  <Gift className="w-5 h-5 mb-1" />
                  THÊM VÀO
                </button>
              </div>

              {/* Support Button */}
              <button
                onClick={() => navigate({ to: "/ho-tro" })}
                className="mt-3 w-full max-w-lg bg-brand text-brand-foreground rounded-lg py-4 font-bold flex items-center justify-center gap-2 hover:bg-brand/90 transition shadow-sm"
                style={{fontSize: "clamp(15px, 1.8vw, 19px)"}}
              >
                <MessageCircle className="w-5 h-5" />
                CHAT TƯ VẤN NGAY (8h - 22h)
              </button>
            </div>
          </div>

          {/* Right: image gallery */}
          <div className="order-1 md:order-2">
            <div className="relative rounded-lg overflow-hidden bg-white border border-gray-100 shadow-sm group">
              <img src={activeImg} alt={product.name} className="w-full aspect-square object-cover" />
              
              {/* Like Button */}
              <button 
                onClick={() => storeActions.toggleWishlist(product.slug)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-brand hover:bg-white shadow-md active:scale-95 transition-transform"
                aria-label={isLiked ? "Bỏ yêu thích" : "Yêu thích"}
              >
                <Heart className={`w-5.5 h-5.5 ${isLiked ? "fill-brand text-brand" : "text-brand"}`} />
              </button>

              {/* Dynamic Camera Try-On button */}
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    localStorage.setItem("last-tryon-slug", product.slug);
                  }
                  navigate({
                    to: "/thu-vong-co",
                    search: { slug: product.slug, img: activeImg },
                  });
                }}
                className="absolute bottom-0 left-0 right-0 bg-brand/85 text-brand-foreground text-sm font-bold text-center py-3.5 tracking-[0.2em] hover:bg-brand transition-colors w-full flex items-center justify-center gap-2 backdrop-blur-xs"
              >
                <Camera className="w-4.5 h-4.5" /> THỬ VÒNG CỔ LIVE AR
              </button>
            </div>

            {/* Thumbnail grid */}
            <div className="grid grid-cols-4 gap-2.5 mt-3.5">
              {productImages.map((imgUrl, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImgIndex(i)}
                  className={`aspect-square rounded-md overflow-hidden border-2 transition-all duration-200 ${
                    activeImgIndex === i 
                      ? "border-brand ring-2 ring-brand-soft shadow-xs" 
                      : "border-gray-200 hover:border-brand/40"
                  }`}
                >
                  <img src={imgUrl} alt={`${product.name} - thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Description + specs */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        <h2 className="font-display text-2xl text-brand font-bold border-b border-brand/20 pb-3">MÔ TẢ SẢN PHẨM</h2>

        <div className="mt-6 border border-border rounded-lg overflow-hidden bg-white shadow-xs">
          <div className="bg-brand-soft/40 border-b border-border px-5 py-3.5 font-bold text-xs uppercase tracking-wider text-brand">THÔNG SỐ THIẾT KẾ</div>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(product.specs).map(([k, v]) => (
                <tr key={k} className="border-t border-border first:border-t-0">
                  <td className="px-5 py-3 w-56 font-semibold text-foreground/80 bg-muted/20 text-xs md:text-sm">{k}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs md:text-sm">{v as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="font-display text-lg font-bold mt-10 text-brand uppercase tracking-wide">{product.info}</h3>
        <p className="mt-4 text-sm leading-relaxed text-foreground/80 whitespace-pre-line bg-brand-soft/10 p-5 rounded-lg border border-brand/5">{product.description}</p>

        <h3 className="font-display text-lg font-bold mt-10 text-brand uppercase tracking-wide">CAM KẾT KHI MUA HÀNG TẠI LUNA JEWEL</h3>
        <ul className="mt-4 space-y-2 text-sm text-foreground/80 pl-2">
          <li className="flex items-start gap-2">
            <span className="text-brand font-bold">➤</span>
            <span>Chất liệu 100% BẠC Ý 925 chuẩn định lượng, công nghệ đánh bóng gương hiện đại, đạt tiêu chuẩn quốc tế, cho sản phẩm sáng bóng</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand font-bold">➤</span>
            <span>Đội ngũ lành nghề, tỉ mỉ với sản phẩm trong từng tạo tác, mang tới sản phẩm có độ hoàn thiện tinh tế</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand font-bold">➤</span>
            <span>Chế độ BẢO HÀNH trọn đời</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand font-bold">➤</span>
            <span>Hỗ trợ khách hàng ĐỔI TRẢ trong vòng 30 ngày kể từ khi nhận hàng nếu lỗi do nhà sản xuất (đứt gãy, rớt đá, không giống ảnh, sai sản phẩm)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand font-bold">➤</span>
            <span>Giao hàng tận nơi TOÀN QUỐC</span>
          </li>
        </ul>

        <h3 className="font-display text-lg font-bold mt-12 text-brand text-center uppercase tracking-wider">TẠI SAO LỰA CHỌN TRANG SỨC BẠC LUNA JEWEL</h3>
        <p className="mt-3 text-sm text-foreground/70 text-center max-w-2xl mx-auto leading-relaxed">
          Là thương hiệu hàng đầu trong lĩnh vực trang sức bạc, Luna Jewel mang tới các sản phẩm thiết kế đẹp mắt, chất lượng tốt nhất và phù hợp cho từng yêu cầu của khách hàng.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { icon: Truck, title: "MIỄN PHÍ vận chuyển", sub: "Đơn Hàng từ 950.000 VNĐ" },
            { icon: RotateCcw, title: "Đổi trả MIỄN PHÍ", sub: "Trong vòng 30 NGÀY" },
            { icon: ShieldCheck, title: "Dịch vụ BẢO HÀNH", sub: "Làm mới TRỌN ĐỜI" },
            { icon: Gift, title: "Túi & hộp TRANG NHÃ", sub: "Sẵn sàng TRAO TẶNG" },
          ].map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3 rounded-xl px-4 py-4 bg-brand text-brand-foreground shadow-xs">
              <Icon className="w-8 h-8 shrink-0" strokeWidth={1.5} />
              <div>
                <div className="text-xs font-bold leading-tight">{title}</div>
                <div className="text-[10px] opacity-90 mt-1">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="t-h-main text-center text-brand mt-14 uppercase">TÚI HỘP QUÀ TẶNG TRANG NHÃ</h3>
        <p className="text-xs md:text-sm text-center text-foreground/70 mt-2 max-w-xl mx-auto leading-relaxed">
          Set đóng gói bao gồm: túi, hộp đựng cao cấp; Thẻ bảo hành; Thiệp chúc mừng;<br />
          Quà tặng nước rửa bạc, khăn lau bạc chuyên dụng.
        </p>
        <div className="mt-6 rounded-lg overflow-hidden border border-brand/5 shadow-xs">
          <img src={brandMission} alt="Quà tặng" className="w-full max-h-[450px] object-cover" />
        </div>

        {/* ======================= REVIEWS SECTION (UC05) ======================= */}
        <section className="mt-16 border-t border-brand/10 pt-14">
          <h2 className="font-display text-2xl text-brand font-bold uppercase tracking-wider mb-6">Đánh giá sản phẩm</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Overall stats */}
            <div className="bg-brand-soft/20 border border-brand/10 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-xs">
              <span className="text-5xl font-black text-brand font-sans leading-none">{avgRating}</span>
              <span className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-bold">trên 5.0 sao</span>
              <div className="flex text-amber-400 mt-3.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground mt-4 font-semibold">({productReviews.length} nhận xét từ khách hàng)</span>
            </div>

            {/* Right: Review List and Form */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Review Form */}
              <div className="bg-white border border-brand/15 rounded-xl p-5 shadow-xs">
                <h3 className="text-sm font-bold text-brand uppercase tracking-wider pb-3 border-b border-brand/5 mb-4">Gửi đánh giá của bạn</h3>
                
                {currentUser ? (
                  <form onSubmit={handleAddReview} className="space-y-4">
                    {/* Star Selector */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-foreground/80 uppercase">Đánh giá:</span>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setUserRating(i + 1)}
                            className="text-amber-400 hover:scale-110 active:scale-95 transition-transform"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                i < userRating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-brand">({userRating} sao)</span>
                    </div>

                    {/* Text area */}
                    <div className="flex flex-col gap-1.5">
                      <textarea
                        value={userComment}
                        onChange={(e) => setUserComment(e.target.value)}
                        placeholder="Hãy chia sẻ cảm nhận thực tế của bạn về sản phẩm này (chất liệu bạc, kiểu dáng, cách đóng gói...)..."
                        className="w-full min-h-[90px] text-sm p-3.5 border border-brand/20 rounded-lg outline-none focus:border-brand transition-colors bg-brand-soft/10 text-foreground"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-brand text-brand-foreground px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-brand/90 transition-colors shadow-xs active:scale-[0.98]"
                    >
                      Gửi đánh giá
                    </button>
                  </form>
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-sm text-muted-foreground mb-3">Bạn cần đăng nhập để gửi nhận xét về sản phẩm.</p>
                    <Link
                      to="/tai-khoan"
                      className="inline-block bg-brand/10 border border-brand/20 text-brand px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-brand hover:text-brand-foreground transition-all duration-200"
                    >
                      Đăng nhập ngay
                    </Link>
                  </div>
                )}
              </div>

              {/* Review List */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-brand uppercase tracking-wider pb-2 border-b border-brand/5">Khách hàng nhận xét ({productReviews.length})</h3>
                
                {productReviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center italic">Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên nhận xét!</p>
                ) : (
                  productReviews.map((rev) => (
                    <div key={rev.id} className="bg-brand-soft/10 border border-brand/5 rounded-xl p-4.5 flex gap-4 items-start shadow-2xs">
                      {rev.userAvatar ? (
                        <img src={rev.userAvatar} alt="" className="w-10 h-10 rounded-full object-cover border border-brand/20" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-brand/25 text-brand flex items-center justify-center font-bold text-sm shrink-0">
                          <UserIcon className="w-5 h-5" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <span className="font-bold text-xs text-foreground/90">{rev.userName}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">{rev.date}</span>
                        </div>

                        {/* Stars */}
                        <div className="flex text-amber-400 mt-1">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Comment text */}
                        <p className="mt-2.5 text-xs md:text-sm text-foreground/80 leading-relaxed font-medium">
                          {rev.comment}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </section>

      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-6 mt-16">
        <h2 className="t-h-main text-center text-brand tracking-wide uppercase">SẢN PHẨM KHÁC TỪ LUNA JEWEL</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
          {featured.map((p) => (
            <ProductCard key={p.slug} slug={p.slug} img={p.img} name={p.name} price={p.price} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
