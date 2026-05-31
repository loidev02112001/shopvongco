import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal, X, Search as SearchIcon, AlertCircle, ArrowLeft } from "lucide-react";
import { TopBar, NavBar, ProductCard, ProductCardSkeleton, Footer } from "@/components/SiteChrome";
import { products as baseProducts, type Product } from "@/data/products";
import collection1 from "@/assets/collection-1.png";
import collection2 from "@/assets/collection-2.png";
import collection3 from "@/assets/collection-3.png";
import caraLunaBanner from "@/assets/cara-luna-banner.png";
import tryonArBanner from "@/assets/tryon-ar-banner.png";
import heroAr from "@/assets/hero-ar.png";

type Search = {
  q?: string;
  sort?: "price-asc" | "price-desc" | "newest";
  color?: string;
  collection?: string;
  material?: string;
  size?: string;
  priceRange?: string;
};

import { COLLECTIONS_DETAILS, useStore } from "@/lib/store";

export const Route = createFileRoute("/bo-suu-tap")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    sort: s.sort === "price-asc" || s.sort === "price-desc" || s.sort === "newest" ? s.sort : undefined,
    color: typeof s.color === "string" ? s.color : undefined,
    collection: typeof s.collection === "string" ? s.collection : undefined,
    material: typeof s.material === "string" ? s.material : undefined,
    size: typeof s.size === "string" ? s.size : undefined,
    priceRange: typeof s.priceRange === "string" ? s.priceRange : undefined,
  }),
  head: ({ search = {} }: any) => {
    let title = "Bộ Sưu Tập — Luna Jewel";
    let desc = "Khám phá các bộ sưu tập trang sức bạc 925 của Luna Jewel.";

    if (search?.q) {
      title = `Tìm kiếm "${search.q}" — Luna Jewel`;
      desc = `Kết quả tìm kiếm sản phẩm trang sức bạc với từ khóa "${search.q}" tại Luna Jewel.`;
    } else if (search?.collection) {
      const detail = COLLECTIONS_DETAILS[search.collection];
      if (detail) {
        title = `${detail.title} — Luna Jewel`;
        desc = detail?.intro;
      }
    }

    const filters = [
      search?.material,
      search?.color ? `màu ${search.color}` : "",
      search?.size ? `mặt ${search.size}` : ""
    ].filter(Boolean).join(", ");

    if (filters) {
      title = `Dây chuyền ${filters} — Luna Jewel`;
      desc = `Duyệt danh sách dây chuyền ${filters} cao cấp từ Luna Jewel. Thiết kế thanh lịch, an toàn cho da.`;
    }

    return {
      meta: [
        { title },
        { name: "description", content: desc },
      ],
    };
  },
  component: CollectionPage,
});

const priceToNumber = (p: any) => {
  if (typeof p === "number") return p;
  return parseInt(String(p || "").replace(/\D/g, ""), 10) || 0;
};

function applyFilters(
  items: Product[],
  { q, sort, color, collection, material, size, priceRange }: Search
): Product[] {
  let out = items.slice();

  // 1. Tìm kiếm (q) - Tìm theo tên sản phẩm, tên ngắn, thông tin giới thiệu, hoặc tên bộ sưu tập
  if (q) {
    const needle = q.toLowerCase();
    out = out.filter((p) => {
      if (!p) return false;
      const colName = p.collectionId ? (COLLECTIONS_DETAILS[p.collectionId]?.name || "").toLowerCase() : "";
      return (
        (p.name || "").toLowerCase().includes(needle) ||
        (p.shortName || "").toLowerCase().includes(needle) ||
        (p.info || "").toLowerCase().includes(needle) ||
        colName.includes(needle)
      );
    });
  }

  // 2. Lọc theo Bộ sưu tập (collection)
  if (collection) {
    out = out.filter((p) => p && p.collectionId === collection);
  }

  // 3. Lọc theo Màu sắc (color)
  if (color) {
    out = out.filter((p) =>
      p && p.specs && p.specs["Màu sắc"] &&
      p.specs["Màu sắc"].toLowerCase().includes(color.toLowerCase())
    );
  }

  // 4. Lọc theo Chất liệu (material)
  if (material) {
    out = out.filter((p) =>
      p && p.specs && p.specs["Chất liệu"] &&
      p.specs["Chất liệu"].toLowerCase().includes(material.toLowerCase())
    );
  }

  // 5. Lọc theo Kích thước mặt dây (size)
  if (size) {
    out = out.filter((p) =>
      p && p.specs && p.specs["Kích thước"] &&
      p.specs["Kích thước"].toLowerCase().includes(size.toLowerCase())
    );
  }

  // 6. Lọc theo Khoảng giá (priceRange)
  if (priceRange) {
    out = out.filter((p) => {
      const price = priceToNumber(p.price);
      if (priceRange === "under-520") return price < 520000;
      if (priceRange === "520-550") return price >= 520000 && price <= 550000;
      if (priceRange === "over-550") return price > 550000;
      return true;
    });
  }

  // 7. Sắp xếp (sort)
  if (sort === "price-asc") {
    out.sort((a, b) => priceToNumber(a.price) - priceToNumber(b.price));
  } else if (sort === "price-desc") {
    out.sort((a, b) => priceToNumber(b.price) - priceToNumber(a.price));
  } else if (sort === "newest") {
    out.reverse();
  }

  return out;
}

function FilterBar() {
  const { collections } = useStore();
  const navigate = Route.useNavigate();
  const search = Route.useSearch();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Trích xuất động các tùy chọn từ dữ liệu sản phẩm hiện tại
  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    baseProducts.forEach((p) => {
      const rawColor = typeof p.specs?.["Màu sắc"] === "string" ? p.specs["Màu sắc"] : "";
      rawColor
        .split("/")
        .map((c: string) => c.trim())
        .filter(Boolean)
        .forEach((c: string) => set.add(c));
    });
    return Array.from(set);
  }, []);

  const materialOptions = useMemo(() => {
    const set = new Set<string>();
    baseProducts.forEach((p) => {
      const mat = typeof p.specs?.["Chất liệu"] === "string" ? p.specs["Chất liệu"].trim() : "";
      if (mat) set.add(mat);
    });
    return Array.from(set);
  }, []);

  const sizeOptions = useMemo(() => {
    const set = new Set<string>();
    baseProducts.forEach((p) => {
      const sz = typeof p.specs?.["Kích thước"] === "string" ? p.specs["Kích thước"].trim() : "";
      if (sz) set.add(sz);
    });
    return Array.from(set);
  }, []);

  const update = (patch: Partial<Search>) =>
    navigate({
      search: (prev: Search) => ({ ...prev, ...patch }),
      replace: true,
      resetScroll: false,
    });

  const clearAllFilters = () => {
    navigate({
      search: {},
      replace: true,
      resetScroll: false,
    });
  };

  const hasActiveFilters = !!(
    search.q ||
    search.color ||
    search.sort ||
    search.collection ||
    search.material ||
    search.size ||
    search.priceRange
  );

  const activeFilterCount = [
    search.q,
    search.color,
    search.sort,
    search.collection,
    search.material,
    search.size,
    search.priceRange,
  ].filter(Boolean).length;

  return (
    <div className="bg-brand-soft/30 border border-brand/10 rounded-xl p-5 md:p-6 mt-8 shadow-sm">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-brand/10">
        <div className="flex items-center gap-2.5 text-brand">
          <SlidersHorizontal className="w-5 h-5 text-brand" />
          <span className="font-bold text-sm tracking-wider uppercase">Bộ Lọc Tìm Kiếm</span>
          {activeFilterCount > 0 && (
            <span className="bg-brand text-brand-foreground text-[11px] font-bold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1.5 text-xs font-semibold text-price hover:text-price/80 transition-colors self-start sm:self-center"
          >
            <X className="w-3.5 h-3.5" /> Xóa tất cả bộ lọc
          </button>
        )}
      </div>

      {/* Filter Dropdowns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 mt-5">
        {/* Dropdown: Bộ Sưu Tập */}
        <Dropdown
          label={
            search.collection
              ? `BST: ${COLLECTIONS_DETAILS[search.collection]?.name || search.collection}`
              : "BỘ SƯU TẬP"
          }
          open={openDropdown === "collection"}
          onToggle={() => setOpenDropdown(openDropdown === "collection" ? null : "collection")}
          isActive={!!search.collection}
        >
          <DropdownItem
            onClick={() => {
              update({ collection: undefined });
              setOpenDropdown(null);
            }}
            isSelected={!search.collection}
          >
            Tất cả bộ sưu tập
          </DropdownItem>
          {Object.entries(COLLECTIONS_DETAILS).map(([id, col]) => (
            <DropdownItem
              key={id}
              onClick={() => {
                update({ collection: id });
                setOpenDropdown(null);
              }}
              isSelected={search.collection === id}
            >
              {col.name}
            </DropdownItem>
          ))}
        </Dropdown>

        {/* Dropdown: Khoảng Giá */}
        <Dropdown
          label={
            search.priceRange === "under-520"
              ? "Giá: Dưới 520k"
              : search.priceRange === "520-550"
                ? "Giá: 520k - 550k"
                : search.priceRange === "over-550"
                  ? "Giá: Trên 550k"
                  : "MỨC GIÁ"
          }
          open={openDropdown === "priceRange"}
          onToggle={() => setOpenDropdown(openDropdown === "priceRange" ? null : "priceRange")}
          isActive={!!search.priceRange}
        >
          <DropdownItem
            onClick={() => {
              update({ priceRange: undefined });
              setOpenDropdown(null);
            }}
            isSelected={!search.priceRange}
          >
            Tất cả mức giá
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              update({ priceRange: "under-520" });
              setOpenDropdown(null);
            }}
            isSelected={search.priceRange === "under-520"}
          >
            Dưới 520.000 VNĐ
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              update({ priceRange: "520-550" });
              setOpenDropdown(null);
            }}
            isSelected={search.priceRange === "520-550"}
          >
            520.000đ - 550.000 VNĐ
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              update({ priceRange: "over-550" });
              setOpenDropdown(null);
            }}
            isSelected={search.priceRange === "over-550"}
          >
            Trên 550.000 VNĐ
          </DropdownItem>
        </Dropdown>

        {/* Dropdown: Chất Liệu */}
        <Dropdown
          label={search.material ? `Chất liệu: ${search.material}` : "CHẤT LIỆU"}
          open={openDropdown === "material"}
          onToggle={() => setOpenDropdown(openDropdown === "material" ? null : "material")}
          isActive={!!search.material}
        >
          <DropdownItem
            onClick={() => {
              update({ material: undefined });
              setOpenDropdown(null);
            }}
            isSelected={!search.material}
          >
            Tất cả chất liệu
          </DropdownItem>
          {materialOptions.map((m) => (
            <DropdownItem
              key={m}
              onClick={() => {
                update({ material: m });
                setOpenDropdown(null);
              }}
              isSelected={search.material === m}
            >
              {m}
            </DropdownItem>
          ))}
        </Dropdown>

        {/* Dropdown: Kích Thước */}
        <Dropdown
          label={search.size ? `Mặt: ${search.size.replace("Mặt dây ", "")}` : "KÍCH THƯỚC"}
          open={openDropdown === "size"}
          onToggle={() => setOpenDropdown(openDropdown === "size" ? null : "size")}
          isActive={!!search.size}
        >
          <DropdownItem
            onClick={() => {
              update({ size: undefined });
              setOpenDropdown(null);
            }}
            isSelected={!search.size}
          >
            Tất cả kích thước
          </DropdownItem>
          {sizeOptions.map((s) => (
            <DropdownItem
              key={s}
              onClick={() => {
                update({ size: s });
                setOpenDropdown(null);
              }}
              isSelected={search.size === s}
            >
              {s}
            </DropdownItem>
          ))}
        </Dropdown>

        {/* Dropdown: Màu Sắc */}
        <Dropdown
          label={search.color ? `Màu: ${search.color}` : "MÀU SẮC"}
          open={openDropdown === "color"}
          onToggle={() => setOpenDropdown(openDropdown === "color" ? null : "color")}
          isActive={!!search.color}
        >
          <DropdownItem
            onClick={() => {
              update({ color: undefined });
              setOpenDropdown(null);
            }}
            isSelected={!search.color}
          >
            Tất cả màu sắc
          </DropdownItem>
          {colorOptions.map((c) => (
            <DropdownItem
              key={c}
              onClick={() => {
                update({ color: c });
                setOpenDropdown(null);
              }}
              isSelected={search.color === c}
            >
              {c}
            </DropdownItem>
          ))}
        </Dropdown>

        {/* Dropdown: Sắp Xếp */}
        <Dropdown
          label={
            search.sort === "price-asc"
              ? "Giá: Thấp → Cao"
              : search.sort === "price-desc"
                ? "Giá: Cao → Thấp"
                : search.sort === "newest"
                  ? "Mới Nhất"
                  : "SẮP XẾP MẶC ĐỊNH"
          }
          open={openDropdown === "sort"}
          onToggle={() => setOpenDropdown(openDropdown === "sort" ? null : "sort")}
          isActive={!!search.sort}
        >
          <DropdownItem
            onClick={() => {
              update({ sort: undefined });
              setOpenDropdown(null);
            }}
            isSelected={!search.sort}
          >
            Mặc định
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              update({ sort: "newest" });
              setOpenDropdown(null);
            }}
            isSelected={search.sort === "newest"}
          >
            Mới Nhất
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              update({ sort: "price-asc" });
              setOpenDropdown(null);
            }}
            isSelected={search.sort === "price-asc"}
          >
            Giá: Thấp → Cao
          </DropdownItem>
          <DropdownItem
            onClick={() => {
              update({ sort: "price-desc" });
              setOpenDropdown(null);
            }}
            isSelected={search.sort === "price-desc"}
          >
            Giá: Cao → Thấp
          </DropdownItem>
        </Dropdown>
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-brand/5">
          <span className="text-xs text-muted-foreground mr-1">Đang lọc theo:</span>
          {search.q && (
            <FilterTag label={`Từ khóa: "${search.q}"`} onRemove={() => update({ q: undefined })} />
          )}
          {search.collection && (
            <FilterTag
              label={`BST: ${COLLECTIONS_DETAILS[search.collection]?.name || search.collection}`}
              onRemove={() => update({ collection: undefined })}
            />
          )}
          {search.priceRange && (
            <FilterTag
              label={
                search.priceRange === "under-520"
                  ? "Dưới 520k"
                  : search.priceRange === "520-550"
                    ? "520k - 550k"
                    : "Trên 550k"
              }
              onRemove={() => update({ priceRange: undefined })}
            />
          )}
          {search.material && (
            <FilterTag label={search.material} onRemove={() => update({ material: undefined })} />
          )}
          {search.size && (
            <FilterTag label={search.size} onRemove={() => update({ size: undefined })} />
          )}
          {search.color && (
            <FilterTag label={`Màu: ${search.color}`} onRemove={() => update({ color: undefined })} />
          )}
          {search.sort && (
            <FilterTag
              label={
                search.sort === "price-asc"
                  ? "Giá tăng dần"
                  : search.sort === "price-desc"
                    ? "Giá giảm dần"
                    : "Mới nhất"
              }
              onRemove={() => update({ sort: undefined })}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Dropdown({
  label,
  open,
  onToggle,
  isActive,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between gap-3 border rounded-lg px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
          isActive
            ? "bg-brand text-brand-foreground border-brand shadow-sm"
            : "bg-white border-brand/20 text-brand hover:bg-brand-soft/50 hover:border-brand/40"
        }`}
      >
        <span className="truncate">{label}</span>
        <ChevronDown
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          } ${isActive ? "text-brand-foreground" : "text-brand"}`}
        />
      </button>
      {open && (
        <>
          {/* Backdrop to dismiss dropdown click outside */}
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute z-20 left-0 right-0 mt-1.5 min-w-[200px] max-h-60 overflow-y-auto bg-white border border-brand/10 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-150 scrollbar-thin">
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function DropdownItem({
  onClick,
  isSelected,
  children,
}: {
  onClick: () => void;
  isSelected: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors duration-150 ${
        isSelected
          ? "bg-brand-soft/75 text-brand font-semibold"
          : "text-foreground/80 hover:bg-brand-soft/30 hover:text-brand"
      }`}
    >
      {children}
    </button>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-brand/10 border border-brand/20 text-brand text-xs font-medium px-2.5 py-1 rounded-full shadow-sm">
      {label}
      <button
        onClick={onRemove}
        className="text-brand hover:text-price transition-colors p-0.5 rounded-full hover:bg-brand/10"
        aria-label={`Remove filter ${label}`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function CollectionSection({
  id,
  title,
  intro,
  products,
}: {
  id?: string;
  title: string;
  intro?: string;
  products: Product[];
}) {
  return (
    <section id={id} className="mt-14 scroll-mt-24">
      <div className="border-b border-brand/10 pb-4 mb-6">
        <h2 className="t-h-main text-center text-brand tracking-wide uppercase">{title}</h2>
        {intro && (
          <p className="text-center text-xs md:text-sm text-muted-foreground max-w-4xl mx-auto mt-3 leading-relaxed">
            {intro}
          </p>
        )}
      </div>
      {products.length === 0 ? (
        <div className="bg-brand-soft/10 border border-dashed border-brand/20 rounded-lg py-12 text-center">
          <p className="text-sm text-muted-foreground">Không tìm thấy sản phẩm nào trong bộ sưu tập này.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p, i) => (
            <ProductCard key={`${id}-${i}`} {...p} />
          ))}
        </div>
      )}
    </section>
  );
}

function CollectionPage() {
  const { collections, isProductsLoaded } = useStore();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const filtered = useMemo(() => applyFilters(baseProducts, search), [search]);

  // Scroll to hash after render (for navigation anchoring)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  }, []);

  if (!isProductsLoaded) {
    return (
      <div className="min-h-screen bg-white">
        <TopBar />
        <NavBar />
        
        {/* Banner Skeleton */}
        <section className="w-full bg-slate-100/50 animate-pulse h-[250px] sm:h-[400px]" />

        <section className="max-w-7xl mx-auto px-6 py-12">
          {/* Filter Bar Skeleton */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 h-24 animate-pulse mb-12" />

          <div className="space-y-16">
            {/* Collection 1 Skeleton */}
            <div>
              <div className="w-48 h-8 bg-slate-100/70 rounded mx-auto mb-8 animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>

            {/* Collection 2 Skeleton */}
            <div>
              <div className="w-48 h-8 bg-slate-100/70 rounded mx-auto mb-8 animate-pulse" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  // Exception Flow E1: Collection not found (Mã bộ sưu tập trong URL không hợp lệ)
  const isCollectionInvalid = search.collection && !COLLECTIONS_DETAILS[search.collection];

  if (isCollectionInvalid) {
    return (
      <div className="min-h-screen bg-white">
        <TopBar />
        <NavBar />
        <div className="max-w-xl mx-auto py-24 px-6 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="font-display text-2xl font-bold text-brand mb-3 uppercase tracking-wider">Không tìm thấy bộ sưu tập</h1>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">Mã bộ sưu tập "{search.collection}" không hợp lệ hoặc đã bị thay đổi trên hệ thống của Luna Jewel.</p>
          <button 
            onClick={() => navigate({ search: {}, replace: true })}
            className="inline-flex items-center gap-2 bg-brand text-brand-foreground px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 shadow-sm active:scale-98 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> QUAY LẠI CÁC BỘ SƯU TẬP
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  // Xác định xem có lọc thuộc tính hoặc tìm kiếm đang hoạt động không (Ngoại trừ chỉ lọc collection)
  const isSearchActive = !!(search.q || search.color || search.material || search.size || search.priceRange);
  const isSingleCollectionMode = !!search.collection;

  const currentCollectionDetail = search.collection ? COLLECTIONS_DETAILS[search.collection] : null;

  // Lựa chọn ảnh banner chính động: Nếu đang xem 1 BST riêng biệt thì dùng banner riêng, nếu không dùng banner chung Luna Jewel
  const activeHeroBanner = currentCollectionDetail ? currentCollectionDetail.banner : caraLunaBanner;

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <NavBar />

      {/* Hero Banner Section (Cập nhật banner riêng biệt cho từng Collection theo UC34) */}
      <section className="w-full relative overflow-hidden">
        <img
          src={activeHeroBanner}
          alt={currentCollectionDetail ? currentCollectionDetail.title : "Bạc Ý 925 chuẩn định lượng — Luna Jewel"}
          className="block w-full h-auto object-cover max-h-[350px] sm:max-h-[500px]"
        />
        {!currentCollectionDetail && (
          <Link
            to="/gioi-thieu"
            aria-label="Tìm hiểu thêm về Luna Jewel"
            className="absolute left-1/2 -translate-x-1/2 bg-white border border-brand/50 text-brand hover:bg-brand hover:text-brand-foreground transition-all duration-300 px-5 md:px-7 py-2 md:py-2.5 text-xs md:text-sm font-semibold tracking-wider whitespace-nowrap shadow-md hover:shadow-lg rounded"
            style={{ top: "60%" }}
          >
            TÌM HIỂU THÊM VỀ LUNA JEWEL
          </Link>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-6">
        
        {/* Gallery Collections Intro (Chỉ hiển thị ở chế độ trang chủ BST - Không tìm kiếm, không xem riêng 1 BST) */}
        {!isSearchActive && !isSingleCollectionMode && (
          <>
            <h2 className="t-h-main text-center text-brand tracking-wide mt-14 uppercase">Các Bộ Sưu Tập Nổi Bật</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <button 
                onClick={() => navigate({ search: { collection: "graceful-muse" } })}
                className="group relative aspect-[4/3] bg-muted rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <img
                  src={collection1}
                  alt="Quà tặng ngày kỷ niệm tình yêu"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                  <span className="text-white font-semibold text-sm">Kỷ Niệm Tình Yêu</span>
                </div>
              </button>
              <button 
                onClick={() => navigate({ search: { collection: "huong-sac-mua-he" } })}
                className="group relative aspect-[4/3] bg-muted rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <img
                  src={collection2}
                  alt="Trang sức cặp đôi"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                  <span className="text-white font-semibold text-sm">Trang Sức Cặp Đôi</span>
                </div>
              </button>
              <button 
                onClick={() => navigate({ search: { collection: "thanh-nha-ngan-hoa" } })}
                className="group relative aspect-[4/3] bg-muted rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <img
                  src={collection3}
                  alt="Quà tặng sinh nhật bạn gái"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                  <span className="text-white font-semibold text-sm">Quà Tặng Sinh Nhật</span>
                </div>
              </button>
            </div>
          </>
        )}

        {/* FilterBar Controls */}
        <FilterBar />

        {/* 1. CHẾ ĐỘ XEM CHI TIẾT 1 BỘ SƯU TẬP CỤ THỂ (UC34) */}
        {isSingleCollectionMode && currentCollectionDetail && (
          <div className="mt-12 scroll-mt-24">
            
            {/* Tên và Description chi tiết của Collection (UC34) */}
            <div className="border-b border-brand/10 pb-5 mb-8 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl md:text-3xl font-extrabold text-brand tracking-wide uppercase">
                    {currentCollectionDetail.title}
                  </h1>
                  <p className="text-xs md:text-sm text-muted-foreground mt-3 leading-relaxed max-w-5xl">
                    {currentCollectionDetail?.intro}
                  </p>
                </div>
              </div>
            </div>

            {/* Alternative Flow A1: BST Không có sản phẩm (hoặc không tìm thấy sau lọc) */}
            {filtered.length === 0 ? (
              <div className="bg-brand-soft/10 border border-dashed border-brand/20 rounded-xl py-20 text-center">
                <AlertCircle className="w-12 h-12 text-brand/40 mx-auto mb-4" />
                <h3 className="font-semibold text-base text-foreground/80 uppercase">No products available in this collection</h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                  Hiện tại không có sản phẩm nào thuộc bộ sưu tập này phù hợp với các tiêu chí lọc đang được áp dụng.
                </p>
                <button
                  onClick={() => navigate({
                    search: (prev: Search) => ({ ...prev, color: undefined, material: undefined, size: undefined, priceRange: undefined, q: undefined }),
                    replace: true,
                    resetScroll: false,
                  })}
                  className="mt-4 bg-brand/10 text-brand border border-brand/20 hover:bg-brand hover:text-brand-foreground px-5 py-2 rounded-full text-xs font-bold uppercase transition"
                >
                  Xóa bộ lọc để xem lại
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground mb-6 font-semibold uppercase tracking-wider">
                  Hiển thị <span className="text-brand font-bold">{filtered.length}</span> thiết kế thuộc BST {currentCollectionDetail.name}:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {filtered.map((p, i) => (
                    <ProductCard key={`collection-detail-${p.slug}-${i}`} {...p} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. CHẾ ĐỘ TÌM KIẾM / LỌC CHÉO KHÁC (Không ở Single Collection) */}
        {isSearchActive && !isSingleCollectionMode && (
          <div className="mt-12 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand/10 pb-4 mb-8">
              <div>
                <h2 className="t-h-main text-brand tracking-wide uppercase text-left">
                  Kết Quả Tìm Kiếm & Lọc
                </h2>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Tìm thấy <span className="font-semibold text-brand">{filtered.length}</span> sản phẩm phù hợp với các tiêu chí của bạn.
                </p>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-brand-soft/10 border border-dashed border-brand/20 rounded-xl py-20 text-center">
                <SearchIcon className="w-12 h-12 text-brand/30 mx-auto mb-4" />
                <h3 className="font-semibold text-base text-foreground/80">Không tìm thấy sản phẩm nào</h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
                  Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc thay đổi/xóa các tùy chọn bộ lọc để tìm sản phẩm mong muốn.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {filtered.map((p, i) => (
                  <ProductCard key={`filtered-${p.slug}-${i}`} {...p} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. CHẾ ĐỘ HIỂN THỊ TRANG CHỦ BỘ SƯU TẬP TRUYỀN THỐNG (Mặc định khi không có bất kỳ bộ lọc nào active) */}
        {!isSearchActive && !isSingleCollectionMode && (
          <>
            <CollectionSection
              id="graceful-muse"
              title="The Graceful Muse - Nàng Thơ Thanh Lịch"
              intro={COLLECTIONS_DETAILS["graceful-muse"]?.intro}
              products={filtered.filter((p) => p.collectionId === "graceful-muse")}
            />

            <CollectionSection
              id="huong-sac-mua-he"
              title="Hương Sắc Mùa Hè"
              intro={COLLECTIONS_DETAILS["huong-sac-mua-he"]?.intro}
              products={filtered.filter((p) => p.collectionId === "huong-sac-mua-he")}
            />

            <CollectionSection
              id="thanh-nha-ngan-hoa"
              title="Thanh Nhã Ngân Hoa"
              intro={COLLECTIONS_DETAILS["thanh-nha-ngan-hoa"]?.intro}
              products={filtered.filter((p) => p.collectionId === "thanh-nha-ngan-hoa")}
            />

            <CollectionSection
              id="pure-soul"
              title="Pure Soul - Tâm Hồn Thuần Khiết"
              intro={COLLECTIONS_DETAILS["pure-soul"]?.intro}
              products={filtered.filter((p) => p.collectionId === "pure-soul")}
            />
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}