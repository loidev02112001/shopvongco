import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, X } from "lucide-react";
import { TopBar, NavBar, Footer } from "@/components/SiteChrome";
import { getProduct } from "@/data/products";
import { storeActions, useStore } from "@/lib/store";

export const Route = createFileRoute("/yeu-thich")({
  head: () => ({
    meta: [
      { title: "Sản phẩm yêu thích — Luna Jewel" },
      { name: "description", content: "Danh sách sản phẩm yêu thích của bạn." },
    ],
  }),
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist } = useStore();
  const items = wishlist
    .map((slug) => getProduct(slug))
    .filter((p): p is NonNullable<typeof p> => !!p);

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <NavBar />
      <section className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl text-brand font-semibold tracking-wide flex items-center gap-3">
          <Heart className="w-6 h-6" /> SẢN PHẨM YÊU THÍCH
        </h1>

        {items.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            Bạn chưa có sản phẩm yêu thích nào.{" "}
            <Link to="/bo-suu-tap" className="text-brand underline">
              Khám phá bộ sưu tập
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">
            {items.map((p) => (
              <div
                key={p.slug}
                className="bg-white rounded-md overflow-hidden group relative"
              >
                <button
                  onClick={() => storeActions.removeFromWishlist(p.slug)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-price hover:bg-white"
                  aria-label="Xóa khỏi yêu thích"
                >
                  <X className="w-4 h-4" />
                </button>
                <Link
                  to="/san-pham/$slug"
                  params={{ slug: p.slug }}
                  className="block"
                >
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="p-4 text-center">
                    <h3 className="text-sm text-foreground/80 leading-snug min-h-[40px]">
                      {p.name}
                    </h3>
                    <p className="mt-2 text-price font-bold">{p.price}</p>
                  </div>
                </Link>
                <div className="px-4 pb-4">
                  <button
                    onClick={() => storeActions.addToCart(p.slug, 1)}
                    className="w-full bg-brand text-brand-foreground rounded-sm py-2 text-xs font-semibold hover:opacity-90"
                  >
                    THÊM VÀO GIỎ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
