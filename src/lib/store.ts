import { useSyncExternalStore } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import { toast } from "sonner";

import heroAr from "@/assets/hero-ar.png";
import caraLunaBanner from "@/assets/cara-luna-banner.png";
import tryonArBanner from "@/assets/tryon-ar-banner.png";

export type CartItem = { slug: string; qty: number; size: string };

export type UserRole = "USER" | "MANAGER" | "ADMIN";

export type ShippingAddress = {
  id: string;
  recipientName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
};

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  status: "ACTIVE" | "LOCKED";
  addresses?: ShippingAddress[];
};

type StoredAccount = AuthUser & { passwordHash: string; googleId?: string };

export type ProductReview = {
  id: string;
  productSlug: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  isHidden?: boolean; // UC29
};

export type OrderItem = {
  slug: string;
  qty: number;
  size: string;
  price: string;
  name: string;
  img: string;
};

export type Order = {
  id: string;
  userId: string | null;
  recipientName: string;
  phone: string;
  address: string;
  paymentMethod: string;
  items: OrderItem[];
  totalAmount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
};

export type Product = {
  slug: string;
  img: string;
  name: string;
  shortName: string;
  price: string;
  description: string;
  specs: any;
  info: string;
  collectionId?: string;
  images?: string[];
};

export type Collection = {
  id: string;
  name: string;
  title: string;
  intro: string;
  banner: string;
  thumbnail: string;
  isVisible: boolean;
};

export type Slide = {
  id: string;
  title?: string;
  subtitle?: string;
  image: string;
  link?: string;
  sortOrder: number;
};

export type SocialLinks = {
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  website: string;
};

type State = {
  cart: CartItem[];
  wishlist: string[];
  currentUser: AuthUser | null;
  accounts: StoredAccount[];
  reviews: ProductReview[];
  products: Product[];
  orders: Order[];
  collections: Collection[];
  slides: Slide[];
  isProductsLoaded: boolean;
  socialLinks: SocialLinks;
};

const STORAGE_KEY = "luna-jewel-store-v2";

const defaultReviews: ProductReview[] = [
  {
    id: "r1",
    productSlug: "co-bon-la-luminous-clover",
    userName: "Nguyễn Thảo Chi",
    rating: 5,
    comment: "Dây chuyền siêu xinh luôn ạ, cỏ 4 lá tinh xảo lắm. Shop gói hàng rất cẩn thận còn tặng kèm khăn lau bạc với nước rửa bạc nữa.",
    date: "15/05/2026"
  },
  {
    id: "r2",
    productSlug: "co-bon-la-luminous-clover",
    userName: "Trần Minh Anh",
    rating: 5,
    comment: "Đã nhận được hàng, bạc sáng bóng đeo lên cổ nhìn rất thanh lịch. Sẽ ủng hộ shop thêm nhiều sản phẩm khác.",
    date: "20/05/2026"
  },
  {
    id: "r3",
    productSlug: "thien-nga-graceful-swan",
    userName: "Lê Hoài Thu",
    rating: 5,
    comment: "Thiên nga mạ vàng hồng nhìn sang chảnh lắm nha mọi người. Đeo đi tiệc hay đi làm đều hợp. Shop tư vấn siêu nhiệt tình.",
    date: "18/05/2026"
  },
  {
    id: "r4",
    productSlug: "thien-nga-graceful-swan",
    userName: "Phạm Thùy Linh",
    rating: 4,
    comment: "Dây chuyền đẹp, đá đính chắc chắn lấp lánh. Điểm trừ duy nhất là giao hàng hơi chậm hơn dự kiến 1 ngày nhưng bù lại đóng gói cực kỳ trang nhã.",
    date: "22/05/2026"
  },
  {
    id: "r5",
    productSlug: "hoa-dao-spring-blossom",
    userName: "Hoàng Mai Phương",
    rating: 5,
    comment: "Cực kỳ ưng ý! Cánh hoa đào hồng pastel xinh xỉu đeo lên trắng da cực kỳ. Rất đáng tiền.",
    date: "12/05/2026"
  },
  {
    id: "r6",
    productSlug: "mat-trang-midnight-romance",
    userName: "Vũ Khánh Huyền",
    rating: 5,
    comment: "Kiểu dáng basic dễ thương dễ phối đồ lắm. Mình đeo cả tuần tắm rửa bình thường không thấy bị xỉn màu gì cả.",
    date: "25/05/2026"
  },
  {
    id: "r7",
    productSlug: "thien-nga-onyx-elegance",
    userName: "Đỗ Hải Yến",
    rating: 5,
    comment: "Màu đá đen huyền bí và cá tính cực kỳ, mình thích sự độc lạ này. Dây đeo vừa vặn rất tôn xương quai xanh.",
    date: "10/05/2026"
  },
  {
    id: "r8",
    productSlug: "twin-hearts-knot",
    userName: "Bùi Kiều Trang",
    rating: 5,
    comment: "Trang sức đôi tim lồng vào nhau siêu ý nghĩa, thích hợp làm quà tặng. Bạn trai mua tặng sinh nhật mình cưng xỉu.",
    date: "26/05/2026"
  }
];

// Simple hash for demo (NOT for production)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}

export const defaultCollections: Collection[] = [
  {
    id: "graceful-muse",
    name: "Nàng Thơ Thanh Lịch",
    title: "The Graceful Muse - Nàng Thơ Thanh Lịch",
    intro: "Lấy cảm hứng từ hình ảnh thiên nga — biểu tượng của sự thanh khiết, thủy chung và vẻ đẹp trường tồn — bộ sưu tập tôn vinh người phụ nữ mang khí chất thanh tao đầy cuốn hút. Mỗi thiết kế là sự hòa quyện giữa đường nét mềm mại của đôi cánh thiên nga, ánh bạc sang trọng và những viên đá lấp lánh, khắc họa hình ảnh người phụ nữ hiện đại: thanh lịch, duyên dáng và sở hữu vẻ đẹp vượt lên mọi xu hướng.",
    banner: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
    isVisible: true
  },
  {
    id: "huong-sac-mua-he",
    name: "Hương Sắc Mùa Hè",
    title: "Hương Sắc Mùa Hè - Nốt Nhạc Tự Do",
    intro: "Chúng mình gói ghém toàn bộ khoảnh khắc bình yên và trong trẻo vào bộ sưu tập 'Hương Sắc Mùa Hè'. Một chiếc dây chuyền hình bướm thanh mảnh, đính những viên đá sáng trong như giọt nước, chính là 'làn gió mát' hoàn hảo cho diện mạo của bạn — nhẹ nhàng khẽ chạm vào xương quai xanh, biến bạn trở thành nàng thơ tự do, rạng rỡ dưới ánh mặt trời.",
    banner: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
    isVisible: true
  },
  {
    id: "thanh-nha-ngan-hoa",
    name: "Thanh Nhã Ngân Hoa",
    title: "Thanh Nhã Ngân Hoa - Bản Giao Hưởng Bạc Ý",
    intro: "Nâng niu nét duyên trong từng ánh bạc. Lấy cảm hứng từ vẻ đẹp thanh tao của hoa nở trong ánh bạc, mong manh cùng cánh bướm nhẹ nhàng giữa khu vườn ngập nắng — Thanh Nhã Ngân Hoa là bản hòa ca của vẻ đẹp nữ tính, thanh tao và đầy duyên dáng. Mỗi món trang sức là một nét chấm phá tinh tế, tựa ánh bạc khẽ ngân trên cánh hoa, thì thầm về nét duyên thanh khiết luôn nở rộ theo năm tháng.",
    banner: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=600&q=80",
    isVisible: true
  },
  {
    id: "pure-soul",
    name: "Tâm Hồn Thuần Khiết",
    title: "Pure Soul - Tâm Hồn Thuần Khiết",
    intro: "Lấy cảm hứng từ vẻ đẹp thuần khiết và thanh tao của tâm hồn người phụ nữ, Pure Soul là lời tôn vinh sự dịu dàng, chân thành và tình yêu dành cho chính mình. Mỗi thiết kế mang những đường nét mềm mại cùng ánh sáng tinh tế của đá và bạc, tượng trưng cho vẻ đẹp xuất phát từ nội tâm — trong trẻo nhưng đầy cuốn hút. Pure Soul còn là lời nhắc rằng khi người phụ nữ biết yêu thương bản thân, họ sẽ luôn tỏa sáng theo cách riêng của mình.",
    banner: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80",
    isVisible: true
  }
];

export const defaultSlides: Slide[] = [
  {
    id: "slide-1",
    title: "TRẢI NGHIỆM AI THỬ TRANG SỨC THẬT",
    subtitle: "Sử dụng camera hoặc tải ảnh lên để xem chiếc vòng cổ lộng lẫy nhất trên bạn",
    image: heroAr,
    link: "/thu-vong-co",
    sortOrder: 1
  },
  {
    id: "slide-2",
    title: "BỘ SƯU TẬP NÀNG THƠ THANH LỊCH",
    subtitle: "Sức hút từ biểu tượng thiên swan - kiêu sa, thuần khiết và quý phái",
    image: caraLunaBanner,
    link: "/bo-suu-tap?collection=graceful-muse",
    sortOrder: 2
  },
  {
    id: "slide-3",
    title: "DỊCH VỤ TRANG SỨC PREMIUM",
    subtitle: "Gói quà trang nhã miễn phí, giao nhanh toàn quốc và bảo hành trọn đời",
    image: tryonArBanner,
    link: "/gioi-thieu",
    sortOrder: 3
  }
];

export let COLLECTIONS_DETAILS: Record<string, any> = {};
export let COLLECTION_NAMES: Record<string, string> = {};

export function updateGlobals(currentCollections: Collection[]) {
  const details: Record<string, any> = {};
  const names: Record<string, string> = {};
  currentCollections.forEach((c) => {
    names[c.id] = c.name;
    if (c.isVisible) {
      details[c.id] = {
        id: c.id,
        name: c.name,
        title: c.title,
        intro: c.intro,
        banner: c.banner,
        thumbnail: c.thumbnail,
      };
    }
  });
  COLLECTIONS_DETAILS = details;
  COLLECTION_NAMES = names;
}

export const defaultSocialLinks: SocialLinks = {
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  youtube: "https://youtube.com",
  tiktok: "https://tiktok.com",
  website: "https://lunajewel.vn",
};

function load(): State {
  const useEmptySeedData = isSupabaseConfigured();
  const initialReviews = useEmptySeedData ? [] : defaultReviews;
  const initialCollections = useEmptySeedData ? [] : defaultCollections;
  const initialSlides = useEmptySeedData ? [] : defaultSlides;

  if (typeof window === "undefined")
    return { cart: [], wishlist: [], currentUser: null, accounts: [], reviews: initialReviews, products: [], orders: [], collections: initialCollections, slides: initialSlides, socialLinks: defaultSocialLinks };

  const seedManager: StoredAccount = {
    id: "manager-seed",
    fullName: "Luna Jewel Manager",
    email: "manager@lunajewel.vn",
    role: "MANAGER",
    status: "ACTIVE",
    passwordHash: simpleHash("ManagerPassword123"),
  };

  const seedAdmin: StoredAccount = {
    id: "admin-seed",
    fullName: "Luna Jewel Admin",
    email: "admin@lunajewel.vn",
    role: "ADMIN",
    status: "ACTIVE",
    passwordHash: simpleHash("AdminPassword123"),
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      updateGlobals(initialCollections);
      return {
        cart: [],
        wishlist: [],
        currentUser: null,
        accounts: [seedManager, seedAdmin],
        reviews: initialReviews,
        products: [],
        orders: [],
        collections: initialCollections,
        slides: initialSlides,
        socialLinks: defaultSocialLinks,
      };
    }
    const parsed = JSON.parse(raw);
    const loadedAccounts = Array.isArray(parsed.accounts) ? parsed.accounts : [];
    if (!loadedAccounts.some((a: any) => a.email === "manager@lunajewel.vn")) {
      loadedAccounts.push(seedManager);
    }
    if (!loadedAccounts.some((a: any) => a.email === "admin@lunajewel.vn")) {
      loadedAccounts.push(seedAdmin);
    }

    const loadedCollections = useEmptySeedData
      ? []
      : Array.isArray(parsed.collections) && parsed.collections.length > 0
      ? parsed.collections
      : initialCollections;

    updateGlobals(loadedCollections);

    const loadedSlides = useEmptySeedData
      ? []
      : Array.isArray(parsed.slides) && parsed.slides.length > 0
      ? parsed.slides
      : initialSlides;

    const currentUser = parsed.currentUser ?? null;
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      // Chỉ lấy wishlist từ LocalStorage nếu đã đăng nhập, chưa đăng nhập bắt buộc là rỗng
      wishlist: currentUser && Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      currentUser,
      accounts: loadedAccounts,
      reviews: useEmptySeedData ? [] : Array.isArray(parsed.reviews) ? parsed.reviews : initialReviews,
      products: Array.isArray(parsed.products) ? parsed.products : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
      collections: loadedCollections,
      slides: loadedSlides,
      isProductsLoaded: false,
      socialLinks: parsed.socialLinks ?? defaultSocialLinks,
    };
  } catch {
    updateGlobals(initialCollections);
    return {
      cart: [],
      wishlist: [],
      currentUser: null,
      accounts: [seedManager, seedAdmin],
      reviews: initialReviews,
      products: [],
      orders: [],
      collections: initialCollections,
      slides: initialSlides,
      isProductsLoaded: false,
      socialLinks: defaultSocialLinks,
    };
  }
}

let state: State = load();

const listeners = new Set<() => void>();

function emit() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  updateGlobals(state.collections);
  listeners.forEach((l) => l());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () =>
  ({ cart: [], wishlist: [], currentUser: null, accounts: [], reviews: [], products: [], orders: [], collections: [], slides: [], isProductsLoaded: false, socialLinks: defaultSocialLinks }) as State;

export function useStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const storeActions = {
  addToCart(slug: string, qty = 1, size = "40cm + 5cm") {
    // Phân biệt sản phẩm theo cả slug và size
    const existing = state.cart.find(
      (it) => it.slug === slug && it.size === size
    );
    state = {
      ...state,
      cart: existing
        ? state.cart.map((it) =>
            it.slug === slug && it.size === size
              ? { ...it, qty: it.qty + qty }
              : it
          )
        : [...state.cart, { slug, qty, size }],
    };
    emit();
  },
  setQty(slug: string, qty: number, size = "40cm + 5cm") {
    state = {
      ...state,
      cart: state.cart.map((it) =>
        it.slug === slug && it.size === size
          ? { ...it, qty: Math.max(1, qty) }
          : it
      ),
    };
    emit();
  },
  removeFromCart(slug: string, size = "40cm + 5cm") {
    state = {
      ...state,
      cart: state.cart.filter(
        (it) => !(it.slug === slug && it.size === size)
      ),
    };
    emit();
  },
  clearCart() {
    state = { ...state, cart: [] };
    emit();
  },
  async toggleWishlist(slug: string) {
    state = load();
    if (!state.currentUser) {
      toast.error("Vui lòng đăng nhập", {
        description: "Bạn cần đăng nhập tài khoản để lưu sản phẩm yêu thích!",
      });
      // Tự động chuyển hướng đến trang tài khoản
      if (typeof window !== "undefined") {
        window.location.hash = "/tai-khoan";
      }
      return;
    }

    const has = state.wishlist.includes(slug);
    
    // Đồng bộ lên Cloud nếu đã cấu hình Supabase và user đã đăng nhập
    if (isSupabaseConfigured()) {
      try {
        if (has) {
          // Xóa khỏi Supabase
          const { error: delErr } = await supabase
            .from("wishlist")
            .delete()
            .eq("user_id", state.currentUser.id)
            .eq("product_slug", slug);
          if (delErr) throw delErr;
          toast.success("Đã xóa khỏi danh sách yêu thích");
        } else {
          // Thêm vào Supabase
          const { error: insErr } = await supabase
            .from("wishlist")
            .insert({
              id: Date.now().toString(),
              user_id: state.currentUser.id,
              product_slug: slug,
            });
          if (insErr) throw insErr;
          toast.success("Đã thêm vào danh sách yêu thích");
        }
      } catch (err: any) {
        console.error("Supabase toggleWishlist error:", err);
      }
    }

    state = {
      ...state,
      wishlist: has
        ? state.wishlist.filter((s) => s !== slug)
        : [...state.wishlist, slug],
    };
    emit();
  },

  async removeFromWishlist(slug: string) {
    state = load();
    if (!state.currentUser) return;

    // Đồng bộ lên Cloud nếu đã cấu hình Supabase và user đã đăng nhập
    if (isSupabaseConfigured()) {
      try {
        const { error: delErr } = await supabase
          .from("wishlist")
          .delete()
          .eq("user_id", state.currentUser.id)
          .eq("product_slug", slug);
        if (delErr) throw delErr;
        toast.success("Đã xóa khỏi danh sách yêu thích");
      } catch (err: any) {
        console.error("Supabase removeFromWishlist error:", err);
      }
    }

    state = {
      ...state,
      wishlist: state.wishlist.filter((s) => s !== slug),
    };
    emit();
  },

  async fetchWishlist(): Promise<string[]> {
    state = load();
    if (!state.currentUser) {
      state = { ...state, wishlist: [] };
      emit();
      return [];
    }

    if (isSupabaseConfigured()) {
      try {
        const { data: cloudWishlist, error: fetchErr } = await supabase
          .from("wishlist")
          .select("product_slug")
          .eq("user_id", state.currentUser.id);

        if (fetchErr) throw fetchErr;

        const mappedSlugs = cloudWishlist ? cloudWishlist.map((w: any) => w.product_slug) : [];
        state = { ...state, wishlist: mappedSlugs };
        emit();
        return mappedSlugs;
      } catch (err: any) {
        console.error("Supabase fetchWishlist error:", err);
        // Tuyệt đối không fallback lấy local wishlist cũ để tránh lẫn lộn
        state = { ...state, wishlist: [] };
        emit();
        return [];
      }
    }
    
    // Nếu Supabase chưa được cấu hình
    state = { ...state, wishlist: [] };
    emit();
    return [];
  },

  // ── Review actions ─────────────────────────────────────────────
  async addReview(productSlug: string, rating: number, comment: string) {
    if (!state.currentUser) return;
    const newReview: ProductReview = {
      id: Date.now().toString(),
      productSlug,
      userName: state.currentUser.fullName,
      userAvatar: state.currentUser.avatar,
      rating,
      comment,
      date: new Date().toLocaleDateString("vi-VN"),
      isHidden: false, // UC29
    };

    // Đồng bộ lên Cloud nếu đã cấu hình Supabase
    if (isSupabaseConfigured()) {
      try {
        const { error: insertErr } = await supabase.from("reviews").insert({
          id: newReview.id,
          product_slug: productSlug,
          user_id: state.currentUser.id,
          user_name: newReview.userName,
          user_avatar: newReview.userAvatar || null,
          rating,
          comment,
          date_string: newReview.date,
          is_hidden: false, // UC29
        });
        if (insertErr) throw insertErr;
        console.log(`Successfully added review for ${productSlug} on Supabase online!`);
      } catch (err: any) {
        console.error("Supabase addReview error:", err);
      }
    }

    state = {
      ...state,
      reviews: [newReview, ...state.reviews],
    };
    emit();
  },

  async fetchReviews(): Promise<ProductReview[]> {
    state = load();
    if (isSupabaseConfigured()) {
      try {
        const { data: cloudReviews, error: fetchErr } = await supabase
          .from("reviews")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchErr) throw fetchErr;

        if (cloudReviews) {
          const mapped: ProductReview[] = cloudReviews.map((r: any) => ({
            id: r.id,
            productSlug: r.product_slug,
            userName: r.user_name,
            userAvatar: r.user_avatar || undefined,
            rating: r.rating,
            comment: r.comment,
            date: r.date_string,
            isHidden: r.is_hidden || false, // UC29
          }));
          state = { ...state, reviews: mapped };
          emit();
          return mapped;
        }
      } catch (err: any) {
        console.error("Supabase fetchReviews error, using local reviews:", err);
      }
    }
    return state.reviews;
  },

  async toggleReviewVisibility(reviewId: string, isHidden: boolean): Promise<{ ok: true } | { ok: false; error: string }> {
    state = load();
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from("reviews")
          .update({ is_hidden: isHidden })
          .eq("id", reviewId);
        if (error) throw error;
        console.log(`Successfully toggled review visibility to ${isHidden} for review ${reviewId} online!`);
      } catch (err: any) {
        console.error("Supabase toggleReviewVisibility error:", err);
        return { ok: false, error: err.message };
      }
    }
    state = {
      ...state,
      reviews: state.reviews.map((r) =>
        String(r.id) === String(reviewId) ? { ...r, isHidden } : r
      ),
    };
    emit();
    return { ok: true };
  },

  async deleteReview(reviewId: string): Promise<{ ok: true } | { ok: false; error: string }> {
    state = load();
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase
          .from("reviews")
          .delete()
          .eq("id", reviewId);
        if (error) throw error;
        console.log(`Successfully deleted review ${reviewId} online!`);
      } catch (err: any) {
        console.error("Supabase deleteReview error:", err);
        return { ok: false, error: err.message };
      }
    }
    state = {
      ...state,
      reviews: state.reviews.filter((r) => String(r.id) !== String(reviewId)),
    };
    emit();
    return { ok: true };
  },

  // ── Auth actions ──────────────────────────────────────────────
  async register(data: {
    fullName: string;
    email: string;
    password: string;
  }): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
    state = load(); // Load latest state
    const emailLower = data.email.trim().toLowerCase();

    // 1. Kiểm tra trên Cloud nếu đã cấu hình Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data: existingUsers, error: fetchErr } = await supabase
          .from("users")
          .select("id")
          .eq("email", emailLower);
        if (fetchErr) throw fetchErr;
        if (existingUsers && existingUsers.length > 0) {
          return { ok: false, error: "Email already exists" };
        }
      } catch (err: any) {
        console.error("Supabase error checking user existence:", err);
      }
    }

    // 2. Kiểm tra trên Local Fallback
    const exists = state.accounts.some(
      (a) => a.email.toLowerCase() === emailLower
    );
    if (exists) return { ok: false, error: "Email already exists" };

    const newUser: StoredAccount = {
      id: Date.now().toString(),
      fullName: data.fullName.trim(),
      email: emailLower,
      role: "USER",
      status: "ACTIVE",
      passwordHash: simpleHash(data.password),
    };

    // 3. Ghi vào Cloud nếu đã cấu hình Supabase
    if (isSupabaseConfigured()) {
      try {
        const { error: insertErr } = await supabase.from("users").insert({
          id: newUser.id,
          email: newUser.email,
          password_hash: newUser.passwordHash,
          full_name: newUser.fullName,
          phone: newUser.phone || null,
          avatar_url: newUser.avatar || null,
          role: newUser.role,
          status: newUser.status,
        });
        if (insertErr) throw insertErr;
      } catch (err: any) {
        console.error("Supabase error inserting user record:", err);
      }
    }

    const { passwordHash: _, ...authUser } = newUser;
    state = {
      ...state,
      accounts: [...state.accounts, newUser],
      currentUser: authUser,
    };
    emit();
    return { ok: true, user: authUser };
  },

  async login(
    email: string,
    password: string
  ): Promise<{ ok: true; user: AuthUser } | { ok: false; error: string }> {
    state = load(); // Load latest state
    const emailLower = email.trim().toLowerCase();
    let account: StoredAccount | undefined;

    // 1. Kiểm tra trên Cloud nếu đã cấu hình Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data: users, error: fetchErr } = await supabase
          .from("users")
          .select("*")
          .eq("email", emailLower);
        if (fetchErr) throw fetchErr;

        if (users && users.length > 0) {
          const u = users[0];
          account = {
            id: u.id,
            email: u.email,
            passwordHash: u.password_hash,
            fullName: u.full_name,
            phone: u.phone || undefined,
            avatar: u.avatar_url || undefined,
            role: (u.role as UserRole) || "USER",
            status: (u.status as "ACTIVE" | "LOCKED") || "ACTIVE",
            addresses: [],
          };

          // Tải toàn bộ địa chỉ của user này từ bảng addresses trên Supabase (UC11)
          const { data: addrs, error: addrErr } = await supabase
            .from("addresses")
            .select("*")
            .eq("user_id", u.id);

          if (!addrErr && addrs) {
            account.addresses = addrs.map((a: any) => ({
              id: a.id,
              recipientName: a.recipient_name,
              phone: a.phone,
              province: a.province,
              district: a.district,
              ward: a.ward,
              street: a.street,
              isDefault: a.is_default,
            }));
          }
        }
      } catch (err: any) {
        console.error("Supabase login fetch error, falling back to local:", err);
      }
    }

    // 2. Fallback sang Local nếu không tìm thấy trên Cloud
    let isLocalFallback = false;
    if (!account) {
      account = state.accounts.find(
        (a) => a.email.toLowerCase() === emailLower
      );
      if (account) isLocalFallback = true;
    }

    if (!account) return { ok: false, error: "Invalid email or password" };
    if (account.status === "LOCKED")
      return { ok: false, error: "Your account has been locked" };
    if (account.passwordHash !== simpleHash(password))
      return { ok: false, error: "Invalid email or password" };

    const { passwordHash: _, ...authUser } = account;

    // Nếu đây là tài khoản local fallback (chưa có trên Supabase Cloud), tự động di cư lên Cloud
    if (isLocalFallback && isSupabaseConfigured()) {
      try {
        await supabase.from("users").insert({
          id: account.id,
          email: account.email,
          password_hash: account.passwordHash,
          full_name: account.fullName,
          phone: account.phone || null,
          avatar_url: account.avatar || null,
          role: account.role,
          status: account.status,
          google_id: account.googleId || null,
        });
        console.log(`Auto-migrated local account ${account.email} to Supabase online!`);
        
        // Đồng thời di cư luôn cả các địa chỉ local của tài khoản này lên Supabase
        if (account.addresses && account.addresses.length > 0) {
          for (const addr of account.addresses) {
            await supabase.from("addresses").insert({
              id: addr.id,
              user_id: account.id,
              recipient_name: addr.recipientName,
              phone: addr.phone,
              province: addr.province,
              district: addr.district,
              ward: addr.ward,
              street: addr.street,
              is_default: addr.isDefault,
            });
          }
          console.log(`Auto-migrated ${account.addresses.length} local addresses of ${account.email} to Supabase online!`);
        }
      } catch (migrateErr) {
        console.error("Failed to auto-migrate local account to Supabase:", migrateErr);
      }
    }

    // Đồng bộ tài khoản vào local state.accounts để luôn sẵn sàng offline
    const updatedAccounts = state.accounts.some((a) => String(a.id) === String(account!.id))
      ? state.accounts.map((a) => (String(a.id) === String(account!.id) ? account! : a))
      : [...state.accounts, account];

    state = {
      ...state,
      accounts: updatedAccounts,
      currentUser: authUser,
    };
    emit();
    
    // Tự động đồng bộ hóa nạp lại danh sách yêu thích từ database ngay sau khi đăng nhập thành công để cập nhật icon tym
    storeActions.fetchWishlist();
    
    return { ok: true, user: authUser };
  },

  logout() {
    state = { ...state, currentUser: null, wishlist: [], cart: [] };
    emit();
    if (typeof window !== "undefined") {
      // Chuyển hướng về trang chủ và reload để làm sạch hoàn toàn bộ nhớ đệm session
      window.location.href = "/";
      setTimeout(() => {
        window.location.reload();
      }, 50);
    }
  },

  updateProfile(data: Partial<Pick<AuthUser, "fullName" | "phone" | "avatar">>) {
    if (!state.currentUser) return;
    const updated = { ...state.currentUser, ...data };

    // Đồng bộ lên Cloud nếu đã cấu hình Supabase
    if (isSupabaseConfigured()) {
      supabase
        .from("users")
        .update({
          full_name: updated.fullName,
          phone: updated.phone || null,
          avatar_url: updated.avatar || null,
        })
        .eq("id", updated.id)
        .then(({ error }) => {
          if (error) console.error("Supabase updateProfile error:", error);
        });
    }

    state = {
      ...state,
      currentUser: updated,
      accounts: state.accounts.map((a) =>
        String(a.id) === String(updated.id) ? { ...a, ...data } : a
      ),
    };
    emit();
  },

  // UC03 – Đăng nhập bằng Google
  async loginWithGoogle(googleProfile: {
    googleId: string;
    email: string;
    fullName: string;
    avatar?: string;
  }): Promise<{ ok: true; user: AuthUser; isNew: boolean } | { ok: false; error: string }> {
    state = load(); // Load latest state
    const emailLower = googleProfile.email.trim().toLowerCase();
    let account: StoredAccount | undefined;
    let isNew = false;

    // 1. Đồng bộ lên Cloud nếu đã cấu hình Supabase
    if (isSupabaseConfigured()) {
      try {
        const { data: users, error: fetchErr } = await supabase
          .from("users")
          .select("*")
          .eq("email", emailLower);
        if (fetchErr) throw fetchErr;

        if (users && users.length > 0) {
          const u = users[0];
          if (u.status === "LOCKED") {
            return { ok: false, error: "Your account has been locked" };
          }

          // Cập nhật thông tin Google OAuth (google_id, avatar_url) nếu có thay đổi
          const updateData: any = {};
          if (!u.google_id) updateData.google_id = googleProfile.googleId;
          if (googleProfile.avatar && u.avatar_url !== googleProfile.avatar) {
            updateData.avatar_url = googleProfile.avatar;
          }

          if (Object.keys(updateData).length > 0) {
            await supabase.from("users").update(updateData).eq("id", u.id);
          }

          account = {
            id: u.id,
            email: u.email,
            passwordHash: u.password_hash || "",
            fullName: u.full_name,
            phone: u.phone || undefined,
            avatar: googleProfile.avatar || u.avatar_url || undefined,
            role: (u.role as UserRole) || "USER",
            status: (u.status as "ACTIVE" | "LOCKED") || "ACTIVE",
            googleId: googleProfile.googleId,
            addresses: [],
          };

          // Tải sổ địa chỉ của họ từ Supabase
          const { data: addrs, error: addrErr } = await supabase
            .from("addresses")
            .select("*")
            .eq("user_id", u.id);

          if (!addrErr && addrs) {
            account.addresses = addrs.map((a: any) => ({
              id: a.id,
              recipientName: a.recipient_name,
              phone: a.phone,
              province: a.province,
              district: a.district,
              ward: a.ward,
              street: a.street,
              isDefault: a.is_default,
            }));
          }
        } else {
          // Chưa tồn tại tài khoản trên Cloud -> tạo mới
          isNew = true;
          account = {
            id: Date.now().toString(),
            email: emailLower,
            fullName: googleProfile.fullName,
            avatar: googleProfile.avatar,
            role: "USER",
            status: "ACTIVE",
            passwordHash: "", // không có password cho Google account
            googleId: googleProfile.googleId,
            addresses: [],
          };

          await supabase.from("users").insert({
            id: account.id,
            email: account.email,
            full_name: account.fullName,
            avatar_url: account.avatar || null,
            role: account.role,
            status: account.status,
            google_id: account.googleId,
            password_hash: null,
          });
        }
      } catch (err: any) {
        console.error("Supabase loginWithGoogle error, falling back to local:", err);
      }
    }

    // 2. Chế độ ngoại tuyến (Local Fallback)
    if (!account) {
      const existing = state.accounts.find(
        (a) => a.email.toLowerCase() === emailLower
      );
      if (existing) {
        if (existing.status === "LOCKED") {
          return { ok: false, error: "Your account has been locked" };
        }
        account = {
          ...existing,
          googleId: googleProfile.googleId,
          avatar: googleProfile.avatar ?? existing.avatar,
        };
      } else {
        isNew = true;
        account = {
          id: Date.now().toString(),
          email: emailLower,
          fullName: googleProfile.fullName,
          avatar: googleProfile.avatar,
          role: "USER",
          status: "ACTIVE",
          passwordHash: "",
          googleId: googleProfile.googleId,
          addresses: [],
        };
      }
    }

    const { passwordHash: _, ...authUser } = account;

    // Đồng bộ vào mảng accounts của local store
    const updatedAccounts = state.accounts.some((a) => String(a.id) === String(account!.id))
      ? state.accounts.map((a) => (String(a.id) === String(account!.id) ? account! : a))
      : [...state.accounts, account];

    state = {
      ...state,
      accounts: updatedAccounts,
      currentUser: authUser,
    };
    emit();
    
    // Tự động đồng bộ hóa nạp lại danh sách yêu thích từ database ngay sau khi đăng nhập Google thành công để cập nhật icon tym
    storeActions.fetchWishlist();

    return { ok: true, user: authUser, isNew };
  },

  addShippingAddress(address: Omit<ShippingAddress, "id">) {
    if (!state.currentUser) return;
    const currentAddresses = state.currentUser.addresses || [];
    const newAddress: ShippingAddress = {
      ...address,
      id: Date.now().toString(),
      isDefault: currentAddresses.length === 0 ? true : address.isDefault,
    };

    let updatedAddresses = [...currentAddresses];
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map((addr) => ({ ...addr, isDefault: false }));
    }
    updatedAddresses.push(newAddress);

    // Đồng bộ lên Cloud nếu đã cấu hình Supabase
    if (isSupabaseConfigured()) {
      if (newAddress.isDefault) {
        supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", state.currentUser.id)
          .then(() => {
            supabase
              .from("addresses")
              .insert({
                id: newAddress.id,
                user_id: state.currentUser!.id,
                recipient_name: newAddress.recipientName,
                phone: newAddress.phone,
                province: newAddress.province,
                district: newAddress.district,
                ward: newAddress.ward,
                street: newAddress.street,
                is_default: newAddress.isDefault,
              })
              .then(({ error }) => {
                if (error) console.error("Supabase addAddress insert error:", error);
              });
          });
      } else {
        supabase
          .from("addresses")
          .insert({
            id: newAddress.id,
            user_id: state.currentUser.id,
            recipient_name: newAddress.recipientName,
            phone: newAddress.phone,
            province: newAddress.province,
            district: newAddress.district,
            ward: newAddress.ward,
            street: newAddress.street,
            is_default: newAddress.isDefault,
          })
          .then(({ error }) => {
            if (error) console.error("Supabase addAddress insert error:", error);
          });
      }
    }

    const updatedUser = { ...state.currentUser, addresses: updatedAddresses };
    state = {
      ...state,
      currentUser: updatedUser,
      accounts: state.accounts.map((a) =>
        String(a.id) === String(updatedUser.id) ? { ...a, addresses: updatedAddresses } : a
      ),
    };
    emit();
  },

  updateShippingAddress(id: string, updatedFields: Partial<ShippingAddress>) {
    if (!state.currentUser) return;
    const currentAddresses = state.currentUser.addresses || [];

    let updatedAddresses = currentAddresses.map((addr) => {
      if (String(addr.id) === String(id)) {
        return { ...addr, ...updatedFields };
      }
      return addr;
    });

    const target = updatedAddresses.find((addr) => String(addr.id) === String(id));
    if (target?.isDefault) {
      updatedAddresses = updatedAddresses.map((addr) =>
        String(addr.id) === String(id) ? addr : { ...addr, isDefault: false }
      );
    }

    // Đồng bộ lên Cloud nếu đã cấu hình Supabase
    if (isSupabaseConfigured()) {
      const activeTarget = updatedAddresses.find((addr) => String(addr.id) === String(id));
      if (activeTarget) {
        if (activeTarget.isDefault) {
          supabase
            .from("addresses")
            .update({ is_default: false })
            .eq("user_id", state.currentUser.id)
            .then(() => {
              supabase
                .from("addresses")
                .update({
                  recipient_name: activeTarget.recipientName,
                  phone: activeTarget.phone,
                  province: activeTarget.province,
                  district: activeTarget.district,
                  ward: activeTarget.ward,
                  street: activeTarget.street,
                  is_default: activeTarget.isDefault,
                })
                .eq("id", id)
                .then(({ error }) => {
                  if (error) console.error("Supabase updateAddress error:", error);
                });
            });
        } else {
          supabase
            .from("addresses")
            .update({
              recipient_name: activeTarget.recipientName,
              phone: activeTarget.phone,
              province: activeTarget.province,
              district: activeTarget.district,
              ward: activeTarget.ward,
              street: activeTarget.street,
              is_default: activeTarget.isDefault,
            })
            .eq("id", id)
            .then(({ error }) => {
              if (error) console.error("Supabase updateAddress error:", error);
            });
        }
      }
    }

    const updatedUser = { ...state.currentUser, addresses: updatedAddresses };
    state = {
      ...state,
      currentUser: updatedUser,
      accounts: state.accounts.map((a) =>
        String(a.id) === String(updatedUser.id) ? { ...a, addresses: updatedAddresses } : a
      ),
    };
    emit();
  },

  deleteShippingAddress(id: string) {
    if (!state.currentUser) return;
    const currentAddresses = state.currentUser.addresses || [];
    const wasDefault = currentAddresses.find((addr) => String(addr.id) === String(id))?.isDefault;

    let updatedAddresses = currentAddresses.filter((addr) => String(addr.id) !== String(id));

    if (wasDefault && updatedAddresses.length > 0) {
      updatedAddresses = updatedAddresses.map((addr, idx) =>
        idx === 0 ? { ...addr, isDefault: true } : addr
      );
    }

    // Đồng bộ lên Cloud nếu đã cấu hình Supabase
    if (isSupabaseConfigured()) {
      supabase
        .from("addresses")
        .delete()
        .eq("id", id)
        .then(() => {
          const newDefault = updatedAddresses.find((a) => a.isDefault);
          if (newDefault) {
            supabase
              .from("addresses")
              .update({ is_default: true })
              .eq("id", newDefault.id)
              .then(({ error }) => {
                if (error) console.error("Supabase deleteAddress updateDefault error:", error);
              });
          }
        });
    }

    const updatedUser = { ...state.currentUser, addresses: updatedAddresses };
    state = {
      ...state,
      currentUser: updatedUser,
      accounts: state.accounts.map((a) =>
        String(a.id) === String(updatedUser.id) ? { ...a, addresses: updatedAddresses } : a
      ),
    };
    emit();
  },

  setDefaultShippingAddress(id: string) {
    if (!state.currentUser) return;
    const currentAddresses = state.currentUser.addresses || [];

    const updatedAddresses = currentAddresses.map((addr) => ({
      ...addr,
      isDefault: String(addr.id) === String(id),
    }));

    // Đồng bộ lên Cloud nếu đã cấu hình Supabase
    if (isSupabaseConfigured()) {
      supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", state.currentUser.id)
        .then(() => {
          supabase
            .from("addresses")
            .update({ is_default: true })
            .eq("id", id)
            .then(({ error }) => {
              if (error) console.error("Supabase setDefaultAddress error:", error);
            });
        });
    }

    const updatedUser = { ...state.currentUser, addresses: updatedAddresses };
    state = {
      ...state,
      currentUser: updatedUser,
      accounts: state.accounts.map((a) =>
        String(a.id) === String(updatedUser.id) ? { ...a, addresses: updatedAddresses } : a
      ),
    };
    emit();
  },

  async changePassword(data: {
    currentPw: string;
    newPw: string;
  }): Promise<{ ok: true } | { ok: false; error: string }> {
    state = load(); // Load latest state
    if (!state.currentUser) return { ok: false, error: "Chưa đăng nhập" };

    const account = state.accounts.find(
      (a) => String(a.id) === String(state.currentUser!.id)
    );
    if (!account) return { ok: false, error: "Không tìm thấy tài khoản" };

    // Kiểm tra mật khẩu cũ nếu tài khoản có mật khẩu
    if (account.passwordHash) {
      if (account.passwordHash !== simpleHash(data.currentPw)) {
        return { ok: false, error: "Mật khẩu hiện tại không chính xác" };
      }
    }

    const newHash = simpleHash(data.newPw);

    // Đồng bộ lên Cloud nếu đã cấu hình Supabase
    if (isSupabaseConfigured()) {
      try {
        const { error: updateErr } = await supabase
          .from("users")
          .update({ password_hash: newHash })
          .eq("id", account.id);
        if (updateErr) throw updateErr;
      } catch (err: any) {
        console.error("Supabase error changing password:", err);
      }
    }

    state = {
      ...state,
      accounts: state.accounts.map((a) =>
        String(a.id) === String(account.id) ? { ...a, passwordHash: newHash } : a
      ),
    };
    emit();
    return { ok: true };
  },

  currentUserHasPassword(): boolean {
    if (!state.currentUser) return false;
    const account = state.accounts.find(
      (a) => String(a.id) === String(state.currentUser!.id)
    );
    return !!account?.passwordHash;
  },

  triggerReRender() {
    state = { ...state };
    emit();
  },

  setProductsLoaded(val: boolean) {
    state = { ...state, isProductsLoaded: val };
    emit();
  },

  async placeOrder(data: {
    recipientName: string;
    phone: string;
    address: string;
    items: OrderItem[];
    totalAmount: number;
  }): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
    state = load(); // Load latest state
    const orderId = `DH-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: orderId,
      userId: state.currentUser ? state.currentUser.id : null,
      recipientName: data.recipientName.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      paymentMethod: "COD",
      items: data.items,
      totalAmount: data.totalAmount,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    // 1. Đồng bộ lên Cloud nếu đã cấu hình Supabase
    if (isSupabaseConfigured()) {
      try {
        const { error: insertErr } = await supabase.from("orders").insert({
          id: newOrder.id,
          user_id: newOrder.userId,
          recipient_name: newOrder.recipientName,
          phone: newOrder.phone,
          address: newOrder.address,
          payment_method: newOrder.paymentMethod,
          items: newOrder.items,
          total_amount: newOrder.totalAmount,
          status: newOrder.status,
          created_at: newOrder.createdAt,
        });
        if (insertErr) throw insertErr;
        console.log(`Successfully placed order ${orderId} on Supabase online!`);
      } catch (err: any) {
        console.error("Supabase placeOrder error, running local fallback:", err);
      }
    }

    state = {
      ...state,
      orders: [newOrder, ...state.orders],
    };
    emit();
    return { ok: true, orderId };
  },

  async fetchOrders(): Promise<Order[]> {
    state = load();
    if (!state.currentUser) return [];

    if (isSupabaseConfigured()) {
      try {
        const { data: cloudOrders, error: fetchErr } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", state.currentUser.id)
          .order("created_at", { ascending: false });

        if (fetchErr) throw fetchErr;

        if (cloudOrders) {
          const mapped: Order[] = cloudOrders.map((o: any) => ({
            id: o.id,
            userId: o.user_id,
            recipientName: o.recipient_name,
            phone: o.phone,
            address: o.address,
            paymentMethod: o.payment_method,
            items: o.items,
            totalAmount: Number(o.total_amount),
            status: o.status,
            createdAt: o.created_at,
          }));
          state = { ...state, orders: mapped };
          emit();
          return mapped;
        }
      } catch (err: any) {
        console.error("Supabase fetchOrders error:", err);
      }
    }
    return state.orders.filter(o => String(o.userId) === String(state.currentUser?.id));
  },

  async cancelOrder(orderId: string): Promise<{ ok: true } | { ok: false; error: string }> {
    state = load();
    const order = state.orders.find(o => String(o.id) === String(orderId));
    if (!order) return { ok: false, error: "Không tìm thấy đơn hàng" };
    if (order.status !== "PENDING") {
      return { ok: false, error: "Chỉ cho phép hủy đơn hàng khi ở trạng thái Chờ xử lý" };
    }

    if (isSupabaseConfigured()) {
      try {
        const { error: updateErr } = await supabase
          .from("orders")
          .update({ status: "CANCELLED" })
          .eq("id", orderId);
        if (updateErr) throw updateErr;
        console.log(`Successfully cancelled order ${orderId} on Supabase online!`);
      } catch (err: any) {
        console.error("Supabase cancelOrder error:", err);
        return { ok: false, error: "Không thể cập nhật trạng thái đơn hàng trên Cloud Database." };
      }
    }

    state = {
      ...state,
      orders: state.orders.map((o) =>
        String(o.id) === String(orderId) ? { ...o, status: "CANCELLED" as const } : o
      ),
    };
    emit();
    return { ok: true };
  },

  async fetchAllOrders(): Promise<Order[]> {
    state = load();
    if (!state.currentUser || (state.currentUser.role !== "MANAGER" && state.currentUser.role !== "ADMIN")) {
      return [];
    }

    if (isSupabaseConfigured()) {
      try {
        const { data: cloudOrders, error: fetchErr } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchErr) throw fetchErr;

        if (cloudOrders) {
          const mapped: Order[] = cloudOrders.map((o: any) => ({
            id: o.id,
            userId: o.user_id,
            recipientName: o.recipient_name,
            phone: o.phone,
            address: o.address,
            paymentMethod: o.payment_method,
            items: o.items,
            totalAmount: Number(o.total_amount),
            status: o.status,
            createdAt: o.created_at,
          }));
          state = { ...state, orders: mapped };
          emit();
          return mapped;
        }
      } catch (err: any) {
        console.error("Supabase fetchAllOrders error:", err);
      }
    }
    return state.orders;
  },

  async updateOrderStatus(orderId: string, status: Order["status"]): Promise<{ ok: true } | { ok: false; error: string }> {
    state = load();
    const order = state.orders.find(o => String(o.id) === String(orderId));
    if (!order) return { ok: false, error: "Không tìm thấy đơn hàng" };

    if (isSupabaseConfigured()) {
      try {
        const { error: updateErr } = await supabase
          .from("orders")
          .update({ status })
          .eq("id", orderId);
        if (updateErr) throw updateErr;
        console.log(`Successfully updated order ${orderId} to status ${status} on Supabase online!`);
      } catch (err: any) {
        console.error("Supabase updateOrderStatus error:", err);
        return { ok: false, error: "Không thể cập nhật trạng thái đơn hàng trên Cloud Database." };
      }
    }

    state = {
      ...state,
      orders: state.orders.map((o) =>
        String(o.id) === String(orderId) ? { ...o, status } : o
      ),
    };
    emit();
    return { ok: true };
  },

  async fetchAllAccounts(): Promise<AuthUser[]> {
    state = load();
    if (!state.currentUser || (state.currentUser.role !== "MANAGER" && state.currentUser.role !== "ADMIN")) {
      return [];
    }

    if (isSupabaseConfigured()) {
      try {
        const { data: cloudUsers, error: fetchErr } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false });

        if (fetchErr) throw fetchErr;

        if (cloudUsers) {
          const mapped: StoredAccount[] = cloudUsers.map((u: any) => ({
            id: u.id,
            email: u.email,
            passwordHash: u.password_hash || "",
            googleId: u.google_id || undefined,
            fullName: u.full_name,
            phone: u.phone || undefined,
            avatar: u.avatar_url || undefined,
            role: u.role || "USER",
            status: u.status || "ACTIVE",
            addresses: [],
          }));

          const { data: cloudAddrs, error: addrErr } = await supabase
            .from("addresses")
            .select("*");
          
          if (!addrErr && cloudAddrs) {
            mapped.forEach((acc) => {
              acc.addresses = cloudAddrs
                .filter((a: any) => String(a.user_id) === String(acc.id))
                .map((a: any) => ({
                  id: a.id,
                  recipientName: a.recipient_name,
                  phone: a.phone,
                  province: a.province,
                  district: a.district,
                  ward: a.ward,
                  street: a.street,
                  isDefault: a.is_default,
                }));
            });
          }

          state = { ...state, accounts: mapped };
          emit();
          return mapped;
        }
      } catch (err: any) {
        console.error("Supabase fetchAllAccounts error:", err);
      }
    }
    return state.accounts;
  },

  async toggleAccountLockStatus(accountId: string): Promise<{ ok: true } | { ok: false; error: string }> {
    state = load();
    if (!state.currentUser) return { ok: false, error: "Bạn chưa đăng nhập." };
    if (state.currentUser.role !== "ADMIN") {
      return { ok: false, error: "Chỉ quản trị viên mới có quyền thực hiện thao tác này." };
    }
    if (String(state.currentUser.id) === String(accountId)) {
      return { ok: false, error: "Bạn không thể tự khóa tài khoản của chính mình." };
    }

    const targetAccount = state.accounts.find((a) => String(a.id) === String(accountId));
    if (!targetAccount) return { ok: false, error: "Không tìm thấy tài khoản hệ thống." };

    const newStatus = targetAccount.status === "ACTIVE" ? "LOCKED" : "ACTIVE";

    if (isSupabaseConfigured()) {
      try {
        const { error: updateErr } = await supabase
          .from("users")
          .update({ status: newStatus })
          .eq("id", accountId);
        if (updateErr) throw updateErr;
      } catch (err: any) {
        console.error("Supabase toggleAccountLockStatus error:", err);
        return { ok: false, error: "Không thể cập nhật trạng thái tài khoản trên Cloud Database." };
      }
    }

    state = {
      ...state,
      accounts: state.accounts.map((a) =>
        String(a.id) === String(accountId) ? { ...a, status: newStatus } : a
      ),
    };
    emit();
    return { ok: true };
  },

  async changeAccountRole(accountId: string, role: UserRole): Promise<{ ok: true } | { ok: false; error: string }> {
    state = load();
    if (!state.currentUser) return { ok: false, error: "Bạn chưa đăng nhập." };
    if (state.currentUser.role !== "ADMIN") {
      return { ok: false, error: "Chỉ quản trị viên mới có quyền thực hiện thao tác này." };
    }
    if (String(state.currentUser.id) === String(accountId)) {
      return { ok: false, error: "Bạn không thể tự thay đổi quyền hạn của chính mình." };
    }
    if (role !== "USER" && role !== "MANAGER" && role !== "ADMIN") {
      return { ok: false, error: "Vai trò hệ thống không hợp lệ." };
    }

    if (isSupabaseConfigured()) {
      try {
        const { error: updateErr } = await supabase
          .from("users")
          .update({ role })
          .eq("id", accountId);
        if (updateErr) throw updateErr;
      } catch (err: any) {
        console.error("Supabase changeAccountRole error:", err);
        return { ok: false, error: "Không thể cập nhật quyền hạn tài khoản trên Cloud Database." };
      }
    }

    state = {
      ...state,
      accounts: state.accounts.map((a) =>
        String(a.id) === String(accountId) ? { ...a, role } : a
      ),
    };
    emit();
    return { ok: true };
  },

  async saveCollection(col: Collection) {
    state = load();
    const exists = state.collections.some((c) => c.id === col.id);
    let updated: Collection[];
    if (exists) {
      updated = state.collections.map((c) => (c.id === col.id ? col : c));
    } else {
      updated = [...state.collections, col];
    }

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("collections").upsert({
          id: col.id,
          name: col.name,
          title: col.title,
          intro: col.intro,
          banner: col.banner,
          thumbnail: col.thumbnail,
          is_visible: col.isVisible,
        });
        if (error) console.error("Supabase saveCollection error:", error);
      } catch (err) {
        console.error("Supabase sync collection failed:", err);
      }
    }

    state = { ...state, collections: updated };
    emit();
  },

  async deleteCollection(id: string) {
    state = load();
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("collections").delete().eq("id", id);
        if (error) console.error("Supabase deleteCollection error:", error);
      } catch (err) {
        console.error("Supabase delete collection failed:", err);
      }
    }
    state = {
      ...state,
      collections: state.collections.filter((c) => c.id !== id),
    };
    emit();
  },

  async fetchCollections(): Promise<Collection[]> {
    state = load();
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("collections")
          .select("*")
          .order("created_at", { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: Collection[] = data.map((c: any) => ({
            id: c.id,
            name: c.name,
            title: c.title,
            intro: c.intro,
            banner: c.banner,
            thumbnail: c.thumbnail,
            isVisible: c.is_visible,
          }));
          state = { ...state, collections: mapped };
          emit();
          return mapped;
        }
      } catch (e) {
        console.error("Supabase fetchCollections error:", e);
      }
    }
    return state.collections;
  },

  async saveSlide(slide: Slide) {
    state = load();
    const exists = state.slides.some((s) => s.id === slide.id);
    let updated: Slide[];
    if (exists) {
      updated = state.slides.map((s) => (s.id === slide.id ? slide : s));
    } else {
      updated = [...state.slides, slide];
    }
    updated.sort((a, b) => a.sortOrder - b.sortOrder);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("slides").upsert({
          id: slide.id,
          title: slide.title || null,
          subtitle: slide.subtitle || null,
          image: slide.image,
          link: slide.link || null,
          sort_order: slide.sortOrder,
        });
        if (error) console.error("Supabase saveSlide error:", error);
      } catch (err) {
        console.error("Supabase sync slide failed:", err);
      }
    }

    state = { ...state, slides: updated };
    emit();
  },

  async deleteSlide(id: string) {
    state = load();
    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("slides").delete().eq("id", id);
        if (error) console.error("Supabase deleteSlide error:", error);
      } catch (err) {
        console.error("Supabase delete slide failed:", err);
      }
    }
    state = {
      ...state,
      slides: state.slides.filter((s) => s.id !== id),
    };
    emit();
  },

  async fetchSlides(): Promise<Slide[]> {
    state = load();
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("slides")
          .select("*")
          .order("sort_order", { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: Slide[] = data.map((s: any) => ({
            id: s.id,
            title: s.title || undefined,
            subtitle: s.subtitle || undefined,
            image: s.image,
            link: s.link || undefined,
            sortOrder: s.sort_order || 0,
          }));
          state = { ...state, slides: mapped };
          emit();
          return mapped;
        }
      } catch (e) {
        console.error("Supabase fetchSlides error:", e);
      }
    }
    return state.slides;
  },
  updateSocialLinks(links: Partial<SocialLinks>) {
    state = {
      ...state,
      socialLinks: {
        ...state.socialLinks,
        ...links,
      },
    };
    emit();
  },
};

if (typeof window !== "undefined") {
  setTimeout(() => {
    storeActions.fetchCollections();
    storeActions.fetchSlides();
    const user = load().currentUser;
    if (user && (user.role === "MANAGER" || user.role === "ADMIN")) {
      storeActions.fetchAllOrders();
      storeActions.fetchAllAccounts();
    } else if (user) {
      storeActions.fetchOrders();
    }
  }, 150);
}
