import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Clock, ShieldCheck, MapPin, Phone, User, ShoppingBag, ArrowRight } from "lucide-react";
import { TopBar, NavBar, Footer } from "@/components/SiteChrome";
import { storeActions, useStore, type Order } from "@/lib/store";

export const Route = createFileRoute("/don-hang")({
  head: () => ({
    meta: [
      { title: "Đơn hàng của tôi — Luna Jewel" },
      { name: "description", content: "Danh sách đơn hàng của bạn tại Luna Jewel." },
    ],
  }),
  component: OrdersPage,
});

const formatPrice = (n: number) => n.toLocaleString("vi-VN") + "VNĐ";

const formatDate = (isoString: string) => {
  try {
    const d = new Date(isoString);
    return `${d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ngày ${d.toLocaleDateString("vi-VN")}`;
  } catch {
    return isoString;
  }
};

const STATUS_BADGES: Record<string, { label: string; style: string }> = {
  PENDING: { label: "Chờ xử lý", style: "bg-amber-50 text-amber-700 border-amber-200" },
  PROCESSING: { label: "Đang đóng gói", style: "bg-blue-50 text-blue-700 border-blue-200" },
  SHIPPED: { label: "Đang giao hàng", style: "bg-purple-50 text-purple-700 border-purple-200" },
  DELIVERED: { label: "Đã giao thành công", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Đã hủy", style: "bg-red-50 text-red-700 border-red-200" },
};

function OrdersPage() {
  const { currentUser } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  // const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      // setLoading(true);
      storeActions.fetchOrders()
        .then((data) => {
          setOrders(data);
        })
        .finally(() => {
          // setLoading(false);
        });
    } else {
      // setLoading(false);
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <TopBar />
      <NavBar />

      <section className="max-w-4xl mx-auto px-6 py-12">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="font-display text-3xl text-brand font-bold tracking-wider flex items-center gap-3">
            <Package className="w-8 h-8" />
            ĐƠN HÀNG CỦA TÔI
          </h1>
          <p className="mt-1.5 text-xs md:text-sm text-muted-foreground font-medium">
            Theo dõi hành trình và trạng thái các đơn hàng trang sức Luna Jewel của bạn.
          </p>
        </div>

        {/* Chưa đăng nhập */}
        {!currentUser && (
          <div className="bg-white rounded-2xl p-10 border border-border text-center shadow-xs max-w-md mx-auto mt-8">
            <ShoppingBag className="w-16 h-16 text-brand/35 mx-auto mb-4" />
            <h2 className="text-base font-bold text-foreground">Bạn chưa đăng nhập</h2>
            <p className="text-xs text-muted-foreground/80 mt-1.5 leading-relaxed">
              Vui lòng đăng nhập tài khoản của bạn để xem lịch sử mua sắm và theo dõi trạng thái đơn hàng thời gian thực.
            </p>
            <Link
              to="/tai-khoan"
              className="mt-6 inline-flex items-center gap-2 bg-brand text-brand-foreground text-xs font-bold uppercase tracking-widest px-8 py-3 rounded-lg hover:brightness-105 shadow-sm transition"
            >
              Đăng nhập ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {currentUser && (
          <>
            {false ? (
              /* Loading Spinner */
              <div className="py-24 text-center">
                <span className="w-8 h-8 border-3 border-brand/20 border-t-brand rounded-full animate-spin inline-block" />
                <p className="text-xs text-muted-foreground font-semibold mt-3">Đang tải danh sách đơn hàng từ Cloud...</p>
              </div>
            ) : orders.length === 0 ? (
              /* Danh sách trống */
              <div className="bg-white rounded-2xl p-12 border border-border text-center shadow-xs">
                <ShoppingBag className="w-14 h-14 text-muted-foreground/35 mx-auto mb-4" />
                <h3 className="text-sm font-bold text-foreground">Bạn chưa mua đơn hàng nào</h3>
                <p className="text-xs text-muted-foreground/75 mt-1 max-w-xs mx-auto">
                  Khám phá các sản phẩm trang sức bạc 925 tinh xảo tại cửa hàng để hoàn thành phong cách rạng rỡ của riêng bạn.
                </p>
                <Link
                  to="/bo-suu-tap"
                  className="mt-5 inline-flex bg-brand text-brand-foreground text-xs font-bold uppercase tracking-widest px-8 py-2.5 rounded-lg hover:brightness-105 shadow-xs transition"
                >
                  Mua sắm ngay
                </Link>
              </div>
            ) : (
              /* Danh sách các đơn hàng */
              <div className="space-y-6">
                {orders.map((order) => {
                  const badge = STATUS_BADGES[order.status] || STATUS_BADGES.PENDING;
                  return (
                    <div
                      key={order.id}
                      className="bg-white border border-border rounded-xl shadow-xs overflow-hidden hover:border-brand/35 transition duration-300"
                    >
                      {/* Header đơn hàng */}
                      <div className="px-5 py-4 border-b border-border bg-neutral-50/50 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="font-extrabold text-sm text-foreground tracking-wide bg-brand-soft border border-brand/10 px-3 py-1 rounded">
                            {order.id}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(order.createdAt)}
                          </span>
                        </div>
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${badge.style}`}>
                          {badge.label}
                        </span>
                      </div>

                      {/* Danh sách sản phẩm mua */}
                      <div className="divide-y divide-neutral-100 px-5">
                        {order.items.map((item) => (
                          <div key={`${item.slug}-${item.size}`} className="py-4 flex gap-4 items-center">
                            <img
                              src={item.img}
                              alt={item.name}
                              className="w-14 h-14 object-cover rounded bg-white border border-border shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-1">
                                {item.name}
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[11px] text-muted-foreground font-semibold">
                                <span className="bg-brand-soft/60 px-1.5 py-0.5 rounded text-[10px] border border-brand/5">
                                  Size: {item.size}
                                </span>
                                <span>Số lượng: x{item.qty}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-foreground">{item.price}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer thông tin người nhận + tổng tiền */}
                      <div className="px-5 py-4 bg-neutral-50/20 border-t border-border flex flex-wrap items-start md:items-center justify-between gap-6">
                        {/* Recipient Details */}
                        <div className="space-y-1.5 max-w-md">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">📍 Thông tin giao hàng</div>
                          <div className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-brand/60" /> {order.recipientName}
                            <span className="text-muted-foreground">|</span>
                            <Phone className="w-3.5 h-3.5 text-brand/60" /> {order.phone}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-start gap-1 leading-relaxed">
                            <MapPin className="w-3.5 h-3.5 text-brand/60 shrink-0 mt-0.5" />
                            <span>{order.address}</span>
                          </div>
                        </div>

                        {/* Order Total */}
                        <div className="text-right ml-auto flex items-center gap-4">
                          <div className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/80 flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" /> COD (Thanh toán khi nhận)
                          </div>
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tổng thanh toán</div>
                            <div className="text-lg font-extrabold text-price">{formatPrice(order.totalAmount)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}
