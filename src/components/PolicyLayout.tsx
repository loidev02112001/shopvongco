import { Link } from "@tanstack/react-router";
import { TopBar, NavBar, Footer } from "@/components/SiteChrome";
import type { ReactNode } from "react";

const LINKS = [
  { to: "/chinh-sach-bao-hanh", label: "Chính sách bảo hành" },
  { to: "/chinh-sach-van-chuyen", label: "Chính sách vận chuyển" },
  { to: "/chinh-sach-doi-tra", label: "Chính sách đổi trả" },
  { to: "/chinh-sach-bao-mat", label: "Chính sách bảo mật" },
] as const;

export function PolicyLayout({
  active,
  title,
  children,
}: {
  active: (typeof LINKS)[number]["to"];
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <NavBar />
      <main className="max-w-6xl w-full mx-auto px-6 py-16 flex-1 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <h2 className="text-sm font-bold tracking-wider text-brand mb-4">
            DANH MỤC TRANG
          </h2>
          <ul className="space-y-3">
            {LINKS.map((l) => {
              const isActive = l.to === active;
              return (
                <li key={l.to} className="flex items-start gap-2">
                  <span
                    className={`mt-2 inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                      isActive ? "bg-brand" : "bg-foreground/40"
                    }`}
                  />
                  <Link
                    to={l.to}
                    className={`text-sm transition hover:text-brand ${
                      isActive
                        ? "font-semibold text-brand"
                        : "text-foreground/80"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Content */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-8">{title}</h1>
          <div className="prose prose-sm text-foreground/80 space-y-6 max-w-3xl">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
