import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  ShieldAlert,
  LayoutDashboard,
  ShoppingBag,
  Plus,
  Trash2,
  Edit,
  Search,
  Check,
  X,
  Cloud,
  CloudOff,
  Database,
  Layers,
  Sparkles,
  User,
  LogOut,
  Sliders,
  Image as ImageIcon,
  Compass,
  DollarSign,
  ChevronRight,
  TrendingUp,
  FileText,
  Maximize2,
  Eye,
  Lock,
  Unlock,
  Star
} from "lucide-react";
import { storeActions, useStore } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { products } from "@/data/products";
import { formatProductPrice } from "@/lib/utils";
import { ProductCardSkeleton } from "@/components/SiteChrome";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Obsidian & Gold Suite — Luna Jewel Admin" },
      { name: "description", content: "Luna Jewel's premium obsidian-gold editorial administration suite." },
    ],
  }),
  component: EditorialAdminDashboard,
});

import { COLLECTION_NAMES } from "@/lib/store";

const DEFAULT_DESCRIPTION =
  "1. Thông tin sản phẩm.\nChất liệu: Bạc 925 an toàn cho da, 100% không gỉ và bền.\nSản phẩm được tặng kèm hộp đựng và nước rửa bạc chuyên dụng.\nHướng dẫn bảo quản: tránh tiếp xúc hóa chất, chất tẩy rửa mạnh.\nLưu ý khi sử dụng: Tránh va đập, sử dụng nhẹ nhàng tránh vướng mắc vào quần áo.\n\n2. Hướng dẫn sử dụng sản phẩm.\nHãy tháo trang sức lúc chơi thể thao, tắm biển, bơi,... để tránh bạc xước và xỉn màu.\nLưu ý khi sử dụng mỹ phẩm thì các chất hóa học có thể làm phai màu bạc.\n\n3. Luna Jewel cam kết.\nSản phẩm 100% giống mô tả.\nĐảm bảo chất lượng và chất liệu bạc 100%.\nSản phẩm được kiểm tra cẩn thận, kỹ càng trước khi giao cho Quý khách.\nGiao hàng toàn quốc, thanh toán khi nhận hàng.";

function EditorialAdminDashboard() {
  const { currentUser, collections = [], slides = [], orders = [], accounts = [], reviews = [], isProductsLoaded } = useStore();
  const navigate = useNavigate();

  // Load Google Fonts for Luxury Aesthetic dynamically
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  
  // Load reviews on mount for review management (UC29)
  useEffect(() => {
    storeActions.fetchReviews();
  }, []);



  // Active administrative tab switcher state
  const [activeTab, setActiveTab] = useState<"products" | "collections" | "slides" | "orders" | "customers" | "reviews" | "analytics" | "accounts">("products");

  // State Management - Products
  const [searchQuery, setSearchQuery] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [price, setPrice] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [img, setImg] = useState("");
  const [description, setDescription] = useState(DEFAULT_DESCRIPTION);
  const [info, setInfo] = useState("");
  const [specs, setSpecs] = useState({
    "Kiểu dáng": "Dây chuyền tinh xảo",
    "Chất liệu": "Bạc Ý 925 cao cấp",
    "Màu sắc": "Bạc sáng",
    "Độ dài dây": "40cm + 5cm",
    "Kích thước": "Mặt dây 1.2cm",
    "Cách bảo quản & chăm sóc": "Tránh hóa chất, lau khô sau khi dùng.",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setLocalTick] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Product Sub-Images State Management
  const [images, setImages] = useState<string[]>([]);
  const [newSubImageUrl, setNewSubImageUrl] = useState("");
  const subFileInputRef = useRef<HTMLInputElement>(null);
  
  // AR State Management (UC24)
  const [arImg, setArImg] = useState("");
  const [arScale, setArScale] = useState(60);
  const [arOffsetY, setArOffsetY] = useState(55);
  const [arOffsetX, setArOffsetX] = useState(0);
  const [arRotation, setArRotation] = useState(0);
  const arFileInputRef = useRef<HTMLInputElement>(null);

  // State Management - Collections (UC25)
  const [isColDrawerOpen, setIsColDrawerOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any | null>(null);
  const [colId, setColId] = useState("");
  const [colName, setColName] = useState("");
  const [colTitle, setColTitle] = useState("");
  const [colIntro, setColIntro] = useState("");
  const [colThumbnail, setColThumbnail] = useState("");
  const [colBanner, setColBanner] = useState("");
  const [colIsVisible, setColIsVisible] = useState(true);
  const [assignedProductSlugs, setAssignedProductSlugs] = useState<string[]>([]);
  const [colFormErrors, setColFormErrors] = useState<Record<string, string>>({});
  const [colIsSubmitting, setColIsSubmitting] = useState(false);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // State Management - Slides (UC26)
  const [isSlideDrawerOpen, setIsSlideDrawerOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any | null>(null);
  const [slideId, setSlideId] = useState("");
  const [slideTitle, setSlideTitle] = useState("");
  const [slideSubtitle, setSlideSubtitle] = useState("");
  const [slideImage, setSlideImage] = useState("");
  const [slideLink, setSlideLink] = useState("");
  const [slideSortOrder, setSlideSortOrder] = useState<number>(0);
  const [slideFormErrors, setSlideFormErrors] = useState<Record<string, string>>({});
  const [slideIsSubmitting, setSlideIsSubmitting] = useState(false);

  const slideImageInputRef = useRef<HTMLInputElement>(null);

  const isCloudActive = isSupabaseConfigured();

  // Statistics
  const totalProducts = products.length;
  const activeCollections = collections.length;
  
  const filteredProducts = products.filter(
    (p) =>
      p &&
      ((p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.slug || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredCollections = collections.filter(
    (c) =>
      c &&
      ((c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSlides = slides.filter(
    (s: any) =>
      s &&
      ((s.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.subtitle || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredOrders = orders.filter(
    (o: any) =>
      o &&
      ((o.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.recipientName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.phone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.address || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.items || []).some((item: any) => (item.name || "").toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const customers = accounts.filter((a: any) => a.role === "USER");
  const filteredCustomers = customers.filter(
    (c: any) =>
      c &&
      ((c.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.phone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.id || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredReviews = reviews.filter((r: any) => {
    if (!r) return false;
    const query = searchQuery.toLowerCase();
    const product = products.find((p) => p.slug === r.productSlug);
    const productName = (product?.name || "").toLowerCase();
    return (
      (r.userName || "").toLowerCase().includes(query) ||
      (r.comment || "").toLowerCase().includes(query) ||
      (r.productSlug || "").toLowerCase().includes(query) ||
      productName.includes(query)
    );
  });

  const filteredAccounts = accounts.filter((a: any) => {
    if (!a) return false;
    const query = searchQuery.toLowerCase();
    return (
      (a.fullName || "").toLowerCase().includes(query) ||
      (a.email || "").toLowerCase().includes(query) ||
      (a.phone || "").toLowerCase().includes(query) ||
      (a.id || "").toLowerCase().includes(query) ||
      (a.role || "").toLowerCase().includes(query)
    );
  });

  // ── Analytics computations (UC30) ──────────────────────────────
  const analyticsData = useMemo(() => {
    // 1. Core counters
    const deliveredOrders = orders.filter((o: any) => o.status === "DELIVERED");
    const activeOrders = orders.filter((o: any) => o.status !== "CANCELLED" && o.status !== "DELIVERED");
    
    const totalRevenue = deliveredOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    const pendingRevenue = activeOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
    
    const successCount = deliveredOrders.length;
    const cancelCount = orders.filter((o: any) => o.status === "CANCELLED").length;
    
    // 2. Doanh thu theo ngày (7 ngày gần nhất)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    }).reverse();

    const dailyRevenue = last7Days.map((dayStr) => {
      const dayOrders = orders.filter((o: any) => {
        if (o.status === "CANCELLED") return false;
        try {
          const oDate = new Date(o.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
          return oDate === dayStr;
        } catch {
          return false;
        }
      });
      const revenue = dayOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      return { label: dayStr, value: revenue, count: dayOrders.length };
    });

    // 3. Doanh thu theo tháng (6 tháng gần nhất)
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return d.toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" });
    }).reverse();

    const monthlyRevenue = last6Months.map((monthStr) => {
      const monthOrders = orders.filter((o: any) => {
        if (o.status === "CANCELLED") return false;
        try {
          const date = new Date(o.createdAt);
          const oMonth = date.toLocaleDateString("vi-VN", { month: "2-digit", year: "numeric" });
          return oMonth === monthStr;
        } catch {
          return false;
        }
      });
      const revenue = monthOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
      return { label: monthStr, value: revenue, count: monthOrders.length };
    });

    // 4. Top sản phẩm bán chạy
    const productSalesMap: Record<string, { qty: number; revenue: number; name: string; img: string }> = {};
    orders.forEach((o: any) => {
      if (o.status === "CANCELLED") return;
      (o.items || []).forEach((item: any) => {
        const key = item.slug;
        const qty = Number(item.qty || 0);
        const itemPrice = parseFloat((item.price || "0").replace(/[^0-9]/g, "")) || 0;
        const revenue = qty * itemPrice;
        
        if (productSalesMap[key]) {
          productSalesMap[key].qty += qty;
          productSalesMap[key].revenue += revenue;
        } else {
          productSalesMap[key] = {
            qty,
            revenue,
            name: item.name || item.slug,
            img: item.img || "",
          };
        }
      });
    });

    const topSellingProducts = Object.entries(productSalesMap)
      .map(([slug, data]) => ({ slug, ...data }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      totalRevenue,
      pendingRevenue,
      successCount,
      cancelCount,
      dailyRevenue,
      monthlyRevenue,
      topSellingProducts,
    };
  }, [orders]);

  // Authentication & Authorization Guard
  if (!currentUser || (currentUser.role !== "MANAGER" && currentUser.role !== "ADMIN")) {
    return (
      <div 
        className="min-h-screen bg-[#07090e] text-white flex flex-col items-center justify-center p-6"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[140px] opacity-20 bg-amber-500/30 pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[140px] opacity-10 bg-emerald-500/20 pointer-events-none" />

        <div className="max-w-md w-full bg-[#0d111d]/90 backdrop-blur-md rounded-[32px] border border-white/10 shadow-2xl p-10 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          
          <h1 
            className="text-2xl font-semibold tracking-[0.15em] text-amber-400 uppercase mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Access Restricted
          </h1>
          <p className="text-sm text-slate-400 mb-8 leading-relaxed">
            Trang này chỉ dành riêng cho tài khoản Quản lý hoặc Admin của **Luna Jewel**. Vui lòng đăng nhập với thông tin tài khoản phù hợp để tiếp tục.
          </p>
          
          <div className="space-y-3">
            <Link
              to="/tai-khoan"
              className="block w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-lg shadow-amber-500/15 cursor-pointer"
            >
              Đăng nhập Quản lý
            </Link>
            <Link
              to="/"
              className="block w-full py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer"
            >
              Về Trang Chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Collection Handlers (UC25)
  const resetCollectionForm = () => {
    setColId("");
    setColName("");
    setColTitle("");
    setColIntro("");
    setColThumbnail("");
    setColBanner("");
    setColIsVisible(true);
    setAssignedProductSlugs([]);
    setColFormErrors({});
    setEditingCollection(null);
  };

  const handleOpenAddCollection = () => {
    resetCollectionForm();
    setIsColDrawerOpen(true);
  };

  const handleOpenEditCollection = (c: any) => {
    setEditingCollection(c);
    setColId(c.id);
    setColName(c.name);
    setColTitle(c.title);
    setColIntro(c.intro);
    setColThumbnail(c.thumbnail || "");
    setColBanner(c.banner || "");
    setColIsVisible(c.isVisible);
    
    // Find products assigned to this collection
    const assignedSlugs = products
      .filter((p) => p.collectionId === c.id)
      .map((p) => p.slug);
    setAssignedProductSlugs(assignedSlugs);
    setColFormErrors({});
    setIsColDrawerOpen(true);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước ảnh đại diện không được lớn hơn 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setColThumbnail(dataUrl);
      toast.success("Tải ảnh đại diện thành công! 📸");
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước ảnh bìa không được lớn hơn 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setColBanner(dataUrl);
      toast.success("Tải ảnh bìa thành công! 📸");
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCollection = async (targetId: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa bộ sưu tập "${targetId}"? Các sản phẩm liên kết sẽ được gỡ khỏi bộ sưu tập này.`)) return;

    try {
      // 1. Delete collection from Supabase and Local fallback
      await storeActions.deleteCollection(targetId);

      // 2. Update products locally and online
      const affectedProducts = products.filter((p) => p.collectionId === targetId);
      for (const p of affectedProducts) {
        p.collectionId = undefined;
        if (isSupabaseConfigured()) {
          await supabase
            .from("products")
            .update({ collection_id: null })
            .eq("slug", p.slug);
        }
      }

      storeActions.triggerReRender();
      setLocalTick((t) => t + 1);
      toast.success("Đã xóa bộ sưu tập thành công!");
    } catch (err: any) {
      console.error("Lỗi khi xóa bộ sưu tập:", err);
      toast.error("Không thể xóa bộ sưu tập. Vui lòng thử lại!");
    }
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!colId.trim()) {
      errors.id = "Mã bộ sưu tập không được để trống";
    } else if (!/^[a-z0-9-]+$/.test(colId)) {
      errors.id = "Mã bộ sưu tập chỉ được chứa chữ thường, số và dấu gạch ngang";
    } else if (!editingCollection && collections.some((c) => c.id === colId)) {
      errors.id = "Mã bộ sưu tập này đã tồn tại";
    }

    if (!colName.trim()) errors.name = "Tên bộ sưu tập không được để trống";
    if (!colTitle.trim()) errors.title = "Tiêu đề chi tiết không được để trống";
    if (!colIntro.trim()) errors.intro = "Giới thiệu bộ sưu tập không được để trống";
    if (!colThumbnail.trim()) errors.thumbnail = "Cần chọn ảnh đại diện hoặc dán URL";
    if (!colBanner.trim()) errors.banner = "Cần chọn ảnh bìa hoặc dán URL";

    if (Object.keys(errors).length > 0) {
      setColFormErrors(errors);
      return;
    }

    setColIsSubmitting(true);
    try {
      const colPayload = {
        id: colId.trim(),
        name: colName.trim(),
        title: colTitle.trim(),
        intro: colIntro.trim(),
        banner: colBanner.trim(),
        thumbnail: colThumbnail.trim(),
        isVisible: colIsVisible,
      };

      // 1. Save Collection
      await storeActions.saveCollection(colPayload);

      // 2. Update Product Assignments
      for (const p of products) {
        const shouldBeInCol = assignedProductSlugs.includes(p.slug);
        const isInColNow = p.collectionId === colPayload.id;

        if (shouldBeInCol && !isInColNow) {
          p.collectionId = colPayload.id;
          if (isSupabaseConfigured()) {
            await supabase
              .from("products")
              .update({ collection_id: colPayload.id })
              .eq("slug", p.slug);
          }
        } else if (!shouldBeInCol && isInColNow) {
          p.collectionId = undefined;
          if (isSupabaseConfigured()) {
            await supabase
              .from("products")
              .update({ collection_id: null })
              .eq("slug", p.slug);
          }
        }
      }

      storeActions.triggerReRender();
      setLocalTick((t) => t + 1);
      toast.success(editingCollection ? "Đã cập nhật bộ sưu tập thành công! 🎉" : "Đã thêm bộ sưu tập mới thành công! 🎉");
      setIsColDrawerOpen(false);
      resetCollectionForm();
    } catch (err: any) {
      console.error("Lỗi khi lưu bộ sưu tập:", err);
      toast.error("Đã xảy ra lỗi khi lưu bộ sưu tập. Vui lòng thử lại!");
    } finally {
      setColIsSubmitting(false);
    }
  };

  // Slide Handlers (UC26)
  const resetSlideForm = () => {
    setSlideId("");
    setSlideTitle("");
    setSlideSubtitle("");
    setSlideImage("");
    setSlideLink("");
    setSlideSortOrder(0);
    setSlideFormErrors({});
    setEditingSlide(null);
  };

  const handleOpenAddSlide = () => {
    resetSlideForm();
    setIsSlideDrawerOpen(true);
  };

  const handleOpenEditSlide = (s: any) => {
    setEditingSlide(s);
    setSlideId(s.id);
    setSlideTitle(s.title || "");
    setSlideSubtitle(s.subtitle || "");
    setSlideImage(s.image);
    setSlideLink(s.link || "");
    setSlideSortOrder(s.sortOrder);
    setSlideFormErrors({});
    setIsSlideDrawerOpen(true);
  };

  const handleSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước ảnh slide không được lớn hơn 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSlideImage(dataUrl);
      toast.success("Tải ảnh slide thành công! 📸");
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteSlide = async (targetId: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa slide "${targetId}"?`)) return;

    try {
      await storeActions.deleteSlide(targetId);
      storeActions.triggerReRender();
      setLocalTick((t) => t + 1);
      toast.success("Đã xóa slide thành công!");
    } catch (err: any) {
      console.error("Lỗi khi xóa slide:", err);
      toast.error("Không thể xóa slide. Vui lòng thử lại!");
    }
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!slideId.trim()) {
      errors.id = "Mã slide không được để trống";
    } else if (!/^[a-z0-9-]+$/.test(slideId)) {
      errors.id = "Mã slide chỉ được chứa chữ thường, số và dấu gạch ngang";
    } else if (!editingSlide && slides.some((s: any) => s.id === slideId)) {
      errors.id = "Mã slide này đã tồn tại";
    }

    if (!slideImage.trim()) errors.image = "Cần chọn ảnh slide hoặc dán URL ảnh";

    if (Object.keys(errors).length > 0) {
      setSlideFormErrors(errors);
      return;
    }

    setSlideIsSubmitting(true);
    try {
      const slidePayload = {
        id: slideId.trim(),
        title: slideTitle.trim() || undefined,
        subtitle: slideSubtitle.trim() || undefined,
        image: slideImage.trim(),
        link: slideLink.trim() || undefined,
        sortOrder: Number(slideSortOrder) || 0,
      };

      await storeActions.saveSlide(slidePayload);
      storeActions.triggerReRender();
      setLocalTick((t) => t + 1);
      toast.success(editingSlide ? "Đã cập nhật slide thành công! 🎉" : "Đã thêm slide mới thành công! 🎉");
      setIsSlideDrawerOpen(false);
      resetSlideForm();
    } catch (err: any) {
      console.error("Lỗi khi lưu slide:", err);
      toast.error("Đã xảy ra lỗi khi lưu slide. Vui lòng thử lại!");
    } finally {
      setSlideIsSubmitting(false);
    }
  };

  // Order Handlers (UC27)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: any) => {
    try {
      const res = await storeActions.updateOrderStatus(orderId, newStatus);
      if (res.ok) {
        let vnStatus = "Đơn hàng";
        if (newStatus === "PROCESSING") vnStatus = "Đang đóng gói 📦";
        else if (newStatus === "SHIPPED") vnStatus = "Đang giao hàng 🚚";
        else if (newStatus === "DELIVERED") vnStatus = "Đã giao thành công 🎉";
        else if (newStatus === "CANCELLED") vnStatus = "Đã hủy 🗑️";
        
        toast.success(`Cập nhật trạng thái đơn hàng sang "${vnStatus}" thành công!`);
        storeActions.triggerReRender();
        setLocalTick((t) => t + 1);
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.");
    }
  };


  const handleLogout = () => {
    storeActions.logout();
    toast.info("Đã đăng xuất tài khoản quản trị");
    navigate({ to: "/" });
  };

  const resetForm = () => {
    setSlug("");
    setName("");
    setShortName("");
    setPrice("");
    setCollectionId("");
    setImg("");
    setDescription(DEFAULT_DESCRIPTION);
    setInfo("");
    setSpecs({
      "Kiểu dáng": "Dây chuyền tinh xảo",
      "Chất liệu": "Bạc Ý 925 cao cấp",
      "Màu sắc": "Bạc sáng",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 1.2cm",
      "Cách bảo quản & chăm sóc": "Tránh hóa chất, lau khô sau khi dùng.",
    });
    setArImg("");
    setArScale(60);
    setArOffsetY(55);
    setArOffsetX(0);
    setArRotation(0);
    setImages([]);
    setNewSubImageUrl("");
    setFormErrors({});
    setEditingProduct(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setSlug(p.slug);
    setName(p.name);
    setShortName(p.shortName);
    setPrice(p.price);
    setCollectionId(p.collectionId || "");
    setImg(p.img || "");
    setDescription(p.description || DEFAULT_DESCRIPTION);
    setInfo(p.info || "");
    setSpecs({
      "Kiểu dáng": p.specs?.["Kiểu dáng"] || "Dây chuyền tinh xảo",
      "Chất liệu": p.specs?.["Chất liệu"] || "Bạc Ý 925 cao cấp",
      "Màu sắc": p.specs?.["Màu sắc"] || "Bạc sáng",
      "Độ dài dây": p.specs?.["Độ dài dây"] || "40cm + 5cm",
      "Kích thước": p.specs?.["Kích thước"] || "Mặt dây 1.2cm",
      "Cách bảo quản & chăm sóc": p.specs?.["Cách bảo quản & chăm sóc"] || "Tránh hóa chất, lau khô sau khi dùng.",
    });
    setArImg(p.specs?.arImg || "");
    setArScale(p.specs?.arScale !== undefined ? Number(p.specs.arScale) : 60);
    setArOffsetY(p.specs?.arOffsetY !== undefined ? Number(p.specs.arOffsetY) : 55);
    setArOffsetX(p.specs?.arOffsetX !== undefined ? Number(p.specs.arOffsetX) : 0);
    setArRotation(p.specs?.arRotation !== undefined ? Number(p.specs.arRotation) : 0);
    setImages(p.images || []);
    setNewSubImageUrl("");
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được lớn hơn 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImg(dataUrl);
      toast.success("Tải ảnh lên thành công! 📸");
    };
    reader.readAsDataURL(file);
  };

  const handleArImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn tệp hình ảnh hợp lệ!");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được lớn hơn 2MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setArImg(dataUrl);
      toast.success("Tải ảnh AR trong suốt thành công! 🌟");
    };
    reader.readAsDataURL(file);
  };

  // Product Sub-Images Handlers
  const handleAddSubImageUrl = () => {
    const url = newSubImageUrl.trim();
    if (!url) return;
    setImages([...images, url]);
    setNewSubImageUrl("");
    toast.success("Đã thêm một ảnh phụ! 📸");
  };

  const handleRemoveSubImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    toast.info("Đã xóa ảnh phụ 🗑️");
  };

  const handleSubImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn ảnh hợp lệ!");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ảnh không được lớn hơn 2MB!");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImages([...images, dataUrl]);
      toast.success("Tải ảnh phụ lên thành công! 📸");
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = async (targetSlug: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${targetSlug}"?`)) return;

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("slug", targetSlug);
        if (error) throw error;
      }

      const idx = products.findIndex((p) => p.slug === targetSlug);
      if (idx !== -1) {
        products.splice(idx, 1);
      }

      storeActions.triggerReRender();
      setLocalTick((t) => t + 1);
      toast.success("Đã xóa sản phẩm thành công!");
    } catch (err: any) {
      console.error("Lỗi khi xóa sản phẩm:", err);
      toast.error("Không thể xóa sản phẩm. Vui lòng thử lại!");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!slug.trim()) {
      errors.slug = "Slug không được để trống";
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.slug = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang";
    } else if (!editingProduct && products.some((p) => p.slug === slug)) {
      errors.slug = "Slug này đã tồn tại ở một sản phẩm khác";
    }

    if (!name.trim()) errors.name = "Tên sản phẩm không được để trống";
    if (!shortName.trim()) errors.shortName = "Tên hiển thị ngắn không được để trống";
    if (!price.trim()) errors.price = "Giá sản phẩm không được để trống";
    if (!img.trim()) errors.img = "Cần chọn ảnh sản phẩm hoặc dán URL ảnh";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const collectionVal = collectionId || null;
      const productPayload = {
        slug: slug.trim(),
        img: img.trim(),
        name: name.trim(),
        shortName: shortName.trim(),
        price: price.trim(),
        description: description.trim(),
        specs: {
          ...specs,
          arImg: arImg.trim(),
          arScale,
          arOffsetY,
          arOffsetX,
          arRotation,
        },
        info: info.trim() || `THÔNG TIN ${name.toUpperCase()}`,
        collectionId: collectionVal || undefined,
        images: images,
      };

      if (isSupabaseConfigured()) {
        const dbPayload = {
          slug: productPayload.slug,
          img: productPayload.img,
          name: productPayload.name,
          short_name: productPayload.shortName,
          price: parseInt(String(productPayload.price).replace(/[^\d]/g, ""), 10) || 0,
          description: productPayload.description,
          specs: productPayload.specs,
          info: productPayload.info,
          collection_id: collectionVal,
          images: images,
        };

        const { error } = await supabase.from("products").upsert(dbPayload);
        if (error) throw error;
      }

      if (editingProduct) {
        const idx = products.findIndex((p) => p.slug === editingProduct.slug);
        if (idx !== -1) {
          products[idx] = productPayload;
        }
      } else {
        products.unshift(productPayload);
      }

      storeActions.triggerReRender();
      setLocalTick((t) => t + 1);
      toast.success(editingProduct ? "Đã cập nhật sản phẩm thành công! 🎉" : "Đã thêm sản phẩm mới thành công! 🎉");
      setIsDrawerOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("Lỗi khi lưu sản phẩm:", err);
      if (err?.code === "PGRST204" || (err?.message && err.message.includes("images"))) {
        toast.error("Thiếu cột 'images' trên cơ sở dữ liệu Supabase online!", {
          description: "Vui lòng vào Supabase Dashboard -> SQL Editor và chạy lệnh: ALTER TABLE products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;",
          duration: 10000,
        });
      } else {
        toast.error("Đã xảy ra lỗi khi lưu sản phẩm. Vui lòng thử lại!");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col overflow-x-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Dark Ambient Radial Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[160px] opacity-15 bg-amber-500/20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[160px] opacity-10 bg-emerald-500/10 pointer-events-none" />

      {/* Luxury Editorial Header */}
      <header className="border-b border-white/5 bg-[#0a0d18]/50 backdrop-blur-md sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-amber-500">Luna Jewel Suite</span>
            <h1 
              className="text-lg md:text-xl font-semibold tracking-wider text-white mt-0.5"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Obsidian & Gold Panel
            </h1>
          </div>
        </div>

        {/* Database Sync Badge */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111625] border border-white/5 text-xs text-slate-400">
            {isCloudActive ? (
              <>
                <Cloud className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Supabase Online</span>
              </>
            ) : (
              <>
                <CloudOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Offline Storage</span>
              </>
            )}
          </div>

          {/* User Account Info */}
          <div className="flex items-center gap-3 pl-4 border-l border-white/10">
            <div className="text-right hidden md:block">
              <div className="text-xs font-bold text-slate-200">{currentUser.fullName}</div>
              <div className="text-[9px] text-amber-500 uppercase tracking-widest font-semibold mt-0.5">{currentUser.role}</div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500 hover:text-black transition-all duration-300 cursor-pointer text-slate-300"
              title="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Luxury Admin Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 flex flex-col gap-10">
        
        {/* Editorial Title Banner */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div>
            <h2 
              className="text-3xl md:text-4xl font-light text-white tracking-wide"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {activeTab === "products" 
                ? "Bảng Điều Phối Kho Hàng" 
                : activeTab === "collections" 
                ? "Quản Lý Bộ Sưu Tập" 
                : activeTab === "slides"
                ? "Quản Lý Banners & Slideshow"
                : activeTab === "orders"
                ? "Quản Lý Đơn Hàng"
                : "Quản Lý Khách Hàng"}
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-lg">
              {activeTab === "products" 
                ? "Không gian quản lý sản phẩm trang sức tinh chọn, gán bộ sưu tập và cập nhật kho hàng thời gian thực cho Luna Jewel." 
                : activeTab === "collections"
                ? "Không gian tạo mới, chỉnh sửa và quản lý các chủ đề bộ sưu tập trang sức nghệ thuật của Luna Jewel."
                : activeTab === "slides"
                ? "Không gian thiết lập các slide banner slideshow quảng cáo trang nhã xuất hiện ngoài trang chủ của Luna Jewel."
                : activeTab === "orders"
                ? "Không gian tiếp nhận và xử lý, cập nhật tiến độ giao nhận đơn hàng trang sức thời trang Luna Jewel."
                : "Không gian thống kê thông tin hồ sơ khách hàng, sổ địa chỉ giao nhận và lịch sử mua sắm trực tuyến của người dùng."}
            </p>
          </div>
          
          {activeTab !== "orders" && activeTab !== "customers" && activeTab !== "reviews" && activeTab !== "analytics" && activeTab !== "accounts" && (
            <button
              onClick={
                activeTab === "products" 
                  ? handleOpenAdd 
                  : activeTab === "collections" 
                  ? handleOpenAddCollection 
                  : handleOpenAddSlide
              }
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-extrabold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3px]" />{" "}
              {activeTab === "products" 
                ? "Thêm Trang Sức Mới" 
                : activeTab === "collections" 
                ? "Thêm Bộ Sưu Tập Mới" 
                : "Thêm Slide Banner Mới"}
            </button>
          )}
        </div>

        {/* Dynamic Editorial Stats Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card: Total Products */}
          <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-amber-500/5 flex items-center justify-center text-amber-500 border border-amber-500/10">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Luna Inventory</span>
              {!isProductsLoaded ? (
                <div className="h-9 bg-white/5 rounded-md w-16 animate-pulse mt-2" />
              ) : (
                <div 
                  className="text-4xl font-medium text-white mt-1.5"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {totalProducts}
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Bản ghi trang sức cao cấp trực quan
            </p>
          </div>

          {/* Card: Active Collections */}
          <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-amber-500/5 flex items-center justify-center text-amber-500 border border-amber-500/10">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Active Themes</span>
              {!isProductsLoaded ? (
                <div className="h-9 bg-white/5 rounded-md w-12 animate-pulse mt-2" />
              ) : (
                <div 
                  className="text-4xl font-medium text-white mt-1.5"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {activeCollections}
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-2">
              <Compass className="w-3.5 h-3.5 text-amber-500" /> Bộ sưu tập mang chủ đề nghệ thuật
            </p>
          </div>

          {/* Card: Luna Orders */}
          <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-amber-500/5 flex items-center justify-center text-amber-500 border border-amber-500/10">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Luna Orders</span>
              {!isProductsLoaded ? (
                <div className="h-9 bg-white/5 rounded-md w-12 animate-pulse mt-2" />
              ) : (
                <div 
                  className="text-4xl font-medium text-white mt-1.5"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {orders.length}
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> {orders.filter((o: any) => o.status === "PENDING").length} đơn hàng chờ xử lý
            </p>
          </div>

          {/* Card: Customer Accounts */}
          <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-amber-500/5 flex items-center justify-center text-amber-500 border border-amber-500/10">
              <User className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Luna Accounts</span>
              {!isProductsLoaded ? (
                <div className="h-9 bg-white/5 rounded-md w-12 animate-pulse mt-2" />
              ) : (
                <div 
                  className="text-4xl font-medium text-white mt-1.5"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {customers.length}
                </div>
              )}
            </div>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-2">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Hồ sơ khách hàng hoạt động ổn định
            </p>
          </div>

        </div>

        {/* Minimalist Editorial Controls */}
        <div className="space-y-6">

          {/* Luxury Editorial Tabs Selector */}
          <div className="flex border-b border-white/5 pb-px gap-8">
            <button
              onClick={() => {
                setActiveTab("products");
                setSearchQuery("");
              }}
              className={`pb-4 text-xs font-bold uppercase tracking-widest relative transition-all duration-300 cursor-pointer ${
                activeTab === "products"
                  ? "text-amber-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span>
                📦 Quản Lý Trang Sức
                {!isProductsLoaded ? (
                  <span className="inline-block w-6 h-3 bg-white/5 rounded animate-pulse ml-1 align-middle" />
                ) : (
                  ` (${totalProducts})`
                )}
              </span>
              {activeTab === "products" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("collections");
                setSearchQuery("");
              }}
              className={`pb-4 text-xs font-bold uppercase tracking-widest relative transition-all duration-300 cursor-pointer ${
                activeTab === "collections"
                  ? "text-amber-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span>
                🎨 Quản Lý Bộ Sưu Tập
                {!isProductsLoaded ? (
                  <span className="inline-block w-6 h-3 bg-white/5 rounded animate-pulse ml-1 align-middle" />
                ) : (
                  ` (${activeCollections})`
                )}
              </span>
              {activeTab === "collections" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("slides");
                setSearchQuery("");
              }}
              className={`pb-4 text-xs font-bold uppercase tracking-widest relative transition-all duration-300 cursor-pointer ${
                activeTab === "slides"
                  ? "text-amber-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span>
                🖼️ Quản Lý Slide
                {!isProductsLoaded ? (
                  <span className="inline-block w-6 h-3 bg-white/5 rounded animate-pulse ml-1 align-middle" />
                ) : (
                  ` (${slides.length})`
                )}
              </span>
              {activeTab === "slides" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("orders");
                setSearchQuery("");
              }}
              className={`pb-4 text-xs font-bold uppercase tracking-widest relative transition-all duration-300 cursor-pointer ${
                activeTab === "orders"
                  ? "text-amber-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span>
                📦 Quản Lý Đơn Hàng
                {!isProductsLoaded ? (
                  <span className="inline-block w-6 h-3 bg-white/5 rounded animate-pulse ml-1 align-middle" />
                ) : (
                  ` (${orders.length})`
                )}
              </span>
              {activeTab === "orders" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("customers");
                setSearchQuery("");
              }}
              className={`pb-4 text-xs font-bold uppercase tracking-widest relative transition-all duration-300 cursor-pointer ${
                activeTab === "customers"
                  ? "text-amber-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span>
                👥 Quản Lý Khách Hàng
                {!isProductsLoaded ? (
                  <span className="inline-block w-6 h-3 bg-white/5 rounded animate-pulse ml-1 align-middle" />
                ) : (
                  ` (${customers.length})`
                )}
              </span>
              {activeTab === "customers" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("reviews");
                setSearchQuery("");
              }}
              className={`pb-4 text-xs font-bold uppercase tracking-widest relative transition-all duration-300 cursor-pointer ${
                activeTab === "reviews"
                  ? "text-amber-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span>
                ⭐ Quản Lý Đánh Giá
                {!isProductsLoaded ? (
                  <span className="inline-block w-6 h-3 bg-white/5 rounded animate-pulse ml-1 align-middle" />
                ) : (
                  ` (${reviews.length})`
                )}
              </span>
              {activeTab === "reviews" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab("analytics");
                setSearchQuery("");
              }}
              className={`pb-4 text-xs font-bold uppercase tracking-widest relative transition-all duration-300 cursor-pointer ${
                activeTab === "analytics"
                  ? "text-amber-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              <span>📊 Báo Cáo Doanh Thu</span>
              {activeTab === "analytics" && (
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
              )}
            </button>
            {currentUser.role === "ADMIN" && (
              <button
                onClick={() => {
                  setActiveTab("accounts");
                  setSearchQuery("");
                }}
                className={`pb-4 text-xs font-bold uppercase tracking-widest relative transition-all duration-300 cursor-pointer ${
                  activeTab === "accounts"
                    ? "text-amber-400"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <span>
                  🔑 Quản Lý Tài Khoản
                  {!isProductsLoaded ? (
                    <span className="inline-block w-6 h-3 bg-white/5 rounded animate-pulse ml-1 align-middle" />
                  ) : (
                    ` (${accounts.length})`
                  )}
                </span>
                {activeTab === "accounts" && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" />
                )}
              </button>
            )}
          </div>
          
          {/* Search container */}
          {activeTab !== "analytics" && (
            <div className="relative bg-[#0b0f19] border border-white/5 rounded-xl p-2 flex items-center shadow-inner">
              <Search className="w-5 h-5 text-slate-500 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  activeTab === "products" 
                    ? "Nhập tên trang sức hoặc slug định danh để lọc tìm kiếm..." 
                    : activeTab === "collections"
                    ? "Nhập tên bộ sưu tập hoặc mã BST để lọc..."
                    : activeTab === "slides"
                    ? "Nhập tiêu đề hoặc định danh Slide để lọc..."
                    : activeTab === "orders"
                    ? "Nhập mã đơn hàng, tên khách hàng, số điện thoại hoặc sản phẩm..."
                    : activeTab === "customers"
                    ? "Nhập tên khách hàng, email, số điện thoại hoặc mã định danh để tìm..."
                    : activeTab === "reviews"
                    ? "Nhập tên sản phẩm, tên khách hàng hoặc nội dung đánh giá để tìm..."
                    : "Nhập tên tài khoản, email, số điện thoại hoặc vai trò (ADMIN, USER) để lọc..."
                }
                className="w-full bg-transparent px-4 py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600"
              />
            </div>
          )}

          {/* High-End Obsidian & Gold Product Rows (Instead of a standard boring table) */}
          {activeTab === "products" && (
            !isProductsLoaded ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="bg-[#0b0f19]/30 border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 animate-pulse">
                    <div className="flex items-center gap-5 w-full sm:w-auto">
                      <div className="w-16 h-16 rounded-xl bg-[#141a29]/80 shrink-0" />
                      <div className="space-y-2 flex-1 min-w-[200px]">
                        <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse" />
                        <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="space-y-2">
                        <div className="h-3 bg-white/5 rounded w-12 animate-pulse" />
                        <div className="h-4 bg-amber-500/10 rounded w-20 animate-pulse" />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-10 h-10 bg-white/5 rounded-xl animate-pulse" />
                        <div className="w-10 h-10 bg-white/5 rounded-xl animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-[#0b0f19]/30 border border-dashed border-white/10 rounded-2xl">
                <Search className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">Không tìm thấy mẫu trang sức nào</p>
                <p className="text-xs text-slate-600 mt-1">Vui lòng kiểm tra lại từ khóa hoặc thêm mới sản phẩm.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((p) => {
                  const col = collections.find((c) => c.id === p.collectionId);
                  const collectionName = col ? col.name : (p.collectionId || "");
                  return (
                    <div 
                      key={p.slug}
                      className="group bg-[#0b0f19] border border-white/5 hover:border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-300 hover:scale-[1.005] hover:shadow-lg hover:shadow-amber-500/2"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-5 w-full sm:w-auto">
                        <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/5 bg-[#141a29] flex items-center justify-center shrink-0 shadow-inner relative">
                          <img
                            src={p.img}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=120&q=80";
                            }}
                          />
                        </div>
                        
                        <div className="min-w-0">
                          <h4 
                            className="text-base font-medium text-white group-hover:text-amber-400 transition-colors line-clamp-1"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                          >
                            {p.name}
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                              {p.slug}
                            </span>
                            {collectionName && (
                              <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-500/80 bg-amber-500/5 border border-amber-500/10 px-2.5 py-0.5 rounded-full">
                                {collectionName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Price & Luxury Actions */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <div className="text-left sm:text-right">
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Retail Price</span>
                          <div className="text-lg font-bold text-amber-400 mt-0.5">{formatProductPrice(p.price)}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-3 bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/20 text-slate-300 hover:text-amber-400 rounded-xl transition-all duration-300 cursor-pointer"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.slug)}
                            className="p-3 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/20 text-slate-300 hover:text-rose-400 rounded-xl transition-all duration-300 cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Luxury Collections Studio Board (UC25) */}
          {activeTab === "collections" && (
            filteredCollections.length === 0 ? (
              <div className="text-center py-20 bg-[#0b0f19]/30 border border-dashed border-white/10 rounded-2xl">
                <Search className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">Không tìm thấy bộ sưu tập nào</p>
                <p className="text-xs text-slate-600 mt-1">Vui lòng kiểm tra lại từ khóa hoặc thêm mới bộ sưu tập.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCollections.map((c) => {
                  const productCount = products.filter((p) => p.collectionId === c.id).length;
                  return (
                    <div 
                      key={c.id}
                      className="group bg-[#0b0f19] border border-white/5 hover:border-amber-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 hover:scale-[1.005] hover:shadow-lg hover:shadow-amber-500/2"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="w-20 h-14 rounded-xl overflow-hidden border border-white/5 bg-[#141a29] flex items-center justify-center shrink-0 shadow-inner relative">
                          <img
                            src={c.thumbnail}
                            alt={c.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=120&q=80";
                            }}
                          />
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <h4 
                              className="text-base font-medium text-white group-hover:text-amber-400 transition-colors line-clamp-1"
                              style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                              {c.name}
                            </h4>
                            {c.isVisible ? (
                              <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-full">
                                Hiển thị
                              </span>
                            ) : (
                              <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
                                Đang ẩn
                              </span>
                            )}
                          </div>
                          
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic font-light">
                            {c.title}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                              {c.id}
                            </span>
                            <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-500/80 bg-amber-500/5 border border-amber-500/10 px-2.5 py-0.5 rounded-full">
                              {productCount} sản phẩm
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Editorial Action Buttons */}
                      <div className="flex items-center justify-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5 shrink-0">
                        <button
                          onClick={() => handleOpenEditCollection(c)}
                          className="p-3 bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/20 text-slate-300 hover:text-amber-400 rounded-xl transition-all duration-300 cursor-pointer"
                          title="Sửa Bộ Sưu Tập"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCollection(c.id)}
                          className="p-3 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/20 text-slate-300 hover:text-rose-400 rounded-xl transition-all duration-300 cursor-pointer"
                          title="Xóa Bộ Sưu Tập"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )
          )}

            {/* Luxury Slides Studio Board (UC26) */}
            {activeTab === "slides" && (
              filteredSlides.length === 0 ? (
                <div className="text-center py-20 bg-[#0b0f19]/30 border border-dashed border-white/10 rounded-2xl">
                  <Search className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">Không tìm thấy slide banner nào</p>
                  <p className="text-xs text-slate-600 mt-1">Vui lòng kiểm tra lại từ khóa hoặc thêm slide mới.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSlides.map((s: any) => (
                    <div 
                      key={s.id}
                      className="group bg-[#0b0f19] border border-white/5 hover:border-amber-500/30 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300 hover:scale-[1.005] hover:shadow-lg hover:shadow-amber-500/2"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className="w-24 h-14 rounded-xl overflow-hidden border border-white/5 bg-[#141a29] flex items-center justify-center shrink-0 shadow-inner relative">
                          <img
                            src={s.image}
                            alt={s.title || "Slide banner"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=120&q=80";
                            }}
                          />
                        </div>
                        
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <h4 
                              className="text-base font-medium text-white group-hover:text-amber-400 transition-colors line-clamp-1"
                              style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                              {s.title || "Slide Không Tiêu Đề"}
                            </h4>
                            <span className="text-[8px] font-extrabold uppercase tracking-wider text-amber-500 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-full">
                              Thứ tự: {s.sortOrder}
                            </span>
                          </div>
                          
                          {s.subtitle && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1 italic font-light">
                              {s.subtitle}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                              {s.id}
                            </span>
                            {s.link && (
                              <span className="text-[9px] font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                                Liên kết: {s.link}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Editorial Action Buttons */}
                      <div className="flex items-center justify-end gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5 shrink-0">
                        <button
                          onClick={() => handleOpenEditSlide(s)}
                          className="p-3 bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/20 text-slate-300 hover:text-amber-400 rounded-xl transition-all duration-300 cursor-pointer"
                          title="Sửa Slide"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(s.id)}
                          className="p-3 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/20 text-slate-300 hover:text-rose-400 rounded-xl transition-all duration-300 cursor-pointer"
                          title="Xóa Slide"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )
            )}

            {/* Luxury Orders Studio Board (UC27) */}
            {activeTab === "orders" && (
              filteredOrders.length === 0 ? (
                <div className="text-center py-20 bg-[#0b0f19]/30 border border-dashed border-white/10 rounded-2xl">
                  <Search className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">Không tìm thấy đơn hàng nào</p>
                  <p className="text-xs text-slate-600 mt-1">Vui lòng kiểm tra lại từ khóa hoặc đợi khách hàng đặt đơn mới.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredOrders.map((order: any) => {
                    // Define order status styles
                    let statusLabel = "Chờ xử lý";
                    let statusStyle = "text-amber-400 bg-amber-400/10 border-amber-400/20";
                    if (order.status === "PROCESSING") {
                      statusLabel = "Đang đóng gói";
                      statusStyle = "text-blue-400 bg-blue-400/10 border-blue-400/20";
                    } else if (order.status === "SHIPPED") {
                      statusLabel = "Đang giao hàng";
                      statusStyle = "text-purple-400 bg-purple-400/10 border-purple-400/20";
                    } else if (order.status === "DELIVERED") {
                      statusLabel = "Đã giao thành công";
                      statusStyle = "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
                    } else if (order.status === "CANCELLED") {
                      statusLabel = "Đã hủy";
                      statusStyle = "text-rose-400 bg-rose-400/10 border-rose-400/20";
                    }

                    const formattedDate = () => {
                      try {
                        const d = new Date(order.createdAt);
                        return d.toLocaleString("vi-VN");
                      } catch {
                        return order.createdAt;
                      }
                    };

                    return (
                      <div 
                        key={order.id}
                        className="group bg-[#0b0f19] border border-white/5 hover:border-amber-500/20 rounded-2xl p-6 transition-all duration-300 shadow-md hover:shadow-amber-500/1"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 gap-4">
                          <div className="flex items-center gap-3">
                            <span 
                              className="text-sm font-bold text-white tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded"
                              style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                              {order.id}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {formattedDate()}
                            </span>
                          </div>
                          <span className={`text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${statusStyle}`}>
                            {statusLabel}
                          </span>
                        </div>

                        {/* Customer & Delivery Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-5">
                          <div className="space-y-2">
                            <h5 className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500">📍 Thông Tin Nhận Hàng</h5>
                            <div className="text-sm font-bold text-slate-200">
                              {order.recipientName} <span className="text-slate-600">|</span> {order.phone}
                            </div>
                            <div className="text-xs text-slate-400 leading-relaxed">
                              {order.address}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h5 className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500">💳 Thanh Toán & Giao Nhận</h5>
                            <div className="text-xs text-slate-300 font-semibold flex items-center gap-2">
                              <span>Phương thức:</span>
                              <span className="text-amber-400 font-bold uppercase tracking-wider">{order.paymentMethod || "COD"}</span>
                            </div>
                            <div className="text-xs text-slate-400 leading-relaxed">
                              Mặc định thanh toán COD (thanh toán khi nhận hàng). Đơn hàng sẽ được chuyển cho shipper sau khi xác nhận và đóng gói thành công.
                            </div>
                          </div>
                        </div>

                        {/* Items Checklist Table */}
                        <div className="border-t border-white/5 pt-4">
                          <h5 className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-3">📦 Danh Sách Sản Phẩm Mua</h5>
                          <div className="divide-y divide-white/5 bg-[#07090e]/40 rounded-xl border border-white/5 p-3 max-h-60 overflow-y-auto scrollbar-thin">
                            {(order.items || []).map((item: any, idx: number) => (
                              <div key={idx} className="py-3 flex gap-4 items-center first:pt-1 last:pb-1">
                                <img
                                  src={item.img}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded bg-[#111625] border border-white/5 shrink-0"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=120&q=80";
                                  }}
                                />
                                <div className="min-w-0 flex-1">
                                  <h4 className="text-xs font-bold text-slate-200 truncate leading-snug">
                                    {item.name}
                                  </h4>
                                  <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500 font-semibold">
                                    <span className="bg-white/5 border border-white/5 px-1.5 py-0.5 rounded">
                                      Size: {item.size}
                                    </span>
                                    <span>Số lượng: x{item.qty}</span>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <div className="text-xs font-bold text-amber-400">{item.price}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Total Payment & Action Transitions */}
                        <div className="border-t border-white/5 mt-5 pt-4 flex flex-wrap items-center justify-between gap-6">
                          <div>
                            <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 block">Tổng Giá Trị Đơn Hàng</span>
                            <div className="text-xl font-bold text-amber-400 mt-1">{formatProductPrice(order.totalAmount || 0)}</div>
                          </div>

                          {/* Status Actions */}
                          <div className="flex flex-wrap items-center gap-2.5">
                            {order.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "PROCESSING")}
                                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-extrabold uppercase tracking-widest transition duration-300 shadow-lg cursor-pointer"
                                >
                                  Xác Nhận Đơn
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "CANCELLED")}
                                  className="px-5 py-2.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-widest transition duration-300 cursor-pointer"
                                >
                                  Hủy Đơn Hàng
                                </button>
                              </>
                            )}

                            {order.status === "PROCESSING" && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "SHIPPED")}
                                  className="px-5 py-2.5 rounded-xl bg-blue-500 text-white hover:bg-blue-400 text-xs font-extrabold uppercase tracking-widest transition duration-300 shadow-lg cursor-pointer"
                                >
                                  Bắt Đầu Giao Hàng
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "CANCELLED")}
                                  className="px-5 py-2.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-widest transition duration-300 cursor-pointer"
                                >
                                  Hủy Đơn Hàng
                                </button>
                              </>
                            )}

                            {order.status === "SHIPPED" && (
                              <>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "DELIVERED")}
                                  className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-400 text-xs font-extrabold uppercase tracking-widest transition duration-300 shadow-lg cursor-pointer"
                                >
                                  Xác Nhận Đã Giao
                                </button>
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "CANCELLED")}
                                  className="px-5 py-2.5 rounded-xl border border-rose-500/30 hover:bg-rose-500/10 text-rose-400 text-xs font-bold uppercase tracking-widest transition duration-300 cursor-pointer"
                                >
                                  Hủy Đơn Hàng
                                </button>
                              </>
                            )}

                            {(order.status === "DELIVERED" || order.status === "CANCELLED") && (
                              <div className="text-[10px] text-slate-500 italic font-semibold">
                                Đơn hàng đã ở trạng thái kết thúc (không thể chuyển tiếp)
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Luxury Customers Studio Board (UC28) */}
            {activeTab === "customers" && (
              filteredCustomers.length === 0 ? (
                <div className="text-center py-20 bg-[#0b0f19]/30 border border-dashed border-white/10 rounded-2xl">
                  <Search className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">Không tìm thấy khách hàng nào</p>
                  <p className="text-xs text-slate-600 mt-1">Vui lòng kiểm tra lại từ khóa tìm kiếm.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredCustomers.map((customer: any) => {
                    const customerAddresses = customer.addresses || [];
                    const customerOrders = orders.filter(
                      (o: any) =>
                        String(o.userId) === String(customer.id) ||
                        String(o.phone) === String(customer.phone)
                    );

                    return (
                      <div 
                        key={customer.id}
                        className="group bg-[#0b0f19] border border-white/5 hover:border-amber-500/20 rounded-2xl p-6 transition-all duration-300 shadow-md hover:shadow-amber-500/1"
                      >
                        {/* Customer Header Details */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/5 gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 bg-[#111625] flex items-center justify-center shrink-0 shadow-inner relative">
                              {customer.avatar ? (
                                <img
                                  src={customer.avatar}
                                  alt={customer.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-base font-bold text-amber-400 uppercase">
                                  {customer.fullName ? customer.fullName.charAt(0) : "U"}
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 
                                className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                              >
                                {customer.fullName || "Khách Hàng Chưa Đặt Tên"}
                              </h4>
                              <div className="text-xs text-slate-400 mt-0.5">{customer.email}</div>
                            </div>
                          </div>
                          <div className="flex flex-col sm:items-end">
                            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase bg-white/5 border border-white/5 px-2 py-0.5 rounded">
                              ID: {customer.id}
                            </span>
                            {customer.phone && (
                              <span className="text-[11px] text-slate-400 mt-1 font-semibold">
                                SĐT: {customer.phone}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Customer Address Book */}
                        <div className="py-5 border-b border-white/5 space-y-3">
                          <h5 className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500">📍 Sổ Địa Chỉ Giao Hàng ({customerAddresses.length})</h5>
                          {customerAddresses.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">Khách hàng chưa đăng ký sổ địa chỉ giao nhận nào.</p>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {customerAddresses.map((addr: any) => (
                                <div 
                                  key={addr.id} 
                                  className="bg-[#07090e]/50 border border-white/5 rounded-xl p-3.5 space-y-1 relative"
                                >
                                  {addr.is_default && (
                                    <span className="absolute top-3.5 right-3.5 text-[8px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-full">
                                      Mặc định
                                    </span>
                                  )}
                                  <div className="text-xs font-bold text-slate-300">
                                    {addr.recipientName} <span className="text-slate-600">|</span> {addr.phone}
                                  </div>
                                  <div className="text-[11px] text-slate-400 leading-relaxed">
                                    {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Customer Purchase History Log */}
                        <div className="pt-4 space-y-3">
                          <h5 className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">🛍️ Lịch Sử Mua Hàng ({customerOrders.length} Đơn)</h5>
                          {customerOrders.length === 0 ? (
                            <p className="text-xs text-slate-500 italic">Khách hàng này chưa phát sinh giao dịch mua sắm trực tuyến.</p>
                          ) : (
                            <div className="space-y-3 max-h-72 overflow-y-auto scrollbar-thin bg-[#07090e]/30 border border-white/5 p-3 rounded-xl divide-y divide-white/5">
                              {customerOrders.map((order: any) => {
                                let labelStatus = "Chờ xử lý";
                                let colorStyle = "text-amber-400 bg-amber-400/5";
                                if (order.status === "PROCESSING") {
                                  labelStatus = "Đang đóng gói";
                                  colorStyle = "text-blue-400 bg-blue-400/5";
                                } else if (order.status === "SHIPPED") {
                                  labelStatus = "Đang giao hàng";
                                  colorStyle = "text-purple-400 bg-purple-400/5";
                                } else if (order.status === "DELIVERED") {
                                  labelStatus = "Đã giao thành công";
                                  colorStyle = "text-emerald-400 bg-emerald-400/5";
                                } else if (order.status === "CANCELLED") {
                                  labelStatus = "Đã hủy";
                                  colorStyle = "text-rose-400 bg-rose-400/5";
                                }

                                const dateString = () => {
                                  try {
                                    return new Date(order.createdAt).toLocaleDateString("vi-VN");
                                  } catch {
                                    return order.createdAt;
                                  }
                                };

                                return (
                                  <div key={order.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-1 last:pb-1">
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs font-bold text-slate-300 font-mono tracking-wider">{order.id}</span>
                                        <span className="text-[10px] text-slate-500">{dateString()}</span>
                                        <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${colorStyle}`}>
                                          {labelStatus}
                                        </span>
                                      </div>
                                      
                                      {/* Mini items list */}
                                      <p className="text-[11px] text-slate-400 leading-snug truncate mt-1">
                                        Sản phẩm: {(order.items || []).map((i: any) => `${i.name} (x${i.qty})`).join(", ")}
                                      </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-widest">Thanh toán</span>
                                      <span className="text-sm font-bold text-amber-400 mt-0.5 block">{formatProductPrice(order.totalAmount || 0)}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Luxury Reviews Board (UC29) */}
            {activeTab === "reviews" && (
              filteredReviews.length === 0 ? (
                <div className="text-center py-20 bg-[#0b0f19]/30 border border-dashed border-white/10 rounded-2xl">
                  <Search className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">Không tìm thấy đánh giá nào</p>
                  <p className="text-xs text-slate-600 mt-1">Vui lòng kiểm tra lại từ khóa tìm kiếm.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredReviews.map((rev: any) => {
                    const product = products.find((p) => p.slug === rev.productSlug);
                    return (
                      <div
                        key={rev.id}
                        className={`group bg-[#0b0f19] border ${
                          rev.isHidden ? "border-slate-800 opacity-60" : "border-white/5 hover:border-amber-500/20"
                        } rounded-2xl p-6 transition-all duration-300 shadow-md flex flex-col justify-between`}
                      >
                        <div>
                          {/* Product Info */}
                          <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-4 justify-between">
                            <div className="flex items-center gap-3">
                              {product ? (
                                <img
                                  src={product.img}
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded-lg border border-white/10 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 text-[10px] text-slate-400">
                                  N/A
                                </div>
                              )}
                              <div>
                                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sản Phẩm</div>
                                <div className="text-xs font-bold text-slate-300 max-w-[200px] truncate">
                                  {product ? product.name : rev.productSlug}
                                </div>
                              </div>
                            </div>
                            
                            {/* Star Rating */}
                            <div className="flex gap-0.5 text-amber-400">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-700"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Reviewer details & comment */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {rev.userAvatar ? (
                                  <img
                                    src={rev.userAvatar}
                                    alt={rev.userName}
                                    className="w-6 h-6 rounded-full object-cover border border-white/10 shrink-0"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[9px] shrink-0">
                                    {rev.userName ? rev.userName.charAt(0).toUpperCase() : "U"}
                                  </div>
                                )}
                                <span className="text-xs font-bold text-slate-300">{rev.userName}</span>
                              </div>
                              <span className="text-[10px] text-slate-500">{rev.date}</span>
                            </div>

                            <div className="bg-[#07090e]/50 border border-white/5 rounded-xl p-4 min-h-[70px]">
                              <p className="text-xs text-slate-300 leading-relaxed italic">
                                "{rev.comment}"
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions for Manager (Hide/Show & Delete) */}
                        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                          <div>
                            {rev.isHidden ? (
                              <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-500/5 border border-slate-500/10 px-2.5 py-1 rounded-full">
                                Đã ẩn với người dùng
                              </span>
                            ) : (
                              <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-full">
                                Hiển thị công khai
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const newHiddenState = !rev.isHidden;
                                storeActions.toggleReviewVisibility(rev.id, newHiddenState).then((res) => {
                                  if (res.ok) {
                                    toast.success(newHiddenState ? "Đã ẩn đánh giá này thành công!" : "Đã hiện lại đánh giá này thành công!");
                                  } else {
                                    toast.error("Không thể thay đổi trạng thái ẩn hiện đánh giá.");
                                  }
                                });
                              }}
                              className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                            >
                              {rev.isHidden ? "Hiện Đánh Giá" : "Ẩn Đánh Giá"}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá vi phạm này không? Hành động này không thể hoàn tác.")) {
                                  storeActions.deleteReview(rev.id).then((res: any) => {
                                    if (res.ok) {
                                      toast.success("Đã xóa đánh giá vi phạm thành công!");
                                    } else {
                                      toast.error("Không thể xóa đánh giá này.");
                                    }
                                  });
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg border border-rose-500/30 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                            >
                              Xóa Vi Phạm
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Luxury Reviews Board (UC29) */}
            {activeTab === "reviews" && (
              filteredReviews.length === 0 ? (
                <div className="text-center py-20 bg-[#0b0f19]/30 border border-dashed border-white/10 rounded-2xl">
                  <Search className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">Không tìm thấy đánh giá nào</p>
                  <p className="text-xs text-slate-600 mt-1">Vui lòng kiểm tra lại từ khóa tìm kiếm.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredReviews.map((rev: any) => {
                    const product = products.find((p) => p.slug === rev.productSlug);
                    return (
                      <div
                        key={rev.id}
                        className={`group bg-[#0b0f19] border ${
                          rev.isHidden ? "border-slate-800 opacity-60" : "border-white/5 hover:border-amber-500/20"
                        } rounded-2xl p-6 transition-all duration-300 shadow-md flex flex-col justify-between`}
                      >
                        <div>
                          {/* Product Info */}
                          <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-4 justify-between">
                            <div className="flex items-center gap-3">
                              {product ? (
                                <img
                                  src={product.img}
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded-lg border border-white/10 shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 text-[10px] text-slate-400">
                                  N/A
                                </div>
                              )}
                              <div>
                                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Sản Phẩm</div>
                                <div className="text-xs font-bold text-slate-300 max-w-[200px] truncate">
                                  {product ? product.name : rev.productSlug}
                                </div>
                              </div>
                            </div>
                            
                            {/* Star Rating */}
                            <div className="flex gap-0.5 text-amber-400">
                              {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-700"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Reviewer details & comment */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {rev.userAvatar ? (
                                  <img
                                    src={rev.userAvatar}
                                    alt={rev.userName}
                                    className="w-6 h-6 rounded-full object-cover border border-white/10 shrink-0"
                                  />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[9px] shrink-0">
                                    {rev.userName ? rev.userName.charAt(0).toUpperCase() : "U"}
                                  </div>
                                )}
                                <span className="text-xs font-bold text-slate-300">{rev.userName}</span>
                              </div>
                              <span className="text-[10px] text-slate-500">{rev.date}</span>
                            </div>

                            <div className="bg-[#07090e]/50 border border-white/5 rounded-xl p-4 min-h-[70px]">
                              <p className="text-xs text-slate-300 leading-relaxed italic">
                                "{rev.comment}"
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions for Manager (Hide/Show & Delete) */}
                        <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                          <div>
                            {rev.isHidden ? (
                              <span className="text-[8px] font-extrabold uppercase tracking-wider text-slate-500 bg-slate-500/5 border border-slate-500/10 px-2.5 py-1 rounded-full">
                                Đã ẩn với người dùng
                              </span>
                            ) : (
                              <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-1 rounded-full">
                                Hiển thị công khai
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const newHiddenState = !rev.isHidden;
                                storeActions.toggleReviewVisibility(rev.id, newHiddenState).then((res) => {
                                  if (res.ok) {
                                    toast.success(newHiddenState ? "Đã ẩn đánh giá này thành công!" : "Đã hiện lại đánh giá này thành công!");
                                  } else {
                                    toast.error("Không thể thay đổi trạng thái ẩn hiện đánh giá.");
                                  }
                                });
                              }}
                              className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                            >
                              {rev.isHidden ? "Hiện Đánh Giá" : "Ẩn Đánh Giá"}
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá vi phạm này không? Hành động này không thể hoàn tác.")) {
                                  storeActions.deleteReview(rev.id).then((res: any) => {
                                    if (res.ok) {
                                      toast.success("Đã xóa đánh giá vi phạm thành công!");
                                    } else {
                                      toast.error("Không thể xóa đánh giá này.");
                                    }
                                  });
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg border border-rose-500/30 hover:border-rose-500 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                            >
                              Xóa Vi Phạm
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )
            )}

            {/* Luxury Revenue Statistics Analytics Board (UC30) */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                
                {/* 1. Core Analytics Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Stats: Collected Revenue */}
                  <div className="bg-[#0b0f19] border border-emerald-500/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-emerald-500/5 flex items-center justify-center text-emerald-400 border border-emerald-500/10">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Doanh Thu Đã Thu</span>
                      <div className="text-2xl font-bold text-emerald-400 mt-1 font-sans">
                        {formatProductPrice(analyticsData.totalRevenue)}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">
                      Từ {analyticsData.successCount} đơn giao thành công
                    </p>
                  </div>

                  {/* Stats: Pending Revenue */}
                  <div className="bg-[#0b0f19] border border-amber-500/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-amber-500/5 flex items-center justify-center text-amber-500 border border-amber-500/10">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Doanh Thu Đang Chờ</span>
                      <div className="text-2xl font-bold text-amber-500 mt-1 font-sans">
                        {formatProductPrice(analyticsData.pendingRevenue)}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">
                      Từ các đơn đang đóng gói/vận chuyển
                    </p>
                  </div>

                  {/* Stats: Completion Rate */}
                  <div className="bg-[#0b0f19] border border-blue-500/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-blue-500/5 flex items-center justify-center text-blue-400 border border-blue-500/10">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Tỷ Lệ Thành Công</span>
                      <div className="text-2xl font-bold text-blue-400 mt-1 font-sans">
                        {orders.length > 0 
                          ? ((analyticsData.successCount / orders.length) * 100).toFixed(1)
                          : "0.0"}%
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">
                      {analyticsData.successCount} trên tổng số {orders.length} đơn
                    </p>
                  </div>

                  {/* Stats: Cancelled Orders */}
                  <div className="bg-[#0b0f19] border border-rose-500/10 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-rose-500/5 flex items-center justify-center text-rose-400 border border-rose-500/10">
                      <X className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Số Đơn Đã Hủy</span>
                      <div className="text-2xl font-bold text-rose-400 mt-1 font-sans">
                        {analyticsData.cancelCount} đơn
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 font-medium">
                      Chiếm {orders.length > 0 
                        ? ((analyticsData.cancelCount / orders.length) * 100).toFixed(1)
                        : "0.0"}% tổng số lượng đơn đặt
                    </p>
                  </div>

                </div>

                {/* 2. Interactive SVG Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Daily Revenue Bar Chart */}
                  <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-amber-500">Weekly Performance</span>
                        <h4 className="text-sm font-bold text-white mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Doanh Thu 7 Ngày Qua
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full font-bold">
                        Hằng ngày
                      </span>
                    </div>

                    <div className="w-full flex items-center justify-center py-4 bg-[#07090e]/40 border border-white/5 rounded-xl">
                      {analyticsData.dailyRevenue.reduce((s: number, r: any) => s + r.value, 0) === 0 ? (
                        <div className="text-center py-8 text-slate-600 text-xs">Chưa phát sinh doanh thu trong 7 ngày qua</div>
                      ) : (
                        <svg viewBox="0 0 500 240" className="w-full max-w-[460px] overflow-visible">
                          <defs>
                            <linearGradient id="goldBarGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#d97706" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          <line x1="40" y1="90" x2="480" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          <line x1="40" y1="150" x2="480" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          <line x1="40" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                          {/* Bars Rendering */}
                          {analyticsData.dailyRevenue.map((d: any, idx: number) => {
                            const maxVal = Math.max(...analyticsData.dailyRevenue.map((it: any) => it.value), 100000);
                            const barHeight = (d.value / maxVal) * 140;
                            const x = 55 + idx * 60;
                            const y = 200 - barHeight;
                            
                            return (
                              <g key={idx} className="group/bar cursor-pointer">
                                {/* Invisible Hover trigger box */}
                                <rect x={x - 10} y="15" width="45" height="195" fill="transparent" />
                                
                                {/* Actual Bar */}
                                <rect
                                  x={x}
                                  y={y}
                                  width="25"
                                  height={Math.max(barHeight, 3)}
                                  rx="4"
                                  fill="url(#goldBarGrad)"
                                  stroke="#f59e0b"
                                  strokeWidth="1.5"
                                  strokeOpacity="0.4"
                                  className="transition-all duration-300 group-hover/bar:stroke-amber-400 group-hover/bar:fill-amber-500/30"
                                />

                                {/* Interactive Text Tooltip on Hover */}
                                <g className="opacity-0 group-hover/bar:opacity-100 transition-opacity duration-300 pointer-events-none">
                                  <rect
                                    x={x - 30}
                                    y={y - 28}
                                    width="85"
                                    height="20"
                                    rx="4"
                                    fill="#0b0f19"
                                    stroke="rgba(245,158,11,0.3)"
                                    strokeWidth="1"
                                  />
                                  <text
                                    x={x + 12.5}
                                    y={y - 15}
                                    textAnchor="middle"
                                    className="text-[9px] font-sans font-bold fill-amber-400"
                                  >
                                    {(d.value / 1000).toFixed(0)}k ({d.count} đơn)
                                  </text>
                                </g>

                                {/* X-Axis labels */}
                                <text
                                  x={x + 12.5}
                                  y="220"
                                  textAnchor="middle"
                                  className="text-[9px] font-sans font-semibold fill-slate-500 group-hover/bar:fill-slate-300"
                                >
                                  {d.label}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Monthly Revenue Line Chart */}
                  <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-slate-500">Monthly Growth</span>
                        <h4 className="text-sm font-bold text-white mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                          Doanh Thu 6 Tháng Qua
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-full font-bold">
                        Hằng tháng
                      </span>
                    </div>

                    <div className="w-full flex items-center justify-center py-4 bg-[#07090e]/40 border border-white/5 rounded-xl">
                      {analyticsData.monthlyRevenue.reduce((s: number, r: any) => s + r.value, 0) === 0 ? (
                        <div className="text-center py-8 text-slate-600 text-xs">Chưa phát sinh doanh thu trong 6 tháng qua</div>
                      ) : (
                        <svg viewBox="0 0 500 240" className="w-full max-w-[460px] overflow-visible">
                          <defs>
                            <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                            </linearGradient>
                          </defs>

                          {/* Grid Lines */}
                          <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          <line x1="40" y1="90" x2="480" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          <line x1="40" y1="150" x2="480" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                          <line x1="40" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                          {/* Polyline / Paths rendering */}
                          {(() => {
                            const maxVal = Math.max(...analyticsData.monthlyRevenue.map((it: any) => it.value), 100000);
                            const points = analyticsData.monthlyRevenue.map((d: any, idx: number) => {
                              const x = 50 + idx * 80;
                              const y = 200 - (d.value / maxVal) * 140;
                              return { x, y, value: d.value, count: d.count, label: d.label };
                            });

                            const linePathStr = points.map((p: any, i: number) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                            const areaPathStr = `${linePathStr} L ${points[points.length - 1].x} 200 L ${points[0].x} 200 Z`;

                            return (
                              <g>
                                {/* Area underneath line */}
                                <path d={areaPathStr} fill="url(#lineAreaGrad)" />

                                {/* Main glowing stroke */}
                                <path
                                  d={linePathStr}
                                  fill="none"
                                  stroke="#f59e0b"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />

                                {/* Interactive Points */}
                                {points.map((p: any, idx: number) => (
                                  <g key={idx} className="group/point cursor-pointer">
                                    {/* Outer larger circle trigger */}
                                    <circle cx={p.x} cy={p.y} r="15" fill="transparent" />

                                    {/* Decorative marker dot */}
                                    <circle
                                      cx={p.x}
                                      cy={p.y}
                                      r="5"
                                      fill="#0b0f19"
                                      stroke="#f59e0b"
                                      strokeWidth="2.5"
                                      className="transition-all duration-300 group-hover/point:r-7 group-hover/point:fill-amber-400"
                                    />

                                    {/* Tooltip on Hover */}
                                    <g className="opacity-0 group-hover/point:opacity-100 transition-opacity duration-300 pointer-events-none">
                                      <rect
                                        x={p.x - 40}
                                        y={p.y - 30}
                                        width="80"
                                        height="20"
                                        rx="4"
                                        fill="#0b0f19"
                                        stroke="rgba(245,158,11,0.3)"
                                        strokeWidth="1"
                                      />
                                      <text
                                        x={p.x}
                                        y={p.y - 17}
                                        textAnchor="middle"
                                        className="text-[9px] font-sans font-bold fill-amber-400"
                                      >
                                        {(p.value / 1000).toFixed(0)}k ({p.count} đơn)
                                      </text>
                                    </g>

                                    {/* X-axis labels */}
                                    <text
                                      x={p.x}
                                      y="220"
                                      textAnchor="middle"
                                      className="text-[9px] font-sans font-semibold fill-slate-500 group-hover/point:fill-slate-300"
                                    >
                                      {p.label.split("/")[0]}
                                    </text>
                                  </g>
                                ))}
                              </g>
                            );
                          })()}
                        </svg>
                      )}
                    </div>
                  </div>

                </div>

                {/* 3. Top-Selling Products Board */}
                <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-6 space-y-4">
                  <div>
                    <span className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-amber-500">Inventory Demands</span>
                    <h4 className="text-sm font-bold text-white mt-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Top 5 Sản Phẩm Bán Chạy Nhất
                    </h4>
                  </div>

                  {analyticsData.topSellingProducts.length === 0 ? (
                    <p className="text-xs text-slate-500 italic py-4 text-center">Chưa phát sinh giao dịch mua bán thành công nào để xếp hạng.</p>
                  ) : (
                    <div className="space-y-4">
                      {analyticsData.topSellingProducts.map((p: any, idx: number) => {
                        const maxSales = Math.max(...analyticsData.topSellingProducts.map((it: any) => it.qty), 1);
                        const progressWidth = (p.qty / maxSales) * 100;
                        
                        return (
                          <div 
                            key={p.slug} 
                            className="bg-[#07090e]/50 border border-white/5 rounded-xl p-4 flex items-center gap-4 transition-all hover:border-amber-500/10"
                          >
                            {/* Rank circle badge */}
                            <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                              #{idx + 1}
                            </div>

                            {/* Product Thumbnail image */}
                            {p.img ? (
                              <img 
                                src={p.img} 
                                alt={p.name} 
                                className="w-11 h-11 object-cover rounded-lg border border-white/10 shrink-0" 
                              />
                            ) : (
                              <div className="w-11 h-11 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 text-[10px] text-slate-500">N/A</div>
                            )}

                            {/* Item detail & Progress bars */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs font-bold text-slate-200 truncate">{p.name}</span>
                                <span className="text-xs font-bold text-amber-400 shrink-0 font-sans">
                                  {formatProductPrice(p.revenue)}
                                </span>
                              </div>

                              {/* Glowing gold progress track */}
                              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                                <div 
                                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full" 
                                  style={{ width: `${progressWidth}%` }}
                                />
                              </div>
                              <div className="text-[10px] text-slate-500 font-medium">
                                Đã bán ra: <span className="text-slate-300 font-bold">{p.qty} sản phẩm</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Luxury Accounts Management Board (UC31) */}
            {activeTab === "accounts" && currentUser.role === "ADMIN" && (
              filteredAccounts.length === 0 ? (
                <div className="text-center py-20 bg-[#0b0f19]/30 border border-dashed border-white/10 rounded-2xl">
                  <Search className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">Không tìm thấy tài khoản hệ thống nào</p>
                  <p className="text-xs text-slate-600 mt-1">Vui lòng điều chỉnh lại từ khóa lọc.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredAccounts.map((account: any) => {
                    const accountAddresses = account.addresses || [];
                    const accountOrders = orders.filter(
                      (o: any) =>
                        String(o.userId) === String(account.id) ||
                        String(o.phone) === String(account.phone)
                    );

                    let roleBadgeStyle = "text-slate-400 bg-slate-500/5 border border-slate-500/10";
                    if (account.role === "ADMIN") {
                      roleBadgeStyle = "text-amber-400 bg-amber-500/5 border border-amber-500/15 font-extrabold";
                    } else if (account.role === "MANAGER") {
                      roleBadgeStyle = "text-blue-400 bg-blue-500/5 border border-blue-500/10 font-bold";
                    }

                    return (
                      <div 
                        key={account.id}
                        className="group bg-[#0b0f19] border border-white/5 hover:border-amber-500/20 rounded-2xl p-6 transition-all duration-300 shadow-md flex flex-col justify-between"
                      >
                        <div>
                          {/* Account header information */}
                          <div className="flex items-center gap-4 pb-4 border-b border-white/5 mb-4 justify-between">
                            <div className="flex items-center gap-3.5">
                              <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-[#111625] flex items-center justify-center shrink-0 shadow-inner relative">
                                {account.avatar ? (
                                  <img
                                    src={account.avatar}
                                    alt={account.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="text-sm font-bold text-amber-400 uppercase">
                                    {account.fullName ? account.fullName.charAt(0) : "U"}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 
                                  className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors truncate"
                                  style={{ fontFamily: "'Playfair Display', serif" }}
                                >
                                  {account.fullName || "Tài Khoản Seed"}
                                </h4>
                                <div className="text-[10px] text-slate-500 mt-0.5 truncate">{account.email}</div>
                              </div>
                            </div>

                            {/* Role Badge */}
                            <span className={`text-[8px] uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 ${roleBadgeStyle}`}>
                              {account.role}
                            </span>
                          </div>

                          {/* Account Metadata Detail */}
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-white/2">
                              <span className="text-slate-500 font-medium">Mã Định Danh (ID)</span>
                              <span className="font-mono text-slate-300 font-bold select-all">{account.id}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/2">
                              <span className="text-slate-500 font-medium">Số Điện Thoại</span>
                              <span className="text-slate-300 font-semibold">{account.phone || "Chưa cung cấp"}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/2">
                              <span className="text-slate-500 font-medium">Trạng Thái Hệ Thống</span>
                              <span className={`flex items-center gap-1 font-bold ${
                                account.status === "ACTIVE" ? "text-emerald-400" : "text-rose-400"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  account.status === "ACTIVE" ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                                }`} />
                                {account.status === "ACTIVE" ? "ĐANG HOẠT ĐỘNG" : "ĐÃ BỊ KHÓA"}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-white/2">
                              <span className="text-slate-500 font-medium">Số Lượng Đơn Mua</span>
                              <span className="text-amber-400 font-bold font-sans">{accountOrders.length} Đơn hàng</span>
                            </div>
                          </div>

                          {/* Nested Shipping Address Book */}
                          <div className="mt-4 pt-4 border-t border-white/5 space-y-2.5">
                            <div className="text-[8px] font-extrabold uppercase tracking-wider text-amber-500">📍 Địa Chỉ Nhận Hàng ({accountAddresses.length})</div>
                            {accountAddresses.length === 0 ? (
                              <p className="text-[10px] text-slate-600 italic">Tài khoản chưa lưu bất kỳ thông tin địa chỉ giao nhận nào.</p>
                            ) : (
                              <div className="space-y-2 max-h-36 overflow-y-auto scrollbar-thin">
                                {accountAddresses.map((addr: any) => (
                                  <div 
                                    key={addr.id}
                                    className="bg-[#07090e]/50 border border-white/2 hover:border-white/5 rounded-lg p-2.5 relative space-y-0.5"
                                  >
                                    {addr.isDefault && (
                                      <span className="absolute top-2.5 right-2.5 text-[7px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/5 px-1.5 py-0.5 rounded">
                                        Mặc định
                                      </span>
                                    )}
                                    <div className="text-[10px] font-bold text-slate-300">
                                      {addr.recipientName} <span className="text-slate-600">|</span> {addr.phone}
                                    </div>
                                    <div className="text-[9px] text-slate-500 leading-normal">
                                      {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Role Assignment Section (UC33) */}
                          {currentUser.role === "ADMIN" && (
                            <div className="mt-5 pt-4 border-t border-white/5 space-y-2.5">
                              <div className="text-[8px] font-extrabold uppercase tracking-widest text-amber-500 flex items-center gap-1">
                                <span>🔑 Vai Trò Hệ Thống</span>
                              </div>
                              <div className="bg-[#07090e]/60 border border-white/2 rounded-xl p-1 flex items-center justify-between gap-1">
                                {([ "USER", "MANAGER", "ADMIN" ] as const).map((r) => {
                                  const isCurrentRole = account.role === r;
                                  const isSelf = String(currentUser.id) === String(account.id);
                                  
                                  let activeStyle = "";
                                  if (isCurrentRole) {
                                    if (r === "ADMIN") {
                                      activeStyle = "bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/10";
                                    } else if (r === "MANAGER") {
                                      activeStyle = "bg-blue-500 text-white font-bold shadow-md shadow-blue-500/10";
                                    } else {
                                      activeStyle = "bg-slate-700 text-white font-semibold";
                                    }
                                  } else {
                                    activeStyle = "text-slate-500 hover:text-slate-300 hover:bg-white/2";
                                  }

                                  return (
                                    <button
                                      key={r}
                                      disabled={isSelf || isCurrentRole}
                                      onClick={async () => {
                                        let roleName = "Khách Hàng";
                                        if (r === "MANAGER") roleName = "Quản Lý";
                                        if (r === "ADMIN") roleName = "Quản Trị Viên";
                                        
                                        const confirmResult = window.confirm(
                                          `Bạn có chắc chắn muốn chuyển vai trò của tài khoản ${account.fullName || account.email} thành ${roleName} (${r}) không?`
                                        );
                                        if (!confirmResult) return;

                                        try {
                                          const res = await storeActions.changeAccountRole(account.id, r);
                                          if (res.ok) {
                                            toast.success(
                                              `Đã phân quyền ${account.fullName || account.email} thành ${roleName} thành công!`,
                                              {
                                                style: {
                                                  background: "#0d111d",
                                                  border: "1px solid rgba(245, 158, 11, 0.2)",
                                                  color: "#f59e0b",
                                                }
                                              }
                                            );
                                          } else {
                                            toast.error(res.error);
                                          }
                                        } catch (err) {
                                          toast.error("Đã xảy ra lỗi không mong muốn.");
                                        }
                                      }}
                                      className={`flex-1 py-1.5 px-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all duration-300 ${activeStyle} ${
                                        isSelf || isCurrentRole ? "cursor-not-allowed" : "cursor-pointer"
                                      }`}
                                    >
                                      {r === "ADMIN" ? "Admin" : r === r === "MANAGER" ? "Manager" : r === "MANAGER" ? "Manager" : r === "ADMIN" ? "Admin" : r}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Actions Section (UC32) */}
                          {currentUser.role === "ADMIN" && (
                            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-3 shrink-0">
                              {String(currentUser.id) === String(account.id) ? (
                                <span className="text-[10px] text-slate-500 italic font-medium w-full text-center">
                                  Tài khoản hiện đang đăng nhập (Bạn)
                                </span>
                              ) : (
                                <button
                                  onClick={async () => {
                                    const actionText = account.status === "ACTIVE" ? "Khóa" : "Mở khóa";
                                    const confirmResult = window.confirm(`Bạn có chắc chắn muốn ${actionText.toLowerCase()} tài khoản này không?`);
                                    if (!confirmResult) return;
                                    
                                    try {
                                      const res = await storeActions.toggleAccountLockStatus(account.id);
                                      if (res.ok) {
                                        toast.success(`${actionText} tài khoản ${account.fullName || account.email} thành công!`, {
                                          style: {
                                            background: "#0d111d",
                                            border: "1px solid rgba(16, 185, 129, 0.2)",
                                            color: "#10b981",
                                          }
                                        });
                                      } else {
                                        toast.error(res.error);
                                      }
                                    } catch (err: any) {
                                      toast.error("Đã xảy ra lỗi không mong muốn.");
                                    }
                                  }}
                                  className={`w-full py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                                    account.status === "ACTIVE"
                                      ? "bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white shadow-lg hover:shadow-rose-500/10"
                                      : "bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white shadow-lg hover:shadow-emerald-500/10"
                                  }`}
                                >
                                  {account.status === "ACTIVE" ? (
                                    <>
                                      <Lock className="w-3.5 h-3.5" />
                                      Khóa Tài Khoản
                                    </>
                                  ) : (
                                    <>
                                      <Unlock className="w-3.5 h-3.5" />
                                      Mở Khóa Tài Khoản
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          )}

                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}

          </div>

        </main>

      {/* Premium Sliding Right-Hand Drawer for Add/Edit (Complete layout revamp) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop glassmorphism */}
          <div 
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-[#0a0d14] border-l border-white/10 shadow-2xl flex flex-col h-full animate-slideLeft">
            
            {/* Drawer Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#0e121d]">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-amber-500">Luxury Editor</span>
                <h3 
                  className="text-lg font-semibold text-white tracking-wide mt-0.5"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {editingProduct ? "Cập Nhật Thông Tin" : "Thiết Kế Trang Sức Mới"}
                </h3>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin">
              
              {/* Slug (Only active during creation) */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Định danh sản phẩm (Slug ID) *
                </label>
                <input
                  type="text"
                  value={slug}
                  disabled={!!editingProduct}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="vong-co-pretty-swan"
                  className={`w-full bg-[#111625] px-4 py-3 border rounded-xl text-sm text-slate-200 outline-none transition-all ${
                    editingProduct
                      ? "opacity-50 border-white/5 cursor-not-allowed"
                      : formErrors.slug
                      ? "border-rose-500 bg-rose-500/5 focus:border-rose-500"
                      : "border-white/10 focus:border-amber-500"
                  }`}
                />
                {formErrors.slug && (
                  <p className="text-xs text-rose-400 font-medium">{formErrors.slug}</p>
                )}
                {!editingProduct && (
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                    Nhập định danh dạng chữ thường không dấu, nối bằng gạch ngang (ví dụ: `vong-co-bong-tuyet`). Mặc định khóa sau khi tạo.
                  </p>
                )}
              </div>

              {/* Grid: Name & Short Name */}
              <div className="grid grid-cols-1 gap-5">
                {/* Full name */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    Tên đầy đủ trang sức *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dây chuyền Bạc 925 Royal Swan"
                    className={`w-full bg-[#111625] px-4 py-3 border rounded-xl text-sm text-slate-200 outline-none transition-all ${
                      formErrors.name ? "border-rose-500 bg-rose-500/5" : "border-white/10 focus:border-amber-500"
                    }`}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-rose-400 font-medium">{formErrors.name}</p>
                  )}
                </div>

                {/* Short name */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    Tên hiển thị ngắn *
                  </label>
                  <input
                    type="text"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="DÂY CHUYỀN BẠC 925 ROYAL SWAN - TNTKH"
                    className={`w-full bg-[#111625] px-4 py-3 border rounded-xl text-sm text-slate-200 outline-none transition-all ${
                      formErrors.shortName ? "border-rose-500 bg-rose-500/5" : "border-white/10 focus:border-amber-500"
                    }`}
                  />
                  {formErrors.shortName && (
                    <p className="text-xs text-rose-400 font-medium">{formErrors.shortName}</p>
                  )}
                </div>
              </div>

              {/* Grid: Price & Collection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Price */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    Giá niêm yết *
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="520.000VNĐ"
                    className={`w-full bg-[#111625] px-4 py-3 border rounded-xl text-sm text-slate-200 outline-none transition-all ${
                      formErrors.price ? "border-rose-500 bg-rose-500/5" : "border-white/10 focus:border-amber-500"
                    }`}
                  />
                  {formErrors.price && (
                    <p className="text-xs text-rose-400 font-medium">{formErrors.price}</p>
                  )}
                </div>

                {/* Collection */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                    Bộ sưu tập gán
                  </label>
                  <select
                    value={collectionId}
                    onChange={(e) => setCollectionId(e.target.value)}
                    className="w-full bg-[#111625] border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-amber-500 transition-all"
                  >
                    <option value="">Không gán bộ sưu tập</option>
                    {collections.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Visual Assets Studio & Image Upload (UC23) */}
              <div className="space-y-4 border-t border-white/5 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> Studio Thiết Kế Ảnh Sản Phẩm (UC23) *
                  </label>
                  {img && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsLightboxOpen(true)}
                        className="text-[9px] font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> Xem lớn
                      </button>
                      <button
                        type="button"
                        onClick={() => { setImg(""); toast.info("Đã xóa ảnh sản phẩm 🗑️"); }}
                        className="text-[9px] font-bold text-rose-400 hover:text-rose-300 transition flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Xóa ảnh
                      </button>
                    </div>
                  )}
                </div>

                {/* Large Interactive Preview or Drag/Upload Zone */}
                {img ? (
                  <div className="group relative w-full h-44 rounded-2xl overflow-hidden border border-white/10 bg-[#07090e] flex items-center justify-center shadow-inner">
                    <img
                      src={img}
                      alt="Thumbnail preview"
                      className="w-full h-full object-contain p-2 group-hover:scale-102 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=120&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsLightboxOpen(true)}
                        className="p-3 bg-amber-500 text-black hover:bg-amber-400 rounded-full transition shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-300 cursor-pointer"
                        title="Xem phóng to"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setImg(""); toast.info("Đã xóa ảnh sản phẩm 🗑️"); }}
                        className="p-3 bg-rose-600 text-white hover:bg-rose-500 rounded-full transition shadow-lg transform translate-y-2 group-hover:translate-y-0 duration-300 cursor-pointer"
                        title="Xóa hình ảnh này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-44 rounded-2xl border border-dashed border-white/15 hover:border-amber-500/40 bg-[#0b0f19]/40 hover:bg-[#0e1322]/60 transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 group-hover:border-amber-500/20 group-hover:bg-amber-500/5 text-slate-400 group-hover:text-amber-400 flex items-center justify-center transition duration-300">
                      <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-300 group-hover:text-amber-400 transition">Nhấp tải lên ảnh sản phẩm mới</p>
                      <p className="text-[10px] text-slate-500 mt-1">Hỗ trợ PNG, JPG, JPEG (Tối đa 2MB)</p>
                    </div>
                  </div>
                )}

                {/* Input text link fallback / base64 string indicator */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={img}
                    onChange={(e) => setImg(e.target.value)}
                    placeholder="Dán link ảnh (URL) hoặc tải ảnh lên..."
                    className={`flex-1 bg-[#111625] px-4 py-3 border rounded-xl text-xs text-slate-200 outline-none transition-all truncate ${
                      formErrors.img ? "border-rose-500 bg-rose-500/5" : "border-white/10 focus:border-amber-500"
                    }`}
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-3 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-amber-500 text-amber-400 hover:text-black rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shrink-0"
                  >
                    Chọn Tệp
                  </button>
                </div>
                {formErrors.img && (
                  <p className="text-xs text-rose-400 font-medium mt-1">{formErrors.img}</p>
                )}

                {/* Unsplash Luxury Presets Library */}
                <div className="space-y-2 pt-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 block">
                    Hoặc chọn từ thư viện ảnh cao cấp có sẵn (Media Library):
                  </span>
                  <div className="grid grid-cols-5 gap-2.5">
                    {[
                      {
                        title: "Luminous Clover",
                        url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80",
                      },
                      {
                        title: "Golden Muse",
                        url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80",
                      },
                      {
                        title: "Spring Flower",
                        url: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=600&q=80",
                      },
                      {
                        title: "Midnight Moon",
                        url: "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=600&q=80",
                      },
                      {
                        title: "Royal Emerald",
                        url: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80",
                      },
                    ].map((preset, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => {
                          setImg(preset.url);
                          toast.success(`Đã áp dụng ảnh thiết kế ${preset.title}! ✨`);
                        }}
                        className={`group relative aspect-square rounded-xl overflow-hidden border transition-all duration-300 ${
                          img === preset.url
                            ? "border-amber-500 ring-2 ring-amber-500/20 scale-95"
                            : "border-white/5 hover:border-amber-500/30"
                        } bg-[#0b0f19] cursor-pointer`}
                        title={preset.title}
                      >
                        <img
                          src={preset.url}
                          alt={preset.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Images Field */}
              <div className="space-y-2.5 border border-dashed border-amber-500/20 p-4 rounded-xl bg-amber-500/5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500 block">
                  Các hình ảnh phụ / Chi tiết sản phẩm ({images.length})
                </label>
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    value={newSubImageUrl}
                    onChange={(e) => setNewSubImageUrl(e.target.value)}
                    placeholder="Dán URL hình ảnh phụ..."
                    className="flex-1 bg-[#111625] px-3.5 py-2.5 border border-white/10 rounded-xl text-xs text-slate-200 outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubImageUrl}
                    className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-amber-500 text-amber-400 hover:text-black rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0"
                  >
                    Thêm URL
                  </button>
                  <input
                    type="file"
                    ref={subFileInputRef}
                    onChange={handleSubImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => subFileInputRef.current?.click()}
                    className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shrink-0"
                  >
                    Tải ảnh phụ
                  </button>
                </div>
                
                {/* Thumbnails of additional images */}
                {images.length > 0 && (
                  <div className="grid grid-cols-5 gap-2.5 mt-2">
                    {images.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group bg-[#07090e] shadow-md">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveSubImage(i)}
                          className="absolute -top-1 -right-1 bg-rose-600 text-white p-1 rounded-full hover:scale-110 active:scale-95 transition-transform shadow-md cursor-pointer flex items-center justify-center w-5 h-5"
                          title="Xóa ảnh phụ"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Title */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Tiêu đề thông tin sản phẩm (Info Title)
                </label>
                <input
                  type="text"
                  value={info}
                  onChange={(e) => setInfo(e.target.value)}
                  placeholder="THÔNG TIN DÂY CHUYỀN BẠC 925 ROYAL SWAN"
                  className="w-full bg-[#111625] px-4 py-3 border border-white/10 rounded-xl text-sm text-slate-200 outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Mô tả sản phẩm & Hướng dẫn sử dụng
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Nhập thông tin mô tả chi tiết..."
                  rows={5}
                  className="w-full bg-[#111625] px-4 py-3 border border-white/10 rounded-xl text-sm text-slate-200 outline-none focus:border-amber-500 resize-none font-sans leading-relaxed transition-all"
                />
              </div>

              {/* Specs parameters */}
              <div className="border-t border-white/5 pt-4">
                <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5" /> Thông Số Thiết Kế
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.keys(specs)
                    .filter((key) => !["arScale", "arOffsetY", "arOffsetX", "arRotation", "arImg"].includes(key))
                    .map((key) => (
                      <div key={key} className="space-y-1">
                        <label className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500 block">
                          {key}
                        </label>
                        <input
                          type="text"
                          value={specs[key as keyof typeof specs]}
                          onChange={(e) =>
                            setSpecs({
                              ...specs,
                              [key]: e.target.value,
                            })
                          }
                          placeholder={`Nhập ${key.toLowerCase()}...`}
                          className="w-full bg-[#111625] px-4.5 py-3 border border-white/10 rounded-xl text-xs text-slate-200 outline-none focus:border-amber-500 transition-all"
                        />
                        {key === "Độ dài dây" && (
                          <p className="text-[10px] text-amber-500/80 leading-relaxed mt-1 font-sans">
                            💡 Nhập các độ dài dây cách nhau bởi dấu phẩy để tạo nhiều biến thể cho khách hàng chọn (ví dụ: <code className="text-white font-mono bg-white/5 px-1 py-0.5 rounded">40cm, 45cm, 50cm</code>).
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              {/* Studio Cấu Hình Live AR 2.5D (UC24) */}
              <div className="space-y-4 border-t border-white/5 pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Cấu Hình Công Nghệ Thử AR (UC24)
                  </h4>
                  {arImg && (
                    <button
                      type="button"
                      onClick={() => { setArImg(""); toast.info("Đã xóa tài nguyên AR 🗑️"); }}
                      className="text-[9px] font-bold text-rose-400 hover:text-rose-300 transition flex items-center gap-1 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" /> Gỡ ảnh AR
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                  Thiết lập tệp ảnh trong suốt chuyên dụng dùng để ướm thử AR lên cổ người dùng cùng với tỉ lệ, tọa độ lệch và góc xoay mặc định phù hợp cho mẫu trang sức này.
                </p>

                {/* AR transparent overlay file picker */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 block">
                    Tệp ảnh trong suốt AR PNG
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={arImg}
                      onChange={(e) => setArImg(e.target.value)}
                      placeholder="Dán link ảnh AR PNG (mặc định dùng ảnh sản phẩm)..."
                      className="flex-1 bg-[#111625] px-4 py-3 border border-white/10 rounded-xl text-xs text-slate-200 outline-none focus:border-amber-500 transition-all truncate"
                    />
                    <input
                      type="file"
                      ref={arFileInputRef}
                      onChange={handleArImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => arFileInputRef.current?.click()}
                      className="px-4 py-3 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-amber-500 text-amber-400 hover:text-black rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shrink-0"
                    >
                      Tải PNG AR
                    </button>
                  </div>
                </div>

                {/* Checkered Transparent Grid Preview for AR dedicated image */}
                {arImg && (
                  <div className="flex items-center gap-4 p-4 bg-[#0c101b] border border-white/5 rounded-2xl">
                    <div 
                      className="w-16 h-16 rounded-xl overflow-hidden border border-white/5 shrink-0 flex items-center justify-center relative bg-[#07090e]"
                      style={{
                        backgroundImage: "linear-gradient(45deg, #181818 25%, transparent 25%), linear-gradient(-45deg, #181818 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #181818 75%), linear-gradient(-45deg, transparent 75%, #181818 75%)",
                        backgroundSize: "10px 10px",
                        backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px"
                      }}
                    >
                      <img
                        src={arImg}
                        alt="AR PNG preview"
                        className="w-full h-full object-contain p-1"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = img;
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1 font-sans">
                        <Check className="w-3.5 h-3.5" /> Khử nền hoàn tất
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 leading-relaxed font-sans">
                        Tệp ảnh PNG trong suốt sẽ được vẽ đè thông minh lên vùng cổ người dùng qua camera hoặc ảnh chụp chân dung.
                      </div>
                    </div>
                  </div>
                )}

                {/* Sliders for AR Scale, Offsets, and Rotation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                      <span>Tỉ lệ thu phóng (Scale)</span>
                      <span className="text-amber-400 font-bold">{arScale}%</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={120}
                      value={arScale}
                      onChange={(e) => setArScale(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-ew-resize h-1 bg-[#111625] rounded-lg appearance-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                      <span>Độ lệch dọc (Offset Y)</span>
                      <span className="text-amber-400 font-bold">{arOffsetY}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={110}
                      value={arOffsetY}
                      onChange={(e) => setArOffsetY(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-ew-resize h-1 bg-[#111625] rounded-lg appearance-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                      <span>Độ lệch ngang (Offset X)</span>
                      <span className="text-amber-400 font-bold">{arOffsetX}%</span>
                    </div>
                    <input
                      type="range"
                      min={-50}
                      max={50}
                      value={arOffsetX}
                      onChange={(e) => setArOffsetX(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-ew-resize h-1 bg-[#111625] rounded-lg appearance-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                      <span>Góc xoay mặc định</span>
                      <span className="text-amber-400 font-bold">{arRotation}°</span>
                    </div>
                    <input
                      type="range"
                      min={-180}
                      max={180}
                      value={arRotation}
                      onChange={(e) => setArRotation(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-ew-resize h-1 bg-[#111625] rounded-lg appearance-none"
                    />
                  </div>
                </div>
              </div>

            </form>

            {/* Drawer Footer Actions */}
            <div className="px-8 py-5 border-t border-white/5 bg-[#0e121d] flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-extrabold uppercase tracking-widest hover:brightness-105 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/5"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                ) : (
                  "Lưu Sản Phẩm"
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex-1 border border-white/10 text-slate-300 hover:bg-white/5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition active:scale-[0.98] cursor-pointer"
              >
                Hủy Bỏ
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Premium Sliding Right-Hand Drawer for Collections (UC25) */}
      {isColDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop glassmorphism */}
          <div 
            onClick={() => setIsColDrawerOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-[#0a0d14] border-l border-white/10 shadow-2xl flex flex-col h-full animate-slideLeft">
            
            {/* Drawer Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#0e121d]">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-amber-500">Luxury Editor</span>
                <h3 
                  className="text-lg font-semibold text-white tracking-wide mt-0.5"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {editingCollection ? "Cập Nhật Bộ Sưu Tập" : "Tạo Bộ Sưu Tập Mới"}
                </h3>
              </div>
              <button
                onClick={() => setIsColDrawerOpen(false)}
                className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <form onSubmit={handleSaveCollection} className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin">
              
              {/* Slug ID (Only active during creation) */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Mã bộ sưu tập (Slug ID) *
                </label>
                <input
                  type="text"
                  value={colId}
                  disabled={!!editingCollection}
                  onChange={(e) => setColId(e.target.value)}
                  placeholder="graceful-muse"
                  className={`w-full bg-[#111625] px-4 py-3 border rounded-xl text-sm text-slate-200 outline-none transition-all ${
                    editingCollection
                      ? "opacity-50 border-white/5 cursor-not-allowed"
                      : colFormErrors.id
                      ? "border-rose-500 bg-rose-500/5 focus:border-rose-500"
                      : "border-white/10 focus:border-amber-500"
                  }`}
                />
                {colFormErrors.id && (
                  <p className="text-xs text-rose-400 font-medium">{colFormErrors.id}</p>
                )}
                {!editingCollection && (
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                    Nhập định danh dạng chữ thường không dấu, nối bằng gạch ngang (ví dụ: `graceful-muse`). Mặc định khóa sau khi tạo.
                  </p>
                )}
              </div>

              {/* Display Name */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Tên hiển thị bộ sưu tập *
                </label>
                <input
                  type="text"
                  value={colName}
                  onChange={(e) => setColName(e.target.value)}
                  placeholder="Nàng Thơ Thanh Lịch"
                  className={`w-full bg-[#111625] px-4 py-3 border rounded-xl text-sm text-slate-200 outline-none transition-all ${
                    colFormErrors.name ? "border-rose-500 bg-rose-500/5" : "border-white/10 focus:border-amber-500"
                  }`}
                />
                {colFormErrors.name && (
                  <p className="text-xs text-rose-400 font-medium">{colFormErrors.name}</p>
                )}
              </div>

              {/* Detailed Romantic Title */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Tiêu đề chi tiết *
                </label>
                <input
                  type="text"
                  value={colTitle}
                  onChange={(e) => setColTitle(e.target.value)}
                  placeholder="The Graceful Muse - Nàng Thơ Thanh Lịch"
                  className={`w-full bg-[#111625] px-4 py-3 border rounded-xl text-sm text-slate-200 outline-none transition-all ${
                    colFormErrors.title ? "border-rose-500 bg-rose-500/5" : "border-white/10 focus:border-amber-500"
                  }`}
                />
                {colFormErrors.title && (
                  <p className="text-xs text-rose-400 font-medium">{colFormErrors.title}</p>
                )}
              </div>

              {/* Intro Description */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Giới thiệu bộ sưu tập *
                </label>
                <textarea
                  value={colIntro}
                  onChange={(e) => setColIntro(e.target.value)}
                  placeholder="Nhập giới thiệu đầy cảm xúc..."
                  rows={4}
                  className={`w-full bg-[#111625] px-4 py-3 border rounded-xl text-sm text-slate-200 outline-none focus:border-amber-500 resize-none font-sans leading-relaxed transition-all ${
                    colFormErrors.intro ? "border-rose-500 bg-rose-500/5" : "border-white/10 focus:border-amber-500"
                  }`}
                />
                {colFormErrors.intro && (
                  <p className="text-xs text-rose-400 font-medium">{colFormErrors.intro}</p>
                )}
              </div>

              {/* Visibility Toggle */}
              <div className="flex items-center gap-3 py-2 border-y border-white/5">
                <input
                  type="checkbox"
                  id="colIsVisible"
                  checked={colIsVisible}
                  onChange={(e) => setColIsVisible(e.target.checked)}
                  className="w-4.5 h-4.5 rounded accent-amber-500 bg-[#111625] border-white/10 cursor-pointer"
                />
                <label htmlFor="colIsVisible" className="text-xs font-bold text-slate-300 cursor-pointer select-none">
                  Cho phép hiển thị bộ sưu tập này ngoài trang khách hàng
                </label>
              </div>

              {/* Thumbnail Image upload */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500 block">
                  Ảnh đại diện bộ sưu tập (Thumbnail) *
                </label>

                {colThumbnail ? (
                  <div className="group relative w-full h-32 rounded-xl overflow-hidden border border-white/10 bg-[#07090e] flex items-center justify-center shadow-inner">
                    <img
                      src={colThumbnail}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => { setColThumbnail(""); toast.info("Đã xóa ảnh đại diện 🗑️"); }}
                        className="p-3 bg-rose-600 text-white hover:bg-rose-500 rounded-full transition shadow-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="w-full h-32 rounded-xl border border-dashed border-white/15 hover:border-amber-500/40 bg-[#0b0f19]/40 hover:bg-[#0e1322]/60 transition duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer group"
                  >
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:scale-110 transition" />
                    <p className="text-[11px] font-bold text-slate-300 group-hover:text-amber-400">Tải ảnh đại diện (600x600)</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={colThumbnail}
                    onChange={(e) => setColThumbnail(e.target.value)}
                    placeholder="Dán link ảnh hoặc tải ảnh lên..."
                    className={`flex-1 bg-[#111625] px-4 py-2.5 border rounded-xl text-xs text-slate-200 outline-none transition truncate ${
                      colFormErrors.thumbnail ? "border-rose-500 bg-rose-500/5" : "border-white/10 focus:border-amber-500"
                    }`}
                  />
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    onChange={handleThumbnailUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-amber-500 text-amber-400 hover:text-black rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                  >
                    Chọn Tệp
                  </button>
                </div>
                {colFormErrors.thumbnail && (
                  <p className="text-xs text-rose-400 font-medium">{colFormErrors.thumbnail}</p>
                )}
              </div>

              {/* Banner Image upload */}
              <div className="space-y-3 border-t border-white/5 pt-4">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500 block">
                  Ảnh bìa lớn bộ sưu tập (Banner) *
                </label>

                {colBanner ? (
                  <div className="group relative w-full h-32 rounded-xl overflow-hidden border border-white/10 bg-[#07090e] flex items-center justify-center shadow-inner">
                    <img
                      src={colBanner}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => { setColBanner(""); toast.info("Đã xóa ảnh bìa 🗑️"); }}
                        className="p-3 bg-rose-600 text-white hover:bg-rose-500 rounded-full transition shadow-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => bannerInputRef.current?.click()}
                    className="w-full h-32 rounded-xl border border-dashed border-white/15 hover:border-amber-500/40 bg-[#0b0f19]/40 hover:bg-[#0e1322]/60 transition duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer group"
                  >
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:scale-110 transition" />
                    <p className="text-[11px] font-bold text-slate-300 group-hover:text-amber-400">Tải ảnh bìa lớn (1200x400)</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={colBanner}
                    onChange={(e) => setColBanner(e.target.value)}
                    placeholder="Dán link ảnh hoặc tải ảnh lên..."
                    className={`flex-1 bg-[#111625] px-4 py-2.5 border rounded-xl text-xs text-slate-200 outline-none transition truncate ${
                      colFormErrors.banner ? "border-rose-500 bg-rose-500/5" : "border-white/10 focus:border-amber-500"
                    }`}
                  />
                  <input
                    type="file"
                    ref={bannerInputRef}
                    onChange={handleBannerUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-amber-500 text-amber-400 hover:text-black rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                  >
                    Chọn Tệp
                  </button>
                </div>
                {colFormErrors.banner && (
                  <p className="text-xs text-rose-400 font-medium">{colFormErrors.banner}</p>
                )}
              </div>

              {/* Product Assignment Checklist */}
              <div className="border-t border-white/5 pt-4">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500 block mb-2">
                  Gán sản phẩm vào bộ sưu tập (Product Assignment)
                </label>
                <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                  Tích chọn những sản phẩm bạn muốn đưa vào bộ sưu tập này. Những sản phẩm bỏ chọn sẽ tự động rời khỏi bộ sưu tập.
                </p>
                
                <div className="max-h-60 overflow-y-auto border border-white/10 rounded-xl bg-[#0c101b] divide-y divide-white/5 p-3 space-y-2 scrollbar-thin">
                  {products.map((p) => {
                    const isChecked = assignedProductSlugs.includes(p.slug);
                    return (
                      <label 
                        key={p.slug}
                        className="flex items-center gap-3.5 py-2 px-2 hover:bg-white/5 rounded-lg cursor-pointer transition"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignedProductSlugs([...assignedProductSlugs, p.slug]);
                            } else {
                              setAssignedProductSlugs(assignedProductSlugs.filter((slug) => slug !== p.slug));
                            }
                          }}
                          className="w-4 h-4 rounded accent-amber-500 bg-[#111625] border-white/10 cursor-pointer"
                        />
                        <div className="w-10 h-10 rounded border border-white/5 overflow-hidden shrink-0 bg-[#07090e] flex items-center justify-center">
                          <img
                            src={p.img}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=120&q=80";
                            }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-200 truncate">{p.name}</p>
                          <p className="text-[9px] text-amber-500 font-mono mt-0.5">{p.slug}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

            </form>

            {/* Drawer Footer Actions */}
            <div className="px-8 py-5 border-t border-white/5 bg-[#0e121d] flex items-center gap-3">
              <button
                onClick={handleSaveCollection}
                disabled={colIsSubmitting}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-extrabold uppercase tracking-widest hover:brightness-105 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/5"
              >
                {colIsSubmitting ? (
                  <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                ) : (
                  "Lưu Bộ Sưu Tập"
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsColDrawerOpen(false)}
                className="flex-1 border border-white/10 text-slate-300 hover:bg-white/5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition active:scale-[0.98] cursor-pointer"
              >
                Hủy Bỏ
              </button>
            </div>

          </div>
        </div>
      )}


      {/* Premium Sliding Right-Hand Drawer for Slides (UC26) */}
      {isSlideDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop glassmorphism */}
          <div 
            onClick={() => setIsSlideDrawerOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-xl w-full bg-[#0a0d14] border-l border-white/10 shadow-2xl flex flex-col h-full animate-slideLeft">
            
            {/* Drawer Header */}
            <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#0e121d]">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-amber-500">Luxury Editor</span>
                <h3 
                  className="text-lg font-semibold text-white tracking-wide mt-0.5"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {editingSlide ? "Cập Nhật Slide Banner" : "Tạo Slide Banner Mới"}
                </h3>
              </div>
              <button
                onClick={() => setIsSlideDrawerOpen(false)}
                className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white rounded-xl transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <form onSubmit={handleSaveSlide} className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin">
              
              {/* Slide ID (Only active during creation) */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Mã slide định danh (Slide ID) *
                </label>
                <input
                  type="text"
                  value={slideId}
                  disabled={!!editingSlide}
                  onChange={(e) => setSlideId(e.target.value)}
                  placeholder="slide-banner-summer"
                  className={`w-full bg-[#111625] px-4 py-3 border rounded-xl text-sm text-slate-200 outline-none transition-all ${
                    editingSlide
                      ? "opacity-50 border-white/5 cursor-not-allowed"
                      : slideFormErrors.id
                      ? "border-rose-500 bg-rose-500/5 focus:border-rose-500"
                      : "border-white/10 focus:border-amber-500"
                  }`}
                />
                {slideFormErrors.id && (
                  <p className="text-xs text-rose-400 font-medium">{slideFormErrors.id}</p>
                )}
                {!editingSlide && (
                  <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                    Nhập định danh slide viết liền không dấu, ngăn cách bằng dấu gạch ngang (ví dụ: `slide-uu-dai-he`).
                  </p>
                )}
              </div>

              {/* Display Title */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Tiêu đề Slide (Title)
                </label>
                <input
                  type="text"
                  value={slideTitle}
                  onChange={(e) => setSlideTitle(e.target.value)}
                  placeholder="BỘ SƯU TẬP MỚI RA MẮT"
                  className="w-full bg-[#111625] px-4 py-3 border border-white/10 rounded-xl text-sm text-slate-200 outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Subtitle */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Phụ đề Slide (Subtitle)
                </label>
                <input
                  type="text"
                  value={slideSubtitle}
                  onChange={(e) => setSlideSubtitle(e.target.value)}
                  placeholder="Khám phá các thiết kế tinh xảo của Nàng Thơ Thanh Lịch"
                  className="w-full bg-[#111625] px-4 py-3 border border-white/10 rounded-xl text-sm text-slate-200 outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Link */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Đường dẫn liên kết (Link)
                </label>
                <input
                  type="text"
                  value={slideLink}
                  onChange={(e) => setSlideLink(e.target.value)}
                  placeholder="/bo-suu-tap?collection=graceful-muse"
                  className="w-full bg-[#111625] px-4 py-3 border border-white/10 rounded-xl text-sm text-slate-200 outline-none focus:border-amber-500 transition-all"
                />
                <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                  Đường dẫn khi click banner (ví dụ: `/thu-vong-co` để dẫn tới trang thử AR, hoặc `/bo-suu-tap?collection=graceful-muse`).
                  Có thể nhập đường dẫn đầy đủ hoặc tương đối.
                </p>
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Thứ tự hiển thị (Sort Order)
                </label>
                <input
                  type="number"
                  value={slideSortOrder}
                  onChange={(e) => setSlideSortOrder(Number(e.target.value))}
                  placeholder="1"
                  className="w-full bg-[#111625] px-4 py-3 border border-white/10 rounded-xl text-sm text-slate-200 outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2.5">
                <label className="text-[9px] font-extrabold uppercase tracking-widest text-amber-500 block">
                  Hình ảnh slide * (Tỷ lệ thích hợp: 1200x400 trở lên)
                </label>
                
                {slideImage ? (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border border-white/15 bg-[#141a29] flex items-center justify-center shrink-0 group shadow-inner">
                    <img
                      src={slideImage}
                      alt="Slide cover preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => { setSlideImage(""); toast.info("Đã xóa ảnh slide 🗑️"); }}
                        className="p-3 bg-rose-600 text-white hover:bg-rose-500 rounded-full transition shadow-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => slideImageInputRef.current?.click()}
                    className="w-full h-36 rounded-xl border border-dashed border-white/15 hover:border-amber-500/40 bg-[#0b0f19]/40 hover:bg-[#0e1322]/60 transition duration-300 flex flex-col items-center justify-center gap-2 cursor-pointer group"
                  >
                    <Plus className="w-4 h-4 text-slate-400 group-hover:text-amber-400 group-hover:scale-110 transition" />
                    <p className="text-[11px] font-bold text-slate-300 group-hover:text-amber-400">Tải ảnh slide mới</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={slideImage}
                    onChange={(e) => setSlideImage(e.target.value)}
                    placeholder="Dán link ảnh hoặc tải ảnh lên..."
                    className={`flex-1 bg-[#111625] px-4 py-2.5 border rounded-xl text-xs text-slate-200 outline-none transition truncate ${
                      slideFormErrors.image ? "border-rose-500 bg-rose-500/5" : "border-white/10 focus:border-amber-500"
                    }`}
                  />
                  <input
                    type="file"
                    ref={slideImageInputRef}
                    onChange={handleSlideImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => slideImageInputRef.current?.click()}
                    className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/20 hover:border-amber-500 text-amber-400 hover:text-black rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
                  >
                    Chọn Tệp
                  </button>
                </div>
                {slideFormErrors.image && (
                  <p className="text-xs text-rose-400 font-medium">{slideFormErrors.image}</p>
                )}
              </div>

            </form>

            {/* Drawer Footer Actions */}
            <div className="px-8 py-5 border-t border-white/5 bg-[#0e121d] flex items-center gap-3">
              <button
                onClick={handleSaveSlide}
                disabled={slideIsSubmitting}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-extrabold uppercase tracking-widest hover:brightness-105 active:scale-[0.98] transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/5"
              >
                {slideIsSubmitting ? (
                  <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                ) : (
                  "Lưu Slide Banner"
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsSlideDrawerOpen(false)}
                className="flex-1 border border-white/10 text-slate-300 hover:bg-white/5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition active:scale-[0.98] cursor-pointer"
              >
                Hủy Bỏ
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Lightbox Modal for Large Preview (UC23) */}
      {isLightboxOpen && img && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fadeIn p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-[#07090e] relative flex items-center justify-center p-2">
            <img
              src={img}
              alt="Full size preview"
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80";
              }}
            />
          </div>
        </div>
      )}

      {/* Luxury Footer copyright */}
      <footer className="border-t border-white/5 py-6 bg-[#04060b] text-center text-xs text-slate-600">
        &copy; {new Date().getFullYear()} Luna Jewel Obsidian & Gold Suite. All rights reserved.
      </footer>
    </div>
  );
}
