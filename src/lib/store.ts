import { useSyncExternalStore } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";

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
};

type State = {
  cart: CartItem[];
  wishlist: string[];
  currentUser: AuthUser | null;
  accounts: StoredAccount[];
  reviews: ProductReview[];
  products: Product[];
  orders: Order[];
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

function load(): State {
  if (typeof window === "undefined")
    return { cart: [], wishlist: [], currentUser: null, accounts: [], reviews: defaultReviews, products: [], orders: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cart: [], wishlist: [], currentUser: null, accounts: [], reviews: defaultReviews, products: [], orders: [] };
    const parsed = JSON.parse(raw);
    return {
      cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
      currentUser: parsed.currentUser ?? null,
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : defaultReviews,
      products: Array.isArray(parsed.products) ? parsed.products : [],
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch {
    return { cart: [], wishlist: [], currentUser: null, accounts: [], reviews: defaultReviews, products: [], orders: [] };
  }
}

let state: State = load();

// Simple hash for demo (NOT for production)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(16);
}
const listeners = new Set<() => void>();

function emit() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
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
  ({ cart: [], wishlist: [], currentUser: null, accounts: [], reviews: defaultReviews, products: [], orders: [] }) as State;

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
  toggleWishlist(slug: string) {
    const has = state.wishlist.includes(slug);
    state = {
      ...state,
      wishlist: has
        ? state.wishlist.filter((s) => s !== slug)
        : [...state.wishlist, slug],
    };
    emit();
  },
  removeFromWishlist(slug: string) {
    state = {
      ...state,
      wishlist: state.wishlist.filter((s) => s !== slug),
    };
    emit();
  },

  // ── Review actions ─────────────────────────────────────────────
  addReview(productSlug: string, rating: number, comment: string) {
    if (!state.currentUser) return;
    const newReview: ProductReview = {
      id: Date.now().toString(),
      productSlug,
      userName: state.currentUser.fullName,
      userAvatar: state.currentUser.avatar,
      rating,
      comment,
      date: new Date().toLocaleDateString("vi-VN"),
    };
    state = {
      ...state,
      reviews: [newReview, ...state.reviews],
    };
    emit();
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
    return { ok: true, user: authUser };
  },

  logout() {
    state = { ...state, currentUser: null };
    emit();
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
};
