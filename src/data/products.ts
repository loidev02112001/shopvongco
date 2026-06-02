import nClover from "@/assets/necklace-clover-new.jpg";
import nSwan from "@/assets/necklace-swan.jpg";
import nBlossom from "@/assets/necklace-blossom.jpg";
import nMoon from "@/assets/necklace-moon.jpg";
import swanBlack from "@/assets/swan-black.jpg";
import swanPave from "@/assets/swan-pave.jpg";
import swanBlue from "@/assets/swan-blue.jpg";
import summerHearts from "@/assets/summer-hearts.jpg";
import summerButterflyPink from "@/assets/summer-butterfly-pink.jpg";
import summerButterflyCrystal from "@/assets/summer-butterfly-crystal.jpg";
import thanhNhaHeart from "@/assets/thanh-nha-heart.jpg";
import thanhNhaFlowerDuo from "@/assets/thanh-nha-flower-duo.jpg";
import thanhNhaCloverOnyx from "@/assets/thanh-nha-clover-onyx.jpg";
import pureSoulHeartButterfly from "@/assets/pure-soul-heart-butterfly.jpg";
import pureSoulPinkHeartHalo from "@/assets/pure-soul-pink-heart-halo.jpg";
import pureSoulRubyHeart from "@/assets/pure-soul-ruby-heart.jpg";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { storeActions } from "@/lib/store";

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

const sharedDescription =
  "1. Thông tin sản phẩm.\nChất liệu: Bạc 925 an toàn cho da, 100% không gỉ và bền.\nSản phẩm được tặng kèm hộp đựng và nước rửa bạc chuyên dụng.\nHướng dẫn bảo quản: tránh tiếp xúc hóa chất, chất tẩy rửa mạnh.\nLưu ý khi sử dụng: Tránh va đập, sử dụng nhẹ nhàng tránh vướng mắc vào quần áo.\n\n2. Hướng dẫn sử dụng sản phẩm.\nHãy tháo trang sức lúc chơi thể thao, tắm biển, bơi,... để tránh bạc xước và xỉn màu.\nLưu ý khi sử dụng mỹ phẩm thì các chất hóa học có thể làm phai màu bạc.\n\n3. Luna Jewel cam kết.\nSản phẩm 100% giống mô tả.\nĐảm bảo chất lượng và chất liệu bạc 100%.\nSản phẩm được kiểm tra cẩn thận, kỹ càng trước khi giao cho Quý khách.\nGiao hàng toàn quốc, thanh toán khi nhận hàng.";

export const defaultProducts: Product[] = [
  {
    slug: "co-bon-la-luminous-clover",
    img: nClover,
    name: "Dây chuyền Bạc 925 Bướm Nhỏ Tiny Butterfly - VCB11605",
    shortName: "DÂY CHUYỀN BẠC 925 BƯỚM NHỎ TINY BUTTERFLY - VCB11605",
    price: "500.000VNĐ",
    description: sharedDescription,
    specs: {
      "Kiểu dáng": "Cỏ bốn lá thanh lịch",
      "Chất liệu": "Bạc Ý 925 cao cấp",
      "Màu sắc": "Bạc / Đen huyền",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 1.2cm",
      "Cách bảo quản & chăm sóc": "Tránh hóa chất, lau khô sau khi dùng.",
    },
    info: "THÔNG TIN DÂY CHUYỀN BẠC 925 CỎ BỐN LÁ LUMINOUS CLOVER",
    collectionId: "huong-sac-mua-he",
  },
  {
    slug: "thien-nga-graceful-swan",
    img: nSwan,
    name: "Dây chuyền Bạc 925 Blush Pink Swan - TNTKH1605",
    shortName: "DÂY CHUYỀN BẠC 925 BLUSH PINK SWAN - TNTKH1605",
    price: "500.000VNĐ",
    description: sharedDescription,
    specs: {
      "Kiểu dáng": "Thiên nga duyên dáng",
      "Chất liệu": "Bạc Ý 925, mạ vàng hồng",
      "Màu sắc": "Bạc / Vàng hồng",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 1.5cm",
      "Cách bảo quản & chăm sóc": "Tránh nước hoa, hóa chất; bảo quản trong hộp.",
    },
    info: "THÔNG TIN DÂY CHUYỀN BẠC 925 HÌNH THIÊN NGA ĐÍNH ĐÁ LẤP LÁNH PRETTY SWAN",
    collectionId: "graceful-muse",
  },
  {
    slug: "hoa-dao-spring-blossom",
    img: nBlossom,
    name: "Dây chuyền Bạc 925 Cỏ 4 Cánh Pearl Clover - C4LĐT1605",
    shortName: "DÂY CHUYỀN BẠC 925 CỎ 4 CÁNH PEARL CLOVER - C4LĐT1605",
    price: "500.000VNĐ",
    description: sharedDescription,
    specs: {
      "Kiểu dáng": "Hoa đào nở rộ",
      "Chất liệu": "Bạc 925",
      "Màu sắc": "Bạc / Hồng pastel",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 1.3cm",
      "Cách bảo quản & chăm sóc": "Tránh va đập, lau bằng khăn mềm.",
    },
    info: "THÔNG TIN DÂY CHUYỀN BẠC 925 HOA ĐÀO SPRING BLOSSOM",
    collectionId: "thanh-nha-ngan-hoa",
  },
  {
    slug: "mat-trang-midnight-romance",
    img: nMoon,
    name: "Dây chuyền Bạc 925 Trái Tim Basic Love - KTT1605",
    shortName: "DÂY CHUYỀN BẠC 925 TRÁI TIM BASIC LOVE - KTT1605",
    price: "500.000VNĐ",
    description: sharedDescription,
    specs: {
      "Kiểu dáng": "Mặt trăng & sao",
      "Chất liệu": "Bạc 925",
      "Màu sắc": "Bạc sáng",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 1.4cm",
      "Cách bảo quản & chăm sóc": "Tránh ẩm ướt, cất trong hộp kín.",
    },
    info: "THÔNG TIN DÂY CHUYỀN BẠC 925 MẶT TRĂNG MIDNIGHT ROMANCE",
    collectionId: "pure-soul",
  },
  {
    slug: "thien-nga-onyx-elegance",
    img: swanBlack,
    name: "Dây chuyền Bạc 925 Crystal Swan - TNTKT1605",
    shortName: "DÂY CHUYỀN BẠC 925 CRYSTAL SWAN - TNTKT1605",
    price: "500.000VNĐ",
    description: sharedDescription,
    specs: {
      "Kiểu dáng": "Thiên nga đính đá đen huyền",
      "Chất liệu": "Bạc Ý 925 cao cấp",
      "Màu sắc": "Bạc / Đen",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 1.5cm",
      "Cách bảo quản & chăm sóc": "Tránh hóa chất, lau khô sau khi dùng.",
    },
    info: "THÔNG TIN DÂY CHUYỀN BẠC 925 THIÊN NGA ONYX ELEGANCE",
    collectionId: "graceful-muse",
  },
  {
    slug: "thien-nga-crystal-shine",
    img: swanPave,
    name: "Dây chuyền Bạc 925 Majestic Swan - TNĐ1605",
    shortName: "DÂY CHUYỀN BẠC 925 MAJESTIC SWAN - TNĐ1605",
    price: "500.000VNĐ",
    description: sharedDescription,
    specs: {
      "Kiểu dáng": "Thiên nga phủ đá lấp lánh",
      "Chất liệu": "Bạc Ý 925 cao cấp",
      "Màu sắc": "Bạc",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 1.4cm",
      "Cách bảo quản & chăm sóc": "Tránh hóa chất, lau khô sau khi dùng.",
    },
    info: "THÔNG TIN DÂY CHUYỀN BẠC 925 THIÊN NGA CRYSTAL SHINE",
    collectionId: "graceful-muse",
  },
  {
    slug: "thien-nga-sapphire-grace",
    img: swanBlue,
    name: "Dây chuyền Bạc 925 Ocean Swan - TNTKX1605",
    shortName: "DÂY CHUYỀN BẠC 925 OCEAN SWAN - TNTKX1605",
    price: "500.000VNĐ",
    description: sharedDescription,
    specs: {
      "Kiểu dáng": "Thiên nga đính đá xanh sapphire",
      "Chất liệu": "Bạc Ý 925 cao cấp",
      "Màu sắc": "Bạc / Xanh",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 1.6cm",
      "Cách bảo quản & chăm sóc": "Tránh hóa chất, lau khô sau khi dùng.",
    },
    info: "THÔNG TIN DÂY CHUYỀN BẠC 925 THIÊN NGA SAPPHIRE GRACE",
    collectionId: "graceful-muse",
  },
  {
    slug: "twin-hearts-knot",
    img: summerHearts,
    name: "Dây chuyền Bạc 925 Nơ Đá Sweet Ribbon - N3TTĐ1605",
    shortName: "DÂY CHUYỀN BẠC 925 NƠ ĐÁ SWEET RIBBON - N3TTĐ1605",
    price: "500.000VNĐ",
    description: sharedDescription,
    specs: {
      "Kiểu dáng": "Đôi tim đính đá & nút thắt vô cực",
      "Chất liệu": "Bạc Ý 925 cao cấp",
      "Màu sắc": "Bạc",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 2.2cm",
      "Cách bảo quản & chăm sóc": "Tránh hóa chất, lau khô sau khi dùng.",
    },
    info: "THÔNG TIN DÂY CHUYỀN BẠC 925 TWIN HEARTS KNOT",
    collectionId: "huong-sac-mua-he",
  },
  {
    slug: "buom-mystic-butterfly",
    img: summerButterflyPink,
    name: "Dây chuyền Bạc 925 Bướm Aurora Rainbow Glow - BPLT1605",
    shortName: "DÂY CHUYỀN BẠC 925 BƯỚM AURORA RAINBOW GLOW - BPLT1605",
    price: "500.000VNĐ",
    description: sharedDescription,
    specs: {
      "Kiểu dáng": "Bướm đá pha lê ánh tím hồng",
      "Chất liệu": "Bạc Ý 925 cao cấp",
      "Màu sắc": "Bạc / Tím hồng",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 1.6cm",
      "Cách bảo quản & chăm sóc": "Tránh hóa chất, lau khô sau khi dùng.",
    },
    info: "THÔNG TIN DÂY CHUYỀN BẠC 925 BƯỚM MYSTIC BUTTERFLY",
    collectionId: "huong-sac-mua-he",
  },
  {
    slug: "buom-crystal-wings",
    img: summerButterflyCrystal,
    name: "Dây chuyền Bạc 925 Bướm Đá Crystal Butterfly - NB1605",
    shortName: "DÂY CHUYỀN BẠC 925 BƯỚM ĐÁ CRYSTAL BUTTERFLY - NB1605",
    price: "500.000VNĐ",
    description: sharedDescription,
    specs: {
      "Kiểu dáng": "Bướm phủ đá lấp lánh",
      "Chất liệu": "Bạc Ý 925 cao cấp",
      "Màu sắc": "Bạc",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 1.8cm",
      "Cách bảo quản & chăm sóc": "Tránh hóa chất, lau khô sau khi dùng.",
    },
    info: "THÔNG TIN DÂY CHUYỀN BẠC 925 BƯỚM CRYSTAL WINGS",
    collectionId: "huong-sac-mua-he",
  },
  {
    slug: "trai-tim-pure-heart",
    img: thanhNhaHeart,
    name: "Dây chuyền Bạc 925 Cỏ 4 Cánh Crystal Clover - C4LKĐMT1605",
    shortName: "DÂY CHUYỀN BẠC 925 CỎ 4 CÁNH CRYSTAL CLOVER - C4LKĐMT1605",
    price: "500.000VNĐ",
    description: sharedDescription,
    specs: {
      "Kiểu dáng": "Trái tim rỗng đính đá",
      "Chất liệu": "Bạc Ý 925 cao cấp",
      "Màu sắc": "Bạc",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 1.2cm",
      "Cách bảo quản & chăm sóc": "Tránh hóa chất, lau khô sau khi dùng.",
    },
    info: "THÔNG TIN DÂY CHUYỀN BẠC 925 TRÁI TIM PURE HEART",
    collectionId: "thanh-nha-ngan-hoa",
  },
  {
    slug: "ngan-hoa-baguette-bloom",
    img: thanhNhaFlowerDuo,
    name: "Dây chuyền Bạc 925 Cỏ 4 Cánh Dancing Stone - C4LĐVV1605",
    shortName: "DÂY CHUYỀN BẠC 925 CỎ 4 CÁNH DANCING STONE - C4LĐVV1605",
    price: "550.000VNĐ",
    description: sharedDescription,
    specs: {
      "Kiểu dáng": "Hoa bốn cánh đá baguette & nơ đính đá",
      "Chất liệu": "Bạc Ý 925 cao cấp",
      "Màu sắc": "Bạc",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 1.6cm",
      "Cách bảo quản & chăm sóc": "Tránh hóa chất, lau khô sau khi dùng.",
    },
    info: "THÔNG TIN DÂY CHUYỀN BẠC 925 NGÂN HOA BAGUETTE BLOOM",
    collectionId: "thanh-nha-ngan-hoa",
  },
  {
    slug: "co-bon-la-onyx-charm",
    img: thanhNhaCloverOnyx,
    name: "Dây chuyền Bạc 925 Cỏ 4 Cánh Black Clover - C4LĐĐ1605",
    shortName: "DÂY CHUYỀN BẠC 925 CỎ 4 CÁNH BLACK CLOVER - C4LĐĐ1605",
    price: "520.000VNĐ",
    description: sharedDescription,
    specs: {
      "Kiểu dáng": "Cỏ bốn lá nền onyx viền đá",
      "Chất liệu": "Bạc Ý 925 cao cấp",
      "Màu sắc": "Bạc / Đen huyền",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 1.2cm",
      "Cách bảo quản & chăm sóc": "Tránh hóa chất, lau khô sau khi dùng.",
    },
    info: "THÔNG TIN DÂY CHUYỀN BẠC 925 CỎ BỐN LÁ ONYX CHARM",
    collectionId: "thanh-nha-ngan-hoa",
  },
  {
    slug: "pure-soul-heart-butterfly-aqua",
    img: pureSoulHeartButterfly,
    name: "Dây chuyền Bạc 925 Trái Tim Opal Ocean Heart - TTHĐX1605",
    shortName: "DÂY CHUYỀN BẠC 925 TRÁI TIM OPAL OCEAN HEART - TTHĐX1605",
    price: "520.000VNĐ",
    description: sharedDescription,
    specs: {
      "Kiểu dáng": "Trái tim đính bướm & hoa, đá xanh aqua",
      "Chất liệu": "Bạc Ý 925 cao cấp",
      "Màu sắc": "Bạc / Xanh aqua",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 1.5cm",
      "Cách bảo quản & chăm sóc": "Tránh hóa chất, lau khô sau khi dùng.",
    },
    info: "THÔNG TIN DÂY CHUYỀN BẠC 925 TRÁI TIM BƯỚM AQUA BLOOM",
    collectionId: "pure-soul",
  },
  {
    slug: "pure-soul-pink-heart-halo",
    img: pureSoulPinkHeartHalo,
    name: "Dây chuyền Bạc 925 Trái Tim Rose Quartz - TTĐNH1605",
    shortName: "DÂY CHUYỀN BẠC 925 TRÁI TIM ROSE QUARTZ - TTĐNH1605",
    price: "540.000VNĐ",
    description: sharedDescription,
    specs: {
      "Kiểu dáng": "Trái tim đôi đính đá hồng dancing",
      "Chất liệu": "Bạc Ý 925 cao cấp",
      "Màu sắc": "Bạc / Hồng pastel",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 1.4cm",
      "Cách bảo quản & chăm sóc": "Tránh va đập, lau bằng khăn mềm.",
    },
    info: "THÔNG TIN TRANG SỨC BẠC 925 TRÁI TIM PURE SOUL PINK HEART HALO - TNTKH1605",
    collectionId: "pure-soul",
  },
  {
    slug: "trai-tim-ruby-heart-pure-soul",
    img: pureSoulRubyHeart,
    name: "Dây chuyền Bạc 925 Ruby Heart Pure Soul - TNTKH1605",
    shortName: "DÂY CHUYỀN BẠC 925 RUBY HEART PURE SOUL - TNTKH1605",
    price: "500.000VNĐ",
    description: sharedDescription,
    specs: {
      "Kiểu dáng": "Trái tim Ruby quyến rũ",
      "Chất liệu": "Bạc Ý 925 đính đá Ruby tổng hợp",
      "Màu sắc": "Bạc / Đỏ Ruby",
      "Độ dài dây": "40cm + 5cm",
      "Kích thước": "Mặt dây 1.4cm",
      "Cách bảo quản & chăm sóc": "Hạn chế tiếp xúc nước nóng và chất tẩy rửa.",
    },
    info: "THÔNG TIN TRANG SỨC BẠC 925 TRÁI TIM RUBY HEART PURE SOUL - TNTKH1605",
    collectionId: "pure-soul",
  },
];

export let products: Product[] = isSupabaseConfigured() ? [] : [...defaultProducts];

const PRODUCT_LIST_COLUMNS =
  "slug,img,name,short_name,price,description,specs,info,collection_id,created_at";

/**
 * Tự động fetch danh sách sản phẩm từ bảng products của Supabase.
 * Nếu bảng rỗng, tự động Seed đẩy toàn bộ 12 sản phẩm lên Supabase.
 */
export async function syncProductsWithCloud(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    console.log("Supabase is not configured, running in local fallback mode for products.");
    setTimeout(() => {
      storeActions.setProductsLoaded(true);
    }, 100);
    return products;
  }

  try {
    const { data: cloudProducts, error: fetchErr } = await supabase
      .from("products")
      .select(PRODUCT_LIST_COLUMNS)
      .order("created_at", { ascending: false });

    if (fetchErr) throw fetchErr;

    if (cloudProducts && cloudProducts.length > 0) {
      console.log(`Successfully fetched ${cloudProducts.length} products from Supabase online!`);
      const mapped: Product[] = cloudProducts.map((p: any) => {
        let specsObj = p.specs;
        if (typeof specsObj === "string") {
          try {
            specsObj = JSON.parse(specsObj);
          } catch (e) {
            console.error("Failed to parse specs JSON string:", e);
          }
        }
        return {
          slug: p.slug,
          img: p.img,
          name: p.name,
          shortName: p.short_name,
          price: p.price !== null && p.price !== undefined ? String(p.price) : "",
          description: p.description,
          specs: specsObj,
          info: p.info,
          collectionId: p.collection_id || undefined,
          images: Array.isArray(p.images) ? p.images : [],
        };
      });

      // Mutate in-place để tất cả các file import giữ nguyên tham chiếu mảng
      products.length = 0;
      products.push(...mapped);

      // Kích hoạt re-render UI trên React an toàn ngoài chu kỳ render chính
      setTimeout(() => {
        storeActions.setProductsLoaded(true);
      }, 0);
      return products;
    } else {
      console.log("Supabase products table is empty. Keeping products empty.");
      products.length = 0;
      setTimeout(() => {
        storeActions.setProductsLoaded(true);
      }, 0);
      return products;
    }
  } catch (err: any) {
    console.error("Error in syncProductsWithCloud:", err);
    setTimeout(() => {
      storeActions.setProductsLoaded(true);
    }, 0);
  }
  return products;
}

// Tự động kích hoạt đồng bộ khi khởi động trên môi trường trình duyệt an toàn ngoài chu kỳ render
if (typeof window !== "undefined") {
  setTimeout(() => {
    syncProductsWithCloud();
  }, 100);
}

export const getProduct = (slug: string) => products.find((p) => p?.slug?.toLowerCase() === slug?.toLowerCase());
