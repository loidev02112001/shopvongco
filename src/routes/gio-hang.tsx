import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Plus, Minus, X, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { TopBar, NavBar, ProductCard, Footer } from "@/components/SiteChrome";
import { getProduct, products } from "@/data/products";
import { storeActions, useStore } from "@/lib/store";
import { formatProductPrice } from "@/lib/utils";

type CartSearch = { slug?: string; qty?: number; size?: string };

export const Route = createFileRoute("/gio-hang")({
  validateSearch: (search: Record<string, unknown>): CartSearch => ({
    slug: typeof search.slug === "string" ? search.slug : undefined,
    qty: typeof search.qty === "number" ? search.qty : search.qty ? Number(search.qty) : undefined,
    size: typeof search.size === "string" ? search.size : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Giỏ Hàng — Luna Jewel" },
      { name: "description", content: "Giỏ hàng của bạn tại Luna Jewel" },
    ],
  }),
  component: CartPage,
});

function parsePrice(p: any) {
  if (typeof p === "number") return p;
  return parseInt(String(p || "").replace(/[^\d]/g, ""), 10) || 0;
}
function formatPrice(n: number) {
  return formatProductPrice(n);
}

function CartPage() {
  const { slug, qty: initQty, size: initSize } = Route.useSearch();
  const navigate = useNavigate();
  const { cart } = useStore();

  // If navigated here with ?slug=... add it to the cart once.
  useEffect(() => {
    if (slug && getProduct(slug)) {
      storeActions.addToCart(slug, initQty ?? 1, initSize ?? "40cm + 5cm");
      navigate({ to: "/gio-hang", replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const featured = products.slice(0, 4);

  const rows = cart
    .map((it) => {
      const p = getProduct(it.slug);
      return p ? { ...it, product: p } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x);

  const total = rows.reduce(
    (sum, r) => sum + parsePrice(r.product.price) * r.qty,
    0,
  );

  const updateQty = (slug: string, size: string, delta: number) => {
    const it = cart.find((c) => c.slug === slug && c.size === size);
    if (it) storeActions.setQty(slug, it.qty + delta, size);
  };
  const removeItem = (slug: string, size: string) => storeActions.removeFromCart(slug, size);

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <NavBar />

      <section className="max-w-7xl mx-auto px-4 pt-6 sm:px-6 sm:pt-8">
        {/* Header row */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-brand/40 pb-3 text-sm font-semibold text-brand">
          <div>THÔNG TIN SẢN PHẨM</div>
          <div className="text-center">GIÁ</div>
          <div className="text-center">SỐ LƯỢNG</div>
          <div className="text-center">THÀNH TIỀN</div>
          <div className="w-16" />
        </div>

        {rows.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            Giỏ hàng của bạn đang trống.{" "}
            <Link to="/bo-suu-tap" className="text-brand underline">
              Tiếp tục mua hàng
            </Link>
          </div>
        ) : (
          rows.map((r) => (
            <div key={`${r.slug}-${r.size}`}>
              <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 items-center py-5 border-b border-brand/20">
              <div className="flex items-center gap-4">
                <Link
                  to="/san-pham/$slug"
                  params={{ slug: r.slug }}
                  className="shrink-0"
                >
                  <img
                    src={r.product.img}
                    alt={r.product.name}
                    className="w-20 h-20 object-cover rounded-md bg-white border border-brand/10"
                  />
                </Link>
                <div className="flex flex-col min-w-0">
                  <Link
                    to="/san-pham/$slug"
                    params={{ slug: r.slug }}
                    className="text-xs font-semibold text-brand hover:opacity-80 leading-snug truncate"
                  >
                    {r.product.shortName}
                  </Link>
                  <span className="text-[10px] text-brand/85 mt-1.5 bg-brand-soft/60 px-2.5 py-0.5 rounded self-start font-bold border border-brand/10">
                    Kích thước: {r.size}
                  </span>
                </div>
              </div>
              <div className="text-center text-sm text-brand">
                {formatPrice(parsePrice(r.product.price))}
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => updateQty(r.slug, r.size, -1)}
                  className="w-7 h-7 rounded-full border border-brand/40 flex items-center justify-center text-brand hover:bg-brand-soft"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center font-semibold">{r.qty}</span>
                <button
                  onClick={() => updateQty(r.slug, r.size, 1)}
                  className="w-7 h-7 rounded-full border border-brand/40 flex items-center justify-center text-brand hover:bg-brand-soft"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div className="text-center text-sm font-semibold text-brand">
                {formatPrice(parsePrice(r.product.price) * r.qty)}
              </div>
              <div className="flex items-center gap-2 justify-end pr-2">
                <button onClick={() => storeActions.toggleWishlist(r.slug)} className="text-brand hover:opacity-70" aria-label="Yêu thích">
                  <Heart className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeItem(r.slug, r.size)}
                  className="text-price hover:opacity-70"
                  aria-label="Xóa"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              </div>

              <article className="border-b border-brand/20 py-5 md:hidden">
                <div className="flex gap-3">
                  <Link
                    to="/san-pham/$slug"
                    params={{ slug: r.slug }}
                    className="shrink-0"
                  >
                    <img
                      src={r.product.img}
                      alt={r.product.name}
                      className="h-24 w-24 rounded-md border border-brand/10 object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to="/san-pham/$slug"
                        params={{ slug: r.slug }}
                        className="line-clamp-2 text-sm font-bold leading-snug text-brand"
                      >
                        {r.product.shortName}
                      </Link>
                      <button
                        onClick={() => removeItem(r.slug, r.size)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-price"
                        aria-label="Xóa"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <span className="mt-2 inline-flex rounded bg-brand-soft/60 px-2 py-1 text-[10px] font-bold text-brand">
                      Kích thước: {r.size}
                    </span>
                    <p className="mt-2 text-sm font-bold text-price">
                      {formatPrice(parsePrice(r.product.price))}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQty(r.slug, r.size, -1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-brand/40 text-brand"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-6 text-center font-semibold">{r.qty}</span>
                    <button
                      onClick={() => updateQty(r.slug, r.size, 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-brand/40 text-brand"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] uppercase text-muted-foreground">Thành tiền</span>
                    <strong className="text-sm text-brand">
                      {formatPrice(parsePrice(r.product.price) * r.qty)}
                    </strong>
                  </div>
                </div>
              </article>
            </div>
          ))
        )}

        {/* Continue + coupon */}
        <div className="mt-6 flex flex-col items-stretch justify-between gap-5 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            to="/bo-suu-tap"
            className="text-sm text-brand flex items-center gap-1 hover:underline"
          >
            <ChevronLeft className="w-4 h-4" /> Tiếp tục mua hàng
          </Link>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
            <span className="text-sm font-semibold text-brand">
              MÃ GIẢM GIÁ
            </span>
            <div className="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-full border border-brand/40 bg-white sm:flex-none">
              <input
                type="text"
                className="min-w-0 flex-1 bg-transparent px-4 py-2 text-sm outline-none sm:w-56"
              />
              <button className="bg-brand text-brand-foreground px-4 hover:opacity-90">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <hr className="my-6 border-brand/30" />

        {/* Total + order */}
        <div className="flex flex-col items-stretch gap-4 sm:items-end">
          <div className="flex items-baseline justify-between gap-3 text-base sm:block sm:text-lg">
            <span className="text-brand font-semibold">TỔNG TIỀN: </span>
            <span className="text-price text-2xl font-bold ml-3">
              {formatPrice(total)}
            </span>
          </div>
          <button
            onClick={() => {
              if (rows.length === 0) {
                navigate({ to: "/bo-suu-tap" });
              } else {
                const first = rows[0];
                navigate({ to: "/thanh-toan", search: { slug: first.slug, qty: first.qty, size: first.size } });
              }
            }}
            className="w-full bg-price text-white rounded-md px-6 py-3.5 t-buy tracking-wide hover:opacity-90 transition sm:w-auto sm:px-16 sm:py-3"
          >
            ĐẶT HÀNG
          </button>
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-7xl mx-auto px-4 mt-12 sm:px-6 sm:mt-14">
        <h2 className="t-h-main text-center text-brand tracking-wide">
          SẢN PHẨM NỔI BẬT
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 mt-6 sm:mt-8">
          {featured.map((p) => (
            <ProductCard
              key={p.slug}
              slug={p.slug}
              img={p.img}
              name={p.name}
              price={p.price}
            />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
