import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Plus, Minus, X, Heart, ChevronLeft, MapPin, Check } from "lucide-react";
import { TopBar, NavBar, Footer } from "@/components/SiteChrome";
import { getProduct } from "@/data/products";
import { storeActions, useStore } from "@/lib/store";
import { toast } from "sonner";

type CheckoutSearch = { slug?: string; qty?: number; size?: string };

export const Route = createFileRoute("/thanh-toan")({
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => ({
    slug: typeof search.slug === "string" ? search.slug : undefined,
    qty:
      typeof search.qty === "number"
        ? search.qty
        : search.qty
          ? Number(search.qty)
          : undefined,
    size: typeof search.size === "string" ? search.size : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Thanh Toán — Luna Jewel" },
      { name: "description", content: "Hoàn tất đơn hàng tại Luna Jewel" },
    ],
  }),
  component: CheckoutPage,
});

const parsePrice = (p: string) => parseInt(p.replace(/[^\d]/g, ""), 10) || 0;
const formatPrice = (n: number) => n.toLocaleString("vi-VN") + "VNĐ";

const PROVINCES: Record<string, string[]> = {
  "Hà Nội": ["Ba Đình", "Hoàn Kiếm", "Cầu Giấy", "Đống Đa", "Thạch Thất"],
  "Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 7", "Bình Thạnh", "Thủ Đức"],
  "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn"],
  "Hải Phòng": ["Hồng Bàng", "Lê Chân", "Ngô Quyền"],
};

function CheckoutPage() {
  const { currentUser, cart } = useStore();
  const navigate = useNavigate();
  const { slug, qty: initQty, size } = Route.useSearch();
  const product = slug ? getProduct(slug) : undefined;
  const [qty, setQty] = useState(initQty ?? 1);
  const [removed, setRemoved] = useState(false);

  const savedAddresses = currentUser?.addresses || [];
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");

  const [form, setForm] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    province: "",
    district: "",
    note: "",
    save: false,
  });

  // Tự động điền địa chỉ mặc định lần đầu khi load hoặc khi currentUser thay đổi
  useEffect(() => {
    if (currentUser) {
      const addr = currentUser.addresses?.find((a) => a.isDefault) || currentUser.addresses?.[0];
      if (addr) {
        setSelectedAddressId(addr.id);
        setForm((prev) => ({
          ...prev,
          email: currentUser.email,
          name: addr.recipientName,
          phone: addr.phone,
          address: `${addr.street}, ${addr.ward}`,
          province: addr.province,
          district: addr.district,
        }));
      } else {
        setSelectedAddressId("new");
        setForm((prev) => ({
          ...prev,
          email: currentUser.email,
          name: currentUser.fullName,
          phone: currentUser.phone || "",
        }));
      }
    }
  }, [currentUser]);

  const [provinceOpts] = useState(Object.keys(PROVINCES));
  const districtOpts = form.province ? PROVINCES[form.province] || [] : [];

  // Tính toán danh sách các sản phẩm cần thanh toán (Buy Now hoặc cả Giỏ hàng)
  const checkoutItems = useMemo(() => {
    if (product && !removed) {
      return [{
        slug: product.slug,
        img: product.img,
        name: product.name,
        shortName: product.shortName,
        price: product.price,
        qty: qty,
        size: size ?? "40cm + 5cm",
      }];
    }
    if (slug) return []; // Nếu có slug nhưng đã removed thì giỏ hàng trống

    return cart.map((item) => {
      const p = getProduct(item.slug);
      return {
        slug: item.slug,
        img: p?.img || "",
        name: p?.name || "",
        shortName: p?.shortName || "",
        price: p?.price || "0VNĐ",
        qty: item.qty,
        size: item.size,
      };
    });
  }, [product, qty, size, removed, cart, slug]);

  const total = useMemo(() => {
    return checkoutItems.reduce((acc, item) => acc + parsePrice(item.price) * item.qty, 0);
  }, [checkoutItems]);

  const handleSelectAddress = (id: string) => {
    setSelectedAddressId(id);
    if (id === "new") {
      setForm((prev) => ({
        ...prev,
        name: currentUser?.fullName || "",
        phone: currentUser?.phone || "",
        address: "",
        province: "",
        district: "",
      }));
    } else {
      const addr = savedAddresses.find((a) => a.id === id);
      if (addr) {
        setForm((prev) => ({
          ...prev,
          name: addr.recipientName,
          phone: addr.phone,
          address: `${addr.street}, ${addr.ward}`,
          province: addr.province,
          district: addr.district,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutItems.length === 0) {
      toast.error("Giỏ hàng trống.");
      return;
    }
    if (!form.name || !form.phone || !form.address || !form.province || !form.district) {
      toast.error("Vui lòng điền đầy đủ thông tin mua hàng.");
      return;
    }

    // Tự động lưu địa chỉ mới nếu người dùng tick chọn "Lưu thông tin giao hàng" và đang chọn địa chỉ mới
    if (form.save && currentUser && selectedAddressId === "new") {
      const parts = form.address.split(",");
      const streetPart = parts[0]?.trim() || form.address;
      const wardPart = parts[1]?.trim() || "Phường/Xã";

      storeActions.addShippingAddress({
        recipientName: form.name.trim(),
        phone: form.phone.trim(),
        province: form.province,
        district: form.district,
        ward: wardPart,
        street: streetPart,
        isDefault: savedAddresses.length === 0,
      });
      toast.success("Đã tự động lưu địa chỉ mới vào Sổ địa chỉ! 📍");
    }

    // Gửi đơn hàng lên Supabase Cloud / Local Fallback
    const res = await storeActions.placeOrder({
      recipientName: form.name.trim(),
      phone: form.phone.trim(),
      address: `${form.address}, ${form.district}, ${form.province}`,
      items: checkoutItems,
      totalAmount: total,
    });

    if (res.ok) {
      toast.success("Đặt hàng thành công! 🎉", {
        description: `Mã đơn hàng: ${res.orderId}. Đơn hàng của bạn (${formatPrice(total)}) đang được xử lý.`,
        duration: 6000,
      });

      // Nếu mua hàng từ giỏ hàng, xóa sạch giỏ hàng sau khi đặt thành công
      if (!slug) {
        storeActions.clearCart();
      }

      // Điều hướng về trang quản lý đơn hàng (UC16)
      navigate({ to: "/don-hang" });
    } else {
      toast.error("Đặt hàng thất bại", { description: res.error });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <NavBar />

      <section className="max-w-7xl mx-auto px-6 pt-8 animate-fadeIn">
        {/* Cart summary */}
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-brand/40 pb-3 text-sm font-semibold text-brand">
          <div>THÔNG TIN SẢN PHẨM</div>
          <div className="text-center">GIÁ</div>
          <div className="text-center">SỐ LƯỢNG</div>
          <div className="text-center">THÀNH TIỀN</div>
          <div className="w-16" />
        </div>

        {checkoutItems.length > 0 ? (
          checkoutItems.map((item) => (
            <div key={`${item.slug}-${item.size}`} className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center py-5 border-b border-brand/20">
              <div className="flex items-center gap-4">
                <Link to="/san-pham/$slug" params={{ slug: item.slug }} className="shrink-0">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-md bg-white border border-brand/10"
                  />
                </Link>
                <div className="flex flex-col min-w-0">
                  <Link
                    to="/san-pham/$slug"
                    params={{ slug: item.slug }}
                    className="text-xs font-semibold text-brand hover:opacity-80 leading-snug truncate"
                  >
                    {item.shortName}
                  </Link>
                  <span className="text-[10px] text-brand/80 mt-1.5 bg-brand-soft/60 px-2.5 py-0.5 rounded self-start font-bold border border-brand/10">
                    Kích thước: {item.size}
                  </span>
                </div>
              </div>
              <div className="text-center text-sm text-brand font-semibold">
                {formatPrice(parsePrice(item.price))}
              </div>
              
              {slug ? (
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="w-7 h-7 rounded-full border border-brand/40 flex items-center justify-center text-brand hover:bg-brand-soft"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center font-semibold">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="w-7 h-7 rounded-full border border-brand/40 flex items-center justify-center text-brand hover:bg-brand-soft"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="text-center text-sm font-semibold text-brand">
                  x{item.qty}
                </div>
              )}

              <div className="text-center text-sm font-semibold text-brand">
                {formatPrice(parsePrice(item.price) * item.qty)}
              </div>
              
              <div className="flex items-center gap-2 justify-end pr-2">
                {slug && (
                  <button
                    onClick={() => setRemoved(true)}
                    className="text-price hover:opacity-70 ml-auto"
                    aria-label="Xóa"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-muted-foreground">
            Giỏ hàng trống.{" "}
            <Link to="/gio-hang" className="text-brand underline">
              Quay về giỏ hàng
            </Link>
          </div>
        )}

        {/* Continue / Total */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
          <Link
            to="/gio-hang"
            search={slug ? { slug, qty, size } : {}}
            className="text-sm text-brand font-semibold flex items-center gap-1 hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> QUAY VỀ GIỎ HÀNG
          </Link>
          <div className="text-right">
            <div className="text-sm">
              <span className="text-brand">Phí vận chuyển: Miễn phí</span>
            </div>
            <div className="text-lg mt-1">
              <span className="font-semibold text-brand">TỔNG TIỀN:</span>
              <span className="text-price text-2xl font-bold ml-3">{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        {/* Checkout form */}
        <h2 className="t-h-main text-center text-brand tracking-wide mt-12 uppercase">
          THÔNG TIN MUA HÀNG
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 max-w-3xl mx-auto space-y-5 bg-brand-soft/20 border border-brand/10 p-6 md:p-8 rounded-xl shadow-xs">
          
          {/* Saved Addresses Section (UC11 Selection) */}
          {currentUser && savedAddresses.length > 0 && (
            <div className="space-y-3 pb-5 border-b border-brand/15">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-brand block">
                📍 Chọn địa chỉ nhận hàng đã lưu:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleSelectAddress(addr.id)}
                    className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer bg-white relative hover:border-brand/40
                      ${
                        selectedAddressId === addr.id
                          ? "border-brand ring-2 ring-brand/15 shadow-xs"
                          : "border-brand/15 shadow-2xs"
                      }`}
                  >
                    {selectedAddressId === addr.id && (
                      <span className="absolute top-3 right-3 text-brand">
                        <Check className="w-4 h-4 stroke-[3px]" />
                      </span>
                    )}
                    <div className="font-bold text-xs uppercase text-foreground pr-6 truncate">
                      {addr.recipientName}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-bold mt-1">
                      📞 {addr.phone}
                    </div>
                    <div className="text-xs text-foreground/75 mt-2 leading-relaxed line-clamp-2">
                      {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                    </div>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => handleSelectAddress("new")}
                  className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer bg-white flex flex-col justify-center items-center gap-1.5 hover:border-brand/50
                    ${
                      selectedAddressId === "new"
                        ? "border-brand ring-2 ring-brand/15 bg-brand-soft/10 text-brand"
                        : "border-dashed border-brand/35 text-brand/75 bg-brand-soft/5"
                    }`}
                >
                  <Plus className="w-5 h-5 text-brand stroke-[2.5px]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Sử dụng địa chỉ khác
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4 pt-2">
            <input
              type="email"
              placeholder="Email (tùy chọn)"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white border border-brand/30 rounded-md px-4 py-3 text-sm outline-none focus:border-brand transition-colors text-black placeholder-gray-500"
            />
            
            <input
              type="text"
              placeholder="Họ và tên"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              disabled={selectedAddressId !== "new"}
              className="w-full bg-white border border-brand/30 rounded-md px-4 py-3 text-sm outline-none focus:border-brand transition-colors text-black placeholder-gray-500 disabled:opacity-75 disabled:bg-muted/40 disabled:cursor-not-allowed"
              required
            />
            
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              disabled={selectedAddressId !== "new"}
              className="w-full bg-white border border-brand/30 rounded-md px-4 py-3 text-sm outline-none focus:border-brand transition-colors text-black placeholder-gray-500 disabled:opacity-75 disabled:bg-muted/40 disabled:cursor-not-allowed"
              required
            />
            
            <input
              type="text"
              placeholder="Địa chỉ giao hàng (Số nhà, tên đường, phường/xã)"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              disabled={selectedAddressId !== "new"}
              className="w-full bg-white border border-brand/30 rounded-md px-4 py-3 text-sm outline-none focus:border-brand transition-colors text-black placeholder-gray-500 disabled:opacity-75 disabled:bg-muted/40 disabled:cursor-not-allowed"
              required
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value, district: "" })}
                disabled={selectedAddressId !== "new"}
                className="w-full bg-white border border-brand/30 rounded-md px-4 py-3 text-sm outline-none focus:border-brand transition-colors text-black disabled:opacity-75 disabled:bg-muted/40 disabled:cursor-not-allowed"
                required
              >
                <option value="">Tỉnh Thành</option>
                {provinceOpts.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                disabled={!form.province || selectedAddressId !== "new"}
                className="w-full bg-white border border-brand/30 rounded-md px-4 py-3 text-sm outline-none focus:border-brand transition-colors text-black disabled:opacity-60 disabled:cursor-not-allowed"
                required
              >
                <option value="">Quận Huyện</option>
                {districtOpts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            
            <textarea
              placeholder="Ghi chú thêm về đơn hàng (ví dụ: giao giờ hành chính)..."
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={3}
              className="w-full bg-white border border-brand/30 rounded-md px-4 py-3 text-sm outline-none focus:border-brand transition-colors resize-none text-black placeholder-gray-500"
            />
          </div>

          <div className="text-center pt-4">
            <button
              type="submit"
              className="bg-price text-white rounded-md px-14 py-3.5 text-sm font-bold tracking-widest hover:opacity-95 shadow-md active:scale-[0.99] transition-all cursor-pointer"
            >
              THANH TOÁN KHI NHẬN HÀNG (COD)
            </button>
          </div>

          {currentUser && selectedAddressId === "new" && (
            <label className="flex items-center gap-2 text-xs font-semibold text-brand/85 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.save}
                onChange={(e) => setForm({ ...form, save: e.target.checked })}
                className="w-4 h-4 accent-brand rounded border-brand/35 cursor-pointer"
              />
              Lưu thông tin giao hàng vào Sổ địa chỉ để dùng cho lần sau
            </label>
          )}
        </form>
      </section>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
}
