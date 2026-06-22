import { Gift, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const benefitItems = [
  {
    icon: Truck,
    title: "MIỄN PHÍ vận chuyển",
    sub: "Đơn Hàng từ 950.000 VNĐ",
  },
  {
    icon: RotateCcw,
    title: "Đổi trả MIỄN PHÍ",
    sub: "Trong vòng 30 NGÀY",
  },
  {
    icon: ShieldCheck,
    title: "Dịch vụ BẢO HÀNH",
    sub: "Làm mới TRỌN ĐỜI",
  },
  {
    icon: Gift,
    title: "Túi & hộp TRANG NHÃ",
    sub: "Sẵn sàng TRAO TẶNG",
  },
];

export function BenefitsStrip({ className }: { className?: string }) {
  return (
    <section className={cn("mx-auto mt-6 w-full max-w-7xl px-6", className)}>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {benefitItems.map(({ icon: Icon, title, sub }) => (
          <div
            key={title}
            className="mx-auto flex min-h-[56px] w-full max-w-[240px] cursor-default items-center justify-center gap-3 rounded-full bg-brand px-4 py-2.5 text-brand-foreground shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:brightness-105 hover:shadow-md active:scale-98 md:min-h-[64px] md:max-w-[260px] md:px-5 md:py-3"
          >
            <Icon
              className="h-[36px] w-[36px] shrink-0 sm:h-[42px] sm:w-[42px]"
              strokeWidth={1.25}
            />
            <div className="min-w-0 leading-tight">
              <p className="text-xs font-bold sm:text-sm md:text-[15px]">
                {title}
              </p>
              <p className="mt-0.5 text-[10px] opacity-90 sm:text-xs">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
