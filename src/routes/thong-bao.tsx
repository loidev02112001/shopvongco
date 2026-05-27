import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { TopBar, NavBar, Footer } from "@/components/SiteChrome";

export const Route = createFileRoute("/thong-bao")({
  head: () => ({
    meta: [
      { title: "Thông báo — Luna Jewel" },
      { name: "description", content: "Cập nhật mới nhất từ Luna Jewel." },
    ],
  }),
  component: NotificationsPage,
});

const seed = [
  {
    id: "1",
    title: "Ưu đãi 20% cho bộ sưu tập Bốn Mùa",
    body: "Áp dụng từ 22/05 đến 30/05. Nhanh tay đặt hàng để nhận ưu đãi giới hạn.",
    time: "2 giờ trước",
  },
  {
    id: "2",
    title: "Đơn hàng #LJ-10293 đã được giao",
    body: "Cảm ơn bạn đã tin tưởng Luna Jewel. Đừng quên đánh giá sản phẩm nhé!",
    time: "Hôm qua",
  },
  {
    id: "3",
    title: "Ra mắt dịch vụ thử vòng cổ bằng AI",
    body: "Trải nghiệm thử trang sức ảo ngay trên trình duyệt của bạn.",
    time: "3 ngày trước",
  },
];

function NotificationsPage() {
  const [read, setRead] = useState<Record<string, boolean>>({});

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <NavBar />
      <section className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl text-brand font-semibold tracking-wide flex items-center gap-3">
            <Bell className="w-6 h-6" /> THÔNG BÁO
          </h1>
          <button
            onClick={() =>
              setRead(Object.fromEntries(seed.map((n) => [n.id, true])))
            }
            className="text-xs text-brand hover:underline"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {seed.map((n) => (
            <button
              key={n.id}
              onClick={() => setRead((r) => ({ ...r, [n.id]: true }))}
              className={`w-full text-left bg-white rounded-md p-4 border transition flex gap-3 ${read[n.id] ? "border-border opacity-70" : "border-brand/40"}`}
            >
              <div
                className={`mt-0.5 w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${read[n.id] ? "bg-muted text-muted-foreground" : "bg-gray-100 text-brand"}`}
              >
                {read[n.id] ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-brand">
                  {n.title}
                </div>
                <div className="text-xs text-brand/70 mt-1">{n.body}</div>
                <div className="text-[11px] text-brand/50 mt-1">
                  {n.time}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
