import { useState, useMemo, useRef, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Bell,
  HelpCircle,
  Heart,
  User,
  ShoppingBag,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  Search as SearchIcon,
  LogOut,
  Package,
  Settings,
} from "lucide-react";
import { LunaJewelLogo } from "@/components/LunaJewelLogo";
import { products } from "@/data/products";
import { storeActions, useStore } from "@/lib/store";
import { formatProductPrice } from "@/lib/utils";

function NewsletterForm() {
  const [email, setEmail] = useState("");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) {
      toast.error("Email không hợp lệ", { description: "Vui lòng nhập đúng định dạng email." });
      return;
    }
    toast.success("Đăng ký nhận tin thành công!", {
      description: `Cảm ơn ${email} đã đăng ký. Mã ưu đãi sẽ được gửi qua email.`,
    });
    setEmail("");
  };
  return (
    <form onSubmit={onSubmit} className="flex group transition-all hover:shadow-md rounded">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className="flex-1 bg-white border border-brand/60 rounded-l px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand transition placeholder-slate-400 text-black"
      />
      <button
        type="submit"
        className="bg-brand text-brand-foreground px-4 rounded-r text-sm font-semibold hover:brightness-110 hover:bg-brand/90 transition"
      >
        Sign up
      </button>
    </form>
  );
}

export function TopBar() {
  const { cart, wishlist } = useStore();
  const cartCount = cart.reduce((s, it) => s + it.qty, 0);
  const wishCount = wishlist.length;
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
        <Link to="/" className="shrink-0">
          <LunaJewelLogo variant="full" height={52} />
        </Link>
        <div className="flex-1 max-w-2xl mx-auto">
          <SearchForm />
        </div>

        <div className="flex items-center gap-5 text-brand">
          <Link to="/yeu-thich" aria-label="Yêu thích" className="relative">
            <Heart className="w-5 h-5" />
            {wishCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-price text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {wishCount}
              </span>
            )}
          </Link>
          <Link to="/gio-hang" aria-label="Giỏ hàng" className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-price text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <UserMenu />
        </div>
        <div className="flex flex-col gap-1.5 text-xs">
          <Link
            to="/thong-bao"
            className="flex items-center gap-1.5 border border-brand/40 rounded-full px-3 py-1 text-foreground/70 hover:bg-brand-soft transition"
          >
            <Bell className="w-3.5 h-3.5" /> Thông báo
          </Link>
          <Link
            to="/ho-tro"
            className="flex items-center gap-1.5 border border-brand/40 rounded-full px-3 py-1 text-foreground/70 hover:bg-brand-soft transition"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Hỗ trợ
          </Link>
        </div>
      </div>
    </div>
  );
}

function UserMenu() {
  const { currentUser } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!currentUser) {
    return (
      <Link to="/tai-khoan" aria-label="Tài khoản">
        <User className="w-5 h-5" />
      </Link>
    );
  }

  const initials = currentUser.fullName
    .split(" ")
    .map((w) => w[0])
    .slice(-2)
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    storeActions.logout();
    toast.info("Đã đăng xuất");
    setOpen(false);
    navigate({ to: "/" });
  };

  return (
    <div ref={ref} className="relative">
      <button
        id="user-menu-button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full hover:opacity-80 transition"
        aria-label="Tài khoản của tôi"
      >
        {currentUser.avatar ? (
          <img
            src={currentUser.avatar}
            alt={currentUser.fullName}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-brand/30"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-brand text-brand-foreground text-xs font-bold flex items-center justify-center ring-2 ring-brand/20">
            {initials}
          </div>
        )}
        <span className="hidden lg:block text-xs font-semibold text-foreground/80 max-w-[80px] truncate">
          {currentUser.fullName.split(" ").at(-1)}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-4 py-3 border-b border-border">
            <div className="font-semibold text-sm text-foreground truncate">
              {currentUser.fullName}
            </div>
            <div className="text-xs text-muted-foreground truncate">{currentUser.email}</div>
          </div>
          <Link
            to="/tai-khoan"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-brand-soft transition"
          >
            <Settings className="w-4 h-4 text-brand" /> Hồ sơ cá nhân
          </Link>
          <a
            href="/don-hang"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-foreground hover:bg-brand-soft transition"
          >
            <Package className="w-4 h-4 text-brand" /> Đơn hàng của tôi
          </a>
          <div className="border-t border-border mt-1 pt-1">
            <button
              id="topbar-logout"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition"
            >
              <LogOut className="w-4 h-4" /> Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SearchForm() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const suggestions = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = needle
      ? products.filter(
          (p) =>
            p &&
            ((p.name || "").toLowerCase().includes(needle) ||
              (p.shortName || "").toLowerCase().includes(needle)),
        )
      : products;
    return list.slice(0, 6);
  }, [q]);

  const go = (slug?: string, query?: string) => {
    setOpen(false);
    if (slug) navigate({ to: "/san-pham/$slug", params: { slug } });
    else navigate({ to: "/bo-suu-tap", search: { q: query?.trim() || undefined } });
  };

  return (
    <div ref={wrapRef} className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go(undefined, q);
        }}
        className="flex items-stretch rounded-full border border-brand/40 overflow-hidden bg-white"
      >
        <input
          type="text"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onMouseEnter={() => setOpen(true)}
          placeholder="Tìm kiếm sản phẩm..."
          className="flex-1 px-5 py-2.5 text-sm outline-none bg-transparent"
        />
        <button
          type="submit"
          className="bg-brand text-brand-foreground px-8 text-sm font-medium hover:opacity-90 transition"
        >
          Search
        </button>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-border rounded-md shadow-lg max-h-96 overflow-auto">
          {!q.trim() && (
            <div className="px-4 py-2 text-[11px] uppercase tracking-wide text-muted-foreground border-b">
              Gợi ý cho bạn
            </div>
          )}
          {suggestions.map((p) => (
            <button
              key={p.slug}
              type="button"
              onClick={() => go(p.slug)}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-brand-soft text-left transition"
            >
              <img src={p.img} alt="" className="w-10 h-10 object-cover rounded" />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-foreground/80 truncate">{p.name}</div>
                <div className="text-xs text-price font-semibold">{formatProductPrice(p.price)}</div>
              </div>
            </button>
          ))}
          {q.trim() && (
            <button
              type="button"
              onClick={() => go(undefined, q)}
              className="w-full flex items-center gap-2 px-4 py-2 border-t text-xs text-brand hover:bg-brand-soft transition"
            >
              <SearchIcon className="w-3.5 h-3.5" /> Xem tất cả kết quả cho "{q}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const navItems: { label: string; to: string }[] = [
  { label: "TRANG CHỦ", to: "/" },
  { label: "BỘ SƯU TẬP", to: "/bo-suu-tap" },
  { label: "GIỚI THIỆU", to: "/gioi-thieu" },
  { label: "DỊCH VỤ", to: "/dich-vu" },
  { label: "THỬ VÒNG NGAY", to: "/thu-vong-co" },
];

export function NavBar() {
  return (
    <div className="bg-brand text-brand-foreground">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <nav className="flex">
          {navItems.map((it) => (
            <Link
              key={it.label}
              to={it.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-white/15" }}
              className="px-6 py-3.5 t-header tracking-wide hover:bg-white/10 transition"
            >
              {it.label}
            </Link>
          ))}
        </nav>
        <button className="bg-white text-brand text-sm font-semibold px-5 py-1.5 rounded-full hover:bg-brand-soft transition">
          Ưu Đãi Mỗi Tuần
        </button>
      </div>
    </div>
  );
}

export function ProductCard({
  slug,
  img,
  name,
  price,
}: {
  slug?: string;
  img: string;
  name: string;
  price: string;
}) {
  return <ProductCardInner slug={slug} img={img} name={name} price={price} />;
}

export function ProductCardSkeleton({ dark = false }: { dark?: boolean }) {
  if (dark) {
    return (
      <div className="bg-[#0b0f19]/30 border border-white/5 rounded-2xl overflow-hidden animate-pulse flex flex-col justify-between h-[360px] md:h-[400px]">
        <div className="relative aspect-square bg-[#141a29]/80 flex items-center justify-center overflow-hidden">
          <div className="w-16 h-4 bg-white/5 rounded-full" />
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between bg-[#0b0f19]/40">
          <div className="space-y-2.5">
            <div className="h-4 bg-white/5 rounded w-11/12" />
            <div className="h-4 bg-white/5 rounded w-3/4" />
          </div>
          <div className="h-5 bg-amber-500/10 rounded w-1/3 mt-4 border border-amber-500/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-3xs animate-pulse flex flex-col justify-between h-[330px] md:h-[360px]">
      <div className="relative aspect-square bg-slate-100/60 flex items-center justify-center overflow-hidden">
        <div className="w-12 h-4 bg-slate-200/40 rounded-full" />
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between bg-white">
        <div className="space-y-2">
          <div className="h-3.5 bg-slate-200/50 rounded w-11/12" />
          <div className="h-3.5 bg-slate-200/50 rounded w-2/3" />
        </div>
        <div className="h-4 bg-slate-200/60 rounded w-1/3 mt-4" />
      </div>
    </div>
  );
}

function TryOnBadge({ slug }: { slug?: string }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (slug && typeof window !== "undefined") {
          localStorage.setItem("last-tryon-slug", slug);
        }
        navigate({ to: "/thu-vong-co", search: slug ? { slug } : {} });
      }}
      className="absolute bottom-0 left-0 right-0 bg-[#7CC5CC]/70 text-white text-[13px] font-bold py-2.5 tracking-[0.15em] text-center hover:bg-[#7CC5CC]/85 transition-colors"
    >
      THỬ VÒNG AI
    </button>
  );
}

function ProductCardInner({
  slug,
  img,
  name,
  price,
}: {
  slug?: string;
  img: string;
  name: string;
  price: string;
}) {
  const { wishlist } = useStore();
  const liked = !!slug && wishlist.includes(slug);
  const inner = (
    <div className="bg-white rounded-md overflow-hidden group cursor-pointer">
      <div className="relative overflow-hidden">
        <img
          src={img}
          alt={name}
          loading="lazy"
          width={400}
          height={400}
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none select-none">
          <LunaJewelLogo variant="full" height={22} className="opacity-90 drop-shadow-sm" />
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (slug) storeActions.toggleWishlist(slug);
          }}
          aria-label={liked ? "Bỏ yêu thích" : "Yêu thích"}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-[#7CC5CC] hover:text-[#6BB9C0]"
        >
          <Heart
            className={`w-6 h-6 ${liked ? "fill-[#7CC5CC] text-[#7CC5CC]" : ""}`}
            strokeWidth={2}
          />
        </button>
        <TryOnBadge slug={slug} />
      </div>
      <div className="p-4 text-left">
        <h3 className="t-product text-foreground/85 leading-snug line-clamp-2">{name}</h3>
        <p className="mt-2 text-price t-price">{formatProductPrice(price)}</p>
      </div>
    </div>
  );
  if (!slug) return inner;
  return (
    <Link to="/san-pham/$slug" params={{ slug }} className="block">
      {inner}
    </Link>
  );
}

export function Footer() {
  const { socialLinks } = useStore();
  return (
    <footer className="mt-20 bg-brand-soft border-t border-brand/20">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        {/* Chính Sách */}
        <div>
          <h4 className="font-bold mb-4 text-sm text-brand">
            Chính Sách
          </h4>
          <ul className="space-y-2 text-foreground/80 font-medium">
            <li>
              <Link
                to="/dich-vu"
                search={{ muc: "bao-mat" }}
                className="hover:text-brand transition-colors duration-200"
              >
                Chính sách bảo mật
              </Link>
            </li>
            <li>
              <Link
                to="/dich-vu"
                search={{ muc: "bao-hanh" }}
                className="hover:text-brand transition-colors duration-200"
              >
                Chính sách bảo hành
              </Link>
            </li>
            <li>
              <Link
                to="/dich-vu"
                search={{ muc: "doi-tra" }}
                className="hover:text-brand transition-colors duration-200"
              >
                Chính sách đổi trả
              </Link>
            </li>
            <li>
              <Link
                to="/dich-vu"
                search={{ muc: "van-chuyen" }}
                className="hover:text-brand transition-colors duration-200"
              >
                Chính sách vận chuyển
              </Link>
            </li>
          </ul>
        </div>
        {/* Hỗ trợ */}
        <div>
          <h4 className="font-bold mb-4 text-sm text-brand">
            Hỗ trợ
          </h4>
          <ul className="space-y-2 text-foreground/80 font-medium">
            <li>
              <Link to="/dieu-khoan-dich-vu" className="hover:text-brand transition-colors duration-200">
                Điều khoản dịch vụ
              </Link>
            </li>
            <li>
              <Link to="/huong-dan-mua-hang" className="hover:text-brand transition-colors duration-200">
                Hướng dẫn mua hàng
              </Link>
            </li>
            <li>
              <Link to="/huong-dan-thanh-toan" className="hover:text-brand transition-colors duration-200">
                Hướng dẫn thanh toán
              </Link>
            </li>
          </ul>
        </div>
        {/* Thông tin liên hệ */}
        <div>
          <h4 className="font-bold mb-4 text-sm text-brand">
            Thông tin liên hệ
          </h4>
          <ul className="space-y-2 text-foreground/80 font-medium">
            <li>
              Đại học FPT, Khu CNC Hòa Lạc,
              <br />
              Thạch Thất, Hà Nội
            </li>
            <li>0901 234 567</li>
            <li>contact@lunajewel.vn</li>
          </ul>
        </div>
        {/* Đăng Kí Nhận Tin */}
        <div>
          <h4 className="font-bold mb-4 text-sm text-brand">
            Đăng Kí Nhận Tin
          </h4>
          <NewsletterForm />
          <div className="flex gap-2.5 mt-4">
            <a
              href={socialLinks?.facebook || "https://facebook.com"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black hover:bg-brand text-white transition-colors duration-300 shadow-sm"
            >
              <Facebook className="w-4 h-4" />
            </a>
            <a
              href={socialLinks?.instagram || "https://instagram.com"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black hover:bg-brand text-white transition-colors duration-300 shadow-sm"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href={socialLinks?.youtube || "https://youtube.com"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Youtube"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black hover:bg-brand text-white transition-colors duration-300 shadow-sm"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href={socialLinks?.tiktok || "https://tiktok.com"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black hover:bg-brand text-white transition-colors duration-300 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
              </svg>
            </a>
            <a
              href={socialLinks?.website || "https://lunajewel.vn"}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Website"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black hover:bg-brand text-white transition-colors duration-300 shadow-sm"
            >
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
      <div
        className="py-3 text-center text-xs font-semibold bg-brand text-brand-foreground"
      >
        © {new Date().getFullYear()} Luna Jewel. All rights reserved.
      </div>
    </footer>
  );
}
