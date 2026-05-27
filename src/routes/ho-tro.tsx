import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HelpCircle, Phone, Mail, MessageCircle, ChevronDown } from "lucide-react";
import { TopBar, NavBar, Footer } from "@/components/SiteChrome";

export const Route = createFileRoute("/ho-tro")({
  head: () => ({
    meta: [
      { title: "Hỗ trợ — Luna Jewel" },
      { name: "description", content: "Trung tâm hỗ trợ khách hàng Luna Jewel." },
    ],
  }),
  component: SupportPage,
});

const faqs = [
  {
    q: "Làm sao để đặt hàng?",
    a: "Bạn chọn sản phẩm, bấm Thêm vào giỏ, sau đó vào Giỏ Hàng và bấm Đặt Hàng để hoàn tất.",
  },
  {
    q: "Chính sách đổi trả như thế nào?",
    a: "Luna Jewel hỗ trợ đổi trả trong vòng 7 ngày kể từ khi nhận hàng đối với sản phẩm còn nguyên tem mác.",
  },
  {
    q: "Thời gian giao hàng?",
    a: "Nội thành Hà Nội & TP.HCM: 1-2 ngày. Các tỉnh khác: 3-5 ngày làm việc.",
  },
  {
    q: "Tôi có thể thử trang sức trước khi mua không?",
    a: "Có. Bạn có thể dùng tính năng Thử Vòng AI để xem trang sức trên webcam của mình.",
  },
];

function SupportPage() {
  const [open, setOpen] = useState<number | null>(0);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <NavBar />
      <section className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl text-brand font-semibold tracking-wide flex items-center gap-3">
          <HelpCircle className="w-6 h-6" /> TRUNG TÂM HỖ TRỢ
        </h1>

        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {[
            { href: "tel:0901234567", Icon: Phone, label: "Hotline", value: "0901 234 567" },
            { href: "mailto:contact@lunajewel.vn", Icon: Mail, label: "Email", value: "contact@lunajewel.vn" },
            { href: "https://m.me/lunajewel", Icon: MessageCircle, label: "Chat", value: "Messenger", external: true },
          ].map(({ href, Icon, label, value, external }) => (
            <a
              key={label}
              href={href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group relative bg-white rounded-md p-4 flex items-center gap-3 border border-transparent transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[0_10px_30px_-10px_color-mix(in_oklab,var(--brand)_45%,transparent)] hover:bg-brand-soft/40"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-brand-foreground group-hover:scale-110">
                <Icon className="w-5 h-5" />
              </span>
              <div>
                <div className="text-xs text-muted-foreground group-hover:text-brand transition-colors">{label}</div>
                <div className="text-sm font-semibold group-hover:text-brand transition-colors">{value}</div>
              </div>
            </a>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-10">
          <div>
            <h2 className="font-semibold text-brand mb-4">Câu hỏi thường gặp</h2>
            <div className="space-y-2">
              {faqs.map((f, i) => (
                <div key={i} className="bg-white rounded-md border border-border">
                  <button
                    onClick={() => setOpen(open === i ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-brand"
                  >
                    {f.q}
                    <ChevronDown
                      className={`w-4 h-4 transition ${open === i ? "rotate-180" : ""}`}
                    />
                  </button>
                  {open === i && (
                    <div className="px-4 pb-3 text-sm text-brand/70">{f.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-brand mb-4">Gửi yêu cầu hỗ trợ</h2>
            {sent ? (
              <div className="bg-white rounded-md p-6 text-sm text-brand">
                Cảm ơn bạn! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSent(true);
                }}
                className="bg-white rounded-md p-4 space-y-3"
              >
                <input
                  required
                  placeholder="Họ và tên"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <textarea
                  required
                  rows={4}
                  placeholder="Nội dung cần hỗ trợ..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="w-full border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-brand"
                />
                <button
                  type="submit"
                  className="w-full bg-brand text-brand-foreground rounded-md py-2 text-sm font-semibold hover:opacity-90"
                >
                  Gửi yêu cầu
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
